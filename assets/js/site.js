/* ============================================================
   Aaron Delay Counseling — site config + form handling
   ------------------------------------------------------------
   ONE FILE TO EDIT WHEN THE ACCOUNTS ARE LIVE.
   Replace the REPLACE_ME values below and everything wires up.
   ============================================================ */

var SITE = {
  /* MailerLite embedded-form endpoint.
     Forms > Embedded forms > the form > HTML code, inside action="".
     Account 2591010, form "Reset opt-in (site-wide)".                */
  FORM_ACTION: "https://assets.mailerlite.com/jsonp/2591010/forms/196633341769811899/subscribe",

  /* Gumroad product URL for the $19 playbook.
     Looks like: https://aarondelay.gumroad.com/l/playbook         */
  GUMROAD_PLAYBOOK_URL: "https://aarontherapy.gumroad.com/l/wrong-person",

  /* Instagram profile URL.
     Looks like: https://www.instagram.com/aarondelaycounseling/    */
  INSTAGRAM_URL: "https://www.instagram.com/aarondelaytherapy/",

  /* Public contact address for speaking enquiries.                */
  CONTACT_EMAIL: "aaron@aarondelaycounseling.com",

  /* Where to send people after a successful opt-in.
     Leave as-is to use the built-in /thanks/ page.                */
  THANKS_URL: "/thanks/",

  /* Coaching enquiry form endpoint.
     Formspree: https://formspree.io/f/xxxxxxxx
     Leave as REPLACE_ME and the form falls back to opening the
     visitor's own mail client addressed to CONTACT_EMAIL. That
     fallback needs no account, but it strands anyone without a mail
     client configured, so it is a stopgap rather than a solution.   */
  COACHING_FORM_ACTION: "https://formspree.io/f/xrpzwpnb",

  /* Where we send people after a successful enquiry. The redirect is
     done in this file, not by the form service, so this stays a plain
     site-relative path.                                              */
  COACHING_THANKS_URL: "/coaching-thanks/"
};

(function () {
  "use strict";

  var unset = function (v) { return !v || v.indexOf("REPLACE_ME") === 0; };

  /* ---------- Wire up Gumroad links ---------- */
  document.querySelectorAll("[data-gumroad]").forEach(function (el) {
    if (unset(SITE.GUMROAD_PLAYBOOK_URL)) {
      el.setAttribute("href", "#");
      el.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Checkout isn't connected yet.\n\nAdd the Gumroad product URL in assets/js/site.js (GUMROAD_PLAYBOOK_URL).");
      });
    } else {
      el.setAttribute("href", SITE.GUMROAD_PLAYBOOK_URL);
    }
  });

  /* ---------- Wire up Instagram links ---------- */
  document.querySelectorAll("[data-instagram]").forEach(function (el) {
    if (unset(SITE.INSTAGRAM_URL)) {
      el.setAttribute("href", "#");
      el.addEventListener("click", function (e) {
        e.preventDefault();
        alert("Instagram isn't connected yet.\n\nAdd Aaron's profile URL in assets/js/site.js (INSTAGRAM_URL).");
      });
    } else {
      el.setAttribute("href", SITE.INSTAGRAM_URL);
    }
  });

  /* ---------- Wire up contact / speaking mailto links ---------- */
  document.querySelectorAll("[data-mailto]").forEach(function (el) {
    if (unset(SITE.CONTACT_EMAIL)) {
      el.setAttribute("href", "#");
      el.addEventListener("click", function (e) {
        e.preventDefault();
        alert("No contact address set yet.\n\nAdd it in assets/js/site.js (CONTACT_EMAIL).");
      });
    } else {
      var subject = el.getAttribute("data-mailto") || "Enquiry";
      el.setAttribute("href", "mailto:" + SITE.CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject));
    }
  });

  /* ---------- Opt-in forms ---------- */
  /* MailerLite's endpoint is JSONP: a normal form POST would navigate the
     visitor to a page of raw JSON. So we send it with fetch in no-cors mode
     and move them to /thanks/ ourselves. We cannot read a no-cors response,
     so HTML5 validation is what catches bad input before it is sent. */
  document.querySelectorAll("form[data-optin]").forEach(function (form) {
    var note = form.querySelector(".form-note");

    if (unset(SITE.FORM_ACTION)) {
      form.setAttribute("action", "#");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (note) {
          note.textContent =
            "This form isn't connected yet. Add the MailerLite form action URL in assets/js/site.js (FORM_ACTION).";
          note.classList.add("show");
        }
      });
      return;
    }

    form.setAttribute("action", SITE.FORM_ACTION);
    form.setAttribute("method", "post");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      var done = false;
      var go = function () {
        if (done) { return; }
        done = true;
        window.location.href = SITE.THANKS_URL;
      };

      /* URLSearchParams, not FormData: FormData sends multipart/form-data
         and MailerLite's endpoint only accepts url-encoded bodies. It
         silently accepts the request and creates no subscriber otherwise. */
      fetch(SITE.FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(go).catch(go);

      /* Never strand someone on a disabled button if the network hangs. */
      setTimeout(go, 3500);
    });
  });

  /* ---------- Coaching enquiry form ---------- */
  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    var note = form.querySelector(".form-note");

    var say = function (msg) {
      if (note) { note.textContent = msg; note.classList.add("show"); }
    };

    /* A real endpoint is configured.

       We submit with fetch rather than letting the browser navigate, and do
       the redirect ourselves. Formspree ignores the "_next" hidden field, so
       a native POST strands the visitor on formspree.io looking at someone
       else's branding. Asking for JSON back also means a failure can be shown
       in place, on our own page, instead of on their error screen.

       The action and method are still set, so if this script fails to load
       the browser falls back to a native POST. That lands on Formspree's own
       confirmation page, which is worse but is not a dead end. */
    if (!unset(SITE.COACHING_FORM_ACTION)) {
      form.setAttribute("action", SITE.COACHING_FORM_ACTION);
      form.setAttribute("method", "post");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var btn = form.querySelector("button[type=submit]");
        var label = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "Sending\u2026"; }

        var restore = function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        };

        fetch(SITE.COACHING_FORM_ACTION, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
        }).then(function (res) {
          if (res.ok) {
            window.location.href = SITE.COACHING_THANKS_URL;
            return;
          }
          /* Formspree returns the reason in JSON. Surface it rather than a
             generic failure, so a bad email address reads as a bad email
             address. */
          return res.json().then(function (data) {
            var msg = data && data.errors && data.errors.length
              ? data.errors.map(function (x) { return x.message; }).join(" ")
              : "Something went wrong sending that.";
            say(msg + " You can also email " + SITE.CONTACT_EMAIL + " directly.");
            restore();
          }).catch(function () {
            say("Something went wrong sending that. You can also email " + SITE.CONTACT_EMAIL + " directly.");
            restore();
          });
        }).catch(function () {
          say("That didn't send, which usually means the connection dropped. Try again, or email " + SITE.CONTACT_EMAIL + " directly.");
          restore();
        });
      });
      return;
    }

    /* No endpoint yet. Hand the message to the visitor's own mail client
       so nothing is stored by a third party and no account is needed. */
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (unset(SITE.CONTACT_EMAIL)) {
        say("This form isn't connected yet. Add CONTACT_EMAIL in assets/js/site.js, or a form endpoint in COACHING_FORM_ACTION.");
        return;
      }

      var get = function (n) {
        var el = form.querySelector('[name="' + n + '"]');
        return el ? el.value.trim() : "";
      };

      var name = get("name"), email = get("email"),
          where = get("location"), message = get("message");

      if (!name || !email || !message) {
        say("Please fill in your name, your email, and a little about why you're reaching out.");
        return;
      }

      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Where: " + (where || "not given") + "\n\n" +
        message + "\n";

      window.location.href =
        "mailto:" + SITE.CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("Coaching enquiry from " + name) +
        "&body=" + encodeURIComponent(body);

      say("Your email app should be opening with the message ready. Press send and it comes straight to Aaron. If nothing happened, email " + SITE.CONTACT_EMAIL + " directly.");
    });
  });

  /* ---------- Current year in footers ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
