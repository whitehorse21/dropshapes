export function formatMonthYear(dateString) {
  if (!dateString) return "";
  
  // If "Present" or already a string label, return as is
  if (dateString.toLowerCase() === "present") return "Present";

  const date = new Date(dateString);

  // Handle invalid date input
  if (isNaN(date)) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short", // e.g., "Jan", "Feb"
  });
}


export function getFullYear(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.getFullYear();
}
