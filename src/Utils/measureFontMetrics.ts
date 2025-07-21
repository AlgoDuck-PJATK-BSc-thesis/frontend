export const measureTextMetrics = (text: string, font: string) : TextMetrics => {
  const canvas = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D | null= canvas.getContext('2d');
  if (!ctx) throw new Error("dumbass");
  ctx.font = font;
  
  return ctx.measureText(text);
}

export const findWrappingIndices = (text: string, font: string, containerWidth: number): number[] => {
  const wrappingIndices: number[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Failed to get canvas context");
  
  ctx.font = font;
  let start = 0;

  while (start < text.length) {
    let left = start;
    let right = text.length;
    let bestFit = start;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const substr = text.substring(start, mid);
      const width = ctx.measureText(substr).width;

      if (width <= containerWidth) {
        bestFit = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (bestFit >= text.length) {
      break;
    }

    let wrapIndex = bestFit;
    while (wrapIndex > start && text[wrapIndex] !== ' ') {
      wrapIndex--;
    }

    if (wrapIndex === start) {
      break;
    }

    wrappingIndices.push(wrapIndex);
    start = wrapIndex + 1;
  }

  return wrappingIndices;
}