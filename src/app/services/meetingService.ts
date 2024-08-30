import {Meeting} from "../type/meeting.type";

const baseUrl = 'https://home-page-api-34607.herokuapp.com/cleaning-schedule';

export async function getMeetingsByWeek(startOfWeek: string): Promise<Meeting[]> {
  const apiUrl = baseUrl + `/week?startDate=${startOfWeek}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
  });
  const data = (await response.json()) as unknown;

  return data as Meeting[];
}

export async function getAllMeetings(): Promise<Meeting[]> {
  const response = await fetch(baseUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
  });
  const data = (await response.json()) as unknown;

  return data as Meeting[];
}

export async function editMeeting(meeting: Meeting): Promise<boolean> {
  const apiUrl = baseUrl + '/edit';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify(meeting)
  });

  return response.status === 200;
}

export async function addMeeting(meeting: Meeting): Promise<boolean> {
  const apiUrl = baseUrl + '/add';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify(meeting)
  });

  return response.status === 200;
}

export async function deleteMeeting(id: number): Promise<boolean> {
  const apiUrl = baseUrl + `?id=${id}`;

  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
  });

  return (await response.json()) as boolean;
}


