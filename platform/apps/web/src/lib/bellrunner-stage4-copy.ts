/** Bellrunner Stage 4: the owner's revised First Aid Line dialogue (2026-11-12).
 * Only the Trauma branch is revised here. Commerce / Mechanics keep their
 * previously approved copy, job mechanics, rewards and location artwork.
 */
export type StageFourBranch='contracts'|'trauma'|'machinery';
export type StageFourPhase='opening'|'inspect'|'triage_response'|'detail'|'confirm'|'choose'|'revelation'|'finish'|'done'|'exited';
export type StageFourAction='continue_opening'|'compare_shift_records'|'inspect_absence_category'|'request_attendance_basis'|'enter_written_objection'|'submit_certificate'|'prioritize_urgent_worker'|'prioritize_mobile_worker'|'take_observations'|'bring_next_worker'|'continue_triage'|'continue_detail'|'continue_register'|'ask_about_classification'|'finish_handover'|'inspect_safety_linkage'|'trace_bell_rod'|'compare_linkage_marks'|'show_mechanic_link'|'mark_pin_position'|'request_second_check'|'record_inspection'|'continue_revelation'|'leave_for_gate';
export type StageFourLine={speaker:'Player'|'Clerk'|'Attendant'|'Mechanic'|'Narration';text:string};
export const BELLRUNNER_STAGE_FOUR={
  contracts:{
    title:'Attendance Certificate',
    discipline:'Commerce / Contracts',
    place:'Shift-Office Records Counter',
    image:'/locations/contracts/contracts-office.webp',
    aspect:2,
    entry:'The Shift-Office Clerk takes the dispatch slip but leaves the sealed-site receiving space blank.',
    opening:[
      {speaker:'Clerk',text:"Where's the mark from the receiving office?"},
      {speaker:'Player',text:'The office was locked up. The watchman took the letter.'},
      {speaker:'Clerk',text:"Then I can't say the works received it."},
      {speaker:'Player',text:"So what do I put on the form? I didn't just throw it in the street."},
      {speaker:'Clerk',text:"Write down what happened. I'll record that much."}
    ],
    revelation:[
      {speaker:'Player',text:'But he was there. I saw him waiting by the gate. Why have you marked him absent?'},
      {speaker:'Clerk',text:"He didn't go inside when the bell rang."},
      {speaker:'Player',text:"The place is shut. There's a notice on the gate telling people not to go in."},
      {speaker:'Clerk',text:"I can note that. I can't change how he's marked."}
    ],
    fact:"Workers refusing the condemned site are listed voluntarily absent and lose wages.",
    done:'The attendance certificate is marked disputed, not cleared. The closed site still has no authorized receiving mark.',
    next:'Outside service gate'
  },
  trauma:{
    title:'First Aid Line',
    discipline:'Medicine / Trauma',
    place:'Staffed First-Aid Point',
    image:'/locations/clinic/clinic-workshop-cold.webp',
    aspect:2,
    entry:'Two workers have been brought to the first-aid point.',
    opening:[
      {speaker:'Narration',text:'Two workers have been brought to the first-aid point.'},
      {speaker:'Narration',text:"One is coughing badly, but he's on his feet, telling the attendant what happened at the factory. The other is leaning against the wall. He tries to speak, manages a few words, then stops to catch his breath."},
      {speaker:'Attendant',text:"Give me a hand here. I've got two men waiting, and I can only see one at a time. Bring me the one who needs me first."}
    ],
    triageResponse:{
      urgent:[
        {speaker:'Player',text:"This one's having trouble getting a word out."},
        {speaker:'Attendant',text:"I can see that. Don't force it. Bring him here."},
        {speaker:'Narration',text:'You help the worker over to the attendant.'}
      ],
      corrected:[
        {speaker:'Attendant',text:"No, leave him a moment. The other one's having trouble breathing. Help me get him over here first."},
        {speaker:'Narration',text:'You turn to the other worker and help him over to the attendant.'}
      ]
    },
    assistance:[
      {speaker:'Narration',text:'The attendant takes the man struggling to breathe over to a treatment bench. The other worker waits nearby, still coughing.'},
      {speaker:'Attendant',text:"I've got him now. There's still that other fellow waiting, and I've got my hands full."},
      {speaker:'Player',text:'What can I do?'},
      {speaker:'Attendant',text:"I need to know where he was working and what's happened to him. Or you can bring him over when I'm ready. Either way, don't leave him standing there all day."}
    ],
    register:{
      observations:[
        {speaker:'Narration',text:'You finish writing down what the workers told you. Both had been waiting outside the closed factory. The attendant takes your notes and enters the details in the medical register.'},
        {speaker:'Attendant',text:"Right. That's enough for now. I'll take it from here."},
        {speaker:'Narration',text:'As the attendant turns to the next patient, you look over the entry.'},
        {speaker:'Narration',text:'Under the illness category, someone has written “Non-work illness.”'},
        {speaker:'Narration',text:'The worksite and symptoms have been recorded correctly. But despite the factory being closed for dangerous fumes, the illness is classified as unrelated to work. The worker is listed as responsible for paying the medical charges.'},
        {speaker:'Player',text:"Hang on. You're charging them as if they got sick somewhere else?"}
      ],
      escort:[
        {speaker:'Narration',text:'You help the next worker over when the attendant is ready. He tells her what happened outside the closed factory, and she enters the details in the medical register.'},
        {speaker:'Attendant',text:"Right. That's enough for now. I'll take it from here."},
        {speaker:'Narration',text:'As the attendant turns to the next patient, you look over the entry.'},
        {speaker:'Narration',text:'Under the illness category, someone has written “Non-work illness.”'},
        {speaker:'Narration',text:'The worksite and symptoms have been recorded correctly. But despite the factory being closed for dangerous fumes, the illness is classified as unrelated to work. The worker is listed as responsible for paying the medical charges.'},
        {speaker:'Player',text:"Hang on. You're charging them as if they got sick somewhere else?"}
      ]
    },
    revelation:[
      {speaker:'Narration',text:'The worker on the treatment bench starts coughing again. The attendant glances over at him, then turns back to you.'},
      {speaker:'Attendant',text:"Look, I've written down where they came from and what's wrong with them. But I can't say for certain what's made them sick. Not yet."},
      {speaker:'Player',text:"Then why the hell does it say ‘Non-work illness’?"},
      {speaker:'Attendant',text:"That's how it's been entered."},
      {speaker:'Player',text:"The factory's shut because of the fumes! That man's barely breathing, and now you're telling me he's got to pay for his own treatment? Can't you change it?"},
      {speaker:'Attendant',text:"No. I've put your observations down, but the charge stays unless someone with the authority changes it."},
      {speaker:'Narration',text:'The worker starts coughing harder. The attendant turns toward him.'},
      {speaker:'Attendant',text:"Listen, I've got two sick men here. I need to see to them. You've done what I asked."},
      {speaker:'Narration',text:'She goes back to the treatment bench.'}
    ],
    fact:'The first-aid register assigns non-work illness to the affected workers, leaving them responsible for treatment charges.',
    done:'The patients remain with trained staff. The register still classifies the charges as non-work illness.',
    next:'Outside service gate'
  },
  machinery:{
    title:'The Bell Linkage',
    discipline:'Mechanics / Industrial Machinery',
    place:'Industrial Courtyard · Outside Service Controls',
    image:'/locations/industrial/industrial-courtyard.webp',
    aspect:1672/941,
    entry:"The City-Works Mechanic stops the courier's hand short of the moving linkage.",
    opening:[
      {speaker:'Mechanic',text:'Keep your hands back. See that little stop there?'},
      {speaker:'Player',text:"Yes. It's already shut."},
      {speaker:'Mechanic',text:'Right. Now look at the rod leading up to the bell.'}
    ],
    revelation:[
      {speaker:'Player',text:"Wait. Is that pin what's keeping the bell ringing?"},
      {speaker:'Mechanic',text:'Yes. Someone moved it so the bell would work even with the shutoff down.'},
      {speaker:'Player',text:"Can't we just pull it out?"},
      {speaker:'Mechanic',text:"Not while it's moving. Leave it alone till we've checked everything."}
    ],
    fact:'The ventilation safety shutoff is engaged, yet a repositioned retaining pin keeps the shift bell connected.',
    done:'The safety defect is recorded. The apparatus remains untouched and the condemned site is not reopened.',
    next:'Outside service gate'
  }
} as const satisfies Record<StageFourBranch,{
  title:string;discipline:string;place:string;image:string;aspect:number;
  entry:string;opening:readonly StageFourLine[];revelation:readonly StageFourLine[];
  triageResponse?:{urgent:readonly StageFourLine[];corrected:readonly StageFourLine[]};
  assistance?:readonly StageFourLine[];
  register?:{observations:readonly StageFourLine[];escort:readonly StageFourLine[]};
  fact:string;done:string;next:string
}>;

export const STAGE_FOUR_ACTION_LABELS:Record<StageFourAction,string>={
  continue_opening:'Continue',
  compare_shift_records:'Compare the notice and attendance sheet',
  inspect_absence_category:'Examine the attendance category',
  request_attendance_basis:'Request the basis for the absence entry',
  enter_written_objection:'Enter a written objection',
  submit_certificate:'Submit the disputed certificate',
  prioritize_urgent_worker:'Help the man struggling to breathe.',
  prioritize_mobile_worker:"Help the man who's still walking and talking.",
  continue_triage:'Continue',
  continue_detail:'Continue',
  take_observations:'Ask the worker what happened and write it down.',
  bring_next_worker:'Help the next worker over to the attendant.',
  continue_register:'Continue',
  ask_about_classification:'Ask the attendant why the illness is classified as non-work-related.',
  finish_handover:'Finish the handover',
  inspect_safety_linkage:'Inspect shutoff and linkage',
  trace_bell_rod:'Trace the bell rod',
  compare_linkage_marks:'Compare the stop and its linkage marks',
  show_mechanic_link:'Show the mechanic the held-open link',
  mark_pin_position:"Mark the pin's position on the work sketch",
  request_second_check:'Request a second check',
  record_inspection:'Record the inspection',
  continue_revelation:'Continue',
  leave_for_gate:'Continue to the outside service gate'
};
export const STAGE_FOUR_TASK_TEXT:Record<StageFourBranch,Partial<Record<StageFourPhase,string>>>={
  contracts:{
    inspect:'The shift book lists the closed industrial block for the night crew. Check the dispatch notice against the attendance sheet.',
    detail:'A worker who refused to enter the fume-closed block is marked “Absent by choice”. The wages column reads “Not payable”. Examine why.',
    choose:'The closure notice contradicts treating refusal as voluntary absence. Choose how to record this discrepancy honestly.',
    finish:'The shift-office clerk can log your objection, but cannot supply the shuttered worksite\'s receiving mark.'
  },
  trauma:{
    // Legacy pre-revision saved states can still open an already-reached
    // "inspect", "choose" or "finish" without a stale documentary recap.
    inspect:"The man against the wall tries to speak again. The attendant watches you, waiting for your help.",
    choose:'The medical register still says “Non-work illness.”',
    finish:'She goes back to the treatment bench.'
  },
  machinery:{
    inspect:'From the accessible exterior service side: the ventilation shutoff is ENGAGED while the shift bell linkage is STILL ACTUATING. Observe, do not touch.',
    detail:'Choose a safe visual check while the City-Works Mechanic supervises. Both methods lead to the retaining pin beyond the safety stop.',
    confirm:'A repositioned retaining pin holds a secondary link clear of the engaged stop. The bell is still mechanically connected.',
    choose:'The mechanic confirms the held-open link. Record the finding without touching the moving apparatus.',
    finish:'The safety defect has been documented for authorized staff. The apparatus remains untouched.'
  }
};
