// SAT Vocab — test-day strategy guides: short written pieces, not quizzes. Free
// to everyone (no subscription check anywhere on these), the same way a free
// category is a sample of the course: they cost nothing to give away and show
// what the course is like before someone subscribes.
//
// All original writing. Where a guide mentions how the Digital SAT is laid out
// it says so plainly and points to the College Board for the current details,
// because test formats change and a study app should not pretend otherwise.
//
// Shape: { id, title, summary, blocks: [...] } where each block is one of
//   { type: "heading", text }
//   { type: "paragraph", text }
//   { type: "list", items: [text, …] }      bullets
//   { type: "steps", items: [text, …] }     numbered
//   { type: "example", label, text }        a set-apart worked example
// Never change a guide id — links and the strategy tab reference them.

export const satStrategyGuides = [
  {
    id: "words-in-context",
    title: "Words-in-context: predict before you look",
    summary: "A four-step routine for the question type this whole course trains, and why it beats scanning the options.",
    blocks: [
      {
        type: "paragraph",
        text: "A words-in-context question gives you a short text with one blank and four words that all look respectable. The most common way to lose these points is to read the options first: every one of them sounds plausible on its own, and the one that sounds most impressive starts to look right. The fix is to make your decision from the sentence, not from the choices.",
      },
      { type: "heading", text: "The routine" },
      {
        type: "steps",
        items: [
          "Cover the options. Read the whole text, not just the sentence with the blank. Clues often sit in the sentence before or after it.",
          "Find the clue. Look for the words that tell you what the blank must mean: a contrast signal (but, although, yet, unlike), a cause signal (because, so, therefore), or a restatement (that is, a phrase that repeats the idea in plainer words).",
          "Predict. Say your own word for the blank, even a plain one like “mixed,” “careful,” or “out of date.” It does not need to be fancy. It only needs to be aimed.",
          "Match and test. Uncover the options, pick the one closest to your prediction, then read the sentence once more with that word in place. If it makes the sentence say something the text does not, it is a trap.",
        ],
      },
      {
        type: "example",
        label: "Worked example",
        text: "The critic's ______ review praised the film's photography lavishly, then dismissed its script as lifeless. Before looking at any options, the clue is the two halves of the sentence pulling in opposite directions: praise, then dismissal. A good prediction is “mixed.” Now the options: “scathing” (harsh throughout) fails because half the review is praise, “rapturous” (delighted) fails because the script is dismissed, and “perfunctory” (done with no real effort) fails because the review is detailed. “Mixed” survives.",
      },
      { type: "heading", text: "When two options are almost the same" },
      {
        type: "paragraph",
        text: "The hardest questions put near-synonyms side by side. “Thrifty,” “frugal,” “stingy,” and “miserly” all describe someone careful with money, but the first two are mild praise and the last two are criticism. When you are stuck between two words, ask what they differ in. Usually it is one of three things: how strong the word is, whether it is praise or criticism, and how specific its meaning is (“evasive” means avoiding a question; “silent” just means not speaking). Then go back to the text and see which difference the sentence actually cares about.",
      },
      {
        type: "paragraph",
        text: "This is exactly what the Expert level in each vocabulary category practices, and it is worth doing a few of those before test day. Voco is independent and is not affiliated with the College Board. Confirm the current test format on the official College Board site.",
      },
    ],
  },
  {
    id: "pacing-and-timing",
    title: "Pacing: how to spend your minutes",
    summary: "Timing habits that keep one hard question from costing you three easy ones.",
    blocks: [
      {
        type: "paragraph",
        text: "At the time this was written, the Digital SAT's Reading and Writing section was split into two timed modules of 27 questions, with 32 minutes each. That works out to a little over a minute per question. Formats change, so check the College Board's current test-day guide, but the habits below work at almost any pace.",
      },
      { type: "heading", text: "Do the arithmetic once, before test day" },
      {
        type: "paragraph",
        text: "Divide your time by your questions and write the number down: for 27 questions in 32 minutes it is about 70 seconds. Then set two or three checkpoints. If the halfway mark of the module should be around question 14 at 16 minutes, you have a way to tell whether you are on pace without doing math mid-test. The on-screen timer can be hidden, and some people like it hidden until a checkpoint.",
      },
      { type: "heading", text: "Two passes, not one perfect pass" },
      {
        type: "list",
        items: [
          "First pass: answer what you can in well under your average. Make your best guess on anything that stalls you, flag it, and move on.",
          "Second pass: come back to the flagged questions with the time you saved. A question you return to with a fresh mind and a clear clock often gets solved in half the time it would have taken while you were stuck.",
          "Within a module you can move around and change answers; once you submit the module you cannot go back. Use the last minute of a module to make sure that every question has an answer.",
        ],
      },
      { type: "heading", text: "Never leave a blank" },
      {
        type: "paragraph",
        text: "As far as the College Board has described the scoring, a wrong answer costs you no more than an empty one, so an unanswered question is a free point thrown away. Cross out the choices you can rule out, pick from what is left, and flag it if you want another look.",
      },
      { type: "heading", text: "The hidden time cost: rushing the easy ones" },
      {
        type: "paragraph",
        text: "A missed easy question costs exactly what a missed hard one does. If you have the time in your budget, spend the extra ten seconds to reread the text on the questions you feel sure about. Most careless errors come from answering the question you expected instead of the one on the screen.",
      },
    ],
  },
  {
    id: "common-traps",
    title: "The wrong answers that look right",
    summary: "Six patterns behind most of the tempting wrong choices, and how to spot each one.",
    blocks: [
      {
        type: "paragraph",
        text: "Wrong answers on reading questions are not random. They are built to be attractive, and most of them fall into a handful of patterns. Once you can name the pattern, the choice stops looking so good. The explanation after each passage question in this course shows why the other choices fail, and you will start to recognize these patterns there.",
      },
      { type: "heading", text: "Six patterns" },
      {
        type: "list",
        items: [
          "True, but not supported. The statement is a fair fact about the world, but the text never says it. On inference questions, the right answer is not what could be true; it is what the text gives you evidence for.",
          "The overreach. The text says something “suggests,” “may,” or “in some cases,” and the choice says “proves,” “always,” or “all.” Strong words in a choice are a reason to check the text for equally strong support.",
          "The reversal. The choice uses the right words but flips the relationship, so that the cause becomes the effect or the increase becomes a decrease. Reread the exact sentence rather than trusting your memory of it.",
          "The right topic, the wrong claim. The choice repeats vivid words from the text but attaches them to an idea the author never expressed. Familiar wording feels safe, and that is the trap.",
          "The detail posing as the main idea. On a main-idea question, one choice will be an accurate detail. A detail is a piece of the text; the main idea is what the whole text is doing. Ask whether the choice would still describe the text if you deleted the example inside it.",
          "The fancy word. On vocabulary questions, the most sophisticated option is not more likely to be correct. Score each option against your prediction, not against how impressive it sounds.",
        ],
      },
      { type: "heading", text: "A habit that catches most of them" },
      {
        type: "paragraph",
        text: "Before you commit to an answer, point to the words in the text that support it. If you can only point to a general feeling, you are guessing. If you can point to a sentence, you are reading. Doing this every time is slow at first and becomes automatic within a couple of weeks of practice.",
      },
    ],
  },
  {
    id: "unknown-word",
    title: "When you don't know the word",
    summary: "What to do when a vocabulary question uses a word you have never seen, without losing the point or your nerve.",
    blocks: [
      {
        type: "paragraph",
        text: "It will happen: a word in the choices, or in the text itself, that you have simply never met. That is normal, even for strong readers, and it rarely means the question is out of reach. The sentence usually tells you most of what you need. Your job is to extract that information calmly.",
      },
      { type: "heading", text: "Five moves, in order" },
      {
        type: "steps",
        items: [
          "Get the charge. Ask whether the blank should be positive, negative, or neutral, and how strong. Contrast words and cause words in the sentence usually settle this even before you think about any specific word.",
          "Throw out what you do know. Cross out every option you are sure does not fit. Sometimes that leaves one unfamiliar word, and an unfamiliar word that is the last one standing is a good bet.",
          "Look at the word's parts. Many hard words are built from pieces you already know. “Circumspect” starts with circum- (around, as in circumference) and spect- (look, as in spectator): someone who looks around carefully before acting. “Malevolent” has mal- (bad, as in malfunction) and a root meaning to wish: someone who wishes harm. “Loquacious” shares a root with “eloquent” and “colloquial”: a word for someone who talks a lot.",
          "Look for a cousin. Does it remind you of a word you do know? A shared beginning or ending is often a real connection, though not always, so use it to lean, not to lock in.",
          "Guess, flag, move on. If you are still torn, pick your best remaining option, flag the question, and spend your time where it will pay off. A guess made in fifteen seconds is worth more than a stalemate that costs three minutes.",
        ],
      },
      {
        type: "example",
        label: "Worked example",
        text: "A sentence describes a diplomat who was “______ in her remarks, weighing each phrase before she spoke, unwilling to say anything that might be quoted against her.” You do not know “circumspect.” The clue tells you the blank means careful and cautious, and only one option, “circumspect,” could be that; the other three (“garrulous,” “boisterous,” “indiscreet”) describe people who are talkative, noisy, or careless. Even if you had never seen the word, ruling out the three you do know and noticing the “circum-” (around) and “spect-” (look) parts would have pointed you the right way.",
      },
      { type: "heading", text: "Building the habit before test day" },
      {
        type: "paragraph",
        text: "When you learn a new word in Voco, notice its charge as well as its definition: is it praise, criticism, or neutral, and how strong? That single habit is what lets you make a good decision on a word you only half-know. Voco is independent and is not affiliated with the College Board; confirm current test details on the official College Board site.",
      },
    ],
  },
];

// Estimated reading time, at a relaxed 180 words per minute, minimum one minute.
export function guideReadingMinutes(guide) {
  const words = guide.blocks
    .map((block) => [block.text, block.label, ...(block.items || [])].filter(Boolean).join(" "))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
