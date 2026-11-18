/** Display-level translation for the provisional 1/100 UI baseline.
 *
 * The current character API persists positive onboarding grants, not a full
 * eight-skill progression ledger. Millhand's origin grant is a displayed
 * Craftsmanship 3 or Bellrunner Industry 3, while the chosen second-job route
 * gains exactly +1 to a DIFFERENT Major Skill on committing Stage 3. For the
 * route majors alone, show baseline 1 plus the saved +1 grant. No extra
 * reward is written here and no origin skill's +3 is inflated. Do not add 1 to the
 * origin grant or any skill without a saved grant.
 *
 * This is a presentation adapter. It never writes a new rank, invents XP,
 * or awards skills again on refresh.
 */
const MILLHAND_ROUTE_MAJORS=new Set(['Industry','Commerce','Scholarship']);
const BELLRUNNER_ROUTE_MAJORS=new Set(['Commerce','Medicine','Mechanics']);
const STITCHER_ROUTE_MAJORS=new Set(['Industry','Commerce','Scholarship']);

export function majorSkillDisplayLevel(
  origin:string,major:string,bonuses:Readonly<Record<string,number>>
):number{
  const grant=bonuses[major];
  if(!Number.isSafeInteger(grant)||grant<=0)return 1;
  if((origin==='Millhand'&&MILLHAND_ROUTE_MAJORS.has(major))||
     (origin==='Bellrunner'&&BELLRUNNER_ROUTE_MAJORS.has(major))||
     (origin==='Stitcher'&&STITCHER_ROUTE_MAJORS.has(major))){
    return Math.min(100,1+grant);
  }
  return Math.min(100,grant);
}
