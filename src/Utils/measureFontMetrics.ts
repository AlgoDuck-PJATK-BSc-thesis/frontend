export const measureTextMetrics = (text: string, font: string) : TextMetrics => {
  const canvas = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D | null= canvas.getContext('2d');
  if (!ctx) throw new Error("dumbass");
  ctx.font = font;
  
  return ctx.measureText(text);
}

export const findWrappingIndices = (text: string, font: string, containerWidth: number) : number[] => {
  const wrappingIndices: number[] = [];

  const canvas = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D | null= canvas.getContext('2d');
  if (!ctx) throw new Error("dumbass");
  ctx.font = font;

  let start = 0;
  let end = text.length;

  while (start < end){
    let mid : number = Math.floor((start + end) / 2);
    let prevMid: number = 0;
    
    let subStr: string;
    let subStrWidth : TextMetrics;

    while (prevMid != mid){
      prevMid = mid;
      subStr = text.substring(start, mid);
      subStrWidth = ctx.measureText(subStr);
      if (subStrWidth.width > containerWidth){
        end = mid - 2;
        mid = Math.floor((start + end) / 2);
      }else{
        mid += Math.floor((end - mid) / 2) + 1;
      }
    }

    if (mid + 1 <= text.length){
      let firstSpace: number = mid;
      while (text.at(firstSpace) !== ' '){
        firstSpace--;
      }
      wrappingIndices.push(firstSpace);
      start = firstSpace + 1;
    }else{
      start = mid + 1;
    }
    end = text.length;
  }
  return wrappingIndices;
}