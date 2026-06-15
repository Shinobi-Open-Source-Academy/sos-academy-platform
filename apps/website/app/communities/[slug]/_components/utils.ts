import { DAYS_PER_MONTH, DAYS_PER_WEEK, MS_PER_DAY } from '../../../../lib/constants';

export function formatRelativeDate(dateString?: string): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / MS_PER_DAY);

    if (diffDays < DAYS_PER_WEEK) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffDays < DAYS_PER_MONTH) {
      const weeks = Math.floor(diffDays / DAYS_PER_WEEK);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}
