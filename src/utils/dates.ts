import { format, formatDistanceToNow, differenceInDays, isValid } from 'date-fns';

function safeParse(iso: string): Date | null {
  const d = new Date(iso);
  return isValid(d) ? d : null;
}

export function formatDate(iso: string): string {
  const d = safeParse(iso);
  return d ? format(d, 'MMM d, yyyy') : iso;
}

export function formatDateTime(iso: string): string {
  const d = safeParse(iso);
  return d ? format(d, 'MMM d, yyyy h:mm a') : iso;
}

export function formatRelative(iso: string): string {
  const d = safeParse(iso);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : iso;
}

export function daysUntil(iso: string): number {
  const d = safeParse(iso);
  return d ? differenceInDays(d, new Date()) : 0;
}

export function daysSince(iso: string): number {
  const d = safeParse(iso);
  return d ? differenceInDays(new Date(), d) : 0;
}

export function toUtcString(iso: string): string {
  const d = safeParse(iso);
  return d ? d.toISOString() : iso;
}
