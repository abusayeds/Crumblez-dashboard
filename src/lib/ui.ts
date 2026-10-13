// Shared Tailwind class strings. These replace the old hand-written CSS classes
// so every style stays in Tailwind utilities while staying consistent per element.

export const btn =
  'cursor-pointer rounded-full border-none bg-red px-[1.15rem] py-[0.7rem] font-bold text-white hover:bg-red-hover disabled:cursor-not-allowed disabled:opacity-60'

export const btnBlue =
  'cursor-pointer rounded-full border-none bg-blue px-[1.15rem] py-[0.7rem] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60'

export const btnGhost =
  'cursor-pointer rounded-full border border-border-soft bg-transparent px-[1.15rem] py-[0.7rem] font-bold text-blue-dark disabled:cursor-not-allowed disabled:opacity-60'

export const btnDanger =
  'cursor-pointer rounded-full border border-danger/35 bg-transparent px-[1.15rem] py-[0.7rem] font-bold text-danger disabled:cursor-not-allowed disabled:opacity-60'

export const input =
  'mt-[0.35rem] w-full rounded-[10px] border border-border-soft bg-white px-[0.8rem] py-[0.7rem] text-ink'

export const checkbox = 'm-0 w-auto'

export const label = 'block text-[0.85rem] font-semibold text-muted'

export const muted = 'text-muted'

export const panel =
  'mt-[1.25rem] overflow-hidden rounded-panel border border-border-soft bg-surface shadow-panel'

export const panelHeader =
  'flex items-center justify-between gap-4 border-b border-border-soft bg-blue-soft px-[1.1rem] py-[0.95rem]'

export const panelTitle = 'm-0 text-[0.95rem] text-blue-dark'

export const panelBody = 'p-[1.1rem]'

export const table = 'w-full border-collapse text-[0.9rem]'

export const th =
  'border-b border-border-soft px-[0.55rem] py-[0.85rem] text-left align-middle text-[0.72rem] font-bold uppercase tracking-[0.04em] text-muted'

export const td =
  'border-b border-border-soft px-[0.55rem] py-[0.85rem] text-left align-middle'

export const rowActions = 'flex justify-end gap-[0.4rem]'

export const formGrid = 'grid grid-cols-1 gap-4 md:grid-cols-2'

export const formFull = 'md:col-span-2'

export const actions = 'flex flex-wrap gap-3'

export const check = 'flex items-center gap-2 text-ink'

export const checkList = 'mt-2 grid gap-[0.55rem]'

export const alert =
  'mb-4 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-[0.9rem] py-3 text-[#991b1b]'

export const success =
  'mb-4 rounded-[10px] border border-[#86efac] bg-[#ecfdf5] px-[0.9rem] py-3 text-[#166534]'

export const thumb =
  'size-[42px] rounded-lg border border-border-soft object-cover'

export const thumbLarge =
  'size-24 rounded-lg border border-border-soft object-cover'

export const thumbFallback =
  'grid size-[42px] place-items-center rounded-lg bg-surface-2 text-[0.65rem] text-muted'

export const backLink =
  'mb-[0.85rem] inline-flex items-center gap-[0.35rem] font-bold text-blue'

export const pageIntro =
  'mb-[1.25rem] flex flex-wrap items-start justify-between gap-4'

export const pageIntroTitle = 'mb-[0.35rem] mt-0 text-blue-dark'

export const statCard =
  'rounded-panel border border-border-soft bg-surface px-[1.1rem] py-4 shadow-panel'

export const statGrid = 'grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]'
