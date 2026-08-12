// demos/yolo/yolo-postprocess.js
const CLASS_NAMES = ["casco", "gorro", "pistola"];

function computeLetterbox(srcWidth, srcHeight, targetSize) {
  const scale = Math.min(targetSize / srcWidth, targetSize / srcHeight);
  const newWidth = Math.round(srcWidth * scale);
  const newHeight = Math.round(srcHeight * scale);
  const padX = Math.floor((targetSize - newWidth) / 2);
  const padY = Math.floor((targetSize - newHeight) / 2);
  return { scale, newWidth, newHeight, padX, padY };
}

function iou(a, b) {
  const x1 = Math.max(a.x1, b.x1);
  const y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2);
  const y2 = Math.min(a.y2, b.y2);
  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const interArea = interW * interH;
  const areaA = (a.x2 - a.x1) * (a.y2 - a.y1);
  const areaB = (b.x2 - b.x1) * (b.y2 - b.y1);
  const union = areaA + areaB - interArea;
  return union <= 0 ? 0 : interArea / union;
}

function nms(boxes, iouThreshold) {
  const sorted = boxes.slice().sort((a, b) => b.confidence - a.confidence);
  const keep = [];
  while (sorted.length > 0) {
    const current = sorted.shift();
    keep.push(current);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (iou(current, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }
  return keep;
}

function decodeDetections(output, numBoxes, numClasses, letterboxInfo, confThreshold) {
  const results = [];
  const stride = numBoxes;
  for (let i = 0; i < numBoxes; i++) {
    let bestClass = -1;
    let bestScore = 0;
    for (let c = 0; c < numClasses; c++) {
      const score = output[(4 + c) * stride + i];
      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    }
    if (bestScore < confThreshold) continue;

    const cx = output[0 * stride + i];
    const cy = output[1 * stride + i];
    const w = output[2 * stride + i];
    const h = output[3 * stride + i];

    const x1 = cx - w / 2;
    const y1 = cy - h / 2;
    const x2 = cx + w / 2;
    const y2 = cy + h / 2;

    const { scale, padX, padY } = letterboxInfo;
    results.push({
      classId: bestClass,
      className: CLASS_NAMES[bestClass] || String(bestClass),
      confidence: bestScore,
      x1: (x1 - padX) / scale,
      y1: (y1 - padY) / scale,
      x2: (x2 - padX) / scale,
      y2: (y2 - padY) / scale,
    });
  }
  return results;
}

const YoloPostprocess = { CLASS_NAMES, computeLetterbox, iou, nms, decodeDetections };

if (typeof module !== "undefined" && module.exports) {
  module.exports = YoloPostprocess;
}
