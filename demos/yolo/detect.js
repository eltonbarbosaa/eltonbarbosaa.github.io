// demos/yolo/detect.js
(function () {
  const MODEL_URL = "model.onnx";
  const INPUT_SIZE = 640;
  const NUM_CLASSES = 3;
  const CONF_THRESHOLD = 0.4;
  const IOU_THRESHOLD = 0.45;
  const LANG_KEY = "site-lang";
  const CLASS_COLORS = { casco: "#8b5cf6", gorro: "#06b6d4", pistola: "#f87171" };

  let session = null;
  let currentLang = "pt";

  function getInitialLang() {
    const stored = localStorage.getItem(LANG_KEY);
    return stored === "en" ? "en" : "pt";
  }

  function applyDemoLanguage(lang) {
    currentLang = lang;
    const dict = i18n[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.getElementById("lang-toggle").textContent = lang === "pt" ? "EN" : "PT";
  }

  function setStatus(message) {
    document.getElementById("status-message").textContent = message || "";
  }

  function showError(key) {
    const el = document.getElementById("error-message");
    el.textContent = i18n[currentLang][key] || key;
    el.hidden = false;
  }

  function hideError() {
    document.getElementById("error-message").hidden = true;
  }

  async function loadModel() {
    setStatus(i18n[currentLang].yolo_demo_loading);
    session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] });
    setStatus("");
    const input = document.getElementById("image-input");
    const label = document.getElementById("upload-label");
    input.disabled = false;
    label.classList.remove("btn-loading");
  }

  function letterboxImageToCanvas(img) {
    const info = YoloPostprocess.computeLetterbox(img.naturalWidth, img.naturalHeight, INPUT_SIZE);
    const canvas = document.createElement("canvas");
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(114,114,114)";
    ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, info.padX, info.padY, info.newWidth, info.newHeight);
    return { canvas, info };
  }

  function canvasToTensor(canvas) {
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
    const plane = INPUT_SIZE * INPUT_SIZE;
    for (let i = 0; i < plane; i++) {
      floatData[i] = data[i * 4] / 255;
      floatData[plane + i] = data[i * 4 + 1] / 255;
      floatData[2 * plane + i] = data[i * 4 + 2] / 255;
    }
    return new ort.Tensor("float32", floatData, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  }

  function drawResults(originalImg, detections) {
    const canvas = document.getElementById("result-canvas");
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(originalImg, 0, 0);
    ctx.lineWidth = Math.max(2, originalImg.naturalWidth / 300);
    ctx.font = `${Math.max(14, Math.round(originalImg.naturalWidth / 60))}px monospace`;
    ctx.textBaseline = "top";

    detections.forEach((det) => {
      const color = CLASS_COLORS[det.className] || "#e2e8f0";
      ctx.strokeStyle = color;
      ctx.strokeRect(det.x1, det.y1, det.x2 - det.x1, det.y2 - det.y1);
      const label = `${det.className} ${(det.confidence * 100).toFixed(0)}%`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = color;
      ctx.fillRect(det.x1, Math.max(0, det.y1 - 20), textWidth + 8, 20);
      ctx.fillStyle = "#0b0d17";
      ctx.fillText(label, det.x1 + 4, Math.max(0, det.y1 - 18));
    });
  }

  function renderResultsList(detections) {
    const list = document.getElementById("results-list");
    list.innerHTML = "";
    if (detections.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = i18n[currentLang].yolo_demo_no_detections;
      list.appendChild(empty);
      return;
    }
    detections.forEach((det) => {
      const item = document.createElement("li");
      const label = i18n[currentLang]["yolo_class_" + det.className] || det.className;
      item.textContent = `${label} — ${(det.confidence * 100).toFixed(0)}%`;
      list.appendChild(item);
    });
  }

  async function runDetection(img) {
    hideError();
    setStatus(i18n[currentLang].yolo_demo_processing);
    const { canvas, info } = letterboxImageToCanvas(img);
    const tensor = canvasToTensor(canvas);
    const feeds = {};
    feeds[session.inputNames[0]] = tensor;
    const output = await session.run(feeds);
    const raw = output[session.outputNames[0]];
    const numBoxes = raw.dims[2];
    const detections = YoloPostprocess.decodeDetections(raw.data, numBoxes, NUM_CLASSES, info, CONF_THRESHOLD);
    const kept = YoloPostprocess.nms(detections, IOU_THRESHOLD);
    drawResults(img, kept);
    renderResultsList(kept);
    setStatus("");
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showError("yolo_demo_error_invalid_file");
      return;
    }
    hideError();
    const img = new Image();
    img.onload = () => {
      runDetection(img).catch((err) => {
        console.error(err);
        showError("yolo_demo_error_generic");
      });
    };
    img.onerror = () => showError("yolo_demo_error_invalid_file");
    img.src = URL.createObjectURL(file);
  }

  function init() {
    applyDemoLanguage(getInitialLang());

    document.getElementById("lang-toggle").addEventListener("click", () => {
      const next = currentLang === "pt" ? "en" : "pt";
      localStorage.setItem(LANG_KEY, next);
      applyDemoLanguage(next);
    });

    document.getElementById("image-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      handleFile(file);
    });

    if (typeof ort === "undefined") {
      showError("yolo_demo_error_no_wasm");
      return;
    }

    loadModel().catch((err) => {
      console.error(err);
      showError("yolo_demo_error_generic");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
