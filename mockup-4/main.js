/* Four Peaks Pastoral — Space (Radian Fluid) */

(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

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

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) closeNav();
    });
  }

  /* ——— Carousel ——— */
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    if (!track) return;

    function scrollByCard(direction) {
      const card = track.querySelector(".carousel__card");
      const amount = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.7;
      track.scrollBy({ left: direction * amount, behavior: "smooth" });
    }

    function syncButtons() {
      if (!prev || !next) return;
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }

    prev?.addEventListener("click", () => scrollByCard(-1));
    next?.addEventListener("click", () => scrollByCard(1));
    track.addEventListener("scroll", syncButtons, { passive: true });
    window.addEventListener("resize", syncButtons);
    syncButtons();
  });

  /* ——— Light animated topo + detection pings ——— */
  const terrainBg = document.querySelector(".terrain-bg");
  const TERRAIN_SCROLL_Y = 0.12;
  const TERRAIN_SCROLL_X = 0.045;
  const TERRAIN_DRIFT_Y = 5;
  const TERRAIN_DRIFT_X = 1.88;

  let detectLayer = document.querySelector(".detect-bg");
  if (terrainBg && !detectLayer) {
    detectLayer = document.createElement("div");
    detectLayer.className = "detect-bg";
    detectLayer.setAttribute("aria-hidden", "true");
    terrainBg.insertAdjacentElement("afterend", detectLayer);
  }

  let detectSurface = detectLayer ? detectLayer.querySelector(".detect-bg__surface") : null;
  if (detectLayer && !detectSurface) {
    detectSurface = document.createElement("div");
    detectSurface.className = "detect-bg__surface";
    detectLayer.appendChild(detectSurface);
  }

  let topoScrollX = 0;
  let topoScrollY = 0;
  let scrollRafId = null;
  let pingTimeoutIds = [];
  const PING_MIN_MS = 700;
  const PING_MAX_MS = 2800;
  const EDGE_PAD = 6;

  function applyTopoScroll(x, y) {
    topoScrollX = x;
    topoScrollY = y;
    const xPx = `${x}px`;
    const yPx = `${y}px`;
    if (terrainBg) {
      terrainBg.style.setProperty("--topo-scroll-x", xPx);
      terrainBg.style.setProperty("--topo-scroll-y", yPx);
    }
    if (detectLayer) {
      detectLayer.style.setProperty("--topo-scroll-x", xPx);
      detectLayer.style.setProperty("--topo-scroll-y", yPx);
    }
  }

  function isBgAnimated() {
    return document.documentElement.dataset.bgMode !== "solid";
  }

  function clearPingTimeouts() {
    pingTimeoutIds.forEach((id) => window.clearTimeout(id));
    pingTimeoutIds = [];
    if (detectSurface) detectSurface.innerHTML = "";
  }

  function stopScrollMotion() {
    if (scrollRafId !== null) {
      cancelAnimationFrame(scrollRafId);
      scrollRafId = null;
    }
    applyTopoScroll(0, 0);
  }

  function startScrollMotion() {
    if (!isBgAnimated() || reduceMotion || scrollRafId !== null) return;
    if (!terrainBg) return;

    const driftStart = performance.now();

    function updateScrollMotion() {
      if (!isBgAnimated()) {
        stopScrollMotion();
        return;
      }

      const elapsedSec = (performance.now() - driftStart) / 1000;
      const scrollY = window.scrollY;
      const y = scrollY * TERRAIN_SCROLL_Y + elapsedSec * TERRAIN_DRIFT_Y;
      const x = scrollY * TERRAIN_SCROLL_X + elapsedSec * TERRAIN_DRIFT_X;
      applyTopoScroll(x, y);

      scrollRafId = requestAnimationFrame(updateScrollMotion);
    }

    scrollRafId = requestAnimationFrame(updateScrollMotion);
  }

  function scheduleDetectPing(delayMs) {
    const timeoutId = window.setTimeout(() => {
      pingTimeoutIds = pingTimeoutIds.filter((id) => id !== timeoutId);
      if (!isBgAnimated() || reduceMotion || !detectSurface) return;

      const w = detectLayer.clientWidth;
      const h = detectLayer.clientHeight;
      const viewX = ((EDGE_PAD + Math.random() * (100 - EDGE_PAD * 2)) / 100) * w;
      const viewY = ((EDGE_PAD + Math.random() * (100 - EDGE_PAD * 2)) / 100) * h;

      const ping = document.createElement("span");
      ping.className = "detect-bg__ping";
      ping.style.left = `${viewX - topoScrollX}px`;
      ping.style.top = `${viewY - topoScrollY}px`;
      ping.innerHTML =
        '<span class="detect-bg__ring"></span><span class="detect-bg__dot"></span>';
      detectSurface.appendChild(ping);

      const ring = ping.querySelector(".detect-bg__ring");
      if (ring) {
        ring.addEventListener("animationend", () => ping.remove(), { once: true });
      }

      scheduleDetectPing(PING_MIN_MS + Math.random() * (PING_MAX_MS - PING_MIN_MS));
    }, delayMs);
    pingTimeoutIds.push(timeoutId);
  }

  function stopDetectPings() {
    clearPingTimeouts();
  }

  function startDetectPings() {
    if (!isBgAnimated() || reduceMotion || !detectSurface || pingTimeoutIds.length) return;
    scheduleDetectPing(200 + Math.random() * 500);
    scheduleDetectPing(1100 + Math.random() * 900);
  }

  function syncBgMotion() {
    if (isBgAnimated() && !reduceMotion) {
      startScrollMotion();
      startDetectPings();
    } else {
      stopScrollMotion();
      stopDetectPings();
    }
  }

  syncBgMotion();
  window.addEventListener("fpp:bgmodechange", syncBgMotion);

  /* ——— Enquiry forms ——— */
  document.querySelectorAll("[data-enquiry-form]").forEach((form) => {
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
      const phone = (form.querySelector("[name='phone']")?.value || "").trim();
      const email = (form.querySelector("[name='email']")?.value || "").trim();
      if (!phone && !email) {
        if (status) {
          status.dataset.state = "error";
          status.textContent = "Please provide a phone number or email address.";
        }
        (form.querySelector("[name='phone']") || form.querySelector("[name='email']"))?.focus();
        return;
      }
      if (status) {
        status.dataset.state = "success";
        status.textContent =
          "Thank you. A member of the Four Peaks Pastoral team will be in contact shortly.";
      }
      form.reset();
    });
  });
})();
