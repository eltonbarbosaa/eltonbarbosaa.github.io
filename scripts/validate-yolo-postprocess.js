// scripts/validate-yolo-postprocess.js
const path = require("path");
const YoloPostprocess = require(path.join(__dirname, "..", "demos", "yolo", "yolo-postprocess.js"));

let failed = false;

function fail(msg) {
  console.error("FAIL: " + msg);
  failed = true;
}

function assertClose(actual, expected, tolerance, msg) {
  if (Math.abs(actual - expected) > tolerance) {
    fail(`${msg}: expected ~${expected}, got ${actual}`);
  }
}

function testComputeLetterbox() {
  const info = YoloPostprocess.computeLetterbox(1280, 720, 640);
  assertClose(info.scale, 0.5, 0.001, "letterbox scale");
  assertClose(info.newWidth, 640, 0, "letterbox newWidth");
  assertClose(info.newHeight, 360, 0, "letterbox newHeight");
  assertClose(info.padX, 0, 0, "letterbox padX");
  assertClose(info.padY, 140, 0, "letterbox padY");
}

function testIou() {
  const same = { x1: 0, y1: 0, x2: 10, y2: 10 };
  assertClose(YoloPostprocess.iou(same, same), 1, 0.001, "iou identical boxes");

  const disjoint = { x1: 100, y1: 100, x2: 110, y2: 110 };
  assertClose(YoloPostprocess.iou(same, disjoint), 0, 0.001, "iou disjoint boxes");

  const half = { x1: 5, y1: 0, x2: 15, y2: 10 };
  assertClose(YoloPostprocess.iou(same, half), 1 / 3, 0.001, "iou half-overlap boxes");
}

function testNms() {
  const boxA = { x1: 0, y1: 0, x2: 10, y2: 10, confidence: 0.9 };
  const boxB = { x1: 1, y1: 1, x2: 11, y2: 11, confidence: 0.5 };
  const boxC = { x1: 100, y1: 100, x2: 110, y2: 110, confidence: 0.6 };

  const kept = YoloPostprocess.nms([boxA, boxB, boxC], 0.45);
  if (kept.length !== 2) {
    fail(`nms: expected 2 kept boxes, got ${kept.length}`);
  }
  if (!kept.includes(boxA)) fail("nms: expected boxA (higher confidence) to survive");
  if (kept.includes(boxB)) fail("nms: expected boxB (overlapping, lower confidence) to be suppressed");
  if (!kept.includes(boxC)) fail("nms: expected boxC (non-overlapping) to survive");
}

function testDecodeDetections() {
  const numBoxes = 2;
  const numClasses = 3;
  const output = [
    100, 500,
    100, 500,
    50, 20,
    50, 20,
    0.9, 0.1,
    0.05, 0.05,
    0.02, 0.05,
  ];
  const letterboxInfo = { scale: 1, padX: 0, padY: 0 };
  const detections = YoloPostprocess.decodeDetections(output, numBoxes, numClasses, letterboxInfo, 0.4);

  if (detections.length !== 1) {
    fail(`decodeDetections: expected 1 detection above threshold, got ${detections.length}`);
    return;
  }
  const det = detections[0];
  if (det.className !== "casco") fail(`decodeDetections: expected className 'casco', got '${det.className}'`);
  assertClose(det.confidence, 0.9, 0.001, "decodeDetections confidence");
  assertClose(det.x1, 75, 0.001, "decodeDetections x1");
  assertClose(det.y1, 75, 0.001, "decodeDetections y1");
  assertClose(det.x2, 125, 0.001, "decodeDetections x2");
  assertClose(det.y2, 125, 0.001, "decodeDetections y2");
}

testComputeLetterbox();
testIou();
testNms();
testDecodeDetections();

if (failed) {
  console.error("\nValidation failed.");
  process.exitCode = 1;
} else {
  console.log("OK: yolo-postprocess validated (letterbox, iou, nms, decodeDetections)");
}
