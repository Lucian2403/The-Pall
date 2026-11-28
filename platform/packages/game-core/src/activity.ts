/** Shared timing contract. A browser clock displays progress; it never commits results. */
export type ActivityRun = Readonly<{
  id: string;
  key: string;
  label: string;
  location?: string;
  blockedActions?: readonly ActivityAction[];
  startedAt: string;
  endsAt: string;
  completedAt: string | null;
}>;

export type ActivitySnapshot = Readonly<{
  activity: ActivityRun | null;
  serverNow: string;
}>;

export function activityRunning(run: ActivityRun | null | undefined): boolean {
  return !!run && run.completedAt === null;
}

/** The clock continues during interaction. A mandatory unresolved interaction
 * can delay completion beyond the nominal end; it never pauses elapsed time. */
export function activityCanFinish(run: ActivityRun, now: Date, interactionPending = false): boolean {
  return activityRunning(run) && !interactionPending && now.getTime() >= Date.parse(run.endsAt);
}

export function activityRemainingSeconds(run: ActivityRun, now: number): number {
  return activityRunning(run) ? Math.max(0, Math.ceil((Date.parse(run.endsAt) - now) / 1000)) : 0;
}

export function activityProgress(run: ActivityRun, now: number): number {
  if (!activityRunning(run)) return 100;
  const start = Date.parse(run.startedAt);
  const duration = Date.parse(run.endsAt) - start;
  return Math.max(0, Math.min(100, 100 * (now - start) / duration));
}

/** Server-owned preview of an available activity, not permission to start it. */
export type ActivityOffer = Readonly<{key:string;label:string;durationSeconds:number}>;
export const ACTIVITY_CONFIRMATION_SECONDS = 15;
export function requiresActivityConfirmation(seconds:number):boolean {
  return seconds >= ACTIVITY_CONFIRMATION_SECONDS;
}

/** Browsing is not an action. Only mutations pass through this policy. */
export type ActivityAction = 'travel' | 'inventory.transfer' | 'inventory.equip' | 'rent.pay' | 'activity.start';
export const PHYSICAL_ACTIONS: readonly ActivityAction[] = ['travel','inventory.transfer','inventory.equip','rent.pay','activity.start'];
export function activityBlocks(run:ActivityRun|null|undefined, action:ActivityAction):boolean {
  return activityRunning(run) && (run!.blockedActions ?? PHYSICAL_ACTIONS).includes(action);
}
export const ACTIVITY_NOTIFICATION_SECONDS = 10;
export function requiresActivityNotification(seconds:number):boolean {
  return seconds > ACTIVITY_NOTIFICATION_SECONDS;
}
export type GameNotification = Readonly<{
  id:string; kind:string; title:string; message:string; createdAt:string; readAt:string|null;
}>;
export type NotificationInbox = Readonly<{items:readonly GameNotification[]; unread:number}>;
export type ActivityStatusSnapshot = ActivitySnapshot & Readonly<{
  notifications?:NotificationInbox|null;
  stamina?:number;
}>;
