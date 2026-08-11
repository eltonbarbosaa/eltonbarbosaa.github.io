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
