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
  days: Date[] = [];
  timeSlots: string[] = [];
  meetings = [
    { date: '2024-07-08', startTime: '07:30', endTime: '08:00', title: 'Meeting 1' },
    { date: '2024-07-08', startTime: '08:00', endTime: '09:00', title: 'Meeting 2' },
    // Add more meetings as needed
  ];

  ngOnInit() {
    this.generateDays();
    this.generateTimeSlots();
  }

  generateDays() {
    const startDate = new Date('2024-07-08');
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      this.days.push(currentDate);
    }
  }

  generateTimeSlots() {
    const startTime = new Date();
    startTime.setHours(7, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(17, 0, 0);

    while (startTime < endTime) {
      this.timeSlots.push(this.formatTime(startTime));
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
  }

  formatTime(date: Date): string {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  }

  getMeetingsForTime(day: Date, slotIndex: number) {
    const slotTime = this.timeSlots[slotIndex];
    const dayString = day.toISOString().split('T')[0];
    return this.meetings.filter(meeting => meeting.date === dayString && meeting.startTime.startsWith(slotTime.split(' ')[0]));
  }

  getMeetingTop(startTime: string, slotIndex: number): number {
    const [hours, minutes] = startTime.split(':').map(Number);
    return ((hours % 12) * 60 + minutes) - (slotIndex * 30);
  }

  getMeetingHeight(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = (startHours * 60) + startMinutes;
    const endTotalMinutes = (endHours * 60) + endMinutes;
    return endTotalMinutes - startTotalMinutes;
  }
}
