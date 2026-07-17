// Static class strings per list color so Tailwind keeps them in the build.
export interface ListColor {
  id: string
  label: string
  dot: string // small indicator dot
  text: string // text swatch
  chip: string // calendar task chip background + border
}

export const LIST_COLORS: Record<string, ListColor> = {
  slate: {
    id: "slate",
    label: "Slate",
    dot: "bg-slate-400",
    text: "text-slate-300",
    chip: "bg-slate-500/15 border-l-2 border-l-slate-400 text-slate-100 hover:bg-slate-500/25",
  },
  red: {
    id: "red",
    label: "Red",
    dot: "bg-red-500",
    text: "text-red-400",
    chip: "bg-red-500/15 border-l-2 border-l-red-500 text-red-100 hover:bg-red-500/25",
  },
  blue: {
    id: "blue",
    label: "Blue",
    dot: "bg-blue-500",
    text: "text-blue-400",
    chip: "bg-blue-500/15 border-l-2 border-l-blue-500 text-blue-100 hover:bg-blue-500/25",
  },
  amber: {
    id: "amber",
    label: "Amber",
    dot: "bg-amber-500",
    text: "text-amber-400",
    chip: "bg-amber-500/15 border-l-2 border-l-amber-500 text-amber-100 hover:bg-amber-500/25",
  },
  green: {
    id: "green",
    label: "Green",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    chip: "bg-emerald-500/15 border-l-2 border-l-emerald-500 text-emerald-100 hover:bg-emerald-500/25",
  },
  violet: {
    id: "violet",
    label: "Violet",
    dot: "bg-violet-500",
    text: "text-violet-400",
    chip: "bg-violet-500/15 border-l-2 border-l-violet-500 text-violet-100 hover:bg-violet-500/25",
  },
  teal: {
    id: "teal",
    label: "Teal",
    dot: "bg-teal-500",
    text: "text-teal-400",
    chip: "bg-teal-500/15 border-l-2 border-l-teal-500 text-teal-100 hover:bg-teal-500/25",
  },
  pink: {
    id: "pink",
    label: "Pink",
    dot: "bg-pink-500",
    text: "text-pink-400",
    chip: "bg-pink-500/15 border-l-2 border-l-pink-500 text-pink-100 hover:bg-pink-500/25",
  },
}

export const COLOR_OPTIONS = Object.values(LIST_COLORS)

export function getColor(id: string | null | undefined): ListColor {
  return (id && LIST_COLORS[id]) || LIST_COLORS.slate
}
