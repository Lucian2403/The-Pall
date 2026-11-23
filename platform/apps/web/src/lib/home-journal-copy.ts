/** Stage VIII diary from saved progress. The home, rent and closing speech
 * are shared; only the protagonist's earlier history differs by origin. */
import type {FinaleOrigin} from './shared-finale-origins.js';

// One shared ending screen, but each playable origin has its own unfinished
// story. An exhaustive record prevents an unrelated origin using Millhand copy.
const COMPLETION_SUMMARIES:Record<FinaleOrigin,string>={
 Millhand:'The council has not paid for the plate lot. The dispute over the worker number remains unresolved.',
 Bellrunner:'The condemned worksite remains closed, and your local findings have not been resolved.',
 Stitcher:'The patient remains in the ward under the staff’s care. Owler’s attempted transfer was stopped, but the school may still demand an explanation.'
};
export function homeCompletionSummary(origin:FinaleOrigin):string{
 return COMPLETION_SUMMARIES[origin];
}
export function homeJournalIntro(origin:FinaleOrigin):string{
 if(origin==='Stitcher')
  return "Home at last. Ten coins left after the examination at Cinder Row, and now the rent is a hundred and fifty. I stopped Owler from taking the patient, but I haven't earned a coin for the work. I need paying jobs, or something I can make and sell.";
 return origin==='Bellrunner'
  ?"Home at last. Ten coins left after the clinic, and now I've got a rent notice demanding a hundred and fifty. Two jobs done, not a bloody coin earned. And after everything that's happened today, I'm lucky to be home at all. I need to find work that actually pays."
  :"Home at last. Ten coins left after the clinic, and now the rent is a hundred and fifty. Lovely. Two jobs, no wages, and a fight with Flint on top of it. Need to find some work that actually pays.";
}
export type HomeJournalPhase='JOURNEY'|'DOOR'|'HOME'|'NOTICE'|'SPEECH'|'COMPLETE';
export function homeJournalEntries(
 origin:FinaleOrigin,phase:HomeJournalPhase,rent:number
):string[]{
 const entries=["I'm back at the rented room. There's a notice waiting on the table."];
 if(phase==='NOTICE'||phase==='SPEECH'||phase==='COMPLETE')
  entries.push("The notice says I owe "+rent+" coins in rent, or I'll be out. No discussion.");
 if(phase==='SPEECH'||phase==='COMPLETE')entries.push(homeJournalIntro(origin));
 if(phase==='COMPLETE')
  entries.push("I put the notice down. More paid work, or something to make and sell — I've got to find a way to cover the rent.");
 return entries;
}
