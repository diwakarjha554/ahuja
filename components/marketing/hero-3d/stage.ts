/**
 * How far the canvas (and the poster) reach past the square stage on every
 * side, as a share of the stage's size. The stage box is what the layout
 * places and what takes the drag; the canvas around it is larger and
 * transparent, so the sound rings and a model tipped over are never cut off
 * at the box's edge. The camera widens its view by the same amount, so the
 * model keeps its size in the box.
 */
export const OVERSCAN = 0.25

/** The canvas's size over the stage's: the box plus the overscan on both sides. */
export const CANVAS_SCALE = 1 + 2 * OVERSCAN
