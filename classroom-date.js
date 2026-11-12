export const participationCategories = Object.freeze([
  { id: 'question', label: 'Asked a question' },
  { id: 'explanation', label: 'Explained reasoning' },
  { id: 'revision', label: 'Revised work' },
  { id: 'peer-support', label: 'Supported a classmate' },
  { id: 'persistence', label: 'Persisted with a task' },
]);

export function classroomDate(now = Date.now()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(now)).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

