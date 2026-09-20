// Professional Vocabulary — the third course. Original writing (definitions,
// example sentences and quiz sentences), not drawn from any published word list.
//
// Same category > level > word shape and the same quiz format as the other
// courses (see lib/wordbanks.js): a sentence with a blank, four plausible
// options, one precisely correct; 3 levels (Foundational, Intermediate,
// Advanced) with the difficulty of the distractors escalating.
//
// What makes this course different is its SETTING, not its format: every
// quiz sentence is set in a real working context — emails, meetings,
// negotiations, performance reviews, reports, budgets — so the words are
// learned where they are actually used. It is aimed at working adults, a
// different audience from SAT Vocab (exam prep) and Everyday Vocabulary
// (general reading and conversation).
//
// Organized by THEME / CONTEXT OF USE (like Everyday Vocabulary), not by
// argumentative function: there is no exam behind this course, so the
// function-based structure that SAT Vocab needs doesn't apply. See CLAUDE.md
// ("Courses") for the reasoning.
//
// Never change level or word ids — users' localStorage references them.

export const professionalVocabularyCategories = [
  {
    id: "meetings-negotiation",
    title: "Meetings & Negotiation",
    description: "Words for agendas, deadlines, deals, and the give-and-take of reaching agreement at work.",
    levels: [
      {
        id: "meetings-negotiation-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Agenda",
            fact: "\"Agenda\" means a list of the topics to be covered in a meeting. She emailed the agenda the day before so everyone could prepare.",
            quiz: {
              sentence: "To keep the hour on track, Priya sent out a written ______ listing the four topics and how long each would take.",
              options: ["Agenda", "Invoice", "Warranty", "Uniform"],
              correctIndex: 0,
              explanation: "A list of topics and time limits for a meeting is an \"agenda\"; an invoice is a bill, a warranty is a product guarantee, and a uniform is clothing.",
            },
          },
          {
            word: "Adjourn",
            fact: "\"Adjourn\" means to formally end a meeting. The chair adjourned the session at noon after the final vote.",
            quiz: {
              sentence: "With every item on the list covered, the chairman moved to ______ the meeting and everyone gathered their laptops.",
              options: ["Adjourn", "Begin", "Interrupt", "Sponsor"],
              correctIndex: 0,
              explanation: "Formally ending the meeting once every item is done is to \"adjourn\" it; \"begin\" is the opposite, and \"interrupt\" and \"sponsor\" don't describe closing a meeting.",
            },
          },
          {
            word: "Postpone",
            fact: "\"Postpone\" means to move something to a later time. The team postponed the launch until testing was finished.",
            quiz: {
              sentence: "Because the client's flight was cancelled, we had to ______ the presentation until next Thursday.",
              options: ["Postpone", "Repeat", "Applaud", "Photograph"],
              correctIndex: 0,
              explanation: "Moving the presentation to a later date is to \"postpone\" it; \"repeat\" means do again, and \"applaud\" and \"photograph\" don't change a date.",
            },
          },
          {
            word: "Recap",
            fact: "\"Recap\" means a short summary of the main points. He gave a two-minute recap of the last meeting for anyone who had missed it.",
            quiz: {
              sentence: "Before we vote, could someone give a quick ______ of what we decided at last week's meeting?",
              options: ["Recap", "Reward", "Rumor", "Bonus"],
              correctIndex: 0,
              explanation: "A brief summary of last week's decisions is a \"recap\"; a reward is a prize, a rumor is unverified talk, and a bonus is extra pay.",
            },
          },
          {
            word: "Facilitate",
            fact: "\"Facilitate\" means to guide a discussion or process so that it runs smoothly. A neutral colleague facilitated the workshop so everyone got a turn to speak.",
            quiz: {
              sentence: "We hired an outside consultant to ______ the planning session so that no single voice dominated the room.",
              options: ["Facilitate", "Sabotage", "Overcharge", "Ignore"],
              correctIndex: 0,
              explanation: "Guiding a session so everyone gets a turn is to \"facilitate\" it; \"sabotage\" would ruin it, \"overcharge\" is about price, and \"ignore\" would leave it unguided.",
            },
          },
          {
            word: "Negotiate",
            fact: "\"Negotiate\" means to discuss the terms of a deal until both sides reach agreement. He negotiated a longer deadline with the client.",
            quiz: {
              sentence: "Instead of accepting the first offer, she decided to ______ for a higher starting salary.",
              options: ["Negotiate", "Apologize", "Volunteer", "Hesitate"],
              correctIndex: 0,
              explanation: "Discussing terms to get a better deal is to \"negotiate\"; you don't apologize, volunteer, or hesitate \"for\" a higher salary in that way.",
            },
          },
          {
            word: "Compromise",
            fact: "\"Compromise\" means an agreement in which each side gives up something to settle a disagreement. They reached a compromise on the budget: marketing got more, but travel was cut.",
            quiz: {
              sentence: "Neither side got everything it wanted, but the ______ let both teams keep working toward the launch.",
              options: ["Compromise", "Anthem", "Mattress", "Quarrel"],
              correctIndex: 0,
              explanation: "An agreement where neither side gets everything is a \"compromise\"; an anthem is a song, a mattress is bedding, and a quarrel would keep the teams from working together.",
            },
          },
          {
            word: "Consensus",
            fact: "\"Consensus\" means general agreement among a group. After an hour of discussion, the committee reached a consensus to hire two contractors.",
            quiz: {
              sentence: "There was no vote and no dissent; the group simply reached a ______ that the project should start in March.",
              options: ["Consensus", "Blizzard", "Tuition", "Rehearsal"],
              correctIndex: 0,
              explanation: "General agreement reached without a vote is a \"consensus\"; a blizzard is a storm, tuition is school fees, and a rehearsal is practice.",
            },
          },
          {
            word: "Counteroffer",
            fact: "\"Counteroffer\" means a new offer made in reply to an earlier one, usually with changed terms. The vendor rejected our price and sent a counteroffer ten percent higher.",
            quiz: {
              sentence: "The seller turned down our first price, but by evening we had received a ______ that was only slightly higher.",
              options: ["Counteroffer", "Lullaby", "Harvest", "Tornado"],
              correctIndex: 0,
              explanation: "A new price sent back in reply to ours is a \"counteroffer\"; a lullaby is a song, a harvest is a crop, and a tornado is a storm.",
            },
          },
          {
            word: "Clarify",
            fact: "\"Clarify\" means to make something clearer or easier to understand. Could you clarify what you mean by \"soon\"?",
            quiz: {
              sentence: "The instructions were vague, so I emailed my manager to ______ which report she wanted first.",
              options: ["Clarify", "Obscure", "Deny", "Forget"],
              correctIndex: 0,
              explanation: "Asking to make the request clear is to \"clarify\" it; \"obscure\" would make it less clear, and \"deny\" and \"forget\" don't fit emailing to find out.",
            },
          },
          {
            word: "Interject",
            fact: "\"Interject\" means to break into a conversation with a sudden remark or question. He interjected a quick question while the presenter was mid-sentence.",
            quiz: {
              sentence: "Halfway through the CFO's explanation, Marcus tried to ______ a question, but she kept talking.",
              options: ["Interject", "Refund", "Borrow", "Laminate"],
              correctIndex: 0,
              explanation: "Cutting into a speaker with a question is to \"interject\"; you refund money, borrow objects, and laminate documents, not words in a discussion.",
            },
          },
          {
            word: "Pitch",
            fact: "\"Pitch\" means to present an idea or product persuasively in order to win support or a sale. She pitched the new app to investors in ten minutes.",
            quiz: {
              sentence: "Tomorrow morning I'll ______ our redesign idea to the leadership team and ask for funding.",
              options: ["Pitch", "Inherit", "Shrink", "Whisper"],
              correctIndex: 0,
              explanation: "Presenting an idea to win funding is to \"pitch\" it; you don't inherit, shrink, or whisper an idea in order to ask for money.",
            },
          },
        ],
      },
      {
        id: "meetings-negotiation-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Concession",
            fact: "\"Concession\" means something you give up or allow in order to reach an agreement. The union's main concession was accepting a smaller raise this year.",
            quiz: {
              sentence: "In exchange for the longer contract, the supplier made one ______: a five percent discount on the first order.",
              options: ["Concession", "Objection", "Prediction", "Complaint"],
              correctIndex: 0,
              explanation: "Giving up a small advantage to win a deal is a \"concession\"; an objection is a disagreement, a prediction is a guess about the future, and a complaint is an expression of dissatisfaction.",
            },
          },
          {
            word: "Leverage",
            fact: "\"Leverage\" means an advantage that gives you power to influence the outcome of a negotiation. Having a competing job offer gave her leverage in the salary talks.",
            quiz: {
              sentence: "With two other buyers already interested, the seller had real ______ and refused to lower the price.",
              options: ["Leverage", "Humility", "Sympathy", "Urgency"],
              correctIndex: 0,
              explanation: "Having other interested buyers is an advantage in bargaining, or \"leverage\"; humility and sympathy wouldn't make a seller hold firm, and urgency would push a seller to lower the price.",
            },
          },
          {
            word: "Stalemate",
            fact: "\"Stalemate\" means a situation in which neither side can make progress. The talks ended in a stalemate when both sides refused to move.",
            quiz: {
              sentence: "After six rounds of talks with no movement from either side, the negotiations ended in a ______.",
              options: ["Stalemate", "Landslide", "Celebration", "Rehearsal"],
              correctIndex: 0,
              explanation: "Neither side moving means the talks are at a standstill, or a \"stalemate\"; a landslide is an overwhelming win, and a celebration or rehearsal doesn't describe stuck talks.",
            },
          },
          {
            word: "Tangent",
            fact: "\"Tangent\" means a sudden shift away from the main topic. The discussion went off on a tangent about parking.",
            quiz: {
              sentence: "Ten minutes into the budget review, Leo drifted off on a ______ about his favorite restaurant, and Ana steered us back to the numbers.",
              options: ["Tangent", "Timeline", "Threshold", "Testimonial"],
              correctIndex: 0,
              explanation: "Drifting away from the main topic is going off on a \"tangent\"; a timeline is a schedule, a threshold is a limit, and a testimonial is a statement of praise.",
            },
          },
          {
            word: "Reconvene",
            fact: "\"Reconvene\" means to gather together again after a break. The committee will reconvene after lunch.",
            quiz: {
              sentence: "Let's take fifteen minutes to review the numbers separately and then ______ at three o'clock.",
              options: ["Reconvene", "Reimburse", "Reminisce", "Retaliate"],
              correctIndex: 0,
              explanation: "Meeting again after a break is to \"reconvene\"; reimburse means repay money, reminisce means recall the past, and retaliate means strike back.",
            },
          },
          {
            word: "Contingent",
            fact: "\"Contingent\" means dependent on something else happening. The offer is contingent on a successful background check.",
            quiz: {
              sentence: "Our agreement to buy the company is ______ on the auditors confirming that the financial statements are accurate.",
              options: ["Contingent", "Insistent", "Consistent", "Reluctant"],
              correctIndex: 0,
              explanation: "Depending on the auditors' confirmation is being \"contingent\" on it; an agreement can't be \"insistent\" or \"reluctant,\" and \"consistent\" doesn't take \"on\" this way.",
            },
          },
          {
            word: "Preliminary",
            fact: "\"Preliminary\" means coming before the main event or the final version. The preliminary results look promising, but final numbers arrive Friday.",
            quiz: {
              sentence: "These are only ______ figures; the finance team won't have the final numbers until the audit is finished.",
              options: ["Preliminary", "Permanent", "Precise", "Predictable"],
              correctIndex: 0,
              explanation: "Early figures that come before the final ones are \"preliminary\"; permanent and precise contradict the idea that better numbers are coming, and predictable is about expectation, not timing.",
            },
          },
          {
            word: "Binding",
            fact: "\"Binding\" means legally or formally obligating everyone who agrees to it. Once both parties sign, the contract is binding.",
            quiz: {
              sentence: "A verbal promise can be forgotten, but the signed contract is ______: neither company can walk away without legal consequences.",
              options: ["Binding", "Flexible", "Tentative", "Optional"],
              correctIndex: 0,
              explanation: "A contract neither side can walk away from is \"binding\"; flexible, tentative, and optional all describe agreements that can be changed or ignored.",
            },
          },
          {
            word: "Ultimatum",
            fact: "\"Ultimatum\" means a final demand that threatens consequences if it is not met. The manager gave the vendor an ultimatum: fix the errors this week or lose the contract.",
            quiz: {
              sentence: "Tired of the delays, the client issued an ______: deliver by Friday or find another customer.",
              options: ["Ultimatum", "Apology", "Invitation", "Estimate"],
              correctIndex: 0,
              explanation: "A final demand backed by a threat is an \"ultimatum\"; an apology says sorry, an invitation asks someone to attend, and an estimate is a rough price.",
            },
          },
          {
            word: "Defer",
            fact: "\"Defer\" means to yield to someone else's opinion or judgment out of respect. On safety questions, the team deferred to the engineer with twenty years of experience.",
            quiz: {
              sentence: "Although I had my own opinion, I chose to ______ to her greater experience on legal questions rather than argue.",
              options: ["Defer", "Object", "Commit", "Aspire"],
              correctIndex: 0,
              explanation: "Yielding to someone with more experience instead of arguing is to \"defer\"; \"object\" is the opposite, and \"commit\" and \"aspire\" don't fit \"rather than argue.\"",
            },
          },
          {
            word: "Mediate",
            fact: "\"Mediate\" means to step in between two sides in a dispute to help them reach an agreement. The HR director mediated between the two managers.",
            quiz: {
              sentence: "When the design and sales teams could not agree on a launch date, a neutral director stepped in to ______ the dispute.",
              options: ["Mediate", "Fabricate", "Delegate", "Liquidate"],
              correctIndex: 0,
              explanation: "Acting as a neutral go-between to help two sides agree is to \"mediate\"; fabricate means make up, delegate means hand off tasks, and liquidate means sell off assets.",
            },
          },
          {
            word: "Rehash",
            fact: "\"Rehash\" means to go over old material again without adding anything new. Let's not rehash last quarter's debate.",
            quiz: {
              sentence: "We've spent the whole meeting going over the same objections, so please let's not ______ the pricing argument again.",
              options: ["Rehash", "Refinance", "Reinstate", "Rescind"],
              correctIndex: 0,
              explanation: "Going over the same old points again is to \"rehash\" them; refinance concerns loans, reinstate means restore, and rescind means cancel.",
            },
          },
        ],
      },
      {
        id: "meetings-negotiation-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Stipulate",
            fact: "\"Stipulate\" means to specify something as a required condition of an agreement. The contract stipulates that payment is due within thirty days.",
            quiz: {
              sentence: "The lease explicitly ______ that the tenant must give sixty days' written notice before moving out.",
              options: ["Stipulates", "Suggests", "Implies", "Assumes"],
              correctIndex: 0,
              explanation: "Spelling out a required condition is to \"stipulate\" it; \"suggests\" and \"implies\" are not firm or explicit, and \"assumes\" means takes for granted.",
            },
          },
          {
            word: "Arbitrate",
            fact: "\"Arbitrate\" means to settle a dispute by acting as an impartial judge whose decision both sides agree to accept. An independent expert will arbitrate the pricing dispute.",
            quiz: {
              sentence: "Since the two firms could not agree, they asked an independent expert to ______ and promised to accept her ruling, whatever it was.",
              options: ["Arbitrate", "Mediate", "Negotiate", "Advocate"],
              correctIndex: 0,
              explanation: "A neutral expert whose ruling both sides pledge to accept is asked to \"arbitrate\"; a mediator only helps the sides agree, negotiating is done by the parties themselves, and advocating means supporting one side.",
            },
          },
          {
            word: "Intransigent",
            fact: "\"Intransigent\" means refusing to change your position or compromise, however reasonable the request. The intransigent supplier rejected every proposed compromise.",
            quiz: {
              sentence: "Talks collapsed because the union leader was ______, rejecting even the most reasonable requests to adjust her opening demand.",
              options: ["Intransigent", "Resolute", "Determined", "Decisive"],
              correctIndex: 0,
              explanation: "Refusing any change no matter how reasonable is \"intransigent\"; resolute and determined praise firmness of purpose rather than a refusal to bend, and decisive means quick to decide.",
            },
          },
          {
            word: "Brinkmanship",
            fact: "\"Brinkmanship\" means pushing a tense situation to the edge of disaster to force the other side to back down. Both sides engaged in brinkmanship, threatening strikes and lockouts.",
            quiz: {
              sentence: "By threatening to walk out an hour before the deadline, the buyer was playing a dangerous game of ______, hoping the seller would blink first.",
              options: ["Brinkmanship", "Partnership", "Sportsmanship", "Salesmanship"],
              correctIndex: 0,
              explanation: "Pushing a standoff to the edge to force the other side to give way is \"brinkmanship\"; partnership is cooperation, sportsmanship is fair play, and salesmanship is skill at selling.",
            },
          },
          {
            word: "Reciprocate",
            fact: "\"Reciprocate\" means to respond to a kindness or favor with a similar one. He shared his data, and she reciprocated by sharing hers.",
            quiz: {
              sentence: "The partner firm shared its client list with us last year, and we were happy to ______ by sending them our vendor contacts.",
              options: ["Reciprocate", "Compensate", "Retaliate", "Apologize"],
              correctIndex: 0,
              explanation: "Returning a favor in kind is to \"reciprocate\"; \"compensate\" means pay for a loss, \"retaliate\" means strike back, and \"apologize\" means say sorry.",
            },
          },
          {
            word: "Expedite",
            fact: "\"Expedite\" means to make a process happen faster. For a fee, the agency will expedite your passport application.",
            quiz: {
              sentence: "Because the shipment was already three weeks late, the buyer paid extra to ______ customs clearance.",
              options: ["Expedite", "Authorize", "Postpone", "Monitor"],
              correctIndex: 0,
              explanation: "Paying extra to speed up a late shipment is to \"expedite\" it; \"postpone\" is the opposite, and \"authorize\" and \"monitor\" are not about speed.",
            },
          },
          {
            word: "Acquiesce",
            fact: "\"Acquiesce\" means to accept or go along with something reluctantly, without protest. After weeks of resistance, the board acquiesced to the buyer's terms.",
            quiz: {
              sentence: "Though she privately thought the timeline was unrealistic, she chose to ______ rather than start another argument.",
              options: ["Acquiesce", "Concur", "Endorse", "Object"],
              correctIndex: 0,
              explanation: "Going along reluctantly while privately disagreeing is to \"acquiesce\"; \"concur\" and \"endorse\" mean genuinely agreeing or supporting, and \"object\" means to protest.",
            },
          },
          {
            word: "Conciliatory",
            fact: "\"Conciliatory\" means intended to calm anger and win goodwill after a disagreement. His conciliatory email thanked the client for her patience and offered a free extension.",
            quiz: {
              sentence: "After the heated call, Alan sent a ______ note thanking the client for her patience and offering a partial refund.",
              options: ["Conciliatory", "Defiant", "Dismissive", "Curt"],
              correctIndex: 0,
              explanation: "A note meant to soothe and repair goodwill is \"conciliatory\"; defiant, dismissive, and curt notes would only inflame the client.",
            },
          },
          {
            word: "Protracted",
            fact: "\"Protracted\" means lasting much longer than expected or necessary. After protracted negotiations, the merger finally closed.",
            quiz: {
              sentence: "What was supposed to be a two-day contract discussion turned into a ______ negotiation that dragged on for nine weeks.",
              options: ["Protracted", "Provisional", "Procedural", "Preliminary"],
              correctIndex: 0,
              explanation: "A discussion that dragged on far longer than planned is \"protracted\"; provisional means temporary, procedural means about rules, and preliminary means coming first.",
            },
          },
          {
            word: "Adversarial",
            fact: "\"Adversarial\" means involving opposing sides in conflict or competition. An adversarial style, with each side trying to win, made compromise unlikely.",
            quiz: {
              sentence: "The consultant urged both teams to drop their ______ posture, in which every discussion became a contest with a winner and a loser.",
              options: ["Adversarial", "Collaborative", "Cooperative", "Analytical"],
              correctIndex: 0,
              explanation: "A stance where each discussion is a contest with a winner and a loser is \"adversarial\"; collaborative and cooperative describe the opposite, and analytical means examining carefully.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "strategy-decisions",
    title: "Strategy & Decision-Making",
    description: "Words for weighing options, setting priorities, and explaining how and why a decision gets made.",
    levels: [
      {
        id: "strategy-decisions-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Prioritize",
            fact: "\"Prioritize\" means to decide which tasks matter most and deal with them first. With only a week left, we had to prioritize the features customers asked for most.",
            quiz: {
              sentence: "With three urgent deadlines colliding, she had to ______ carefully and tackle the client report first.",
              options: ["Prioritize", "Reimburse", "Audit", "Sponsor"],
              correctIndex: 0,
              explanation: "Deciding which task deserves attention first is to \"prioritize\"; reimburse, audit, and sponsor don't describe ranking tasks.",
            },
          },
          {
            word: "Objective",
            fact: "\"Objective\" means a specific goal you are trying to achieve. Our main objective this quarter is to cut response time in half.",
            quiz: {
              sentence: "The team's primary ______ for the quarter is to reduce customer response time from two days to one.",
              options: ["Objective", "Ancestor", "Casualty", "Detour"],
              correctIndex: 0,
              explanation: "A specific goal a team is working toward is an \"objective\"; an ancestor is a forebear, a casualty is a victim, and a detour is a roundabout route.",
            },
          },
          {
            word: "Forecast",
            fact: "\"Forecast\" means a prediction of future conditions, especially in business or weather. The sales forecast for next quarter shows steady growth.",
            quiz: {
              sentence: "According to the finance team's ______, revenue will grow about four percent over the next two quarters.",
              options: ["Forecast", "Receipt", "Rehearsal", "Souvenir"],
              correctIndex: 0,
              explanation: "A prediction of future revenue is a \"forecast\"; a receipt records a past purchase, a rehearsal is practice, and a souvenir is a keepsake.",
            },
          },
          {
            word: "Benchmark",
            fact: "\"Benchmark\" means a standard used as a point of comparison for measuring performance. Our response time is well below the industry benchmark.",
            quiz: {
              sentence: "To judge whether our five-day turnaround was good, we compared it against the industry ______ of three days.",
              options: ["Benchmark", "Doorstep", "Anthem", "Diagnosis"],
              correctIndex: 0,
              explanation: "A standard used for comparison is a \"benchmark\"; a doorstep is an entrance, an anthem is a song, and a diagnosis is a medical finding.",
            },
          },
          {
            word: "Assess",
            fact: "\"Assess\" means to evaluate the quality, size, or value of something carefully. Inspectors assessed the damage before the insurer paid.",
            quiz: {
              sentence: "Before committing any money, the committee sent two analysts to ______ the risks of entering the new market.",
              options: ["Assess", "Pardon", "Sweeten", "Broadcast"],
              correctIndex: 0,
              explanation: "Carefully evaluating risks is to \"assess\" them; you don't pardon, sweeten, or broadcast risks in order to decide on an investment.",
            },
          },
          {
            word: "Feasible",
            fact: "\"Feasible\" means possible and practical to do. The engineers confirmed the plan was feasible within the budget.",
            quiz: {
              sentence: "The architect's design was beautiful, but with our budget and timeline it simply wasn't ______.",
              options: ["Feasible", "Flammable", "Fragrant", "Frantic"],
              correctIndex: 0,
              explanation: "A plan that can't be done within the budget is not \"feasible\"; flammable means easily burned, fragrant means sweet-smelling, and frantic means wildly rushed.",
            },
          },
          {
            word: "Viable",
            fact: "\"Viable\" means capable of working successfully or continuing to exist. After testing, the prototype proved to be a viable product.",
            quiz: {
              sentence: "The startup's product worked, but with so few paying customers the business itself was not ______ in the long run.",
              options: ["Viable", "Vocal", "Vintage", "Verbal"],
              correctIndex: 0,
              explanation: "A business that cannot sustain itself is not \"viable\"; vocal, vintage, and verbal have nothing to do with lasting success.",
            },
          },
          {
            word: "Streamline",
            fact: "\"Streamline\" means to make a process simpler and more efficient by removing unnecessary steps. The new form streamlined approvals from six steps to two.",
            quiz: {
              sentence: "To cut waiting times, the department decided to ______ the approval process by eliminating three unnecessary sign-offs.",
              options: ["Streamline", "Lengthen", "Complicate", "Advertise"],
              correctIndex: 0,
              explanation: "Removing needless sign-offs to make a process simpler is to \"streamline\" it; \"lengthen\" and \"complicate\" do the opposite, and \"advertise\" is unrelated.",
            },
          },
          {
            word: "Anticipate",
            fact: "\"Anticipate\" means to expect something and prepare for it in advance. The store anticipated the holiday rush and hired extra staff.",
            quiz: {
              sentence: "Good project managers ______ problems early and plan for them, instead of scrambling once things go wrong.",
              options: ["Anticipate", "Celebrate", "Imitate", "Terminate"],
              correctIndex: 0,
              explanation: "Expecting problems and planning for them ahead of time is to \"anticipate\" them; you don't celebrate, imitate, or terminate problems in advance.",
            },
          },
          {
            word: "Milestone",
            fact: "\"Milestone\" means a key point of progress marked in a project plan. Passing the safety review was the project's second milestone.",
            quiz: {
              sentence: "The project plan breaks the year into four ______, each with a clear deliverable and a date.",
              options: ["Milestones", "Lanterns", "Carpets", "Trophies"],
              correctIndex: 0,
              explanation: "Key checkpoints of progress in a plan are \"milestones\"; lanterns, carpets, and trophies are objects, not stages of a project.",
            },
          },
          {
            word: "Scope",
            fact: "\"Scope\" means the range of work or subjects that a project covers. The client kept adding requests, so the scope of the project kept growing.",
            quiz: {
              sentence: "Every time the client added a new request, the ______ of the project grew, and so did the cost.",
              options: ["Scope", "Uniform", "Trophy", "Menu"],
              correctIndex: 0,
              explanation: "The range of work a project covers is its \"scope\"; a uniform, a trophy, and a menu are things, not the extent of a project.",
            },
          },
          {
            word: "Rationale",
            fact: "\"Rationale\" means the reasons behind a decision or plan. The memo explains the rationale for moving to a four-day week.",
            quiz: {
              sentence: "Before approving the expense, the director asked her to write down the ______ behind the request.",
              options: ["Rationale", "Reception", "Rumor", "Ceremony"],
              correctIndex: 0,
              explanation: "The reasoning behind a request is its \"rationale\"; a reception is a gathering, a rumor is unverified talk, and a ceremony is a formal event.",
            },
          },
        ],
      },
      {
        id: "strategy-decisions-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Contingency",
            fact: "\"Contingency\" means a possible future event or problem that you plan for in advance. The budget includes a ten percent contingency for unexpected costs.",
            quiz: {
              sentence: "The project budget set aside ten percent as a ______ fund for unexpected costs.",
              options: ["Contingency", "Conference", "Constituency", "Contraband"],
              correctIndex: 0,
              explanation: "Money set aside for unexpected problems is a \"contingency\" fund; a conference is a meeting, a constituency is a group of voters, and contraband is smuggled goods.",
            },
          },
          {
            word: "Bottleneck",
            fact: "\"Bottleneck\" means a point in a process where work slows down because capacity is limited. The single approval desk was a bottleneck for the whole department.",
            quiz: {
              sentence: "Every purchase had to pass through one overworked approver, and that single ______ slowed the whole department.",
              options: ["Bottleneck", "Loophole", "Shortcut", "Blueprint"],
              correctIndex: 0,
              explanation: "One narrow point that slows everything behind it is a \"bottleneck\"; a loophole is a gap in the rules, a shortcut speeds things up, and a blueprint is a detailed plan.",
            },
          },
          {
            word: "Pivot",
            fact: "\"Pivot\" means to make a major change of direction in strategy. When subscriptions outsold single sales, the company pivoted to a subscription model.",
            quiz: {
              sentence: "When early sales showed customers wanted the software, not the hardware, the founders decided to ______ and sell only the software.",
              options: ["Pivot", "Persist", "Stall", "Expand"],
              correctIndex: 0,
              explanation: "Changing direction based on what customers want is to \"pivot\"; \"persist\" means keep going the same way, \"stall\" means stop moving, and \"expand\" means grow bigger, not narrow down to one product.",
            },
          },
          {
            word: "Incremental",
            fact: "\"Incremental\" means increasing or improving in small steps. The team made incremental improvements each week instead of one big redesign.",
            quiz: {
              sentence: "Rather than overhauling the whole system, the team made ______ improvements, tweaking one small feature each week.",
              options: ["Incremental", "Ceremonial", "Confidential", "Sensational"],
              correctIndex: 0,
              explanation: "Small changes added one step at a time are \"incremental\"; ceremonial means formal, confidential means secret, and sensational means shocking.",
            },
          },
          {
            word: "Holistic",
            fact: "\"Holistic\" means considering the whole of something rather than only its separate parts. A holistic review looks at the team, the process, and the customers together.",
            quiz: {
              sentence: "Instead of fixing each department's problems separately, the consultant took a ______ approach and examined how all the parts of the company worked together.",
              options: ["Holistic", "Hostile", "Hasty", "Hypothetical"],
              correctIndex: 0,
              explanation: "Looking at how all the parts work together is a \"holistic\" approach; hostile means unfriendly, hasty means rushed, and hypothetical means imagined.",
            },
          },
          {
            word: "Proactive",
            fact: "\"Proactive\" means acting in advance to deal with a problem instead of waiting to react. A proactive manager fixed the scheduling issue before it caused delays.",
            quiz: {
              sentence: "Instead of waiting for complaints to pile up, the support lead took a ______ step and updated the help page before customers even asked.",
              options: ["Proactive", "Reactive", "Passive", "Defensive"],
              correctIndex: 0,
              explanation: "Acting before anyone asks is \"proactive\"; reactive and passive describe waiting to be prodded, and defensive means guarding against criticism.",
            },
          },
          {
            word: "Criteria",
            fact: "\"Criteria\" means the standards by which something is judged or decided. The panel used three criteria to rank the bids: cost, speed, and quality.",
            quiz: {
              sentence: "The panel ranked each bid against the same four ______: price, delivery time, quality, and references.",
              options: ["Criteria", "Colleagues", "Currencies", "Charities"],
              correctIndex: 0,
              explanation: "Standards used for judging are \"criteria\"; colleagues are coworkers, currencies are types of money, and charities are aid groups.",
            },
          },
          {
            word: "Overhead",
            fact: "\"Overhead\" means the ongoing costs of running a business, such as rent and utilities, that are not tied to any one product. Moving to a smaller office cut our overhead by a third.",
            quiz: {
              sentence: "Even before selling a single product, the shop had to cover rent, utilities, and insurance, which kept its monthly ______ high.",
              options: ["Overhead", "Overtime", "Overview", "Oversight"],
              correctIndex: 0,
              explanation: "Ongoing costs like rent, utilities, and insurance are \"overhead\"; overtime is extra hours worked, an overview is a summary, and oversight is supervision.",
            },
          },
          {
            word: "Diversify",
            fact: "\"Diversify\" means to add variety, especially to reduce risk by not depending on one thing. The firm diversified its client base so no single customer supplied most of its revenue.",
            quiz: {
              sentence: "After losing its biggest customer, the agency worked to ______ its client list so that no one account could sink the business again.",
              options: ["Diversify", "Amplify", "Simplify", "Specify"],
              correctIndex: 0,
              explanation: "Spreading the business across many clients is to \"diversify\"; amplify means make stronger, simplify means make less complicated, and specify means state exactly.",
            },
          },
          {
            word: "Consolidate",
            fact: "\"Consolidate\" means to combine several things into one, often to save money or become stronger. The bank consolidated its three call centers into one.",
            quiz: {
              sentence: "To cut costs, the company decided to ______ its three regional warehouses into a single, larger facility.",
              options: ["Consolidate", "Liquidate", "Franchise", "Decorate"],
              correctIndex: 0,
              explanation: "Combining three warehouses into one is to \"consolidate\"; liquidate means sell off assets, franchise means license a business model, and decorate has nothing to do with merging.",
            },
          },
          {
            word: "Optimize",
            fact: "\"Optimize\" means to make something as effective or efficient as possible. The team optimized delivery routes and saved two hours a day.",
            quiz: {
              sentence: "The logistics team used route-planning software to ______ deliveries, cutting each driver's daily mileage by a fifth.",
              options: ["Optimize", "Authorize", "Criticize", "Memorize"],
              correctIndex: 0,
              explanation: "Making deliveries as efficient as possible is to \"optimize\" them; authorize means approve, criticize means find fault, and memorize means learn by heart.",
            },
          },
          {
            word: "Redundant",
            fact: "\"Redundant\" means no longer needed because it duplicates something else. Once the two systems merged, the older one became redundant.",
            quiz: {
              sentence: "After the merger, two departments were doing the same reporting, so one of them had become ______.",
              options: ["Redundant", "Reluctant", "Resilient", "Relevant"],
              correctIndex: 0,
              explanation: "Doing the same job as another department makes one \"redundant\"; reluctant means unwilling, resilient means able to recover, and relevant means connected to the matter at hand.",
            },
          },
        ],
      },
      {
        id: "strategy-decisions-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Preempt",
            fact: "\"Preempt\" means to act first in order to prevent something from happening. She preempted the objection by addressing the cost in her opening slide.",
            quiz: {
              sentence: "Knowing the board would worry about cost, the CFO opened her presentation with the budget figures to ______ the objection before anyone raised it.",
              options: ["Preempt", "Rebut", "Refute", "Deflect"],
              correctIndex: 0,
              explanation: "Acting first to head off an objection before it is raised is to \"preempt\" it; rebut and refute mean answering an objection already made, and deflect means turning one aside after it arrives.",
            },
          },
          {
            word: "Myopic",
            fact: "\"Myopic\" means short-sighted, focused on immediate concerns without thinking about the long term. Cutting the training budget to hit this quarter's target was a myopic decision.",
            quiz: {
              sentence: "Cutting the research budget to hit this quarter's profit target was a ______ decision that would cost the company its future products.",
              options: ["Myopic", "Prudent", "Generous", "Cautious"],
              correctIndex: 0,
              explanation: "Sacrificing the long term for a short-term target is \"myopic\"; prudent and cautious describe careful, sensible choices, and generous describes giving freely.",
            },
          },
          {
            word: "Expedient",
            fact: "\"Expedient\" means convenient and practical for the moment, even if not the most principled choice. Hiring the first available contractor was expedient but not ideal.",
            quiz: {
              sentence: "Skipping the safety review would save two weeks, but the manager refused to choose the merely ______ option over the responsible one.",
              options: ["Expedient", "Ethical", "Rigorous", "Thorough"],
              correctIndex: 0,
              explanation: "Choosing what is convenient now over what is right is \"expedient\"; ethical, rigorous, and thorough all describe careful, responsible approaches.",
            },
          },
          {
            word: "Prudent",
            fact: "\"Prudent\" means showing good judgment and caution about the future, especially with money. It would be prudent to keep three months of expenses in reserve.",
            quiz: {
              sentence: "Given how unpredictable the market was, the treasurer made the ______ choice to keep six months of expenses in cash.",
              options: ["Prudent", "Reckless", "Frivolous", "Impulsive"],
              correctIndex: 0,
              explanation: "Keeping a cash reserve against an unpredictable market is \"prudent\"; reckless, frivolous, and impulsive all describe careless choices.",
            },
          },
          {
            word: "Extrapolate",
            fact: "\"Extrapolate\" means to estimate what will happen by extending known information beyond what has been measured. From two months of sales, we extrapolated a full year's figures.",
            quiz: {
              sentence: "From just two months of sales data, the analyst tried to ______ the full-year total, though she admitted the estimate was rough.",
              options: ["Extrapolate", "Interpolate", "Corroborate", "Tabulate"],
              correctIndex: 0,
              explanation: "Extending a short run of data to estimate a full year is to \"extrapolate\"; interpolate estimates a value between known points, corroborate means confirm with evidence, and tabulate means arrange data in a table.",
            },
          },
          {
            word: "Precedent",
            fact: "\"Precedent\" means an earlier event or decision that serves as an example for later ones. Granting one exception could set a precedent that others will demand.",
            quiz: {
              sentence: "Approving the refund for one late customer risked setting a ______, since every other late customer would now expect the same treatment.",
              options: ["Precedent", "Pretext", "Prerequisite", "Presumption"],
              correctIndex: 0,
              explanation: "An earlier decision that others will point to is a \"precedent\"; a pretext is a false reason, a prerequisite is a required first step, and a presumption is an assumption.",
            },
          },
          {
            word: "Discretionary",
            fact: "\"Discretionary\" means left to individual choice or judgment rather than fixed or required. Travel is discretionary spending, so it is the first thing cut in a tight quarter.",
            quiz: {
              sentence: "When revenue dropped, the CFO froze all ______ spending, such as conference travel and office upgrades, while leaving payroll and rent untouched.",
              options: ["Discretionary", "Mandatory", "Essential", "Statutory"],
              correctIndex: 0,
              explanation: "Spending that is optional and can be cut at will is \"discretionary\"; mandatory, essential, and statutory spending cannot simply be dropped.",
            },
          },
          {
            word: "Inertia",
            fact: "\"Inertia\" means a tendency to keep doing things the same way and to resist change. Organizational inertia kept the company on outdated software for a decade.",
            quiz: {
              sentence: "Everyone knew the old filing system was inefficient, but ______ kept the company using it for another ten years.",
              options: ["Inertia", "Ambition", "Curiosity", "Urgency"],
              correctIndex: 0,
              explanation: "A tendency to keep doing things the same way is \"inertia\"; ambition, curiosity, and urgency would all push toward change.",
            },
          },
          {
            word: "Contrarian",
            fact: "\"Contrarian\" means a person who deliberately takes the opposite view from the prevailing opinion. As a contrarian investor, he bought when everyone else was selling.",
            quiz: {
              sentence: "While every other analyst rushed to praise the merger, the ______ on the panel argued, mostly for the sake of argument, that it would fail.",
              options: ["Contrarian", "Skeptic", "Loyalist", "Bystander"],
              correctIndex: 0,
              explanation: "Someone who takes the opposite side of the prevailing view, partly for its own sake, is a \"contrarian\"; a skeptic doubts on evidence, a loyalist supports, and a bystander merely watches.",
            },
          },
          {
            word: "Salient",
            fact: "\"Salient\" means most noticeable or important. The report's most salient finding was that costs had doubled.",
            quiz: {
              sentence: "The executive summary should highlight only the most ______ findings, not every detail buried in the appendix.",
              options: ["Salient", "Sequential", "Subsidiary", "Speculative"],
              correctIndex: 0,
              explanation: "The most noticeable, important findings are \"salient\"; sequential means in order, subsidiary means secondary, and speculative means based on guesswork.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "leadership-workplace",
    title: "Leadership & Workplace Dynamics",
    description: "Words for managing people, giving feedback, and reading how teams and workplaces really work.",
    levels: [
      {
        id: "leadership-workplace-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Delegate",
            fact: "\"Delegate\" means to hand a task or responsibility to someone else. She delegated the scheduling to her assistant so she could focus on strategy.",
            quiz: {
              sentence: "Trying to do everything herself was exhausting, so the new manager learned to ______ routine tasks to her team.",
              options: ["Delegate", "Reimburse", "Interview", "Audit"],
              correctIndex: 0,
              explanation: "Handing tasks to teammates is to \"delegate\"; you reimburse expenses, interview candidates, and audit records, none of which means assigning work.",
            },
          },
          {
            word: "Mentor",
            fact: "\"Mentor\" means an experienced person who advises and guides someone less experienced. Her mentor helped her prepare for the promotion.",
            quiz: {
              sentence: "During my first year, a senior engineer served as my ______, meeting with me every week to review my work and answer questions.",
              options: ["Mentor", "Competitor", "Landlord", "Tenant"],
              correctIndex: 0,
              explanation: "An experienced colleague who guides a newer one is a \"mentor\"; a competitor works against you, a landlord owns property you rent, and a tenant is the renter.",
            },
          },
          {
            word: "Collaborate",
            fact: "\"Collaborate\" means to work together with others toward a shared goal. The two departments collaborated on the annual report.",
            quiz: {
              sentence: "The best results came when designers and engineers began to ______ from the start instead of passing files back and forth.",
              options: ["Collaborate", "Retire", "Invoice", "Withdraw"],
              correctIndex: 0,
              explanation: "Working together from the start is to \"collaborate\"; retire, invoice, and withdraw describe leaving, billing, and pulling out.",
            },
          },
          {
            word: "Accountable",
            fact: "\"Accountable\" means responsible for your actions and expected to explain them. Each project lead is accountable for meeting the deadline.",
            quiz: {
              sentence: "As team lead, she was ______ for the final result and would have to explain any missed deadlines to the director.",
              options: ["Accountable", "Available", "Comfortable", "Affordable"],
              correctIndex: 0,
              explanation: "Being answerable for a result is \"accountable\"; available means free to use or reach, comfortable means at ease, and affordable means reasonably priced.",
            },
          },
          {
            word: "Motivate",
            fact: "\"Motivate\" means to give someone a reason or desire to act. A clear goal and regular recognition motivate people to do their best.",
            quiz: {
              sentence: "A generous bonus might ______ people to work harder for a month, but meaningful work keeps them engaged for years.",
              options: ["Motivate", "Terminate", "Relocate", "Imitate"],
              correctIndex: 0,
              explanation: "Giving people a reason to work harder is to \"motivate\" them; terminate, relocate, and imitate don't describe inspiring effort.",
            },
          },
          {
            word: "Empower",
            fact: "\"Empower\" means to give someone the authority or confidence to act on their own. Good managers empower their teams to make decisions without waiting for approval.",
            quiz: {
              sentence: "Rather than approving every small decision herself, the director chose to ______ her team so they could act without waiting for permission.",
              options: ["Empower", "Overrule", "Monitor", "Reprimand"],
              correctIndex: 0,
              explanation: "Letting a team act without waiting for permission is to \"empower\" it; overrule, monitor, and reprimand keep control with the manager instead.",
            },
          },
          {
            word: "Supervise",
            fact: "\"Supervise\" means to oversee other people's work to make sure it is done properly. She supervises a team of six technicians.",
            quiz: {
              sentence: "New hires need someone to ______ their first few weeks and check that they are following the safety procedures.",
              options: ["Supervise", "Sponsor", "Subscribe", "Sabotage"],
              correctIndex: 0,
              explanation: "Overseeing new hires and checking their work is to \"supervise\" them; sponsor means fund or back, subscribe means sign up, and sabotage means deliberately ruin.",
            },
          },
          {
            word: "Morale",
            fact: "\"Morale\" means the confidence and enthusiasm of a group of people. Layoffs hurt morale across the whole office.",
            quiz: {
              sentence: "After three rounds of layoffs and a hiring freeze, ______ in the office was at its lowest point in years.",
              options: ["Morale", "Mileage", "Marketing", "Mortgage"],
              correctIndex: 0,
              explanation: "The mood and confidence of a workforce is its \"morale\"; mileage measures distance, marketing promotes products, and a mortgage is a home loan.",
            },
          },
          {
            word: "Workload",
            fact: "\"Workload\" means the amount of work a person or team is expected to do. Her workload doubled when two colleagues left.",
            quiz: {
              sentence: "When two colleagues resigned, her ______ nearly doubled, and she started staying late every night.",
              options: ["Workload", "Paycheck", "Vacation", "Uniform"],
              correctIndex: 0,
              explanation: "The amount of work someone has to do is a \"workload\"; her paycheck, vacation, and uniform wouldn't force her to stay late.",
            },
          },
          {
            word: "Initiative",
            fact: "\"Initiative\" means the ability to take action without being told to. He showed initiative by fixing the process before anyone asked.",
            quiz: {
              sentence: "Nobody asked her to reorganize the shared drive, but she took the ______ and finished it over the weekend.",
              options: ["Initiative", "Invoice", "Intermission", "Inheritance"],
              correctIndex: 0,
              explanation: "Acting without being asked is taking the \"initiative\"; an invoice is a bill, an intermission is a break, and an inheritance is money left by a relative.",
            },
          },
          {
            word: "Burnout",
            fact: "\"Burnout\" means physical or emotional exhaustion from long-term stress, especially at work. Months of overtime left him on the edge of burnout.",
            quiz: {
              sentence: "After a year of seventy-hour weeks with no time off, Elena was suffering from ______ and could barely focus.",
              options: ["Burnout", "Turnover", "Payroll", "Layoff"],
              correctIndex: 0,
              explanation: "Exhaustion from a year of overwork is \"burnout\"; turnover is the rate at which staff leave, payroll is the wages paid, and a layoff is a job loss.",
            },
          },
          {
            word: "Diligent",
            fact: "\"Diligent\" means careful and hard-working in doing your duties. A diligent employee, she double-checked every figure before submitting.",
            quiz: {
              sentence: "Her ______ approach paid off: she double-checked every figure in the report and caught three errors before it went out.",
              options: ["Diligent", "Careless", "Hasty", "Reckless"],
              correctIndex: 0,
              explanation: "Checking every figure carefully is \"diligent\" work; careless, hasty, and reckless describe the opposite, and wouldn't catch errors.",
            },
          },
        ],
      },
      {
        id: "leadership-workplace-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Rapport",
            fact: "\"Rapport\" means a friendly, trusting relationship in which people understand each other. She built rapport with the client during the first meeting.",
            quiz: {
              sentence: "Because he took time to ask about her team and remember the details, the new sales rep quickly built ______ with the client.",
              options: ["Rapport", "Resentment", "Reluctance", "Suspicion"],
              correctIndex: 0,
              explanation: "A trusting, friendly connection is \"rapport\"; resentment, reluctance, and suspicion are negative feelings that wouldn't grow from taking an interest in her team.",
            },
          },
          {
            word: "Autonomy",
            fact: "\"Autonomy\" means the freedom to make your own decisions and manage your own work. Employees with autonomy over their schedules tend to report higher satisfaction.",
            quiz: {
              sentence: "The best engineers rarely stay where every decision needs sign-off; they want the ______ to choose how they solve a problem.",
              options: ["Autonomy", "Anonymity", "Ambiguity", "Assurance"],
              correctIndex: 0,
              explanation: "Freedom to make one's own decisions is \"autonomy\"; anonymity is being unidentified, ambiguity is unclear meaning, and assurance is a promise or a feeling of certainty.",
            },
          },
          {
            word: "Hierarchy",
            fact: "\"Hierarchy\" means a system that ranks people or roles from highest to lowest. In a strict hierarchy, ideas must go up through three levels of managers.",
            quiz: {
              sentence: "In the company's rigid ______, a junior analyst's idea had to pass through three layers of managers before it reached the director.",
              options: ["Hierarchy", "Hardware", "Harmony", "Headquarters"],
              correctIndex: 0,
              explanation: "A system ranking people from lowest to highest is a \"hierarchy\"; hardware is equipment, harmony is agreement, and headquarters is the main office.",
            },
          },
          {
            word: "Micromanage",
            fact: "\"Micromanage\" means to control every small detail of other people's work, leaving them little freedom. A manager who micromanages tends to frustrate skilled employees.",
            quiz: {
              sentence: "Skilled designers grew frustrated when their boss began to ______ them, demanding to approve every color and font choice.",
              options: ["Micromanage", "Mentor", "Compliment", "Recruit"],
              correctIndex: 0,
              explanation: "Controlling every small choice is to \"micromanage\"; mentoring guides without controlling, complimenting praises, and recruiting hires.",
            },
          },
          {
            word: "Constructive",
            fact: "\"Constructive\" means helpful and aimed at improving something. She gave constructive feedback that included two specific suggestions.",
            quiz: {
              sentence: "Instead of simply saying the presentation was bad, he offered ______ criticism, pointing out what worked and suggesting three specific fixes.",
              options: ["Constructive", "Destructive", "Vindictive", "Impulsive"],
              correctIndex: 0,
              explanation: "Criticism that helps someone improve is \"constructive\"; destructive and vindictive criticism harm, and impulsive means done without thinking.",
            },
          },
          {
            word: "Candid",
            fact: "\"Candid\" means honest and direct, even when the truth is uncomfortable. In a candid conversation, he told her the project was behind schedule.",
            quiz: {
              sentence: "I appreciate my manager's ______ feedback: she tells me exactly where I fall short, without sugarcoating it.",
              options: ["Candid", "Cordial", "Casual", "Cautious"],
              correctIndex: 0,
              explanation: "Honest, direct feedback without sugarcoating is \"candid\"; cordial means warm and polite, casual means relaxed, and cautious means careful.",
            },
          },
          {
            word: "Cohesive",
            fact: "\"Cohesive\" means working together as a united whole. After the offsite, the team felt more cohesive.",
            quiz: {
              sentence: "Despite their different backgrounds, the group worked as a ______ unit, with everyone pulling in the same direction.",
              options: ["Cohesive", "Cosmetic", "Coincidental", "Corrective"],
              correctIndex: 0,
              explanation: "A group united and pulling together is \"cohesive\"; cosmetic means for appearance only, coincidental means by chance, and corrective means meant to fix a problem.",
            },
          },
          {
            word: "Camaraderie",
            fact: "\"Camaraderie\" means friendly trust and good feeling among people who spend time together. The long nights on the project built real camaraderie among the engineers.",
            quiz: {
              sentence: "What people remembered most about the difficult project was not the pay but the ______ among colleagues who had struggled through it together.",
              options: ["Camaraderie", "Bureaucracy", "Compliance", "Credentials"],
              correctIndex: 0,
              explanation: "Warm friendship formed through shared hardship is \"camaraderie\"; bureaucracy is rigid procedure, compliance is following rules, and credentials are qualifications.",
            },
          },
          {
            word: "Reprimand",
            fact: "\"Reprimand\" means to formally criticize someone for doing something wrong. The supervisor reprimanded him for leaking the client list.",
            quiz: {
              sentence: "After the intern shared confidential figures with an outsider, the director had no choice but to formally ______ her.",
              options: ["Reprimand", "Reimburse", "Promote", "Reward"],
              correctIndex: 0,
              explanation: "Formally scolding someone for a breach is to \"reprimand\" her; reimburse means repay, and promote and reward would honor her rather than discipline her.",
            },
          },
          {
            word: "Tenure",
            fact: "\"Tenure\" means the length of time someone holds a job or position. Employees with long tenure tend to know the company's history well.",
            quiz: {
              sentence: "With fifteen years of ______ at the firm, he knew every client and every shortcut in the building.",
              options: ["Tenure", "Tension", "Turnover", "Tuition"],
              correctIndex: 0,
              explanation: "Years spent holding a position are \"tenure\"; tension is strain, turnover is the rate at which staff leave, and tuition is the cost of schooling.",
            },
          },
          {
            word: "Attrition",
            fact: "\"Attrition\" means a gradual reduction in staff as people leave and are not replaced. The company avoided layoffs by relying on natural attrition.",
            quiz: {
              sentence: "Rather than announcing layoffs, the company let its headcount shrink through ______, simply not replacing people who retired or resigned.",
              options: ["Attrition", "Promotion", "Expansion", "Inflation"],
              correctIndex: 0,
              explanation: "A gradual shrinking as people leave and aren't replaced is \"attrition\"; promotion and expansion mean moving up or growing, and inflation is rising prices.",
            },
          },
          {
            word: "Tactful",
            fact: "\"Tactful\" means careful to say difficult things without offending others. Her tactful email suggested improvements without criticizing the writer.",
            quiz: {
              sentence: "He was ______ enough to raise the budget problem privately with the director instead of embarrassing her in front of the whole team.",
              options: ["Tactful", "Blunt", "Reckless", "Careless"],
              correctIndex: 0,
              explanation: "Raising a delicate issue privately to spare someone embarrassment is \"tactful\"; blunt, reckless, and careless all describe the opposite.",
            },
          },
        ],
      },
      {
        id: "leadership-workplace-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Insubordination",
            fact: "\"Insubordination\" means the refusal to obey or respect a legitimate order from a superior. He was dismissed for insubordination after openly refusing to follow the safety rules.",
            quiz: {
              sentence: "Openly refusing a direct instruction from his supervisor in front of the whole team was an act of ______ that the company could not overlook.",
              options: ["Insubordination", "Ingenuity", "Indecision", "Inattention"],
              correctIndex: 0,
              explanation: "Refusing a supervisor's direct instruction is \"insubordination\"; ingenuity is cleverness, indecision is inability to choose, and inattention is failure to focus.",
            },
          },
          {
            word: "Nepotism",
            fact: "\"Nepotism\" means favoring relatives or close friends when giving jobs or advantages. Employees complained of nepotism when the owner's nephew was promoted over more qualified candidates.",
            quiz: {
              sentence: "Employees suspected ______ when the owner's nephew was promoted over three more experienced candidates.",
              options: ["Nepotism", "Sabotage", "Plagiarism", "Espionage"],
              correctIndex: 0,
              explanation: "Promoting a relative over better candidates is \"nepotism\"; sabotage is deliberate damage, plagiarism is copying someone's work, and espionage is spying.",
            },
          },
          {
            word: "Ostracize",
            fact: "\"Ostracize\" means to deliberately exclude someone from a group. After he reported the mistake, some coworkers ostracized him and stopped inviting him to lunch.",
            quiz: {
              sentence: "After she reported the accounting error, a few colleagues began to ______ her, deliberately leaving her out of lunches and meetings.",
              options: ["Ostracize", "Criticize", "Patronize", "Sympathize"],
              correctIndex: 0,
              explanation: "Deliberately shutting someone out is to \"ostracize\" her; criticize means find fault, patronize means talk down to, and sympathize means share feelings.",
            },
          },
          {
            word: "Magnanimous",
            fact: "\"Magnanimous\" means generous and forgiving, especially toward a rival or someone less powerful. The magnanimous winner thanked her opponents for a good fight.",
            quiz: {
              sentence: "After winning the promotion over her longtime rival, she was ______ in victory, publicly crediting his contributions to the project.",
              options: ["Magnanimous", "Arrogant", "Vindictive", "Smug"],
              correctIndex: 0,
              explanation: "Being generous to a rival after winning is \"magnanimous\"; arrogant, vindictive, and smug describe boastful or spiteful winners.",
            },
          },
          {
            word: "Disgruntled",
            fact: "\"Disgruntled\" means annoyed and dissatisfied, especially with your situation at work. A disgruntled former employee posted complaints online.",
            quiz: {
              sentence: "Months without a raise turned the once-loyal analyst into a ______ employee who complained openly about management.",
              options: ["Disgruntled", "Delighted", "Diligent", "Devoted"],
              correctIndex: 0,
              explanation: "Chronically dissatisfied and complaining is \"disgruntled\"; delighted, diligent, and devoted all describe positive attitudes.",
            },
          },
          {
            word: "Meritocracy",
            fact: "\"Meritocracy\" means a system in which people advance based on ability and achievement rather than connections or wealth. Promotion by results alone is the ideal of a meritocracy.",
            quiz: {
              sentence: "The founder insisted the firm was a ______, where promotions were earned by measurable results rather than by family ties or friendships.",
              options: ["Meritocracy", "Monarchy", "Bureaucracy", "Democracy"],
              correctIndex: 0,
              explanation: "A system that rewards ability and results is a \"meritocracy\"; a monarchy is ruled by a king or queen, a bureaucracy runs on rigid procedures, and a democracy is governed by voting.",
            },
          },
          {
            word: "Paternalistic",
            fact: "\"Paternalistic\" means treating others like children by making decisions for them, supposedly for their own good. The paternalistic manager decided which training courses her staff could take.",
            quiz: {
              sentence: "Employees resented the ______ policy that let managers decide what benefits each worker could choose, supposedly for the workers' own good.",
              options: ["Paternalistic", "Egalitarian", "Frugal", "Lenient"],
              correctIndex: 0,
              explanation: "Deciding for people as if they were children, supposedly for their good, is \"paternalistic\"; egalitarian means treating everyone as equals, frugal means thrifty, and lenient means permissive.",
            },
          },
          {
            word: "Domineering",
            fact: "\"Domineering\" means controlling others in an overbearing way. A domineering boss talked over anyone who disagreed.",
            quiz: {
              sentence: "Her ______ style, interrupting anyone who disagreed and insisting on having the last word, left the team afraid to speak up.",
              options: ["Domineering", "Decisive", "Assertive", "Confident"],
              correctIndex: 0,
              explanation: "An overbearing, controlling style is \"domineering\"; decisive, assertive, and confident describe positive traits that wouldn't leave a team afraid to speak.",
            },
          },
          {
            word: "Abrasive",
            fact: "\"Abrasive\" means harsh and irritating in manner. His abrasive tone alienated colleagues even when his points were valid.",
            quiz: {
              sentence: "Although her analysis was usually right, her ______ manner, with sneering comments and needlessly harsh emails, made colleagues avoid working with her.",
              options: ["Abrasive", "Candid", "Reserved", "Quiet"],
              correctIndex: 0,
              explanation: "Needlessly harsh and irritating is \"abrasive\"; candid means honest without being cruel, and reserved and quiet describe people who say little.",
            },
          },
          {
            word: "Equitable",
            fact: "\"Equitable\" means fair and impartial, treating everyone justly. The company adopted an equitable bonus formula based on measurable contributions.",
            quiz: {
              sentence: "To make the bonus system more ______, the committee replaced managers' personal favorites with a formula applied the same way to every employee.",
              options: ["Equitable", "Generous", "Profitable", "Complicated"],
              correctIndex: 0,
              explanation: "A formula applied the same way to everyone is fair, or \"equitable\"; generous means giving a lot, profitable means earning money, and complicated means hard to understand.",
            },
          },
        ],
      },
    ],
  },
];
