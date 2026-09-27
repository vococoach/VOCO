// SAT Vocab — reading passages: a short original passage followed by one or two
// questions about it, in the style of the Digital SAT's Reading & Writing
// section. Every passage is ENTIRELY ORIGINAL: invented people, places, data and
// quotes, written from scratch — not derived from, modeled on, or paraphrased
// from any real SAT passage or any test-prep company's material.
//
// Question types (a mix on purpose, not one type repeated):
//   central-idea         "Which choice best states the main idea of the text?"
//   inference             what the information in the text most strongly supports
//   words-in-context      the passage contains a blank (______) and the question asks
//                         for the most logical and precise word to complete it —
//                         the same sentence-blank mechanic as the vocabulary quizzes,
//                         but drawn from within a passage
//   command-of-evidence   since 2026-09-24 — a claim about the passage, and the
//                         question asks which quotation from the text most
//                         directly supports it. All 4 options are real quotes
//                         taken verbatim from the passage; the 3 wrong ones are
//                         true statements that just don't support THIS specific
//                         claim (a different claim, the wrong side of a
//                         comparison, background/setup, or a conclusion drawn
//                         from the evidence rather than the evidence itself) —
//                         never a fabricated quote. This is Information and
//                         Ideas' Command of Evidence (Textual) sub-skill, a
//                         different real Digital SAT domain from words-in-context
//                         (Craft and Structure) — see CLAUDE.md "SAT domain
//                         accuracy audit" and "Transitions + Command of Evidence."
//   text-structure-purpose since 2026-09-27 — either "which choice best
//                         describes the function of [a specific, quoted
//                         sentence] in the text as a whole" or "which choice
//                         best describes the overall structure of the text."
//                         No new UI: the quoted sentence is written directly
//                         into the prompt (like command-of-evidence's quotes),
//                         so there's no "underlined sentence" markup to build.
//                         This is Craft and Structure's Text Structure and
//                         Purpose sub-skill — see CLAUDE.md "The last four SAT
//                         domains."
//   command-of-evidence-quantitative   since 2026-09-27 — a short passage
//                         states a claim or expectation, and the question
//                         carries a `chart` (a table or a small bar chart —
//                         components/PassageChart.js) the learner reads to
//                         judge what the data actually shows about that
//                         claim. Deliberately minimal rendering: a plain
//                         HTML table, or a hand-rolled inline-SVG horizontal
//                         bar chart — no charting library. All 5 uses of
//                         this type are new, purpose-built passages (not
//                         retrofitted onto existing ones), since the whole
//                         point is data the text doesn't already state in
//                         prose. This is Information and Ideas' Command of
//                         Evidence (Quantitative) sub-skill — see CLAUDE.md
//                         "The last four SAT domains."
//
// Shape: { id, title, subject, text: [paragraph, …], questions: [{ type, prompt,
// chart?: { kind: "table", columns, rows, caption? } | { kind: "bar", bars:
// [{label, value}], unit?, caption? } (command-of-evidence-quantitative only),
// options: [4, correct FIRST], correctIndex: 0, explanation }] }. Like the
// word lists, the correct option is listed first and shuffled on screen.
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
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that Varga believes the snail decline is linked to the snails' food supply rather than to the heat itself?",
        options: [
          "\"she points out that the seaweed they graze on thinned during the same period, and that the squares nearest the thickest seaweed lost the fewest snails\"",
          "\"The totals barely moved for the first four summers.\"",
          "\"Then a run of unusually warm winters arrived, and the counts fell by nearly a third.\"",
          "\"Each June for six years, the ecologist Ines Varga has crouched over the tide pools at Cape Marrow with a clicker counter, tallying every periwinkle snail in a hundred marked squares of rock.\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation that ties the decline directly to the seaweed rather than the heat, by noting that squares with the thickest seaweed lost the fewest snails. The sentence about totals barely moving describes the years before the decline, not its cause; the sentence about warm winters and falling counts describes the correlation with heat that Varga explicitly says is not the direct cause; and the opening sentence only describes her counting method, not her explanation.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the function of the sentence \"The totals barely moved for the first four summers\" in the text as a whole?",
        options: [
          "It establishes a period of stability against which the later decline stands out as a genuine change.",
          "It presents the first piece of evidence for Varga's theory about the seaweed.",
          "It summarizes the main finding of Varga's entire six-year study.",
          "It introduces a counterargument to the claim that the warm winters caused the decline.",
        ],
        correctIndex: 0,
        explanation: "The sentence describes four years in which nothing changed, before the decline begins — a baseline that makes the later drop read as a real shift, not just noise. It isn't evidence for the seaweed theory, which isn't introduced until later in the text; it isn't the study's main finding, since it describes only four of six years and specifically the years where nothing happened; and it doesn't argue against anything — no cause has been proposed yet at this point in the text.",
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
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that Delphine Roux believes the ledgers' silence has an ordinary explanation rather than a secretive one?",
        options: [
          "\"Wren wrote down only what he needed in order to collect his money, and he assumed that no one would ever want to know the rest.\"",
          "\"Some scholars have taken this gap as a sign that he guarded a trade secret.\"",
          "\"Page after page records who bought a lamp, what they paid, and when they settled the bill\"",
          "\"they expected to learn how a village craftsman had managed to undercut every rival in the valley\"",
        ],
        correctIndex: 0,
        explanation: "This quotation gives Roux's own suspicion directly: Wren recorded only what he needed for billing and assumed no one would want the rest, an ordinary, unremarkable reason. The sentence about a trade secret states the rival theory, not Roux's; the sentence about what the ledgers do record describes their contents, not why the methods are missing; and the sentence about historians' expectations describes what they hoped to find, not Roux's explanation.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the overall structure of the text?",
        options: [
          "It presents a puzzle about what the ledgers fail to explain, then offers two competing explanations for it.",
          "It presents two competing explanations, then resolves the puzzle by endorsing one of them.",
          "It describes Wren's business in chronological order, from its founding to its decline.",
          "It disproves the theory that Wren guarded a trade secret.",
        ],
        correctIndex: 0,
        explanation: "The text opens with what the ledgers don't explain, then lays out two theories (a guarded secret, or an ordinary billing habit) without ever picking one. Nothing in the text resolves or endorses either theory; no chronology of the business itself is given, only a description of what the ledgers do and don't record; and the trade-secret theory is presented as one of two live possibilities, never disproved.",
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
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the function of the sentences \"Commuters slid their coins across without looking up. Tourists asked questions they had already read the answers to on the sign\" in the text as a whole?",
        options: [
          "They establish two familiar, predictable types of passengers, so the man in the gray coat's different behavior stands out by contrast.",
          "They show that Odalys has grown increasingly annoyed by the passengers she serves during her eleven years at the window.",
          "They explain why the man in the gray coat decided to take the ferry crossing on this particular morning rather than another day.",
          "They foreshadow that Odalys will eventually decide to stop working at the ferry ticket window altogether.",
        ],
        correctIndex: 0,
        explanation: "These two sentences sketch the ordinary, predictable ways commuters and tourists behave, so that the man's minute-long pause reads as a real departure from a known pattern, not just an isolated odd moment. Nothing here expresses annoyance — it's a neutral, practiced observation; the man's own reasons for traveling are never addressed, since these sentences are about other passengers entirely; and nothing suggests Odalys is leaving her job.",
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
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that Adeyemi acknowledges a factor other than the benches themselves could explain his results?",
        options: [
          "\"His survey cannot say whether the benches themselves caused the difference, since the bench stops also happened to sit on quieter streets\"",
          "\"Riders at the bench stops estimated their waits to be about four minutes shorter than riders at the bare stops did\"",
          "\"a stopwatch showed that actual waiting times at the two kinds of stop were nearly identical\"",
          "\"he argues that the pattern is strong enough to justify a larger trial\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation that names an alternative explanation (quieter streets) and says outright that the survey can't rule it out. The quotation about the four-minute difference states the finding itself, not a caveat about its cause; the quotation about the stopwatch compares perceived and actual time, not possible causes; and the quotation about a larger trial concerns next steps, not an alternative explanation.",
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
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that the map's error caused real, practical harm to people who relied on it?",
        options: [
          "\"For decades, sailors who trusted the map ran aground on sandbars that the chart showed as open water, and Farrow's reputation suffered accordingly.\"",
          "\"a geographer comparing his field notes with the finished map found that Farrow had recorded the island's location correctly on site\"",
          "\"The error, she concluded, entered later, when an engraver copying the notes transposed two numbers.\"",
          "\"In 1884 the surveyor Lucian Farrow submitted a map of the Lissel River delta that placed a small island roughly two miles from its true position.\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation that describes actual harm — sailors running aground and Farrow's reputation suffering. The quotation about the field notes shows his fieldwork was accurate but says nothing about harm; the quotation about the engraver explains who caused the error and when, not its consequences; and the opening quotation only describes the map's original error, not any harm that followed from it.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the function of the sentence \"For decades, sailors who trusted the map ran aground on sandbars that the chart showed as open water, and Farrow's reputation suffered accordingly\" in the text as a whole?",
        options: [
          "It establishes the real consequences of the map's error, making the later revelation about who was actually at fault more significant.",
          "It provides the specific piece of evidence the geographer relied on to determine that the map's error was a small clerical slip.",
          "It directly contradicts the passage's later claim that Farrow's own survey work was accurate and free of error.",
          "It explains the specific professional reason why the geographer chose to study Farrow's map rather than another surveyor's.",
        ],
        correctIndex: 0,
        explanation: "This sentence shows what the error actually cost — wrecked crossings and a ruined reputation — before the text reveals that Farrow himself wasn't to blame, which sharpens that reversal. It isn't the geographer's evidence, which comes from comparing field notes to the finished map, described afterward; it doesn't contradict the later claim about Farrow's accuracy, since it says nothing about the survey's accuracy at all; and no reason for the geographer's choice of subject is ever given.",
      },
    ],
  },
  {
    id: "the-ants-shortcut",
    title: "The Ant Colony's Shortcut",
    subject: "Science",
    text: [
      "At Fenn Laboratory, biologist Marisol Fenn tracks how ant colonies find their way to a sugar-water feeder at the far end of a plastic maze. A brand-new colony's early trails zigzag, backtrack, and waste enormous ground. Over six weeks, without any single ant living long enough to recall the layout, the colony's trail straightens by nearly half. Fenn does not believe any one ant learns the shortcut. Instead, she points to the pheromone trail itself: ants that stumble onto a shorter path leave a slightly stronger scent along it, more ants then follow that stronger scent, and each trip reinforces it further. \u201cThe memory isn\u2019t in any ant\u2019s head,\u201d she says. \u201cIt\u2019s laid down on the ground, and it outlives every ant that built it.\u201d",
    ],
    questions: [
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: ["A colony's improving trail is a kind of collective memory kept in the trail, not in any single ant.", "Individual ants are able to remember the maze's layout after several trips.", "Young colonies leave stronger pheromone trails than established colonies do.", "Ants navigate mazes more efficiently than any other laboratory animal studied so far."],
        correctIndex: 0,
        explanation: "The text explains that no single ant lives long enough to learn the route, and attributes the improvement to the trail's own reinforcement, which is what the choice about collective memory kept in the trail states directly. The choice about individual ants remembering contradicts \"without any single ant living long enough to recall,\" the choice about young colonies reverses which colonies have the stronger trail, and the choice comparing ants to other lab animals makes a comparison the text never draws.",
      },
      {
        type: "inference",
        prompt: "Based on the text, which choice is best supported by the information provided?",
        options: ["The colony's improving trail does not depend on any one ant surviving long enough to remember the route.", "The maze's layout changes randomly from week to week to test the ants' adaptability.", "Fenn's lab has determined the exact chemical composition of the ants' pheromones.", "Older ants are individually faster walkers than younger ants."],
        correctIndex: 0,
        explanation: "The text states plainly that the trail straightens \"without any single ant living long enough to recall the layout,\" which is what the choice about the improvement not depending on any one ant restates. A changing maze, the chemical makeup of the pheromone, and any claim about individual ants' walking speed are never mentioned.",
      },
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that Fenn attributes the colony's improving trail to a self-reinforcing process outside any individual ant, not to learning by individual ants?",
        options: [
          "“The memory isn’t in any ant’s head,” she says. “It’s laid down on the ground, and it outlives every ant that built it.”",
          "\"A brand-new colony's early trails zigzag, backtrack, and waste enormous ground.\"",
          "\"At Fenn Laboratory, biologist Marisol Fenn tracks how ant colonies find their way to a sugar-water feeder at the far end of a plastic maze.\"",
          "\"Over six weeks, without any single ant living long enough to recall the layout, the colony's trail straightens by nearly half.\"",
        ],
        correctIndex: 0,
        explanation: "Fenn's own words directly state her explanation: the memory lives in the trail itself, not in any ant, and outlives every ant that built it. The sentence about zigzagging early trails describes the starting problem, not its explanation; the opening sentence is pure background about the lab setup; and the sentence about the trail straightening over six weeks reports that the change happens and how much, without saying what causes it.",
      },
    ],
  },
  {
    id: "the-attic-fresco",
    title: "The Attic Fresco",
    subject: "Arts",
    text: [
      "When conservator Teodor Lindqvist scanned the ceiling of a small chapel outside Krak\u00f3w, he found brushstrokes belonging to a different scene: a shepherdess tending sheep, not the three angels visitors admire today. Chapel records show both murals were painted within a decade of each other, by two painters working for the same parish. Some historians believe the shepherdess was judged too plain and quietly replaced. Others point to a fire in the north wing that year and suspect smoke damage forced the repainting. Lindqvist leans toward a third explanation: account books show a large anonymous donation arriving just before the second mural was commissioned, which he suspects bought the donor the scene they preferred. With three plausible stories and no surviving letter to settle it, historians remain ______ on which explanation is correct.",
    ],
    questions: [
      {
        type: "words-in-context",
        prompt: "Which choice completes the text with the most logical and precise word?",
        options: ["divided", "convinced", "silent", "unanimous"],
        correctIndex: 0,
        explanation: "Three separate, unresolved theories are described, with \u201cno surviving letter to settle it,\u201d so historians hold different opinions: they are \u201cdivided.\u201d \u201cConvinced\u201d and \u201cunanimous\u201d both wrongly imply agreement on a single answer, and \u201csilent\u201d contradicts a text that lists three theories historians actively hold.",
      },
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: ["Historians have proposed several explanations for why the original mural was painted over, but none is confirmed.", "The shepherdess mural was destroyed by a fire in the chapel's north wing.", "A wealthy donor is known to have paid for the original mural's replacement.", "Infrared scanning is the most reliable method available for studying hidden paintings."],
        correctIndex: 0,
        explanation: "The text lays out three competing, unconfirmed theories (taste, fire damage, a donor's preference) and says explicitly that no letter survives to settle the question, which is what the choice about several unconfirmed explanations captures. The choices about the fire and the donor each state one of those theories as settled fact, and the choice about scanning methods makes a claim the text never makes.",
      },
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that Lindqvist suspects a donor's preference, rather than artistic taste or fire damage, explains why the mural was replaced?",
        options: [
          "\"account books show a large anonymous donation arriving just before the second mural was commissioned, which he suspects bought the donor the scene they preferred\"",
          "\"Some historians believe the shepherdess was judged too plain and quietly replaced.\"",
          "\"Others point to a fire in the north wing that year and suspect smoke damage forced the repainting.\"",
          "\"Chapel records show both murals were painted within a decade of each other, by two painters working for the same parish.\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation describing Lindqvist's own theory, tying the anonymous donation to the donor getting the scene they wanted. The quotation about the shepherdess being judged too plain and the one about fire damage each belong to a different historian's theory, not Lindqvist's, and the quotation about chapel records is background about when and by whom the murals were painted, not an explanation for the replacement.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the overall structure of the text?",
        options: [
          "It reports a discovery, presents three competing explanations for it, and acknowledges that the question remains unresolved.",
          "It reports a discovery, then proves which of several explanations is correct using chapel records.",
          "It compares two chapels' murals to determine which was painted first.",
          "It argues that the anonymous-donation theory is the most historically well-supported explanation.",
        ],
        correctIndex: 0,
        explanation: "The text opens with Lindqvist's find, lays out three theories (taste, fire, a donor's preference), and ends by saying historians remain divided with no letter to settle it — nothing is proven. The chapel records establish only when the two murals were painted, not which theory is correct; there's one chapel with two murals, not two chapels, and no dispute over painting order; and the text says Lindqvist personally \"leans toward\" the donation theory, not that it's the best-supported one — the other two are called equally \"plausible.\"",
      },
    ],
  },
  {
    id: "the-last-two-on-the-platform",
    title: "The Last Two on the Platform",
    subject: "Literature",
    text: [
      "Bertrand had fixed locks in the same shop for forty-one years, and he could tell within seconds whether a stranger wanted to talk or be left alone. The girl three benches down, hugging a duffel bag and checking her phone, wanted to be left alone, so he was surprised when she spoke first, asking if he knew when the replacement bus was coming. He didn't, but he stayed on the topic longer than the question required, describing three bus schedules from memory before admitting none of them might still apply. She laughed, the first unguarded sound she'd made since he sat down, and moved to the bench next to his, unasked. When the announcement finally came, crackling and half-swallowed by static, neither of them could make out a word of it, and neither moved to ask the man at the ticket window what it had said.",
    ],
    questions: [
      {
        type: "inference",
        prompt: "Based on the text, which choice best describes what Bertrand's response to the girl's question suggests about him?",
        options: ["He offered more information than the question required because he sensed she might actually want company.", "He was confused about the bus schedule and mistakenly repeated outdated information.", "He resented being interrupted while waiting alone for the train.", "He was employed by the train station to assist confused passengers."],
        correctIndex: 0,
        explanation: "Bertrand \u201cstayed on the topic longer than the question required,\u201d which reads as an attempt to keep the conversation going, not as confusion about the facts; the choice about mistaken schedule information confuses his motive with a factual error. The choice about resentment is contradicted by his willingness to keep talking, and the choice about station employment is never stated \u2014 he is introduced only as a longtime locksmith.",
      },
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: ["A chance wait for a delayed train turns into a small, genuine connection between two strangers.", "Bertrand is a retired locksmith who spends his free time waiting at train stations.", "The train station's announcement system is unreliable and difficult to understand.", "The girl was afraid to be alone at the train station without Bertrand's company."],
        correctIndex: 0,
        explanation: "The text moves the girl from guarded distance (hugging her bag, checking her phone) to real ease (an unguarded laugh, moving closer unasked), the small connection the choice about two strangers describes. Bertrand's job is a detail, not the point of the passage; the garbled announcement is a true but minor detail, not the main idea; and nothing in the text suggests fear.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the function of the sentence \"Bertrand had fixed locks in the same shop for forty-one years, and he could tell within seconds whether a stranger wanted to talk or be left alone\" in the text as a whole?",
        options: [
          "It establishes Bertrand's skill at reading strangers, so the girl's choice to speak first carries more weight as a genuine departure from what he'd predict.",
          "It shows that Bertrand is eager and actively looking to find someone to talk to while he waits alone at the station.",
          "It explains the specific mechanical or scheduling reason why the replacement bus was running late that particular morning.",
          "It directly contradicts the passage's later description of the girl as guarded and reluctant to let anyone get close.",
        ],
        correctIndex: 0,
        explanation: "By establishing that Bertrand reads strangers accurately and quickly, the text makes it meaningful when the girl — whom he correctly reads as wanting solitude — speaks to him anyway. Nothing here suggests eagerness on his part, only skill; the bus delay and its cause are never explained anywhere in the text; and this sentence says nothing about the girl at all, so it can't contradict a later description of her.",
      },
    ],
  },
  {
    id: "the-cassandra-manifest",
    title: "The Cassandra Manifest",
    subject: "History",
    text: [
      "When divers recovered the cargo manifest of the merchant ship Cassandra, sunk off the Cornish coast in 1784, they expected a routine list of wool, tin, and salted fish, the usual freight for a vessel that size on that route. Instead, the manifest recorded four hundred crates of manufactured pins, more than ten times the amount any single ship of the period is known to have carried. For decades, historians had assumed that pins, a small but genuinely useful item, moved through England's ports in modest, steady quantities, sold a few crates at a time to regional merchants. The Cassandra's manifest is ______ with that picture: a single ship carrying enough pins to supply an entire county for a year suggests that at least some pin merchants were moving inventory in far larger, far less frequent shipments than anyone had previously assumed.",
    ],
    questions: [
      {
        type: "words-in-context",
        prompt: "Which choice completes the text with the most logical and precise word?",
        options: ["inconsistent", "unfamiliar", "concerned", "puzzling"],
        correctIndex: 0,
        explanation: "The manifest's four hundred crates directly contradict the old assumption of small, steady shipments, so the manifest is \u201cinconsistent\u201d with that picture. \u201cUnfamiliar\u201d would mean not knowing the old assumption, \u201cconcerned\u201d would only mean related to it, and \u201cpuzzling\u201d describes a reaction rather than the logical relationship of contradiction the sentence describes.",
      },
      {
        type: "inference",
        prompt: "Based on the text, which choice is best supported by the information in the passage?",
        options: ["At least some historical assumptions about how pins were distributed across England may need to be revised.", "The Cassandra was sunk deliberately by merchants seeking to hide the size of their pin shipments.", "Wool and salted fish were more valuable cargo than pins during this period.", "Divers have now recovered every item that was originally listed on the Cassandra's manifest."],
        correctIndex: 0,
        explanation: "The text says the find \u201csuggests\u201d that some merchants shipped pins in larger, less frequent batches than historians had assumed, which is what the choice about revising historical assumptions states directly. A deliberate sinking, a comparison of cargo value, and a claim that every item has been recovered are never mentioned.",
      },
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that the Cassandra's cargo directly challenges historians' previous assumptions about how pins were distributed?",
        options: [
          "\"Instead, the manifest recorded four hundred crates of manufactured pins, more than ten times the amount any single ship of the period is known to have carried.\"",
          "\"they expected a routine list of wool, tin, and salted fish, the usual freight for a vessel that size on that route\"",
          "\"historians had assumed that pins, a small but genuinely useful item, moved through England's ports in modest, steady quantities, sold a few crates at a time to regional merchants\"",
          "\"When divers recovered the cargo manifest of the merchant ship Cassandra, sunk off the Cornish coast in 1784\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation reporting the actual cargo size that contradicts the old assumption \u2014 four hundred crates, over ten times the known norm. The quotation about expecting wool, tin, and fish concerns the type of cargo, not shipment size; the quotation about the old assumption states what historians used to believe, not the new evidence against it; and the opening quotation is pure background about the wreck's discovery.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the function of the sentence \"they expected a routine list of wool, tin, and salted fish, the usual freight for a vessel that size on that route\" in the text as a whole?",
        options: [
          "It establishes what an unremarkable cargo manifest would have looked like, so the actual contents stand out as unusual by comparison.",
          "It lists the specific goods that divers ultimately found packed inside the Cassandra's cargo hold when they opened it.",
          "It argues at length that wool and tin were considerably more economically valuable than pins during this historical period.",
          "It explains the specific historical reason why divers chose to search the wreck of the Cassandra rather than another ship.",
        ],
        correctIndex: 0,
        explanation: "This sentence describes the routine, forgettable cargo divers expected to find, which is exactly what makes the four hundred crates of pins that follow read as remarkable. It isn't a list of what was actually found \u2014 that's the pins, described in the very next sentence; no comparison of wool, tin, or pins' economic value is ever made; and the divers' reason for choosing this particular wreck is never given.",
      },
    ],
  },
  {
    id: "the-due-date-card",
    title: "The Due-Date Card",
    subject: "Social Science",
    text: [
      "For eight months, the East Millbrook Public Library tested two versions of the reminder postcard it mails when a book is nearly overdue. Half of all overdue patrons received a card in a plain, official typewriter font; the other half received the identical message in a rounded, informal script, the kind more often seen on birthday invitations. Among patrons who had checked out novels and popular nonfiction, the rounded-font card shaved two days off the average return time. Among patrons using the library's research desk, mostly graduate students and local historians on specific projects, the two cards made no measurable difference; both groups returned books at roughly the same rate. Outreach coordinator Dana Whitfield suspects the friendlier tone works by making a mundane errand feel personal, a nudge that matters far less to someone already driven by a deadline of their own.",
    ],
    questions: [
      {
        type: "central-idea",
        prompt: "Which choice best states the main idea of the text?",
        options: ["A friendlier reminder card sped up returns for leisure readers, with no effect on research-desk patrons.", "Typewriter-style fonts cause patrons to return books later than they otherwise would.", "Font choice is the single most important factor in library return rates.", "Graduate students and local historians return books more slowly than casual readers do."],
        correctIndex: 0,
        explanation: "The text reports a real gain from the rounded font for novel and nonfiction readers and no effect for research-desk patrons, which is what the choice about a difference for leisure readers only states. The choice blaming the plain font for delay claims something the text never tests directly, the choice about the single most important factor overstates a \u201csuspicion\u201d as proof, and the choice comparing the two groups' overall speed is never addressed in the text.",
      },
      {
        type: "inference",
        prompt: "Based on the text, which choice is best supported by the information provided?",
        options: ["A friendly tone may matter less to someone already driven by their own deadline.", "Patrons who used the research desk were less likely to use the library at all.", "The library plans to stop using the plain typewriter font for all future communications.", "The rounded font was more expensive to print than the plain font."],
        correctIndex: 0,
        explanation: "Whitfield's closing point, that the friendlier tone matters less to someone \u201calready motivated by a deadline of their own,\u201d directly supports the choice about a friendly tone mattering less to a self-driven reader. Overall library use, future printing plans, and printing costs are never discussed.",
      },
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that patrons at the library's research desk were not affected by which version of the postcard they received?",
        options: [
          "\"Among patrons using the library's research desk, mostly graduate students and local historians on specific projects, the two cards made no measurable difference; both groups returned books at roughly the same rate.\"",
          "\"Among patrons who had checked out novels and popular nonfiction, the rounded-font card shaved two days off the average return time.\"",
          "\"Half of all overdue patrons received a card in a plain, official typewriter font; the other half received the identical message in a rounded, informal script\"",
          "\"Dana Whitfield suspects the friendlier tone works by making a mundane errand feel personal, a nudge that matters far less to someone already driven by a deadline of their own.\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation reporting the research-desk group's actual results: no measurable difference between the two cards. The quotation about novels and nonfiction reports a real effect, but for the other group, not the research desk; the quotation about the two font styles just describes the study's design, not any group's results; and the quotation from Whitfield offers her explanation for why the effect happened, not a report of the research-desk group's outcome.",
      },
      {
        type: "text-structure-purpose",
        prompt: "Which choice best describes the function of the sentence \"Outreach coordinator Dana Whitfield suspects the friendlier tone works by making a mundane errand feel personal, a nudge that matters far less to someone already driven by a deadline of their own\" in the text as a whole?",
        options: [
          "It shifts from reporting the study's results to offering a possible explanation for why the effect appeared in one group of patrons but not the other.",
          "It summarizes the study's entire methodology once more for readers who may have skipped over the earlier details.",
          "It presents brand-new data that directly contradicts the study's main finding about which patron group was affected.",
          "It describes a completely separate, second experiment that the library conducted specifically to confirm the first result.",
        ],
        correctIndex: 0,
        explanation: "Every sentence before this one reports what the study found; this closing sentence moves to Whitfield's interpretation of why it found that. It doesn't describe how the study was run — that's covered earlier, and this sentence is purely interpretive; it introduces no new data and doesn't contradict anything already reported, since it explains the same results rather than challenging them; and no second experiment appears anywhere in the text.",
      },
    ],
  },
  {
    id: "the-dimmed-block",
    title: "The Dimmed Block",
    subject: "Social Science",
    text: [
      "When the city of Alder Hollow dimmed the streetlights on six residential blocks to cut its electricity bill, planner Reyna Okafor expected complaints about safety within the first month. None came. Curious, she compared crime reports from the dimmed blocks against six similar blocks that kept full brightness, tracking both for a full year. The dimmed blocks recorded slightly fewer reported break-ins than the well-lit blocks, though the difference was too small to call meaningful on its own. What convinced Okafor that dimming hadn't hurt safety was something else entirely: on the dimmed blocks, more residents reported knowing their next-door neighbors by name, and neighbors said they had started sitting on their porches at dusk instead of retreating indoors once the sun set. Okafor now argues that a softer streetlight, rather than driving people inside, may draw them out onto porches and stoops, where a block quietly watches itself.",
    ],
    questions: [
      {
        type: "command-of-evidence",
        prompt: "Which quotation from the text most effectively illustrates the claim that Okafor's strongest reason for believing the dimmed streetlights hadn't hurt safety came from a change in how residents behaved, not from the crime statistics?",
        options: [
          "\"on the dimmed blocks, more residents reported knowing their next-door neighbors by name, and neighbors said they had started sitting on their porches at dusk instead of retreating indoors once the sun set\"",
          "\"The dimmed blocks recorded slightly fewer reported break-ins than the well-lit blocks, though the difference was too small to call meaningful on its own.\"",
          "\"planner Reyna Okafor expected complaints about safety within the first month\"",
          "\"Okafor now argues that a softer streetlight, rather than driving people inside, may draw them out onto porches and stoops, where a block quietly watches itself.\"",
        ],
        correctIndex: 0,
        explanation: "This is the one quotation reporting the actual behavior change \u2014 neighbors knowing each other and sitting outside at dusk \u2014 that the text says is what convinced Okafor. The quotation about break-ins is the crime-statistics evidence the claim explicitly says was not what convinced her; the quotation about her initial expectation describes what she thought would happen beforehand, not what later convinced her; and the closing quotation is Okafor's broader theory built from the finding, not the behavioral evidence itself.",
      },
      {
        type: "inference",
        prompt: "Based on the text, which choice is best supported by the information provided?",
        options: [
          "Okafor initially expected that dimming the streetlights would create a safety problem.",
          "The dimmed blocks had significantly more break-ins than the well-lit blocks.",
          "Residents on the well-lit blocks were more likely to know their neighbors by name.",
          "The city plans to dim streetlights on every block within the year.",
        ],
        correctIndex: 0,
        explanation: "The text says Okafor \"expected complaints about safety within the first month,\" which directly supports the choice about her anticipating a safety problem. The dimmed blocks actually had fewer break-ins, not more; it was the dimmed blocks, not the well-lit ones, where residents were more likely to know their neighbors; and the text never mentions any plan to expand the dimming citywide.",
      },
    ],
  },
  {
    id: "the-sourdough-trial",
    title: "The Sourdough Starter Trial",
    subject: "Science",
    text: [
      "Baker Elin Kask wanted to know whether feeding a sourdough starter twice a day, instead of the usual once, would speed up its rise time. She fed four identical starters on different schedules for two weeks, then measured how long each took to double in size at room temperature. Kask expected the twice-daily schedule to win by a wide margin, given how much more active those starters seemed day to day.",
    ],
    questions: [
      {
        type: "command-of-evidence-quantitative",
        prompt: "Which choice best describes what the data in the table suggests about Kask's expectation?",
        chart: {
          kind: "table",
          caption: "Average rise time by feeding schedule",
          columns: ["Feeding schedule", "Average rise time (hours)"],
          rows: [
            ["Once daily", "8.5"],
            ["Twice daily", "7.9"],
            ["Three times daily", "7.8"],
            ["Four times daily", "9.6"],
          ],
        },
        options: [
          "Her expectation was only partly right: twice-daily feeding rose faster than once-daily, but feeding even more often eventually slowed rise time instead of helping.",
          "Her expectation was confirmed completely: rise time steadily improved every time she fed a starter more often across the schedules.",
          "The data shows that feeding schedule had no measurable effect on rise time.",
          "The data shows that once-daily feeding produced the fastest rise time of all four schedules.",
        ],
        correctIndex: 0,
        explanation: "Twice-daily (7.9) beat once-daily (8.5) as expected, but three-times-daily was fastest of all (7.8) and four-times-daily was slowest (9.6) — feeding more often didn't keep helping. \"Steadily improved\" is contradicted by the four-times-daily number, the highest in the table; the four schedules range from 7.8 to 9.6 hours, a real difference, not \"no effect\"; and once-daily (8.5) was not the fastest — three-times-daily (7.8) was.",
      },
    ],
  },
  {
    id: "the-reading-room-survey",
    title: "The Reading Room Survey",
    subject: "Social Science",
    text: [
      "When the Aldgate Public Library asked patrons to rate how comfortable they found each of its four reading rooms on a 1-10 scale, library director Wynne Okafor expected the newly renovated East Room, with its floor-to-ceiling windows, to score highest by a clear margin. The results, gathered from 210 patron surveys, surprised her.",
    ],
    questions: [
      {
        type: "command-of-evidence-quantitative",
        prompt: "Which choice is best supported by the data shown in the chart?",
        chart: {
          kind: "bar",
          caption: "Average patron comfort rating by reading room (1–10 scale)",
          unit: "/ 10",
          bars: [
            { label: "East Room", value: 7.2 },
            { label: "West Room", value: 8.4 },
            { label: "North Room", value: 6.9 },
            { label: "South Room", value: 7.5 },
          ],
        },
        options: [
          "Contrary to Okafor's expectation, the East Room did not receive the highest average comfort rating of the four rooms.",
          "The East Room received the highest average comfort rating, confirming Okafor's expectation.",
          "All four reading rooms received identical average comfort ratings from patrons.",
          "The North Room received a higher average comfort rating than the South Room.",
        ],
        correctIndex: 0,
        explanation: "The West Room's 8.4 rating is the highest of the four, ahead of the renovated East Room's 7.2, the opposite of what Okafor expected. The East Room did not score highest, so that choice is contradicted directly; the ratings range from 6.9 to 8.4, clearly not identical; and the North Room's 6.9 is lower than, not higher than, the South Room's 7.5.",
      },
    ],
  },
  {
    id: "the-standing-desk-claim",
    title: "The Standing Desk Claim",
    subject: "Science",
    text: [
      "A wellness blog claimed that switching to a standing desk for at least four hours a day reliably reduces afternoon fatigue within two weeks. Occupational researcher Talia Brandt tracked self-reported afternoon fatigue scores (1-10, lower is better) for 60 office workers who switched to standing desks, grouped by how many hours a day they actually stood.",
    ],
    questions: [
      {
        type: "command-of-evidence-quantitative",
        prompt: "Which choice best describes how Brandt's data relates to the wellness blog's claim?",
        chart: {
          kind: "table",
          caption: "Average afternoon fatigue score after two weeks, by standing time",
          columns: ["Standing time", "Average fatigue score (1–10)"],
          rows: [
            ["1–2 hours/day", "6.8"],
            ["3–4 hours/day", "6.5"],
            ["5–6 hours/day", "6.6"],
            ["7+ hours/day", "7.4"],
          ],
        },
        options: [
          "It complicates the claim: fatigue barely improved with moderate standing time and was worst among those who stood the most.",
          "It fully supports the claim: fatigue scores steadily decreased the more hours a worker stood.",
          "It shows that standing desks have no relationship to fatigue scores at all.",
          "It shows that workers who stood 1–2 hours a day had the lowest fatigue scores of any group.",
          ],
        correctIndex: 0,
        explanation: "Fatigue barely moves between the 1–2 and 5–6 hour groups, and the 7+ hour group is worst of all at 7.4 — not the steady improvement the blog's claim predicts. \"Steadily decreased\" is contradicted by the 7+ hour group's higher score; a real, if uneven, pattern is present, so \"no relationship at all\" overstates it; and the lowest score (6.5) belongs to the 3–4 hour group, not the 1–2 hour group.",
      },
    ],
  },
  {
    id: "the-commute-time-illusion",
    title: "The Commute Time Illusion",
    subject: "Social Science",
    text: [
      "Transportation researcher Cyrus Bello asked 150 commuters to estimate how long their commute felt, then compared those estimates to their commutes' actual GPS-measured duration, grouped by which mode of transport they used.",
    ],
    questions: [
      {
        type: "command-of-evidence-quantitative",
        prompt: "Which choice is best supported by the data in the table?",
        chart: {
          kind: "table",
          caption: "Actual vs. estimated commute time, by mode of transport",
          columns: ["Mode", "Actual (min)", "Estimated (min)"],
          rows: [
            ["Driving", "32", "30"],
            ["Bus", "35", "46"],
            ["Walking", "22", "21"],
            ["Biking", "28", "27"],
          ],
        },
        options: [
          "Bus commuters were the only group whose estimated time was substantially longer than their actual commute time.",
          "Every mode of transport showed commuters underestimating their actual commute time.",
          "Bikers had the largest gap between actual and estimated commute time.",
          "Drivers estimated their commute time more accurately than walkers did.",
        ],
        correctIndex: 0,
        explanation: "Bus is the only row where the estimate (46) substantially exceeds the actual time (35); every other mode's estimate is close to or slightly under its actual time. Driving, walking, and biking all show slight underestimates, not overestimates, so \"every mode underestimated\" is contradicted by the bus row; bikers had the smallest gap of any group (1 minute), not the largest; and drivers were off by 2 minutes while walkers were off by only 1, so walkers were the more accurate group, not drivers.",
      },
    ],
  },
  {
    id: "the-festival-attendance",
    title: "The Festival Attendance Question",
    subject: "Arts",
    text: [
      "Organizers of the Bellmere Folk Festival wanted to know whether adding a Friday-night preview concert, free with any weekend pass, would increase overall weekend attendance. They compared total three-day attendance in the two years before the preview concert was introduced to the two years after.",
    ],
    questions: [
      {
        type: "command-of-evidence-quantitative",
        prompt: "Which choice is best supported by the data shown in the chart?",
        chart: {
          kind: "bar",
          caption: "Total weekend attendance by year (thousands)",
          unit: "k",
          bars: [
            { label: "Year 1 (before)", value: 18 },
            { label: "Year 2 (before)", value: 19 },
            { label: "Year 3 (after)", value: 19 },
            { label: "Year 4 (after)", value: 24 },
          ],
        },
        options: [
          "Total weekend attendance was fairly stable before the preview concert began and rose only in the second year after it was introduced.",
          "Total weekend attendance increased immediately and to the same degree in both years after the preview concert was introduced.",
          "Total weekend attendance was higher before the preview concert was introduced than after.",
          "Total weekend attendance declined every year included in the data.",
        ],
        correctIndex: 0,
        explanation: "Attendance held near 18–19 thousand through Year 3, then jumped to 24 thousand only in Year 4, the second year after the concert began. It did not rise \"immediately and to the same degree\" in both after-years, since Year 3 (19) barely moved from Year 2 (19); the after-years (19, 24) are equal to or higher than the before-years (18, 19), not lower; and attendance never declines anywhere in the data — it only holds steady or rises.",
      },
    ],
  },
];
