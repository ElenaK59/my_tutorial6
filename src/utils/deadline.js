export function getDeadlineStatus(deadline) {
  if (!deadline) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);

  const diff = (d - today) / 86400000;

  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return "future";
}
