/* Four Peaks Pastoral — Ground Truth (mockup-1) */

(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function syncHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    document.body.style.overflow = "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("nav-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
      }
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const records = document.querySelectorAll(".record--draw");
  if (reduceMotion) {
    records.forEach((el) => el.classList.add("is-drawn"));
  } else if (records.length && "IntersectionObserver" in window) {
    const rio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            rio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    records.forEach((el) => rio.observe(el));
  } else {
    records.forEach((el) => el.classList.add("is-drawn"));
  }

  const form = document.querySelector("[data-enquiry-form]");
  if (form) {
    const status = form.querySelector(".form__status");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.dataset.state = "error";
          status.textContent = "Please complete the required fields.";
        }
        return;
      }
      const phone = (form.querySelector("#phone")?.value || "").trim();
      const email = (form.querySelector("#email")?.value || "").trim();
      if (!phone && !email) {
        if (status) {
          status.dataset.state = "error";
          status.textContent = "Please provide a phone number or email address.";
        }
        (form.querySelector("#phone") || form.querySelector("#email"))?.focus();
        return;
      }
      if (status) {
        status.dataset.state = "success";
        status.textContent =
          "Thank you. A member of the Four Peaks Pastoral team will be in contact shortly.";
      }
      form.reset();
    });
  }
})();
