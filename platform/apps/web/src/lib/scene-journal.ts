/** One Journal reader, owned by TutorialShell. Scenes provide live prose only.
 * Only the rented home's hotspot uses the optional externally controlled form. */
export const SCENE_JOURNAL_CONTEXT='pall-scene-journal' as const;
export type SceneJournalRecord={title?:string;entries?:readonly string[]};
export type SceneJournalController=SceneJournalRecord & {open:boolean;toggle:()=>void};
export type SceneJournalRegistrar=(record:SceneJournalRecord|null)=>void;
