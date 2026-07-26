(function () {
  const MOCKUPS = [
    { slug: "mockup-2", label: "Mockup 2" },
    { slug: "mockup-3", label: "Mockup 3" },
    { slug: "mockup-3-dark", label: "Mockup 3 — Dark" },
  ];

  const SLUGS = MOCKUPS.map((mockup) => mockup.slug);
  const parts = window.location.pathname.split("/").filter(Boolean);
  const mockupIndex = parts.findIndex((part) => SLUGS.includes(part));

  if (mockupIndex === -1) {
    return;
  }

  const basePath = "/" + parts.slice(0, mockupIndex).join("/");
  const basePrefix = basePath === "/" ? "" : basePath;
  const currentSlug = parts[mockupIndex];
  const pagePath = parts.slice(mockupIndex + 1).join("/") || "index.html";

  const current = MOCKUPS.find((mockup) => mockup.slug === currentSlug);
  if (!current) {
    return;
  }

  const bar = document.createElement("div");
  bar.className = "mockup-switcher";
  bar.setAttribute("role", "navigation");
  bar.setAttribute("aria-label", "Mockup preview switcher");

  const label = document.createElement("span");
  label.className = "mockup-switcher__label";
  label.innerHTML =
    'Viewing <span class="mockup-switcher__current">' + current.label + "</span>";

  const links = document.createElement("div");
  links.className = "mockup-switcher__links";

  MOCKUPS.filter((mockup) => mockup.slug !== currentSlug).forEach((mockup, index) => {
    if (index > 0) {
      const sep = document.createElement("span");
      sep.className = "mockup-switcher__sep";
      sep.textContent = "·";
      sep.setAttribute("aria-hidden", "true");
      links.appendChild(sep);
    }

    const link = document.createElement("a");
    link.className = "mockup-switcher__link";
    link.href = basePrefix + "/" + mockup.slug + "/" + pagePath;
    link.textContent = mockup.label;
    links.appendChild(link);
  });

  const gallerySep = document.createElement("span");
  gallerySep.className = "mockup-switcher__sep";
  gallerySep.textContent = "|";
  gallerySep.setAttribute("aria-hidden", "true");
  links.appendChild(gallerySep);

  const galleryLink = document.createElement("a");
  galleryLink.className = "mockup-switcher__link mockup-switcher__link--gallery";
  galleryLink.href = basePrefix + "/";
  galleryLink.textContent = "All mockups";
  links.appendChild(galleryLink);

  bar.appendChild(label);
  bar.appendChild(links);
  document.body.appendChild(bar);

  document.body.style.paddingBottom =
    "calc(" + getComputedStyle(bar).height + " + 0.5rem)";
})();
