import { Component } from '@angular/core';
import { Meeting } from '../type/meeting.type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meeting-edit',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './meeting-edit.component.html',
  styleUrl: './meeting-edit.component.scss'
})
export class MeetingEditComponent {
  showPopup: boolean = false;
  blankMeeting = { 
    date: '', 
    startTime: '', 
    endTime: '', 
    title: '', 
    person: '' 
  };
  meeting: Meeting = this.blankMeeting


  openPopup(meeting: Meeting) {
    this.meeting = meeting;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}