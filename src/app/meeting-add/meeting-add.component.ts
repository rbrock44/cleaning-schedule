import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Meeting } from '../type/meeting.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meeting-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './meeting-add.component.html',
  styleUrl: './meeting-add.component.scss'
})
export class MeetingAddComponent {
  @Output() addMeeting = new EventEmitter<Meeting>()

  showPopup: boolean = false;
  personOptions: string[] = [];
  filteredPeople: string[] = [];
  meeting: Meeting = {
    date: '',
    startTime: '',
    endTime: '',
    title: '',
    person: ''
  };

  openPopup(defaultDay: string, personOptions: string[]) {
    this.personOptions = personOptions
    this.meeting.date = defaultDay;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
  }

  onSubmit() {
    this.addMeeting.emit(this.meeting);
    this.closePopup();
  }

  resetForm() {
    this.meeting = {
      date: '',
      startTime: '',
      endTime: '',
      title: '',
      person: ''
    };
  }

  filterPeople() {
    const query = this.meeting.person.toLowerCase();
    this.filteredPeople = this.personOptions.filter(person => person.toLowerCase().includes(query));
  }

  selectPerson(person: string) {
    this.meeting.person = person;
    this.filteredPeople = [];
  }
}
