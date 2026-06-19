export const formatCurrency = (
  amount: number,
  currency: string = "PHP",
): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDate = (
  date: Date | string,
  locale: string = "en-PH",
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const formatDateTime = (
  date: Date | string,
  locale: string = "en-PH",
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const truncate = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};
