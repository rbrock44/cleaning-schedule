
import {Component, ElementRef, EventEmitter, Output, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { Meeting } from '../../type/meeting.type';
import { FormsModule } from '@angular/forms';
import {ConfirmationPopupComponent} from "../confirmation-popup/confirmation-popup.component";
import {deleteMeeting} from "../../services/meetingService";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
    selector: 'app-meeting-popup',
    imports: [
    FormsModule,
    ConfirmationPopupComponent
],
    templateUrl: './meeting-popup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './meeting-popup.component.scss'
})
export class MeetingPopupComponent {
  @ViewChild('confirmationPopup') confirmationPopup!: ConfirmationPopupComponent;
  @ViewChild('popupPanel') popupPanel?: ElementRef<HTMLElement>;

  private previouslyFocusedElement: HTMLElement | null = null;

  @Output() addMeeting = new EventEmitter<Meeting>()
  @Output() editMeeting = new EventEmitter<Meeting>()
  @Output() deleteMeeting = new EventEmitter<Meeting>()
  blankMeeting: Meeting = {
    id: undefined,
    date: '',
    startTime: '',
    endTime: '',
    title: '',
    person: '',
    hasBeenPaid: false
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
      date: defaultDay,
      person: 'Addie'
    };
    this.isEdit = false;
    this.showPopup = true;
    this.captureFocusAndOpen();
  }

  openPopupEdit(meeting: Meeting, personOptions: string[]) {
    this.personOptions = personOptions
    this.meeting = {
      ...structuredClone(meeting),
      hasBeenPaid: !!meeting.hasBeenPaid,
    };
    this.isEdit = true;
    this.showPopup = true;
    this.captureFocusAndOpen();
  }

  closePopup() {
    this.showPopup = false;
    this.resetForm();
    this.restoreFocus();
  }

  private captureFocusAndOpen(): void {
    this.previouslyFocusedElement = document.activeElement as HTMLElement | null;
    setTimeout(() => {
      const focusable = this.getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        this.popupPanel?.nativeElement.focus();
      }
    });
  }

  private restoreFocus(): void {
    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.popupPanel) {
      return [];
    }
    return Array.from(
      this.popupPanel.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(el => !!el.offsetParent);
  }

  onTabKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (keyboardEvent.shiftKey) {
      if (active === first || !this.popupPanel?.nativeElement.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
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

  deleteMeetingLocal(confirmed: boolean): void {
    if (confirmed) {
      this.deleteMeeting.emit(this.meeting);
    }
  }

  confirmDeleteMeeting(): void {
    this.confirmationPopup.openPopup(this.meeting);
  }
}
