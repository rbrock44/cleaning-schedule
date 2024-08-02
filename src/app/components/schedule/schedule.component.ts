import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meeting, TimeSlot } from '../../type/meeting.type';
import { People, Shades } from '../../type/person.type';
import { getUniqueLightenedColor, getUniqueRandomColor } from '../../utility/color/color';
import { formatMonthAndYear, generateDays, generateTimeSlots, getClosestMonday, getDayWithSuffix } from '../../utility/date/date';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  defaultDropdownOption: string = 'All';
  dropdownOptions: string[] = [this.defaultDropdownOption];
  selectedValue: string = this.dropdownOptions[0];
  days: string[] = [];
  timeSlots: TimeSlot[] = [];
  allMeetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  daysToJumpOnArrowClick: number = 7;
  startDate = getClosestMonday();

  people: People = {};

  ngOnInit() {
    this.getMeetings();
    this.assignColors();
    this.days = generateDays(this.startDate);
    this.timeSlots = generateTimeSlots();
  }

  parseDayWithSuffix(date: string): string {
    return getDayWithSuffix(+date.substring(8));
  }

  getMonthBannerClassname(index: number): string {
    let widthClass = '';
    if (this.hasSecondMonth()) {
      if (index === 0) {
        const index = this.secondMonthIndex();
        switch (index) {
          case 1: widthClass = 'one'; break;
          case 2: widthClass = 'two'; break;
          case 3: widthClass = 'three'; break;
          case 4: widthClass = 'four'; break;
          default: widthClass = '';
        }
      }
    }
    return `month-banner ${widthClass}`;
  }

  getFirstMonth(): string {
    return formatMonthAndYear(this.getMonth(this.days[0]));
  }

  getSecondMonth(): string {
    return formatMonthAndYear(this.getMonth(this.days[this.days.length - 1]));
  }

  hasSecondMonth(): boolean {
    return this.getMonth(this.days[0]) !== this.getMonth(this.days[this.days.length - 1])
  }

  secondMonthIndex(): number {
    let index = 1;
    this.days.forEach((day, i) => {
      if (i != 0) {
        if (this.getMonth(this.days[i]) !== this.getMonth(this.days[i - 1])) {
          index = i;
          return;
        }
      }
    });
    return index;
  }

  isUniqueMonth(day: string, index: number): boolean {
    return index === 0 || (index > 0 && this.getMonth(day) !== this.getMonth(this.days[index - 1]))
  }

  assignColors() {
    const uniquePersons = [...new Set(this.filteredMeetings.map(meeting => meeting.person))];
    uniquePersons.forEach(person => {
      const color: string = getUniqueRandomColor(this.people);

      const shades: Shades = {}
      const uniqueTitlesPerPerson = [...new Set(this.filteredMeetings.filter(meeting => meeting.person === person).map(meeting => meeting.title))];

      uniqueTitlesPerPerson.forEach(title => {
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

    const meetings = this.filteredMeetings.filter(meeting => {
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
    if (date.length > 6) {
      return date.substring(0, 7); // Extracts the 'yyyy-MM' part
    } else {
      return ''
    }
  }

  getMeetings() {
    // TODO: wire up http call for meetings
    this.allMeetings = [
      { date: '2024-07-29', startTime: '07:30', endTime: '08:00', title: 'Meeting 1', person: 'Addie' },
      { date: '2024-07-29', startTime: '08:00', endTime: '09:00 ', title: 'Ashley', person: 'Addie' },
      { date: '2024-07-29', startTime: '13:00', endTime: '13:30 ', title: 'Dr Moon', person: 'Mitchelle' },
      { date: '2024-07-29', startTime: '12:00', endTime: '14:00 ', title: 'Anne', person: 'Addie' },
      // Add more meetings as needed
    ];

    this.filterMeetings();
  }

  filterMeetings(): void {
    const sortedPeople = Array.from(new Set(this.allMeetings.map(x => x.person))).sort();
    this.dropdownOptions = [this.defaultDropdownOption, ...sortedPeople]

    this.filteredMeetings = this.allMeetings.filter(x => {
      if (this.selectedValue == this.defaultDropdownOption) {
        return true
      } else {
        return x.person == this.selectedValue
      }
    });
  }

  meetingClick(meeting: Meeting): void {
    // TODO: load edit meeting popup
  }

  addMeeting(defaultDay: string): void {
    // TODO: load add meeting popup (or edit meeting with no meeting)
  }
}
