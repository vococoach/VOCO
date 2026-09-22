// SAT Vocab — the Expert tier: a 4th level in each of the six categories,
// harder than Advanced. Original writing, like the rest of the library.
//
// At this tier the distractors are extremely close near-synonyms, so the
// sentence's specific cue (its degree, direction, formality or logic) is what
// picks the one correct word — the kind of discrimination the hardest real
// Words in Context questions ask for. Each sentence was read for a second
// defensible answer; an item that couldn't be made unambiguous was dropped
// rather than shipped (which is why the categories differ in size).
//
// `optional: true` is deliberate: the Expert tier is an EXTRA. Category mastery
// and the course's "levels completed" summary keep counting only the original
// three tiers (lib/milestones.js), so nobody's existing progress, mastered
// categories or milestones change when this tier is added. It still feeds
// spaced repetition, missed words and "words learned". It is appended to each
// category in lib/wordbanks.js, so the original SAT data is untouched.
//
// Gating follows the category: it is free in Agreement & Support (the free
// category) and part of the subscription in the other five. Never change ids —
// users' localStorage references them.

export const satExpertLevels = {
  "agreement-support": {
    id: "agreement-support-4",
    level: 4,
    label: "Expert",
    optional: true,
    words: [
      {
        word: "Assent",
        fact: "\"Assent\" means to agree to a proposal or request, especially formally and willingly. After careful review, the council assented to the new budget.",
        quiz: {
          sentence: "Without reluctance, and only after weighing the terms carefully, the council chose to ______ to the proposal.",
          options: ["Assent", "Acquiesce", "Capitulate", "Succumb"],
          correctIndex: 0,
          explanation: "Willing, considered agreement is to \"assent\"; \"acquiesce\" implies going along reluctantly, \"capitulate\" means giving in after resisting, and \"succumb\" means being overcome by pressure.",
        },
      },
      {
        word: "Underwrite",
        fact: "\"Underwrite\" means to guarantee financial support for something, accepting the risk of loss. A private foundation underwrote the entire exhibition.",
        quiz: {
          sentence: "A wealthy patron agreed to ______ the expedition, covering its costs and promising to make up any shortfall, rather than merely lend it her name.",
          options: ["Underwrite", "Endorse", "Champion", "Applaud"],
          correctIndex: 0,
          explanation: "Covering costs and promising to absorb any shortfall is to \"underwrite\"; \"endorse\" is what lending one's name amounts to, and \"champion\" and \"applaud\" involve no financial guarantee.",
        },
      },
      {
        word: "Underpin",
        fact: "\"Underpin\" means to form the foundation of something, especially an argument. Two basic assumptions underpin the entire theory.",
        quiz: {
          sentence: "Critics attack the theory's conclusions, but its real strength lies in two early findings that quietly ______ every later step, supplying the premises on which everything else rests.",
          options: ["Underpin", "Corroborate", "Bolster", "Reinforce"],
          correctIndex: 0,
          explanation: "Findings that supply the premises everything else rests on \"underpin\" the argument; \"corroborate\" means confirm with further evidence, and \"bolster\" and \"reinforce\" mean strengthen something that already stands.",
        },
      },
      {
        word: "Condone",
        fact: "\"Condone\" means to accept or overlook behavior that is regarded as wrong, without objecting. The manager refused to condone the harassment.",
        quiz: {
          sentence: "She never praised the lobbyists' tactics, but by refusing to criticize them she effectively ______ them.",
          options: ["Condoned", "Endorsed", "Championed", "Ratified"],
          correctIndex: 0,
          explanation: "Tolerating questionable behavior by staying silent is to \"condone\" it; \"endorsed\" and \"championed\" require active approval or support, and \"ratified\" means formally confirmed.",
        },
      },
      {
        word: "Adduce",
        fact: "\"Adduce\" means to cite something as evidence or proof in an argument. The historian adduced three surviving letters to support her claim.",
        quiz: {
          sentence: "To show that the treaty had been widely ignored, the historian was able to ______ three surviving letters from provincial governors as evidence.",
          options: ["Adduce", "Allege", "Assume", "Conjecture"],
          correctIndex: 0,
          explanation: "Citing documents as proof is to \"adduce\" them; \"allege\" means claim without proof, \"assume\" means take for granted, and \"conjecture\" means guess.",
        },
      },
      {
        word: "Laud",
        fact: "\"Laud\" means to praise highly and publicly, often in extravagant terms. Critics lauded the young pianist as the finest of her generation.",
        quiz: {
          sentence: "The press ______ the mayor in extravagant terms, comparing her to the great reformers of the past.",
          options: ["Lauded", "Commended", "Acknowledged", "Credited"],
          correctIndex: 0,
          explanation: "Praise in extravagant terms is to \"laud\"; \"commended\" means praised in a measured, formal way, and \"acknowledged\" and \"credited\" mean recognizing without exaggeration.",
        },
      },
      {
        word: "Vouch",
        fact: "\"Vouch\" means to personally guarantee that someone or something is trustworthy, based on direct knowledge. A former client offered to vouch for the contractor's honesty.",
        quiz: {
          sentence: "Because she had worked alongside him for a decade, the supervisor was willing to ______ for his integrity when the background check flagged an old, unrelated lawsuit.",
          options: ["Vouch", "Attest", "Testify", "Corroborate"],
          correctIndex: 0,
          explanation: "Personally guaranteeing someone's character from firsthand knowledge is to \"vouch\" for them; \"attest\" and \"testify\" mean formally affirming that something is true, and \"corroborate\" means supporting a claim with additional evidence, none of which is staking your own credibility on a person.",
        },
      },
      {
        word: "Tacit",
        fact: "\"Tacit\" means understood or implied without being directly stated, especially through silence. Her tacit approval was clear from the fact that she never objected.",
        quiz: {
          sentence: "No one voted, no memo was sent, and no one ever said the words out loud, but by simply letting the new schedule stand unchallenged for a month, the department gave it its ______ approval.",
          options: ["Tacit", "Implicit", "Passive", "Presumed"],
          correctIndex: 0,
          explanation: "Agreement inferred from silence or non-objection is \"tacit\"; \"implicit\" describes something implied by the nature of an act itself rather than by staying silent, \"passive\" only means not actively doing anything, and \"presumed\" means assumed true, not agreed to.",
        },
      },
    ],
  },
  "disagreement-refutation": {
    id: "disagreement-refutation-4",
    level: 4,
    label: "Expert",
    optional: true,
    words: [
      {
        word: "Demur",
        fact: "\"Demur\" means to raise a mild objection or show reluctance to agree. Asked to approve the plan, the treasurer politely demurred.",
        quiz: {
          sentence: "Asked to sign off on the plan, the treasurer politely chose to ______, citing mild concerns about the timeline but stopping well short of a formal objection.",
          options: ["Demur", "Dissent", "Protest", "Rebel"],
          correctIndex: 0,
          explanation: "A polite, mild objection short of formal opposition is to \"demur\"; \"dissent\" is formal disagreement, \"protest\" is open objection, and \"rebel\" is active resistance.",
        },
      },
      {
        word: "Excoriate",
        fact: "\"Excoriate\" means to criticize someone or something with extreme severity. The editorial excoriated the mayor for ignoring the flooding.",
        quiz: {
          sentence: "The review was not merely critical; it ______ the film, listing its every flaw with open contempt.",
          options: ["Excoriated", "Criticized", "Chided", "Questioned"],
          correctIndex: 0,
          explanation: "Criticism that goes beyond critical into open contempt is to \"excoriate\"; \"criticized\" and \"questioned\" are milder, and \"chided\" means scolded gently.",
        },
      },
      {
        word: "Abjure",
        fact: "\"Abjure\" means to solemnly renounce a belief, claim, or allegiance, often under oath. She abjured her former loyalties in a public ceremony.",
        quiz: {
          sentence: "Before being readmitted to the order, he was required to swear a solemn oath to ______ his former allegiance forever.",
          options: ["Abjure", "Recant", "Disavow", "Repudiate"],
          correctIndex: 0,
          explanation: "Renouncing an allegiance by solemn oath is to \"abjure\" it; \"recant\" means take back a statement, \"disavow\" means deny responsibility for or connection with something, and \"repudiate\" means reject as invalid, none of which is tied to an oath.",
        },
      },
      {
        word: "Disabuse",
        fact: "\"Disabuse\" means to free someone from a false belief or mistaken idea. The first week of fieldwork disabused her of any romantic notions about archaeology.",
        quiz: {
          sentence: "The first week of fieldwork quickly ______ her of the romantic notion that archaeology was mostly a series of thrilling discoveries.",
          options: ["Disabused", "Dissuaded", "Deterred", "Discouraged"],
          correctIndex: 0,
          explanation: "Freeing someone from a mistaken belief is to \"disabuse\" her of it; \"dissuaded,\" \"deterred,\" and \"discouraged\" all concern talking someone out of an action and would take \"from,\" not \"of.\"",
        },
      },
      {
        word: "Countermand",
        fact: "\"Countermand\" means to cancel an earlier order by issuing a contrary one. The general countermanded the retreat and ordered an advance.",
        quiz: {
          sentence: "The general first ordered the bridge held at all costs; an hour later he ______ that instruction, issuing a contrary order that sent the troops back the way they had come.",
          options: ["Countermanded", "Rescinded", "Suspended", "Amended"],
          correctIndex: 0,
          explanation: "Overriding an order by issuing the opposite one is to \"countermand\" it; \"rescinded\" means simply cancelled, \"suspended\" means paused, and \"amended\" means adjusted.",
        },
      },
      {
        word: "Cavil",
        fact: "\"Cavil\" means to raise trivial or unnecessary objections over unimportant details. Rather than address the plan itself, he chose to cavil about the font on the cover page.",
        quiz: {
          sentence: "Reviewers largely praised the design, though a few chose to ______ over the color of the trim, a detail nobody else thought worth mentioning.",
          options: ["Cavil", "Demur", "Object", "Protest"],
          correctIndex: 0,
          explanation: "Raising a trivial, nitpicking objection is to \"cavil\"; \"demur\" is a mild but substantive reluctance to agree, and \"object\" and \"protest\" both imply disagreeing with something that actually matters.",
        },
      },
      {
        word: "Vitiate",
        fact: "\"Vitiate\" means to spoil or invalidate something completely, often through a single flaw. One fabricated statistic vitiated the entire report.",
        quiz: {
          sentence: "A single miscalculation on page two ______ the entire proof, rendering every later step meaningless no matter how carefully it was reasoned.",
          options: ["Vitiated", "Undermined", "Weakened", "Complicated"],
          correctIndex: 0,
          explanation: "A flaw that renders an entire argument invalid is said to \"vitiate\" it; \"undermined\" and \"weakened\" describe a partial, gradual loss of force, and \"complicated\" only means made harder to follow, not wrong.",
        },
      },
      {
        word: "Contravene",
        fact: "\"Contravene\" means to conflict directly with a rule, law, or established principle. The new signage appeared to contravene the city's own accessibility code.",
        quiz: {
          sentence: "The new zoning proposal looked harmless at first glance, but housing attorneys warned that it would ______ a decades-old federal fair-housing statute.",
          options: ["Contravene", "Undermine", "Oppose", "Question"],
          correctIndex: 0,
          explanation: "Conflicting head-on with a specific, written rule is to \"contravene\" it; \"undermine\" implies weakening something indirectly rather than violating it outright, \"oppose\" is general disagreement, and \"question\" means merely expressing doubt.",
        },
      },
    ],
  },
  "degree-intensity": {
    id: "degree-intensity-4",
    level: 4,
    label: "Expert",
    optional: true,
    words: [
      {
        word: "Exorbitant",
        fact: "\"Exorbitant\" means far higher than is reasonable, especially in price. Tourists complained about the exorbitant cost of a bottle of water at the summit.",
        quiz: {
          sentence: "The airline's fee for a single checked bag was not merely high but ______, costing more than the ticket itself.",
          options: ["Exorbitant", "Steep", "Substantial", "Considerable"],
          correctIndex: 0,
          explanation: "A charge that exceeds the ticket's own price is beyond reasonable, or \"exorbitant\"; \"steep,\" \"substantial,\" and \"considerable\" describe large amounts without saying they are unreasonable.",
        },
      },
      {
        word: "Nominal",
        fact: "\"Nominal\" means so small as to be a token or in name only. The city charged a nominal fee of one dollar a year.",
        quiz: {
          sentence: "The city rented the old warehouse to the arts group for a ______ sum of one dollar a year, a symbolic payment that covered none of the building's actual costs.",
          options: ["Nominal", "Modest", "Negligible", "Minor"],
          correctIndex: 0,
          explanation: "A payment that exists in name only is \"nominal\"; \"modest\" describes a small but real amount, \"negligible\" means too small to matter at all, and \"minor\" just means not major.",
        },
      },
      {
        word: "Prodigious",
        fact: "\"Prodigious\" means remarkably great in size, amount, or degree. The prodigious effort of moving an entire hillside astonished the crew.",
        quiz: {
          sentence: "Even veteran engineers were astonished by the ______ scale of the project, which required moving an entire hillside by hand.",
          options: ["Prodigious", "Considerable", "Substantial", "Sizable"],
          correctIndex: 0,
          explanation: "A scale that astonishes veterans is \"prodigious\"; \"considerable,\" \"substantial,\" and \"sizable\" describe large size without the sense of wonder.",
        },
      },
      {
        word: "Paramount",
        fact: "\"Paramount\" means more important than anything else. When lives are at stake, safety is paramount.",
        quiz: {
          sentence: "When lives are at stake, safety is not merely important or even vital but ______, outranking every other consideration.",
          options: ["Paramount", "Vital", "Significant", "Relevant"],
          correctIndex: 0,
          explanation: "Something that outranks every other consideration is \"paramount\"; \"vital\" means necessary, \"significant\" means notable, and \"relevant\" only means connected to the matter.",
        },
      },
      {
        word: "Cursory",
        fact: "\"Cursory\" means hasty and not thorough. Given only minutes, the editor gave the manuscript a cursory reading.",
        quiz: {
          sentence: "Given only ten minutes before the meeting, the editor gave the manuscript a ______ reading, skimming for glaring errors but missing the subtle ones.",
          options: ["Cursory", "Perfunctory", "Meticulous", "Thorough"],
          correctIndex: 0,
          explanation: "A quick skim forced by lack of time is \"cursory\"; \"perfunctory\" means done as a bare duty without interest, and \"meticulous\" and \"thorough\" describe the opposite of skimming.",
        },
      },
      {
        word: "Rampant",
        fact: "\"Rampant\" means spreading or growing wildly and without control. Once the inspectors left, cheating became rampant.",
        quiz: {
          sentence: "With the inspectors gone and no oversight left to restrain anyone, cheating grew ______, spreading out of control through every department.",
          options: ["Rampant", "Prevalent", "Widespread", "Common"],
          correctIndex: 0,
          explanation: "Spreading out of control is \"rampant\"; \"prevalent,\" \"widespread,\" and \"common\" say how frequent something is, not that it has escaped restraint.",
        },
      },
      {
        word: "Inordinate",
        fact: "\"Inordinate\" means far beyond what is reasonable or appropriate, especially in amount or degree. He spent an inordinate amount of time rewriting a single sentence.",
        quiz: {
          sentence: "The amount of time the committee spent debating the wording of a single footnote was frankly ______, far longer than the footnote's importance could possibly justify.",
          options: ["Inordinate", "Considerable", "Substantial", "Significant"],
          correctIndex: 0,
          explanation: "An amount that is excessive relative to what the situation actually calls for is \"inordinate\"; \"considerable,\" \"substantial,\" and \"significant\" all describe a large amount without implying it was disproportionate or unjustified.",
        },
      },
      {
        word: "Paltry",
        fact: "\"Paltry\" means so small as to be contemptible or insulting, especially relative to what was deserved or expected. The settlement offer was a paltry fraction of the actual damages.",
        quiz: {
          sentence: "After three years of unpaid overtime, the year-end bonus turned out to be ______, barely enough to cover a week's groceries and an insult to everyone who had stayed late.",
          options: ["Paltry", "Nominal", "Negligible", "Modest"],
          correctIndex: 0,
          explanation: "An amount so small it insults what was earned or expected is \"paltry\"; \"nominal\" describes an amount deliberately kept small and symbolic by design, \"negligible\" means too small to have any effect, and \"modest\" describes an amount that is small but perfectly respectable.",
        },
      },
    ],
  },
  "change-consequence": {
    id: "change-consequence-4",
    level: 4,
    label: "Expert",
    optional: true,
    words: [
      {
        word: "Supplant",
        fact: "\"Supplant\" means to take the place of someone or something, often by scheming or force. The young deputy supplanted his rival as director.",
        quiz: {
          sentence: "Through months of quiet scheming, the deputy managed to ______ his rival as director, pushing him out rather than waiting for him to retire.",
          options: ["Supplant", "Succeed", "Supersede", "Follow"],
          correctIndex: 0,
          explanation: "Pushing a rival out through scheming is to \"supplant\" him; \"succeed\" and \"follow\" mean coming after in an orderly way, and \"supersede\" means replacing something that has become outdated.",
        },
      },
      {
        word: "Ossify",
        fact: "\"Ossify\" means to become rigid and set in a fixed pattern, unable to change. Over the decades the once-nimble agency ossified.",
        quiz: {
          sentence: "Over decades the once-nimble agency ______, its improvised procedures hardening into rituals that nobody dared to question.",
          options: ["Ossified", "Stagnated", "Solidified", "Matured"],
          correctIndex: 0,
          explanation: "Becoming rigid, with flexible habits hardening into fixed rituals, is to \"ossify\"; \"stagnated\" means stopped developing, \"solidified\" means turned firm without the sense of losing flexibility, and \"matured\" means grew up.",
        },
      },
      {
        word: "Truncate",
        fact: "\"Truncate\" means to shorten something by cutting off its end. The editor truncated the essay by removing its final section.",
        quiz: {
          sentence: "Short of space, the editor did not condense the essay so much as ______ it, simply cutting off its final section and leaving the last argument unfinished.",
          options: ["Truncate", "Abridge", "Summarize", "Paraphrase"],
          correctIndex: 0,
          explanation: "Shortening something by chopping off its ending is to \"truncate\" it; \"abridge\" and \"summarize\" mean shortening by condensing while keeping the whole, and \"paraphrase\" means rewording.",
        },
      },
      {
        word: "Obviate",
        fact: "\"Obviate\" means to remove the need for something. The new system obviated the need for paper forms.",
        quiz: {
          sentence: "The new checkout system does not merely speed up payment; it ______ the need for cashiers entirely.",
          options: ["Obviates", "Precludes", "Prevents", "Postpones"],
          correctIndex: 0,
          explanation: "Making something unnecessary is to \"obviate\" the need for it; \"precludes\" and \"prevents\" mean stopping something from happening, and \"postpones\" means delaying.",
        },
      },
      {
        word: "Galvanize",
        fact: "\"Galvanize\" means to shock or excite a group of people into sudden, energetic action, as if by a jolt. A single photograph galvanized the movement overnight.",
        quiz: {
          sentence: "The photograph needed no caption and no argument: within days of its publication it had ______ an entire generation into the streets, as if a switch had been thrown.",
          options: ["Galvanized", "Spurred", "Prompted", "Incited"],
          correctIndex: 0,
          explanation: "A single stimulus that jolts people into sudden, almost involuntary collective action is said to \"galvanize\" them, the image of a switch being thrown; \"spurred\" and \"prompted\" describe a milder, more gradual push toward action, and \"incited\" specifically implies provoking something disorderly or violent, which the sentence never suggests.",
        },
      },
      {
        word: "Subsume",
        fact: "\"Subsume\" means to absorb something so completely into a larger category or entity that it loses its separate identity. The small agency was subsumed into a larger federal department.",
        quiz: {
          sentence: "As the two departments merged, the smaller research group was ______ entirely into the larger division, losing its name and its separate budget within a year.",
          options: ["Subsumed", "Supplanted", "Superseded", "Replaced"],
          correctIndex: 0,
          explanation: "Being absorbed as a part of something larger, with no separate identity left, is to be \"subsumed\"; \"supplanted,\" \"superseded,\" and \"replaced\" all describe one thing taking over from another in competition, not one thing being folded into another.",
        },
      },
    ],
  },
  "certainty-doubt": {
    id: "certainty-doubt-4",
    level: 4,
    label: "Expert",
    optional: true,
    words: [
      {
        word: "Apocryphal",
        fact: "\"Apocryphal\" means of doubtful authenticity, especially a story that is widely told but probably untrue. The famous quotation is almost certainly apocryphal.",
        quiz: {
          sentence: "Though the anecdote is repeated in nearly every biography, historians consider it ______, since no letter, diary, or witness from the period mentions it.",
          options: ["Apocryphal", "Fictitious", "Spurious", "Counterfeit"],
          correctIndex: 0,
          explanation: "A widely repeated story that lacks any contemporary support is \"apocryphal\"; \"fictitious\" means invented on purpose, \"spurious\" means false or not genuine, and \"counterfeit\" means an imitation made to deceive.",
        },
      },
      {
        word: "Specious",
        fact: "\"Specious\" means seeming plausible or attractive but actually false. The specious argument fooled most of the audience.",
        quiz: {
          sentence: "Though it sounded persuasive enough to fool most of the audience, the argument was ______: attractive on the surface but false underneath.",
          options: ["Specious", "Spurious", "Fallacious", "Erroneous"],
          correctIndex: 0,
          explanation: "Sounding convincing while being false is \"specious\"; \"spurious\" means not genuine, \"fallacious\" means built on faulty reasoning without any note of surface appeal, and \"erroneous\" simply means mistaken.",
        },
      },
      {
        word: "Untenable",
        fact: "\"Untenable\" means impossible to defend against attack or criticism. After the new data, the theory became untenable.",
        quiz: {
          sentence: "After the new data came in, the company's claim that its product was harmless became ______, since no one could defend it against the evidence.",
          options: ["Untenable", "Implausible", "Improbable", "Unlikely"],
          correctIndex: 0,
          explanation: "A position that cannot be defended against evidence is \"untenable\"; \"implausible,\" \"improbable,\" and \"unlikely\" describe how believable or probable a claim seems, not whether it can be defended.",
        },
      },
      {
        word: "Dogmatic",
        fact: "\"Dogmatic\" means asserting opinions as undeniable truth, without allowing for evidence or doubt. Her dogmatic manner made debate impossible.",
        quiz: {
          sentence: "Her ______ certainty that her method was flawless left no room for evidence to the contrary, so every criticism simply bounced off her.",
          options: ["Dogmatic", "Confident", "Steadfast", "Resolute"],
          correctIndex: 0,
          explanation: "Certainty that refuses to consider evidence is \"dogmatic\"; \"confident\" means sure of oneself, often with good reason, and \"steadfast\" and \"resolute\" describe firm commitment without closed-mindedness.",
        },
      },
      {
        word: "Unimpeachable",
        fact: "\"Unimpeachable\" means beyond doubt or criticism; completely trustworthy. The auditor's integrity was unimpeachable.",
        quiz: {
          sentence: "Even the mayor's fiercest opponents admitted that the auditor's record was ______, with no hint of error or bias anywhere in thirty years.",
          options: ["Unimpeachable", "Reputable", "Reliable", "Credible"],
          correctIndex: 0,
          explanation: "A record that even opponents cannot fault is \"unimpeachable\"; \"reputable,\" \"reliable,\" and \"credible\" mean well regarded, dependable, and believable, but not beyond all criticism.",
        },
      },
      {
        word: "Aver",
        fact: "\"Aver\" means to state something positively and confidently as true, often without being asked to prove it. He averred that he had never seen the document before.",
        quiz: {
          sentence: "Though no one had actually verified the rumor, the shopkeeper continued to ______ that the bridge would reopen by spring, repeating the claim with total confidence to every customer who asked.",
          options: ["Aver", "Assume", "Presume", "Speculate"],
          correctIndex: 0,
          explanation: "Boldly declaring something as fact, with total confidence, is to \"aver\" it; \"assume\" and \"presume\" both mean taking something for granted without proof, and \"speculate\" means guessing while openly admitting uncertainty, the opposite of the shopkeeper's confidence.",
        },
      },
    ],
  },
  "tone-attitude": {
    id: "tone-attitude-4",
    level: 4,
    label: "Expert",
    optional: true,
    words: [
      {
        word: "Laconic",
        fact: "\"Laconic\" means using very few words, often with dry effect. The general's laconic reply was a single sentence.",
        quiz: {
          sentence: "Famous for his ______ replies, the general answered a long, anxious letter from the ministry with a single dry sentence.",
          options: ["Laconic", "Taciturn", "Reticent", "Curt"],
          correctIndex: 0,
          explanation: "Economical, pointed brevity is \"laconic\"; \"taciturn\" describes someone who habitually says little, \"reticent\" means reluctant to share, and \"curt\" means rudely brief.",
        },
      },
      {
        word: "Pedantic",
        fact: "\"Pedantic\" means overly concerned with minor details and rules, especially in a way that shows off knowledge. His pedantic corrections irritated everyone.",
        quiz: {
          sentence: "She corrected the grammar in every casual email, a ______ habit that irritated colleagues who wanted only the message.",
          options: ["Pedantic", "Meticulous", "Diligent", "Fastidious"],
          correctIndex: 0,
          explanation: "Fussing over trivial rules where they don't matter is \"pedantic\"; \"meticulous\" and \"diligent\" are praise for careful work, and \"fastidious\" means hard to please.",
        },
      },
      {
        word: "Lugubrious",
        fact: "\"Lugubrious\" means mournful in an exaggerated or gloomy way. His lugubrious sighs turned a routine report into a funeral oration.",
        quiz: {
          sentence: "His ______ delivery, drawing out every sigh, turned a routine weather report into something like a funeral oration.",
          options: ["Lugubrious", "Somber", "Solemn", "Sullen"],
          correctIndex: 0,
          explanation: "Exaggerated, drawn-out mournfulness is \"lugubrious\"; \"somber\" and \"solemn\" mean serious without exaggeration, and \"sullen\" means resentfully silent.",
        },
      },
      {
        word: "Dispassionate",
        fact: "\"Dispassionate\" means calm and impartial, unaffected by emotion. The judge gave a dispassionate summary of both sides.",
        quiz: {
          sentence: "The judge's ______ summary presented both sides without warmth or hostility, so that neither lawyer could claim she had favored the other.",
          options: ["Dispassionate", "Indifferent", "Apathetic", "Cold"],
          correctIndex: 0,
          explanation: "Calm impartiality that treats both sides fairly is \"dispassionate\"; \"indifferent\" and \"apathetic\" mean not caring at all, and \"cold\" suggests unfriendliness.",
        },
      },
      {
        word: "Trenchant",
        fact: "\"Trenchant\" means sharply insightful and forceful in expression. Her trenchant analysis exposed the flaw in the plan.",
        quiz: {
          sentence: "The essay's most admired quality was its ______ analysis, which cut straight to the flaw everyone else had missed and stated it with devastating clarity.",
          options: ["Trenchant", "Acerbic", "Caustic", "Vitriolic"],
          correctIndex: 0,
          explanation: "Incisive, clear-sighted analysis is \"trenchant\"; \"acerbic,\" \"caustic,\" and \"vitriolic\" describe harshness or bitterness of tone, which nothing in the sentence suggests.",
        },
      },
      {
        word: "Fulsome",
        fact: "\"Fulsome\" means excessively lavish, especially in a way that seems insincere. The fulsome praise embarrassed everyone in the room.",
        quiz: {
          sentence: "The senator's ______ praise for the donors was so lavish that it sounded insincere and drew embarrassed glances around the room.",
          options: ["Fulsome", "Generous", "Gracious", "Sincere"],
          correctIndex: 0,
          explanation: "Praise so lavish that it rings false is \"fulsome\"; \"generous\" and \"gracious\" describe kindness without insincerity, and \"sincere\" is the opposite.",
        },
      },
      {
        word: "Officious",
        fact: "\"Officious\" means excessively eager to give unwanted advice or exert authority over matters outside one's own role. The officious new clerk began rearranging files that weren't his to touch.",
        quiz: {
          sentence: "The new intern started reorganizing the senior staff's client files and rewriting their email templates without being asked, a habit that struck everyone in the department as needlessly ______.",
          options: ["Officious", "Pedantic", "Condescending", "Domineering"],
          correctIndex: 0,
          explanation: "Meddling in matters outside one's own role, uninvited, is \"officious\"; \"pedantic\" means fussing over trivial rules to show off knowledge of them, not doing someone else's job for them, \"condescending\" describes a superior tone rather than an action, and \"domineering\" means controlling people generally, not specifically overstepping into work that isn't yours.",
        },
      },
      {
        word: "Ebullient",
        fact: "\"Ebullient\" means overflowing with enthusiasm and high spirits, almost bubbling over. She stayed ebullient even after the show was cancelled.",
        quiz: {
          sentence: "Even after the twelfth rejection letter, she didn't just stay positive: she was ______, bouncing into the office and talking so fast about submission thirteen that her officemates could barely keep up.",
          options: ["Ebullient", "Cheerful", "Optimistic", "Enthusiastic"],
          correctIndex: 0,
          explanation: "An exuberant, almost overflowing high spirit, more than ordinary good cheer, is \"ebullient\"; \"cheerful\" and \"enthusiastic\" describe a calmer, more ordinary good mood, which the sentence explicitly rules out (\"didn't just stay positive\"), and \"optimistic\" describes a belief that things will turn out well, not a visible burst of energy.",
        },
      },
      {
        word: "Garrulous",
        fact: "\"Garrulous\" means excessively and compulsively talkative, especially about trivial things. The garrulous cab driver narrated the entire route unprompted.",
        quiz: {
          sentence: "The tour guide was famously ______, filling every silence with another story about the building's history until visitors began exchanging glances and checking their watches.",
          options: ["Garrulous", "Talkative", "Verbose", "Chatty"],
          correctIndex: 0,
          explanation: "Compulsive, excessive talking that visibly wears on other people is \"garrulous\"; \"talkative\" and \"chatty\" are neutral words for enjoying conversation, and \"verbose\" describes using too many words in writing or formal speech, not chattering socially.",
        },
      },
    ],
  },
};
