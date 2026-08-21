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
      card.className = "project-card reveal-stagger" + (project.highlight ? " project-card-highlight" : "");
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });

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

      if (project.link) {
        const link = document.createElement("a");
        link.href = project.link;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "project-link";
        link.textContent = i18n[lang].project_link_text;
        card.appendChild(link);
      } else {
        const privateLabel = document.createElement("span");
        privateLabel.className = "project-link project-link-private";
        privateLabel.textContent = i18n[lang].project_private_text;
        card.appendChild(privateLabel);
      }

      if (project.demoLink) {
        const demoLink = document.createElement("a");
        demoLink.href = project.demoLink;
        demoLink.className = "project-link project-link-demo";
        demoLink.textContent = i18n[lang].project_demo_link_text;
        card.appendChild(demoLink);
      }

      container.appendChild(card);
    });

    document.querySelectorAll("#projects-container .reveal-stagger").forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 6) * 90}ms`;
      observeReveal(el);
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

  let revealObserver = null;

  function observeReveal(el) {
    if (el.dataset.revealed === "true") return;
    if (!revealObserver) {
      el.classList.add("revealed");
      return;
    }
    revealObserver.observe(el);
  }

  function initReveal() {
    if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              entry.target.dataset.revealed = "true";
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
    }

    document.querySelectorAll(".reveal").forEach(observeReveal);

    // Stagger grouped items (timeline entries, education cards, stack groups, project cards)
    // by applying an incremental transition-delay based on their position within the parent.
    document.querySelectorAll(".reveal-stagger").forEach((el) => {
      const parent = el.parentElement;
      const siblings = parent ? Array.from(parent.children).filter((c) => c.classList.contains("reveal-stagger")) : [el];
      const index = siblings.indexOf(el);
      el.style.transitionDelay = `${Math.min(index, 6) * 90}ms`;
      observeReveal(el);
    });
  }

  function init() {
    initReveal();
    applyLanguage(getInitialLang());
    document.getElementById("lang-toggle").addEventListener("click", () => {
      const current = localStorage.getItem(STORAGE_KEY) || "pt";
      applyLanguage(current === "pt" ? "en" : "pt");
    });
    initTheme();
    initHeaderScroll();
    initHamburger();
    initGithubStats();
    initBackToTop();
    initScrollSpy();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
