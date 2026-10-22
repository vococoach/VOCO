// Site-level facts and the first screen's own words, in one dependency-free module so
// the page, the page metadata and the tests cannot drift apart. It is imported by
// app/layout.js, so it must stay free of the word banks and anything else heavy.

// The public address of the site. app/layout.js uses it as `metadataBase`, which turns
// the relative icon and share-image paths in the page metadata into the absolute URLs
// that link previews need. (It is not used for anything the app serves to itself:
// every internal link stays relative.)
export const SITE_URL = "https://voco.courses";

// The first screen's headline (shown on two lines) and the one-line promise under it.
// The page title is built from the headline and the meta description is the promise.
// The promise is also the line printed on the share image (public/og.jpg), which is a
// picture and has to be remade by hand if this sentence changes.
export const HEADLINE_LINES = ["Study tonight.", "Quiz tomorrow."];
export const HEADLINE = HEADLINE_LINES.join(" ");
export const PROMISE = "SAT vocabulary you study before bed and get quizzed on the next day.";
