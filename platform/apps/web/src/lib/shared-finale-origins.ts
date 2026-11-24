/** The shared post-combat finale. Only origins with a persisted Stage VI
 * encounter can enter the common Clinic and rented Home.
 * Add a new origin here only after its authoritative combat table exists. */
export const FINALE_ORIGINS={
  Millhand:{combatTable:'player_character_flint_combat',clinicPath:'millhand/clinic',
    location:'City clinic'},
  Bellrunner:{combatTable:'player_character_dogman_combat',clinicPath:'bellrunner/clinic',
    location:'City clinic'},
  Stitcher:{combatTable:'player_character_owler_combat',clinicPath:'stitcher/clinic',
    location:'Cinder Row Infirmary'}
} as const;
export type FinaleOrigin=keyof typeof FINALE_ORIGINS;
export function isFinaleOrigin(value:string):value is FinaleOrigin{
  return Object.prototype.hasOwnProperty.call(FINALE_ORIGINS,value);
}
export function clinicHref(id:string,origin:FinaleOrigin):string{
  return '/characters/'+encodeURIComponent(id)+'/'+FINALE_ORIGINS[origin].clinicPath;
}
