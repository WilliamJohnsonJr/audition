import { createContext } from "react";

export const baseUrl = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:5000";
export const BaseUrlContext = createContext("");
