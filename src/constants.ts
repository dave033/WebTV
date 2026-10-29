// How many launchers fit on the bottom (dock) row.
// Rows below it use the same column count, so everything stays aligned.
export const DOCK_COLUMNS = 7;

// Layout numbers from Dock.tsx, used to size the cards so that
// exactly DOCK_COLUMNS of them fit across the screen at any resolution.
export const DOCK_SIDE_PADDING = 180; // px-22.5 on each side (2 x 90px)
export const DOCK_BORDER = 1; // border on the dock pill (each side)
// The focused card grows by this much (matches `scale-125` in AppCard.tsx).
// The dock pill gets extra side padding so the grown card stays inside it.
export const FOCUS_SCALE = 1.25;
// Space left between the grown card and the pill outline, in px.
export const DOCK_FOCUS_MARGIN = 14;
export const DOCK_GAP_X = 42; // gap-x-10.5
export const DOCK_GAP_Y = 48; // gap-y-12
export const CARD_ASPECT = 0.6; // icons are 300x180 (height / width)
