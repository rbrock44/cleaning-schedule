
import {Component, ElementRef, ChangeDetectionStrategy, output, signal, viewChild} from '@angular/core';
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
  readonly confirmationPopup = viewChild.required<ConfirmationPopupComponent>('confirmationPopup');
  readonly popupPanel = viewChild<ElementRef<HTMLElement>>('popupPanel');

  private previouslyFocusedElement: HTMLElement | null = null;

  readonly addMeeting = output<Meeting>();
  readonly editMeeting = output<Meeting>();
  readonly deleteMeeting = output<Meeting>();
  blankMeeting: Meeting = {
    id: undefined,
    date: '',
    startTime: '',
    endTime: '',
    title: '',
    person: '',
    hasBeenPaid: false
  };

  readonly showPopup = signal(false);
  readonly isEdit = signal(true);
  personOptions: string[] = [];
  readonly filteredPeople = signal<string[]>([]);
  meeting: Meeting = structuredClone(this.blankMeeting);
  readonly showAutocomplete = signal(false);

  openPopupCreate(defaultDay: string, personOptions: string[]) {
    this.personOptions = personOptions
    this.meeting = {
      ...structuredClone(this.blankMeeting),
      date: defaultDay,
      person: 'Addie'
    };
    this.isEdit.set(false);
    this.showPopup.set(true);
    this.captureFocusAndOpen();
  }

  openPopupEdit(meeting: Meeting, personOptions: string[]) {
    this.personOptions = personOptions
    this.meeting = {
      ...structuredClone(meeting),
      hasBeenPaid: !!meeting.hasBeenPaid,
    };
    this.isEdit.set(true);
    this.showPopup.set(true);
    this.captureFocusAndOpen();
  }

  closePopup() {
    this.showPopup.set(false);
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
        this.popupPanel()?.nativeElement.focus();
      }
    });
  }

  private restoreFocus(): void {
    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;
  }

  private getFocusableElements(): HTMLElement[] {
    const popupPanel = this.popupPanel();
    if (!popupPanel) {
      return [];
    }
    return Array.from(
      popupPanel.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
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
      if (active === first || !this.popupPanel()?.nativeElement.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onSubmit() {
    if (this.isEdit()) {
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
    this.filteredPeople.set(this.personOptions.filter(person => person.toLowerCase().includes(query)));
  }

  selectPerson(person: string) {
    this.meeting.person = person;
    this.filteredPeople.set([]);
  }

  showDropdown(): void {
    this.showAutocomplete.set(true);
  }

  hideDropdown(): void {
    this.showAutocomplete.set(false);
  }

  deleteMeetingLocal(confirmed: boolean): void {
    if (confirmed) {
      this.deleteMeeting.emit(this.meeting);
    }
  }

  confirmDeleteMeeting(): void {
    this.confirmationPopup().openPopup(this.meeting);
  }
}
