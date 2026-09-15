export type CategoryKey = "admin" | "comm" | "creative" | "learning" | "errands" | "physical";
export type EffortKey = "quick" | "medium" | "deep";
export type TaskStatus = "on_time" | "delayed";

export interface Task {
  id: string;
  title: string;
  category: CategoryKey;
  scheduledHour: number; // 0-23
  effortLevel: EffortKey;
  status: TaskStatus;
  delayMinutes: number;
  loggedAt: string; // ISO
}
