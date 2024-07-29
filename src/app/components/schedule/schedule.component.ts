import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [
    CommonModule
  ],
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  days: string[] = [];
  timeSlots: { value: string, display: string }[] = [];
  meetings = [
    { date: '2024-07-29', startTime: '07:30', endTime: '08:00', title: 'Meeting 1', person: 'Addie' },
    { date: '2024-07-29', startTime: '08:00', endTime: '09:00 ', title: 'Ashley', person: 'Addie' },
    { date: '2024-07-29', startTime: '13:00', endTime: '13:30 ', title: 'Dr Moon', person: 'Mitchelle' },
    { date: '2024-07-29', startTime: '12:00', endTime: '14:00 ', title: 'Anne', person: 'Addie' },
    // Add more meetings as needed
  ];
  daysToJumpOnArrowClick: number = 7;
  startDate = this.getClosestMonday();

  personColors: { [key: string]: string } = {};

  ngOnInit() {
    this.assignColors();
    this.generateDays();
    this.generateTimeSlots();
  }

  assignColors() {
    const uniquePersons = [...new Set(this.meetings.map(meeting => meeting.person))];
    uniquePersons.forEach(person => {
      this.personColors[person] = this.getRandomColor();
    });
  }

  getShade(color: string, index: number): string {
    const shadeFactor = 0.05 // Factor to control shade intensity
    return this.mixWithWhite(color, shadeFactor * index);
  }

  mixWithWhite(color: string, factor: number): string {
    const num = parseInt(color.slice(1), 16);
    const R = (num >> 16) * (1 - factor) + 255 * factor;
    const G = (num >> 8 & 0x00FF) * (1 - factor) + 255 * factor;
    const B = (num & 0x0000FF) * (1 - factor) + 255 * factor;
    return `#${(
      0x1000000 +
      Math.round(R) * 0x10000 +
      Math.round(G) * 0x100 +
      Math.round(B)
    ).toString(16).slice(1)}`;
  }

  generateDays() {
    for (let i = 0; i < 5; i++) {
      const currentDate: Date = new Date(this.startDate);
      currentDate.setDate(this.startDate.getDate() + i);
      currentDate.setHours(12);
      this.days.push(this.formatDate(currentDate));
    }
  }

  generateTimeSlots() {
    const startHours: number = 7;
    const endHours: number = 17;
    const startTime: Date = new Date();
    startTime.setHours(startHours, 0, 0);
    const endTime: Date = new Date(startTime);
    endTime.setHours(endHours, 0, 0);

    while (startTime < endTime) {
      this.timeSlots.push({
        value: this.formatTime(startTime),
        display: this.formatTime(startTime, false)
      });
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
  }

  formatTime(date: Date, is24Hour: boolean = true): string {
    const hours: number = is24Hour ? date.getHours() : (date.getHours() % 12 || 12);
    const minutes: string = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getMeetingsForTime(day: string, slotIndex: number) {
    const slotTime: string = this.timeSlots[slotIndex].value;
    const [slotHour, slotMinute] = slotTime.split(':');
    const slotDate = new Date(day);
    slotDate.setHours(parseInt(slotHour), parseInt(slotMinute));

    const meetings = this.meetings.filter(meeting => {
      if (meeting.date !== day) return false;

      const [startHour, startMinute] = meeting.startTime.split(/[: ]/);
      const [endHour, endMinute] = meeting.endTime.split(/[: ]/);

      const startDate = new Date(day);
      startDate.setHours(parseInt(startHour), parseInt(startMinute));

      const endDate = new Date(day);
      endDate.setHours(parseInt(endHour), parseInt(endMinute));

      return startDate <= slotDate && slotDate < endDate;
    });
    return meetings;
  }

  getMeetingTop(startTime: string, slotIndex: number): number {
    const [hours, minutes] = startTime.split(':').map(Number);
    return ((hours % 12) * 60 + minutes) - (slotIndex * 30);
  }

  getMeetingHeight(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes: number = (startHours * 60) + startMinutes;
    const endTotalMinutes: number = (endHours * 60) + endMinutes;
    return endTotalMinutes - startTotalMinutes;
  }

  formatDate(date: Date): string {
    const year: number = date.getUTCFullYear();
    const month: string = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day: string = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  backwardArrowClick(): void {
    this.startDate.setDate(this.startDate.getDate() - this.daysToJumpOnArrowClick);
    this.resetAndGenerateDays();
  }

  forwardArrowClick(): void {
    this.startDate.setDate(this.startDate.getDate() + this.daysToJumpOnArrowClick);
    this.resetAndGenerateDays();
  }

  resetAndGenerateDays(): void {
    this.days = [];
    this.generateDays();
  }

  getClosestMonday(): Date {
    let currentDate = new Date();
    currentDate.setUTCHours(12, 0, 0, 0);

    let dayOfWeek = currentDate.getUTCDay();
    let difference = (dayOfWeek == 0) ? 1 : 8 - dayOfWeek;

    currentDate.setUTCDate(currentDate.getUTCDate() + difference);

    return currentDate;
  }

  getRandomColor(): string {
    const h = Math.floor(Math.random() * 360); // Hue: 0 to 360
    const s = Math.floor(Math.random() * 50) + 50; // Saturation: 50% to 100%
    const l = Math.floor(Math.random() * 20) + 50; // Lightness: 50% to 70%
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
