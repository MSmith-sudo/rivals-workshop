import type { Receipt } from './combatEngine';
export function localCoach(receipt:Receipt,tone:'supportive'|'playful'){
 const cue=receipt.cue?`You focused on “${receipt.cue}”. `:'';
 const playful=tone==='playful'?(receipt.after.exposed?'The escape route is currently running on optimism. ':'A reset is a plan with a return ticket. '):'';
 return `${playful}${cue}${receipt.consequence} What would change your next decision? ${receipt.counterfactual}`;
}
