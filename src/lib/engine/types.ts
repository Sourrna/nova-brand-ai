export type MissionStatus =
  "queued" | "planning" | "running" | "waiting_for_approval" | "completed" | "failed" | "cancelled";

export type TaskStatus =
  | "pending"
  | "planning"
  | "running"
  | "waiting_for_approval"
  | "completed"
  | "failed"
  | "cancelled"
  | "skipped";

export interface Task {
  id: string;
  missionId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dependsOn: string[];
  attempts: number;
  maxAttempts: number;
  approved?: boolean;
  timeoutMs?: number;
  tool?: string;
  toolInput?: unknown;
  output?: unknown;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  lastUpdatedAt: string;
  verification?: {
    passed: boolean;
    reason: string;
    checkedAt?: string;
  };
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  status: MissionStatus;
  owner: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  lastUpdatedAt: string;
  tasks: Task[];
  metadata?: Record<string, unknown>;
  report?: string;
}
