/** Owner-approved combat diaries, shared by scenes and immutable archival.
 * Outcomes are taken from the committed engine snapshot, never the UI. */
export type DiaryEncounter='flint'|'dogman'|'owler';
export type DiaryOutcome='player_victory'|'player_defeat';

export function combatJournal(
 encounter:DiaryEncounter,outcome:string|null|undefined,toughVictory:boolean
):string{
 if(encounter==='owler'){
  return outcome==='player_defeat'
   ?"Owler was stronger than I expected. I went down at the night door. The attendant pulled the trolley back, and the ward staff would not let Owler take the man. Claudia told him to leave. I lost the fight, but the man's transfer was cancelled."
   :"Owler tried to force his way past me. I held him off until he backed away. He said he would tell the school I stopped the transfer. I told him to tell them the patient refused. Claudia cancelled this one transfer, and the man stayed in the ward.";
 }
 if(encounter==='dogman'){
  return outcome==='player_defeat'
   ?"He beat me badly. I went down by the service gate, and the bastard tried to get into my bag. Luckily, some people were coming down the street, and he cleared off before they got too close. Someone helped me towards the clinic. I could barely stand, but at least I still had my route sheet. \nWhatever's going on at that factory, it isn't over yet."
   :toughVictory
     ?"I got past him, but he landed a few good hits. Bastard was quicker than he looked. He finally backed off when he realised he couldn't stop me. At least I kept my papers.\nThe factory's still shut, the night shift's still being called in, and I've no idea who's going to answer for any of it."
     :"Dogman tried to stop me with that thin club. I managed to drive him back and get through the passage. I've still got my bag and route sheet. I don't imagine the Shift Marshal will be pleased, but that doesn't make Dogman a city guard.";
 }
 return outcome==='player_defeat'
  ?"Flint beat me. Damn it. I thought I could get past him, but I couldn't. Other workers came when they heard the fight, and he left without taking my money. One of them helped me get to medical care. Still not a coin from the council for those plates. A fine day I've had."
  :toughVictory
    ?"I beat Flint and got past him. That was tough. For a moment I didn't think I'd manage it, not with that club of his. Everybody knows how hard he is to beat. Well, he didn't get a coin out of me. And after all that, the council still hasn't paid us for those plates."
    :"I beat Flint and got past him. That club could've done some damage, but I managed to keep him off me. He didn't get a coin out of me. The council still owes us for the plates, of course.";
}
