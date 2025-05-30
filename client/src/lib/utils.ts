import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function bufferArrayToBase64(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
}
