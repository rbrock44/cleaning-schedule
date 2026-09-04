import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScheduleComponent} from './schedule.component';
import {MeetingPopupComponent} from '../meeting-popup/meeting-popup.component';
import {Meeting} from '../../type/meeting.type';
import {generateDays, getClosestMonday} from '../../utility/date/date';

const weekDays = generateDays(getClosestMonday());

function meeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id: 1,
    date: weekDays[0],
    startTime: '09:00',
    endTime: '10:00',
    title: 'Kitchen',
    person: 'Addie',
    hasBeenPaid: false,
    ...overrides
  };
}

function jsonResponse(body: unknown): Promise<Response> {
  return Promise.resolve({
    status: 200,
    json: () => Promise.resolve(body)
  } as unknown as Response);
}

describe('ScheduleComponent', () => {
  let fixture: ComponentFixture<ScheduleComponent>;
  let component: ScheduleComponent;

  const defaultMeetings = [
    meeting({id: 1, person: 'Addie', title: 'Kitchen', date: weekDays[0], startTime: '09:00'}),
    meeting({id: 2, person: 'Mitchelle', title: 'Bathroom', date: weekDays[1], startTime: '10:00'}),
    meeting({id: 3, person: 'Addie', title: 'Floors', date: weekDays[2], startTime: '11:00'})
  ];

  async function render(meetings: Meeting[] = defaultMeetings, isMobile = false): Promise<void> {
    spyOn(window, 'fetch').and.callFake(() => jsonResponse(meetings));
    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    // The karma iframe is narrower than the mobile breakpoint, so pin the layout rather
    // than letting the harness decide it.
    component.isMobile.set(isMobile);
    fixture.detectChanges();
    // ngOnInit kicks off an un-awaited load; let the fetch and json promises settle.
    await new Promise<void>(resolve => setTimeout(resolve));
    fixture.detectChanges();
  }

  function element(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function elements(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleComponent]
    }).compileComponents();
  });

  it('clears the loading flag and shows the schedule once meetings arrive', async () => {
    await render();

    expect(component.loading()).toBeFalse();
    expect(element('.schedule-shell')).not.toBeNull();
  });

  it('hides the whole schedule while loading', async () => {
    await render();

    component.loading.set(true);
    fixture.detectChanges();

    expect(element('.schedule-shell')).toBeNull();
  });

  it('renders one desktop column for each of the five weekdays', async () => {
    await render();

    expect(component.days.length).toBe(5);
    expect(elements('.schedule-container.desktop .day-column').length).toBe(5);
  });

  it('fills the person dropdown with the default option ahead of the sorted people', async () => {
    await render();

    const options = elements('select option').map(option => option.textContent?.trim());
    expect(options).toEqual(['All', 'Addie', 'Mitchelle']);
  });

  it('renders each meeting with its person and title', async () => {
    await render();

    const rendered = elements('.schedule-container.desktop .meeting').map(el => el.textContent?.trim());
    expect(rendered).toContain('Addie: Kitchen');
    expect(rendered).toContain('Mitchelle: Bathroom');
    expect(rendered).toContain('Addie: Floors');
  });

  it('drops the other people from the grid when one person is selected', async () => {
    await render();

    component.selectedValue = 'Addie';
    component.filterMeetings();
    fixture.detectChanges();

    const rendered = elements('.schedule-container.desktop .meeting').map(el => el.textContent?.trim());
    expect(rendered).toEqual(['Addie: Kitchen', 'Addie: Floors']);
  });

  it('brings every meeting back when the filter returns to the default option', async () => {
    await render();

    component.selectedValue = 'Addie';
    component.filterMeetings();
    fixture.detectChanges();
    expect(elements('.schedule-container.desktop .meeting').length).toBe(2);

    component.selectedValue = 'All';
    component.filterMeetings();
    fixture.detectChanges();
    expect(elements('.schedule-container.desktop .meeting').length).toBe(3);
  });

  it('swaps to the mobile layout, which also shows the time range', async () => {
    await render();

    component.isMobile.set(true);
    fixture.detectChanges();

    expect(element('.schedule-container.desktop')).toBeNull();
    expect(elements('.schedule-container.mobile .day-column-horizontal').length).toBe(5);
    expect(element('.schedule-container.mobile .meeting-secondary')?.textContent?.trim())
      .toBe('9:00 AM - 10:00 AM');
  });

  it('steps the window back a week when the left arrow is clicked', async () => {
    await render();
    const firstDay = component.days[0];

    element('.left-arrow')!.click();
    fixture.detectChanges();

    const shifted = new Date(component.days[0]).getTime();
    expect(new Date(firstDay).getTime() - shifted).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('steps the window forward a week when the right arrow is clicked', async () => {
    await render();
    const firstDay = component.days[0];

    element('.right-arrow')!.click();
    fixture.detectChanges();

    const shifted = new Date(component.days[0]).getTime();
    expect(shifted - new Date(firstDay).getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('opens the create popup for the column that was clicked, seeded with the known people', async () => {
    await render();
    const popup = component.meetingPopup() as MeetingPopupComponent;
    const openCreate = spyOn(popup, 'openPopupCreate');

    elements('.schedule-container.desktop .plus-button')[1].click();

    expect(openCreate).toHaveBeenCalledWith(component.days[1], ['Addie', 'Mitchelle']);
  });

  it('opens the edit popup for the meeting that was clicked', async () => {
    await render();
    const popup = component.meetingPopup() as MeetingPopupComponent;
    const openEdit = spyOn(popup, 'openPopupEdit');

    element('.schedule-container.desktop .meeting')!.click();

    expect(openEdit).toHaveBeenCalledWith(
      jasmine.objectContaining({person: 'Addie', title: 'Kitchen'}),
      ['Addie', 'Mitchelle']
    );
  });

  it('gives every person a colour entry after loading', async () => {
    await render();

    expect(Object.keys(component.people).sort()).toEqual(['Addie', 'Mitchelle']);
    expect(component.people['Addie'].shades['Kitchen']).toBeDefined();
  });

  it('renders an empty grid, and only the default filter option, when nothing is scheduled', async () => {
    await render([]);

    expect(elements('.schedule-container.desktop .meeting').length).toBe(0);
    expect(elements('select option').map(o => o.textContent?.trim())).toEqual(['All']);
  });
});
