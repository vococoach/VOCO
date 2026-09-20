// Every sleep-and-memory statement the app shows, in one place. The closing
// screen after studying, the first-visit onboarding, and the "why the night
// theme?" explainer all draw from here, so the wording is checked once and
// can't drift apart.
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
