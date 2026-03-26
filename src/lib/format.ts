export function formatCompactNumber(number: number | string): string {
  if (number === null || number === undefined || number === "") return "0";
  
  const num = typeof number === "string" ? parseInt(number.replace(/,/g, ""), 10) : number;
  if (isNaN(num)) return typeof number === "string" ? number : "0";
  
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num).toLowerCase();
}
