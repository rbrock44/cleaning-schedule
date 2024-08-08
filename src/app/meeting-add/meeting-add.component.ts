import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-meeting-add',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './meeting-add.component.html',
  styleUrl: './meeting-add.component.scss'
})
export class MeetingAddComponent {
  showPopup: boolean = false;
  defaultDay: string = '';

  openPopup(defaultDay: string) {
    this.defaultDay = defaultDay;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}
