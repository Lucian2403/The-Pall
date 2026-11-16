/** Control Claudia's portrait by the *conversation*, not by the stage number.
 * A reply from YOU is still part of the conversation, so she does not
 * disappear and reappear on alternate dialogue beats. */
export type StitcherConversationState={
  stage:number;
  phase:string;
  branch:string|null;
  dialogueLine:number;
};

export function shouldShowClaudia(s:StitcherConversationState,started:boolean):boolean{
  if(!started)return false;
  if(s.stage===1)return s.phase==='intro';
  if(s.stage===2)return s.phase==='report';
  if(s.stage===3)return s.phase==='claudia'||s.phase==='choose';
  // Claudia joins the Consent-paper conversation only when it reaches her,
  // from the clerk's last line onward. The player reply is still spoken to her.
  if(s.stage===4)return s.phase==='dialogue'&&
    s.branch==='consent'&&s.dialogueLine>=5&&s.dialogueLine<=7;
  return false;
}
