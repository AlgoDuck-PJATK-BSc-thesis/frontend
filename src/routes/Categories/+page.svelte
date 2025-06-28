<script lang="ts">
  import { goto } from '$app/navigation';
  import { parseOptionalDimensions } from "../../Utils/index";
  
  
  let scrollableFrame : HTMLElement;

  const scrollableFrameComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!scrollableFrame) return undefined;
    return getComputedStyle(scrollableFrame);
  });


  let main : HTMLElement;

  const mainComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!main) return undefined;
    return getComputedStyle(main);
  });



  let lastXCoords : number;
  let currXCoords : number;

  let lastD1X : number;
  let lastTime : number = 0;

  let cancellationToken : number | null = null;
  let isDragging : boolean = $state(false); 
  
  const updateBasedOnMouse = (x : number) => {
    const dx : number = x - lastXCoords;

    const newLeft : number = parseOptionalDimensions(scrollableFrameComputedStyle?.left) + dx
    const maxLeft : number = parseOptionalDimensions(scrollableFrameComputedStyle?.width) - parseOptionalDimensions(mainComputedStyle?.width);
    if (newLeft < 0 && Math.abs(newLeft) < maxLeft){
      scrollableFrame.style.left = `${newLeft}px`
    }

  }
  
  const animateDragged = (currentTime : number) => {
    if (!isDragging) {
      cancellationToken = null;
      return; 
    }
    
    const deltaTime = (currentTime - lastTime) / 1000;
    
    if (deltaTime > 0 && lastTime !== 0) { 
      const d1x = (currXCoords - lastXCoords) / deltaTime;
      
      updateBasedOnMouse(currXCoords);
      
      lastXCoords = currXCoords;
      lastD1X = d1x;
    }
    
    lastTime = currentTime; 
    cancellationToken = requestAnimationFrame(animateDragged); 
  }
  
  const handleDragged = (e: MouseEvent) => {
    isDragging = true;
    currXCoords = e.x;
  }
  
  
  const bleedSpeed = () => {
    if (Math.abs(lastD1X) < 10) {
      cancellationToken = null;
      return;
    }
    const dtxDampened = lastD1X / 100;

    const left = parseOptionalDimensions(scrollableFrameComputedStyle?.left);
    const newLeft = left + dtxDampened;
    const maxLeft = parseOptionalDimensions(scrollableFrameComputedStyle?.width) - parseOptionalDimensions(mainComputedStyle?.width);
    
    if (newLeft <= 0 && Math.abs(newLeft) <= maxLeft) {
      scrollableFrame.style.left = `${newLeft}px`;
    } else {
      cancellationToken = null;
      return;
    }

    lastD1X *= 0.95;
     
    cancellationToken = requestAnimationFrame(bleedSpeed);
  }

  const handleMouseUp = () => {
    document.body.style.userSelect = "auto";

    isDragging = false;
    
    if (cancellationToken) {
      cancelAnimationFrame(cancellationToken);
      cancellationToken = null;
    }
    
    if (Math.abs(lastD1X) > 50) {
      cancellationToken = requestAnimationFrame(bleedSpeed);
    }
    
    document.removeEventListener('mousemove', handleDragged);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  const handleMouseDown = (e : MouseEvent) => {
    document.body.style.userSelect = "none"; 
    if (cancellationToken) {
      cancelAnimationFrame(cancellationToken);
      cancellationToken = null;
    }

    isDragging = true; 
    lastXCoords = e.x;
    currXCoords = e.x;
    lastD1X = 0;
    lastTime = 0;
    
    document.addEventListener('mousemove', handleDragged);
    document.addEventListener('mouseup', handleMouseUp);
    
    cancellationToken = requestAnimationFrame(animateDragged);
  }

</script>

<main bind:this={main} class="w-full h-[80vh] relative rounded-2xl overflow-hidden">
  <div bind:this={scrollableFrame}  role="button" tabindex="0" class="w-[300%] hover:cursor-grab active:cursor-grabbing h-full absolute flex justify-between bg-blue-900 bg-repeat-x bg-no-repeat-y bg-[length:auto_100%]"
    onmousedown={handleMouseDown}
    onmouseup={handleMouseUp}
  >
  {#each [...Array(10).keys()] as i}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="w-100 h-100 my-50 rounded-full flex hover:cursor-pointer justify-center items-center bg-transparent" onclick={()=>{
      
      goto(`/Categories/some-${i}/Problems`);
    }}
    onmousedown={()=>{
      if (isDragging){
      }
    }}>
      <img class="w-80 h-80" src="/island-sample.png" alt="category thematic island" draggable="false"/>
    </div>
  {/each}
  </div>
</main>