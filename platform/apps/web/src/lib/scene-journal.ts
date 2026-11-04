/** Shared presentation contract for the persistent journal control in TutorialShell.
 * Scene records remain local to each mounted scene; this has no game mutation.
 */
export const SCENE_JOURNAL_CONTEXT='pall-scene-journal' as const;

export type SceneJournalController={
  id:string;
  open:boolean;
  toggle:()=>void;
};
export type SceneJournalRegistrar=(controller:SceneJournalController|null)=>void;
