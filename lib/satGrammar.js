// SAT Vocab — Grammar & Usage tab: Standard English Conventions (Boundaries;
// Form, Structure, and Sense) plus Expression of Ideas' Transitions
// (2026-09-24) and Rhetorical Synthesis (2026-09-27) — two different real
// Digital SAT domains sharing one tab because they read naturally as one
// thing to a learner ("grammar and usage"), not because they're the same
// domain. Each category's own `description` below names its real domain;
// don't blur that in code comments or copy just because the UI groups them
// together. See CLAUDE.md "SAT domain accuracy audit," "Transitions +
// Command of Evidence," and "The last four SAT domains" for the full
// reasoning and the tab-naming decisions.
//   Boundaries               (Standard English Conventions) punctuation and
//                             sentence boundaries — commas, semicolons,
//                             colons, run-ons, fragments
//   Form, Structure, and Sense   (Standard English Conventions) subject-verb
//                             agreement, pronoun agreement and case, verb
//                             tense/mood, parallel structure, modifier
//                             placement
//   Transitions               (Expression of Ideas) choosing the transition
//                             word/phrase that matches the actual logical
//                             relationship between two ideas — contrast,
//                             cause and effect, addition, concession,
//                             sequence, specification, restatement. Same
//                             question shape as the other two categories (4
//                             full text versions, not a word-bank blank) —
//                             each option is the complete short text with a
//                             different transition substituted in, so the
//                             existing /grammar/[levelId] page needed no
//                             changes to render it.
//   Rhetorical Synthesis     (Expression of Ideas) given a short set of
//                             bulleted notes and a stated goal, choosing the
//                             sentence that best accomplishes that specific
//                             goal using the notes — not just any true
//                             sentence built from them. Two new, optional
//                             fields, `notes: string[]` and `goal: string`;
//                             every other category leaves both undefined, so
//                             they render nothing extra. `/grammar/[levelId]`
//                             renders `notes` as a bulleted list and `goal`
//                             as a statement in a card above the (otherwise
//                             unchanged) prompt/options/explanation flow —
//                             the one small, targeted addition to that page
//                             for this whole batch of 4 new domains.
//
// Same 3-tier structure as vocabulary (Foundational/Intermediate/Advanced),
// difficulty escalating from obvious errors to genuinely easy-to-miss ones.
// Every question presents 4 full versions of a sentence (or the relevant
// portion) where only one is correct — not 4 different words filling a
// blank, since this tests construction, not meaning. Every wrong option is a
// real, common grammar mistake, not a nonsense distractor, and each
// explanation NAMES the actual rule being tested, for every option, not just
// "this one is correct." Options are listed correct-first (correctIndex: 0)
// and shuffled on screen by the quiz page, exactly like vocabulary and
// passage questions — so, same rule as passages, an explanation must NEVER
// refer to a choice by its on-screen position ("the first choice"); it
// describes each option by its actual content (what it does to the
// sentence), which is what makes the distinction correct regardless of
// shuffle order. `type` tags the specific rule each question tests (e.g.
// "comma-splice", "subject-verb-agreement"), used by the validator to check
// for real variety, not five questions about the same rule in a row.
//
// Entirely original sentences — invented scenarios, nothing derived from or
// modeled closely on real SAT questions or test-prep material.
//
// Tracked completely separately from vocabulary (lib/grammarProgress.js) —
// like passages, this does not feed spaced repetition, streaks, or
// milestones. The first category (Boundaries) is free, like the free
// vocabulary category and the free passage; Form, Structure, and Sense
// requires the subscription (lib/purchase.js FREE_GRAMMAR_CATEGORY_BY_COURSE).
// Never change a level or category id — users' localStorage references them.

export const satGrammarCategories = [
  {
    id: "boundaries",
    title: "Boundaries",
    description: "Commas, semicolons, colons, and where a sentence actually begins and ends.",
    levels: [
    {
      id: "boundaries-1",
      level: 1,
      label: "Foundational",
      questions: [
      {
        type: "comma-splice",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The power went out during the storm, and the whole block lost internet for six hours.", "The power went out during the storm, the whole block lost internet for six hours.", "The power went out during the storm the whole block lost internet for six hours.", "The power went out during the storm. Because the whole block lost internet for six hours."],
        correctIndex: 0,
        explanation: "Two independent clauses need a comma before a coordinating conjunction (\"and\") to join correctly. Joining them with a comma alone, and no conjunction, is a comma splice; joining them with no punctuation at all is a run-on; and starting the second clause with \"Because\" turns it into a dependent fragment that can't stand on its own.",
      },
      {
        type: "missing-comma-conjunction",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The trail was closed for repairs, so the hikers turned back at the ridge.", "The trail was closed for repairs so the hikers turned back at the ridge.", "The trail was closed for repairs, the hikers turned back at the ridge.", "The trail was closed for repairs. So that the hikers turned back at the ridge."],
        correctIndex: 0,
        explanation: "Two independent clauses joined by \"so\" need a comma before it. Dropping that comma, while keeping \"so,\" omits the comma a coordinating conjunction requires between two independent clauses; replacing \"so\" with a comma alone, and no conjunction, is a comma splice; and adding \"that\" after \"So\" turns the second half into a dependent purpose clause with no main clause of its own.",
      },
      {
        type: "fragment",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Because the ferry was delayed by fog, the tour group missed their connecting train.", "Because the ferry was delayed by fog. The tour group missed their connecting train.", "Because the ferry was delayed by fog the tour group missed their connecting train.", "The ferry was delayed by fog, the tour group missed their connecting train."],
        correctIndex: 0,
        explanation: "\"Because the ferry was delayed by fog\" is a dependent clause that needs a comma and a main clause to complete it. Splitting it off with a period leaves it as a fragment; dropping the comma after it omits the comma a long introductory clause requires; and removing \"Because\" entirely while keeping the comma produces a comma splice.",
      },
      {
        type: "fragment",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Running the annual food drive, the volunteers collected more donations than ever before.", "Running the annual food drive. The volunteers collected more donations than ever before.", "Running the annual food drive the volunteers collected more donations than ever before.", "Running the annual food drive, the volunteers, collected more donations than ever before."],
        correctIndex: 0,
        explanation: "\"Running the annual food drive\" is an introductory phrase, not a complete sentence, so splitting it off with a period leaves a fragment. Dropping the comma after it omits the comma an introductory phrase requires; and adding a comma between the subject \"volunteers\" and its verb \"collected\" wrongly separates a subject from its own verb.",
      },
      {
        type: "semicolon",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["She finished the marathon in under four hours; her training had clearly paid off.", "She finished the marathon in under four hours, her training had clearly paid off.", "She finished the marathon in under four hours her training had clearly paid off.", "She finished the marathon in under four hours, however her training had clearly paid off."],
        correctIndex: 0,
        explanation: "A semicolon correctly joins these two related independent clauses. A comma alone is a comma splice; no punctuation at all is a run-on; and using \"however\" \u2014 a conjunctive adverb \u2014 after only a comma is a comma splice too, since conjunctive adverbs need a semicolon before them when joining two independent clauses.",
      },
      ],
    },
    {
      id: "boundaries-2",
      level: 2,
      label: "Intermediate",
      questions: [
      {
        type: "colon",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The chef refused to compromise on three things: freshness, temperature, and presentation.", "The chef refused to compromise on three things; freshness, temperature, and presentation.", "The chef refused to compromise on three things, freshness, temperature, and presentation.", "The chef refused to compromise on: freshness, temperature, and presentation."],
        correctIndex: 0,
        explanation: "A colon correctly introduces a list after a complete independent clause. A semicolon there wrongly joins a clause to a list rather than to another independent clause; a comma is too weak a break for a formal list introduction; and placing the colon right after the verb \"on\" is wrong because the words before it aren't a complete sentence on their own.",
      },
      {
        type: "semicolon",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The negotiations dragged on for hours; neither side was willing to compromise on price.", "The negotiations dragged on for hours, neither side was willing to compromise on price.", "The negotiations dragged on for hours neither side was willing to compromise on price.", "The negotiations dragged on for hours; and neither side was willing to compromise on price."],
        correctIndex: 0,
        explanation: "A semicolon alone correctly joins these two independent clauses. A comma alone is a comma splice; no punctuation at all is a run-on; and pairing a semicolon with the conjunction \"and\" is redundant \u2014 use one or the other, never both.",
      },
      {
        type: "restrictive-clause",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Students who arrive after the bell will need a late pass.", "Students, who arrive after the bell, will need a late pass.", "Students, who arrive after the bell will need a late pass.", "Students who arrive after the bell, will need a late pass."],
        correctIndex: 0,
        explanation: "\"Who arrive after the bell\" is a restrictive clause \u2014 it identifies which students are meant, so it takes no commas. Setting it off with commas on both sides wrongly implies it's extra information, as if all students arrive after the bell; opening with only one comma leaves the pair unbalanced; and adding a comma before the verb \"will\" wrongly separates the subject from its predicate.",
      },
      {
        type: "nonrestrictive-clause",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["My youngest brother, who just started college, called last night.", "My youngest brother who just started college called last night.", "My youngest brother, who just started college called last night.", "My youngest brother, who just started college, called, last night."],
        correctIndex: 0,
        explanation: "There is only one youngest brother, so \"who just started college\" adds extra, nonessential information and needs commas on both sides. Leaving out both commas wrongly suggests there's more than one \"youngest brother\" to distinguish; opening the clause with a comma but never closing it leaves the pair unbalanced; and adding a stray comma before \"last night,\" where no rule calls for one, is a separate error.",
      },
      {
        type: "compound-predicate",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The committee reviewed every proposal and selected three finalists by Friday.", "The committee reviewed every proposal, and selected three finalists by Friday.", "The committee reviewed every proposal; and selected three finalists by Friday.", "The committee, reviewed every proposal and selected three finalists by Friday."],
        correctIndex: 0,
        explanation: "\"Reviewed\" and \"selected\" share one subject, \"the committee,\" making this a compound predicate, not two independent clauses \u2014 no comma belongs before \"and.\" Adding one anyway is a common overcorrection; pairing a semicolon with \"and\" is both unnecessary and redundant; and adding a comma between the subject and its own verb is a separate, distinct error.",
      },
      ],
    },
    {
      id: "boundaries-3",
      level: 3,
      label: "Advanced",
      questions: [
      {
        type: "semicolon-list",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The panel included Maria Ortiz, a marine biologist; Devon Clarke, a science journalist; and Priya Nair, a policy advisor.", "The panel included Maria Ortiz, a marine biologist, Devon Clarke, a science journalist, and Priya Nair, a policy advisor.", "The panel included Maria Ortiz, a marine biologist; Devon Clarke, a science journalist, and Priya Nair, a policy advisor.", "The panel included: Maria Ortiz, a marine biologist, Devon Clarke, a science journalist, and Priya Nair, a policy advisor."],
        correctIndex: 0,
        explanation: "When list items themselves contain commas, semicolons separate the items to keep the list clear. Using only commas throughout makes it unclear how many people are listed; using a semicolon for the first item but only a comma before the last is inconsistent; and adding a colon after \"included,\" a verb whose preceding words aren't a complete sentence, while still lacking the needed semicolons, compounds two errors at once.",
      },
      {
        type: "dash-pair",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The proposal\u2014despite months of careful planning\u2014was rejected in under five minutes.", "The proposal\u2014despite months of careful planning, was rejected in under five minutes.", "The proposal\u2014despite months of careful planning was rejected in under five minutes.", "The proposal (despite months of careful planning\u2014was rejected in under five minutes."],
        correctIndex: 0,
        explanation: "A parenthetical interruption needs matching punctuation on both sides \u2014 here, two dashes. Opening with a dash but closing with a comma is a mismatched pair; opening with a dash and never closing the interruption at all leaves it unbalanced; and mixing a parenthesis with a dash is another mismatched pair.",
      },
      {
        type: "conjunctive-adverb",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Ticket sales had fallen sharply; consequently, the theater cut its evening showtimes.", "Ticket sales had fallen sharply, consequently, the theater cut its evening showtimes.", "Ticket sales had fallen sharply; consequently the theater cut its evening showtimes.", "Ticket sales had fallen sharply consequently, the theater cut its evening showtimes."],
        correctIndex: 0,
        explanation: "A conjunctive adverb like \"consequently\" needs a semicolon before it and a comma after it when it joins two independent clauses. Using only a comma before it is a comma splice; dropping the comma that should follow it leaves the adverb unset off; and dropping the semicolon before it entirely is a run-on.",
      },
      {
        type: "colon-clause",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["By the final week, the interns understood one truth about the newsroom: deadlines never move.", "By the final week, the interns understood: one truth about the newsroom, deadlines never move.", "By the final week the interns understood one truth about the newsroom: deadlines never move.", "By the final week the interns understood: one truth about the newsroom deadlines never move."],
        correctIndex: 0,
        explanation: "A colon correctly follows a complete independent clause to introduce what it points to. Placing the colon right after \"understood,\" a verb whose preceding words aren't a complete sentence, is one error; otherwise using the colon correctly but dropping the comma required after the introductory phrase \"By the final week\" is a separate error; and combining both of those errors compounds them.",
      },
      {
        type: "appositive",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The award went to Elena Vasquez, the youngest engineer on the team.", "The award went to Elena Vasquez the youngest engineer on the team.", "The award went to Elena Vasquez, the youngest engineer, on the team.", "The award went to Elena Vasquez; the youngest engineer on the team."],
        correctIndex: 0,
        explanation: "\"The youngest engineer on the team\" is an appositive renaming Elena Vasquez, and it needs a comma before it. Leaving out that comma entirely is one error; adding an extra comma that splits the appositive phrase in two changes its structure; and using a semicolon is wrong because \"the youngest engineer on the team\" has no verb of its own and can't stand as an independent clause.",
      },
      ],
    },
    ],
  },
  {
    id: "form-structure-sense",
    title: "Form, Structure, and Sense",
    description: "Subject-verb agreement, pronoun agreement and case, verb tense, parallel structure, and modifier placement.",
    levels: [
    {
      id: "form-structure-sense-1",
      level: 1,
      label: "Foundational",
      questions: [
      {
        type: "subject-verb-agreement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The dog barks every time the mail carrier walks by.", "The dog bark every time the mail carrier walks by.", "The dog barking every time the mail carrier walks by.", "The dog have barked every time the mail carrier walks by."],
        correctIndex: 0,
        explanation: "The singular subject \"dog\" needs the singular verb \"barks.\" Dropping the -s ending (\"bark\") breaks that agreement; using the non-finite form \"barking\" leaves the sentence without a complete verb; and pairing the singular subject with the plural auxiliary \"have\" instead of \"has\" is a different agreement error.",
      },
      {
        type: "pronoun-agreement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The players celebrated because they had finally won the championship.", "The players celebrated because it had finally won the championship.", "The players celebrated because he had finally won the championship.", "The players celebrated because them had finally won the championship."],
        correctIndex: 0,
        explanation: "\"Players\" is plural, so it needs the plural pronoun \"they.\" Using the singular \"it\" doesn't match in number; using the singular \"he\" doesn't either; and using \"them,\" an object pronoun, is wrong here because a subject pronoun is needed.",
      },
      {
        type: "subject-verb-agreement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The teacher and the principal were waiting outside the classroom.", "The teacher and the principal was waiting outside the classroom.", "The teacher and the principal is waiting outside the classroom.", "The teacher and the principal has been waiting outside the classroom."],
        correctIndex: 0,
        explanation: "\"The teacher and the principal,\" joined by \"and,\" forms a plural compound subject and needs a plural verb. \"Was,\" \"is,\" and \"has been\" are all singular verb forms that don't agree with a plural subject.",
      },
      {
        type: "verb-tense",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["She opened the letter, read it twice, and smiled.", "She opened the letter, reads it twice, and smiled.", "She opens the letter, read it twice, and smiled.", "She opened the letter, read it twice, and smiles."],
        correctIndex: 0,
        explanation: "All three actions happened in the same past sequence, so all three verbs should stay in the past tense. Shifting the middle verb to the present (\"reads\") breaks that consistency; shifting the first verb (\"opens\") does too; and so does shifting the last verb (\"smiles\").",
      },
      {
        type: "pronoun-case",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The coach gave the starting position to him and me.", "The coach gave the starting position to he and I.", "The coach gave the starting position to him and I.", "The coach gave the starting position to he and me."],
        correctIndex: 0,
        explanation: "Both pronouns are objects of the preposition \"to\" and need the object case: \"him\" and \"me.\" Using the subject forms \"he\" and \"I\" for both is wrong; using \"him\" correctly but \"I\" incorrectly is the common \"and I\" habit that creeps in even where an object pronoun belongs; and using \"he\" but \"me\" makes the same kind of mixed error in the other direction.",
      },
      ],
    },
    {
      id: "form-structure-sense-2",
      level: 2,
      label: "Intermediate",
      questions: [
      {
        type: "subject-verb-agreement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The box of old photographs was sitting in the attic for decades.", "The box of old photographs were sitting in the attic for decades.", "The box of old photographs was sit in the attic for decades.", "The box of old photographs have been sitting in the attic for decades."],
        correctIndex: 0,
        explanation: "The true subject is \"box,\" singular, not \"photographs,\" the noun closest to the verb inside the prepositional phrase \"of old photographs.\" Using \"were\" agrees with \"photographs\" instead of the true subject; using the non-finite \"was sit\" leaves the verb incomplete; and using \"have been\" again agrees with \"photographs\" rather than \"box.\"",
      },
      {
        type: "parallel-structure",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Her weekend included hiking, kayaking, and reading by the fire.", "Her weekend included hiking, kayaking, and she read by the fire.", "Her weekend included to hike, kayaking, and reading by the fire.", "Her weekend included hiking, to kayak, and reading by the fire."],
        correctIndex: 0,
        explanation: "All three items in the list should share the same grammatical form \u2014 here, a gerund (\"hiking,\" \"kayaking,\" \"reading\"). Switching the third item to a full clause (\"she read\") breaks that pattern; switching the first item to an infinitive (\"to hike\") does too; and so does switching the second item to an infinitive (\"to kayak\").",
      },
      {
        type: "pronoun-case",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The manager who trained me left the company last month.", "The manager whom trained me left the company last month.", "The manager which trained me left the company last month.", "The manager whose trained me left the company last month."],
        correctIndex: 0,
        explanation: "\"Who\" is the subject of \"trained\" within its own clause, so the subject form is needed. \"Whom\" is the object form, wrong here; \"which\" is reserved for things rather than people; and \"whose\" is a possessive, not a subject pronoun.",
      },
      {
        type: "verb-tense",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["By the time the guests arrived, she had already finished cooking.", "By the time the guests arrived, she has already finished cooking.", "By the time the guests arrived, she already finished cooking.", "By the time the guests arrive, she had already finished cooking."],
        correctIndex: 0,
        explanation: "The past perfect \"had finished\" correctly signals an action completed before another past event (\"arrived\"). \"Has already finished,\" the present perfect, doesn't fit a past-tense narrative; the simple past \"already finished\" loses the signal that the cooking finished first; and shifting \"arrived\" to the present tense (\"arrive\") breaks the sentence's overall time frame.",
      },
      {
        type: "modifier-placement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Wearing a bright yellow raincoat, Maria was easy to spot in the crowd.", "Wearing a bright yellow raincoat, the crowd made it easy to spot Maria.", "Maria, wearing a bright yellow raincoat was easy to spot in the crowd.", "Wearing a bright yellow raincoat, it was easy to spot Maria in the crowd."],
        correctIndex: 0,
        explanation: "An introductory modifying phrase describes whatever noun comes right after it \u2014 here, \"Maria.\" Placing \"the crowd\" right after the comma wrongly implies the crowd wore the raincoat; opening the modifier mid-sentence but dropping the comma that should close it is a separate error; and attaching the modifier to the empty word \"it\" leaves it with nothing logical to describe, since \"it\" can't wear anything.",
      },
      ],
    },
    {
      id: "form-structure-sense-3",
      level: 3,
      label: "Advanced",
      questions: [
      {
        type: "pronoun-case",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The scholarship will go to whoever submits the strongest essay.", "The scholarship will go to whomever submits the strongest essay.", "The scholarship will go to whoever submit the strongest essay.", "The scholarship will go to whichever submits the strongest essay."],
        correctIndex: 0,
        explanation: "\"Whoever\" is the subject of \"submits\" within its own clause, so the subject form is correct even though the whole clause functions as the object of \"to.\" Swapping in the object form \"whomever\" is a common hypercorrection after a preposition; keeping \"whoever\" but pairing it with \"submit\" breaks subject-verb agreement; and \"whichever\" is reserved for things rather than people.",
      },
      {
        type: "subjunctive-mood",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The committee recommended that the policy be revised before the next vote.", "The committee recommended that the policy is revised before the next vote.", "The committee recommended that the policy was revised before the next vote.", "The committee recommended that the policy will be revised before the next vote."],
        correctIndex: 0,
        explanation: "After a verb of recommendation like \"recommended,\" the following clause uses the subjunctive \u2014 the base form \"be\" \u2014 regardless of tense or subject. \"Is,\" \"was,\" and \"will be\" are all ordinary tensed forms that substitute for the subjunctive where it's required.",
      },
      {
        type: "parallel-structure",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The proposal not only reduced costs but also improved employee morale.", "The proposal not only reduced costs but also was improving employee morale.", "The proposal not only was reducing costs but also improved employee morale.", "Not only the proposal reduced costs but also improved employee morale."],
        correctIndex: 0,
        explanation: "\"Not only ... but also\" needs matching grammatical structure on both sides \u2014 here, two simple past verbs. Shifting the second half to \"was improving\" breaks that match; shifting the first half to \"was reducing\" instead does too; and moving \"Not only\" before the subject, rather than directly before the parallel elements themselves, misplaces the correlative pair entirely.",
      },
      {
        type: "subject-verb-agreement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["The strategies that the new manager introduced last year continue to shape how the team operates.", "The strategies that the new manager introduced last year continues to shape how the team operates.", "The strategies that the new manager introduces last year continue to shape how the team operates.", "The strategies that the new manager introduced last year continue to shape how the team operate."],
        correctIndex: 0,
        explanation: "The true subject of the main verb is the plural \"strategies,\" not the singular \"manager\" sitting just before the verb inside the relative clause, so \"continue\" is correct. Using \"continues\" wrongly agrees with \"manager\" instead; shifting the relative clause's own verb to the present tense (\"introduces\"), inconsistent with \"last year,\" is a separate error; and pairing the singular collective noun \"team\" with the plural verb \"operate\" instead of \"operates\" is a third, distinct error.",
      },
      {
        type: "modifier-placement",
        prompt: "Which choice is written in a way that conforms to the conventions of Standard English?",
        options: ["Employees who frequently file expense reports receive faster reimbursements.", "Employees who file expense reports frequently receive faster reimbursements.", "Frequently, employees who file expense reports receive faster reimbursements.", "Filing expense reports frequently, faster reimbursements are received by employees."],
        correctIndex: 0,
        explanation: "Placing \"frequently\" directly before \"file\" makes clear that it describes how often employees file. Leaving \"frequently\" between \"file\" and \"receive\" creates a squinting modifier that could describe either verb; moving it to open the whole sentence subtly shifts the claim to be about reimbursements rather than filing habits; and rewriting the sentence so the modifying phrase \"Filing expense reports frequently\" has no logical subject to attach to \u2014 \"reimbursements\" can't file anything \u2014 leaves it dangling.",
      },
      ],
    },
    ],
  },
  {
    id: "transitions",
    title: "Transitions",
    description: "Choosing the word that matches the real logical relationship between two ideas \u2014 contrast, cause, addition, example. This is Expression of Ideas, a different real Digital SAT domain from the rest of this tab (Standard English Conventions) \u2014 see CLAUDE.md \"SAT domain accuracy audit.\"",
    levels: [
    {
      id: "transitions-1",
      level: 1,
      label: "Foundational",
      questions: [
      {
        type: "contrast",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The report contained several minor factual errors. However, the overall analysis was accurate and well-supported.", "The report contained several minor factual errors. Therefore, the overall analysis was accurate and well-supported.", "The report contained several minor factual errors. Similarly, the overall analysis was accurate and well-supported.", "The report contained several minor factual errors. For example, the overall analysis was accurate and well-supported."],
        correctIndex: 0,
        explanation: "Minor errors alongside an accurate overall analysis is a contrast, which \"however\" signals. \"Therefore\" wrongly implies the errors caused the analysis to be accurate; \"similarly\" wrongly implies the two ideas are alike rather than in tension; and \"for example\" wrongly implies the second sentence illustrates the first.",
      },
      {
        type: "cause-effect",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["Ticket sales fell sharply after the venue moved downtown. As a result, organizers relocated next year's concert back to the original site.", "Ticket sales fell sharply after the venue moved downtown. However, organizers relocated next year's concert back to the original site.", "Ticket sales fell sharply after the venue moved downtown. In addition, organizers relocated next year's concert back to the original site.", "Ticket sales fell sharply after the venue moved downtown. Similarly, organizers relocated next year's concert back to the original site."],
        correctIndex: 0,
        explanation: "Moving the concert back is a direct consequence of falling sales, which \"as a result\" signals. \"However\" wrongly signals a contrast where the sentence describes a straightforward result; \"in addition\" wrongly treats the move as a separate, unrelated point; and \"similarly\" wrongly implies the two events are alike rather than cause and effect.",
      },
      {
        type: "addition",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The renovated library added a dedicated children's reading room. In addition, it installed a quiet study space on the second floor.", "The renovated library added a dedicated children's reading room. However, it installed a quiet study space on the second floor.", "The renovated library added a dedicated children's reading room. Therefore, it installed a quiet study space on the second floor.", "The renovated library added a dedicated children's reading room. Instead, it installed a quiet study space on the second floor."],
        correctIndex: 0,
        explanation: "Both are simply separate improvements from the same renovation, which \"in addition\" signals. \"However\" wrongly implies the two facts are in tension; \"therefore\" wrongly implies the study space was a consequence of the reading room; and \"instead\" wrongly implies the study space replaced the reading room rather than supplementing it.",
      },
      {
        type: "example",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["Many small towns have found creative ways to draw in tourists. For example, the town of Millbrook built a life-size outdoor chess set in its main square.", "Many small towns have found creative ways to draw in tourists. However, the town of Millbrook built a life-size outdoor chess set in its main square.", "Many small towns have found creative ways to draw in tourists. Therefore, the town of Millbrook built a life-size outdoor chess set in its main square.", "Many small towns have found creative ways to draw in tourists. Similarly, the town of Millbrook built a life-size outdoor chess set in its main square."],
        correctIndex: 0,
        explanation: "Millbrook's chess set is one specific instance of the general trend, which \"for example\" signals. \"However\" wrongly signals a contrast rather than an illustration; \"therefore\" wrongly implies Millbrook's project was a consequence of the general trend rather than one case of it; and \"similarly\" wrongly treats it as a separate, parallel fact rather than an example.",
      },
      {
        type: "sequence",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The bread dough must rest, covered, for a full hour before it is shaped. Afterward, it can be placed directly in the oven.", "The bread dough must rest, covered, for a full hour before it is shaped. However, it can be placed directly in the oven.", "The bread dough must rest, covered, for a full hour before it is shaped. For example, it can be placed directly in the oven.", "The bread dough must rest, covered, for a full hour before it is shaped. In addition, it can be placed directly in the oven."],
        correctIndex: 0,
        explanation: "Baking follows resting as the next step, which \"afterward\" signals. \"However\" wrongly signals a contrast where the sentence simply describes what happens next; \"for example\" wrongly implies the oven step illustrates the resting step rather than following it; and \"in addition\" wrongly treats it as a separate extra point rather than the next step in one sequence.",
      },
      ],
    },
    {
      id: "transitions-2",
      level: 2,
      label: "Intermediate",
      questions: [
      {
        type: "concession-contrast",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["Critics initially dismissed the film as forgettable. Nonetheless, it went on to win three major festival awards within the year.", "Critics initially dismissed the film as forgettable. Consequently, it went on to win three major festival awards within the year.", "Critics initially dismissed the film as forgettable. Specifically, it went on to win three major festival awards within the year.", "Critics initially dismissed the film as forgettable. In addition, it went on to win three major festival awards within the year."],
        correctIndex: 0,
        explanation: "Winning awards despite a dismissive reception is a concession, which \"nonetheless\" signals. \"Consequently\" wrongly implies the dismissal caused the awards; \"specifically\" wrongly implies the awards narrow down or clarify the dismissal; and \"in addition\" treats the awards as one more unrelated fact, missing the tension between the two.",
      },
      {
        type: "cause-effect",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The region experienced its driest winter in four decades. Consequently, several reservoirs dropped to less than a third of their normal capacity.", "The region experienced its driest winter in four decades. Nonetheless, several reservoirs dropped to less than a third of their normal capacity.", "The region experienced its driest winter in four decades. Moreover, several reservoirs dropped to less than a third of their normal capacity.", "The region experienced its driest winter in four decades. In contrast, several reservoirs dropped to less than a third of their normal capacity."],
        correctIndex: 0,
        explanation: "Low reservoir levels are a direct result of the dry winter, which \"consequently\" signals. \"Nonetheless\" wrongly signals a contrast where the sentence describes a straightforward result; \"moreover\" wrongly treats the reservoir levels as an unrelated additional point; and \"in contrast\" wrongly implies the reservoir levels oppose the dry winter rather than following from it.",
      },
      {
        type: "addition-emphatic",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The new engine design reduced fuel consumption by nearly twenty percent. Moreover, the redesigned dashboard added three new safety alerts.", "The new engine design reduced fuel consumption by nearly twenty percent. Consequently, the redesigned dashboard added three new safety alerts.", "The new engine design reduced fuel consumption by nearly twenty percent. In contrast, the redesigned dashboard added three new safety alerts.", "The new engine design reduced fuel consumption by nearly twenty percent. Namely, the redesigned dashboard added three new safety alerts."],
        correctIndex: 0,
        explanation: "The engine and the dashboard are two separate improvements, which \"moreover\" signals. \"Consequently\" wrongly implies the dashboard alerts resulted from the fuel savings; \"in contrast\" wrongly implies the two improvements oppose each other; and \"namely\" wrongly implies the dashboard restates or specifies the fuel savings rather than adding a distinct improvement.",
      },
      {
        type: "direct-contrast",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["Freshwater eels spend most of their adult lives in rivers and lakes. In contrast, saltwater eels remain in the ocean throughout their entire life cycle.", "Freshwater eels spend most of their adult lives in rivers and lakes. Consequently, saltwater eels remain in the ocean throughout their entire life cycle.", "Freshwater eels spend most of their adult lives in rivers and lakes. Moreover, saltwater eels remain in the ocean throughout their entire life cycle.", "Freshwater eels spend most of their adult lives in rivers and lakes. Specifically, saltwater eels remain in the ocean throughout their entire life cycle."],
        correctIndex: 0,
        explanation: "The two species' habitats directly oppose each other, which \"in contrast\" signals. \"Consequently\" wrongly implies saltwater eels' habitat resulted from freshwater eels' habitat; \"moreover\" wrongly treats the two facts as simply additive rather than opposed; and \"specifically\" wrongly implies the second sentence narrows down or clarifies the first rather than contrasting with it.",
      },
      {
        type: "specification",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The committee cited one factor above all others in rejecting the proposal. Specifically, the projected cost had nearly doubled since the initial estimate.", "The committee cited one factor above all others in rejecting the proposal. Nonetheless, the projected cost had nearly doubled since the initial estimate.", "The committee cited one factor above all others in rejecting the proposal. In addition, the projected cost had nearly doubled since the initial estimate.", "The committee cited one factor above all others in rejecting the proposal. In contrast, the projected cost had nearly doubled since the initial estimate."],
        correctIndex: 0,
        explanation: "Naming the cost overrun identifies the one factor already referred to, which \"specifically\" signals. \"Nonetheless\" wrongly signals a contrast where the sentence narrows down what was just mentioned; \"in addition\" wrongly treats the cost as a separate, second factor when the sentence says there was only one; and \"in contrast\" wrongly implies the two sentences oppose each other.",
      },
      ],
    },
    {
      id: "transitions-3",
      level: 3,
      label: "Advanced",
      questions: [
      {
        type: "restatement-specification",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The board's decision effectively ended the merger talks; in other words, both companies quietly resumed operating as independent competitors within the month.", "The board's decision effectively ended the merger talks; by the same token, both companies quietly resumed operating as independent competitors within the month.", "The board's decision effectively ended the merger talks; conversely, both companies quietly resumed operating as independent competitors within the month.", "The board's decision effectively ended the merger talks; nevertheless, both companies quietly resumed operating as independent competitors within the month."],
        correctIndex: 0,
        explanation: "Resuming as competitors is simply what \"ending the merger talks\" amounts to, restated concretely, which \"in other words\" signals. \"By the same token\" wrongly implies a separate, parallel instance of similar reasoning rather than a restatement of the same outcome; \"conversely\" wrongly implies the opposite case; and \"nevertheless\" wrongly signals a contrast where the second clause simply restates the first.",
      },
      {
        type: "opposite-case-contrast",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["In the northern half of the country, the new policy sharply reduced emissions within two years. Conversely, in the southern half, emissions continued rising at the same rate as before.", "In the northern half of the country, the new policy sharply reduced emissions within two years. Likewise, in the southern half, emissions continued rising at the same rate as before.", "In the northern half of the country, the new policy sharply reduced emissions within two years. Namely, in the southern half, emissions continued rising at the same rate as before.", "In the northern half of the country, the new policy sharply reduced emissions within two years. Accordingly, in the southern half, emissions continued rising at the same rate as before."],
        correctIndex: 0,
        explanation: "The southern result is the reverse of the northern one, which \"conversely\" signals precisely. \"Likewise\" wrongly implies the two regions matched; \"namely\" wrongly implies the southern result specifies or clarifies the northern one; and \"accordingly\" wrongly implies the southern result followed logically from the northern policy's success.",
      },
      {
        type: "formal-concession",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The committee's own bylaws technically permitted the vote to proceed without a quorum; notwithstanding, the chair chose to postpone it until more members were present.", "The committee's own bylaws technically permitted the vote to proceed without a quorum; hence, the chair chose to postpone it until more members were present.", "The committee's own bylaws technically permitted the vote to proceed without a quorum; likewise, the chair chose to postpone it until more members were present.", "The committee's own bylaws technically permitted the vote to proceed without a quorum; namely, the chair chose to postpone it until more members were present."],
        correctIndex: 0,
        explanation: "Postponing despite having formal permission to proceed is a concession, which \"notwithstanding\" signals. \"Hence\" wrongly implies the postponement was a direct consequence of the bylaws' permission, the reverse of what happened; \"likewise\" wrongly implies the postponement parallels the permission rather than going against it; and \"namely\" wrongly implies the postponement specifies what the bylaws permitted.",
      },
      {
        type: "analogy",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["A single loose bolt can bring down an entire aircraft engine. By the same token, one uncorrected error in a spacecraft's guidance code can doom an entire mission.", "A single loose bolt can bring down an entire aircraft engine. Nevertheless, one uncorrected error in a spacecraft's guidance code can doom an entire mission.", "A single loose bolt can bring down an entire aircraft engine. Namely, one uncorrected error in a spacecraft's guidance code can doom an entire mission.", "A single loose bolt can bring down an entire aircraft engine. Consequently, one uncorrected error in a spacecraft's guidance code can doom an entire mission."],
        correctIndex: 0,
        explanation: "The spacecraft example applies the same principle to a different, analogous case, which \"by the same token\" signals. \"Nevertheless\" wrongly signals a contrast where the sentence draws a parallel; \"namely\" wrongly implies the spacecraft case specifies or restates the aircraft case rather than paralleling it; and \"consequently\" wrongly implies the spacecraft failure results from the aircraft engine failure.",
      },
      {
        type: "practical-restatement",
        prompt: "Which choice completes the text with the most logical transition?",
        options: ["The new ordinance does not technically ban food trucks from the downtown district; in effect, the permitting fees are set so high that almost none can afford to operate there.", "The new ordinance does not technically ban food trucks from the downtown district; namely, the permitting fees are set so high that almost none can afford to operate there.", "The new ordinance does not technically ban food trucks from the downtown district; likewise, the permitting fees are set so high that almost none can afford to operate there.", "The new ordinance does not technically ban food trucks from the downtown district; conversely, the permitting fees are set so high that almost none can afford to operate there."],
        correctIndex: 0,
        explanation: "The fees produce the practical result of a ban even without a formal one, which \"in effect\" signals precisely. \"Namely\" wrongly implies the fee structure specifies or names a ban the sentence says doesn't formally exist; \"likewise\" wrongly treats the fees as a separate, parallel fact rather than the practical outcome of the ordinance; and \"conversely\" wrongly implies the fees are the opposite case, when they actually achieve the same practical effect as a ban.",
      },
      ],
    },
    ],
  },
  {
    id: "rhetorical-synthesis",
    title: "Rhetorical Synthesis",
    description: "Given a short set of notes and a stated goal, choosing the sentence that best accomplishes that specific goal using the given information — not just any true sentence the notes would support. This is Expression of Ideas, the same real Digital SAT domain as Transitions, sharing this tab for the same reason.",
    levels: [
    {
      id: "rhetorical-synthesis-1",
      level: 1,
      label: "Foundational",
      questions: [
      {
        type: "emphasize-change",
        notes: [
          "Mireille Duchamp opened Petit Four Bakery in 1998.",
          "The bakery specializes in sourdough bread.",
          "In 2015, she added a second location downtown.",
          "The original location still uses the same wood-fired oven from 1998.",
        ],
        goal: "The writer wants to emphasize that the bakery has grown since it opened.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Since opening in 1998, Mireille Duchamp's Petit Four Bakery has grown enough to add a second downtown location in 2015.",
          "Mireille Duchamp's Petit Four Bakery, opened in 1998, specializes in sourdough bread.",
          "The original Petit Four Bakery still bakes its bread in the same wood-fired oven it used in 1998.",
          "Petit Four Bakery is known for its sourdough bread at both its original and downtown locations.",
        ],
        correctIndex: 0,
        explanation: "This choice frames the second location as growth over time from the 1998 opening, which is exactly the goal. The sourdough-specialty sentence states a fact but never addresses growth; the wood-fired-oven sentence emphasizes continuity and tradition, the opposite emphasis from growth; and the two-locations sentence centers the product, not the trajectory of growing from one location to two.",
      },
      {
        type: "describe-advantage",
        notes: [
          "Marine biologist Priya Nandakumar compared two ways of counting fish on coral reefs.",
          "Method A: a diver swims a fixed transect line, counting every fish seen.",
          "Method B: an underwater camera records video, and researchers count fish later by watching the footage.",
          "Method A finished in half the time of Method B.",
          "Method B counted about 20% more fish overall, including small or well-camouflaged species.",
        ],
        goal: "The writer wants to describe one advantage of Method B over Method A.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Method B counted roughly 20% more fish than Method A did, including small or well-camouflaged species that a diver might miss.",
          "Method A involves a diver swimming a fixed line and counting every fish that is seen.",
          "Method A took only half as long to complete as Method B did.",
          "Priya Nandakumar is a marine biologist who compared two different methods of counting reef fish.",
          ],
        correctIndex: 0,
        explanation: "Counting more fish, including ones easy to miss, is a genuine advantage of Method B, matching the goal exactly. The sentence about Method A's procedure describes A, not an advantage of B; the sentence about A's shorter time describes an advantage of A, the wrong direction entirely; and the sentence about Nandakumar's comparison is background, naming no advantage at all.",
      },
      {
        type: "describe-similarity",
        notes: [
          "Illustrator Joon-ho Baek uses watercolor and soft, muted colors.",
          "Illustrator Rosa Elena Vidal uses bold ink outlines and bright, saturated colors.",
          "Both illustrators have won national awards for children's picture books.",
          "Baek's books are often set in quiet, rural settings; Vidal's are often set in busy cities.",
        ],
        goal: "The writer wants to describe a similarity between the two illustrators.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Despite their very different visual styles, both Joon-ho Baek and Rosa Elena Vidal have won national awards for their children's picture books.",
          "Joon-ho Baek's watercolor illustrations use soft, muted colors, often in quiet, rural settings.",
          "Rosa Elena Vidal's bold ink outlines and bright colors stand in contrast to Baek's softer watercolor style.",
          "Baek's books tend to be set in the countryside, while Vidal's are usually set in cities.",
        ],
        correctIndex: 0,
        explanation: "Shared national awards, despite very different styles, is the one similarity the notes support, matching the goal. The sentence about Baek alone describes only one illustrator; the sentence contrasting their color styles states a difference, not a similarity; and the sentence about rural versus city settings is also a contrast, the opposite of what the goal calls for.",
      },
      {
        type: "introduce-topic",
        notes: [
          "The city of Fenwick installed a protected bike lane on Elm Street in March.",
          "Before the lane was installed, an average of 40 cyclists used Elm Street daily.",
          "Since the lane was installed, an average of 95 cyclists use Elm Street daily.",
          "Local shop owners report no significant change in parking availability.",
        ],
        goal: "The writer wants to introduce the topic to a reader unfamiliar with Fenwick's new bike lane.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "In March, the city of Fenwick installed a new protected bike lane along Elm Street.",
          "Cyclist traffic on Elm Street has more than doubled since the protected bike lane was installed.",
          "Local shop owners on Elm Street have not reported any significant change in parking availability.",
          "Before the bike lane existed, an average of 40 cyclists rode on Elm Street each day.",
        ],
        correctIndex: 0,
        explanation: "Stating what was installed, when, and where is the natural way to introduce the topic to someone who knows nothing about it yet. The traffic-doubling sentence reports a result and assumes the reader already knows a lane exists; the parking sentence is a specific supporting detail, not an introduction; and the baseline-cyclist sentence describes conditions before the lane, not the lane itself.",
      },
      {
        type: "emphasize-mechanism",
        notes: [
          "The painted lady butterfly migrates from North Africa to the Arctic Circle.",
          "The full migration covers roughly 9,000 miles round trip.",
          "No single butterfly completes the whole journey; it takes six or more generations.",
          "Each generation flies part of the route, then reproduces before dying.",
        ],
        goal: "The writer wants to emphasize how the migration is completed despite no single butterfly making the whole trip.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Though the roughly 9,000-mile round trip takes six or more generations to complete, no single painted lady butterfly ever makes the entire journey itself.",
          "The painted lady butterfly's migration stretches from North Africa all the way to the Arctic Circle.",
          "The painted lady butterfly is known for completing a migration of about 9,000 miles round trip.",
          "Each generation of painted lady butterflies dies after flying its portion of the route and reproducing.",
        ],
        correctIndex: 0,
        explanation: "The \"though... no single butterfly\" framing directly emphasizes the goal's specific despite-relationship between the trip's length and no one butterfly completing it. The route sentence and the distance sentence each state one fact without that emphasis, and the life-cycle sentence describes the relay mechanism itself without ever framing it against the surprising fact that no single butterfly makes the full trip.",
      },
      ],
    },
    {
      id: "rhetorical-synthesis-2",
      level: 2,
      label: "Intermediate",
      questions: [
      {
        type: "describe-difference",
        notes: [
          "The town of Aldermere piloted a solar-panel co-op where residents jointly own panels installed on a shared field.",
          "The town of Brackwood piloted a program where individual homeowners lease panels installed on their own roofs.",
          "Aldermere's co-op reduced the average participating household's electric bill by 30%.",
          "Brackwood's leasing program reduced the average participating household's electric bill by 22%.",
        ],
        goal: "The writer wants to describe a difference between the two towns' outcomes.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Aldermere's shared-panel co-op cut the average participating household's electric bill by 30%, compared with a 22% reduction in Brackwood's individual leasing program.",
          "Both Aldermere and Brackwood piloted programs designed to bring solar power to their residents.",
          "Aldermere's co-op installs panels on a shared field, while individual homeowners in Brackwood lease panels for their own roofs.",
          "Aldermere's solar co-op reduced participating households' electric bills by 30% on average.",
        ],
        correctIndex: 0,
        explanation: "Comparing the two towns' bill reductions directly is a difference in outcomes, exactly what the goal asks for. The \"both piloted programs\" sentence states a similarity, not a difference; the setup-comparison sentence describes a difference in structure, not in outcomes; and the Aldermere-only sentence gives one town's result with no comparison at all.",
      },
      {
        type: "acknowledge-limitation",
        notes: [
          "Researcher Femi Adewale placed potted plants in half of a school's classrooms and none in the other half.",
          "Students in plant classrooms scored an average of 4 points higher on a standardized attention test.",
          "Adewale tracked room temperature and found no meaningful difference between the two groups of classrooms.",
          "Adewale did not test whether the effect held for younger elementary students.",
        ],
        goal: "The writer wants to acknowledge a limitation of Adewale's study.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Adewale's study did not test whether the same 4-point attention benefit would hold for younger elementary students.",
          "Students in classrooms with potted plants scored an average of 4 points higher on a standardized attention test.",
          "Adewale tracked room temperature in both groups of classrooms and found no meaningful difference.",
          "Femi Adewale placed potted plants in half of a school's classrooms and left the other half empty.",
        ],
        correctIndex: 0,
        explanation: "An untested age group is a genuine gap in what the study covered, which is what a limitation means. The 4-point finding is the study's result, not a limitation of it; the temperature-tracking sentence describes a controlled variable, a strength of the design rather than a weakness; and the setup sentence just describes the study's design.",
      },
      {
        type: "emphasize-effect",
        notes: [
          "The city of Rosemont used to send a written warning after a first noise complaint.",
          "Rosemont switched to sending a text message instead of a written warning in 2020.",
          "After the switch, the average time between a complaint and the resident's response dropped from 6 days to 1 day.",
          "The total number of noise complaints filed did not change significantly after the switch.",
        ],
        goal: "The writer wants to emphasize the effect of the 2020 change on how quickly residents responded.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "After switching to text-message warnings in 2020, Rosemont saw the average response time to a noise complaint drop from 6 days to just 1 day.",
          "The total number of noise complaints filed in Rosemont did not change significantly after the 2020 switch.",
          "Rosemont used to send a written warning to residents after their first noise complaint.",
          "In 2020, the city of Rosemont began sending a text message instead of a written warning.",
        ],
        correctIndex: 0,
        explanation: "The 6-day-to-1-day drop is the specific effect on response speed the goal asks for. The complaint-volume sentence reports a different measure entirely, not response speed; the old-system sentence describes the prior warning method, not the effect of changing it; and the what-changed sentence names the change itself without stating its effect.",
      },
      {
        type: "describe-tradeoff",
        notes: [
          "Translator Anke Voss rendered a 19th-century German poem into English using rhyme, matching the original's rhyme scheme.",
          "Translator Julian Ferro rendered the same poem into English using free verse, with no rhyme.",
          "Voss's version is 4 lines longer than the original to preserve the rhyme.",
          "Ferro's version matches the original's line count exactly.",
        ],
        goal: "The writer wants to describe a trade-off in Voss's approach to the translation.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "To preserve the original poem's rhyme scheme, Anke Voss's translation runs 4 lines longer than the German original.",
          "Julian Ferro's free-verse translation matches the original poem's line count exactly.",
          "Anke Voss translated the poem using rhyme, while Julian Ferro used free verse.",
          "The original poem was written in German in the 19th century.",
        ],
        correctIndex: 0,
        explanation: "Gaining the rhyme scheme at the cost of 4 extra lines is a trade-off specific to Voss's choice, matching the goal exactly. The Ferro sentence describes the other translator, not a trade-off in Voss's; the method-comparison sentence contrasts their approaches without naming any cost of Voss's choice; and the background sentence about the original poem states neither a benefit nor a cost.",
      },
      {
        type: "introduce-topic",
        notes: [
          "Wildlife photographer Idris Coker set up motion-activated cameras in a forest for one year.",
          "The cameras captured images of foxes far more often at dawn and dusk than at midday.",
          "Coker's cameras also recorded far fewer fox sightings during the three coldest winter months.",
          "Coker concluded the drop in winter sightings likely reflects reduced fox activity, not fewer foxes in the area.",
        ],
        goal: "The writer wants to introduce the topic to a reader who knows nothing about Coker's project.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "For one year, wildlife photographer Idris Coker used motion-activated cameras to record fox activity in a forest.",
          "Coker's cameras captured images of foxes far more often at dawn and dusk than in the middle of the day.",
          "Coker concluded that fewer winter sightings likely reflect reduced activity, not fewer foxes overall.",
          "Fox sightings dropped noticeably during the three coldest months of the study.",
        ],
        correctIndex: 0,
        explanation: "Naming who ran the project, what method they used, and for how long is the natural way to introduce it to a reader who knows nothing yet. The dawn-and-dusk sentence and the winter-drop sentence both report specific findings that assume the reader already knows the project exists, and the conclusion sentence interprets a finding rather than introducing the project itself.",
      },
      ],
    },
    {
      id: "rhetorical-synthesis-3",
      level: 3,
      label: "Advanced",
      questions: [
      {
        type: "emphasize-tradeoff",
        notes: [
          "The Hallenbeck City Archive digitized its 19th-century newspaper collection using volunteer labor over six years.",
          "The Corvindale City Archive digitized a comparable collection using paid contractors over eight months.",
          "Hallenbeck's project cost roughly $40,000 in materials and equipment.",
          "Corvindale's project cost roughly $310,000 in contractor fees.",
        ],
        goal: "The writer wants to emphasize a trade-off between the two archives' approaches, not simply list their differences.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Hallenbeck's volunteer-run digitization cost a fraction of Corvindale's, but took roughly nine times as long to complete.",
          "Hallenbeck digitized its collection using volunteers, while Corvindale used paid contractors.",
          "Corvindale's digitization project cost roughly $310,000 in contractor fees over eight months.",
          "Both archives digitized comparable 19th-century newspaper collections.",
        ],
        correctIndex: 0,
        explanation: "Connecting the lower cost to the longer timeline is what makes this a trade-off rather than a plain difference, matching the goal's specific wording. The method-difference sentence lists how they differ without connecting cost to time; the Corvindale-only sentence gives one archive's facts with no comparison; and the similarity sentence about comparable collections isn't a difference at all, let alone a trade-off.",
      },
      {
        type: "explain-contested",
        notes: [
          "Engineers project that removing the Aldous Dam would restore roughly 40 miles of salmon spawning habitat upstream.",
          "The dam currently supplies electricity to about 3,000 homes in the region.",
          "Removing the dam would require replacing that electricity with another source, likely at higher cost to residents.",
          "Local fishing guides support removal; the regional utility company opposes it.",
        ],
        goal: "The writer wants to explain why the dam-removal proposal is contested, not simply describe one side's view.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "The Aldous Dam proposal is contested because removing it would restore valuable salmon habitat but also cut off electricity that currently serves about 3,000 homes.",
          "Local fishing guides support the dam's removal, while the regional utility company opposes it.",
          "Removing the Aldous Dam would restore roughly 40 miles of salmon spawning habitat upstream.",
          "The Aldous Dam currently supplies electricity to about 3,000 homes in the region.",
        ],
        correctIndex: 0,
        explanation: "Naming both the habitat benefit and the electricity cost together is what explains why the proposal is genuinely contested. The guides-versus-utility sentence names who is on each side without saying why; the habitat sentence gives only the benefit side; and the electricity sentence gives only the cost side — neither explains the conflict on its own.",
      },
      {
        type: "cast-doubt",
        notes: [
          "Linguist Odalys Ferreira has documented a vowel shift in a regional dialect over the past 40 years.",
          "One hypothesis attributes the shift to increased contact with speakers of a neighboring dialect.",
          "A second hypothesis attributes the shift to influence from regional broadcast media.",
          "Ferreira notes the shift began accelerating a decade before regional broadcasts became common in the area.",
        ],
        goal: "The writer wants to use the given information to cast doubt on one of the two hypotheses.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Because the vowel shift began accelerating a decade before regional broadcasts became common, the media-influence hypothesis is harder to support than the dialect-contact one.",
          "Odalys Ferreira has documented a vowel shift in a regional dialect over the past 40 years.",
          "One hypothesis credits the shift to contact with a neighboring dialect; the other credits regional broadcast media.",
          "The vowel shift accelerated over a period of four decades, according to Ferreira's research.",
        ],
        correctIndex: 0,
        explanation: "The timing mismatch — the shift accelerating before broadcasts were common — is the one piece of evidence that actually undercuts a specific hypothesis, matching the goal. The background sentence and the both-hypotheses sentence each state facts neutrally without favoring or doubting either explanation, and the acceleration-timespan sentence gives a timing fact without connecting it to either hypothesis.",
      },
      {
        type: "support-claim",
        notes: [
          "The city of Penrose painted the roofs of 12 municipal buildings white in a trial to reduce indoor cooling costs.",
          "Average indoor temperatures in the painted buildings dropped by 3°F during summer afternoons.",
          "The paint cost $85,000 total across the 12 buildings.",
          "Projected cooling-cost savings are estimated to repay that cost within roughly 5 years.",
        ],
        goal: "The writer wants to use the given information to support the claim that the trial was a sound long-term investment.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "Penrose's $85,000 investment in white roof paint is projected to pay for itself in cooling-cost savings within about 5 years.",
          "Average indoor temperatures in the painted buildings dropped by 3°F during summer afternoons.",
          "The city of Penrose painted the roofs of 12 municipal buildings white as part of a trial.",
          "The white roof paint used in the trial cost a total of $85,000 across all 12 buildings.",
        ],
        correctIndex: 0,
        explanation: "Connecting the cost to its projected payback period is what supports \"sound long-term investment\" specifically. The temperature-drop sentence reports a real finding but never connects it to cost or payback; the trial-description sentence just states the setup; and the cost-alone sentence gives a number with no payback framing, so it doesn't support an investment claim by itself.",
      },
      {
        type: "explain-cause",
        notes: [
          "Agronomist Katarzyna Wozniak compared a 3-crop rotation to a 5-crop rotation on similar test plots over 6 years.",
          "The 3-crop rotation produced slightly higher yields in the first 2 years.",
          "By year 6, the 5-crop rotation's soil nitrogen levels were markedly higher than the 3-crop rotation's.",
          "By year 6, the 5-crop rotation's yields had overtaken the 3-crop rotation's.",
        ],
        goal: "The writer wants to use the given information to explain why the 5-crop rotation eventually produced higher yields.",
        prompt: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        options: [
          "By year 6, the 5-crop rotation's markedly higher soil nitrogen levels likely explain why its yields had overtaken the 3-crop rotation's.",
          "The 3-crop rotation produced slightly higher yields than the 5-crop rotation during the first two years.",
          "Katarzyna Wozniak compared the two rotations on similar test plots over a 6-year period.",
          "By year 6, the 5-crop rotation's yields had overtaken those of the 3-crop rotation.",
        ],
        correctIndex: 0,
        explanation: "Linking the nitrogen difference to the later yield reversal is the one choice that actually explains the outcome, matching the goal. The early-yields sentence describes the opposite, earlier result, not an explanation; the study-design sentence describes methodology, not a cause; and the yields-overtaken sentence states the very result that needs explaining, without supplying the explanation itself.",
      },
      ],
    },
    ],
  },
];
