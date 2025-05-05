import { makeAutoObservable, runInAction } from "mobx";
import { AuthStore } from "./AuthStore";

export interface DrugSchedule {
  name_drug: string;
  dosage: number;
  frequency: number;
  interval: number;
  description: string;
  start_datetime: string;
  end_datetime: string;
  start_schedule: string;
  is_active: boolean;
}

export interface Drug {
  id: string;
  name: string;
  dosage: number;
  frequency: number;
  interval: number;
  description: string;
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

class DrugStore {
  drugs: Drug[] = [];
  loading: boolean = false;
  error: string | null = null;
  authStore = AuthStore.use();

  constructor() {
    makeAutoObservable(this);
  }
  async fetchDrugs() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/drugs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
      });
      const data = await response.json();

      if (data) {
        const drugs: Drug[] = [];
        runInAction(() => {
          this.drugs = drugs;
        });
      }
    } catch (e) {
      runInAction(() => {
        this.error = "Ошибка при загрузке данных.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  static use() {
    return DrugStoreInstance;
  }
}

const DrugStoreInstance = new DrugStore();
export { DrugStore };
