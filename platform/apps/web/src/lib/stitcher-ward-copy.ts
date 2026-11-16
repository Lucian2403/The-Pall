/** Owner-approved 16 Nov Stitcher narration and actions; UI presentation only.
 * The API reducer decides whether the action can be saved. */
export const STITCHER_ACTION_LABEL:Readonly<Record<string,string>>={
 start:'Speak to Claudia',
 ask_linen:"There's hardly any clean linen left.",
 continue_intro:'Continue',
 check_ward:'Check the ward round',
 begin_round:'Begin the dressings round',
 inspect_a:'Inspect Bed A',
 inspect_b:'Inspect Bed B',
 order_bleeding:'See to the bleeding cut first',
 order_dirty:'See to the dirty dressing first',
 prep_cut:'Cut the dressings to fit',
 prep_ready:'Use ready-cut dressings',
 dress_a:'Clean and dress Bed A',
 dress_b:'Clean and dress Bed B',
 check_linen:'Check the linen',
 discard_end:'Discard the touched piece; take fresh linen',
 trim_end:'Trim off the touched end',
 inspect_finished:'Inspect the finished dressings',
 record_linen:'Record treatment and linen used',
 report_claudia:'Continue',
 continue_report:'Continue',
 close_round:'Close the ward round',
 observe_bed:'Look at the patient',
 read_chart:'Read the bedside chart',
 ask_patient:'Ask the patient what happened',
 ask_again:'You never agreed to an operation?',
 continue_patient:'Continue',
 confront_claudia:'Ask Claudia',
 continue_claudia:'Continue',
 choose_trolley:'Follow the transfer',
 choose_consent:'Contest the consent paper',
 choose_notes:"Examine the surgeon's notes",
 continue_opening:'Continue',
 check_load:'Check the load against the docket',
 balance_load:'Arrange equipment to keep the trolley stable',
 route_short:'Take the short, narrow passage',
 route_wide:'Take the longer, roomier passage',
 check_receiver:'Compare the receiving mark to the dispatch note',
 match_consent:'Match the consent paper to the patient record',
 check_medicine:'Check the medicine and witnessing entries',
 attach_record:'Attach the timing record',
 bring_witness:'Bring a witness to the objection',
 mark_disputed:'Mark the transfer disputed',
 compare_admission:'Compare the admission note with care already given',
 match_schedule:"Match the teaching schedule's reference",
 copy_pages:'Copy the treatment and teaching pages',
 cross_reference:'Cross-reference the casebook and teaching list',
 record_difference:'Record the difference between treatment and instruction',
 continue_dialogue:'Continue',
 finish_job:'Record the work and return to the service passage'
};
export const STITCHER_ROUTE_UI={
 trolley:{
  title:'The Night Trolley',
  discipline:'INDUSTRY / HAULING',
  opening:[
   'The transfer trolley is secured beside the ward equipment. The work is part of the unpaid charity cover, not a paid hauling order.',
   'You can choose the passage, check the load, and verify the receiving mark without signing the patient over.'
  ],
  steps:[
   'Check the trolley docket before moving anything. The patient and ward equipment must remain accounted for.',
   'The heavier equipment is balanced and secured. Neither passage requires a dangerous load.',
   'The narrow passage is shorter. The wider passage permits easier handling. Both reach the receiving door.',
   'At the receiving door, a clerk looks at the papers rather than the patient.'
  ],
  finding:'The receiving theatre requests the man by contract number, not by name. The handover remains pending.'
 },
 consent:{
  title:'The Signed Consent',
  discipline:'COMMERCE / CONTRACTS',
  opening:[
   'An unnamed ward clerk opens the charity-bond and consent papers. This is a continuation of the unpaid charity round.',
   'A thumbprint is recorded, but its presence alone does not establish informed agreement.'
  ],
  steps:[
   'The consent sheet and the patient entry refer to the same man.',
   'The medicine entry records a sleeping draught before the thumbprint was registered.',
   'You can use the timing entry or ask for a witness to mark an honest objection.',
   'The clerk prepares a disputed transfer entry without forging a signature.'
  ],
  finding:'The timing record places the mark while the patient was sedated. A witnessed objection puts the handover on hold.'
 },
 notes:{
  title:'Notes for the Living',
  discipline:'SCHOLARSHIP / INVESTIGATION',
  opening:[
   'An unnamed copyist sets out the casebook and the teaching schedule. This is an unpaid review during the existing ward dispute.',
   'No additional surgical procedure is listed as necessary care for the patient.'
  ],
  steps:[
   'Compare the admission note with the treatment already given.',
   'The teaching schedule refers to the patient as a demonstration case.',
   'Choose what to copy so the distinction can be checked from the original entries.',
   'The records show an instructional demonstration, not a treatment requirement.'
  ],
  finding:'The casebook shows no need for another operation; the new procedure is scheduled for instruction alone.'
 }
} as const;
export const STITCHER_STAGE_TITLES:Record<number,string>={
 1:'Claudia Cyka',2:'Morning Dressings',3:'The Teaching Bed',
 4:'Your Second Job',5:'The Empty Sheet'
};
