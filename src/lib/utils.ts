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

export function extractSearchParam(sp: string | string[] | undefined) {
  return Array.isArray(sp) ? sp[0] : sp;
}
