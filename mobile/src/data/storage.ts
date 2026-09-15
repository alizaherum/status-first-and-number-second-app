import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types";
import { SEED_TASKS } from "./seed";

const STORAGE_KEY = "ppm.tasks.v1";
const SEEDED_KEY = "ppm.seeded.v1";

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Task[];
    } catch {
      return [];
    }
  }
  const alreadySeeded = await AsyncStorage.getItem(SEEDED_KEY);
  if (!alreadySeeded) {
    await AsyncStorage.setItem(SEEDED_KEY, "1");
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
    return SEED_TASKS;
  }
  return [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export async function clearAllTasks(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
