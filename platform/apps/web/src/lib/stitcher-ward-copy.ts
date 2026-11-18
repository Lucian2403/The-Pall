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
 check_load:'Check what\'s on the trolley',
 balance_load:'Make sure the load is steady',
 route_short:'Take the narrow passage',
 route_wide:'Take the wider passage',
 check_receiver:'Check if the receiving mark matches your dispatch note',
 match_consent:'Check that both papers belong to the same patient',
 check_medicine:'Check the times and witness records',
 attach_record:'Attach the timing record',
 bring_witness:'Bring a witness to the objection',
 mark_disputed:'Mark the transfer disputed',
 compare_admission:'Check what treatment the man has had',
 match_schedule:"Check if the entry is about the same patient",
 copy_pages:'Copy both pages',
 cross_reference:'Write down the matching entries',
 record_difference:'Record the difference between treatment and instruction',
 continue_dialogue:'Continue',
 finish_job:'Record the work and return to the service passage'
};
export const STITCHER_ROUTE_UI={
 trolley:{
  title:'The Night Trolley',
  discipline:'INDUSTRY / HAULING',
  opening:[
   'The trolley stands beside the ward equipment, ready to be moved. You\'ve already been working the charity shift without pay, and there\'s still more to do.',
   'You make sure everything on the trolley is secure before setting off. There are two passages through the infirmary, and you\'ll have to decide which way to go. At the receiving door, someone will need to check the papers. Until you\'re sure everything is in order, you\'re not handing the patient over.'
  ],
  steps:[
   'Before moving the trolley, you look over the list of everything being taken. You need to make sure the patient and all the equipment are there.',
   'The trolley is loaded, but some of the heavier equipment could slide around when you move it. You need to settle everything before setting off.',
   'You come to a split in the corridor. The narrow passage is quicker, but it\'ll be harder to get the trolley through. The wider passage gives you more room, though it\'ll take longer. Both lead to the receiving door.',
   'At the receiving door, a clerk looks at the papers rather than the patient.'
  ],
  finding:'At the receiving door, the clerk wanted the man\'s contract number. Didn\'t even ask his name. I refused to sign him over. He\'s still in the infirmary\'s care, but I doubt that\'s the end of it.'
 },
 consent:{
  title:'The Signed Consent',
  discipline:'COMMERCE / CONTRACTS',
  opening:[
   'You arrive at the ward records desk, where a clerk is busy sorting through papers. You explain what\'s happened with the patient, and he pulls out the charity records and consent form for you to check.',
   'There\'s a thumbprint on the consent form, but that doesn\'t mean the patient knew what he was agreeing to.'
  ],
  steps:[
   'You place the patient\'s records beside the consent form. The names and records match, and there\'s a thumbprint at the bottom. But the patient says he was asleep when they took it. Something isn\'t right here.',
   'You turn to the medicine book. It shows that the patient was given a sleeping draught before his thumbprint was recorded on the consent form.',
   'You can use the timing entry or ask for a witness to mark an honest objection.',
   'The clerk writes down your complaint and marks the transfer as disputed. He leaves the original form alone, so there\'s no doubt about what was written on it.'
  ],
  finding:'The records show that the man was asleep when they took his thumbprint. Someone also heard him say he never agreed to the operation. For now, they can\'t move him.'
 },
 notes:{
  title:'Notes for the Living',
  discipline:'SCHOLARSHIP / INVESTIGATION',
  opening:[
   'You arrive at the records desk, where a copyist pulls out the man\'s casebook and the teaching schedule. He lays them side by side for you to look through. It\'s been a long morning, and you haven\'t earned a coin. Still, you want to know why they\'re planning to operate on this man.',
   'You look through the man\'s records, but there\'s nothing saying he needs another operation.'
  ],
  steps:[
   'You open the man\'s records and read what was wrong with him when he first arrived. Then you look at the treatment he\'s already had. You want to see if there\'s anything the doctors still need to do.',
   'You turn to the teaching schedule and find an entry for a demonstration. It seems to be about the same man, but you want to be sure. You look for the number that matches his records.',
   'The man\'s treatment notes say nothing about another operation, but his name is on the teaching list. You want to keep a record of what you\'ve found.',
   'The records make it clear. The doctors aren\'t planning another operation to treat the man. They only want to use him for a teaching lesson.'
  ],
  finding:'I\'ve checked the man\'s treatment notes against the teaching schedule. He doesn\'t need another operation. The doctors want to use him to teach their students. They\'re planning to cut him open for a lesson. And Claudia knows about it. I haven\'t signed him over, but they could still come for him.'
 }
} as const;
export const STITCHER_STAGE_TITLES:Record<number,string>={
 1:'Claudia Cyka',2:'Morning Dressings',3:'The Teaching Bed',
 4:'Your Second Job',5:'The Empty Sheet'
};
