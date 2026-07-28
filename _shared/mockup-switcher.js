(function () {
  const DESIGNS = [
    { id: "grounded", label: "Grounded", slug: "mockup-1" },
    { id: "sharp", label: "Sharp", slug: "mockup-2" },
    {
      id: "friendly",
      label: "Friendly",
      variants: [
        /* Labels follow page-field appearance (mockup-3 = dark field, mockup-3-dark = light field). */
        { slug: "mockup-3", theme: "dark" },
        { slug: "mockup-3-dark", theme: "light" },
      ],
    },
    { id: "space", label: "Space", slug: "mockup-4" },
  ];

  const SLUGS = DESIGNS.flatMap((design) =>
    design.slug ? [design.slug] : design.variants.map((variant) => variant.slug)
  );

  const parts = window.location.pathname.split("/").filter(Boolean);
  const mockupIndex = parts.findIndex((part) => SLUGS.includes(part));

  if (mockupIndex === -1) {
    return;
  }

  const basePath = "/" + parts.slice(0, mockupIndex).join("/");
  const basePrefix = basePath === "/" ? "" : basePath;
  const currentSlug = parts[mockupIndex];
  const pagePath = parts.slice(mockupIndex + 1).join("/") || "index.html";

  function findDesignBySlug(slug) {
    for (const design of DESIGNS) {
      if (design.slug === slug) {
        return { design, variant: null };
      }
      if (design.variants) {
        const variant = design.variants.find((entry) => entry.slug === slug);
        if (variant) {
          return { design, variant };
        }
      }
    }
    return null;
  }

  const currentMatch = findDesignBySlug(currentSlug);
  if (!currentMatch) {
    return;
  }

  const { design: currentDesign, variant: currentVariant } = currentMatch;

  function slugForDesign(designId) {
    const design = DESIGNS.find((entry) => entry.id === designId);
    if (!design) {
      return null;
    }
    if (design.slug) {
      return design.slug;
    }
    if (designId === currentDesign.id && currentVariant) {
      return currentVariant.slug;
    }
    return design.variants[0].slug;
  }

  function mockupUrl(slug) {
    return basePrefix + "/" + slug + "/" + pagePath;
  }

  function makeSep() {
    const sep = document.createElement("span");
    sep.className = "mockup-switcher__sep";
    sep.textContent = "|";
    sep.setAttribute("aria-hidden", "true");
    return sep;
  }

  const bar = document.createElement("div");
  bar.className = "mockup-switcher";
  bar.setAttribute("role", "navigation");
  bar.setAttribute("aria-label", "Mockup preview switcher");

  const designControl = document.createElement("div");
  designControl.className = "mockup-switcher__design";

  const designLabel = document.createElement("label");
  designLabel.className = "mockup-switcher__design-label";
  designLabel.htmlFor = "mockup-switcher-design";
  designLabel.textContent = "Design:";

  const designSelect = document.createElement("select");
  designSelect.id = "mockup-switcher-design";
  designSelect.className = "mockup-switcher__select";

  DESIGNS.forEach((design) => {
    const option = document.createElement("option");
    option.value = design.id;
    option.textContent = design.label;
    option.selected = design.id === currentDesign.id;
    designSelect.appendChild(option);
  });

  designSelect.addEventListener("change", () => {
    const targetSlug = slugForDesign(designSelect.value);
    if (targetSlug && targetSlug !== currentSlug) {
      window.location.href = mockupUrl(targetSlug);
    }
  });

  designControl.appendChild(designLabel);
  designControl.appendChild(designSelect);

  const bgControl = document.createElement("div");
  bgControl.className = "mockup-switcher__bg";
  bgControl.setAttribute("role", "group");
  bgControl.setAttribute("aria-label", "Background mode");

  const bgLabel = document.createElement("span");
  bgLabel.className = "mockup-switcher__bg-label";
  bgLabel.textContent = "Background:";

  function makeToggleButton(text, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    return button;
  }

  function makeBgButton(mode, text) {
    const button = makeToggleButton(text, "mockup-switcher__toggle-btn");
    button.dataset.mode = mode;
    button.addEventListener("click", () => {
      if (window.__fppSetBgMode) {
        window.__fppSetBgMode(mode);
      }
    });
    return button;
  }

  const animatedBtn = makeBgButton("animated", "Animated");
  const solidBtn = makeBgButton("solid", "Solid");

  function syncBgButtons() {
    const mode = window.__fppGetBgMode ? window.__fppGetBgMode() : "animated";
    animatedBtn.classList.toggle("is-active", mode === "animated");
    solidBtn.classList.toggle("is-active", mode === "solid");
    animatedBtn.setAttribute("aria-pressed", String(mode === "animated"));
    solidBtn.setAttribute("aria-pressed", String(mode === "solid"));
  }

  bgControl.appendChild(bgLabel);
  bgControl.appendChild(animatedBtn);
  bgControl.appendChild(solidBtn);
  window.addEventListener("fpp:bgmodechange", syncBgButtons);
  syncBgButtons();

  bar.appendChild(designControl);
  bar.appendChild(makeSep());
  bar.appendChild(bgControl);

  if (currentDesign.id === "friendly" && currentVariant) {
    const themeControl = document.createElement("div");
    themeControl.className = "mockup-switcher__theme";
    themeControl.setAttribute("role", "group");
    themeControl.setAttribute("aria-label", "Theme mode");

    const themeLabel = document.createElement("span");
    themeLabel.className = "mockup-switcher__bg-label";
    themeLabel.textContent = "Theme:";

    const lightBtn = makeToggleButton("Light", "mockup-switcher__toggle-btn");
    const darkBtn = makeToggleButton("Dark", "mockup-switcher__toggle-btn");

    function syncThemeButtons() {
      const isLight = currentVariant.theme === "light";
      lightBtn.classList.toggle("is-active", isLight);
      darkBtn.classList.toggle("is-active", !isLight);
      lightBtn.setAttribute("aria-pressed", String(isLight));
      darkBtn.setAttribute("aria-pressed", String(!isLight));
    }

    lightBtn.addEventListener("click", () => {
      const lightSlug = currentDesign.variants.find((entry) => entry.theme === "light").slug;
      if (currentSlug !== lightSlug) {
        window.location.href = mockupUrl(lightSlug);
      }
    });

    darkBtn.addEventListener("click", () => {
      const darkSlug = currentDesign.variants.find((entry) => entry.theme === "dark").slug;
      if (currentSlug !== darkSlug) {
        window.location.href = mockupUrl(darkSlug);
      }
    });

    syncThemeButtons();

    themeControl.appendChild(themeLabel);
    themeControl.appendChild(lightBtn);
    themeControl.appendChild(darkBtn);

    bar.appendChild(makeSep());
    bar.appendChild(themeControl);
  }

  bar.appendChild(makeSep());

  const galleryLink = document.createElement("a");
  galleryLink.className = "mockup-switcher__gallery-link";
  galleryLink.href = basePrefix + "/";
  galleryLink.textContent = "All mockups";
  bar.appendChild(galleryLink);

  document.body.appendChild(bar);

  function applySwitcherOffset() {
    const height = bar.getBoundingClientRect().height;
    document.body.style.paddingBottom =
      "calc(" + height + "px + 0.75rem + env(safe-area-inset-bottom, 0px))";
  }

  applySwitcherOffset();
  requestAnimationFrame(applySwitcherOffset);
  window.addEventListener("resize", applySwitcherOffset);
})();
