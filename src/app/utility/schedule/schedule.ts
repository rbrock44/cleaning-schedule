import {Meeting, TimeSlot} from '../../type/meeting.type';
import {People, Shades} from '../../type/person.type';
import {formatMonthAndYear} from '../date/date';

export const DEFAULT_PERSON_COLOR = 'cccccc';

const MOBILE_PIXELS_PER_MINUTE = 0.4;
const MOBILE_MIN_HEIGHT = 44;
const MOBILE_MAX_HEIGHT = 112;

/** Extracts the 'yyyy-MM' part of a 'yyyy-MM-dd' date, or '' when the string is too short. */
export function getMonth(date: string): string {
  if (date.length > 6) {
    return date.substring(0, 7);
  } else {
    return '';
  }
}

export function isMonthChange(days: string[], index: number): boolean {
  if (index === 0) return false; // No change for the first day
  return getMonth(days[index]) !== getMonth(days[index - 1]);
}

export function hasSecondMonth(days: string[]): boolean {
  return getMonth(days[0]) !== getMonth(days[days.length - 1]);
}

export function getFirstMonth(days: string[]): string {
  return formatMonthAndYear(getMonth(days[0]));
}

export function getSecondMonth(days: string[]): string {
  return formatMonthAndYear(getMonth(days[days.length - 1]));
}

/**
 * Index of the day where the month changes. Defaults to 1, and because the scan does not
 * stop early it reports the last change in the window rather than the first.
 */
export function secondMonthIndex(days: string[]): number {
  let index = 1;
  days.forEach((day, i) => {
    if (i != 0) {
      if (getMonth(days[i]) !== getMonth(days[i - 1])) {
        index = i;
        return;
      }
    }
  });
  return index;
}

export function isUniqueMonth(days: string[], day: string, index: number): boolean {
  return index === 0 || (index > 0 && getMonth(day) !== getMonth(days[index - 1]));
}

/** Width modifier for the first month banner, sized by where the month break falls. */
export function getMonthBannerClassname(days: string[], index: number): string {
  let widthClass = '';
  if (hasSecondMonth(days)) {
    if (index === 0) {
      switch (secondMonthIndex(days)) {
        case 1:
          widthClass = 'one';
          break;
        case 2:
          widthClass = 'two';
          break;
        case 3:
          widthClass = 'three';
          break;
        case 4:
          widthClass = 'four';
          break;
        default:
          widthClass = '';
      }
    }
  }
  return `month-banner ${widthClass}`;
}

export function getMeetingsForDay(meetings: Meeting[], day: string): Meeting[] {
  return meetings.filter(meeting => meeting.date === day);
}

/** Meetings that start exactly on the given slot, not merely ones overlapping it. */
export function getMeetingsForTime(
  meetings: Meeting[],
  timeSlots: TimeSlot[],
  day: string,
  slotIndex: number
): Meeting[] {
  const slotTime: string = timeSlots[slotIndex].value;
  const [slotHour, slotMinute] = slotTime.split(':');
  const slotDate = new Date(day);
  slotDate.setHours(parseInt(slotHour), parseInt(slotMinute));

  return meetings.filter(meeting => {
    if (meeting.date !== day) return false;

    const [startHour, startMinute] = meeting.startTime.split(':').map(Number);

    const meetingStartDate = new Date(day);
    meetingStartDate.setHours(startHour, startMinute);

    return meetingStartDate.getHours() === slotDate.getHours() &&
      meetingStartDate.getMinutes() === slotDate.getMinutes();
  });
}

export function getMeetingTop(startTime: string, slotIndex: number): number {
  const [hours, minutes] = startTime.split(':').map(Number);
  return ((hours % 12) * 60 + minutes) - (slotIndex * 30);
}

/** Desktop height is one pixel per minute; mobile is scaled down and clamped. */
export function getMeetingHeight(startTime: string, endTime: string, isMobile = false): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startTotalMinutes: number = (startHours * 60) + startMinutes;
  const endTotalMinutes: number = (endHours * 60) + endMinutes;
  const durationMinutes = Math.max(0, endTotalMinutes - startTotalMinutes);

  if (isMobile) {
    const scaledMobileHeight = Math.round(durationMinutes * MOBILE_PIXELS_PER_MINUTE);
    return Math.min(MOBILE_MAX_HEIGHT, Math.max(MOBILE_MIN_HEIGHT, scaledMobileHeight));
  }

  return durationMinutes;
}

/** Turns 'HH:mm' into 12-hour display time, returning the input untouched if it will not parse. */
export function formatTimeForDisplay(time: string): string {
  const [hoursPart, minutesPart] = time.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = ((hours + 11) % 12) + 1;
  const paddedMinutes = minutes.toString().padStart(2, '0');

  return `${twelveHour}:${paddedMinutes} ${suffix}`;
}

export function formatMeetingTimeRange(startTime: string, endTime: string): string {
  return `${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)}`;
}

export function getDistinctSortedPeople(meetings: Meeting[]): string[] {
  return Array.from(new Set(meetings.map(x => x.person))).sort();
}

export function buildPersonDropdownOptions(meetings: Meeting[], defaultOption: string): string[] {
  return [defaultOption, ...getDistinctSortedPeople(meetings)];
}

export function filterMeetingsByPerson(
  meetings: Meeting[],
  selectedValue: string,
  defaultOption: string
): Meeting[] {
  return meetings.filter(x => {
    if (selectedValue == defaultOption) {
      return true;
    } else {
      return x.person == selectedValue;
    }
  });
}

/**
 * Builds the colour lookup. People come from every meeting, but a person's shades are keyed
 * only by the titles still visible after filtering, so a filtered-out person gets no shades.
 */
export function assignColors(allMeetings: Meeting[], filteredMeetings: Meeting[]): People {
  const people: People = {};
  const uniquePersons = [...new Set(allMeetings.map(meeting => meeting.person))];

  uniquePersons.forEach(person => {
    const shades: Shades = {};
    const uniqueTitlesPerPerson = [...new Set(
      filteredMeetings.filter(meeting => meeting.person === person).map(meeting => meeting.title)
    )];

    uniqueTitlesPerPerson.forEach(title => {
      shades[title] = DEFAULT_PERSON_COLOR;
    });

    people[person] = {
      color: DEFAULT_PERSON_COLOR,
      shades: shades
    };
  });

  return people;
}

export function getShadeForMeeting(people: People, meeting: Meeting): string {
  return people[meeting.person].shades[meeting.title];
}
