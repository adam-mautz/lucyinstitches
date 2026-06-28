// The internal per-item production pipeline. Edit this one ordered list to
// add/rename/reorder states (e.g. once finalized with Lucy) — the item
// dropdowns, Kanban board, and Quick Update page all read from it.

export const PRODUCTION_STATES = [
  'not_started',
  'stitched',
  'cleaned',
  'packaged',
  'shipped',
] as const;

export type ProductionState = (typeof PRODUCTION_STATES)[number];

export const PRODUCTION_STATE_LABELS: Record<string, string> = {
  not_started: 'Not started',
  stitched: 'Stitched',
  cleaned: 'Cleaned',
  packaged: 'Packaged',
  shipped: 'Shipped',
};

// Badge / column accent per state.
export const PRODUCTION_STATE_STYLES: Record<string, string> = {
  not_started: 'bg-cream-dark text-charcoal-light',
  stitched: 'bg-slate-blue-light text-cream',
  cleaned: 'bg-mauve-light text-charcoal',
  packaged: 'bg-sage text-charcoal',
  shipped: 'bg-slate-blue text-cream',
};

export function productionStateLabel(state: string): string {
  return PRODUCTION_STATE_LABELS[state] ?? state;
}
