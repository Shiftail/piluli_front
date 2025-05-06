import { makeAutoObservable, runInAction } from "mobx";

export interface IUserRead {
  id: string;
  username: string;
  email: string;
  password: string;
  gender: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  age: number;
  tg_id: number;
  timezone: number;
}

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
  gender: boolean;
  age: number;
  tg_id: number;
  time_zone: number;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

class AuthStore {
  user: IUserRead | null = null;
  isAuthenticated: boolean = false;
  access_token: string = "";

  constructor() {
    makeAutoObservable(this);
    const storedToken = sessionStorage.getItem("access_token");
    const storedUser = sessionStorage.getItem("user");

    if (storedToken) {
      this.access_token = storedToken;
      this.isAuthenticated = true;
    }

    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
      }
    }
  }

  register = async (user: IUserCreate) => {
    const response = await fetch(`${baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка регистрации");
    }

    return await response.json();
  };

  login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    formData.append("grant_type", "password");
    try {
      const userDataResponse = await fetch(`${baseURL}/auth/jwt/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const response = await userDataResponse.json();

      if (!userDataResponse.ok) {
        throw new Error("Login failed");
      }

      const getUserResponse = await fetch(`${baseURL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${response.access_token}`,
        },
      });

      if (!getUserResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userResponse = await getUserResponse.json();

      runInAction(() => {
        this.access_token = response.access_token;
        this.isAuthenticated = true;
        this.user = userResponse;
        sessionStorage.setItem("access_token", response.access_token);
        sessionStorage.setItem("user", JSON.stringify(userResponse));
      });
    } catch (error) {
      throw error; // пробросим для возможного UI-обработчика
    }
  };

  logout = () => {
    this.isAuthenticated = false; // Reset authentication state
    this.access_token = ""; // Clear access token
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("telegram_id");
    sessionStorage.removeItem("user");
    this.user = {
      id: "",
      username: "",
      email: "",
      password: "",
      gender: false,
      is_active: false,
      is_superuser: false,
      is_verified: false,
      age: 0,
      tg_id: 0,
      timezone: 0,
    };
  };

  static use() {
    return authStoreInstance;
  }
}

const authStoreInstance = new AuthStore();
export { AuthStore };
