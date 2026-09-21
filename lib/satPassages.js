// SAT Vocab — reading passages: a short original passage followed by one or two
// questions about it, in the style of the Digital SAT's Reading & Writing
// section. Every passage is ENTIRELY ORIGINAL: invented people, places, data and
// quotes, written from scratch — not derived from, modeled on, or paraphrased
// from any real SAT passage or any test-prep company's material.
//
// Question types (a mix on purpose, not one type repeated):
//   central-idea       "Which choice best states the main idea of the text?"
//   inference          what the information in the text most strongly supports
//   words-in-context   the passage contains a blank (______) and the question asks
//                      for the most logical and precise word to complete it —
//                      the same sentence-blank mechanic as the vocabulary quizzes,
//                      but drawn from within a passage
//
// Shape: { id, title, subject, text: [paragraph, …], questions: [{ type, prompt,
// options: [4, correct FIRST], correctIndex: 0, explanation }] }. Like the word
// lists, the correct option is listed first and shuffled on screen.
//
// Tracked separately from vocabulary progress (lib/passageProgress.js) — a
// passage tests reading, not word retention. The first passage is free (lib/
// purchase.js FREE_PASSAGE_BY_COURSE); the rest are part of the subscription.
// Never change a passage id — users' localStorage references them.

export const satPassages = [
  {
    id: "tide-pool-census",
    title: "The Tide Pool Census",
    subject: "Science",
    text: [
      "Each June for six years, the ecologist Ines Varga has crouched over the tide pools at Cape Marrow with a clicker counter, tallying every periwinkle snail in a hundred marked squares of rock. The totals barely moved for the first four summers. Then a run of unusually warm winters arrived, and the counts fell by nearly a third. Varga does not believe the heat harmed the snails directly. Instead, she points out that the seaweed they graze on thinned during the same period, and that the squares nearest the thickest seaweed lost the fewest snails. “The snails are telling us about the seaweed,” she says. “To understand one, we have to keep watching the other.”",
    ],
    questions: [
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: [
          "Varga's counts suggest that the decline in snails is linked to changes in their seaweed rather than to warm winters directly.",
          "Periwinkle snails are so sensitive to warm winters that they are likely to disappear from Cape Marrow.",
          "Counting snails in marked squares of rock is the most reliable way to study a shoreline ecosystem.",
          "The seaweed at Cape Marrow grew thicker over the six years of Varga's survey.",
        ],
        correctIndex: 0,
        explanation: "The text reports a decline in snails, then Varga's view that the thinning seaweed, not the heat itself, is the likely cause; the choice linking the decline to changes in the seaweed states exactly that. The choice about snails disappearing contradicts her belief that heat did not harm them directly, the choice about counting squares makes a claim about methods the text never makes, and the choice about thicker seaweed is the opposite of what happened.",
      },
      {
        type: "inference",
        prompt: "Based on the text, which choice is best supported by the information provided?",
        options: [
          "Snails living near the thickest seaweed were less affected by the decline than snails elsewhere.",
          "The snail counts will return to their earlier levels once winters become cooler.",
          "Varga changed her counting method after the first four summers.",
          "The hundred marked squares were chosen because they contained the most snails.",
        ],
        correctIndex: 0,
        explanation: "The text says the squares nearest the thickest seaweed lost the fewest snails, which directly supports the claim about snails near the thickest seaweed. A recovery once winters cool, a change of counting method, and the reason the squares were chosen are never mentioned, so those choices go beyond the evidence.",
      },
    ],
  },
  {
    id: "lamp-makers-ledger",
    title: "The Lamp-Maker's Ledger",
    subject: "History",
    text: [
      "When historians opened the account books of the lamp-maker Tomas Wren, they expected to learn how a village craftsman had managed to undercut every rival in the valley. The ledgers, however, are ______ on the subject. Page after page records who bought a lamp, what they paid, and when they settled the bill, yet not a single line explains how the lamps were built or why Wren could sell them so cheaply. Some scholars have taken this gap as a sign that he guarded a trade secret. Others, including the archivist Delphine Roux, suspect something plainer: Wren wrote down only what he needed in order to collect his money, and he assumed that no one would ever want to know the rest.",
    ],
    questions: [
      {
        type: "words-in-context",
        prompt: "Which choice completes the text with the most logical and precise word?",
        options: ["silent", "evasive", "cryptic", "ambiguous"],
        correctIndex: 0,
        explanation: "The text says that not a single line addresses how the lamps were built, so the ledgers simply say nothing on the subject: “silent.” “Evasive” would imply the ledgers dodge a question, “cryptic” would imply they contain puzzling hints, and “ambiguous” would imply they say something unclear, but the text describes a complete absence.",
      },
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: [
          "Wren's account books record his sales in detail but say nothing about his methods, and scholars disagree about why.",
          "Wren was the most successful lamp-maker in his valley because he protected a trade secret.",
          "Historians have found that Wren's ledgers contain no reliable information about his customers.",
          "Delphine Roux has proved that Wren left out his methods because he could not read or write.",
        ],
        correctIndex: 0,
        explanation: "The text contrasts what the ledgers do record (buyers, prices, payments) with what they omit (methods), and notes two competing explanations, which is what the choice about detailed sales records but no methods describes. The choice about a trade secret treats one theory as fact, the choice about no reliable customer information contradicts the detailed sales records, and the choice about Wren's literacy invents a claim and states Roux's suspicion as proof.",
      },
    ],
  },
  {
    id: "the-ferry-window",
    title: "The Ferry Window",
    subject: "Literature",
    text: [
      "Odalys had worked the ferry ticket window for eleven years, and she could usually tell from the way a passenger approached what kind of crossing it would be. Commuters slid their coins across without looking up. Tourists asked questions they had already read the answers to on the sign. The man in the gray coat, though, stood a full minute before the glass, turning his ticket over as if it might have more to say. When she finally spoke, he startled, thanked her twice, and stepped onto the deck without once glancing at the mainland behind him. Odalys watched him lean against the far rail, as distant from the shore he had left as the boat allowed, and she found that she was, for the first time all morning, no longer thinking about her own shift.",
    ],
    questions: [
      {
        type: "inference",
        prompt: "Based on the text, which choice best describes Odalys's impression of the man in the gray coat?",
        options: [
          "She senses that he is leaving something behind and does not want to be reminded of it.",
          "She suspects that he is a tourist who is unfamiliar with how the ferry works.",
          "She believes that he has lost his ticket and is too embarrassed to say so.",
          "She is annoyed that he is delaying the line and hopes he will hurry.",
        ],
        correctIndex: 0,
        explanation: "The man never glances back at the mainland and stands as far from it as the boat allows, and Odalys becomes absorbed in watching him, so she reads him as putting distance between himself and what he left. Nothing suggests he is a tourist (she contrasts him with tourists), has lost his ticket (he turns it over in his hands), or is annoying her (she stops thinking about her own shift).",
      },
    ],
  },
  {
    id: "the-bench-study",
    title: "The Bench Study",
    subject: "Social Science",
    text: [
      "Urban planner Marcus Adeyemi wanted to know whether adding benches to a bus stop changes how riders feel about waiting. Over eight weeks, his team surveyed 420 riders at six stops, three with new benches and three without, and asked each person to estimate how long they had waited. Riders at the bench stops estimated their waits to be about four minutes shorter than riders at the bare stops did, even though a stopwatch showed that actual waiting times at the two kinds of stop were nearly identical. Adeyemi is careful not to overstate the finding. His survey cannot say whether the benches themselves caused the difference, since the bench stops also happened to sit on quieter streets, but he argues that the pattern is strong enough to justify a larger trial.",
    ],
    questions: [
      {
        type: "inference",
        prompt: "Based on the text, which claim is best supported by the survey results?",
        options: [
          "How long riders believed they had waited did not simply match how long they had actually waited.",
          "Adding benches to a bus stop reduces the actual time riders spend waiting.",
          "Riders at bare stops were surveyed for more weeks than riders at bench stops.",
          "Quieter streets cause riders to overestimate how long a bus takes to arrive.",
        ],
        correctIndex: 0,
        explanation: "Estimated waits differed by about four minutes while actual waits were nearly identical, so perception and reality did not line up. The claim that benches reduce actual waiting time contradicts the stopwatch results, the claim about survey length is never mentioned, and the claim about quiet streets turns a possible confound into a proven cause, which Adeyemi explicitly warns against.",
      },
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: [
          "Riders at bench stops felt they had waited less time, though the benches may not be the reason.",
          "A planner proved that benches make bus stops more popular with commuters.",
          "Waiting times at bus stops are nearly impossible to measure accurately.",
          "Riders at stops on quiet streets are generally more satisfied with public transit.",
        ],
        correctIndex: 0,
        explanation: "The text reports the difference in perceived waiting time and then Adeyemi's caution about causation, which the choice about riders feeling they waited less captures. “Proved” overstates a finding he is careful not to overstate, the claim that waits are nearly impossible to measure contradicts the stopwatch measurements, and the claim about quiet streets is a conclusion the survey cannot support.",
      },
    ],
  },
  {
    id: "the-farrow-map",
    title: "The Farrow Map",
    subject: "History",
    text: [
      "In 1884 the surveyor Lucian Farrow submitted a map of the Lissel River delta that placed a small island roughly two miles from its true position. For decades, sailors who trusted the map ran aground on sandbars that the chart showed as open water, and Farrow's reputation suffered accordingly. Recently, however, a geographer comparing his field notes with the finished map found that Farrow had recorded the island's location correctly on site. The error, she concluded, entered later, when an engraver copying the notes transposed two numbers. Farrow's map was therefore not the product of careless surveying, as generations assumed, but of a ______ slip made by someone else at the final step of production.",
    ],
    questions: [
      {
        type: "words-in-context",
        prompt: "Which choice completes the text with the most logical and precise word?",
        options: ["clerical", "fundamental", "deliberate", "systematic"],
        correctIndex: 0,
        explanation: "The mistake was an engraver copying notes and transposing two numbers, which is a small copying error, or “clerical” slip. “Fundamental” would mean a basic flaw in the survey itself, which the text rules out, “deliberate” would mean done on purpose, and “systematic” would mean a pattern of errors rather than a single transposition.",
      },
      {
        type: "inference",
        prompt: "Based on the text, which claim is best supported by the geographer's findings?",
        options: [
          "Farrow's original survey was more accurate than his published map suggested.",
          "Farrow deliberately moved the island to protect a trade route.",
          "The sandbars near the island did not exist when Farrow made his survey.",
          "Engravers of the period were generally careless with the maps they copied.",
        ],
        correctIndex: 0,
        explanation: "Farrow recorded the island's location correctly on site, and the error appeared only in the engraving, so his survey was better than the map made it look. Nothing in the text suggests a deliberate move, the sandbars' history is never discussed, and one engraver's slip does not show that engravers as a group were careless.",
      },
    ],
  },
];
