/**
 * Stage 4 approved content transcribed from:
 * docs/05-gameplay/onboarding/millhand/stage-4-approved-script.md
 * A01 corrective worker-number stamp was already committed in Stage 3.
 * Exact worker number and calendar dates are deliberately never fabricated.
 */
import type {MissingStampBranch,SecondJobAction,SecondJobPhase,SecondJobState} from '@the-pall/game-core';

export const STAGE_FOUR_ROUTES={
  restamp:{name:'Depot Intake Run',family:'Industry / Hauling',location:'Municipal depot',
    entry:'Guther leaves the council work paper beside the plates. You make one more worker-number mark, leaving the council inspector\'s mark alone. The finished plates are together with the work paper.',
    task:'Carry the numbered plates to the municipal depot and have the delivery recorded.'},
  contracts:{name:'Disputed Docket',family:'Commerce / Contracts',location:'Council Contracts office',
    entry:"You enter the council's Contracts office with the disputed work paper. A clerk is working at the counter.",
    task:'Examine the work paper, compare the official entries and record a challenge.'},
  records:{name:'Ledger Reconciliation',family:'Scholarship / Investigation',location:'Council records room',
    entry:"You enter the council's records room and ask for the records connected with the worker number. An archive assistant brings out the death register. The pages show wear along the edges from repeated handling.",
    task:'Compare the death and later wage records, examine the damaged entry and record your findings.'}
} as const;

export const STAGE_FOUR_DIALOGUE={
  restamp:[
    {speaker:'Depot Clerk',text:'Put the plates there. I need your mark for the delivery.'},
    {speaker:'Player',text:"They've written ‘workers’ here. I've brought plates."},
    {speaker:'Depot Clerk',text:'Aye. I can see that.'},
    {speaker:'Player',text:'Are you going to record it like that?'},
    {speaker:'Depot Clerk',text:"No. I'll record what you've brought. But I can't change the council's other papers."}
  ],
  contracts:[
    {speaker:'Contracts Clerk',text:'Which entry have you come about?'},
    {speaker:'Player',text:"Both. Here they've recorded the man as dead. In this one they're still charging for him."},
    {speaker:'Contracts Clerk',text:'Both entries were accepted. Both have council seals.'},
    {speaker:'Player',text:'Who checked them?'},
    {speaker:'Contracts Clerk',text:"I can look up how they were entered. I can't change them myself."},
    {speaker:'Player',text:'Then I want the difference recorded.'},
    {speaker:'Contracts Clerk',text:"You can ask for the seals to be checked, or put your complaint on the work paper. Either way, I can't approve the lot here."}
  ],
  records:[
    {speaker:'Player',text:'Someone scraped the ink off this line.'},
    {speaker:'Archive Assistant',text:"Don't rub it. The paper's thin there."},
    {speaker:'Player',text:'Do you know who changed it?'},
    {speaker:'Archive Assistant',text:"No. I don't know."}
  ]
} as const;

export const STAGE_FOUR_INSTRUCTIONS:Record<SecondJobPhase,string>={
  CHECK_LOAD:'Check the plates and compare the load with the work paper.',
  CHOOSE_TRANSPORT:'Decide how to move the plates.',
  COMPARE_DELIVERY:'Compare the delivery list with the plates.',
  SPEAK_DEPOT:'Speak to the Depot Clerk about the delivery.',
  DEPOT_DIALOGUE:'Speak with the Depot Clerk.',
  CHOOSE_RECEIPT:'Decide how to record the delivery.',
  COMPLETE_DELIVERY:'Complete the delivery.',
  EXAMINE_PAPER:'Read the council work paper and find the worker number and seals.',
  COMPARE_RECORDS:'Compare the two official records.',
  SPEAK_CONTRACTS:'Ask the clerk how the two entries can both be accepted.',
  CONTRACTS_DIALOGUE:'Speak with the Contracts Clerk.',
  CHOOSE_CHALLENGE:'Decide how to challenge the two entries.',
  SUBMIT_DISPUTE:'Submit the disputed work paper.',
  READ_DEATH_REGISTER:'Find the worker number in the death register.',
  READ_WAGE_RECORD:'Compare the death entry with the later wage records.',
  EXAMINE_SCRAPED_ENTRY:'Examine the altered entry.',
  SPEAK_ARCHIVE:'Speak to the Archive Assistant about the damaged line.',
  ARCHIVE_DIALOGUE:'Speak with the Archive Assistant.',
  CHOOSE_SOURCE:'Use another record to check the damaged entry.',
  RECORD_FINDING:'Write down what you found.',
  DONE:'The work is complete.'
};

export const STAGE_FOUR_ACTION_LABELS:Record<SecondJobAction,string>={
  check_load:'Check the load',
  secure_plates:'Secure the plates together',
  carry_smaller_loads:'Carry the plates in smaller loads',
  compare_delivery_list:'Compare the delivery list',
  speak_to_depot_clerk:'Speak to the Depot Clerk',
  record_goods_as_plates:'Record the goods as plates',
  request_delivery_correction:'Ask for the delivery list to be corrected before signing',
  complete_delivery:'Complete the delivery',
  examine_work_paper:'Examine the work paper',
  compare_official_records:'Compare the two official records',
  speak_to_contracts_clerk:'Speak to the Contracts Clerk',
  request_seal_check:'Ask the clerk to check both seals',
  mark_conflicting_entries:'Mark the two conflicting entries on the work paper',
  submit_dispute:'Submit the disputed work paper',
  read_death_register:'Read the death register',
  check_wage_record:'Check the wage record',
  examine_scraped_entry:'Examine the scraped entry',
  speak_to_archive_assistant:'Speak to the Archive Assistant',
  compare_neighbouring_entries:'Compare the entries above and below it',
  compare_shift_book:'Compare the shift book with the wage record',
  record_finding:'Record the difference',
  continue_dialogue:'Continue'
};

export const STAGE_FOUR_OUTCOMES:Partial<Record<SecondJobAction,string>>={
  check_load:'You count the plates and compare the load with the work paper. The number matches the delivery entry. You check whether any are loose or damaged.',
  secure_plates:'You fasten the plates together for transport. A heavy load can shift if you do not keep it steady.',
  carry_smaller_loads:'You split the plates into smaller bundles and carry them to the depot in several trips. Each load is easier to handle, though moving everything takes longer.',
  compare_delivery_list:'You check the delivery list. Under goods, some fool\'s written “workers”.',
  record_goods_as_plates:'You enter “plates” in the received-goods record. The clerk confirms that the depot received the metal plates.',
  request_delivery_correction:'You ask the clerk to check the incorrect goods entry before signing. The clerk reviews the papers and acknowledges that the depot received metal plates. The original entry remains unexplained.',
  complete_delivery:'The depot staff take the plates. The receipt records metal plates, not workers. You have not received any wages.',
  examine_work_paper:'You find the worker number, the council seal and the office responsible for the contract. The clerk brings out the related records.',
  compare_official_records:'In the compensation record the worker is entered as dead. In the contract-charge record the same worker is entered as active. Both records have council seals.',
  request_seal_check:'The clerk checks how the two records were entered. Both entries appear in the council records with their seals. The clerk cannot explain the difference.',
  mark_conflicting_entries:'You mark the two entries and the difference between them. The clerk records your complaint but changes neither entry.',
  submit_dispute:'The clerk records that the complaint has been received. Both entries remain unchanged. The council has not approved the plate lot, and you are not paid.',
  read_death_register:'You find the worker number beside the entry for a fire in a locked workshop. The council recorded the worker as dead.',
  check_wage_record:'You find the same worker number in a wage entry made after the recorded death. The related shift records contain that number too.',
  examine_scraped_entry:'Part of a handwritten entry has been scraped from the paper. Some ink remains in the damaged area. The surface has been cut.',
  compare_neighbouring_entries:'You compare the entries above and below the damaged line. The worker number still appears in the later wage record. You cannot read the writing scraped away.',
  compare_shift_book:'You check the shift book against the wage entry. The same worker number appears in both, after the recorded death.',
  record_finding:'You note the worker number, recorded death, later wage entries and scraped correction. You put the records back in order. The assistant takes the pages.'
};

export const STAGE_FOUR_FINAL={
  restamp:'The clerk writes “metal plates” in the receiving book and calls over the depot hands. They haul the lot away. The old list still says “workers”. He leaves it as it is. Doesn\'t say a damn thing about why. \n Well, that\'s the job done. All that hauling, and not a bloody coin to show for it.',
  contracts:'The clerk records your complaint, but neither sealed entry is changed. The council still hasn\'t approved the plate lot, and you won\'t be paid for the work. There\'s nothing more the clerk can do for you here. You leave the Contracts office.',
  records:'The number continued to be used in wage records after the recorded death. Part of an entry had been scraped. Who changed it and why remain unknown.'
} as const;

/** Factual personal journal, limited to the route and actions actually committed. */
export function secondJobJournal(s:SecondJobState):readonly string[]{
  const result:string[]=[];
  if(s.branch==='restamp'){
    result.push("I stamped the worker number once more at Guther's bench. I did not touch the council inspector's mark.");
    if(s.transport==='secured')result.push('Fastened the plates together to carry them to the depot.');
    if(s.transport==='smaller_loads')result.push('Carried the plates in smaller groups. More trips, but less weight at once.');
    if(s.phase==='SPEAK_DEPOT'||s.phase==='DEPOT_DIALOGUE'||s.phase==='CHOOSE_RECEIPT'||s.phase==='COMPLETE_DELIVERY'||s.phase==='DONE')
      result.push("Delivered metal plates to the depot. Someone had entered “workers” on the delivery list. Workers! The clerk could see what I'd brought.");
    if(s.receipt==='recorded_plates')result.push('I recorded the received goods as plates.');
    if(s.receipt==='requested_correction')result.push('I asked the depot clerk to check the incorrect entry before I signed.');
    if(s.phase==='DONE')result.push("The depot recorded the goods as plates in the end. I've got a receipt, but I still don't know why that other entry was wrong. No pay for this job, either.");
  }
  if(s.branch==='contracts'){
    if(!['EXAMINE_PAPER','COMPARE_RECORDS'].includes(s.phase))
      result.push('One entry treats the man as dead for compensation. In the other they still charge for him as if he were alive. Both have council seals. How can they accept both?');
    if(s.challenge==='seal_check')result.push('I asked the clerk to check both seals. Both entries had been accepted. Still no explanation.');
    if(s.challenge==='written_complaint')result.push('I marked what was wrong on the work paper. The clerk recorded my complaint.');
    if(s.phase==='DONE')result.push("Got the complaint recorded, but the clerk couldn't change either entry or approve the plate lot. Still the same question, and still no wages.");
  }
  if(s.branch==='records'){
    if(!['READ_DEATH_REGISTER','READ_WAGE_RECORD'].includes(s.phase))
      result.push('Found the worker in the death register. Then I found the same number in later wage records. They were still using it after he died.');
    if(s.phase==='SPEAK_ARCHIVE'||s.phase==='ARCHIVE_DIALOGUE')
      result.push('Someone had scraped part of an entry from the page. I could not tell what was written there.');
    if(['CHOOSE_SOURCE','RECORD_FINDING','DONE'].includes(s.phase))
      result.push("Someone scraped writing from an entry. The archive assistant didn't know who had done it. I wasn't going to damage the page any further.");
    if(s.source==='neighbouring_entries')result.push('I compared the entries around the damaged one. The number is still there in the later wage record.');
    if(s.source==='shift_book')result.push('I checked the shift book against the wage record. Both have that number after the recorded death.');
    if(s.phase==='DONE')result.push("Wrote down what I found. Death, wages afterward, and that scraped line. No idea who changed it. I doubt anyone in that room will explain it to me.");
  }
  return result;
}
