import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeRestTime(restTime: unknown) {
  return typeof restTime === "number" && Number.isFinite(restTime)
    ? restTime
    : undefined;
}
