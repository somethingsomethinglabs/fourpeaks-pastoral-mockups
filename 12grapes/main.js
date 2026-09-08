(() => {
  "use strict";

  const config = window.TWELVE_GRAPES_CONFIG || {};
  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const trackEvent = (name, detail = {}) => {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...detail });
    }
    document.dispatchEvent(new CustomEvent("12grapes:analytics", { detail: { name, ...detail } }));
  };

  const normalisePhoneHref = (value) => {
    if (!value) return "";
    return String(value).replace(/[^+\d]/g, "");
  };

  const applySiteConfig = () => {
    const serviceArea = String(config.serviceArea || "").trim();
    qsa("[data-service-area]").forEach((node) => {
      if (serviceArea) node.textContent = serviceArea;
    });

    const phoneDisplay = String(config.phoneDisplay || "").trim();
    const phoneHref = normalisePhoneHref(config.phoneHref || phoneDisplay);
    const clientEmail = String(config.clientEmail || "").trim();
    const candidateEmail = String(config.candidateEmail || "").trim();

    qsa("[data-phone-link]").forEach((link) => {
      if (phoneDisplay && phoneHref) {
        link.href = `tel:${phoneHref}`;
        const value = qs("[data-contact-value]", link);
        if (value) value.textContent = phoneDisplay;
        link.hidden = false;
      }
    });

    qsa("[data-client-email-link]").forEach((link) => {
      if (clientEmail) {
        link.href = `mailto:${clientEmail}`;
        const value = qs("[data-contact-value]", link);
        if (value) value.textContent = clientEmail;
        link.hidden = false;
      }
    });

    qsa("[data-candidate-email-link]").forEach((link) => {
      if (candidateEmail) {
        link.href = `mailto:${candidateEmail}`;
        const value = qs("[data-contact-value]", link);
        if (value) value.textContent = candidateEmail;
        link.hidden = false;
      }
    });

    qsa("[data-contact-options]").forEach((container) => {
      const visibleLinks = qsa("a[data-contact-link]:not([hidden])", container);
      container.hidden = visibleLinks.length === 0;
    });

    qsa("[data-contact-setup]").forEach((note) => {
      const context = note.dataset.context || "client";
      const email = context === "candidate" ? candidateEmail : clientEmail;
      const endpoint = context === "candidate" ? config.candidateFormEndpoint : config.clientFormEndpoint;
      note.hidden = Boolean((phoneDisplay && phoneHref) || email || endpoint);
    });

    qsa("form[data-form-kind]").forEach((form) => {
      const kind = form.dataset.formKind;
      const endpoint = kind === "candidate" ? config.candidateFormEndpoint : config.clientFormEndpoint;
      if (endpoint) form.dataset.endpoint = endpoint;

      const submitButton = qs('button[type="submit"]', form);
      if (!submitButton) return;
      const email = kind === "candidate" ? candidateEmail : clientEmail;
      if (endpoint) submitButton.textContent = kind === "candidate" ? "Send expression of interest" : "Send job details";
      else if (email) submitButton.textContent = kind === "candidate" ? "Open candidate email" : "Open email with job details";
      else submitButton.textContent = kind === "candidate" ? "Prepare candidate details" : "Prepare job details";
    });
  };

  const initNavigation = () => {
    const toggle = qs("[data-nav-toggle]");
    const nav = qs("[data-site-nav]");
    if (!toggle || !nav) return;

    const setOpen = (open, returnFocus = false) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, true);
      }
    });

    document.addEventListener("click", (event) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1088) setOpen(false);
    });
  };

  const initReveal = () => {
    const items = qsa(".reveal");
    if (!items.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    items.forEach((item) => observer.observe(item));
  };

  const initTrackedLinks = () => {
    qsa("[data-track]").forEach((element) => {
      element.addEventListener("click", () => {
        trackEvent(element.dataset.track, { label: element.dataset.trackLabel || element.textContent.trim() });
      });
    });
  };

  const initServicePrefill = () => {
    qsa("[data-service-prefill]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const form = qs("#job-form");
        const select = form ? qs('[name="service"]', form) : null;
        const value = trigger.dataset.servicePrefill;
        if (select && value) {
          const hasOption = Array.from(select.options).some((option) => option.value === value);
          if (hasOption) select.value = value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        trackEvent("service_to_enquiry_click", { service: value || "unspecified" });
      });
    });
  };

  const setFieldError = (field, message) => {
    const input = qs("input, select, textarea", field);
    const error = qs(".field-error", field);
    if (!input || !error) return;
    error.textContent = message || "";
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  const validateField = (input) => {
    const field = input.closest(".field");
    if (!field || input.disabled || input.type === "hidden") return "";
    const label = (qs("label", field)?.textContent || input.name || "This field").replace(/\s*\(optional\).*/i, "").trim();
    let message = "";

    if (input.validity.valueMissing) message = `${label} is required.`;
    else if (input.validity.typeMismatch && input.type === "email") message = "Enter an email address in the format name@example.com.";
    else if (input.validity.patternMismatch) message = `${label} is not in the expected format.`;
    else if (input.validity.tooShort) message = `${label} must be at least ${input.minLength} characters.`;
    else if (!input.checkValidity()) message = `Check ${label.toLowerCase()}.`;

    setFieldError(field, message);
    return message;
  };

  const validateForm = (form) => {
    const invalid = [];
    qsa("input, select, textarea", form).forEach((input) => {
      if (input.name === "website") return;
      const message = validateField(input);
      if (message) invalid.push({ input, message });
    });

    const summary = qs(".error-summary", form);
    const list = summary ? qs("ul", summary) : null;
    if (summary && list) {
      list.innerHTML = "";
      if (invalid.length) {
        invalid.forEach(({ input, message }) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = `#${input.id}`;
          link.textContent = message;
          link.addEventListener("click", (event) => {
            event.preventDefault();
            input.focus();
          });
          item.appendChild(link);
          list.appendChild(item);
        });
        summary.hidden = false;
        summary.focus();
      } else {
        summary.hidden = true;
      }
    }
    return invalid.length === 0;
  };

  const valueFor = (form, name) => {
    const field = form.elements.namedItem(name);
    if (!field) return "";
    if (field instanceof RadioNodeList) return field.value || "";
    if (field.type === "checkbox") return field.checked ? "Yes" : "No";
    const value = String(field.value || "").trim();
    if (field.tagName === "SELECT") return field.selectedOptions[0]?.textContent.trim() || value;
    return value;
  };

  const buildClientBrief = (form) => [
    "12GRAPES CLIENT JOB BRIEF",
    "",
    `Name: ${valueFor(form, "fullName")}`,
    `Business / vineyard: ${valueFor(form, "business") || "Not provided"}`,
    `Phone: ${valueFor(form, "phone")}`,
    `Email: ${valueFor(form, "email")}`,
    `Vineyard location / postcode: ${valueFor(form, "location")}`,
    `Service needed: ${valueFor(form, "service")}`,
    `Timing / operating window: ${valueFor(form, "timing")}`,
    `Approximate scope: ${valueFor(form, "scope") || "Not provided"}`,
    "",
    "Job details:",
    valueFor(form, "details"),
    "",
    `Prepared: ${new Date().toLocaleString("en-AU")}`
  ].join("\n");

  const buildCandidateBrief = (form) => [
    "12GRAPES CANDIDATE EXPRESSION OF INTEREST",
    "",
    `Name: ${valueFor(form, "fullName")}`,
    `Phone: ${valueFor(form, "phone")}`,
    `Email: ${valueFor(form, "email")}`,
    `Current location: ${valueFor(form, "location")}`,
    `Availability: ${valueFor(form, "availability")}`,
    `Work rights: ${valueFor(form, "workRights")}`,
    `Transport: ${valueFor(form, "transport") || "Not provided"}`,
    `Preferred work: ${valueFor(form, "preferredWork") || "Not provided"}`,
    `Licences / tickets: ${valueFor(form, "licences") || "Not provided"}`,
    "",
    "Relevant experience:",
    valueFor(form, "experience"),
    "",
    `Prepared: ${new Date().toLocaleString("en-AU")}`
  ].join("\n");

  const showStatus = (form, message, state = "info") => {
    const status = qs(".form-status", form);
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
    status.setAttribute("tabindex", "-1");
    status.focus();
  };

  const renderBrief = (form, brief, filename) => {
    const output = qs(".brief-output", form);
    const pre = output ? qs("pre", output) : null;
    if (!output || !pre) return;
    pre.textContent = brief;
    output.hidden = false;
    output.dataset.filename = filename;
    output.scrollIntoView({ block: "nearest" });
  };

  const openMailto = (email, subject, brief) => {
    const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
    if (url.length > 7800) return false;
    window.location.href = url;
    return true;
  };

  const submitToEndpoint = async (form, endpoint) => {
    const formData = new FormData(form);
    const response = await fetch(endpoint, {
      method: form.method || "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
    return response;
  };

  const initForm = (form) => {
    const kind = form.dataset.formKind;
    const isCandidate = kind === "candidate";
    let started = false;

    qsa(".field", form).forEach((field, index) => {
      const input = qs("input, select, textarea", field);
      const error = qs(".field-error", field);
      if (!input || !error || input.name === "website") return;
      if (!error.id) error.id = `${input.id || `${kind}-field-${index + 1}`}-error`;
      const describedBy = new Set((input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      describedBy.add(error.id);
      input.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
    });

    const markStarted = () => {
      if (started) return;
      started = true;
      trackEvent(isCandidate ? "candidate_form_start" : "client_form_start");
    };

    form.addEventListener("input", (event) => {
      markStarted();
      if (event.target.matches("input, select, textarea")) validateField(event.target);
    });
    form.addEventListener("change", (event) => {
      markStarted();
      if (event.target.matches("input, select, textarea")) validateField(event.target);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const honeypot = valueFor(form, "website");
      if (honeypot) return;
      if (!validateForm(form)) {
        trackEvent(isCandidate ? "candidate_form_validation_error" : "client_form_validation_error");
        return;
      }

      const submitButton = qs('button[type="submit"]', form);
      const originalLabel = submitButton?.textContent || "Submit";
      const brief = isCandidate ? buildCandidateBrief(form) : buildClientBrief(form);
      const filename = isCandidate ? "12grapes-candidate-details.txt" : "12grapes-job-brief.txt";
      const endpoint = String(form.dataset.endpoint || "").trim();
      const email = String(isCandidate ? config.candidateEmail || "" : config.clientEmail || "").trim();
      const eventName = isCandidate ? "candidate_eoi_submission" : "client_form_submission";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = endpoint ? "Sending…" : "Preparing…";
      }

      try {
        if (endpoint) {
          await submitToEndpoint(form, endpoint);
          showStatus(form, isCandidate
            ? "Your expression of interest was received. The recruitment contact can now review the details you sent."
            : "Your job details were received. 12Grapes can now review the scope, location and timing before responding.", "success");
          form.reset();
          trackEvent(eventName, { delivery: "endpoint" });
        } else if (email) {
          const subject = isCandidate ? "Candidate expression of interest" : `Job discussion: ${valueFor(form, "service")}`;
          const opened = openMailto(email, subject, brief);
          if (!opened) {
            renderBrief(form, brief, filename);
            showStatus(form, "The prepared email is too long for a mail link. Nothing was sent. Copy or download the details below and attach them to a new email.", "info");
          } else {
            showStatus(form, "Your email app should open with the details filled in. The website has not sent the message itself. Review it, then send it from your email app.", "info");
          }
          trackEvent(eventName, { delivery: "mailto" });
        } else {
          renderBrief(form, brief, filename);
          showStatus(form, "Nothing has been sent. Contact details or a form endpoint still need to be configured. Copy or download the prepared brief below.", "info");
          trackEvent(eventName, { delivery: "local_brief_only" });
        }
      } catch (error) {
        console.error(error);
        renderBrief(form, brief, filename);
        showStatus(form, "The form service did not accept the enquiry. Nothing is being presented as delivered. Copy or download the prepared brief and use the direct contact details on this page.", "error");
        trackEvent(isCandidate ? "candidate_form_error" : "client_form_error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });

    const copyButton = qs("[data-copy-brief]", form);
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const text = qs(".brief-output pre", form)?.textContent || "";
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          showStatus(form, "The prepared details were copied to your clipboard. Nothing has been sent.", "info");
        } catch {
          const pre = qs(".brief-output pre", form);
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(pre);
          selection.removeAllRanges();
          selection.addRange(range);
          showStatus(form, "Clipboard access was blocked. The prepared details have been selected so you can copy them manually.", "info");
        }
      });
    }

    const downloadButton = qs("[data-download-brief]", form);
    if (downloadButton) {
      downloadButton.addEventListener("click", () => {
        const output = qs(".brief-output", form);
        const text = qs("pre", output)?.textContent || "";
        if (!text) return;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = output.dataset.filename || "12grapes-details.txt";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        trackEvent(isCandidate ? "candidate_brief_download" : "job_brief_download");
      });
    }
  };

  const initForms = () => qsa("form[data-form-kind]").forEach(initForm);

  applySiteConfig();
  initNavigation();
  initReveal();
  initTrackedLinks();
  initServicePrefill();
  initForms();
})();
