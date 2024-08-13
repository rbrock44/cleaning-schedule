import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Meeting } from '../../type/meeting.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meeting-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './meeting-popup.component.html',
  styleUrl: './meeting-popup.component.scss'
})
export class MeetingPopupComponent {
  @Output() addMeeting = new EventEmitter<Meeting>()
  @Output() editMeeting = new EventEmitter<Meeting>()
  blankMeeting: Meeting = {
    date: '',
    startTime: '',
    endTime: '',
    title: '',
    person: ''
  };

  showPopup: boolean = false;
  isEdit: boolean = true;
  personOptions: string[] = [];
  filteredPeople: string[] = [];
  meeting: Meeting = structuredClone(this.blankMeeting);
  showAutocomplete = false;

  openPopupCreate(defaultDay: string, personOptions: string[]) {
    this.personOptions = personOptions
    this.meeting = {
      ...structuredClone(this.blankMeeting),
      date: defaultDay
    };
    this.isEdit = false;
    this.showPopup = true;
  }

  openPopupEdit(meeting: Meeting, personOptions: string[]) {
    this.personOptions = personOptions
    this.meeting = structuredClone(meeting);
    this.isEdit = true;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  onSubmit() {
    if (this.isEdit) {
      this.editMeeting.emit(this.meeting);
    } else {
      this.addMeeting.emit(this.meeting);
    }
    this.closePopup();
  }

  resetForm() {
    this.meeting = structuredClone(this.blankMeeting);
  }

  filterPeople() {
    const query = this.meeting.person.toLowerCase();
    this.filteredPeople = this.personOptions.filter(person => person.toLowerCase().includes(query));
  }

  selectPerson(person: string) {
    this.meeting.person = person;
    this.filteredPeople = [];
  }

  showDropdown(): void {
    this.showAutocomplete = true;
  }

  hideDropdown(): void {
    this.showAutocomplete = false;
  }
}
