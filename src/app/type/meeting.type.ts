export type Meeting = {
    id: number | undefined,
    date: string,
    startTime: string,
    endTime: string,
    title: string,
    person: string,
    hasBeenPaid?: boolean | undefined
};

export type TimeSlot = {
  value: string,
  display: string
}
