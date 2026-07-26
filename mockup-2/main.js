/* Four Peaks Pastoral — Mockup2 (Aerial Horizon) */

(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const LOGO_MARK = "images/logos/logo-wordmark-header.png";
  const LOGO_MARK_WHITE = "images/logos/logo-wordmark-light.png";

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const headerLogo = document.querySelector(".site-header .logo img");
  const hero = document.querySelector(".hero");
  /* Dark typographic page-heroes (About / Services / Contact) share over-hero chrome */
  const pageHero = document.querySelector(".page-hero");
  const heroBand = hero || pageHero;
  const heroMedia = document.querySelector(".hero__media");
  const heroContent = document.querySelector(".hero__content");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setHeaderLogo(overHero) {
    if (!headerLogo) return;
    /* Light wordmark only over dark hero fade; dark wordmark on light chrome */
    headerLogo.src = overHero ? LOGO_MARK_WHITE : LOGO_MARK;
  }

  function syncHeaderState() {
    if (!header) return;
    const scrolled = window.scrollY > 12;
    let overHero = false;
    if (heroBand) {
      const heroBottom = heroBand.getBoundingClientRect().bottom;
      overHero = heroBottom > header.offsetHeight + 48;
    }
    const showOverHero = overHero && !scrolled;
    header.classList.toggle("is-scrolled", scrolled);
    header.classList.toggle("is-over-hero", showOverHero);
    setHeaderLogo(showOverHero);
  }

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
  window.addEventListener("resize", syncHeaderState, { passive: true });

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    document.body.style.overflow = "";
  }

  /* Mobile nav */
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
      link.addEventListener("click", () => {
        closeNav();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeNav();
      }
    });
  }

  /* Hero entrance — mark ready immediately so copy is never stuck hidden */
  if (heroContent) {
    heroContent.classList.add("is-ready");
  }

  /* Terrain parallax — scroll drift + slight constant motion (page field) */
  const terrainBg = document.querySelector(".terrain-bg");
  const terrainSections = document.querySelectorAll(
    ".section--navy, .capability, .cta-band, .page-hero, .site-footer"
  );
  const TERRAIN_SCROLL_Y = 0.12;
  const TERRAIN_SCROLL_X = 0.045;
  const TERRAIN_DRIFT_Y = 5; /* px per second — down */
  const TERRAIN_DRIFT_X = 1.88; /* px per second — right (matches scroll axis ratio) */
  const TERRAIN_SECTION_FACTOR = 0.1;

  /* Map detections — same transform space as terrain so pings ride the pan */
  let detectLayer = document.querySelector(".detect-bg");
  if (terrainBg && !detectLayer) {
    detectLayer = document.createElement("div");
    detectLayer.className = "detect-bg";
    detectLayer.setAttribute("aria-hidden", "true");
    terrainBg.insertAdjacentElement("afterend", detectLayer);
  }

  let detectSurface = detectLayer
    ? detectLayer.querySelector(".detect-bg__surface")
    : null;
  if (detectLayer && !detectSurface) {
    detectSurface = document.createElement("div");
    detectSurface.className = "detect-bg__surface";
    detectLayer.appendChild(detectSurface);
  }

  /* Shared map offset (px) — terrain background-position + detect surface translate */
  let topoScrollX = 0;
  let topoScrollY = 0;

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

  function updateSectionTerrain(scrollY) {
    terrainSections.forEach((section) => {
      const y = (scrollY - section.offsetTop) * TERRAIN_SECTION_FACTOR;
      section.style.setProperty("--topo-scroll-y", `${y}px`);
    });
  }

  if (!reduceMotion && (terrainBg || terrainSections.length || heroMedia)) {
    const driftStart = performance.now();

    function updateScrollMotion() {
      const elapsedSec = (performance.now() - driftStart) / 1000;
      const scrollY = window.scrollY;

      if (heroMedia) {
        const y = Math.min(scrollY, window.innerHeight);
        heroMedia.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
      }

      if (terrainBg) {
        const y = scrollY * TERRAIN_SCROLL_Y + elapsedSec * TERRAIN_DRIFT_Y;
        const x = scrollY * TERRAIN_SCROLL_X + elapsedSec * TERRAIN_DRIFT_X;
        applyTopoScroll(x, y);
      }

      updateSectionTerrain(scrollY);
      requestAnimationFrame(updateScrollMotion);
    }

    requestAnimationFrame(updateScrollMotion);
  }

  if (!reduceMotion && detectSurface) {
    const PING_MIN_MS = 700;
    const PING_MAX_MS = 2800;
    const EDGE_PAD = 6; /* % inset from viewport edges */

    function spawnDetectPing() {
      const w = detectLayer.clientWidth;
      const h = detectLayer.clientHeight;
      /* Viewport spawn, then subtract current pan so the surface transform places it there */
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

      const nextIn = PING_MIN_MS + Math.random() * (PING_MAX_MS - PING_MIN_MS);
      window.setTimeout(spawnDetectPing, nextIn);
    }

    /* Stagger a second concurrent stream so overlaps feel organic */
    window.setTimeout(spawnDetectPing, 200 + Math.random() * 500);
    window.setTimeout(spawnDetectPing, 1100 + Math.random() * 900);
  }

  /* Scroll reveals — skip motion when reduced-motion; show above-fold immediately */
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

  /* Flight-path line draw on scroll */
  const flightPaths = document.querySelectorAll("[data-flight-path]");
  if (flightPaths.length && "IntersectionObserver" in window) {
    const pathIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            pathIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    flightPaths.forEach((el) => pathIo.observe(el));
  } else {
    flightPaths.forEach((el) => el.classList.add("is-drawn"));
  }

  /* Enquiry form (mockup feedback only) */
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
      if (status) {
        status.dataset.state = "success";
        status.textContent =
          "Thank you. A member of the Four Peaks Pastoral team will be in contact shortly.";
      }
      form.reset();
    });
  }
})();
