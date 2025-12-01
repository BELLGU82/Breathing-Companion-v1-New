import { LucideIcon } from 'lucide-react';

export enum BreathingPhase {
  Idle = 'Idle',
  Inhale = 'Inhale',
  HoldIn = 'HoldIn',
  Exhale = 'Exhale',
  HoldOut = 'HoldOut',
  Rest = 'Rest',
  Finished = 'Finished'
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  recommendedDuration?: number; // Recommended session length in seconds
  reps?: number; // Optional: Specific number of repetitions (overrides duration)
  restDuration?: number; // Optional rest between cycles
  phases: {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  defaultPatternId: string;
  patterns: string[]; // List of pattern IDs belonging to this category
  description: string;
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  lastSevenDaysActivity: number[]; // Index 0 = Sunday, 6 = Saturday
}

export interface Session {
  id: string;
  patternId: string;
  patternName: string;
  durationSeconds: number;
  timestamp: number;
  isCompleted: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartStats {
  totalMinutes: number;
  trendPercentage: number;
  data: ChartDataPoint[];
}

export interface Reminder {
  id: string;
  time: string; // "08:00"
  days: number[]; // [0, 1, 2, 3, 4, 5, 6] (Sunday=0)
  enabled: boolean;
}