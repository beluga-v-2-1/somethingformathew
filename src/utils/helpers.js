/**
 * Returns a human-readable "X mins ago" / "X hours ago" string.
 */
export function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

/**
 * Derives stock status label and color classes from quantity.
 */
export function stockStatus(qty) {
  if (qty === 0)  return { label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-300" };
  if (qty <= 10)  return { label: "Low Stock",    color: "bg-yellow-100 text-yellow-700 border-yellow-300" };
  return            { label: "In Stock",      color: "bg-green-100 text-green-700 border-green-300" };
}

/**
 * Normalize search input for dictionary lookups.
 */
export function normalize(str) {
  return str.toLowerCase().trim();
}
