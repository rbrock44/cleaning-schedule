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
  timeSlots: string[] = [];
  meetings = [
    { date: '2024-07-29', startTime: '07:30', endTime: '08:00', title: 'Meeting 1' },
    { date: '2024-07-29', startTime: '08:00', endTime: '09:00 ', title: 'Meeting 2' },
    // Add more meetings as needed
  ];

  ngOnInit() {
    this.generateDays();
    this.generateTimeSlots();
  }

  generateDays() {
    const startDate = new Date(Date.UTC(2024, 6, 30));
    for (let i = 0; i < 5; i++) {
      const currentDate: Date = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
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
      this.timeSlots.push(this.formatTime(startTime));
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
  }

  formatTime(date: Date): string {
    const hours: number = date.getHours();
    const minutes: string = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getMeetingsForTime(day: string, slotIndex: number) {
    const slotTime: string = this.timeSlots[slotIndex];
    const [slotHour, slotMinute] = slotTime.split(':');
    const slotDate = new Date(day);
    slotDate.setHours(parseInt(slotHour), parseInt(slotMinute));

    const meetings = this.meetings.filter(meeting => {
      if (meeting.date !== day) return false;

      const [startHour, startMinute] = meeting.startTime.split(/[: ]/);
      const [endHour, endMinute] = meeting.endTime.split(/[: ]/);

      // return meeting.date == day && meeting.startTime.indexOf(slotTime) > -1

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
}
