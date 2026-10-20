import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BACKEND_BASE = (import.meta.env.VITE_API_URL || "https://api.isowcod.org.ng").replace(/\/$/, "");

/**
 * Normalizes media URLs so images stored on DirectAdmin or in public assets
 * load reliably regardless of deployment origin.
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Handle uploaded files from DirectAdmin backend (/api/uploads/ or /uploads/)
  if (path.startsWith("/api/uploads/")) {
    return `${BACKEND_BASE}${path}`;
  }
  if (path.startsWith("/uploads/")) {
    return `${BACKEND_BASE}/api${path}`;
  }

  // Seeded assets (/inaguration.png, /profiles/..., /logo.png) exist in public directory
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Secondary fallback URL if the primary media path fails to load
 */
export function getMediaFallbackUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.replace(/^\//, "");
  if (path.startsWith("/profiles/")) {
    return `${BACKEND_BASE}${path}`;
  }
  return `${BACKEND_BASE}/uploads/gallery/${clean}`;
}

