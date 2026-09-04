import {Meeting, TimeSlot} from '../../type/meeting.type';
import {People} from '../../type/person.type';
import {
  DEFAULT_PERSON_COLOR,
  assignColors,
  buildPersonDropdownOptions,
  filterMeetingsByPerson,
  formatMeetingTimeRange,
  formatTimeForDisplay,
  getDistinctSortedPeople,
  getFirstMonth,
  getMeetingHeight,
  getMeetingTop,
  getMeetingsForDay,
  getMeetingsForTime,
  getMonth,
  getMonthBannerClassname,
  getSecondMonth,
  getShadeForMeeting,
  hasSecondMonth,
  isMonthChange,
  isUniqueMonth,
  secondMonthIndex
} from './schedule';

function meeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id: undefined,
    date: '2024-08-12',
    startTime: '09:00',
    endTime: '10:00',
    title: 'Kitchen',
    person: 'Addie',
    ...overrides
  };
}

function slots(...values: string[]): TimeSlot[] {
  return values.map(value => ({value, display: value}));
}

describe('getMonth', () => {
  it('extracts the yyyy-MM part of a full date', () => {
    expect(getMonth('2024-08-12')).toBe('2024-08');
  });

  it('accepts a bare yyyy-MM string unchanged', () => {
    expect(getMonth('2024-08')).toBe('2024-08');
  });

  it('returns an empty string for anything six characters or shorter', () => {
    expect(getMonth('2024-8')).toBe('');
    expect(getMonth('')).toBe('');
  });
});

describe('isMonthChange', () => {
  const days = ['2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01', '2024-08-02'];

  it('never reports a change on the first day', () => {
    expect(isMonthChange(days, 0)).toBeFalse();
  });

  it('reports a change on the day the month rolls over', () => {
    expect(isMonthChange(days, 3)).toBeTrue();
  });

  it('reports no change within the same month', () => {
    expect(isMonthChange(days, 1)).toBeFalse();
    expect(isMonthChange(days, 2)).toBeFalse();
    expect(isMonthChange(days, 4)).toBeFalse();
  });
});

describe('hasSecondMonth', () => {
  it('is true when the first and last day fall in different months', () => {
    expect(hasSecondMonth(['2024-07-29', '2024-08-02'])).toBeTrue();
  });

  it('is false for a week wholly inside one month', () => {
    expect(hasSecondMonth(['2024-08-12', '2024-08-16'])).toBeFalse();
  });

  it('is false for a single day, which is compared against itself', () => {
    expect(hasSecondMonth(['2024-08-12'])).toBeFalse();
  });
});

describe('getFirstMonth and getSecondMonth', () => {
  const days = ['2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01', '2024-08-02'];

  it('names the month of the first day', () => {
    expect(getFirstMonth(days)).toBe('July 2024');
  });

  it('names the month of the last day', () => {
    expect(getSecondMonth(days)).toBe('August 2024');
  });

  it('names the same month twice when the window does not straddle a boundary', () => {
    const sameMonth = ['2024-08-12', '2024-08-16'];
    expect(getFirstMonth(sameMonth)).toBe('August 2024');
    expect(getSecondMonth(sameMonth)).toBe('August 2024');
  });
});

describe('secondMonthIndex', () => {
  it('returns the index of the day the month changes', () => {
    expect(secondMonthIndex(['2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01', '2024-08-02'])).toBe(3);
  });

  it('returns the fallback of 1 when no month change occurs', () => {
    expect(secondMonthIndex(['2024-08-12', '2024-08-13', '2024-08-14'])).toBe(1);
  });

  it('reports the last change rather than the first, because the scan does not stop early', () => {
    expect(secondMonthIndex(['2024-07-31', '2024-08-01', '2024-08-02', '2024-09-01'])).toBe(3);
  });
});

describe('isUniqueMonth', () => {
  const days = ['2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01', '2024-08-02'];

  it('always treats the first day as unique', () => {
    expect(isUniqueMonth(days, days[0], 0)).toBeTrue();
  });

  it('is true on the day the month changes', () => {
    expect(isUniqueMonth(days, days[3], 3)).toBeTrue();
  });

  it('is false for a day sharing the previous month', () => {
    expect(isUniqueMonth(days, days[1], 1)).toBeFalse();
    expect(isUniqueMonth(days, days[4], 4)).toBeFalse();
  });
});

describe('getMonthBannerClassname', () => {
  it('adds no width modifier when the window sits in one month', () => {
    expect(getMonthBannerClassname(['2024-08-12', '2024-08-16'], 0)).toBe('month-banner ');
  });

  it('only ever widens the banner at index 0', () => {
    const days = ['2024-07-31', '2024-08-01', '2024-08-02'];
    expect(getMonthBannerClassname(days, 1)).toBe('month-banner ');
    expect(getMonthBannerClassname(days, 2)).toBe('month-banner ');
  });

  it('maps the month break position onto a spelled-out width class', () => {
    expect(getMonthBannerClassname(['2024-07-31', '2024-08-01'], 0)).toBe('month-banner one');
    expect(getMonthBannerClassname(['2024-07-30', '2024-07-31', '2024-08-01'], 0)).toBe('month-banner two');
    expect(getMonthBannerClassname(['2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01'], 0))
      .toBe('month-banner three');
    expect(getMonthBannerClassname(['2024-07-28', '2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01'], 0))
      .toBe('month-banner four');
  });

  it('leaves the modifier empty when the break falls outside the mapped positions', () => {
    const days = ['2024-07-27', '2024-07-28', '2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01'];
    expect(getMonthBannerClassname(days, 0)).toBe('month-banner ');
  });
});

describe('getMeetingsForDay', () => {
  const meetings = [
    meeting({date: '2024-08-12', title: 'Kitchen'}),
    meeting({date: '2024-08-13', title: 'Bathroom'}),
    meeting({date: '2024-08-12', title: 'Floors'})
  ];

  it('returns only the meetings on that day, in their original order', () => {
    expect(getMeetingsForDay(meetings, '2024-08-12').map(m => m.title)).toEqual(['Kitchen', 'Floors']);
  });

  it('returns an empty list for a day with nothing scheduled', () => {
    expect(getMeetingsForDay(meetings, '2024-08-14')).toEqual([]);
  });
});

describe('getMeetingsForTime', () => {
  const timeSlots = slots('07:30', '08:00', '08:30');

  it('returns meetings that start exactly on the slot', () => {
    const meetings = [
      meeting({date: '2024-08-12', startTime: '08:00', title: 'On the slot'}),
      meeting({date: '2024-08-12', startTime: '08:15', title: 'Mid slot'})
    ];
    expect(getMeetingsForTime(meetings, timeSlots, '2024-08-12', 1).map(m => m.title)).toEqual(['On the slot']);
  });

  it('ignores a meeting that merely runs through the slot', () => {
    const meetings = [meeting({date: '2024-08-12', startTime: '07:30', endTime: '09:00'})];
    expect(getMeetingsForTime(meetings, timeSlots, '2024-08-12', 1)).toEqual([]);
  });

  it('ignores meetings on other days even at a matching time', () => {
    const meetings = [meeting({date: '2024-08-13', startTime: '08:00'})];
    expect(getMeetingsForTime(meetings, timeSlots, '2024-08-12', 1)).toEqual([]);
  });

  it('returns every meeting sharing the slot', () => {
    const meetings = [
      meeting({date: '2024-08-12', startTime: '08:30', person: 'Addie'}),
      meeting({date: '2024-08-12', startTime: '08:30', person: 'Mitchelle'})
    ];
    expect(getMeetingsForTime(meetings, timeSlots, '2024-08-12', 2).length).toBe(2);
  });
});

describe('getMeetingTop', () => {
  it('offsets a start time by the slot it is rendered in', () => {
    expect(getMeetingTop('08:00', 1)).toBe(450);
  });

  it('counts the minutes past the hour', () => {
    expect(getMeetingTop('08:15', 1)).toBe(465);
  });

  it('wraps the hour onto a twelve-hour clock, so afternoon times fold back', () => {
    expect(getMeetingTop('13:00', 0)).toBe(60);
    expect(getMeetingTop('12:00', 0)).toBe(0);
  });
});

describe('getMeetingHeight', () => {
  it('gives one pixel per minute on desktop', () => {
    expect(getMeetingHeight('09:00', '10:00')).toBe(60);
    expect(getMeetingHeight('09:00', '09:30')).toBe(30);
  });

  it('spans the hour boundary correctly', () => {
    expect(getMeetingHeight('09:45', '10:15')).toBe(30);
  });

  it('clamps a backwards or zero-length meeting to nothing on desktop', () => {
    expect(getMeetingHeight('10:00', '09:00')).toBe(0);
    expect(getMeetingHeight('09:00', '09:00')).toBe(0);
  });

  it('floors the mobile height so short meetings stay tappable', () => {
    expect(getMeetingHeight('09:00', '10:00', true)).toBe(44);
    expect(getMeetingHeight('09:00', '09:00', true)).toBe(44);
  });

  it('caps the mobile height for very long meetings', () => {
    expect(getMeetingHeight('09:00', '17:00', true)).toBe(112);
  });

  it('scales mobile heights between the bounds', () => {
    expect(getMeetingHeight('09:00', '12:00', true)).toBe(72);
  });
});

describe('formatTimeForDisplay', () => {
  it('renders morning times with an AM suffix', () => {
    expect(formatTimeForDisplay('09:00')).toBe('9:00 AM');
  });

  it('renders afternoon times on a twelve-hour clock', () => {
    expect(formatTimeForDisplay('13:05')).toBe('1:05 PM');
  });

  it('treats noon as PM and midnight as AM', () => {
    expect(formatTimeForDisplay('12:00')).toBe('12:00 PM');
    expect(formatTimeForDisplay('00:30')).toBe('12:30 AM');
  });

  it('pads single digit minutes', () => {
    expect(formatTimeForDisplay('07:5')).toBe('7:05 AM');
  });

  it('returns the input untouched when it will not parse', () => {
    expect(formatTimeForDisplay('not a time')).toBe('not a time');
  });
});

describe('formatMeetingTimeRange', () => {
  it('joins both formatted times with a dash', () => {
    expect(formatMeetingTimeRange('09:00', '13:30')).toBe('9:00 AM - 1:30 PM');
  });
});

describe('getDistinctSortedPeople', () => {
  it('dedupes and sorts alphabetically', () => {
    const meetings = [
      meeting({person: 'Mitchelle'}),
      meeting({person: 'Addie'}),
      meeting({person: 'Mitchelle'}),
      meeting({person: 'Samantha'})
    ];
    expect(getDistinctSortedPeople(meetings)).toEqual(['Addie', 'Mitchelle', 'Samantha']);
  });

  it('returns an empty list when there are no meetings', () => {
    expect(getDistinctSortedPeople([])).toEqual([]);
  });
});

describe('buildPersonDropdownOptions', () => {
  it('puts the default option ahead of the sorted people', () => {
    const meetings = [meeting({person: 'Mitchelle'}), meeting({person: 'Addie'})];
    expect(buildPersonDropdownOptions(meetings, 'All')).toEqual(['All', 'Addie', 'Mitchelle']);
  });

  it('is just the default option when nothing is scheduled', () => {
    expect(buildPersonDropdownOptions([], 'All')).toEqual(['All']);
  });
});

describe('filterMeetingsByPerson', () => {
  const meetings = [
    meeting({person: 'Addie', title: 'Kitchen'}),
    meeting({person: 'Mitchelle', title: 'Bathroom'}),
    meeting({person: 'Addie', title: 'Floors'})
  ];

  it('keeps everything when the default option is selected', () => {
    expect(filterMeetingsByPerson(meetings, 'All', 'All').length).toBe(3);
  });

  it('keeps only the selected person', () => {
    expect(filterMeetingsByPerson(meetings, 'Addie', 'All').map(m => m.title)).toEqual(['Kitchen', 'Floors']);
  });

  it('keeps nothing for a person with no meetings', () => {
    expect(filterMeetingsByPerson(meetings, 'Nobody', 'All')).toEqual([]);
  });
});

describe('assignColors', () => {
  const allMeetings = [
    meeting({person: 'Addie', title: 'Kitchen'}),
    meeting({person: 'Addie', title: 'Floors'}),
    meeting({person: 'Addie', title: 'Kitchen'}),
    meeting({person: 'Mitchelle', title: 'Bathroom'})
  ];

  it('gives every person in the full list an entry', () => {
    const people = assignColors(allMeetings, allMeetings);
    expect(Object.keys(people).sort()).toEqual(['Addie', 'Mitchelle']);
  });

  it('keys the shades by a distinct title per person', () => {
    const people = assignColors(allMeetings, allMeetings);
    expect(Object.keys(people['Addie'].shades).sort()).toEqual(['Floors', 'Kitchen']);
  });

  it('uses the single placeholder colour for every person and shade', () => {
    const people = assignColors(allMeetings, allMeetings);
    expect(people['Addie'].color).toBe(DEFAULT_PERSON_COLOR);
    expect(people['Addie'].shades['Kitchen']).toBe(DEFAULT_PERSON_COLOR);
    expect(people['Mitchelle'].color).toBe(DEFAULT_PERSON_COLOR);
  });

  it('still lists a filtered-out person, but with no shades', () => {
    const filtered = allMeetings.filter(m => m.person === 'Addie');
    const people = assignColors(allMeetings, filtered);
    expect(people['Mitchelle']).toBeDefined();
    expect(people['Mitchelle'].shades).toEqual({});
  });

  it('produces an empty lookup when there are no meetings', () => {
    expect(assignColors([], [])).toEqual({});
  });
});

describe('getShadeForMeeting', () => {
  it('looks the shade up by person and title', () => {
    const people: People = assignColors([meeting()], [meeting()]);
    expect(getShadeForMeeting(people, meeting())).toBe(DEFAULT_PERSON_COLOR);
  });

  it('is undefined for a title the person has no shade for', () => {
    const people: People = assignColors([meeting()], []);
    expect(getShadeForMeeting(people, meeting())).toBeUndefined();
  });
});
