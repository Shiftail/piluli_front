import { AuthStore } from "./AuthStore";
import { SpotsStore } from "./SpotsStore";
import { TeamStore } from "./TeamsStore";

const authStore = new AuthStore();
const spotsStore = new SpotsStore(authStore);
const teamsStore = new TeamStore(authStore);

export const stores = {
  authStore,
  spotsStore,
  teamsStore,
};

export type StoresType = typeof stores;
