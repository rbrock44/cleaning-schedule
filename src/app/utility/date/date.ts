import { TimeSlot } from "../../type/meeting.type";

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

    if (dayOfWeek === 1) {
        return currentDate;
    } else {
        let difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentDate.setUTCDate(currentDate.getUTCDate() + difference);
        return currentDate;
    }
}

export function formatTime(date: Date, is24Hour: boolean = true): string {
    const hours: number = is24Hour ? date.getHours() : (date.getHours() % 12 || 12);
    const minutes: string = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function generateDays(startDate: Date): string[] {
    const days: string[] = [];

    for (let i = 0; i < 5; i++) {
        const currentDate: Date = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(12);
        days.push(formatDate(currentDate));
    }

    return days;
}
export function generateTimeSlots(): TimeSlot[] {
    const timeSlots: TimeSlot[] = [];

    const startHours: number = 7;
    const endHours: number = 17;

    const startTime: Date = new Date();
    startTime.setHours(startHours, 30, 0);
    const endTime: Date = new Date(startTime);
    endTime.setHours(endHours, 30, 0);

    while (startTime < endTime) {
        timeSlots.push({
            value: formatTime(startTime),
            display: formatTime(startTime, false)
        });
        startTime.setMinutes(startTime.getMinutes() + 30);
    }

    return timeSlots
}

export function getWeekday(index: number): string {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (index < 0 || index >= weekdays.length) {
        return 'Invalid index';
    }
    return weekdays[index];
}

export function formatMonthAndYear(dateString: string): string {
    const [year, month] = dateString.split('-');
    const date = new Date(+year, +month - 1);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function getDayWithSuffix(day: number): string {
    if (typeof day !== 'number' || day < 1 || day > 31) {
        throw new Error('Invalid day');
    }
    
    const suffixes = ["th", "st", "nd", "rd"];
    const value = day % 100;
    
    return day + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

export function parseDayWithSuffix(date: string): string {
    return getDayWithSuffix(+date.substring(8));
}
