/** Original Stage VIII rented-home diary, immutable after completion. */
export function homeJournalIntro(origin:'Millhand'|'Bellrunner'):string{
 return origin==='Bellrunner'
  ?"Home at last. Ten coins left after the clinic, and now I've got a rent notice demanding a hundred and fifty. Two jobs done, not a bloody coin earned. And after everything that's happened today, I'm lucky to be home at all. I need to find work that actually pays."
  :"Home at last. Ten coins left after the clinic, and now the rent is a hundred and fifty. Lovely. Two jobs, no wages, and a fight with Flint on top of it. Need to find some work that actually pays.";
}
