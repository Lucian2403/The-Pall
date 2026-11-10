/** Reusable painted settings for courier tutorials and future Hauling jobs.
 * Backgrounds are location assets, not Bellrunner-specific quest artwork.
 * All three are whole-scene 16:9 paintings from the project owner.
 */
export const HAULING_SCENES={
  depot:{
    src:'/locations/origins/bellrunner-depot.webp',
    label:'Dispatch House',
    alt:'The council Dispatch House, with shelves of parcels and freight carts'
  },
  short_route:{
    src:'/locations/hauling/freight-yard-backstreet.webp',
    label:'Freight-yard Backstreets',
    alt:'A narrow, dim industrial alley behind the freight yards, steam pipes and hidden corners'
  },
  long_route:{
    src:'/locations/hauling/grand-cylinder-main-street.webp',
    label:'Grand Cylinder City Main Roads',
    alt:'Busy city streets, carts and pedestrians beneath industrial towers and bridges'
  },
  receiving_desk:{
    src:'/locations/hauling/municipal-receiving-desk.webp',
    label:'Municipal Receiving Desk',
    alt:'An unmanned municipal receiving counter with a receiving ledger, stamps and delivery records'
  }
} as const;
export type HaulingSceneKey=keyof typeof HAULING_SCENES;

/** Coordinates in the RECEIVING_DESK source painting (1672×941).
 * The book is already visible at the front-right of the counter.
 * Coordinates belong to the scaled painting, not the browser viewport,
 * and can be reused for any job requiring a receiving-book check.
 */
export const RECEIVING_BOOK_HOTSPOT={
  left:'55%',top:'61%',width:'20%',height:'21%'
} as const;
