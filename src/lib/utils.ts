import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes.toString().padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

export const snakeCaseToTitle = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
