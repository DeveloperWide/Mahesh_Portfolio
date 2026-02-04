import axios from "axios";
import { getToken } from "./authStorage";

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:8080/api";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

export const instance = axios.create({
  baseURL,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
