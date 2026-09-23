// GRE Vocab — the fourth course. Original writing (definitions, example
// sentences and quiz sentences), not drawn from any published word list.
//
// Same category > level > word shape and the same quiz format as every other
// course (see lib/wordbanks.js): a sentence with a blank, four plausible
// options, one precisely correct.
//
// Organized by CONNOTATION, not theme or function: Positive Charge, Negative
// Charge, and Neutral & Academic. This is deliberately different from every
// course before it (SAT Vocab is function-based, matching the real exam;
// Everyday and Professional are theme-based) because GRE-level vocabulary
// calls for a different, well-established technique — recognizing whether a
// word is favorable, unfavorable, or charge-neutral is often enough to
// eliminate answer choices even before its exact definition is known. The
// Neutral & Academic category exists for the same pedagogical reason: a
// learner who assumes every unfamiliar word must be "good" or "bad" needs
// practice with words that are simply descriptive or analytical instead. See
// CLAUDE.md ("Courses") for the full reasoning.
//
// Difficulty is calibrated higher than SAT Vocab or the other courses at
// every tier — GRE vocabulary starts harder and climbs further. Foundational
// here sits roughly where SAT Vocab's Advanced tier does; Advanced here is
// deliberately obscure, graduate-register vocabulary.
//
// Voice: every example and quiz sentence is set in an academic/intellectual
// register — essays, research, scholarly argument, literary and historical
// criticism — distinct from Everyday Vocabulary's general-life scenes and
// Professional Vocabulary's workplace scenes. Each course has its own voice;
// this is this one's.
//
// Never change level or word ids — users' localStorage references them.

export const greVocabularyCategories = [
  {
    id: "positive-charge",
    title: "Positive Charge",
    description: "Words that land as praise — skill, virtue, or favor — even before you pin down the exact definition.",
    levels: [
      {
        id: "positive-charge-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Affable",
            fact: "\"Affable\" means friendly, pleasant, and easy to talk to. The affable professor lingered after class to chat with any student who had a question.",
            quiz: {
              sentence: "Despite his intimidating reputation as a scholar, the visiting lecturer proved remarkably ______ once the seminar began, chatting easily with students before and after class.",
              options: ["Affable", "Aloof", "Pompous", "Irritable"],
              correctIndex: 0,
              explanation: "Chatting easily and warmly with students describes someone friendly and approachable, or \"affable\"; \"aloof\" means distant, \"pompous\" means self-important, and \"irritable\" means easily annoyed — all the opposite of easy to talk to.",
            },
          },
          {
            word: "Benevolent",
            fact: "\"Benevolent\" means kind and generous, wishing good for others. The benevolent alumna funded scholarships for students who could not otherwise afford tuition.",
            quiz: {
              sentence: "The foundation's ______ mission was to fund research that would directly benefit underserved communities, not to generate a profit for its founders.",
              options: ["Benevolent", "Mercenary", "Indifferent", "Exploitative"],
              correctIndex: 0,
              explanation: "A mission built around helping others without a profit motive is \"benevolent\"; \"mercenary\" means motivated by money, \"indifferent\" means not caring, and \"exploitative\" means taking unfair advantage.",
            },
          },
          {
            word: "Buoyant",
            fact: "\"Buoyant\" means cheerful and quick to recover from setbacks. Her buoyant mood survived even the committee's harshest criticism of her thesis.",
            quiz: {
              sentence: "Even after her manuscript was rejected by three journals, her outlook remained strikingly ______, and she revised the paper with undiminished enthusiasm.",
              options: ["Buoyant", "Despondent", "Resigned", "Embittered"],
              correctIndex: 0,
              explanation: "Staying cheerful and undiminished after repeated rejection is \"buoyant\"; \"despondent\" and \"embittered\" describe being crushed or made resentful by it, and \"resigned\" means having given up.",
            },
          },
          {
            word: "Conscientious",
            fact: "\"Conscientious\" means careful, thorough, and guided by a strong sense of what is right. The conscientious research assistant double-checked every citation before submission.",
            quiz: {
              sentence: "The ______ graduate student verified every data point in the appendix three times before allowing her advisor to see the draft.",
              options: ["Conscientious", "Careless", "Impulsive", "Indifferent"],
              correctIndex: 0,
              explanation: "Triple-checking every figure before showing it to anyone shows careful, dutiful diligence, or being \"conscientious\"; the other three describe carelessness or a lack of concern.",
            },
          },
          {
            word: "Exuberant",
            fact: "\"Exuberant\" means full of energy, enthusiasm, and high spirits. The exuberant freshman signed up for four clubs in her first week on campus.",
            quiz: {
              sentence: "The keynote speaker's ______ delivery, full of gestures and audible delight in her own subject, kept the auditorium awake through a two-hour lecture on tax law.",
              options: ["Exuberant", "Monotone", "Lethargic", "Detached"],
              correctIndex: 0,
              explanation: "Energy and visible enthusiasm that keeps a room engaged is \"exuberant\"; \"monotone,\" \"lethargic,\" and \"detached\" all describe flat or disengaged delivery, which would do the opposite.",
            },
          },
          {
            word: "Gracious",
            fact: "\"Gracious\" means courteous and warm, especially toward someone in a weaker position. The gracious host made sure the newest, shyest member of the seminar felt included.",
            quiz: {
              sentence: "Though her rebuttal dismantled his argument point by point, the senior scholar remained ______ throughout, praising the young researcher's originality before noting where the data fell short.",
              options: ["Gracious", "Condescending", "Scornful", "Curt"],
              correctIndex: 0,
              explanation: "Offering genuine praise even while delivering a sharp critique is \"gracious\"; \"condescending\" and \"scornful\" both belittle the other person, and \"curt\" means abruptly brief.",
            },
          },
          {
            word: "Judicious",
            fact: "\"Judicious\" means showing good sense and sound judgment in making a decision. Her judicious choice of sources gave the essay a persuasive, well-balanced argument.",
            quiz: {
              sentence: "Rather than citing every source she had found, she made a notably ______ selection of only the studies that directly supported her central claim.",
              options: ["Judicious", "Arbitrary", "Haphazard", "Indiscriminate"],
              correctIndex: 0,
              explanation: "Choosing carefully and sensibly, with reasons, is \"judicious\"; \"arbitrary\" and \"haphazard\" mean without a real reason or pattern, and \"indiscriminate\" means without any selectivity at all.",
            },
          },
          {
            word: "Vigilant",
            fact: "\"Vigilant\" means watchful and alert to possible trouble. The vigilant editor caught the contradiction in the manuscript's second chapter that three earlier readers had missed.",
            quiz: {
              sentence: "Peer reviewers are expected to remain ______ for the kind of small inconsistency that an author, too close to the material, is likely to overlook.",
              options: ["Vigilant", "Complacent", "Oblivious", "Indifferent"],
              correctIndex: 0,
              explanation: "Staying alert for something easy to miss is being \"vigilant\"; \"complacent\" means self-satisfied and unwatchful, \"oblivious\" means unaware, and \"indifferent\" means not caring either way.",
            },
          },
          {
            word: "Steadfast",
            fact: "\"Steadfast\" means firm and unwavering in commitment or loyalty. Despite the setbacks, her steadfast belief in the project never wavered.",
            quiz: {
              sentence: "Even after two of her three co-authors withdrew from the project, she remained ______ in her determination to see the study published.",
              options: ["Steadfast", "Wavering", "Half-hearted", "Fickle"],
              correctIndex: 0,
              explanation: "Staying firmly committed despite setbacks is \"steadfast\"; \"wavering,\" \"half-hearted,\" and \"fickle\" all describe commitment that weakens or changes.",
            },
          },
          {
            word: "Tenacious",
            fact: "\"Tenacious\" means persistent and unwilling to give up. The tenacious archivist spent a decade tracking down the letters before publishing her biography.",
            quiz: {
              sentence: "It took a ______ decade of archival digging across three countries before the historian finally located the missing correspondence.",
              options: ["Tenacious", "Half-hearted", "Cursory", "Sporadic"],
              correctIndex: 0,
              explanation: "A decade of persistent searching that doesn't give up is \"tenacious\"; \"half-hearted\" and \"sporadic\" both describe effort that is inconsistent or weak, and \"cursory\" means hasty and superficial.",
            },
          },
        ],
      },
      {
        id: "positive-charge-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Adroit",
            fact: "\"Adroit\" means cleverly skillful, especially in handling a difficult situation. Her adroit handling of the hostile question turned the audience back in her favor.",
            quiz: {
              sentence: "The panel's toughest question seemed designed to embarrass him, but his ______ reply reframed the entire debate to his advantage within a single sentence.",
              options: ["Adroit", "Clumsy", "Evasive", "Belabored"],
              correctIndex: 0,
              explanation: "A reply that skillfully turns a hard question to one's advantage is \"adroit\"; \"clumsy\" and \"belabored\" describe an answer handled poorly, and \"evasive\" means dodging the question rather than skillfully answering it.",
            },
          },
          {
            word: "Astute",
            fact: "\"Astute\" means having sharp judgment and keen perception. The astute reviewer noticed the flaw in the experiment's control group that the authors themselves had missed.",
            quiz: {
              sentence: "It took an unusually ______ reader to notice that the paper's second and fourth footnotes quietly contradicted each other.",
              options: ["Astute", "Careless", "Credulous", "Distracted"],
              correctIndex: 0,
              explanation: "Noticing a subtle contradiction that others missed shows sharp perception, or being \"astute\"; \"careless\" and \"distracted\" would cause someone to miss it, and \"credulous\" means too easily convinced — the opposite of critically sharp.",
            },
          },
          {
            word: "Erudite",
            fact: "\"Erudite\" means showing great learning, especially from wide reading. The erudite footnotes revealed a command of sources spanning five languages.",
            quiz: {
              sentence: "Her ______ commentary drew as easily on medieval theology as on twentieth-century linguistics, footnote after footnote revealing decades of reading.",
              options: ["Erudite", "Superficial", "Derivative", "Simplistic"],
              correctIndex: 0,
              explanation: "Commentary that draws confidently on wide, deep reading is \"erudite\"; \"superficial\" and \"simplistic\" describe shallow treatment, and \"derivative\" means unoriginally copied from others.",
            },
          },
          {
            word: "Indomitable",
            fact: "\"Indomitable\" means impossible to subdue or defeat in spirit. Her indomitable resolve carried the lab through three failed funding cycles.",
            quiz: {
              sentence: "Denied funding twice and doubted by senior colleagues, she pressed on with an almost ______ determination that eventually proved the hypothesis correct.",
              options: ["Indomitable", "Faltering", "Diminished", "Tentative"],
              correctIndex: 0,
              explanation: "Determination that survives repeated defeat without breaking is \"indomitable\"; \"faltering,\" \"diminished,\" and \"tentative\" all describe resolve that is weakening — the opposite of unconquerable.",
            },
          },
          {
            word: "Intrepid",
            fact: "\"Intrepid\" means fearless in the face of danger or difficulty. The intrepid field researcher spent six months alone tracking the migration by canoe.",
            quiz: {
              sentence: "Only the most ______ of the graduate students volunteered for the six-month expedition to the research station in Antarctica.",
              options: ["Intrepid", "Timorous", "Reluctant", "Complacent"],
              correctIndex: 0,
              explanation: "Willingly taking on a dangerous, difficult expedition is \"intrepid\"; \"timorous\" means fearful, \"reluctant\" means unwilling, and \"complacent\" means too comfortable to be bothered — none of which would volunteer.",
            },
          },
          {
            word: "Munificent",
            fact: "\"Munificent\" means extremely generous, especially with money. The munificent bequest endowed three new chairs in the philosophy department.",
            quiz: {
              sentence: "The donor's ______ gift, large enough to fund the entire archive's digitization, arrived with no conditions attached and no request for public credit.",
              options: ["Munificent", "Token", "Grudging", "Conditional"],
              correctIndex: 0,
              explanation: "A large, no-strings-attached gift is \"munificent\"; \"token\" means small and symbolic, \"grudging\" means given reluctantly, and \"conditional\" means given with strings attached — the opposite of unconditional generosity.",
            },
          },
          {
            word: "Perspicacious",
            fact: "\"Perspicacious\" means having keen insight into people or situations. Her perspicacious reading of the committee's mood let her revise the proposal before it was rejected.",
            quiz: {
              sentence: "It was a genuinely ______ observation: she sensed, from a single hesitant pause in the interview, that the subject was concealing something central to the story.",
              options: ["Perspicacious", "Obtuse", "Naive", "Cursory"],
              correctIndex: 0,
              explanation: "Sensing something important from a subtle cue is \"perspicacious\"; \"obtuse\" means slow to understand, \"naive\" means lacking worldly insight, and \"cursory\" means hasty and superficial.",
            },
          },
          {
            word: "Sagacious",
            fact: "\"Sagacious\" means wise, showing keen practical judgment. The sagacious department chair steered the hiring committee away from a costly mistake.",
            quiz: {
              sentence: "The retiring professor's ______ advice, drawn from forty years of watching academic fads rise and fall, kept the department from chasing the latest trend.",
              options: ["Sagacious", "Naive", "Impulsive", "Shortsighted"],
              correctIndex: 0,
              explanation: "Advice grounded in decades of hard-won judgment is \"sagacious\"; \"naive,\" \"impulsive,\" and \"shortsighted\" all describe judgment lacking exactly that seasoned wisdom.",
            },
          },
          {
            word: "Salubrious",
            fact: "\"Salubrious\" means beneficial to health or well-being. The university relocated the archive to a more salubrious, climate-controlled wing of the library.",
            quiz: {
              sentence: "Researchers noted that participants who worked in a quiet, well-lit office reported markedly better outcomes than those in the noisy, poorly ventilated one — a small but telling reminder of how ______ conditions shape performance.",
              options: ["Salubrious", "Noxious", "Squalid", "Deleterious"],
              correctIndex: 0,
              explanation: "Conditions that are good for well-being are \"salubrious\"; \"noxious,\" \"squalid,\" and \"deleterious\" all describe conditions that are harmful or filthy — the opposite of health-giving.",
            },
          },
          {
            word: "Venerable",
            fact: "\"Venerable\" means commanding deep respect, often because of age or long service. The venerable professor emeritus still attended every departmental colloquium.",
            quiz: {
              sentence: "The ______ institution, founded before the country itself, was treated by every visiting scholar with a certain deference.",
              options: ["Venerable", "Nascent", "Disreputable", "Obscure"],
              correctIndex: 0,
              explanation: "An old institution treated with deference by everyone is \"venerable\"; \"nascent\" means just beginning, \"disreputable\" means having a bad reputation, and \"obscure\" means little known — none commands that kind of respect.",
            },
          },
        ],
      },
      {
        id: "positive-charge-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Assiduous",
            fact: "\"Assiduous\" means showing great care and persistent effort. Her assiduous attention to the manuscript's footnotes caught errors that three previous editors had missed.",
            quiz: {
              sentence: "Only through ______ cross-referencing of parish records, ship manifests, and tax rolls did the genealogist finally reconstruct the family's path across three centuries.",
              options: ["Assiduous", "Cursory", "Desultory", "Perfunctory"],
              correctIndex: 0,
              explanation: "Patient, careful, sustained effort across many sources is \"assiduous\"; \"cursory,\" \"desultory,\" and \"perfunctory\" all describe effort that is hasty, unfocused, or done as a bare minimum.",
            },
          },
          {
            word: "Consummate",
            fact: "\"Consummate\" means showing complete, masterful skill. The consummate translator preserved not just the poem's meaning but its meter and rhyme.",
            quiz: {
              sentence: "Watching her defend the dissertation, the committee recognized a truly ______ command of the material: no question, however unexpected, seemed to catch her off guard.",
              options: ["Consummate", "Tenuous", "Rudimentary", "Incomplete"],
              correctIndex: 0,
              explanation: "A total, flawless command of the material is \"consummate\"; \"tenuous,\" \"rudimentary,\" and \"incomplete\" all describe knowledge that is weak, basic, or partial.",
            },
          },
          {
            word: "Efficacious",
            fact: "\"Efficacious\" means effective at producing the intended result. The new teaching method proved more efficacious than the lecture format it replaced.",
            quiz: {
              sentence: "The trial found the intervention genuinely ______: students who used the new study method outperformed the control group on every measure the researchers tracked.",
              options: ["Efficacious", "Counterproductive", "Negligible", "Inert"],
              correctIndex: 0,
              explanation: "Something that actually produces the intended, measurable result is \"efficacious\"; \"counterproductive\" means it works against the goal, and \"negligible\" and \"inert\" both describe an effect too small or absent to matter.",
            },
          },
          {
            word: "Halcyon",
            fact: "\"Halcyon\" describes a past period that was idyllically calm and happy. Historians are often skeptical of any golden age, including the halcyon childhood some memoirists describe.",
            quiz: {
              sentence: "The professor's memoir remembers graduate school as a ______ era of long, unhurried conversations, though her own letters from the time describe considerable anxiety about money.",
              options: ["Halcyon", "Turbulent", "Fraught", "Bleak"],
              correctIndex: 0,
              explanation: "A remembered era of calm and happiness is \"halcyon\"; \"turbulent,\" \"fraught,\" and \"bleak\" all describe a period marked by trouble or hardship, which is what her letters actually suggest.",
            },
          },
          {
            word: "Propitious",
            fact: "\"Propitious\" means indicating a good chance of success; favorable to what one hopes for. The committee judged the timing propitious for proposing the merger.",
            quiz: {
              sentence: "With three major grants awarded to the field that year, the department chair judged the moment ______ for proposing an entirely new research center.",
              options: ["Propitious", "Inauspicious", "Untimely", "Precarious"],
              correctIndex: 0,
              explanation: "A moment that favors success is \"propitious\"; \"inauspicious\" and \"untimely\" both describe bad timing, and \"precarious\" means unstable or risky.",
            },
          },
          {
            word: "Punctilious",
            fact: "\"Punctilious\" means showing great attention to correctness and formal detail. The punctilious secretary insisted every citation follow the style guide to the letter.",
            quiz: {
              sentence: "The journal's copyeditor was famously ______, rejecting a submission outright over a single inconsistently formatted footnote.",
              options: ["Punctilious", "Slapdash", "Lax", "Negligent"],
              correctIndex: 0,
              explanation: "Rejecting work over one small formatting error shows extreme attention to correct detail, or being \"punctilious\"; \"slapdash,\" \"lax,\" and \"negligent\" all describe carelessness about exactly that kind of detail.",
            },
          },
          {
            word: "Redoubtable",
            fact: "\"Redoubtable\" means formidable, especially as an opponent, in a way that inspires respect. The redoubtable debate champion had not lost a round in four years.",
            quiz: {
              sentence: "As a dissertation examiner, she was ______: candidates spent months preparing for her questions, knowing no weak argument would survive her scrutiny.",
              options: ["Redoubtable", "Ineffectual", "Negligible", "Complaisant"],
              correctIndex: 0,
              explanation: "An examiner so formidable that candidates prepare for months is \"redoubtable\"; \"ineffectual\" and \"negligible\" describe someone with little real impact, and \"complaisant\" means eager to please — the opposite of a tough examiner.",
            },
          },
          {
            word: "Indefatigable",
            fact: "\"Indefatigable\" means persisting tirelessly, never tiring. The indefatigable research team worked through the night before the grant deadline without complaint.",
            quiz: {
              sentence: "After sixteen consecutive hours in the lab, the rest of the team had gone home, but the postdoc remained ______, resetting the experiment for a fourth attempt.",
              options: ["Indefatigable", "Exhausted", "Flagging", "Listless"],
              correctIndex: 0,
              explanation: "Someone who keeps going without tiring, even after sixteen hours, is \"indefatigable\"; \"exhausted,\" \"flagging,\" and \"listless\" all describe someone running out of energy — the opposite of tireless.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "negative-charge",
    title: "Negative Charge",
    description: "Words that land as criticism — dishonesty, harm, or hostility — even before you pin down the exact definition.",
    levels: [
      {
        id: "negative-charge-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Belligerent",
            fact: "\"Belligerent\" means hostile and aggressive, eager to fight or argue. The belligerent commenter turned every thread on the forum into a shouting match.",
            quiz: {
              sentence: "The panel discussion, meant to be a calm exchange of views, turned ______ the moment one commentator accused the other of bad faith.",
              options: ["Belligerent", "Cordial", "Placid", "Conciliatory"],
              correctIndex: 0,
              explanation: "A calm discussion that turns hostile after an accusation is \"belligerent\"; \"cordial\" and \"placid\" describe calm friendliness, and \"conciliatory\" means trying to smooth things over — all the opposite of picking a fight.",
            },
          },
          {
            word: "Brash",
            fact: "\"Brash\" means self-confident in a rude or tactless way. The brash undergraduate interrupted the visiting Nobel laureate twice before finishing his question.",
            quiz: {
              sentence: "The freshman's ______ interruption of the keynote speaker, twice, before the Q&A had even opened, drew audible gasps from the audience.",
              options: ["Brash", "Timid", "Deferential", "Reticent"],
              correctIndex: 0,
              explanation: "Rudely interrupting a respected speaker without hesitation is \"brash\"; \"timid,\" \"deferential,\" and \"reticent\" all describe holding back out of respect or shyness — the opposite of overbold.",
            },
          },
          {
            word: "Callous",
            fact: "\"Callous\" means insensitive to others' suffering. His callous dismissal of the survivors' testimony undermined the credibility of the entire report.",
            quiz: {
              sentence: "Critics called the report ______, noting that its cost-benefit tables reduced the community's suffering to a single line item without comment.",
              options: ["Callous", "Compassionate", "Empathetic", "Sensitive"],
              correctIndex: 0,
              explanation: "Reducing real suffering to a cold line item shows a lack of feeling, or being \"callous\"; \"compassionate,\" \"empathetic,\" and \"sensitive\" all describe genuine concern for others — the opposite of what the critics described.",
            },
          },
          {
            word: "Deceitful",
            fact: "\"Deceitful\" means dishonest and deliberately misleading. The deceitful footnote cited a source that, on inspection, said the opposite of what the author claimed.",
            quiz: {
              sentence: "The retraction accused the paper's authors of ______ reporting, noting that two of the central figures had been altered to fit the hypothesis.",
              options: ["Deceitful", "Meticulous", "Transparent", "Candid"],
              correctIndex: 0,
              explanation: "Altering data to fit a hypothesis is dishonest, or \"deceitful\"; \"meticulous\" means careful, and \"transparent\" and \"candid\" both mean open and honest — the opposite of what the retraction accused them of.",
            },
          },
          {
            word: "Frivolous",
            fact: "\"Frivolous\" means not serious or sensible, lacking real substance. The reviewer dismissed the objection as frivolous, unsupported by a single citation.",
            quiz: {
              sentence: "The committee rejected the appeal as ______, noting that it raised no new evidence and rested entirely on a technicality already addressed twice.",
              options: ["Frivolous", "Substantive", "Compelling", "Weighty"],
              correctIndex: 0,
              explanation: "An appeal with no real new content is \"frivolous\"; \"substantive,\" \"compelling,\" and \"weighty\" all describe an argument with real force — the opposite of what the committee found.",
            },
          },
          {
            word: "Insolent",
            fact: "\"Insolent\" means boldly disrespectful, especially toward someone owed respect. The insolent reply to the dean's memo was forwarded to the entire faculty within an hour.",
            quiz: {
              sentence: "The graduate student's ______ email to the department chair, questioning her competence in front of the entire mailing list, was not well received.",
              options: ["Insolent", "Deferential", "Courteous", "Diplomatic"],
              correctIndex: 0,
              explanation: "Publicly questioning a superior's competence is boldly disrespectful, or \"insolent\"; \"deferential,\" \"courteous,\" and \"diplomatic\" all describe treating someone with the respect that insolence withholds.",
            },
          },
          {
            word: "Lethargic",
            fact: "\"Lethargic\" means sluggish and lacking energy. The lethargic afternoon session, scheduled right after lunch, saw half the audience nodding off.",
            quiz: {
              sentence: "By the third hour of testimony, even the most attentive jurors had grown visibly ______, their notes trailing off mid-sentence.",
              options: ["Lethargic", "Alert", "Animated", "Engrossed"],
              correctIndex: 0,
              explanation: "Growing sluggish enough that notes trail off is \"lethargic\"; \"alert,\" \"animated,\" and \"engrossed\" all describe active attention — the opposite of fading energy.",
            },
          },
          {
            word: "Obstinate",
            fact: "\"Obstinate\" means stubbornly unwilling to change one's mind. The obstinate committee member blocked the proposal for the third year running, still unconvinced by any of the new evidence.",
            quiz: {
              sentence: "Presented with three independent studies contradicting his position, the reviewer remained ______, dismissing all three in a single paragraph.",
              options: ["Obstinate", "Persuadable", "Receptive", "Flexible"],
              correctIndex: 0,
              explanation: "Refusing to budge even against three independent studies is \"obstinate\"; \"persuadable,\" \"receptive,\" and \"flexible\" all describe openness to changing one's mind — the opposite of stubborn refusal.",
            },
          },
          {
            word: "Petty",
            fact: "\"Petty\" means concerned with trivial matters in a small-minded way. The petty dispute over office space dragged the faculty meeting on for an extra hour.",
            quiz: {
              sentence: "Colleagues dismissed the feud as ______, noting that two full professors had spent a semester arguing over who got the corner office.",
              options: ["Petty", "Momentous", "Substantial", "Weighty"],
              correctIndex: 0,
              explanation: "Arguing for a semester over an office is small-minded, or \"petty\"; \"momentous,\" \"substantial,\" and \"weighty\" all describe something genuinely significant, which an office dispute is not.",
            },
          },
          {
            word: "Vain",
            fact: "\"Vain\" means excessively proud of one's own appearance or achievements. The vain lecturer began every talk with a five-minute list of his own accolades.",
            quiz: {
              sentence: "So ______ was the visiting scholar that his biography note ran longer than his actual paper.",
              options: ["Vain", "Modest", "Self-effacing", "Humble"],
              correctIndex: 0,
              explanation: "Someone whose self-praise outgrows the substance of the work is \"vain\"; \"modest,\" \"self-effacing,\" and \"humble\" all describe playing down one's own achievements — the opposite of vanity.",
            },
          },
        ],
      },
      {
        id: "negative-charge-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Acrimonious",
            fact: "\"Acrimonious\" means bitter and sharp-tongued, especially in a dispute. The acrimonious exchange between the two theorists spilled from the journal's letters page into open feud.",
            quiz: {
              sentence: "What began as a routine disagreement over methodology turned ______, with both authors accusing the other of intellectual dishonesty in print.",
              options: ["Acrimonious", "Amicable", "Genial", "Collegial"],
              correctIndex: 0,
              explanation: "A dispute that escalates into public accusations of dishonesty is \"acrimonious\"; \"amicable,\" \"genial,\" and \"collegial\" all describe friendly, cooperative relations — the opposite of a bitter feud.",
            },
          },
          {
            word: "Duplicitous",
            fact: "\"Duplicitous\" means deceptive and two-faced, saying one thing while doing another. The duplicitous informant fed information to both sides of the dispute.",
            quiz: {
              sentence: "The investigation revealed a strikingly ______ pattern: the consultant had quietly advised the opposing side while billing the university for exclusive counsel.",
              options: ["Duplicitous", "Forthright", "Transparent", "Impartial"],
              correctIndex: 0,
              explanation: "Secretly serving two opposing sides while claiming loyalty to one is \"duplicitous\"; \"forthright\" and \"transparent\" mean open and honest, and \"impartial\" means genuinely neutral — none of which fits secret double-dealing.",
            },
          },
          {
            word: "Egregious",
            fact: "\"Egregious\" means outstandingly bad, shockingly so. The retraction cited an egregious error: the control group had never actually existed.",
            quiz: {
              sentence: "Of the dozen errors the audit uncovered, one was especially ______: an entire dataset had simply been invented.",
              options: ["Egregious", "Trivial", "Negligible", "Forgivable"],
              correctIndex: 0,
              explanation: "An invented dataset is not a small slip but a shocking, outstanding failure, or \"egregious\"; \"trivial,\" \"negligible,\" and \"forgivable\" all describe minor errors, far short of fabricated data.",
            },
          },
          {
            word: "Fastidious",
            fact: "\"Fastidious\" means excessively concerned with detail or correctness, hard to please. The fastidious reviewer sent the manuscript back over a single misplaced comma.",
            quiz: {
              sentence: "No formatting error was too small to escape her attention; colleagues joked that no journal could ever be ______ enough to satisfy her as an editor.",
              options: ["Fastidious", "Indifferent", "Easygoing", "Lenient"],
              correctIndex: 0,
              explanation: "Demanding a standard of correctness that's nearly impossible to satisfy is \"fastidious\"; \"indifferent,\" \"easygoing,\" and \"lenient\" all describe someone unbothered by small errors — the opposite of hard to please.",
            },
          },
          {
            word: "Insidious",
            fact: "\"Insidious\" means causing harm in a gradual, subtle way, often unnoticed until it's too late. The insidious bias crept into the model through a training set no one had audited.",
            quiz: {
              sentence: "The bias was ______: it produced no obviously wrong answers for years, quietly skewing every result until a graduate student finally traced the pattern back to the training data.",
              options: ["Insidious", "Overt", "Conspicuous", "Blatant"],
              correctIndex: 0,
              explanation: "Harm that spreads unnoticed for years before being traced is \"insidious\"; \"overt,\" \"conspicuous,\" and \"blatant\" all describe something obvious and easy to spot — the opposite of hidden, gradual harm.",
            },
          },
          {
            word: "Mercurial",
            fact: "\"Mercurial\" means subject to sudden, unpredictable changes of mood. The mercurial advisor could praise a draft on Monday and call it unpublishable by Wednesday.",
            quiz: {
              sentence: "Students learned to dread the ______ committee chair, whose verdict on the same proposal seemed to depend entirely on his mood that morning.",
              options: ["Mercurial", "Consistent", "Predictable", "Steadfast"],
              correctIndex: 0,
              explanation: "A verdict that changes with the chair's mood, not the proposal's merits, describes someone \"mercurial\"; \"consistent,\" \"predictable,\" and \"steadfast\" all describe steady, unchanging behavior — the opposite of unpredictable swings.",
            },
          },
          {
            word: "Obsequious",
            fact: "\"Obsequious\" means excessively eager to please or obey, in a servile way. The obsequious teaching assistant agreed with every one of the professor's claims, even the ones later shown to be wrong.",
            quiz: {
              sentence: "Junior faculty were sometimes ______ toward the department's most powerful reviewer, praising drafts in private that they privately considered deeply flawed.",
              options: ["Obsequious", "Forthright", "Candid", "Independent"],
              correctIndex: 0,
              explanation: "Flattering someone powerful while privately disagreeing is servile, or \"obsequious\"; \"forthright,\" \"candid,\" and \"independent\" all describe honest, self-directed behavior — the opposite of servile flattery.",
            },
          },
          {
            word: "Pernicious",
            fact: "\"Pernicious\" means having a harmful effect, especially a gradual or hard-to-detect one. The pernicious myth persisted in textbooks for decades after it had been disproven.",
            quiz: {
              sentence: "Historians now call it a distinctly ______ myth, one that shaped policy for a century after the original evidence behind it had been quietly discredited.",
              options: ["Pernicious", "Harmless", "Benign", "Innocuous"],
              correctIndex: 0,
              explanation: "A myth that keeps shaping policy long after being discredited is doing real, lasting harm, or \"pernicious\"; \"harmless,\" \"benign,\" and \"innocuous\" all describe something that causes no damage — the opposite of what shaped a century of bad policy.",
            },
          },
          {
            word: "Querulous",
            fact: "\"Querulous\" means complaining in a whining, irritable way. The querulous letter to the editor complained about everything from the font size to the price of a subscription.",
            quiz: {
              sentence: "Every issue of the newsletter drew another ______ letter from the same reader, unhappy about some new minor detail no one else seemed to notice.",
              options: ["Querulous", "Gracious", "Appreciative", "Complimentary"],
              correctIndex: 0,
              explanation: "A reader who finds something new to whine about every issue is \"querulous\"; \"gracious,\" \"appreciative,\" and \"complimentary\" all describe a positive, thankful tone — the opposite of habitual complaint.",
            },
          },
          {
            word: "Vindictive",
            fact: "\"Vindictive\" means having a strong desire for revenge. The vindictive reviewer, once rejected by the journal himself, seemed determined to reject every paper that crossed his desk for the next decade.",
            quiz: {
              sentence: "Colleagues suspected the harsh review was ______: the author had, years earlier, written an unflattering review of the very same referee's first book.",
              options: ["Vindictive", "Impartial", "Objective", "Evenhanded"],
              correctIndex: 0,
              explanation: "A harsh review motivated by an old grudge is \"vindictive\"; \"impartial,\" \"objective,\" and \"evenhanded\" all describe judgment free of personal bias — the opposite of a score being settled.",
            },
          },
        ],
      },
      {
        id: "negative-charge-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Invective",
            fact: "\"Invective\" means harsh, insulting language directed at a person or group. The senator's speech dissolved into invective before he ever addressed the actual bill.",
            quiz: {
              sentence: "The book review was less criticism than ______, devoting three paragraphs to the author's character before ever mentioning the argument of the book.",
              options: ["Invective", "Praise", "Analysis", "Commentary"],
              correctIndex: 0,
              explanation: "Attacking a person's character rather than the argument is \"invective\"; \"praise\" is the opposite in tone, and \"analysis\" and \"commentary\" both imply engaging with the actual argument, which the review never did.",
            },
          },
          {
            word: "Mendacious",
            fact: "\"Mendacious\" means dishonest, given to lying. The mendacious footnote attributed a quotation to a scholar who had never written any such thing.",
            quiz: {
              sentence: "The exposé revealed the memoir to be substantially ______: whole chapters described events that court records showed had never taken place.",
              options: ["Mendacious", "Factual", "Verifiable", "Accurate"],
              correctIndex: 0,
              explanation: "A memoir describing events that provably never happened is \"mendacious\"; \"factual,\" \"verifiable,\" and \"accurate\" all describe truthful, checkable claims — the opposite of what the exposé found.",
            },
          },
          {
            word: "Odious",
            fact: "\"Odious\" means extremely unpleasant or repugnant. Historians widely regard the policy as odious, defended by almost no serious scholar today.",
            quiz: {
              sentence: "Even at the time, a handful of contemporaries recognized the practice as ______, though it would take another century for the broader consensus to catch up.",
              options: ["Odious", "Admirable", "Laudable", "Commendable"],
              correctIndex: 0,
              explanation: "A practice recognized early as deserving condemnation is \"odious\"; \"admirable,\" \"laudable,\" and \"commendable\" all describe something worthy of praise — the exact opposite of what those contemporaries saw.",
            },
          },
          {
            word: "Perfidious",
            fact: "\"Perfidious\" means deceitful in a way that betrays trust or an agreement. The treaty's collapse was blamed on the perfidious ally who had secretly negotiated with the opposing side for months.",
            quiz: {
              sentence: "Diplomatic cables released decades later confirmed the ally's ______ conduct: the same delegation that signed the treaty had been negotiating its betrayal for months.",
              options: ["Perfidious", "Loyal", "Steadfast", "Trustworthy"],
              correctIndex: 0,
              explanation: "Secretly negotiating a betrayal while signing a treaty of trust is \"perfidious\"; \"loyal,\" \"steadfast,\" and \"trustworthy\" all describe honoring one's commitments — the opposite of betrayal.",
            },
          },
          {
            word: "Pusillanimous",
            fact: "\"Pusillanimous\" means showing a lack of courage. Critics called the editorial pusillanimous for refusing to name the officials it was so clearly describing.",
            quiz: {
              sentence: "Reviewers called the final chapter ______, noting that the author, having built a devastating case for two hundred pages, suddenly declined to name a single person responsible.",
              options: ["Pusillanimous", "Intrepid", "Courageous", "Audacious"],
              correctIndex: 0,
              explanation: "Building a case for two hundred pages and then refusing to follow through out of nerve is \"pusillanimous\"; \"intrepid,\" \"courageous,\" and \"audacious\" all describe boldness — the opposite of a failure of nerve.",
            },
          },
          {
            word: "Rancorous",
            fact: "\"Rancorous\" means marked by bitter, long-lasting resentment. The rancorous feud between the two labs outlasted both of the scientists who had started it.",
            quiz: {
              sentence: "The dispute over credit for the discovery grew so ______ that the two co-authors did not speak again for the remaining thirty years of their careers.",
              options: ["Rancorous", "Amicable", "Cordial", "Congenial"],
              correctIndex: 0,
              explanation: "A grudge lasting thirty years is marked by deep, bitter resentment, or \"rancorous\"; \"amicable,\" \"cordial,\" and \"congenial\" all describe friendly relations — the opposite of a lasting feud.",
            },
          },
          {
            word: "Scurrilous",
            fact: "\"Scurrilous\" means making scandalous, defamatory claims, often without regard for truth. The scurrilous pamphlet accused the professor of crimes the court later found no evidence for.",
            quiz: {
              sentence: "The court dismissed the pamphlet's accusations as ______, noting that not one of its claims about the professor's conduct was supported by any evidence at all.",
              options: ["Scurrilous", "Substantiated", "Documented", "Verified"],
              correctIndex: 0,
              explanation: "Scandalous accusations with no supporting evidence are \"scurrilous\"; \"substantiated,\" \"documented,\" and \"verified\" all describe claims backed by proof — the opposite of what the court found.",
            },
          },
          {
            word: "Vituperative",
            fact: "\"Vituperative\" means bitter and abusive in criticism. The vituperative marginalia in his copy of the rival's book grew more hostile with every chapter.",
            quiz: {
              sentence: "His private letters about the rival theory were startlingly ______, far more hostile in tone than anything he ever allowed into print.",
              options: ["Vituperative", "Measured", "Restrained", "Diplomatic"],
              correctIndex: 0,
              explanation: "Letters far more hostile in tone than anything made public are \"vituperative\"; \"measured,\" \"restrained,\" and \"diplomatic\" all describe controlled, careful tone — the opposite of an abusive outburst.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "neutral-academic",
    title: "Neutral & Academic",
    description: "Words with no built-in charge at all — the analytical, descriptive vocabulary of scholarly argument, where guessing \"good\" or \"bad\" won't help.",
    levels: [
      {
        id: "neutral-academic-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Empirical",
            fact: "\"Empirical\" means based on observation or experiment rather than theory alone. The empirical data ultimately contradicted the model's original prediction.",
            quiz: {
              sentence: "The philosopher's claim remained purely theoretical until a team of psychologists finally subjected it to ______ testing.",
              options: ["Empirical", "Theoretical", "Speculative", "Rhetorical"],
              correctIndex: 0,
              explanation: "Testing a claim through observation and experiment is \"empirical\"; \"theoretical\" and \"speculative\" both describe untested ideas, and \"rhetorical\" concerns persuasive language, not evidence.",
            },
          },
          {
            word: "Coherent",
            fact: "\"Coherent\" means logically consistent and easy to follow as a whole. The dissertation's third chapter finally pulled the scattered evidence into a coherent argument.",
            quiz: {
              sentence: "The committee's chief complaint was structural: individual paragraphs were well written, but the chapter as a whole never added up to a genuinely ______ argument.",
              options: ["Coherent", "Disjointed", "Fragmented", "Incongruous"],
              correctIndex: 0,
              explanation: "An argument that logically holds together is \"coherent\"; \"disjointed,\" \"fragmented,\" and \"incongruous\" all describe pieces that don't fit together, which is exactly the committee's complaint.",
            },
          },
          {
            word: "Anomalous",
            fact: "\"Anomalous\" means deviating from what is standard or expected. The anomalous reading was excluded from the final dataset as a likely instrument error.",
            quiz: {
              sentence: "One data point sat so far outside the expected range that the lab flagged it as ______ and re-ran the trial to see if it would reappear.",
              options: ["Anomalous", "Typical", "Representative", "Standard"],
              correctIndex: 0,
              explanation: "A result far outside the expected range is \"anomalous\"; \"typical,\" \"representative,\" and \"standard\" all describe results that fit the expected pattern — the opposite of an outlier.",
            },
          },
          {
            word: "Explicit",
            fact: "\"Explicit\" means stated clearly and in detail. The methodology section was explicit enough that another lab replicated the experiment from the text alone.",
            quiz: {
              sentence: "Because the instructions were so ______, listing every variable and every step in order, a second lab was able to replicate the result without contacting the original authors.",
              options: ["Explicit", "Vague", "Ambiguous", "Cryptic"],
              correctIndex: 0,
              explanation: "Instructions detailed enough to replicate without help are \"explicit\"; \"vague,\" \"ambiguous,\" and \"cryptic\" all describe unclear instructions that would require guesswork.",
            },
          },
          {
            word: "Implicit",
            fact: "\"Implicit\" means implied though not directly stated. The paper's implicit assumption, never spelled out, was that the sample generalized to the whole population.",
            quiz: {
              sentence: "The argument's most important premise was never actually written down; it remained entirely ______, assumed rather than defended.",
              options: ["Implicit", "Explicit", "Stated", "Declared"],
              correctIndex: 0,
              explanation: "A premise that is assumed but never written down is \"implicit\"; \"explicit,\" \"stated,\" and \"declared\" all describe something directly and openly expressed — the opposite of an unspoken assumption.",
            },
          },
          {
            word: "Subjective",
            fact: "\"Subjective\" means based on personal opinion or feeling rather than external fact. The grading rubric tried to reduce the subjective element in scoring the essays.",
            quiz: {
              sentence: "Critics argued that the ranking was too ______, reflecting one editor's personal taste more than any measurable, agreed-upon standard.",
              options: ["Subjective", "Objective", "Empirical", "Measurable"],
              correctIndex: 0,
              explanation: "A ranking driven by personal taste rather than a shared standard is \"subjective\"; \"objective,\" \"empirical,\" and \"measurable\" all describe judgments grounded in verifiable fact, not personal opinion.",
            },
          },
          {
            word: "Hypothetical",
            fact: "\"Hypothetical\" means based on a suggested idea, not yet known to be true. The seminar spent an hour debating a purely hypothetical case with no real-world example.",
            quiz: {
              sentence: "Before any data existed, the economist sketched a purely ______ scenario in which the policy would fail, simply to test the logic of the model.",
              options: ["Hypothetical", "Documented", "Historical", "Empirical"],
              correctIndex: 0,
              explanation: "A scenario invented to test logic before any data exists is \"hypothetical\"; \"documented,\" \"historical,\" and \"empirical\" all describe something grounded in real, observed events.",
            },
          },
          {
            word: "Rudimentary",
            fact: "\"Rudimentary\" means basic and not fully developed. The lab's rudimentary equipment limited the precision of the early measurements.",
            quiz: {
              sentence: "The first draft of the model was still ______, capturing only the broadest trend and ignoring every one of the smaller variables that later versions would include.",
              options: ["Rudimentary", "Sophisticated", "Refined", "Comprehensive"],
              correctIndex: 0,
              explanation: "A first version capturing only the broadest trend is \"rudimentary\"; \"sophisticated,\" \"refined,\" and \"comprehensive\" all describe a fully developed version, not an early, basic one.",
            },
          },
          {
            word: "Plausible",
            fact: "\"Plausible\" means seeming reasonable or probable. Reviewers found the theory plausible, though far from proven by the available evidence.",
            quiz: {
              sentence: "Of the three competing explanations, only one struck the reviewers as genuinely ______, consistent with everything already known about the process.",
              options: ["Plausible", "Implausible", "Untenable", "Far-fetched"],
              correctIndex: 0,
              explanation: "An explanation that seems reasonable given what's known is \"plausible\"; \"implausible,\" \"untenable,\" and \"far-fetched\" all describe an explanation that's hard to believe.",
            },
          },
          {
            word: "Provisional",
            fact: "\"Provisional\" means existing for the present, possibly to be revised later. The committee issued a provisional finding, pending a second round of data.",
            quiz: {
              sentence: "Given how small the sample still was, the authors described their conclusion as strictly ______, one that later, larger studies might well overturn.",
              options: ["Provisional", "Definitive", "Conclusive", "Final"],
              correctIndex: 0,
              explanation: "A conclusion openly described as likely to be overturned later is \"provisional\"; \"definitive,\" \"conclusive,\" and \"final\" all describe a settled, permanent finding — the opposite of a tentative one.",
            },
          },
        ],
      },
      {
        id: "neutral-academic-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Dichotomy",
            fact: "\"Dichotomy\" means a division into two entirely different or opposed things. The essay challenged the simple dichotomy between nature and nurture.",
            quiz: {
              sentence: "The lecture's central move was to dissolve a familiar ______, arguing that mind and body were never as separate as the textbook chapter titles suggested.",
              options: ["Dichotomy", "Synthesis", "Continuum", "Unity"],
              correctIndex: 0,
              explanation: "A sharp two-part division is a \"dichotomy\"; \"synthesis\" means combining things, and \"continuum\" and \"unity\" both describe a single connected whole — the opposite of a strict either/or split.",
            },
          },
          {
            word: "Discrete",
            fact: "\"Discrete\" means individually separate and distinct, not continuous. The survey broke the process into six discrete stages for analysis.",
            quiz: {
              sentence: "Rather than treating development as one continuous process, the theory divides it into a series of ______ stages, each with a clear beginning and end.",
              options: ["Discrete", "Continuous", "Merged", "Overlapping"],
              correctIndex: 0,
              explanation: "Stages that are separate and distinct, each with clear boundaries, are \"discrete\"; \"continuous,\" \"merged,\" and \"overlapping\" all describe stages that blend into one another — the opposite of clearly separate.",
            },
          },
          {
            word: "Ephemeral",
            fact: "\"Ephemeral\" means lasting for a very short time. The exhibit was deliberately ephemeral, dismantled after a single week.",
            quiz: {
              sentence: "The species' bloom is famously ______, lasting barely a single afternoon before the petals fall.",
              options: ["Ephemeral", "Perennial", "Enduring", "Permanent"],
              correctIndex: 0,
              explanation: "Something lasting only an afternoon is \"ephemeral\"; \"perennial,\" \"enduring,\" and \"permanent\" all describe something long-lasting — the opposite of fleeting.",
            },
          },
          {
            word: "Indeterminate",
            fact: "\"Indeterminate\" means not exactly known or fixed. The manuscript's date of composition remains indeterminate, placed somewhere within a fifty-year window.",
            quiz: {
              sentence: "Without a signature or a dated colophon, the scribe's identity remains ______, and scholars can only narrow it to one of three known workshops.",
              options: ["Indeterminate", "Established", "Confirmed", "Documented"],
              correctIndex: 0,
              explanation: "Something that can only be narrowed down, not pinned to one answer, is \"indeterminate\"; \"established,\" \"confirmed,\" and \"documented\" all describe a fact that is already settled.",
            },
          },
          {
            word: "Juxtaposition",
            fact: "\"Juxtaposition\" means the placing of two things close together for comparison or contrast. The exhibit's juxtaposition of the two paintings made their shared composition obvious for the first time.",
            quiz: {
              sentence: "The essay's most effective device was a simple ______: placing the government's official report directly beside a survivor's account of the same week.",
              options: ["Juxtaposition", "Synthesis", "Digression", "Paraphrase"],
              correctIndex: 0,
              explanation: "Placing two things side by side for comparison is \"juxtaposition\"; \"synthesis\" means merging them into one, \"digression\" means straying off topic, and \"paraphrase\" means restating one thing in different words.",
            },
          },
          {
            word: "Paradigm",
            fact: "\"Paradigm\" means a whole framework of assumptions accepted by a field, or a typical example of one. The discovery eventually forced a shift in the field's dominant paradigm.",
            quiz: {
              sentence: "For nearly a century, the prevailing ______ held that the disease was purely genetic, until new evidence forced researchers to reconsider the entire framework.",
              options: ["Paradigm", "Anomaly", "Footnote", "Digression"],
              correctIndex: 0,
              explanation: "A field's whole accepted framework is its \"paradigm\"; \"anomaly\" is a single exception to a framework, and \"footnote\" and \"digression\" both name something minor or off to the side, not the entire governing framework.",
            },
          },
          {
            word: "Paradox",
            fact: "\"Paradox\" means a statement or situation that seems self-contradictory but may still be true. The essay opens with a paradox: the more precisely you measure a thing, the less you can know about it.",
            quiz: {
              sentence: "The finding produced a genuine ______: patients who received less treatment recovered, on average, faster than patients who received more.",
              options: ["Paradox", "Corroboration", "Confirmation", "Certainty"],
              correctIndex: 0,
              explanation: "A result that seems to contradict itself yet holds up is a \"paradox\"; \"corroboration,\" \"confirmation,\" and \"certainty\" all describe a result that straightforwardly supports what was expected, not one that seems contradictory.",
            },
          },
          {
            word: "Pragmatic",
            fact: "\"Pragmatic\" means dealing with things sensibly and practically rather than by theory alone. The committee took a pragmatic approach, choosing the workable option over the theoretically ideal one.",
            quiz: {
              sentence: "Rather than holding out for the theoretically optimal design, the engineers took a resolutely ______ approach, choosing the version that could actually be built within the semester.",
              options: ["Pragmatic", "Idealistic", "Theoretical", "Utopian"],
              correctIndex: 0,
              explanation: "Choosing what can actually be built over the theoretical ideal is \"pragmatic\"; \"idealistic,\" \"theoretical,\" and \"utopian\" all describe favoring the ideal over the workable — the opposite choice.",
            },
          },
          {
            word: "Synthesis",
            fact: "\"Synthesis\" means combining separate ideas or sources into a coherent whole. Her final chapter offered a synthesis of three previously unconnected theories.",
            quiz: {
              sentence: "Rather than simply summarizing each source in turn, the strongest essays attempted a genuine ______, weaving the three theories into one coherent framework.",
              options: ["Synthesis", "Digression", "Paraphrase", "Enumeration"],
              correctIndex: 0,
              explanation: "Weaving separate sources into one coherent whole is a \"synthesis\"; \"digression\" means straying off topic, \"paraphrase\" means restating one source, and \"enumeration\" means simply listing items — none of which combines them into something new.",
            },
          },
          {
            word: "Tenuous",
            fact: "\"Tenuous\" means very weak or slight, especially of an argument or connection. The link between the two studies was tenuous at best, resting on a single shared footnote.",
            quiz: {
              sentence: "The connection the article drew between the two events was ______, supported by little more than the fact that they happened in the same year.",
              options: ["Tenuous", "Robust", "Airtight", "Ironclad"],
              correctIndex: 0,
              explanation: "A connection resting on almost nothing is \"tenuous\"; \"robust,\" \"airtight,\" and \"ironclad\" all describe a connection that is strong and well-supported — the opposite of weak.",
            },
          },
        ],
      },
      {
        id: "neutral-academic-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Apposite",
            fact: "\"Apposite\" means highly relevant or appropriate to the circumstances. She closed the lecture with an apposite quotation that tied every earlier thread together.",
            quiz: {
              sentence: "Of all the passages she might have quoted, the one she chose was strikingly ______, tying together every thread of the argument in a single sentence.",
              options: ["Apposite", "Irrelevant", "Extraneous", "Tangential"],
              correctIndex: 0,
              explanation: "A quotation that perfectly fits and ties the argument together is \"apposite\"; \"irrelevant,\" \"extraneous,\" and \"tangential\" all describe something beside the point — the opposite of a perfect fit.",
            },
          },
          {
            word: "Axiomatic",
            fact: "\"Axiomatic\" means self-evident, accepted as a starting point without proof. The theorem rests on a small set of axiomatic assumptions no one in the field disputes.",
            quiz: {
              sentence: "Within the field, the claim was treated as nearly ______: no paper bothered to defend it, since every reader was assumed to already accept it as a given.",
              options: ["Axiomatic", "Contentious", "Disputed", "Speculative"],
              correctIndex: 0,
              explanation: "A claim so accepted that no one bothers to defend it is treated as \"axiomatic\"; \"contentious,\" \"disputed,\" and \"speculative\" all describe a claim still actively argued over, not one taken for granted.",
            },
          },
          {
            word: "Esoteric",
            fact: "\"Esoteric\" means intended for or understood by only a small, specialized group. The footnote referenced an esoteric branch of set theory unfamiliar to most mathematicians outside the subfield.",
            quiz: {
              sentence: "The talk assumed a genuinely ______ background, one shared by perhaps a dozen specialists worldwide, and most of the audience admitted afterward they had followed almost none of it.",
              options: ["Esoteric", "Elementary", "Accessible", "Universal"],
              correctIndex: 0,
              explanation: "Background knowledge shared by only a dozen specialists worldwide is \"esoteric\"; \"elementary,\" \"accessible,\" and \"universal\" all describe knowledge that's widely shared or easy to grasp — the opposite of a narrow specialty.",
            },
          },
          {
            word: "Extant",
            fact: "\"Extant\" means still in existence, surviving. Only four extant copies of the first edition are known to survive.",
            quiz: {
              sentence: "Of the dozen manuscripts the catalogue describes, only three are still ______; the rest were lost in the fire that destroyed the library in 1731.",
              options: ["Extant", "Lost", "Destroyed", "Vanished"],
              correctIndex: 0,
              explanation: "Copies that still exist and survive are \"extant\"; \"lost,\" \"destroyed,\" and \"vanished\" all describe copies that no longer exist — the opposite of surviving.",
            },
          },
          {
            word: "Heuristic",
            fact: "\"Heuristic\" means a practical shortcut for solving a problem, not guaranteed to be perfect but usually good enough. Chess players rely on a simple heuristic — control the center — long before they can calculate every line.",
            quiz: {
              sentence: "Rather than exhaustively checking every possibility, the algorithm relies on a ______: a quick rule of thumb that usually finds a good answer, if not always the best one.",
              options: ["Heuristic", "Proof", "Certainty", "Guarantee"],
              correctIndex: 0,
              explanation: "A practical rule of thumb that usually works, but isn't guaranteed, is a \"heuristic\"; \"proof,\" \"certainty,\" and \"guarantee\" all imply a result that is exact and assured — the opposite of a rough shortcut.",
            },
          },
          {
            word: "Inchoate",
            fact: "\"Inchoate\" means just begun and not yet fully formed. The lecture notes preserve the theory in its inchoate form, years before it reached its final published shape.",
            quiz: {
              sentence: "The archive's earliest drafts show the theory still ______, a scattering of half-formed notes years away from the polished argument the book would eventually become.",
              options: ["Inchoate", "Polished", "Finalized", "Mature"],
              correctIndex: 0,
              explanation: "A theory that is still a scattering of half-formed notes is \"inchoate\"; \"polished,\" \"finalized,\" and \"mature\" all describe a fully developed version — the opposite of just beginning to take shape.",
            },
          },
          {
            word: "Perspicuous",
            fact: "\"Perspicuous\" means clearly expressed and easy to understand. Reviewers praised the textbook's perspicuous prose, rare in a field known for impenetrable jargon.",
            quiz: {
              sentence: "Unusually for the field, her prose was genuinely ______: even a first-year student could follow the argument without a single re-read.",
              options: ["Perspicuous", "Impenetrable", "Convoluted", "Turgid"],
              correctIndex: 0,
              explanation: "Writing that even a first-year student follows without a re-read is \"perspicuous\"; \"impenetrable,\" \"convoluted,\" and \"turgid\" all describe writing that is dense or hard to follow — the opposite of clear.",
            },
          },
          {
            word: "Recondite",
            fact: "\"Recondite\" means, of a subject, little known and difficult to understand. The dissertation's recondite subject matter, a minor tax dispute in a long-dissolved medieval guild, appealed to almost no one outside the seminar.",
            quiz: {
              sentence: "The subject itself was ______: an obscure corner of maritime law that even most legal scholars had never encountered.",
              options: ["Recondite", "Familiar", "Commonplace", "Mainstream"],
              correctIndex: 0,
              explanation: "A subject that even specialists in the broader field have never encountered is \"recondite\"; \"familiar,\" \"commonplace,\" and \"mainstream\" all describe something widely known — the opposite of obscure.",
            },
          },
        ],
      },
    ],
  },
];
