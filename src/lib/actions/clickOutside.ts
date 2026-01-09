export const clickOutside = (node: HTMLElement, callback: () => void) => {
    const handleClick = (event: MouseEvent) => {
        const path = event.composedPath();
        if (!path.includes(node)) {
            callback();
        }
    };
    
    document.addEventListener('click', handleClick, true);
    
    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
}