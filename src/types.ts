export enum Year {
  First = "الفرقة الأولى",
  Second = "الفرقة الثانية",
  Third = "الفرقة الثالثة",
  Fourth = "الفرقة الرابعة",
}

export type WarningType = 'warning' | 'notice';

export interface Grades {
  attendance: number;
  interaction: number;
  leadership: number;
  behavior: number;
}

export interface Warning {
  memberId: string;
  type: WarningType;
  reason: string;
  date: string;
}

export interface EvaluationInput {
  memberId: string;
  attendance: number;
  interaction: number;
  leadership: number;
  behavior: number;
  bonus: number;
}

export interface MemberData {
  id: string;
  name: string;
  year: Year;
  isOut?: boolean;
}

export interface Member extends MemberData {
  hasEvaluation: boolean;
  grades: Grades;
  bonus: number;
  totalScore: number;
  combinedScore: number;
  warnings: Warning[];
}

export type ContributionRole = 
  | 'media_contributor' 
  | 'media_excellence' 
  | 'hr_contributor' 
  | 'hr_excellence';

export interface MemberContribution {
  memberId: string;
  role: ContributionRole;
  note?: string;
}

export interface MonthData {
  evaluations: EvaluationInput[];
  warnings: Warning[];
  contributions?: MemberContribution[];
}

export interface Quote {
  text: string;
  author?: string;
}
