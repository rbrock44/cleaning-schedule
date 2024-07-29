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
    let difference = (dayOfWeek == 0) ? 1 : 8 - dayOfWeek;

    currentDate.setUTCDate(currentDate.getUTCDate() + difference);

    return currentDate;
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
    startTime.setHours(startHours, 0, 0);
    const endTime: Date = new Date(startTime);
    endTime.setHours(endHours, 0, 0);

    while (startTime < endTime) {
        timeSlots.push({
            value: formatTime(startTime),
            display: formatTime(startTime, false)
        });
        startTime.setMinutes(startTime.getMinutes() + 30);
    }

    return timeSlots
}