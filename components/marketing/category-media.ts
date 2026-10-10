/**
 * Footage and photos from the shop's earlier site (public/media), by
 * top-level category slug, plus a short line naming what is inside. Used by
 * the home bento and the category pages; a category missing here shows its
 * own product photo instead. Every video has a poster frame for reduced
 * motion, data saver and the moment before it loads.
 */
export type CategoryMedia = { video: string; poster: string } | { photo: string }

export const CATEGORY_MEDIA: Record<string, { media: CategoryMedia; blurb?: string }> = {
  speakers: {
    media: { video: "/media/monitors.mp4", poster: "/media/monitors-poster.webp" },
    blurb: "Portable, ceiling, wall, outdoor and line array",
  },
  amplifier: {
    media: { video: "/media/mixing-desk.mp4", poster: "/media/mixing-desk-poster.webp" },
    blurb: "Power and mixer amplifiers",
  },
  mixers: { media: { video: "/media/dj-decks.mp4", poster: "/media/dj-decks-poster.webp" } },
  microphones: {
    media: { video: "/media/stage-mic.mp4", poster: "/media/stage-mic-poster.webp" },
    blurb: "Wired and wireless",
  },
  "classroom-teaching": { media: { photo: "/media/collar-speaker.jpg" }, blurb: "Collar speakers and megaphones" },
  "counter-communication-systems": { media: { photo: "/media/conference.jpg" } },
}

/** Other media in public/media, for pages that want a band: the crowd footage and two photos. */
export const EXTRA_MEDIA = {
  crowd: { video: "/media/crowd.mp4", poster: "/media/crowd-poster.webp" },
  lineArray: { photo: "/media/line-array.jpg" },
  megaphone: { photo: "/media/megaphone.png", width: 579, height: 653 },
} as const
