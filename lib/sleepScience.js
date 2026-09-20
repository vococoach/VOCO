// Every sleep-and-memory statement the app shows, in one place. The closing
// screen after studying, the first-visit onboarding, the "why the night
// theme?" explainer, and the small always-on note on the home screen all draw
// from here, so the wording is checked once and can't drift apart.
//
// Rules for anything added or edited here (accuracy matters more than
// punch):
//   - Stick to the well-established general finding: sleep — including the
//     replay between the hippocampus and the cortex — helps stabilize and
//     strengthen memories that were formed while awake.
//   - Never name a specific study, researcher, or year. A vague, correct
//     statement beats a precise citation that might be wrong.
//   - Never suggest that new information is absorbed while asleep. Sleep
//     works on what you already learned; that's the whole premise.
//   - Keep the hedge: how much it helps varies from person to person.
//   - "Retrieval" is a separate, also well-established effect: pulling
//     something back out of memory strengthens it more than rereading it.
//
// The bite-sized facts at the bottom (SCIENCE_FACTS) are for the small,
// permanent note on the home screen. They follow every rule above, plus:
//   - One or two short sentences each — the long-form wording above is for the
//     dialog. Distinct from one another: a new fact must say something the
//     others don't, not restate them.
//   - Two categories, kept separate on purpose: `sleep` (consolidation) and
//     `retrieval` (the testing effect: quizzing yourself strengthens memory
//     more than rereading). Retrieval facts stay to the well-replicated
//     general findings about self-testing — no claim about how big the effect
//     is, no claim that this app's particular quiz format is optimal, and no
//     "always"/"never" (use "tends to", "usually", "is thought to").
//   - No numbers, years or names at all (not even "researchers found").
//   - The hedge is never written into a fact by hand: pickScienceFact() always
//     attaches the category's hedge, so it can't be forgotten on a new fact.

export const SLEEP_SCIENCE = {
  consolidation:
    "Sleep helps stabilize and strengthen memories formed while you're awake — a process called memory consolidation.",
  replay:
    "One important part of this is replay: during sleep, the hippocampus — central to forming new memories — and the cortex replay recent experiences together, which helps make those memories more stable and long-lasting.",
  studyBeforeBed: "Studying shortly before bed gives that process fresh material to work on.",
  retrieval:
    "Quizzing yourself afterward — pulling words back out rather than rereading them — strengthens them further.",
  // The full hedge (explainer, onboarding) and its short form (closing screen).
  hedge:
    "The research on sleep and memory is well established, though how much it helps varies from person to person — think of it as a helpful rhythm, not a guarantee.",
  hedgeShort: "How much it helps varies from person to person.",
};

// Short, standalone facts for the home screen's permanent note. Written to be
// read with no surrounding text, one or two sentences each. Add to these
// freely, but only within the rules in the header — and read every new line
// for accuracy before it ships.
export const SCIENCE_FACTS = {
  // Sleep and consolidation. Shown in the evening (why you're studying now),
  // so each one should still make sense as a reason to study before bed.
  sleep: [
    "Memories aren't fixed the moment you form them. They keep getting stabilized afterward, and sleep is one thing that helps.",
    "People tend to remember what they learned better after sleep than after the same amount of time spent awake.",
    "During sleep, the brain replays recent experiences, which is thought to help make those memories more stable.",
    "Deep, slow-wave sleep is thought to be especially important for strengthening memories of facts and events.",
    "Memories can be disrupted by similar things you learn afterward. After sleep, they tend to be more resistant to that interference.",
    "Sleep helps in two ways: it supports the memories you've already formed, and it helps you learn well the next day.",
  ],
  // Retrieval practice (the testing effect). Shown in the morning (why you're
  // being quizzed now), so each one should still make sense as a reason to quiz.
  retrieval: [
    "Quizzing yourself tends to strengthen memory more than rereading — a well-replicated finding known as the testing effect.",
    "Pulling an answer out of memory isn't just a check on what you know. The effort of recalling it helps strengthen the memory.",
    "Rereading can feel productive because the material looks familiar, but familiarity isn't knowing. Testing yourself shows what you actually know.",
    "Trying to answer first, even wrongly, then seeing the correct answer tends to help it stick better than just being shown it.",
    "Self-testing tends to pay off over time: days later, material you were quizzed on usually holds up better than material you only reread.",
    "Each successful recall tends to make that memory easier to retrieve the next time.",
  ],
};

// The hedge shown with every fact. Named for what it hedges, so it reads
// correctly right after any fact in its category.
export const SCIENCE_HEDGES = {
  sleep: "How much sleep helps varies from person to person.",
  retrieval: "How much self-testing helps varies from person to person.",
};

// The fact for the home screen's note, chosen from the time-of-day phase
// (lib/timeOfDay.js getPhase) so it explains what the app is nudging right
// now: evening -> a sleep fact (why study before bed), morning -> a retrieval
// fact (why quiz now), midday -> either, alternating.
//
// Deterministic — a function of the phase and the learner's LOCAL calendar day,
// not random — so it stays put while the page is open and re-reading the clock
// (tab focus) can't make it jump; it moves to the next fact each day. Returns
// { kind, text, hedge }.
export function pickScienceFact(phase, now) {
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const tag = (kind) => SCIENCE_FACTS[kind].map((text) => ({ kind, text, hedge: SCIENCE_HEDGES[kind] }));

  let pool;
  if (phase === "evening") {
    pool = tag("sleep");
  } else if (phase === "morning") {
    pool = tag("retrieval");
  } else {
    // Midday (or anything unrecognized): interleave, so consecutive days
    // alternate between the two categories.
    const sleep = tag("sleep");
    const retrieval = tag("retrieval");
    pool = [];
    for (let i = 0; i < Math.max(sleep.length, retrieval.length); i++) {
      if (sleep[i]) pool.push(sleep[i]);
      if (retrieval[i]) pool.push(retrieval[i]);
    }
  }
  return pool[day % pool.length];
}
