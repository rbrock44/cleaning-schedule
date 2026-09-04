import {CommonModule} from '@angular/common';
import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MeetingPopupComponent} from '../meeting-popup/meeting-popup.component';
import {Meeting, TimeSlot} from '../../type/meeting.type';
import {People} from '../../type/person.type';
import {
  formatMonthAndYear,
  generateDays,
  generateTimeSlots,
  getClosestMonday,
  getDayWithSuffix
} from '../../utility/date/date';
import {
  assignColors,
  buildPersonDropdownOptions,
  filterMeetingsByPerson,
  formatMeetingTimeRange,
  formatTimeForDisplay,
  getDistinctSortedPeople,
  getFirstMonth,
  getMeetingHeight,
  getMeetingTop,
  getMeetingsForDay,
  getMeetingsForTime,
  getMonth,
  getMonthBannerClassname,
  getSecondMonth,
  getShadeForMeeting,
  hasSecondMonth,
  isMonthChange,
  isUniqueMonth,
  secondMonthIndex
} from '../../utility/schedule/schedule';
import {addMeeting, deleteMeeting, editMeeting, getAllMeetings} from "../../services/meetingService";

@Component({
    imports: [
        CommonModule,
        FormsModule,
        MeetingPopupComponent,
    ],
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild('meetingPopup') meetingPopup!: MeetingPopupComponent;
  isMobile: boolean = (typeof window != 'undefined') && window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  defaultDropdownOption: string = 'All';
  personDropdownOptions: string[] = [this.defaultDropdownOption];
  selectedValue: string = this.personDropdownOptions[0];
  days: string[] = [];
  timeSlots: TimeSlot[] = [];
  allMeetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  daysToJumpOnArrowClick: number = 7;
  startDate = getClosestMonday();

  people: People = {};

  loading: boolean = false;

  ngOnInit() {
    this.days = generateDays(this.startDate);
    this.timeSlots = generateTimeSlots();
    this.setup().then(() => {});
  }

  async setup(): Promise<void> {
    this.loading = true;
    await this.getMeetings();
    this.assignColors();

    this.loading = false;
  }

  getMeetingsForDay(day: string) {
    return getMeetingsForDay(this.filteredMeetings, day);
  }

  isMonthChange(index: number): boolean {
    return isMonthChange(this.days, index);
  }

  getMonthForDay(day: string): string {
    return formatMonthAndYear(day);
  }

  parseDayWithSuffix(date: string): string {
    return getDayWithSuffix(+date.substring(8));
  }

  getMonthBannerClassname(index: number): string {
    return getMonthBannerClassname(this.days, index);
  }

  getFirstMonth(): string {
    return getFirstMonth(this.days);
  }

  getSecondMonth(): string {
    return getSecondMonth(this.days);
  }

  hasSecondMonth(): boolean {
    return hasSecondMonth(this.days);
  }

  secondMonthIndex(): number {
    return secondMonthIndex(this.days);
  }

  isUniqueMonth(day: string, index: number): boolean {
    return isUniqueMonth(this.days, day, index);
  }

  assignColors() {
    this.people = assignColors(this.allMeetings, this.filteredMeetings);
  }

  getShadeForMeeting(meeting: Meeting) {
    return getShadeForMeeting(this.people, meeting);
  }

  getMeetingsForTime(day: string, slotIndex: number) {
    return getMeetingsForTime(this.filteredMeetings, this.timeSlots, day, slotIndex);
  }

  getMeetingTop(startTime: string, slotIndex: number): number {
    return getMeetingTop(startTime, slotIndex);
  }

  getMeetingHeight(startTime: string, endTime: string, isMobile = false): number {
    return getMeetingHeight(startTime, endTime, isMobile);
  }

  formatTimeForDisplay(time: string): string {
    return formatTimeForDisplay(time);
  }

  formatMeetingTimeRange(startTime: string, endTime: string): string {
    return formatMeetingTimeRange(startTime, endTime);
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
    return getMonth(date);
  }

  async getMeetings() {
    const fakeMeetings: Meeting[] = [
      {id: undefined, date: '2024-07-29', startTime: '07:30', endTime: '08:00', title: 'Meeting 1', person: 'Addie'},
      {id: undefined, date: '2024-07-29', startTime: '08:00', endTime: '09:00', title: 'Ashley', person: 'Addie'},
      {id: undefined, date: '2024-07-29', startTime: '13:00', endTime: '13:30', title: 'Dr Moon', person: 'Mitchelle'},
      {id: undefined, date: '2024-07-29', startTime: '12:00', endTime: '14:00', title: 'Anne', person: 'Addie'},
      {id: undefined, date: '2024-08-12', startTime: '08:00', endTime: '09:00', title: 'Team Sync', person: 'Addie'},
      {id: undefined, date: '2024-08-12', startTime: '10:15', endTime: '11:00', title: 'Client Call', person: 'Addie'},
      {id: undefined, date: '2024-08-12', startTime: '14:00', endTime: '15:00', title: 'Strategy Meeting', person: 'Samantha'},
      {id: undefined, date: '2024-08-13', startTime: '08:30', endTime: '09:00', title: '1:1 with Addie', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-13', startTime: '13:00', endTime: '14:00', title: 'Development Update', person: 'Samantha'},
      {id: undefined, date: '2024-08-13', startTime: '15:00', endTime: '15:30', title: 'Quick Sync', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-14', startTime: '09:00', endTime: '10:00', title: 'Team Standup', person: 'Addie'},
      {id: undefined, date: '2024-08-14', startTime: '10:30', endTime: '11:30', title: 'Client Presentation', person: 'Samantha'},
      {id: undefined, date: '2024-08-14', startTime: '13:00', endTime: '14:00', title: 'Feedback Session', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-14', startTime: '15:00', endTime: '16:00', title: 'All Hands Meeting', person: 'Addie'},
      {id: undefined, date: '2024-08-15', startTime: '08:00', endTime: '09:00', title: 'Planning Session', person: 'Samantha'},
      {id: undefined, date: '2024-08-15', startTime: '10:00', endTime: '11:00', title: 'Design Review', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-15', startTime: '14:30', endTime: '15:30', title: 'Sales Call', person: 'Samantha'},
      {id: undefined, date: '2024-08-16', startTime: '09:00', endTime: '10:00', title: 'Weekly Sync', person: 'Addie'},
      {id: undefined, date: '2024-08-16', startTime: '11:00', endTime: '12:00', title: 'Marketing Review', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-16', startTime: '13:00', endTime: '14:00', title: 'Product Launch', person: 'Samantha'},
      {id: undefined, date: '2024-08-16', startTime: '15:00', endTime: '16:00', title: 'Retrospective', person: 'Addie'},
      {id: undefined, date: '2024-08-19', startTime: '08:00', endTime: '09:00', title: 'Monday Kickoff', person: 'Addie'},
      {id: undefined, date: '2024-08-19', startTime: '11:00', endTime: '12:00', title: 'Client Check-in', person: 'Samantha'},
      {id: undefined, date: '2024-08-19', startTime: '14:00', endTime: '15:00', title: 'Tech Sync', person: 'Addie'},
      {id: undefined, date: '2024-08-20', startTime: '08:30', endTime: '09:30', title: 'Design Discussion', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-20', startTime: '10:00', endTime: '11:00', title: 'Product Review', person: 'Addie'},
      {id: undefined, date: '2024-08-20', startTime: '12:00', endTime: '13:00', title: 'HR Meeting', person: 'Samantha'},
      {id: undefined, date: '2024-08-20', startTime: '14:30', endTime: '15:30', title: 'Code Review', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-21', startTime: '09:00', endTime: '10:00', title: 'Team Standup', person: 'Addie'},
      {id: undefined, date: '2024-08-21', startTime: '10:30', endTime: '11:30', title: 'Client Call', person: 'Samantha'},
      {id: undefined, date: '2024-08-22', startTime: '13:00', endTime: '14:00', title: 'Project Update', person: 'Mitchelle'},
      {id: undefined, date: '2024-08-23', startTime: '12:00', endTime: '13:00', title: 'Lunch Meeting', person: 'Addie'},
      {id: undefined, date: '2024-08-26', startTime: '09:30', endTime: '10:00', title: 'Project Update', person: 'Mitchelle'},
      {id: undefined, date: '2026-05-29', startTime: '11:00', endTime: '12:00', title: 'Product Review', person: 'Addie'},
      {id: undefined, date: '2026-05-28', startTime: '09:30', endTime: '12:30', title: 'Sprint Planning', person: 'Mitchelle'},
    ].map(meeting => ({
      ...meeting,
      hasBeenPaid: false,
    }));

    const apiMeetings = await getAllMeetings();

    this.allMeetings = [
      // HELPFUL: add fake meetings if running locally and need to see some
      // ...fakeMeetings,
      ...apiMeetings
    ];

    this.filterMeetings();
  }

  filterMeetings(): void {
    this.personDropdownOptions = buildPersonDropdownOptions(this.allMeetings, this.defaultDropdownOption);
    this.filteredMeetings = filterMeetingsByPerson(this.allMeetings, this.selectedValue, this.defaultDropdownOption);
  }

  editMeetingPopup(meeting: Meeting): void {
    this.meetingPopup.openPopupEdit(meeting, this.getDistinctSortedPeople());
  }

  addMeetingPopup(defaultDay: string): void {
    this.meetingPopup.openPopupCreate(defaultDay, this.getDistinctSortedPeople());
  }

  getDistinctSortedPeople(): string[] {
    return getDistinctSortedPeople(this.allMeetings);
  }

  async addMeetingCall(meeting: Meeting): Promise<void> {
    const success = await addMeeting(meeting);

    if (!success) {
      this.editMeetingPopup(meeting);
    } else {
      await this.setup();
    }
  }

  async editMeetingCall(meeting: Meeting): Promise<void> {
    const success = await editMeeting(meeting);

    if (!success) {
      this.editMeetingPopup(meeting);
    } else {
      await this.setup();
    }
  }

  async deleteMeetingCall(meeting: Meeting): Promise<void> {
    const success = await deleteMeeting(meeting.id!);

    if (!success) {
      this.editMeetingPopup(meeting);
    } else {
      await this.setup();
    }
  }
}
