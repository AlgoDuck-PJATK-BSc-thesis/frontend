class Okclh {
    private lightnessModifier: number = 0.1;
    private lightness : number;
    private chroma : number;
    private hue : number;
    constructor(value: string){
        let values: number[] = value.replaceAll('oklch(', '').replaceAll(')','').split(' ').map(s=>parseFloat(s));
        this.lightness = values[0];
        this.chroma = values[1];
        this.hue = values[2];
    }

    public getHovered(): string{
       return `okclh(${this.lightness > 0.5 ? this.lightness - this.lightnessModifier : this.lightness + this.lightnessModifier} ${this.chroma} ${this.hue})`
    }
}

class rgb {
    private r: number;
    private g: number;
    private b: number;
    private y: number;

    constructor(value: string) {
        let values: number[] = value.replaceAll('rgb(', '').replaceAll(')', '').split(',').map(s => parseFloat(s));
        this.r = values[0];
        this.g = values[1];
        this.b = values[2];
        this.y = 0.2126 * this.r + 0.7152 * this.g + 0.0722 + this.b;
    }

    public getHovered(): string{
        return this.y > 0.5 ? `rgb(${this.r - 25}, ${this.g - 25}, ${this.b - 25})` : `rgb(${this.r + 25}, ${this.g + 25}, ${this.b + 25})`;
    }
}

export class ColorHandler{
    private value: string;

    constructor(value: string) {
        this.value = value;
    }

    public getHovered(): string {
        if (this.value.startsWith('oklch')) {
            const oklch = new Okclh(this.value);
            return oklch.getHovered();
        } else if (this.value.startsWith('rgb')) {
            const rgbColor = new rgb(this.value);
            return rgbColor.getHovered();
        } else {
            console.warn(`Unsupported color format: ${this.value}`);
            return this.value; // Return original value if unsupported
        }
    }
}