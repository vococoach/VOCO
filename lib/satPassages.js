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
    ],
  },
];
