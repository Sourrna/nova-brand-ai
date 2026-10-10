import type { Mission } from "../engine/types";

export interface MissionStore {
  getMission(id: string): Promise<Mission | undefined>;
  saveMission(mission: Mission): Promise<void>;
  listMissions(): Promise<Mission[]>;
  deleteMission(id: string): Promise<void>;
}

/**
 * Volatile in-memory store. State lives only for the current process session
 * and is NOT restart-persistent: server restarts or page reloads lose all
 * missions. This initial integration does not provide durable autonomy.
 */
export class InMemoryMissionStore implements MissionStore {
  private store = new Map<string, Mission>();

  clear(): void {
    this.store.clear();
  }

  async getMission(id: string): Promise<Mission | undefined> {
    return this.store.get(id);
  }

  async saveMission(mission: Mission): Promise<void> {
    this.store.set(mission.id, mission);
  }

  async listMissions(): Promise<Mission[]> {
    return Array.from(this.store.values());
  }

  async deleteMission(id: string): Promise<void> {
    this.store.delete(id);
  }
}

let defaultStore: MissionStore | null = null;

export function getMissionStore(): MissionStore {
  if (!defaultStore) {
    defaultStore = new InMemoryMissionStore();
  }
  return defaultStore;
}
