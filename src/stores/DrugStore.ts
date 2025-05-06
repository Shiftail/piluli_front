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
  name: string;
  dosage: number;
  frequency: number;
  interval: number;
  description: string;
}

export interface DrugRead extends Drug {
  id: string;
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

class DrugStore {
  drugs: DrugRead[] = [];
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
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
      });
      const data: DrugRead[] = await response.json();

      if (data) {
        runInAction(() => {
          this.drugs = data;
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

  async addDrug(drug: Drug) {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/drugs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
        body: JSON.stringify(drug),
      });
      const newDrug: DrugRead = await response.json();

      runInAction(() => {
        this.drugs.push(newDrug);
      });
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
