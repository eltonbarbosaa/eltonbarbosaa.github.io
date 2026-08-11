# Portfólio Pessoal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a static personal portfolio site (PT/EN) for Elton Barbosa at `eltonbarbosaa.github.io`.

**Architecture:** Pure static site — `index.html` + `styles.css` + `script.js`, plus two data files (`i18n.js`, `projects.js`). No build step, no npm dependencies. Published via GitHub Pages from the `eltonbarbosaa/eltonbarbosaa.github.io` repo, branch `main`, root folder.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES2017+), Node.js only as a local dev-time linter (no runtime dependency), GitHub Pages for hosting.

## Global Constraints

- No build tooling, no npm packages, no frameworks — spec explicitly chose "HTML/CSS/JS puro".
- No contact form / backend — contact links must be direct `mailto:` / external profile links.
- Repository name must be exactly `eltonbarbosaa.github.io` for GitHub Pages user-site routing.
- Content must ship in both `pt` and `en` — every user-facing string goes through the `i18n` dictionary via `data-i18n` attributes, no hardcoded copy outside `i18n.js`.
- Real project links only, pointing at existing GitHub repos: `tcc-yolo`, `portal_gim`, `Mundo-de-Wumpus`, `spotify-react`.
- Real contact links: `elton.baarbosa@gmail.com` (Gmail), `https://www.linkedin.com/in/eltonsilvabarbosa/`, `https://github.com/eltonbarbosaa`, `https://www.instagram.com/eltonbarbosa__`.
- Experience section must state: role "Engenheiro de Planejamento" / "Planning Engineer", company "MCA Auditoria e Gerenciamento", period "Desde julho de 2026" / "Since July 2026".

---

### Task 1: Project scaffold + content validator

**Files:**
- Create: `scripts/validate-content.js`
- Create: `i18n.js` (minimal stub, filled out fully in Task 2)
- Create: `projects.js` (minimal stub, filled out fully in Task 3)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `scripts/validate-content.js` — a Node CLI script, run as `node scripts/validate-content.js`, exit code `0` on success and `1` on failure, used by every later task that touches `i18n.js` or `projects.js`. Expects `i18n.js` and `projects.js` to assign to global `i18n` / `projects` and also export via `module.exports` when `typeof module !== "undefined"`.

- [ ] **Step 1: Create the validator script**

```javascript
// scripts/validate-content.js
const path = require("path");
const i18n = require(path.join(__dirname, "..", "i18n.js"));
const projects = require(path.join(__dirname, "..", "projects.js"));

let failed = false;

function fail(msg) {
  console.error("FAIL: " + msg);
  failed = true;
}

function validateI18n() {
  const ptKeys = Object.keys(i18n.pt || {}).sort();
  const enKeys = Object.keys(i18n.en || {}).sort();
  if (ptKeys.length === 0) {
    fail("i18n.pt has no keys");
    return;
  }
  if (JSON.stringify(ptKeys) !== JSON.stringify(enKeys)) {
    fail("i18n key mismatch.\npt: " + ptKeys.join(", ") + "\nen: " + enKeys.join(", "));
  }
  for (const key of ptKeys) {
    if (typeof i18n.pt[key] !== "string" || i18n.pt[key].trim() === "") {
      fail("i18n.pt." + key + " is empty");
    }
    if (typeof i18n.en[key] !== "string" || i18n.en[key].trim() === "") {
      fail("i18n.en." + key + " is empty");
    }
  }
}

function validateProjects() {
  if (!Array.isArray(projects) || projects.length === 0) {
    fail("projects.js must export a non-empty array");
    return;
  }
  const required = ["id", "nameKey", "nameEnKey", "descPt", "descEn", "tags", "link", "highlight"];
  for (const p of projects) {
    for (const field of required) {
      if (!(field in p)) fail('project "' + (p.id || "?") + '" missing field "' + field + '"');
    }
    if (p.tags && !Array.isArray(p.tags)) fail('project "' + p.id + '" tags must be an array');
    if (p.link && !p.link.startsWith("https://github.com/")) {
      fail('project "' + p.id + '" link must be a GitHub URL');
    }
  }
}

validateI18n();
validateProjects();

if (failed) {
  console.error("\nValidation failed.");
  process.exitCode = 1;
} else {
  console.log("OK: content validated (" + Object.keys(i18n.pt).length + " i18n keys, " + projects.length + " projects)");
}
```

- [ ] **Step 2: Create minimal stub data files so the validator has something to check**

```javascript
// i18n.js
const i18n = {
  pt: { placeholder: "x" },
  en: { placeholder: "x" },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = i18n;
}
```

```javascript
// projects.js
const projects = [
  {
    id: "stub",
    nameKey: "stub",
    nameEnKey: "stub",
    descPt: "stub",
    descEn: "stub",
    tags: ["stub"],
    link: "https://github.com/eltonbarbosaa/stub",
    highlight: false,
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = projects;
}
```

- [ ] **Step 3: Run the validator to verify it passes on the stubs**

Run: `node scripts/validate-content.js`
Expected: `OK: content validated (1 i18n keys, 1 projects)`

- [ ] **Step 4: Commit**

```bash
git add scripts/validate-content.js i18n.js projects.js
git commit -m "Add content validator and stub data files"
```

---

### Task 2: i18n content

**Files:**
- Modify: `i18n.js` (replace stub with full PT/EN dictionary)

**Interfaces:**
- Consumes: `scripts/validate-content.js` (Task 1) to check key parity.
- Produces: `i18n` global object with the following keys, consumed by `script.js` (Task 5) and referenced via `data-i18n="<key>"` in `index.html` (Task 4): `nav_about`, `nav_experience`, `nav_stack`, `nav_projects`, `nav_contact`, `hero_greeting`, `hero_title`, `hero_cta_contact`, `hero_cta_projects`, `about_heading`, `about_text`, `experience_heading`, `experience_role`, `experience_company`, `experience_period`, `experience_note`, `stack_heading`, `stack_data_ai`, `stack_backend`, `stack_frontend`, `stack_tools`, `projects_heading`, `contact_heading`, `contact_text`, `footer_text`.

- [ ] **Step 1: Replace `i18n.js` with the full dictionary**

```javascript
// i18n.js
const i18n = {
  pt: {
    nav_about: "Sobre",
    nav_experience: "Experiência",
    nav_stack: "Stack",
    nav_projects: "Projetos",
    nav_contact: "Contato",
    hero_greeting: "Olá, eu sou",
    hero_title: "Desenvolvedor Full Stack | Engenharia de Planejamento",
    hero_cta_contact: "Entrar em contato",
    hero_cta_projects: "Ver projetos",
    about_heading: "Sobre",
    about_text: "Engenheiro de Computação formado pela Universidade Federal do Pará (Campus Tucuruí), pós-graduando em Engenharia de Segurança do Trabalho e em Engenharia de Produção & Gestão de Projetos. Atuo na fronteira entre dados, IA e desenvolvimento de sistemas full stack — quando um processo trava por falta de ferramenta, eu construo a ferramenta.",
    experience_heading: "Experiência",
    experience_role: "Engenheiro de Planejamento",
    experience_company: "MCA Auditoria e Gerenciamento",
    experience_period: "Desde julho de 2026",
    experience_note: "Atuação predominante em desenvolvimento: construção de sistemas internos e automação de processos de planejamento e gestão.",
    stack_heading: "Stack",
    stack_data_ai: "Dados & IA",
    stack_backend: "Back-end",
    stack_frontend: "Front-end",
    stack_tools: "Ferramentas",
    projects_heading: "Projetos",
    contact_heading: "Contato",
    contact_text: "Aberto a conexões, colaborações e novos desafios em Dados, IA e Desenvolvimento.",
    footer_text: "Feito por Elton Barbosa",
  },
  en: {
    nav_about: "About",
    nav_experience: "Experience",
    nav_stack: "Stack",
    nav_projects: "Projects",
    nav_contact: "Contact",
    hero_greeting: "Hi, I'm",
    hero_title: "Full Stack Developer | Planning Engineering",
    hero_cta_contact: "Get in touch",
    hero_cta_projects: "See projects",
    about_heading: "About",
    about_text: "Computer Engineer graduated from Universidade Federal do Pará (Tucuruí Campus), currently pursuing postgraduate studies in Occupational Safety Engineering and Production Engineering & Project Management. I work at the intersection of data, AI, and full stack development — when a process is stuck for lack of a tool, I build the tool.",
    experience_heading: "Experience",
    experience_role: "Planning Engineer",
    experience_company: "MCA Auditoria e Gerenciamento",
    experience_period: "Since July 2026",
    experience_note: "Primarily focused on development: building internal systems and automating planning and management processes.",
    stack_heading: "Stack",
    stack_data_ai: "Data & AI",
    stack_backend: "Back-end",
    stack_frontend: "Front-end",
    stack_tools: "Tools",
    projects_heading: "Projects",
    contact_heading: "Contact",
    contact_text: "Open to connections, collaborations and new challenges in Data, AI and Development.",
    footer_text: "Made by Elton Barbosa",
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = i18n;
}
```

- [ ] **Step 2: Run the validator**

Run: `node scripts/validate-content.js`
Expected: `OK: content validated (25 i18n keys, 1 projects)`

- [ ] **Step 3: Check for JS syntax errors**

Run: `node --check i18n.js`
Expected: no output (exit code 0)

- [ ] **Step 4: Commit**

```bash
git add i18n.js
git commit -m "Add full PT/EN content dictionary"
```

---

### Task 3: Projects content

**Files:**
- Modify: `projects.js` (replace stub with the 4 real projects)

**Interfaces:**
- Consumes: `scripts/validate-content.js` (Task 1).
- Produces: `projects` global array, consumed by `renderProjects()` in `script.js` (Task 5). Each item shape: `{ id: string, nameKey: string, nameEnKey: string, descPt: string, descEn: string, tags: string[], link: string, highlight: boolean }`.

- [ ] **Step 1: Replace `projects.js` with the real project list**

```javascript
// projects.js
const projects = [
  {
    id: "tcc-yolo",
    nameKey: "Sistema de Vigilância com IA (TCC)",
    nameEnKey: "AI Surveillance System (Thesis)",
    descPt: "Detecção automática de armas e disfarces em vídeo, comparando YOLOv8, YOLOv9 e YOLOv10 no mesmo dataset, com pipeline de data augmentation e treinamento reprodutível via Google Colab.",
    descEn: "Automatic detection of weapons and disguises in video, comparing YOLOv8, YOLOv9 and YOLOv10 on the same dataset, with a data augmentation pipeline and reproducible training via Google Colab.",
    tags: ["Python", "YOLOv8/v9/v10", "OpenCV", "Ultralytics"],
    link: "https://github.com/eltonbarbosaa/tcc-yolo",
    highlight: true,
  },
  {
    id: "portal_gim",
    nameKey: "Portal GIM",
    nameEnKey: "Portal GIM",
    descPt: "Sistema de gestão de solicitação de material, RH, contratadas e almoxarifado, construído em PHP e MySQL para automatizar processos internos de planejamento e controle.",
    descEn: "Management system for material requests, HR, contractors and warehouse, built in PHP and MySQL to automate internal planning and control processes.",
    tags: ["PHP", "MySQL", "Sistema de Gestão"],
    link: "https://github.com/eltonbarbosaa/portal_gim",
    highlight: false,
  },
  {
    id: "mundo-de-wumpus",
    nameKey: "Mundo de Wumpus",
    nameEnKey: "Wumpus World",
    descPt: "Agente inteligente clássico da IA simbólica, implementado para a disciplina de Inteligência Computacional na UFPA/Tucuruí.",
    descEn: "Classic symbolic AI intelligent agent, implemented for the Computational Intelligence course at UFPA/Tucuruí.",
    tags: ["Python", "Inteligência Artificial"],
    link: "https://github.com/eltonbarbosaa/Mundo-de-Wumpus",
    highlight: false,
  },
  {
    id: "spotify-react",
    nameKey: "Spotify Clone",
    nameEnKey: "Spotify Clone",
    descPt: "Interface inspirada no Spotify construída em React, com foco em prática de componentização e estilização.",
    descEn: "Spotify-inspired interface built in React, focused on practicing componentization and styling.",
    tags: ["React", "JavaScript", "CSS"],
    link: "https://github.com/eltonbarbosaa/spotify-react",
    highlight: false,
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = projects;
}
```

- [ ] **Step 2: Run the validator**

Run: `node scripts/validate-content.js`
Expected: `OK: content validated (25 i18n keys, 4 projects)`

- [ ] **Step 3: Check for JS syntax errors**

Run: `node --check projects.js`
Expected: no output (exit code 0)

- [ ] **Step 4: Commit**

```bash
git add projects.js
git commit -m "Add real project list"
```

---

### Task 4: HTML structure

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `i18n.js` keys (Task 2) via `data-i18n="<key>"` attributes; `#lang-toggle` button id and `#projects-container` element id are contracts that `script.js` (Task 5) binds to.
- Produces: DOM structure with element ids `lang-toggle`, `projects-container`, and section ids `about`, `experience`, `stack`, `projects`, `contact` used for nav anchor links. Loads `i18n.js`, `projects.js`, `script.js` in that order at the end of `<body>`.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Elton Barbosa — Desenvolvedor Full Stack</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <nav class="nav">
      <span class="nav-brand">Elton Barbosa</span>
      <div class="nav-links">
        <a href="#about" data-i18n="nav_about">Sobre</a>
        <a href="#experience" data-i18n="nav_experience">Experiência</a>
        <a href="#stack" data-i18n="nav_stack">Stack</a>
        <a href="#projects" data-i18n="nav_projects">Projetos</a>
        <a href="#contact" data-i18n="nav_contact">Contato</a>
      </div>
      <button id="lang-toggle" aria-label="Toggle language">EN</button>
    </nav>
  </header>

  <main>
    <section id="hero" class="hero">
      <p class="hero-greeting" data-i18n="hero_greeting">Olá, eu sou</p>
      <h1 class="hero-name">Elton Barbosa</h1>
      <p class="hero-title" data-i18n="hero_title">Desenvolvedor Full Stack | Engenharia de Planejamento</p>
      <div class="hero-cta">
        <a href="#contact" class="btn btn-primary" data-i18n="hero_cta_contact">Entrar em contato</a>
        <a href="#projects" class="btn btn-secondary" data-i18n="hero_cta_projects">Ver projetos</a>
      </div>
    </section>

    <section id="about" class="section">
      <h2 data-i18n="about_heading">Sobre</h2>
      <p data-i18n="about_text">Engenheiro de Computação formado pela Universidade Federal do Pará (Campus Tucuruí), pós-graduando em Engenharia de Segurança do Trabalho e em Engenharia de Produção & Gestão de Projetos.</p>
    </section>

    <section id="experience" class="section">
      <h2 data-i18n="experience_heading">Experiência</h2>
      <div class="experience-card">
        <h3 data-i18n="experience_role">Engenheiro de Planejamento</h3>
        <p class="experience-company" data-i18n="experience_company">MCA Auditoria e Gerenciamento</p>
        <p class="experience-period" data-i18n="experience_period">Desde julho de 2026</p>
        <p class="experience-note" data-i18n="experience_note">Atuação predominante em desenvolvimento.</p>
      </div>
    </section>

    <section id="stack" class="section">
      <h2 data-i18n="stack_heading">Stack</h2>
      <div class="stack-grid">
        <div class="stack-group">
          <h3 data-i18n="stack_data_ai">Dados &amp; IA</h3>
          <ul class="stack-badges">
            <li>Python</li><li>Power BI</li><li>Pandas</li><li>NumPy</li><li>OpenCV</li><li>YOLOv8/v9/v10</li>
          </ul>
        </div>
        <div class="stack-group">
          <h3 data-i18n="stack_backend">Back-end</h3>
          <ul class="stack-badges">
            <li>PHP</li><li>Node.js</li><li>MySQL</li><li>MariaDB</li>
          </ul>
        </div>
        <div class="stack-group">
          <h3 data-i18n="stack_frontend">Front-end</h3>
          <ul class="stack-badges">
            <li>JavaScript</li><li>React</li><li>HTML5</li><li>CSS</li><li>Flutter</li>
          </ul>
        </div>
        <div class="stack-group">
          <h3 data-i18n="stack_tools">Ferramentas</h3>
          <ul class="stack-badges">
            <li>Git</li><li>GitHub</li><li>VS Code</li><li>Google Colab</li><li>Claude Code</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="projects" class="section">
      <h2 data-i18n="projects_heading">Projetos</h2>
      <div id="projects-container" class="projects-grid"></div>
    </section>

    <section id="contact" class="section">
      <h2 data-i18n="contact_heading">Contato</h2>
      <p data-i18n="contact_text">Aberto a conexões, colaborações e novos desafios em Dados, IA e Desenvolvimento.</p>
      <div class="contact-links">
        <a href="mailto:elton.baarbosa@gmail.com">Gmail</a>
        <a href="https://www.linkedin.com/in/eltonsilvabarbosa/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://github.com/eltonbarbosaa" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.instagram.com/eltonbarbosa__" target="_blank" rel="noopener">Instagram</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p data-i18n="footer_text">Feito por Elton Barbosa</p>
  </footer>

  <script src="i18n.js"></script>
  <script src="projects.js"></script>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify every `data-i18n` key used in the HTML exists in `i18n.js`**

Run:
```bash
grep -o 'data-i18n="[a-z_]*"' index.html | sed -E 's/data-i18n="(.*)"/\1/' | sort -u > /tmp/html_keys.txt
node -e "console.log(Object.keys(require('./i18n.js').pt).sort().join('\n'))" > /tmp/i18n_keys.txt
diff /tmp/html_keys.txt /tmp/i18n_keys.txt
```
Expected: no output from `diff` (every key used in the HTML is defined in `i18n.js`; `i18n.js` may define no keys beyond what's used).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add portfolio page structure"
```

---

### Task 5: Core behavior script

**Files:**
- Create: `script.js`

**Interfaces:**
- Consumes: global `i18n` object (Task 2), global `projects` array (Task 3), DOM elements `#lang-toggle`, `#projects-container`, and every `[data-i18n]` element (Task 4).
- Produces: on `DOMContentLoaded`, applies the persisted (or default `pt`) language to all `[data-i18n]` elements and renders project cards into `#projects-container`. No exports — this is the page's entry script, loaded last.

- [ ] **Step 1: Create `script.js`**

```javascript
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
      link.textContent = lang === "pt" ? "Ver no GitHub" : "View on GitHub";
      card.appendChild(link);

      container.appendChild(card);
    });
  }

  function init() {
    applyLanguage(getInitialLang());
    document.getElementById("lang-toggle").addEventListener("click", () => {
      const current = localStorage.getItem(STORAGE_KEY) || "pt";
      applyLanguage(current === "pt" ? "en" : "pt");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
```

- [ ] **Step 2: Check for JS syntax errors**

Run: `node --check script.js`
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "Add language toggle and project rendering logic"
```

---

### Task 6: Styling

**Files:**
- Create: `styles.css`

**Interfaces:**
- Consumes: class names and ids defined in `index.html` (Task 4) and `script.js` (Task 5): `.site-header`, `.nav`, `.nav-brand`, `.nav-links`, `#lang-toggle`, `.hero`, `.hero-greeting`, `.hero-name`, `.hero-title`, `.hero-cta`, `.btn`, `.btn-primary`, `.btn-secondary`, `.section`, `.experience-card`, `.experience-company`, `.experience-period`, `.stack-grid`, `.stack-group`, `.stack-badges`, `.projects-grid`, `.project-card`, `.project-card-highlight`, `.project-tags`, `.project-link`, `.contact-links`, `.site-footer`.
- Produces: dark minimalist responsive theme (no other file depends on this file's internals beyond the selectors above).

- [ ] **Step 1: Create `styles.css`**

```css
:root {
  --bg: #0d1117;
  --bg-alt: #161b22;
  --text: #c9d1d9;
  --text-muted: #8b949e;
  --accent: #58a6ff;
  --border: #30363d;
  --font-mono: "Fira Code", "Consolas", monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.site-header {
  position: sticky;
  top: 0;
  background: var(--bg-alt);
  border-bottom: 1px solid var(--border);
  z-index: 10;
}

.nav {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.nav-brand { font-family: var(--font-mono); font-weight: 700; }

.nav-links { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.nav-links a { color: var(--text); font-size: 0.9rem; }
.nav-links a:hover { color: var(--accent); }

#lang-toggle {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-family: var(--font-mono);
  cursor: pointer;
}
#lang-toggle:hover { border-color: var(--accent); color: var(--accent); }

.hero {
  max-width: 960px;
  margin: 0 auto;
  padding: 5rem 1.5rem 4rem;
  text-align: left;
}

.hero-greeting { color: var(--accent); font-family: var(--font-mono); }
.hero-name { font-size: 2.75rem; margin: 0.25rem 0; }
.hero-title { color: var(--text-muted); font-size: 1.15rem; margin-bottom: 1.5rem; }

.hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  border: 1px solid var(--border);
}
.btn-primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.btn-primary:hover { text-decoration: none; opacity: 0.9; }
.btn-secondary { color: var(--text); }
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

.section {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  border-top: 1px solid var(--border);
}

.section h2 {
  font-family: var(--font-mono);
  color: var(--accent);
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

.experience-card {
  background: var(--bg-alt);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.5rem;
}
.experience-company { color: var(--accent); font-weight: 600; margin-top: 0.25rem; }
.experience-period { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem; }

.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.stack-group h3 { font-size: 1rem; margin-bottom: 0.5rem; color: var(--text); }
.stack-badges { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.stack-badges li {
  background: var(--bg-alt);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-family: var(--font-mono);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}
.project-card {
  background: var(--bg-alt);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.project-card-highlight { border-color: var(--accent); }
.project-card h3 { font-size: 1.05rem; }
.project-card p { color: var(--text-muted); font-size: 0.9rem; flex-grow: 1; }
.project-tags { list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; }
.project-tags li {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.15rem 0.45rem;
}
.project-link { font-size: 0.85rem; font-family: var(--font-mono); }

.contact-links { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-top: 1rem; }
.contact-links a {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-family: var(--font-mono);
  color: var(--text);
}
.contact-links a:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

.site-footer {
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 600px) {
  .hero-name { font-size: 2rem; }
  .nav { flex-direction: column; align-items: flex-start; }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add dark minimalist responsive styling"
```

---

### Task 7: Manual verification pass

**Files:** none (verification only, no code changes expected)

**Interfaces:**
- Consumes: the fully assembled site from Tasks 1-6.
- Produces: confirmation the site works end-to-end before deploy (Task 8). If any check fails, fix the relevant file from Tasks 4-6 and re-run this task's checks.

- [ ] **Step 1: Start a local static server**

Run: `python -m http.server 8000` (from the project root, in a background/separate terminal)

- [ ] **Step 2: Fetch the page and confirm default (PT) content renders**

Run: `curl -s http://localhost:8000/ | grep -o 'Engenheiro de Planejamento'`
Expected: `Engenheiro de Planejamento` printed at least once (from the `data-i18n` fallback text in `index.html`)

- [ ] **Step 3: Confirm all four project links are present in the static HTML source for `script.js`/`projects.js`**

Run: `grep -c 'https://github.com/eltonbarbosaa/' projects.js`
Expected: `4`

- [ ] **Step 4: Open `http://localhost:8000/` in a real browser and manually confirm:**
  - Clicking the `EN`/`PT` button in the header toggles all visible text (nav, hero, about, experience, stack headings, projects heading, contact) and the 4 project cards' title/description/button label.
  - The 4 project cards render under "Projetos"/"Projects" with correct titles and working "Ver no GitHub"/"View on GitHub" links.
  - Resizing the window to a narrow (mobile) width keeps the nav, hero, stack grid, and project grid readable with no horizontal overflow.
  - Browser console (DevTools) shows no errors.

- [ ] **Step 5: Stop the local server**

Run: `Ctrl+C` in the terminal running `python -m http.server`

- [ ] **Step 6: No commit needed for this task** (verification only; if fixes were required, commit those under the relevant task's file scope with message `fix: <what was wrong>`)

---

### Task 8: Create GitHub repo and deploy via GitHub Pages

**Files:** none (repo/infra operations only)

**Interfaces:**
- Consumes: the local git repo with all commits from Tasks 1-6.
- Produces: a public GitHub repo `eltonbarbosaa/eltonbarbosaa.github.io` with the `main` branch pushed and GitHub Pages enabled, serving the site at `https://eltonbarbosaa.github.io`.

- [ ] **Step 1: Ensure the local branch is named `main`**

Run: `git branch -M main`

- [ ] **Step 2: Create the GitHub repository (public, matching the exact required name)**

Run: `gh repo create eltonbarbosaa/eltonbarbosaa.github.io --public --source=. --remote=origin --description "Portfolio pessoal de Elton Barbosa"`
Expected: repo created, `origin` remote added

- [ ] **Step 3: Push `main` to GitHub**

Run: `git push -u origin main`
Expected: push succeeds, no errors

- [ ] **Step 4: Enable GitHub Pages from the `main` branch, root folder**

Run: `gh api -X POST repos/eltonbarbosaa/eltonbarbosaa.github.io/pages -f "source[branch]=main" -f "source[path]=/"`
Expected: JSON response with `"status"` field (Pages build queued). If it returns a 409 (already enabled), that's fine — Pages is already on.

- [ ] **Step 5: Verify the site is live**

Run: `curl -s -o /dev/null -w "%{http_code}" https://eltonbarbosaa.github.io`
Expected: `200` (may take 1-2 minutes after Step 4 for the first deploy to finish — if it returns `404`, wait ~60s and retry)

- [ ] **Step 6: No commit needed** (this task is deploy/infra only)
