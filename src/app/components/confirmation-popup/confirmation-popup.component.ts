
import { Component, ElementRef, ChangeDetectionStrategy, output, signal, viewChild } from '@angular/core';
import { Meeting } from '../../type/meeting.type';
import { FormsModule } from '@angular/forms';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
    selector: 'app-confirmation-popup',
    imports: [
    FormsModule
],
    templateUrl: './confirmation-popup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './confirmation-popup.component.scss'
})
export class ConfirmationPopupComponent {
  readonly confirmed = output<boolean>();
  readonly popupPanel = viewChild<ElementRef<HTMLElement>>('popupPanel');

  readonly showPopup = signal(false);
  meeting: Meeting = {
      id: undefined,
      date: '',
      startTime: '',
      endTime: '',
      title: '',
      person: ''
    };

  private previouslyFocusedElement: HTMLElement | null = null;

  openPopup(meeting: Meeting) {
    this.meeting = meeting;
    this.showPopup.set(true);
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

  closePopup(confirmed: boolean = false) {
    this.confirmed.emit(confirmed);
    this.showPopup.set(false);
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
}
