/** Authored Bellrunner Stage 2 narrative. Player-approved Short/Long text
 * is preserved verbatim; no hidden duration, crime roll or reputation change.
 * The receiver speaks after the selected resolution is saved server-side.
 */
export const BELLRUNNER_ROUTE_NARRATION = {
  "direct": [
    "I slip through the back streets behind the freight yards. Saves me a good bit of walking, though these alleys aren't exactly pleasant.",
    "Tight corners, barely room for two men to pass. And there's always some bastard looking for an easy bag to snatch.",
    "Better keep moving. Got enough trouble without losing the council's papers."
  ],
  "quieter": [
    "I stick to the main roads. Takes longer, sure, but there's people about, carts passing, and enough light to see where I'm going.",
    "Trouble is, half the city's out here. Carts blocking the way, workers crossing everywhere. Hard to get anywhere quickly.",
    "Still, I'd rather lose a little time than have someone make off with my notices."
  ]
} as const;

export const BELLRUNNER_RECEIVING_ARRIVAL = [
  'After completing the routine stops, you reach another receiving desk. The clerk takes the council notice, checks its heading and presses a receiving mark onto your route sheet.',
  'The ink smears across two lines as the clerk slides the paper back.'
] as const;
export const BELLRUNNER_RECEIVER_OPENING = [
  "There. That's yours.",
  "Ah, damn it. Ink's gone everywhere. Well, you've seen me take the notice."
] as const;
export type BellrunnerReceipt='clear'|'book_confirmed'|'noted_unclear';
export const BELLRUNNER_RECEIVER_RESOLUTIONS:Record<BellrunnerReceipt,{
  player:string;receiver:string;outcome:string;extraPlayer:string|null
}> = {
  "clear": {
    "player": "That mark's no good. Mind putting another one beside it?",
    "receiver": "Aye, give it here. Ink's still wet, that's all. Hold it steady this time.",
    "outcome": "The clerk makes a second, clear mark. You check the address against the route sheet before putting it away.",
    "extraPlayer": null
  },
  "book_confirmed": {
    "player": "Could I see your receiving book? Need something to confirm the delivery.",
    "receiver": "It's here. Look under today's entries. My name's beside the notice.",
    "outcome": "You find the entry and compare its details with your route sheet. The record matches.",
    "extraPlayer": "Right. I'll note the book entry beside the spoiled mark."
  },
  "noted_unclear": {
    "player": "I'll note the delivery myself. Just need your name for the sheet.",
    "receiver": "Fair enough. It's on the desk ledger. And don't go writing that I refused it. I took the bloody thing.",
    "outcome": "You record the recipient and note that the receiving mark was unclear. The notice was delivered, but Hector will have to make do with your written account.",
    "extraPlayer": null
  }
};
