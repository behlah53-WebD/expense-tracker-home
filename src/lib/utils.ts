import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  compact: boolean = false
): string {
  const safeAmount = isNaN(amount) ? 0 : amount;

  let locale = "en-IN";
  let curr = currency.toUpperCase();

  if (curr === "USD") locale = "en-US";
  else if (curr === "EUR") locale = "de-DE";
  else if (curr === "GBP") locale = "en-GB";
  else {
    curr = "INR";
    locale = "en-IN";
  }

  try {
    if (compact && Math.abs(safeAmount) >= 1000) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: curr,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(safeAmount);
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (error) {
    return `${curr} ${safeAmount.toFixed(2)}`;
  }
}

export function formatDate(dateStringOrDate: string | Date): string {
  const date = typeof dateStringOrDate === "string" ? new Date(dateStringOrDate) : dateStringOrDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(dateStringOrDate: string | Date): string {
  const date = typeof dateStringOrDate === "string" ? new Date(dateStringOrDate) : dateStringOrDate;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

