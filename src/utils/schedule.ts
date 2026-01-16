// src/utils/schedule.ts
import { differenceInDays, startOfDay } from 'date-fns';

export type Team = 'T-1' | 'T-2' | 'T-3' | 'T-4';

interface DaySchedule {
  date: Date;
  workingTeams: Team[];
}

// Data de referência (02/01/2026 era A & B, agora T-1 & T-2)
const ANCHOR_DATE = new Date(2026, 0, 2);

export const getWorkingTeams = (date: Date): Team[] => {
  const normalizedDate = startOfDay(date);
  const daysDiff = differenceInDays(normalizedDate, ANCHOR_DATE);

  const cycleIndex = ((daysDiff % 4) + 4) % 4;

  // T-1 e T-2 substituem A e B
  // T-3 e T-4 substituem C e D
  if (cycleIndex === 0 || cycleIndex === 1) {
    return ['T-1', 'T-2'];
  } else {
    return ['T-3', 'T-4'];
  }
};

export const generateSchedule = (start: Date, end: Date): DaySchedule[] => {
  const schedule: DaySchedule[] = [];
  const current = startOfDay(start);
  const last = startOfDay(end);

  while (current <= last) {
    schedule.push({
      date: new Date(current),
      workingTeams: getWorkingTeams(current),
    });
    current.setDate(current.getDate() + 1);
  }

  return schedule;
};
