import type { CityCatalogue, CityPointOfInterest } from '@the-pall/game-core';
import { HOME_ID } from './shared-home-state.js';

/** Owner-approved 16-POI roster, calibrated from the red numbered annotations
 * on GrandCylinder-Map-with-POI.png. Gates and Forest art remains provisional.
 * Only actual post-introduction scenes may be marked available. */
const poi = (id: string, name: string, description: string, x: number, y: number, displayOrder: number, destination: string | null = null): CityPointOfInterest => ({
  id, name, description, icon: '/locations/city/poi/' + id + '.webp', symbol: '/locations/city/poi/' + id + '.webp', position: { x, y }, displayOrder,
  ...(destination === null ? { availability: 'unavailable', destination: null } : { availability: 'available', destination })
});
export const CITY_OVERVIEW: CityCatalogue = {
  cityId: 'grand-cylinder-city', name: 'Grand Cylinder City',
  config: { width: 9600, height: 5400, distanceScale: 28 / 9600, walkingSpeed: 1.4, minimumSeconds: 2, roundingSeconds: 1 },
  pointsOfInterest: [
    poi(HOME_ID, 'Home', 'A shelter from the city\'s hardships. Rest, recover your strength and prepare for another day.', .52092, .33675, 1, 'home'),
    poi('inn', 'Inn', 'A warm meal and a moment\'s respite. Purchase food and replenish your strength before returning to work.', .82868, .52209, 2),
    poi('job-board', 'Job Board', 'Employers seek willing hands. Find paid work suited to your skills and earn, not always, an honest coin.', .30685, .36476, 3),
    poi('city-board', 'City Board', 'Read municipal announcements, public notices and recent developments affecting the city and its inhabitants.', .23135, .59483, 4),
    poi('marketplace', 'Marketplace', 'Among crowded stalls and bargaining voices, buy and sell everyday goods at prevailing market prices.', .45967, .45959, 5),
    poi('clothing-trader', 'Clothing Trader', 'Purchase garments and protective attire suited to the city\'s labour and the hardships beyond its walls.', .65797, .36476, 6),
    poi('weapons-trader', 'Weapon Trader', 'Acquire firearms, ammunition and other weapons necessary for survival beyond the safety of the city.', .22013, .87231, 7),
    poi('materials-merchant', 'Materials Merchant', 'Purchase raw materials and manufactured components required for crafting, construction and repairs.', .39933, .63739, 8),
    poi('herbalist', 'Herbalist', 'Among dried roots and bitter remedies, acquire medicinal herbs and ingredients for restorative preparations.', .83020, .23491, 9),
    poi('clinic', 'Clinic', 'Seek medical attention, have your wounds treated and recover from injuries sustained through labour or misfortune.', .44330, .18157, 10),
    poi('blacksmith', 'Blacksmith', 'Amid ringing anvils and burning coal, work metal into tools, equipment and useful components.', .13008, .45905, 11),
    poi('depot', 'Depot', 'Store belongings, materials and equipment safely until they are needed again.', .62280, .13739, 12),
    poi('mechanical-yard', 'Mechanical Yard', 'Work among steam engines and worn machinery, salvaging useful mechanical parts and components.', .17617, .15625, 13),
    poi('workshop-repairs', 'Workshop & Repairs', 'Put your craftsmanship to use, assemble equipment and restore worn belongings to working condition.', .78836, .69127, 14),
    poi('city-gates', 'City Gates', 'Beyond these guarded gates lies uncertain territory. Depart the city to undertake expeditions into the wider world.', .93572, .06735, 15),
    poi('forest', 'Forest', 'Gather timber, forage for useful plants and collect natural resources beneath the shelter of the trees.', .05397, .87985, 16)
  ]
};
