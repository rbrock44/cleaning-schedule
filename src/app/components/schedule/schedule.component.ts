import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meeting, TimeSlot } from '../../type/meeting.type';
import { People, Shades } from '../../type/person.type';
import { getUniqueLightenedColor, getUniqueRandomColor } from '../../utility/color/color';
import { generateDays, generateTimeSlots, getClosestMonday } from '../../utility/date/date';

@Component({
  standalone: true,
  imports: [
    CommonModule,
  ],
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  days: string[] = [];
  timeSlots: TimeSlot[] = [];
  meetings: Meeting[] = [];
  daysToJumpOnArrowClick: number = 7;
  startDate = getClosestMonday();

  people: People = {};

  ngOnInit() {
    this.getMeetings();
    this.assignColors();
    this.days = generateDays(this.startDate);
    this.timeSlots = generateTimeSlots();
  }

  assignColors() {
    const uniquePersons = [...new Set(this.meetings.map(meeting => meeting.person))];
    uniquePersons.forEach(person => {
      const color: string = getUniqueRandomColor(this.people);

      const shades: Shades = {}
      const uniqueTitlesPerPerson = [...new Set(this.meetings.filter(meeting => meeting.person === person).map(meeting => meeting.title))];

      uniqueTitlesPerPerson.forEach( title => {
        shades[title] = getUniqueLightenedColor(shades, color);
      });

      this.people[person] = {
        color: color,
        shades: shades
      };
    });
  }

  getShadeForMeeting(meeting: Meeting) {
    return this.people[meeting.person].shades[meeting.title];
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

  backwardArrowClick(): void {
    this.startDate.setDate(this.startDate.getDate() - this.daysToJumpOnArrowClick);
    this.resetAndGenerateDays();
  }

  forwardArrowClick(): void {
    this.startDate.setDate(this.startDate.getDate() + this.daysToJumpOnArrowClick);
    this.resetAndGenerateDays();
  }

  resetAndGenerateDays(): void {
    this.days = generateDays(this.startDate);
  }

  getMonth(date: string): string {
    return date.substring(0, 6); // Extracts the 'yyyyMM' part
  }

  getMeetings() {
    // TODO: wire up http call for meetings
    this.meetings = [
      { date: '2024-07-29', startTime: '07:30', endTime: '08:00', title: 'Meeting 1', person: 'Addie' },
      { date: '2024-07-29', startTime: '08:00', endTime: '09:00 ', title: 'Ashley', person: 'Addie' },
      { date: '2024-07-29', startTime: '13:00', endTime: '13:30 ', title: 'Dr Moon', person: 'Mitchelle' },
      { date: '2024-07-29', startTime: '12:00', endTime: '14:00 ', title: 'Anne', person: 'Addie' },
      // Add more meetings as needed
    ];
  }
}
