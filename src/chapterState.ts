import roster from './heroes.official.json';

export const roles = ['vanguard', 'duelist', 'strategist'] as const;
export type Role = typeof roles[number];
export const roleNames: Record<Role, string> = { vanguard: 'Vanguard', duelist: 'Duelist', strategist: 'Strategist' };
export const heroes = roster;
export const rosterVerified = '2026-10-08';
export const tags = ['Gameplay', 'Abilities', 'Design / aesthetic', 'Lore / personality', 'Mastery', 'Team synergy', 'Comfort pick', 'Big moments'];
export type Answers = { tags: string[]; why: string; ability: string; weakness: string; change: string; rationale: string; loyalty: string; mastery: string };
export type RoleAnswers = { decision: 'unanswered' | 'play' | 'none'; picks: string[]; answers: Record<string, Answers> };
export type Save = { version: 1; preferred: string; flexibility: string; roles: Record<Role, RoleAnswers>; reviewed: string[]; skipped: string[]; step: string; finished: boolean };
export const KEY = 'rivals-workshop.chapter1.v1';
export function blankAnswers(): Answers { return { tags: [], why: '', ability: '', weakness: '', change: '', rationale: '', loyalty: '', mastery: '' }; }
export function blankSave(): Save { const role = (): RoleAnswers => ({ decision: 'unanswered', picks: [], answers: {} }); return { version: 1, preferred: '', flexibility: '', roles: { vanguard: role(), duelist: role(), strategist: role() }, reviewed: [], skipped: [], step: 'identity', finished: false }; }
// Validate stored user input without assuming a parseable save has the right shape.
export function decodeSave(raw: string | null): Save {
  const clean = blankSave();
  if (!raw) return clean;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1) return clean;
    const str = (s: unknown) => typeof s === 'string' ? s.slice(0, 2000) : '';
    clean.preferred = [...roles, 'no-preference'].includes(data.preferred) ? data.preferred : '';
    clean.flexibility = ['one-role', 'two-roles', 'any-role', 'learning'].includes(data.flexibility) ? data.flexibility : '';
    clean.step = str(data.step); clean.finished = data.finished === true;
    clean.reviewed = Array.isArray(data.reviewed) ? data.reviewed.filter((s: unknown) => typeof s === 'string') : [];
    clean.skipped = Array.isArray(data.skipped) ? data.skipped.filter((s: unknown) => typeof s === 'string') : [];
    for (const r of roles) {
      const entry = data.roles?.[r];
      if (!entry) continue;
      const valid = heroes.filter(h => h.roles.includes(r)).map(h => h.id);
      const picks: string[] = Array.isArray(entry.picks) ? [...new Set<string>(entry.picks.filter((id: unknown) => typeof id === 'string' && valid.includes(id)))].slice(0, 2) : [];
      clean.roles[r].decision = entry.decision === 'none' ? 'none' : entry.decision === 'play' && picks.length ? 'play' : 'unanswered';
      clean.roles[r].picks = picks;
      // Keep removed heroes' drafts so changing a pick and changing back restores answers.
      for (const id of valid) {
        const a = entry.answers?.[id]; if (!a) continue;
        const answer = blankAnswers();
        answer.tags = Array.isArray(a.tags) ? tags.filter(t => a.tags.includes(t)) : [];
        for (const field of ['why', 'ability', 'weakness', 'change', 'rationale'] as const) answer[field] = str(a[field]);
        answer.loyalty = ['yes', 'depends', 'no', 'unsure'].includes(a.loyalty) ? a.loyalty : '';
        answer.mastery = ['1', '2', '3', '4', '5'].includes(a.mastery) ? a.mastery : '';
        clean.roles[r].answers[id] = answer;
      }
    }
    return clean;
  } catch { return clean; }
}
export type Step = { id: string; kind: 'identity' | 'picks' | 'story' | 'workshop' | 'loyalty' | 'summary'; role?: Role; hero?: string };
export function stepsFor(save: Save): Step[] {
  const steps: Step[] = [{ id: 'identity', kind: 'identity' }];
  for (const role of roles) {
    steps.push({ id: `${role}-picks`, kind: 'picks', role });
    if (save.roles[role].decision === 'play') for (const hero of save.roles[role].picks) for (const kind of ['story', 'workshop', 'loyalty'] as const) steps.push({ id: `${role}-${hero}-${kind}`, kind, role, hero });
  }
  steps.push({ id: 'summary', kind: 'summary' }); return steps;
}
export function answered(step: Step, save: Save) {
  if (step.kind === 'identity') return !!save.preferred && !!save.flexibility;
  if (step.kind === 'picks') return save.roles[step.role!].decision !== 'unanswered';
  if (step.kind === 'summary') return false;
  const a = save.roles[step.role!].answers[step.hero!] ?? blankAnswers();
  if (step.kind === 'story') return !!(a.tags.length || a.why.trim()) && !!a.ability.trim();
  if (step.kind === 'workshop') return !!a.weakness.trim() && !!a.change.trim() && !!a.rationale.trim();
  return !!a.loyalty && !!a.mastery;
}
export function progress(save: Save) {
  const sections = stepsFor(save).filter(s => s.kind !== 'summary');
  const covered = sections.filter(s => answered(s, save) || save.reviewed.includes(s.id) || save.skipped.includes(s.id)).length;
  return Math.round(100 * covered / sections.length);
}
