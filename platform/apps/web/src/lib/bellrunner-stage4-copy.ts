/** Exact approved Bellrunner Stage 4 spoken lines (2026-10-15).
 * Narrative hints and work choices follow the approved Stage 4 contract.
 * Keep the NPCs unnamed except by their approved role.
 */
export type StageFourBranch='contracts'|'trauma'|'machinery';
export type StageFourPhase='opening'|'inspect'|'detail'|'confirm'|'choose'|'revelation'|'finish'|'done'|'exited';
export type StageFourAction='continue_opening'|'compare_shift_records'|'inspect_absence_category'|'request_attendance_basis'|'enter_written_objection'|'submit_certificate'|'prioritize_urgent_worker'|'prioritize_mobile_worker'|'take_observations'|'bring_next_worker'|'compare_medical_register'|'ask_for_worksite_note'|'ask_about_charge'|'finish_handover'|'inspect_safety_linkage'|'trace_bell_rod'|'compare_linkage_marks'|'show_mechanic_link'|'mark_pin_position'|'request_second_check'|'record_inspection'|'continue_revelation'|'leave_for_gate';
export type StageFourLine={speaker:'Player'|'Clerk'|'Attendant'|'Mechanic';text:string};
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
    entry:'The Infirmary Attendant is moving between two waiting workers.',
    opening:[
      {speaker:'Attendant',text:'Come over here a moment. I need a hand with these two.'},
      {speaker:'Player',text:'That man can barely get a word out.'},
      {speaker:'Attendant',text:'I see him. Bring him over. Easy now.'}
    ],
    revelation:[
      {speaker:'Player',text:"Why does the book say they didn't get sick at work?"},
      {speaker:'Attendant',text:"I can't tell you what made them ill just from looking at them. I've written down where they were."},
      {speaker:'Player',text:"But they're still going to have to pay for treatment?"},
      {speaker:'Attendant',text:"Yes. I can't change the charge."}
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
  fact:string;done:string;next:string
}>;

export const STAGE_FOUR_ACTION_LABELS:Record<StageFourAction,string>={
  continue_opening:'Continue',
  compare_shift_records:'Compare the notice and attendance sheet',
  inspect_absence_category:'Examine the attendance category',
  request_attendance_basis:'Request the basis for the absence entry',
  enter_written_objection:'Enter a written objection',
  submit_certificate:'Submit the disputed certificate',
  prioritize_urgent_worker:'Worker B — struggling to speak',
  prioritize_mobile_worker:'Worker A — can walk and speak',
  take_observations:'Take observations for the attendant',
  bring_next_worker:'Bring the next worker to the attendant',
  compare_medical_register:'Compare the observations and medical register',
  ask_for_worksite_note:'Ask for the worksite to be written in the notes',
  ask_about_charge:'Ask why the charge is on the worker',
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
    inspect:'Worker A can walk and speak in full sentences despite coughing. Worker B struggles to speak between breaths. Who needs the trained attendant first?',
    detail:'The attendant takes responsibility for the urgent worker. Choose how to assist the waiting line while staff provide care.',
    confirm:'The worksite and visible symptoms are noted. The register category says “Non-work illness”; the charge is assigned to the worker.',
    choose:'The medical register does not match the reported worksite circumstances. Ask the attendant about the notes or the charge.',
    finish:'The attendant has taken responsibility for both workers. Complete the handover.'
  },
  machinery:{
    inspect:'From the accessible exterior service side: the ventilation shutoff is ENGAGED while the shift bell linkage is STILL ACTUATING. Observe, do not touch.',
    detail:'Choose a safe visual check while the City-Works Mechanic supervises. Both methods lead to the retaining pin beyond the safety stop.',
    confirm:'A repositioned retaining pin holds a secondary link clear of the engaged stop. The bell is still mechanically connected.',
    choose:'The mechanic confirms the held-open link. Record the finding without touching the moving apparatus.',
    finish:'The safety defect has been documented for authorized staff. The apparatus remains untouched.'
  }
};
