import { Person } from "../../type/person.type";

const lightColors = [
    '#FFB6C1', '#FFB347', '#FFD700', '#98FB98', '#AFEEEE', '#ADD8E6', '#E6E6FA', '#D8BFD8', '#FF69B4', '#FF7F50',
    '#FF6347', '#FF4500', '#FFA07A', '#FFDAB9', '#FFE4B5', '#FFFACD', '#FAFAD2', '#E0FFFF', '#F0FFF0', '#F5FFFA',
    '#F0F8FF', '#F8F8FF', '#F5F5F5', '#FFF5EE', '#F5F5DC', '#FDF5E6', '#FFFAF0', '#FFFFE0', '#FFFACD', '#FFF0F5',
    '#FFE4E1', '#FFDAB9', '#FFEFD5', '#FFEBCD', '#FFE4C4', '#FFDEAD', '#FFD700', '#FFF8DC', '#FFFFF0', '#F0FFF0',
    '#F5FFFA', '#E6E6FA', '#F0F8FF', '#F8F8FF', '#F5F5F5', '#FFF5EE', '#F5F5DC', '#FDF5E6', '#FFFAF0', '#FAF0E6'
];

export function getUniqueRandomColor(people: { [name: string]: Person }): string {
    const uniqueColors = [...new Set(Object.values(people).map(person => person.color))];

    let color: string = '';

    while (color === '') {
        const newColor = getRandomColor()
        if (!uniqueColors.includes(newColor)) {
            color = getRandomColor();
        }
    }
    return color
}

export function getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * lightColors.length);
    return lightColors[randomIndex]
}

export function shadeColor(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
}


export function lightenColor(color: string, factor: number = Math.random()): string {
    const num = parseInt(color.slice(1), 16);
    const R = Math.min(255, Math.floor((num >> 16) * (1 + factor)));
    const G = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * (1 + factor)));
    const B = Math.min(255, Math.floor((num & 0x0000FF) * (1 + factor)));
    return `#${(
        0x1000000 +
        R * 0x10000 +
        G * 0x100 +
        B
    ).toString(16).slice(1)}`;
}
