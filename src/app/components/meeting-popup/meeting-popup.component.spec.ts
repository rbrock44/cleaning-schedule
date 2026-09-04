import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {MeetingPopupComponent} from './meeting-popup.component';
import {Meeting} from '../../type/meeting.type';

const PEOPLE = ['Addie', 'Mitchelle', 'Samantha'];

function meeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id: 7,
    date: '2024-08-12',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Kitchen',
    person: 'Mitchelle',
    hasBeenPaid: true,
    ...overrides
  };
}

describe('MeetingPopupComponent', () => {
  let component: MeetingPopupComponent;
  let fixture: ComponentFixture<MeetingPopupComponent>;

  function element(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function elements(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function buttonLabels(): string[] {
    return elements('.meeting-buttons button').map(b => b.textContent?.trim() ?? '');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingPopupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing until it is opened', () => {
    expect(component.showPopup()).toBeFalse();
    expect(element('.popup-container')).toBeNull();
  });

  describe('opening to create', () => {
    beforeEach(() => {
      component.openPopupCreate('2024-08-14', PEOPLE);
      fixture.detectChanges();
    });

    it('shows the create heading and only a create button', () => {
      expect(component.isEdit()).toBeFalse();
      expect(element('#meetingPopupTitle')?.textContent?.trim()).toBe('Add to Schedule');
      expect(buttonLabels()).toEqual(['Create']);
    });

    it('seeds the form with the clicked day and the default person', () => {
      expect(component.meeting.date).toBe('2024-08-14');
      expect(component.meeting.person).toBe('Addie');
      expect(component.meeting.title).toBe('');
    });

    it('emits addMeeting, not editMeeting, on submit', () => {
      const added: Meeting[] = [];
      const edited: Meeting[] = [];
      component.addMeeting.subscribe(m => added.push(m));
      component.editMeeting.subscribe(m => edited.push(m));

      component.meeting.title = 'Windows';
      component.onSubmit();

      expect(added.length).toBe(1);
      expect(added[0].title).toBe('Windows');
      expect(edited.length).toBe(0);
    });

    it('closes and clears the form after submitting', () => {
      component.meeting.title = 'Windows';
      component.onSubmit();
      fixture.detectChanges();

      expect(component.showPopup()).toBeFalse();
      expect(component.meeting.title).toBe('');
      expect(component.meeting.date).toBe('');
      expect(element('.popup-container')).toBeNull();
    });
  });

  describe('opening to edit', () => {
    beforeEach(() => {
      component.openPopupEdit(meeting(), PEOPLE);
      fixture.detectChanges();
    });

    it('shows the edit heading with the edit and delete buttons', () => {
      expect(component.isEdit()).toBeTrue();
      expect(element('#meetingPopupTitle')?.textContent?.trim()).toBe('Edit Existing Schedule');
      expect(buttonLabels()).toEqual(['Edit', 'Delete']);
    });

    it('copies the meeting rather than holding a reference to it', () => {
      const original = meeting();
      component.openPopupEdit(original, PEOPLE);

      component.meeting.title = 'Changed';

      expect(original.title).toBe('Kitchen');
    });

    it('coerces a missing paid flag to false', () => {
      component.openPopupEdit(meeting({hasBeenPaid: undefined}), PEOPLE);
      expect(component.meeting.hasBeenPaid).toBeFalse();
    });

    it('emits editMeeting, not addMeeting, on submit', () => {
      const added: Meeting[] = [];
      const edited: Meeting[] = [];
      component.addMeeting.subscribe(m => added.push(m));
      component.editMeeting.subscribe(m => edited.push(m));

      component.onSubmit();

      expect(edited.length).toBe(1);
      expect(edited[0].id).toBe(7);
      expect(added.length).toBe(0);
    });

    it('renders the meeting values into the form inputs', async () => {
      // ngModel writes to the DOM a turn after the popup opens.
      await fixture.whenStable();
      fixture.detectChanges();

      const title = element('#title') as HTMLInputElement;
      const date = element('#date') as HTMLInputElement;
      expect(title.value).toBe('Kitchen');
      expect(date.value).toBe('2024-08-12');
    });
  });

  describe('the person autocomplete', () => {
    beforeEach(() => {
      component.openPopupCreate('2024-08-14', PEOPLE);
      component.showDropdown();
      fixture.detectChanges();
    });

    it('narrows the list to case-insensitive matches', () => {
      component.meeting.person = 'a';
      component.filterPeople();
      expect(component.filteredPeople()).toEqual(['Addie', 'Samantha']);
    });

    it('matches on any part of the name, not just the start', () => {
      component.meeting.person = 'chelle';
      component.filterPeople();
      expect(component.filteredPeople()).toEqual(['Mitchelle']);
    });

    it('offers everyone when the field is empty', () => {
      component.meeting.person = '';
      component.filterPeople();
      expect(component.filteredPeople()).toEqual(PEOPLE);
    });

    it('renders the matches as a list', () => {
      component.meeting.person = 'a';
      component.filterPeople();
      fixture.detectChanges();

      expect(elements('.autocomplete-list li').map(li => li.textContent?.trim()))
        .toEqual(['Addie', 'Samantha']);
    });

    it('hides the list while the field is not focused', () => {
      component.meeting.person = 'a';
      component.filterPeople();
      component.hideDropdown();
      fixture.detectChanges();

      expect(element('.autocomplete-list')).toBeNull();
    });

    it('picking a name fills the field and closes the list', () => {
      component.meeting.person = 'a';
      component.filterPeople();
      fixture.detectChanges();

      component.selectPerson('Samantha');
      fixture.detectChanges();

      expect(component.meeting.person).toBe('Samantha');
      expect(component.filteredPeople()).toEqual([]);
      expect(element('.autocomplete-list')).toBeNull();
    });
  });

  describe('deleting', () => {
    beforeEach(() => {
      component.openPopupEdit(meeting(), PEOPLE);
      fixture.detectChanges();
    });

    it('hands the meeting to the confirmation popup instead of deleting straight away', () => {
      const deleted: Meeting[] = [];
      component.deleteMeeting.subscribe(m => deleted.push(m));

      element('.meeting-buttons .delete')!.click();
      fixture.detectChanges();

      expect(component.confirmationPopup().showPopup()).toBeTrue();
      expect(component.confirmationPopup().meeting.title).toBe('Kitchen');
      expect(deleted.length).toBe(0);
    });

    it('emits deleteMeeting only once the confirmation comes back true', () => {
      const deleted: Meeting[] = [];
      component.deleteMeeting.subscribe(m => deleted.push(m));

      component.deleteMeetingLocal(false);
      expect(deleted.length).toBe(0);

      component.deleteMeetingLocal(true);
      expect(deleted.length).toBe(1);
      expect(deleted[0].id).toBe(7);
    });
  });

  describe('focus handling', () => {
    it('moves focus into the dialog when it opens', fakeAsync(() => {
      component.openPopupEdit(meeting(), PEOPLE);
      fixture.detectChanges();
      tick();

      expect(element('.popup')!.contains(document.activeElement)).toBeTrue();
    }));

    it('returns focus to whatever was focused before it opened', fakeAsync(() => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();

      component.openPopupEdit(meeting(), PEOPLE);
      fixture.detectChanges();
      tick();

      component.closePopup();
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    }));

    it('wraps focus back to the first element when tabbing off the last', fakeAsync(() => {
      component.openPopupEdit(meeting(), PEOPLE);
      fixture.detectChanges();
      tick();

      const focusable = elements(
        '.popup a[href], .popup button:not([disabled]), .popup input:not([disabled])'
      ).filter(el => !!el.offsetParent);
      const last = focusable[focusable.length - 1];
      last.focus();

      const event = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true});
      const prevented = spyOn(event, 'preventDefault');
      component.onTabKey(event);

      expect(prevented).toHaveBeenCalled();
      expect(document.activeElement).toBe(focusable[0]);
    }));

    it('does nothing on tab when the dialog is closed and has no focusable content', () => {
      const event = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true});
      const prevented = spyOn(event, 'preventDefault');

      component.onTabKey(event);

      expect(prevented).not.toHaveBeenCalled();
    });
  });
});
