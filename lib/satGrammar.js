// SAT Vocab — Grammar & Standard English Conventions: the Digital SAT's other
// major Reading & Writing domain, alongside Words in Context. Tests correct
// sentence construction, not word meaning. Organized around the two real
// College Board subdomains, not invented categories:
//   Boundaries               punctuation and sentence boundaries — commas,
//                             semicolons, colons, run-ons, fragments
//   Form, Structure, and Sense   subject-verb agreement, pronoun agreement and
//                             case, verb tense/mood, parallel structure,
//                             modifier placement
// (Transitions/logical connectors, a plausible third category, belongs to the
// Digital SAT's OTHER domain, Expression of Ideas, not Standard English
// Conventions — deliberately left out rather than miscategorized.)
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
];
