// Subscription-aware views of the spaced-repetition word lists. The free set is
// defined once in lib/purchase.js (a free category's Foundational and
// Intermediate tiers); everything that turns saved progress into content a
// learner can open — the review session, the due-for-review study set, the
// "still learning" drills and their counts, the home screen's due count —
// goes through here, so a word from a locked tier is never served to someone
// who isn't subscribed.
//
// Why this exists: progress is saved by word id and outlives the access rules.
// A device can hold due words from a tier that was free when it was studied and
// isn't any more (the free set was narrowed), or from categories a lapsed
// subscriber used to have. Those records are never deleted — they simply stay
// out of every list until the learner subscribes again, and reappear then.

import { getAllWordsFlat } from "./wordbanks";
import { getDueWordIds, getStruggleWordIds } from "./progress";
import { isLevelLocked } from "./purchase";

let index = null;
function wordIndex() {
  if (!index) index = new Map(getAllWordsFlat().map((w) => [w.id, w]));
  return index;
}

// True if this word's tier is behind the subscription. A word id that no longer
// exists in the word bank counts as locked (there is nothing to serve for it).
export function isWordIdLocked(wordId, subscribed) {
  const word = wordIndex().get(wordId);
  if (!word) return true;
  return isLevelLocked(word.categoryId, word.levelNumber, subscribed);
}

// Keeps order; drops anything the learner can't open.
export function accessibleWordIds(ids, subscribed) {
  return ids.filter((id) => !isWordIdLocked(id, subscribed));
}

// Due-for-review ids (already priority-sorted by getDueWordIds) that this
// learner can open. Filter first, then cap — a locked word must not use up a
// slot in the 20-word session.
export function getAccessibleDueWordIds(subscribed) {
  return accessibleWordIds(getDueWordIds(), subscribed);
}

export function getAccessibleStruggleWordIds(subscribed) {
  return accessibleWordIds(getStruggleWordIds(), subscribed);
}

// { [categoryId]: number of words in that category in `ids` }
export function countByCategory(ids) {
  const counts = {};
  ids.forEach((id) => {
    const word = wordIndex().get(id);
    if (word) counts[word.categoryId] = (counts[word.categoryId] || 0) + 1;
  });
  return counts;
}
