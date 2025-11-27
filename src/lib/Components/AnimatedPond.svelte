<script lang="ts">
	import { onMount } from "svelte";
	import { userThemePreference } from "$lib/stores/theme.svelte";

  let { userDucks }: { userDucks: {id: string}[] } = $props();

  interface rgba {
    r: number,
    g: number,
    b: number,
    a: number,
  }

  const shoreColor: rgba = {
    r: 0,
    g: 0,
    b: 0,
    a: 255,
  }
  
  interface duckPositionalData {
    x: number,
    y: number,
    transformX: number,
    transformY: number,
    dirAngle: number,
    newTargetAngle: number,
    frameCounter: number,
    sameDirectionFrameCount: number,
  }


  let canvas: HTMLCanvasElement | null = $state(null);
  let workCanvas: HTMLCanvasElement | null = $state(null);

  let canvasComputedStyle: CSSStyleDeclaration | null = $derived.by(()=>{
    if (!canvas) return null;
    return getComputedStyle(canvas);
  });

  let ctx: CanvasRenderingContext2D | null;
  let workCtx: CanvasRenderingContext2D | null;

  let imageIsLoaded: boolean = $state(false);
  let workCanvasPixelData: ImageData | null = null;

  const colorBatchSampleSize: number = 3;
  const colorSampleOffset: number = (colorBatchSampleSize - 1) / 2;
  const duckSize: number = 100;
  const halfDuckSize: number = Math.floor(duckSize / 2);

  const duckCanvases: Array<HTMLCanvasElement> = $state([]);
  const duckPositionalDataArr: Array<duckPositionalData> = $state([]);

  const numOfRays: number = 16;
  const rayAngle: number = (2 * Math.PI) / numOfRays;
  const forwardMovementBiasStrength: number = 0.1;
  const duckVel: number = 0.6;

  const flip: boolean = false;

  const RAYCAST_INTERVAL: number = 5; 

  const cloudfrontDistributionDomainName: string = "d3018wbyyxg1xc.cloudfront.net";

  const wrapDuckIdInHttpsCloudfrontCall = (duckId: string) : string => {
    return `https://${cloudfrontDistributionDomainName}/Ducks/Outfits/duck-${duckId}.png`
  }

  let raf: number;

  let pondPath: string = $derived(`/src/lib/images/ponds/${userThemePreference.theme}Pond0.png`);
  let workPondPath: string = $derived(`/src/lib/images/ponds/work-pond.png`);

  $inspect(pondPath);

  $effect(()=>{ // gruesome
    pondPath = pondPath;
    workPondPath = workPondPath;
    loadPond();
    console.log("running effect");
  });


  const loadPond = () : void => {
    if (!ctx || !canvas || !workCtx || !workCanvas) return;
    
    const img: HTMLImageElement = new Image();
    const workImg: HTMLImageElement = new Image();
    
    let visualLoaded = false;
    let workLoaded = false;

    const containerWidth = canvas!.parentElement?.clientWidth || canvas!.clientWidth;
    const containerHeight = canvas!.parentElement?.clientHeight || canvas!.clientHeight;

    canvas!.width = containerWidth;
    canvas!.height = containerHeight;
    workCanvas!.width = containerWidth;
    workCanvas!.height = containerHeight;

    img.onload = () => {
      ctx!.drawImage(img, 0, 0, containerWidth, containerHeight);
      visualLoaded = true;
      if (workLoaded) imageIsLoaded = true;
    };

    workImg.onload = () => {
      workCtx!.drawImage(workImg, 0, 0, containerWidth, containerHeight);
      workCanvasPixelData = workCtx!.getImageData(0, 0, containerWidth, containerHeight);
      workLoaded = true;
      if (visualLoaded) imageIsLoaded = true;
    };

    img.src = pondPath;
    workImg.src = workPondPath;
  }

  const loadDucks = async () : Promise<void> => {
    const loadPromises: Promise<void>[] = [];
    for (let i : number = 0; i < userDucks.length; i++){
      const duckCanvas = duckCanvases[i];
      if (!duckCanvas) continue;
      
      const ctx2: CanvasRenderingContext2D | null = duckCanvas.getContext('2d');
      if (!ctx2) continue;
      
      duckCanvas.width = duckSize;
      duckCanvas.height = duckSize;

      const duckSpawnX: number = Math.floor(parseInt(canvasComputedStyle!.width.replaceAll("px", "")) / 2 - duckSize / 2) * 1
      const duckSpawnY: number = Math.floor(parseInt(canvasComputedStyle!.height.replaceAll("px", "")) / 2 - duckSize / 2) * 1

      const startingTargetAngle: number = (Math.PI * 2 / numOfRays) * Math.floor(Math.random() * numOfRays);

      duckPositionalDataArr.push({
        x: duckSpawnX,
        y: duckSpawnY,
        transformX: 0,
        transformY: 0,
        dirAngle: startingTargetAngle,
        newTargetAngle: startingTargetAngle,
        frameCounter: 0,       
        sameDirectionFrameCount: 25,
      });

      duckCanvas.style.left = `${duckSpawnX}px`;
      duckCanvas.style.top = `${duckSpawnY}px`;
      
      const loadPromise = new Promise<void>((resolve) => {
      const img2: HTMLImageElement = new Image();
      img2.onload = () => {
        ctx2.drawImage(img2, 0, 0, duckSize, duckSize);
        resolve();
      };
        img2.src = wrapDuckIdInHttpsCloudfrontCall(userDucks[i].id);
      });

      loadPromises.push(loadPromise);
    }
    await Promise.all(loadPromises);
    raf = requestAnimationFrame(animateDucks);
  }

  const samplePixel = (col: number, row: number) : Uint8ClampedArray | null => {
    if (!workCanvasPixelData || !imageIsLoaded) return null;

    const roundedCol = Math.floor(col);
    const roundedRow = Math.floor(row);

    if (roundedCol <= 0 || roundedRow <= 0 || 
        roundedCol >= workCanvas!.width - 1 || 
        roundedRow >= workCanvas!.height - 1) return null;
    
    const width = workCanvas!.width;
    const pixelIndex = (roundedRow * width + roundedCol) * 4;
    
    return workCanvasPixelData.data.slice(pixelIndex, pixelIndex + 4);
  }


  const doesPixelMatchColor = (pixel: Uint8ClampedArray, pixelInBatchIndex: number, color: rgba): boolean => {
    return pixel[pixelInBatchIndex] === color.r && 
           pixel[pixelInBatchIndex + 1] === color.g && 
           pixel[pixelInBatchIndex + 2] === color.b && 
           pixel[pixelInBatchIndex + 3] === color.a;
  }

  const rayMarch = (duckCanvas: HTMLCanvasElement): Array<number> => {
    const distances: Array<number> = Array(numOfRays).fill(0);
    const hypot: number = halfDuckSize;

    const computedStyle = getComputedStyle(duckCanvas);
    const objectCenterX: number = parseInt(computedStyle.left.replace("px", "")) + halfDuckSize;
    const objectCenterY: number = parseInt(computedStyle.top.replace("px", "")) + halfDuckSize;

    const canvasWidth = parseInt(canvasComputedStyle!.width.replace("px", ""));
    const canvasHeight = parseInt(canvasComputedStyle!.height.replace("px", ""));

    for (let i = 0; i < numOfRays; i++) {
      const currentAngle = i * rayAngle;
      let minLength = 0;
      let maxLength = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2);

      for (let iter = 0; iter < 20; iter++) { 
        const midLength = (minLength + maxLength) / 2;
        const rayX = objectCenterX + Math.cos(currentAngle) * (hypot + midLength);
        const rayY = objectCenterY + Math.sin(currentAngle) * (hypot + midLength);

        const isOutsideCanvas = rayX < 0 || rayY < 0 || rayX >= canvasWidth || rayY >= canvasHeight;
        
        let isShoreColor = false;
        if (!isOutsideCanvas) {
          const pixel = samplePixel(rayX, rayY);
          if (pixel) {
            isShoreColor = doesPixelMatchColor(pixel, 0, shoreColor);
          }
        }

        if (isOutsideCanvas || isShoreColor) {
          maxLength = midLength; 
        } else {
          minLength = midLength; 
        }
      }

      let finalLength = minLength;
      distances[i] = finalLength;
    }

    return distances;
  };


  const normalize = (arr: Array<number>) : number[] => {
    let sum: number = 0;
    for (let i = 0; i < arr.length; i++){
      sum += arr[i];
    }
    for (let i = 0; i < arr.length; i++){
      arr[i]/=sum;
    }
    return arr;
  }

  const normalize2 = (arr: Array<number>) : Array<number> => {
    if (arr.length == 0) return [];
    let max: number = Math.max(...arr);
    return arr.map(el => el /= max);
  }

  const easeInQuad = (values: number[]): number[] => {
    return values.map((x: number) => x ** 2);
  };

  const easeOutQuad = (values: number[]): number[] => {
    return values.map(x => 1 - (1 - x) ** 4);
  };

  const sumArrays = (arr1: number[], arr2: number[]) : number[] => {
    if (arr1.length !== arr2.length) return arr1;
    const arr3: number[] = [];
    for (let i = 0; i < arr1.length; ++i){
      arr3[i] = arr2[i] + arr1[i];
    }
    return arr3;
  }



  const weightedRandomSelect = (probabilities: number[]): number => {
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      sum += probabilities[i];
      if (random <= sum) {
        return i;
      }
    }

    return probabilities.length - 1;
  };


  const pickNewTargetDirection = (duckIndex: number) : void => {
    const forwardMovementBias: Array<number> = [];

    for (let i = 0; i < numOfRays; ++i){
        const angleDiff = normalizeAngle(rayAngle * i - duckPositionalDataArr[duckIndex].dirAngle);
        forwardMovementBias.push((Math.cos(angleDiff) + 1) * forwardMovementBiasStrength);
    }

    const frameDistances: Array<number> = rayMarch(duckCanvases[duckIndex]);
    const frameDistancesNormalized: Array<number> = normalize2(frameDistances);
    const frameDistancesEased: Array<number> = easeInQuad(frameDistancesNormalized);

    const movementDirectionProbabilites: number[] = sumArrays(forwardMovementBias, frameDistancesEased);
    const finalProbabilities: Array<number> = normalize(movementDirectionProbabilites);

    const selectedDirectionIndex = weightedRandomSelect(finalProbabilities);
    duckPositionalDataArr[duckIndex].newTargetAngle = selectedDirectionIndex * rayAngle;
}

  const normalizeAngle = (angle: number) : number => {
      if (angle > Math.PI) {
        angle -= 2 * Math.PI;
      } else if (angle < -Math.PI) {
        angle += 2 * Math.PI;
      }
      return angle;
  }

  const animateDucks = (): void => {
    for (let duckIndex = 0; duckIndex < userDucks.length; ++duckIndex){
      const currDuckSameDirectionFrameCount: number = duckPositionalDataArr[duckIndex].sameDirectionFrameCount;
      
      if (duckPositionalDataArr[duckIndex].frameCounter % RAYCAST_INTERVAL === 0) {
        if (duckPositionalDataArr[duckIndex].frameCounter >= currDuckSameDirectionFrameCount){
          const nextSameDirectionFrameCounter = Math.floor(Math.random() * 20) + 40;
          duckPositionalDataArr[duckIndex].sameDirectionFrameCount = nextSameDirectionFrameCounter;
          pickNewTargetDirection(duckIndex);
          duckPositionalDataArr[duckIndex].frameCounter = 0;
        }
      }
      
      const duckCanvas: HTMLCanvasElement = duckCanvases[duckIndex];
      
      const angleDiff: number = duckPositionalDataArr[duckIndex].newTargetAngle - duckPositionalDataArr[duckIndex].dirAngle;
      
      const angleStep: number = normalizeAngle(angleDiff) / currDuckSameDirectionFrameCount;
      const frameDirectionAngle: number = normalizeAngle(duckPositionalDataArr[duckIndex].dirAngle + angleStep)

      if (flip) {
        if (duckPositionalDataArr[duckIndex].newTargetAngle > Math.PI) {        
          duckCanvas.style.transform = "scaleX(-1)";
        } else {
          duckCanvas.style.transform = "scaleX(1)";
        }
      }
      
      const deltaX = Math.cos(frameDirectionAngle) * duckVel;
      const deltaY = Math.sin(frameDirectionAngle) * duckVel;

      duckPositionalDataArr[duckIndex].dirAngle = frameDirectionAngle;
      
      const newX = duckPositionalDataArr[duckIndex].x + deltaX;
      const newY = duckPositionalDataArr[duckIndex].y + deltaY;

      duckPositionalDataArr[duckIndex].x = newX;
      duckPositionalDataArr[duckIndex].y = newY;

      
      duckCanvas.style.left = `${newX}px`;
      duckCanvas.style.top = `${newY}px`;
      duckPositionalDataArr[duckIndex].frameCounter++;
    }
        
    raf = requestAnimationFrame(animateDucks);
  };

  onMount(()=>{
    ctx = canvas!.getContext('2d');
    workCtx = workCanvas!.getContext('2d');
    loadPond();
    setTimeout(loadDucks, 10);
    return () => {
      cancelAnimationFrame(raf);
    }
  });

</script>

<main class="relative w-full h-full">
  <canvas class="absolute z-10" bind:this={canvas}></canvas>
  <canvas class="absolute z-0 hidden" bind:this={workCanvas}></canvas>
  {#each userDucks as duck, i}

    <canvas class="absolute z-20 rounded-100 overflow-hidden" bind:this={duckCanvases[i]}></canvas>
  {/each}
</main>