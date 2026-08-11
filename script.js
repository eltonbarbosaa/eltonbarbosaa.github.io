// script.js
(function () {
  const STORAGE_KEY = "site-lang";
  const THEME_KEY = "site-theme";
  const GITHUB_USERNAME = "eltonbarbosaa";

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

  function getInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return "dark";
  }

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const themeColorMeta = document.getElementById("theme-color-meta");
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme === "light" ? "#f8fafc" : "#0b0d17");
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    applyTheme(getInitialTheme());
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const current = localStorage.getItem(THEME_KEY) || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initGithubStats() {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.public_repos === "number") {
          document.getElementById("stat-repos").textContent = data.public_repos + "+";
        }
      })
      .catch(() => {
        // Keep the static fallback already in the HTML if the API is unreachable or rate-limited.
      });
  }

  function initBackToTop() {
    const button = document.getElementById("back-to-top");
    const onScroll = () => {
      button.classList.toggle("visible", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }

  function initScrollSpy() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(document.querySelectorAll(".nav-list a[href^='#']"));
    if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
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
    initTheme();
    initHeaderScroll();
    initHamburger();
    initReveal();
    initGithubStats();
    initBackToTop();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
