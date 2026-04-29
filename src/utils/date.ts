export function formatThaiShort(date: string | Date) {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}
