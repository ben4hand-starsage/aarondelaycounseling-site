/* ============================================================
   Aaron Delay Counseling — site config + form handling
   ------------------------------------------------------------
   ONE FILE TO EDIT WHEN THE ACCOUNTS ARE LIVE.
   Replace the REPLACE_ME values below and everything wires up.
   ============================================================ */

var SITE = {
  /* Kit (ConvertKit) form action URL.
     Find it: Kit → Grow → Landing Pages & Forms → your form →
     Embed → HTML. Copy the URL inside action="...".
     Looks like: https://app.kit.com/forms/1234567/subscriptions   */
  KIT_FORM_ACTION: "REPLACE_ME_KIT_FORM_ACTION",

  /* Gumroad product URL for the $19 playbook.
     Looks like: https://aarondelay.gumroad.com/l/playbook         */
  GUMROAD_PLAYBOOK_URL: "REPLACE_ME_GUMROAD_URL",

  /* Instagram profile URL.
     Looks like: https://www.instagram.com/aarondelaycounseling/    */
  INSTAGRAM_URL: "https://www.instagram.com/aarondelaytherapy/",

  /* Public contact address for speaking enquiries.                */
  CONTACT_EMAIL: "aarondelaycounseling@gmail.com",

  /* Where to send people after a successful opt-in.
     Leave as-is to use the built-in /thanks/ page.                */
  THANKS_URL: "/thanks/"
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
  document.querySelectorAll("form[data-optin]").forEach(function (form) {
    var note = form.querySelector(".form-note");

    if (unset(SITE.KIT_FORM_ACTION)) {
      form.setAttribute("action", "#");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (note) {
          note.textContent =
            "This form isn't connected to Kit yet. Add the Kit form action URL in assets/js/site.js (KIT_FORM_ACTION) and it will start delivering the PDF automatically.";
          note.classList.add("show");
        }
      });
      return;
    }

    form.setAttribute("action", SITE.KIT_FORM_ACTION);
    form.setAttribute("method", "post");

    /* Kit redirects to the thank-you page configured inside Kit.
       This hidden field is a belt-and-braces fallback. */
    if (!form.querySelector('input[name="redirect_url"]')) {
      var r = document.createElement("input");
      r.type = "hidden";
      r.name = "redirect_url";
      r.value = window.location.origin + SITE.THANKS_URL;
      form.appendChild(r);
    }

    form.addEventListener("submit", function () {
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    });
  });

  /* ---------- Current year in footers ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
