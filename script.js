// script.js
(function () {
  const STORAGE_KEY = "site-lang";

  function getInitialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") return stored;
    return "pt";
  }

  function applyLanguage(lang) {
    const dict = i18n[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.getElementById("lang-toggle").textContent = lang === "pt" ? "EN" : "PT";
    localStorage.setItem(STORAGE_KEY, lang);
    renderProjects(lang);
  }

  function renderProjects(lang) {
    const container = document.getElementById("projects-container");
    container.innerHTML = "";
    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card" + (project.highlight ? " project-card-highlight" : "");

      const title = document.createElement("h3");
      title.textContent = lang === "pt" ? project.nameKey : project.nameEnKey;
      card.appendChild(title);

      const desc = document.createElement("p");
      desc.textContent = lang === "pt" ? project.descPt : project.descEn;
      card.appendChild(desc);

      const tagList = document.createElement("ul");
      tagList.className = "project-tags";
      project.tags.forEach((tag) => {
        const tagItem = document.createElement("li");
        tagItem.textContent = tag;
        tagList.appendChild(tagItem);
      });
      card.appendChild(tagList);

      const link = document.createElement("a");
      link.href = project.link;
      link.target = "_blank";
      link.rel = "noopener";
      link.className = "project-link";
      link.textContent = i18n[lang].project_link_text;
      card.appendChild(link);

      container.appendChild(card);
    });
  }

  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");
    hamburger.addEventListener("click", () => {
      const isActive = nav.classList.toggle("active");
      hamburger.classList.toggle("active", isActive);
    });
    nav.querySelectorAll(".nav-list a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        hamburger.classList.remove("active");
      });
    });
  }

  function initReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
  }

  function init() {
    applyLanguage(getInitialLang());
    document.getElementById("lang-toggle").addEventListener("click", () => {
      const current = localStorage.getItem(STORAGE_KEY) || "pt";
      applyLanguage(current === "pt" ? "en" : "pt");
    });
    initHeaderScroll();
    initHamburger();
    initReveal();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
