export function formatDate(date: Date): string {
    const year: number = date.getUTCFullYear();
    const month: string = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day: string = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getClosestMonday(): Date {
    let currentDate = new Date();
    currentDate.setUTCHours(12, 0, 0, 0);

    let dayOfWeek = currentDate.getUTCDay();
    let difference = (dayOfWeek == 0) ? 1 : 8 - dayOfWeek;

    currentDate.setUTCDate(currentDate.getUTCDate() + difference);

    return currentDate;
}

export function formatTime(date: Date, is24Hour: boolean = true): string {
    const hours: number = is24Hour ? date.getHours() : (date.getHours() % 12 || 12);
    const minutes: string = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
