// Curated, hand-written vocabulary content for every course. No AI calls at
// runtime — this is the entire content library.
//
// Structure: courses > categories > levels (difficulty tiers within a
// category) > words. A course is a self-contained body of content that a
// learner can work through; ONE subscription unlocks every course (see
// lib/purchase.js).
//
//   sat-vocab            (below) categories organized by FUNCTION — agreement,
//                        disagreement, degree, etc. — matching how the real
//                        Digital SAT tests vocab through "Words in Context".
//   everyday-vocabulary  (lib/everydayVocabulary.js) categories organized by
//                        THEME; not tied to any exam.
//   professional-vocabulary
//                        (lib/professionalVocabulary.js) categories organized
//                        by THEME / context of use, for working adults; every
//                        quiz sentence is set in a real workplace situation.
//
// Quiz format, in every course: a sentence with a blank, four plausible answer
// choices, and only one that precisely fits the tone and logic of that
// specific sentence — NOT a plain "what does this word mean" question.
//
// IMPORTANT: level ids, word ids and word content are referenced directly by
// users' localStorage (progress, streaks, spaced-repetition boxes). Never
// change or regenerate them — new courses are added by wrapping, not editing.
//
// `categories` (exported below the data) is the flat list of every category
// across every course, so code that doesn't care about courses is unaffected.

import { everydayVocabularyCategories } from "./everydayVocabulary";
import { professionalVocabularyCategories } from "./professionalVocabulary";
import { satExpertLevels } from "./satExpertTier";
import { satPassages } from "./satPassages";
import { satStrategyGuides } from "./satStrategy";
import { satGrammarCategories } from "./satGrammar";

// The SAT Vocab course's ORIGINAL three-tier categories — unchanged from before
// courses existed (do not edit or regenerate; ids and content are referenced by
// users' localStorage). Each gets its Expert tier appended just below.
const satVocabCoreCategories = [
  {
    id: "agreement-support",
    title: "Agreement & Support",
    description: "Words used to confirm, back up, or align with a claim.",
    levels: [
      {
        id: "agreement-support-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Confirm",
            fact: "\"Confirm\" means to state or show that something is true. The lab results confirmed what the researchers had suspected all along.",
            quiz: {
              sentence: "After weeks of testing, engineers were finally able to ______ that the new bridge design could handle the required weight load.",
              options: ["Confirm", "Doubt", "Forget", "Deny"],
              correctIndex: 0,
              explanation: "The sentence describes a positive outcome after testing, so \"confirm\" fits; the others all suggest the opposite conclusion.",
            },
          },
          {
            word: "Support",
            fact: "\"Support\" means to provide evidence or backing for a claim. The new data seemed to support the team's original theory.",
            quiz: {
              sentence: "The committee asked for more data before it would ______ the proposed policy change.",
              options: ["Support", "Reject", "Forget", "Question"],
              correctIndex: 0,
              explanation: "\"Asked for more data before\" signals the committee needs convincing to back the policy, so \"support\" fits best.",
            },
          },
          {
            word: "Agree",
            fact: "\"Agree\" means to have the same opinion as someone else. Most scientists agree that the data points to a clear trend.",
            quiz: {
              sentence: "Even her harshest critics had to ______ that the experiment's results were compelling.",
              options: ["Agree", "Argue", "Panic", "Complain"],
              correctIndex: 0,
              explanation: "\"Even her harshest critics\" signals a shift toward acceptance despite disagreement, matching \"agree.\"",
            },
          },
          {
            word: "Endorse",
            fact: "\"Endorse\" means to publicly declare support for someone or something. The scientific board voted to endorse the new safety guidelines.",
            quiz: {
              sentence: "After reviewing the candidate's record, the organization decided to formally ______ her campaign.",
              options: ["Endorse", "Oppose", "Delay", "Overlook"],
              correctIndex: 0,
              explanation: "Formally supporting a campaign after a positive review points to \"endorse\"; the others suggest resistance or inaction.",
            },
          },
          {
            word: "Verify",
            fact: "\"Verify\" means to confirm the truth or accuracy of something, often by checking it carefully. The auditors verified every transaction before signing off on the report.",
            quiz: {
              sentence: "Before publishing the story, the journalist took extra time to ______ each fact with a second source.",
              options: ["Verify", "Invent", "Ignore", "Exaggerate"],
              correctIndex: 0,
              explanation: "Checking facts with a second source is the definition of \"verify\"; the other options describe the opposite of careful fact-checking.",
            },
          },
          {
            word: "Approve",
            fact: "\"Approve\" means to officially accept something as satisfactory. The board approved the new budget after a short discussion.",
            quiz: {
              sentence: "The city council reviewed the construction plans for weeks before finally voting to ______ them.",
              options: ["Approve", "Cancel", "Postpone", "Misplace"],
              correctIndex: 0,
              explanation: "A vote after review that allows the plans to move forward is \"approve\"; the others describe stopping or delaying them.",
            },
          },
          {
            word: "Back",
            fact: "\"Back\" means to give one's support to a person, plan, or idea. Several major donors agreed to back the new research initiative.",
            quiz: {
              sentence: "Few investors wanted to ______ the risky startup until its first product proved successful.",
              options: ["Back", "Abandon", "Criticize", "Overlook"],
              correctIndex: 0,
              explanation: "Investors choosing to fund a startup after proof of success is \"back\"; the others describe withdrawing or ignoring support.",
            },
          },
          {
            word: "Favor",
            fact: "\"Favor\" means to support or prefer one option over others. Most residents favored the plan to build a new library.",
            quiz: {
              sentence: "In the survey, a clear majority of students ______ extending the school day by thirty minutes for extra study time.",
              options: ["Favored", "Rejected", "Forgot", "Misunderstood"],
              correctIndex: 0,
              explanation: "A majority preferring an option in a survey is \"favored\"; the others describe opposition or confusion instead.",
            },
          },
          {
            word: "Accept",
            fact: "\"Accept\" means to agree to receive, believe, or approve of something. The committee accepted the proposal after a few small revisions.",
            quiz: {
              sentence: "After reviewing the evidence herself, the skeptical editor finally chose to ______ the reporter's version of events.",
              options: ["Accept", "Dismiss", "Distort", "Postpone"],
              correctIndex: 0,
              explanation: "A skeptic being convinced by evidence and coming around is \"accept\"; the others describe rejecting or delaying belief.",
            },
          },
          {
            word: "Acknowledge",
            fact: "\"Acknowledge\" means to accept or admit the truth of something. The company publicly acknowledged the error in its original report.",
            quiz: {
              sentence: "Though he rarely admitted fault, the coach was quick to ______ that his strategy had failed in the final quarter.",
              options: ["Acknowledge", "Deny", "Forget", "Exaggerate"],
              correctIndex: 0,
              explanation: "Admitting fault despite rarely doing so matches \"acknowledge\"; the others describe refusing to admit it or distorting it.",
            },
          },
          {
            word: "Second",
            fact: "\"Second\" means to formally support a motion or suggestion, especially in a meeting. Another board member quickly seconded the proposal.",
            quiz: {
              sentence: "As soon as the motion was raised, another committee member immediately rose to ______ it.",
              options: ["Second", "Withdraw", "Postpone", "Ignore"],
              correctIndex: 0,
              explanation: "Formally supporting a motion right after it's raised is \"second\"; the others describe pulling back, delaying, or dismissing it.",
            },
          },
          {
            word: "Uphold",
            fact: "\"Uphold\" means to confirm or support something, especially a decision or principle. The appeals court upheld the original verdict.",
            quiz: {
              sentence: "Despite public pressure to change the ruling, the judge chose to ______ the original decision.",
              options: ["Uphold", "Overturn", "Delay", "Forget"],
              correctIndex: 0,
              explanation: "Keeping a decision in place despite pressure to change it is \"uphold\"; the others describe reversing or ignoring it.",
            },
          },
        ],
      },
      {
        id: "agreement-support-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Substantiate",
            fact: "\"Substantiate\" means to provide evidence to support or prove a claim. The report failed to substantiate its most dramatic conclusions with actual data.",
            quiz: {
              sentence: "The study's central claim remained unconvincing until later trials ______ it with consistent, repeatable results.",
              options: ["Substantiated", "Contradicted", "Summarized", "Postponed"],
              correctIndex: 0,
              explanation: "\"Consistent, repeatable results\" providing proof matches \"substantiated\"; the others don't describe evidence being provided.",
            },
          },
          {
            word: "Corroborate",
            fact: "\"Corroborate\" means to confirm a claim using independent evidence. A second witness's account corroborated the details of the original report.",
            quiz: {
              sentence: "Investigators were reluctant to trust the single account until a separate piece of evidence ______ it.",
              options: ["Corroborated", "Replaced", "Minimized", "Delayed"],
              correctIndex: 0,
              explanation: "Independent evidence confirming a single account is exactly what \"corroborated\" describes.",
            },
          },
          {
            word: "Validate",
            fact: "\"Validate\" means to check or prove that something is accurate or well-founded. The follow-up experiment validated the surprising results from the first trial.",
            quiz: {
              sentence: "Researchers ran the test on three separate groups in order to ______ their initial findings before publishing.",
              options: ["Validate", "Withdraw", "Simplify", "Publicize"],
              correctIndex: 0,
              explanation: "Running additional tests to prove initial findings accurate is \"validate\"; the others describe different actions entirely.",
            },
          },
          {
            word: "Affirm",
            fact: "\"Affirm\" means to state something as true in a confident, formal way. The court affirmed the lower ruling, letting the original decision stand.",
            quiz: {
              sentence: "In her closing statement, the scientist ______ her confidence in the team's original hypothesis, despite early skepticism.",
              options: ["Affirmed", "Retracted", "Questioned", "Softened"],
              correctIndex: 0,
              explanation: "\"Confidence... despite early skepticism\" signals a firm restatement of belief, matching \"affirmed.\"",
            },
          },
          {
            word: "Concur",
            fact: "\"Concur\" means to agree with an opinion or decision, often after independently considering it. Both economists concurred with the report's central conclusion.",
            quiz: {
              sentence: "Though they had studied the problem separately, the two analysts ultimately ______ on nearly every major point.",
              options: ["Concurred", "Diverged", "Speculated", "Hesitated"],
              correctIndex: 0,
              explanation: "Two people independently reaching the same conclusion is precisely \"concurred\"; the others describe disagreement or uncertainty.",
            },
          },
          {
            word: "Reinforce",
            fact: "\"Reinforce\" means to strengthen something, often with additional material or evidence. The second experiment reinforced the conclusions of the first.",
            quiz: {
              sentence: "The professor added two more case studies to ______ an argument that already seemed fairly convincing.",
              options: ["Reinforce", "Undermine", "Simplify", "Postpone"],
              correctIndex: 0,
              explanation: "Adding more evidence to strengthen an already-convincing argument is \"reinforce.\"",
            },
          },
          {
            word: "Bolster",
            fact: "\"Bolster\" means to support or strengthen something, often to improve confidence or effectiveness. The strong sales numbers bolstered investor confidence.",
            quiz: {
              sentence: "A string of unexpectedly positive reviews helped ______ the film's box office performance in its second week.",
              options: ["Bolster", "Undercut", "Delay", "Overshadow"],
              correctIndex: 0,
              explanation: "Positive reviews improving performance is \"bolster\"; the others describe reducing or overshadowing it.",
            },
          },
          {
            word: "Ratify",
            fact: "\"Ratify\" means to give formal, official approval to an agreement, making it officially valid. The senate voted to ratify the treaty after months of negotiation.",
            quiz: {
              sentence: "The proposal had broad informal support for months, but it wasn't legally binding until the board formally ______ it.",
              options: ["Ratified", "Discussed", "Drafted", "Circulated"],
              correctIndex: 0,
              explanation: "\"Ratify\" means to make something officially valid through formal approval, matching \"legally binding\"; the others describe earlier, informal stages.",
            },
          },
          {
            word: "Authenticate",
            fact: "\"Authenticate\" means to prove that something is genuine. Experts authenticated the painting as an original, not a copy.",
            quiz: {
              sentence: "Before the museum would display the artifact, specialists spent weeks working to ______ its origin.",
              options: ["Authenticate", "Fabricate", "Misplace", "Undervalue"],
              correctIndex: 0,
              explanation: "Confirming an artifact is genuine before display is \"authenticate\"; the others describe faking or mishandling it.",
            },
          },
          {
            word: "Legitimize",
            fact: "\"Legitimize\" means to make something acceptable or valid, often through official recognition. The new law legitimized a practice that had existed informally for years.",
            quiz: {
              sentence: "Years of grassroots use eventually pushed regulators to formally ______ the alternative treatment.",
              options: ["Legitimize", "Outlaw", "Overlook", "Postpone"],
              correctIndex: 0,
              explanation: "Formal recognition after informal, widespread use is \"legitimize\"; the others describe banning or ignoring the practice.",
            },
          },
          {
            word: "Advocate",
            fact: "\"Advocate\" means to publicly support or argue in favor of something. The nonprofit has long advocated for stricter safety regulations.",
            quiz: {
              sentence: "For over a decade, the retired teacher has continued to ______ for smaller class sizes in public schools.",
              options: ["Advocate", "Apologize", "Withdraw", "Speculate"],
              correctIndex: 0,
              explanation: "Publicly and persistently arguing for a cause is \"advocate.\"",
            },
          },
          {
            word: "Sanction",
            fact: "\"Sanction\" (used this way) means to give official approval for an action. The league officially sanctioned the new tournament format.",
            quiz: {
              sentence: "The event couldn't move forward as an official competition until the governing body chose to ______ it.",
              options: ["Sanction", "Forbid", "Postpone", "Overlook"],
              correctIndex: 0,
              explanation: "Official approval needed before an event can proceed is \"sanction\" in this sense. Note: sanction can also mean to penalize — context determines which meaning applies, which is exactly the kind of trap the real test uses this word for.",
            },
          },
        ],
      },
      {
        id: "agreement-support-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Vindicate",
            fact: "\"Vindicate\" means to prove that a decision, belief, or person was right all along, especially after facing doubt. Years later, new evidence finally vindicated the scientist's rejected theory.",
            quiz: {
              sentence: "Dismissed as unrealistic for a decade, the engineer's original design was ultimately ______ when it outperformed every newer alternative.",
              options: ["Vindicated", "Corroborated", "Endorsed", "Substantiated"],
              correctIndex: 0,
              explanation: "\"Vindicated\" specifically implies proving something right after it was doubted or dismissed — the key clue is the decade of dismissal. \"Corroborated,\" \"endorsed,\" and \"substantiated\" all involve support but don't carry that same sense of overturning prior doubt.",
            },
          },
          {
            word: "Buttress",
            fact: "\"Buttress\" means to support or reinforce something, often an argument, by adding to it. She buttressed her thesis with three additional case studies.",
            quiz: {
              sentence: "The lawyer's opening argument was solid on its own, but she chose to ______ it further with testimony from two expert witnesses.",
              options: ["Buttress", "Concede", "Retract", "Summarize"],
              correctIndex: 0,
              explanation: "Adding testimony to strengthen an already-solid argument matches \"buttress,\" which implies reinforcing something further.",
            },
          },
          {
            word: "Attest",
            fact: "\"Attest\" means to bear witness that something is true, often based on personal experience. Colleagues who worked with her for years could attest to her honesty.",
            quiz: {
              sentence: "Few outside the lab believed the results were real, but everyone who had watched the experiment firsthand could ______ to its accuracy.",
              options: ["Attest", "Speculate", "Object", "Deliberate"],
              correctIndex: 0,
              explanation: "\"Attest\" specifically involves vouching for truth based on direct, firsthand experience, matching \"watched the experiment firsthand.\"",
            },
          },
          {
            word: "Espouse",
            fact: "\"Espouse\" means to adopt or publicly support a particular belief or cause. The philosopher espoused a view of ethics that few of his contemporaries shared.",
            quiz: {
              sentence: "Though it was unpopular among her peers at the time, the researcher openly ______ a theory that later became widely accepted.",
              options: ["Espoused", "Abandoned", "Doubted", "Dismissed"],
              correctIndex: 0,
              explanation: "\"Espoused\" means to openly adopt and support a belief; the other options describe rejecting or distancing from a belief instead.",
            },
          },
          {
            word: "Avow",
            fact: "\"Avow\" means to openly declare something, often a belief, without shame or hesitation. She avowed her support for the plan despite the criticism it drew.",
            quiz: {
              sentence: "Rather than hide her unpopular position, the senator chose to ______ it publicly at the press conference.",
              options: ["Avow", "Retract", "Obscure", "Downplay"],
              correctIndex: 0,
              explanation: "Openly declaring an unpopular position rather than hiding it is \"avow\"; the others involve concealing or backing away from it.",
            },
          },
          {
            word: "Extol",
            fact: "\"Extol\" means to praise something enthusiastically. Critics extolled the film's innovative use of sound.",
            quiz: {
              sentence: "In his review, the critic did more than simply approve of the novel — he ______ its ambition and craftsmanship.",
              options: ["Extolled", "Tolerated", "Overlooked", "Questioned"],
              correctIndex: 0,
              explanation: "Going beyond simple approval to enthusiastic praise is \"extolled\"; the others describe a weaker or more negative reaction.",
            },
          },
          {
            word: "Underscore",
            fact: "\"Underscore\" means to emphasize or give importance to a point, often with supporting evidence. The latest statistics underscore the urgency of the issue.",
            quiz: {
              sentence: "The final chart didn't introduce a new idea — it simply ______ the report's central point with additional numbers.",
              options: ["Underscored", "Contradicted", "Replaced", "Concealed"],
              correctIndex: 0,
              explanation: "Reinforcing an existing point with more evidence, without introducing something new, is \"underscored.\"",
            },
          },
          {
            word: "Reaffirm",
            fact: "\"Reaffirm\" means to state something again, firmly, especially to remove doubt. The company reaffirmed its commitment to the project after rumors of cancellation.",
            quiz: {
              sentence: "Facing growing rumors that the merger was off, both companies moved quickly to ______ their original agreement.",
              options: ["Reaffirm", "Renegotiate", "Deny", "Postpone"],
              correctIndex: 0,
              explanation: "Restating an original commitment to counter rumors is \"reaffirm\"; the others describe changing, denying, or delaying the agreement.",
            },
          },
          {
            word: "Testify",
            fact: "\"Testify\" means to give a formal statement, often under oath, affirming that something is true. Three witnesses testified that they saw the accident occur.",
            quiz: {
              sentence: "Called before the committee, the former employee agreed to ______ about what she had witnessed at the company.",
              options: ["Testify", "Recant", "Speculate", "Improvise"],
              correctIndex: 0,
              explanation: "Giving a formal statement about what was witnessed is \"testify\"; the others describe taking back a statement, guessing, or inventing details.",
            },
          },
          {
            word: "Fortify",
            fact: "\"Fortify\" means to strengthen something, especially to make it more resistant to challenge. She fortified her argument by addressing the strongest counterpoint directly.",
            quiz: {
              sentence: "Anticipating tough questions, the debater spent the morning working to ______ the weakest part of her argument.",
              options: ["Fortify", "Abandon", "Simplify", "Conceal"],
              correctIndex: 0,
              explanation: "Strengthening a weak point before facing challenge is \"fortify\"; the others describe giving up on it, oversimplifying it, or hiding it.",
            },
          },
        ],
      },
    ],
  },

  // --- Coming soon: content not yet written. Empty `levels` arrays make the
  // home screen show these as "Coming soon" rather than broken links. ---
  {
    id: "disagreement-refutation",
    title: "Disagreement & Refutation",
    description: "Words used to reject, challenge, or contradict a claim.",
    levels: [
      {
        id: "disagreement-refutation-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Disagree",
            fact: "\"Disagree\" means to have a different opinion from someone else. The two advisors disagreed about which route was safer.",
            quiz: {
              sentence: "Even after reviewing the same data, the two analysts continued to ______ about what it meant.",
              options: ["Disagree", "Agree", "Celebrate", "Sleep"],
              correctIndex: 0,
              explanation: "Continuing to hold different opinions after seeing the same data is \"disagree\"; the others don't fit an ongoing dispute.",
            },
          },
          {
            word: "Deny",
            fact: "\"Deny\" means to state that something is not true. The company denied any involvement in the leak.",
            quiz: {
              sentence: "Despite the photos circulating online, the senator continued to ______ that the meeting had ever taken place.",
              options: ["Deny", "Confirm", "Applaud", "Attend"],
              correctIndex: 0,
              explanation: "Insisting something didn't happen despite evidence is \"deny\"; the others describe accepting or praising it.",
            },
          },
          {
            word: "Reject",
            fact: "\"Reject\" means to refuse to accept, believe, or agree to something. The editor rejected the article after a quick read.",
            quiz: {
              sentence: "After reading only the first page, the publisher chose to ______ the manuscript outright.",
              options: ["Reject", "Publish", "Praise", "Copy"],
              correctIndex: 0,
              explanation: "Refusing the manuscript after barely reading it is \"reject\"; the others describe accepting or admiring it.",
            },
          },
          {
            word: "Oppose",
            fact: "\"Oppose\" means to disagree with a plan or idea, often actively working against it. Local residents opposed the new highway project.",
            quiz: {
              sentence: "Hundreds of residents showed up to the town hall meeting to publicly ______ the proposed factory.",
              options: ["Oppose", "Support", "Design", "Ignore"],
              correctIndex: 0,
              explanation: "Showing up to publicly resist a proposal is \"oppose\"; the others describe backing, creating, or disregarding it.",
            },
          },
          {
            word: "Refuse",
            fact: "\"Refuse\" means to indicate unwillingness to accept or do something. She refused to sign the agreement without changes.",
            quiz: {
              sentence: "Despite repeated requests, the witness continued to ______ to answer any questions about that night.",
              options: ["Refuse", "Agree", "Forget", "Hurry"],
              correctIndex: 0,
              explanation: "Repeatedly declining to answer despite requests is \"refuse\"; the others suggest cooperation or unrelated actions.",
            },
          },
          {
            word: "Object",
            fact: "\"Object\" means to express opposition to something, often formally. The lawyer objected to the question before the witness could answer.",
            quiz: {
              sentence: "The moment the new rule was announced, several employees stood up to ______.",
              options: ["Object", "Applaud", "Comply", "Nap"],
              correctIndex: 0,
              explanation: "Standing up in response to a new rule to voice disapproval is \"object\"; the others describe approval or unrelated behavior.",
            },
          },
          {
            word: "Contradict",
            fact: "\"Contradict\" means to say the opposite of what someone else has said, or to be inconsistent with it. The witness's new statement directly contradicted her earlier testimony.",
            quiz: {
              sentence: "The defense attorney pointed out that the second witness's account seemed to ______ everything the first witness had just said.",
              options: ["Contradict", "Confirm", "Repeat", "Ignore"],
              correctIndex: 0,
              explanation: "An account that says the opposite of an earlier one \"contradicts\" it; the others describe agreeing with or disregarding it.",
            },
          },
          {
            word: "Challenge",
            fact: "\"Challenge\" means to question whether a claim, decision, or authority is valid. The researcher challenged the study's methodology in a follow-up paper.",
            quiz: {
              sentence: "In her follow-up paper, the researcher chose to directly ______ the original study's conclusions.",
              options: ["Challenge", "Praise", "Repeat", "Fund"],
              correctIndex: 0,
              explanation: "Directly questioning a study's conclusions is \"challenge\"; the others describe endorsing or restating them.",
            },
          },
          {
            word: "Dispute",
            fact: "\"Dispute\" means to argue that something is not true or valid. Historians still dispute the exact cause of the empire's collapse.",
            quiz: {
              sentence: "Two economists took the stage to publicly ______ the report's central claim.",
              options: ["Dispute", "Repeat", "Publish", "Overlook"],
              correctIndex: 0,
              explanation: "Publicly arguing against a claim's validity is \"dispute\"; the others describe restating, releasing, or ignoring it.",
            },
          },
          {
            word: "Protest",
            fact: "\"Protest\" means to express strong objection to something, often publicly. Dozens of workers protested the sudden schedule change.",
            quiz: {
              sentence: "Hundreds of students gathered outside the building to ______ the tuition increase.",
              options: ["Protest", "Celebrate", "Announce", "Fund"],
              correctIndex: 0,
              explanation: "Gathering to express strong objection is \"protest\"; the others describe celebrating, announcing, or paying for something.",
            },
          },
          {
            word: "Decline",
            fact: "\"Decline\" means to politely refuse to accept or agree to something. The professor declined to endorse the paper's conclusions.",
            quiz: {
              sentence: "When asked to sign the letter of support, the scientist chose to ______, citing unanswered questions in the data.",
              options: ["Decline", "Agree", "Celebrate", "Forget"],
              correctIndex: 0,
              explanation: "Politely refusing to sign due to doubts is \"decline\"; the others describe agreeing or reacting unrelatedly.",
            },
          },
          {
            word: "Resist",
            fact: "\"Resist\" means to work against or refuse to go along with something. The committee resisted pressure to approve the plan early.",
            quiz: {
              sentence: "Despite mounting pressure from investors, the board continued to ______ the proposed merger.",
              options: ["Resist", "Welcome", "Announce", "Forget"],
              correctIndex: 0,
              explanation: "Continuing to work against a plan despite pressure is \"resist\"; the others describe welcoming or unrelated reactions.",
            },
          },
        ],
      },
      {
        id: "disagreement-refutation-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Refute",
            fact: "\"Refute\" means to prove that a statement or theory is wrong, usually with evidence. New fossil evidence refuted the earlier timeline.",
            quiz: {
              sentence: "The lab's new results didn't just complicate the old theory — they appeared to ______ it entirely.",
              options: ["Refute", "Delay", "Simplify", "Publicize"],
              correctIndex: 0,
              explanation: "Evidence that proves a theory wrong entirely is \"refute\"; the others describe postponing, simplifying, or publicizing it.",
            },
          },
          {
            word: "Contest",
            fact: "\"Contest\" means to formally challenge or dispute a decision or claim. The runner-up contested the results of the election.",
            quiz: {
              sentence: "Unwilling to accept the ruling, the losing team immediately moved to ______ it before the league's committee.",
              options: ["Contest", "Accept", "Broadcast", "Postpone"],
              correctIndex: 0,
              explanation: "Formally challenging a ruling instead of accepting it is \"contest\"; the others don't involve pushing back on the decision.",
            },
          },
          {
            word: "Rebut",
            fact: "\"Rebut\" means to offer an argument or evidence against a previous claim, typically in a debate. She rebutted each point of the opposing team's argument.",
            quiz: {
              sentence: "In her closing remarks, the lawyer methodically ______ every claim the prosecution had made.",
              options: ["Rebutted", "Repeated", "Praised", "Ignored"],
              correctIndex: 0,
              explanation: "Methodically arguing against each point in a debate is \"rebut\"; the others describe restating, praising, or disregarding them.",
            },
          },
          {
            word: "Counter",
            fact: "\"Counter\" means to respond to a claim or action with an opposing one. The company countered the lawsuit with its own set of claims.",
            quiz: {
              sentence: "Rather than concede the point, the debater chose to ______ with a statistic of her own.",
              options: ["Counter", "Concede", "Repeat", "Applaud"],
              correctIndex: 0,
              explanation: "Responding with an opposing point instead of conceding is \"counter\"; the others describe giving in or reacting differently.",
            },
          },
          {
            word: "Dismiss",
            fact: "\"Dismiss\" means to reject a claim as unworthy of serious consideration, often quickly. The board dismissed the proposal without much discussion.",
            quiz: {
              sentence: "The panel barely glanced at the new evidence before choosing to ______ it as irrelevant.",
              options: ["Dismiss", "Investigate", "Publish", "Fund"],
              correctIndex: 0,
              explanation: "Refusing to seriously consider evidence is \"dismiss\"; the others describe examining, releasing, or supporting it.",
            },
          },
          {
            word: "Discredit",
            fact: "\"Discredit\" means to harm the credibility of a person, claim, or source. The scandal discredited years of the scientist's earlier work.",
            quiz: {
              sentence: "Rival researchers worked for months trying to ______ the surprising results before they were finally replicated.",
              options: ["Discredit", "Celebrate", "Fund", "Simplify"],
              correctIndex: 0,
              explanation: "Trying to damage the credibility of a result is \"discredit\"; the others describe praising, funding, or simplifying it.",
            },
          },
          {
            word: "Repudiate",
            fact: "\"Repudiate\" means to formally reject a claim, belief, or agreement, often decisively. The council repudiated the earlier statement made in its name.",
            quiz: {
              sentence: "Once the extent of the fraud came to light, the organization moved quickly to ______ the report entirely.",
              options: ["Repudiate", "Publish", "Extend", "Praise"],
              correctIndex: 0,
              explanation: "Formally rejecting a report once fraud is discovered is \"repudiate\"; the others describe releasing, expanding, or endorsing it.",
            },
          },
          {
            word: "Undermine",
            fact: "\"Undermine\" means to gradually weaken something, such as an argument, authority, or confidence. Each new detail undermined the suspect's alibi a little more.",
            quiz: {
              sentence: "One by one, the inconsistencies in his story began to ______ his credibility.",
              options: ["Undermine", "Restore", "Publicize", "Simplify"],
              correctIndex: 0,
              explanation: "Inconsistencies gradually weakening credibility is \"undermine\"; the others describe strengthening, publicizing, or simplifying it.",
            },
          },
          {
            word: "Debunk",
            fact: "\"Debunk\" means to expose a widely held belief or claim as false. The documentary set out to debunk several popular myths about sleep.",
            quiz: {
              sentence: "The physicist spent an entire lecture working to ______ a theory that had circulated online for years.",
              options: ["Debunk", "Popularize", "Fund", "Summarize"],
              correctIndex: 0,
              explanation: "Exposing a long-circulating theory as false is \"debunk\"; the others describe spreading, funding, or condensing it.",
            },
          },
          {
            word: "Dissent",
            fact: "\"Dissent\" means to disagree with an official or widely held position, especially within a group. One judge dissented from the court's majority opinion.",
            quiz: {
              sentence: "While the rest of the board approved the merger, one member chose to formally ______.",
              options: ["Dissent", "Comply", "Abstain", "Applaud"],
              correctIndex: 0,
              explanation: "Formally disagreeing with the majority decision is \"dissent\"; \"abstain\" means declining to vote at all rather than opposing it, and the others describe agreeing or approving.",
            },
          },
          {
            word: "Negate",
            fact: "\"Negate\" means to nullify or invalidate something, such as an argument or effect. A single flawed assumption negated the entire proof.",
            quiz: {
              sentence: "Reviewers found that one overlooked variable was enough to ______ the study's central conclusion.",
              options: ["Negate", "Strengthen", "Publish", "Summarize"],
              correctIndex: 0,
              explanation: "A flaw that invalidates a conclusion \"negates\" it; the others describe reinforcing, releasing, or condensing it.",
            },
          },
          {
            word: "Retort",
            fact: "\"Retort\" means to reply quickly and sharply, typically in a way that disagrees with what was just said. \"That's not what happened,\" she retorted.",
            quiz: {
              sentence: "Accused of exaggerating, the columnist ______ that every detail in the piece had been fact-checked twice.",
              options: ["Retorted", "Whispered", "Agreed", "Apologized"],
              correctIndex: 0,
              explanation: "A sharp reply pushing back against an accusation is \"retort\"; the others describe quiet, agreeable, or apologetic responses.",
            },
          },
        ],
      },
      {
        id: "disagreement-refutation-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Impugn",
            fact: "\"Impugn\" means to challenge or attack the truthfulness or integrity of a person or claim, often indirectly. The senator accused his rival of trying to impugn his motives rather than address the policy itself.",
            quiz: {
              sentence: "Rather than address the data directly, the critic chose to ______ the scientist's motives for publishing it.",
              options: ["Impugn", "Refute", "Dismiss", "Contest"],
              correctIndex: 0,
              explanation: "\"Impugn\" specifically targets a person's motives or integrity rather than the claim's facts, matching \"motives\" here. \"Refute,\" \"dismiss,\" and \"contest\" all attack the claim itself, not the person behind it.",
            },
          },
          {
            word: "Rebuff",
            fact: "\"Rebuff\" means to reject a suggestion or offer in an abrupt, often unfriendly way. The startup's initial pitch was rebuffed by every investor in the room.",
            quiz: {
              sentence: "Instead of considering the merger calmly, the CEO ______ the offer within minutes of hearing it.",
              options: ["Rebuffed", "Refuted", "Discredited", "Contested"],
              correctIndex: 0,
              explanation: "\"Rebuff\" describes an abrupt, dismissive rejection of an offer, matching \"within minutes.\" \"Refuted,\" \"discredited,\" and \"contested\" all imply engaging with the substance of a claim rather than briskly turning down an offer.",
            },
          },
          {
            word: "Gainsay",
            fact: "\"Gainsay\" means to deny or contradict a statement or fact, often used to describe something so clearly true it can't reasonably be denied. Her record of results was hard to gainsay.",
            quiz: {
              sentence: "Whatever critics thought of her methods, the sheer number of championships she'd won was difficult to ______.",
              options: ["Gainsay", "Applaud", "Publicize", "Emulate"],
              correctIndex: 0,
              explanation: "\"Gainsay\" means to deny or dispute, fitting a fact that's hard to argue against; the others describe praising, publicizing, or imitating it rather than disputing it.",
            },
          },
          {
            word: "Controvert",
            fact: "\"Controvert\" means to argue against or deny the truth of a statement. The lawyer failed to controvert a single fact presented by the opposing side.",
            quiz: {
              sentence: "Despite hours of cross-examination, the defense was unable to ______ any part of the witness's account.",
              options: ["Controvert", "Corroborate", "Recite", "Transcribe"],
              correctIndex: 0,
              explanation: "Failing to successfully argue against an account is failing to \"controvert\" it; \"corroborate\" means the opposite — to support it — while the others describe repeating or writing it down.",
            },
          },
          {
            word: "Disavow",
            fact: "\"Disavow\" means to deny responsibility for or connection with something, often to distance oneself from it. The organization quickly disavowed the statement made in its name.",
            quiz: {
              sentence: "As soon as the email became public, the executive rushed to ______ any connection to it.",
              options: ["Disavow", "Substantiate", "Elaborate on", "Reiterate"],
              correctIndex: 0,
              explanation: "Denying any connection to something is \"disavow\"; \"substantiate\" means to support with evidence, and \"reiterate\" means to repeat — neither fits denying involvement.",
            },
          },
          {
            word: "Discount",
            fact: "\"Discount\" (used this way) means to dismiss a possibility as unlikely or unimportant. Investigators initially discounted the theory before new evidence forced them to reconsider.",
            quiz: {
              sentence: "Early in the investigation, detectives largely ______ the possibility that the two crimes were connected.",
              options: ["Discounted", "Corroborated", "Investigated", "Documented"],
              correctIndex: 0,
              explanation: "Treating a possibility as unlikely and setting it aside is \"discount\"; the others describe confirming, actively pursuing, or recording it — the opposite of dismissing it.",
            },
          },
          {
            word: "Confute",
            fact: "\"Confute\" means to prove someone or their argument wrong, typically through decisive evidence or logic. The professor's counterexample confuted the student's proof in a single line.",
            quiz: {
              sentence: "The rebuttal didn't just weaken the opposing argument — a single counterexample was enough to ______ it completely.",
              options: ["Confute", "Paraphrase", "Popularize", "Footnote"],
              correctIndex: 0,
              explanation: "Decisively proving an argument wrong is \"confute\"; the others describe restating, spreading, or citing it, not disproving it.",
            },
          },
          {
            word: "Remonstrate",
            fact: "\"Remonstrate\" means to protest or argue forcefully against a plan or decision, typically to try to change it. Employees remonstrated with management over the abrupt policy change.",
            quiz: {
              sentence: "Furious about the last-minute schedule change, several parents showed up to ______ with the school board directly.",
              options: ["Remonstrate", "Negotiate", "Correspond", "Deliberate"],
              correctIndex: 0,
              explanation: "\"Remonstrate\" implies a forceful, protesting objection, matching \"furious\"; \"negotiate,\" \"correspond,\" and \"deliberate\" describe calmer, more neutral forms of discussion.",
            },
          },
          {
            word: "Recant",
            fact: "\"Recant\" means to formally withdraw or disavow a statement or belief one previously held, often under pressure. Facing new evidence, the witness recanted his earlier testimony.",
            quiz: {
              sentence: "Confronted with the security footage, the suspect had no choice but to ______ his earlier alibi.",
              options: ["Recant", "Corroborate", "Elaborate on", "Transcribe"],
              correctIndex: 0,
              explanation: "\"Recant\" specifically means withdrawing one's own earlier claim, matching \"his earlier alibi\"; the others describe supporting, expanding on, or writing down a claim rather than taking it back.",
            },
          },
          {
            word: "Deprecate",
            fact: "\"Deprecate\" means to express disapproval of or belittle something, often a plan, practice, or piece of work. The senior engineer deprecated the old system in his review, urging the team to replace it.",
            quiz: {
              sentence: "In his review of the proposal, the senior architect ______ the outdated approach in favor of a more modern one.",
              options: ["Deprecated", "Elaborated on", "Documented", "Illustrated"],
              correctIndex: 0,
              explanation: "Expressing disapproval of an outdated approach is \"deprecate\"; the others describe neutrally explaining or documenting it rather than criticizing it.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "degree-intensity",
    title: "Degree & Intensity",
    description: "Words that signal how strong, mild, or extreme something is.",
    levels: [
      {
        id: "degree-intensity-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Increase",
            fact: "\"Increase\" means to become or make greater in size, amount, or degree. The store increased its prices at the start of the year.",
            quiz: {
              sentence: "To meet rising demand, the factory decided to ______ production by twenty percent.",
              options: ["Increase", "Decrease", "Photograph", "Ignore"],
              correctIndex: 0,
              explanation: "Meeting rising demand requires making more, which is \"increase\"; the others describe reducing production or an unrelated action.",
            },
          },
          {
            word: "Decrease",
            fact: "\"Decrease\" means to become or make smaller in size, amount, or degree. Sales decreased sharply after the holiday season ended.",
            quiz: {
              sentence: "As fewer people commuted downtown, traffic began to ______ noticeably during rush hour.",
              options: ["Decrease", "Increase", "Celebrate", "Photograph"],
              correctIndex: 0,
              explanation: "Fewer commuters causing traffic to get lighter is \"decrease\"; the others describe growth or an unrelated action.",
            },
          },
          {
            word: "Intensify",
            fact: "\"Intensify\" means to become or make more extreme or forceful. The storm intensified overnight, gaining strength before it hit land.",
            quiz: {
              sentence: "As the deadline approached, the pressure on the team began to ______.",
              options: ["Intensify", "Vanish", "Relax", "Pause"],
              correctIndex: 0,
              explanation: "Pressure building as a deadline nears is \"intensify\"; the others describe the pressure disappearing or easing.",
            },
          },
          {
            word: "Reduce",
            fact: "\"Reduce\" means to make something smaller in size, amount, or degree. The airline reduced the number of flights during the off-season.",
            quiz: {
              sentence: "To cut costs, the company decided to ______ its office space by half.",
              options: ["Reduce", "Expand", "Celebrate", "Photograph"],
              correctIndex: 0,
              explanation: "Cutting costs by making space smaller is \"reduce\"; the others describe growing the space or an unrelated action.",
            },
          },
          {
            word: "Extreme",
            fact: "\"Extreme\" means very great in degree, far beyond what is usual. The desert is known for its extreme temperatures, scorching by day and freezing by night.",
            quiz: {
              sentence: "Hikers were warned to prepare for ______ heat, with temperatures expected to reach record highs.",
              options: ["Extreme", "Mild", "Moderate", "Typical"],
              correctIndex: 0,
              explanation: "Record-high temperatures signal \"extreme\" heat; \"mild,\" \"moderate,\" and \"typical\" all describe ordinary or gentle conditions, the opposite of the warning.",
            },
          },
          {
            word: "Severe",
            fact: "\"Severe\" means very great, serious, or harsh in degree. The region suffered a severe drought that lasted nearly two years.",
            quiz: {
              sentence: "Doctors described the patient's condition as ______, requiring immediate surgery.",
              options: ["Severe", "Mild", "Minor", "Ordinary"],
              correctIndex: 0,
              explanation: "A condition requiring immediate surgery is \"severe\"; \"mild,\" \"minor,\" and \"ordinary\" all describe conditions unlikely to need urgent treatment.",
            },
          },
          {
            word: "Mild",
            fact: "\"Mild\" means not severe, harsh, or extreme; gentle in degree. The winter was unusually mild, with almost no snow.",
            quiz: {
              sentence: "The critic noted that, compared to her usual scathing reviews, this one seemed surprisingly ______.",
              options: ["Mild", "Severe", "Extreme", "Harsh"],
              correctIndex: 0,
              explanation: "Something gentler than a usually scathing review is \"mild\"; \"severe,\" \"extreme,\" and \"harsh\" all describe intensified, not softened, criticism.",
            },
          },
          {
            word: "Slight",
            fact: "\"Slight\" means small in degree or amount. There was only a slight improvement in the test scores this year.",
            quiz: {
              sentence: "The doctor noted only a ______ increase in the patient's blood pressure, nothing to worry about.",
              options: ["Slight", "Massive", "Dramatic", "Severe"],
              correctIndex: 0,
              explanation: "\"Nothing to worry about\" signals a small change, matching \"slight\"; the others describe large or alarming changes.",
            },
          },
          {
            word: "Massive",
            fact: "\"Massive\" means very large in size, extent, or degree. The company posted a massive loss in its first quarter.",
            quiz: {
              sentence: "The merger created a ______ corporation with offices in over sixty countries.",
              options: ["Massive", "Tiny", "Modest", "Slight"],
              correctIndex: 0,
              explanation: "A corporation spanning over sixty countries is \"massive\"; the others describe something small.",
            },
          },
          {
            word: "Minor",
            fact: "\"Minor\" means not very important, serious, or significant. The car needed only a minor repair after the accident.",
            quiz: {
              sentence: "Aside from a few ______ typos, the report was ready to publish.",
              options: ["Minor", "Major", "Severe", "Critical"],
              correctIndex: 0,
              explanation: "Typos that don't stop a report from being ready are \"minor\"; the others describe serious problems that would need fixing first.",
            },
          },
          {
            word: "Major",
            fact: "\"Major\" means important or significant, great in degree. The discovery marked a major breakthrough in cancer research.",
            quiz: {
              sentence: "The new policy represented a ______ shift from the company's previous approach.",
              options: ["Major", "Minor", "Slight", "Trivial"],
              correctIndex: 0,
              explanation: "A significant shift in approach is \"major\"; the others describe small or unimportant changes.",
            },
          },
          {
            word: "Enormous",
            fact: "\"Enormous\" means extremely large in size or degree. The project required an enormous amount of planning.",
            quiz: {
              sentence: "Rebuilding the city after the flood was an ______ undertaking that took nearly a decade.",
              options: ["Enormous", "Minor", "Modest", "Slight"],
              correctIndex: 0,
              explanation: "A rebuilding effort taking nearly a decade is \"enormous\"; the others describe something small or easy.",
            },
          },
        ],
      },
      {
        id: "degree-intensity-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Escalate",
            fact: "\"Escalate\" means to increase rapidly or become more serious. Tensions between the two countries escalated after the border incident.",
            quiz: {
              sentence: "What began as a minor disagreement quickly began to ______ into a full-blown argument.",
              options: ["Escalate", "Subside", "Vanish", "Pause"],
              correctIndex: 0,
              explanation: "A disagreement rapidly growing more serious is \"escalate\"; the others describe it fading or stopping.",
            },
          },
          {
            word: "Diminish",
            fact: "\"Diminish\" means to become or make less in size, strength, or importance. His influence within the company diminished after the merger.",
            quiz: {
              sentence: "As the years passed, public interest in the scandal gradually began to ______.",
              options: ["Diminish", "Escalate", "Multiply", "Intensify"],
              correctIndex: 0,
              explanation: "Interest fading over time is \"diminish\"; the others describe interest growing instead.",
            },
          },
          {
            word: "Amplify",
            fact: "\"Amplify\" means to increase the strength, volume, or intensity of something. Social media amplified the story far beyond the local community.",
            quiz: {
              sentence: "The microphone was there to ______ her voice so the back rows could hear.",
              options: ["Amplify", "Muffle", "Silence", "Diminish"],
              correctIndex: 0,
              explanation: "A microphone that helps a voice reach farther is meant to \"amplify\" it; the others describe making it quieter or weaker.",
            },
          },
          {
            word: "Moderate",
            fact: "\"Moderate\" (used as a verb) means to make something less extreme or intense. The mediator worked to moderate the tone of the negotiations.",
            quiz: {
              sentence: "Organizers brought in an experienced facilitator to ______ the increasingly heated debate.",
              options: ["Moderate", "Escalate", "Intensify", "Provoke"],
              correctIndex: 0,
              explanation: "Bringing someone in to calm a heated debate is to \"moderate\" it; the others describe making it more intense.",
            },
          },
          {
            word: "Exaggerate",
            fact: "\"Exaggerate\" means to represent something as larger, better, or worse than it really is. The advertisement exaggerated the product's benefits.",
            quiz: {
              sentence: "Reviewers accused the memoir of tending to ______ certain events for dramatic effect.",
              options: ["Exaggerate", "Understate", "Document", "Verify"],
              correctIndex: 0,
              explanation: "Making events seem bigger than they were for effect is \"exaggerate\"; the others describe understating or accurately recording them.",
            },
          },
          {
            word: "Minimize",
            fact: "\"Minimize\" means to reduce something to the smallest possible amount or degree. The company tried to minimize the damage from the recall.",
            quiz: {
              sentence: "The team worked overtime to ______ the impact of the delay on the launch date.",
              options: ["Minimize", "Maximize", "Publicize", "Celebrate"],
              correctIndex: 0,
              explanation: "Working to reduce the impact of a delay is \"minimize\"; the others describe increasing or drawing attention to it.",
            },
          },
          {
            word: "Substantial",
            fact: "\"Substantial\" means large or important in size, degree, or amount. The company reported a substantial increase in profits this year.",
            quiz: {
              sentence: "The new policy is expected to have a ______ effect on the local economy, not a negligible one.",
              options: ["Substantial", "Negligible", "Trivial", "Minor"],
              correctIndex: 0,
              explanation: "The sentence explicitly contrasts with \"negligible,\" so the correct word must mean the opposite — significant — matching \"substantial.\"",
            },
          },
          {
            word: "Considerable",
            fact: "\"Considerable\" means notably large in size, amount, or extent. Renovating the old theater required a considerable amount of money.",
            quiz: {
              sentence: "The new bridge design required ______ changes to the original engineering plans.",
              options: ["Considerable", "Negligible", "Minimal", "Trivial"],
              correctIndex: 0,
              explanation: "Requiring notably large changes is \"considerable\"; the others describe barely any changes at all.",
            },
          },
          {
            word: "Negligible",
            fact: "\"Negligible\" means so small or unimportant that it is not worth considering. The difference in performance between the two engines was negligible.",
            quiz: {
              sentence: "After the upgrade, testers reported only a ______ improvement in battery life — barely enough to notice.",
              options: ["Negligible", "Substantial", "Dramatic", "Considerable"],
              correctIndex: 0,
              explanation: "\"Barely enough to notice\" signals a tiny amount, matching \"negligible\"; the others describe a large, noticeable change.",
            },
          },
          {
            word: "Drastic",
            fact: "\"Drastic\" means extreme or severe, especially describing an action taken to solve a problem. The company took drastic measures to avoid bankruptcy.",
            quiz: {
              sentence: "Facing a shrinking budget, the school board considered ______ cuts to nearly every department.",
              options: ["Drastic", "Modest", "Minor", "Negligible"],
              correctIndex: 0,
              explanation: "Cuts to nearly every department are \"drastic\"; the others describe small, limited cuts.",
            },
          },
          {
            word: "Excessive",
            fact: "\"Excessive\" means more than what is necessary, normal, or desirable. The report criticized the agency for excessive spending.",
            quiz: {
              sentence: "Critics argued that the fine was ______, far more than the violation deserved.",
              options: ["Excessive", "Reasonable", "Modest", "Fair"],
              correctIndex: 0,
              explanation: "A fine described as \"far more than deserved\" is \"excessive\"; the others describe an appropriately sized penalty.",
            },
          },
          {
            word: "Subtle",
            fact: "\"Subtle\" means so slight or delicate that it is not immediately obvious. There was a subtle shift in her tone that only close friends would notice.",
            quiz: {
              sentence: "Only longtime fans could detect the ______ changes the band had made to their sound.",
              options: ["Subtle", "Drastic", "Obvious", "Massive"],
              correctIndex: 0,
              explanation: "Changes only longtime fans could detect are \"subtle\"; the others describe changes that would be immediately obvious to anyone.",
            },
          },
        ],
      },
      {
        id: "degree-intensity-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Exacerbate",
            fact: "\"Exacerbate\" means to make a problem, injury, or bad situation worse. Skipping physical therapy only exacerbated his knee injury.",
            quiz: {
              sentence: "Economists warned that the new tariffs would ______ an already fragile supply chain, not stabilize it.",
              options: ["Exacerbate", "Mitigate", "Stabilize", "Alleviate"],
              correctIndex: 0,
              explanation: "The sentence explicitly contrasts with \"stabilize,\" so the word must mean the opposite — making things worse — matching \"exacerbate.\" \"Mitigate\" and \"alleviate\" both mean to ease a problem, the reverse of what's described.",
            },
          },
          {
            word: "Mitigate",
            fact: "\"Mitigate\" means to make a problem or its effects less severe, often through preventive action taken in advance. The levees were built to mitigate flood damage during storm season.",
            quiz: {
              sentence: "The new building codes were designed to ______ the risk of structural damage before the next earthquake ever hits, not just respond after one.",
              options: ["Mitigate", "Alleviate", "Ignore", "Publicize"],
              correctIndex: 0,
              explanation: "\"Mitigate\" fits proactive, structural risk reduction taken before a problem occurs, matching \"before... ever hits\"; \"alleviate\" specifically implies easing suffering that already exists, which doesn't fit a preventive measure.",
            },
          },
          {
            word: "Alleviate",
            fact: "\"Alleviate\" means to make existing suffering, pain, or a problem less severe, often temporarily. The medication alleviated her symptoms within an hour.",
            quiz: {
              sentence: "The medication couldn't cure the underlying illness, but it did ______ the patient's pain enough for her to sleep through the night.",
              options: ["Alleviate", "Mitigate", "Cause", "Diagnose"],
              correctIndex: 0,
              explanation: "\"Alleviate\" fits easing suffering that already exists, matching \"couldn't cure... but did\"; \"mitigate\" more often describes reducing a future risk rather than easing pain that's already present.",
            },
          },
          {
            word: "Magnify",
            fact: "\"Magnify\" means to make something appear larger or more significant than it is, or to increase its intensity. Under stress, small annoyances can feel magnified into major problems.",
            quiz: {
              sentence: "Being alone with her thoughts all weekend seemed to ______ every small worry into a full-blown fear.",
              options: ["Magnify", "Minimize", "Resolve", "Clarify"],
              correctIndex: 0,
              explanation: "Turning small worries into full-blown fears is \"magnify\"; the others describe shrinking, solving, or explaining the worry, not inflating it.",
            },
          },
          {
            word: "Attenuate",
            fact: "\"Attenuate\" means to reduce the force, effect, or value of something; to weaken. Thick cloud cover attenuated the signal enough to disrupt the broadcast.",
            quiz: {
              sentence: "By the time the sound waves reached the back of the auditorium, the thick curtains had ______ them almost to silence.",
              options: ["Attenuated", "Amplified", "Recorded", "Transmitted"],
              correctIndex: 0,
              explanation: "Curtains reducing sound almost to silence is \"attenuate\"; the others describe strengthening, recording, or sending the sound, not weakening it.",
            },
          },
          {
            word: "Augment",
            fact: "\"Augment\" means to make something greater by adding to it. The team augmented its defense by signing two new players.",
            quiz: {
              sentence: "To handle the holiday rush, the store decided to ______ its regular staff with seasonal hires.",
              options: ["Augment", "Diminish", "Replace", "Dismiss"],
              correctIndex: 0,
              explanation: "Adding seasonal hires on top of regular staff is \"augment\"; the others describe reducing, swapping out, or firing staff instead of adding to them.",
            },
          },
          {
            word: "Wane",
            fact: "\"Wane\" means to gradually decrease in strength, intensity, or extent. Public enthusiasm for the project waned as delays piled up.",
            quiz: {
              sentence: "As the novelty of the new app wore off, daily downloads began to ______.",
              options: ["Wane", "Wax", "Surge", "Multiply"],
              correctIndex: 0,
              explanation: "\"Wane\" means to gradually decrease, matching \"wore off\"; \"wax\" is its true opposite — to gradually increase — and the others describe sudden growth rather than gradual decline.",
            },
          },
          {
            word: "Pronounced",
            fact: "\"Pronounced\" means very noticeable or marked in degree. There was a pronounced difference in quality between the two versions.",
            quiz: {
              sentence: "The accent grew more ______ whenever she spoke with her grandmother, far more noticeable than in everyday conversation.",
              options: ["Pronounced", "Subtle", "Faint", "Negligible"],
              correctIndex: 0,
              explanation: "\"Far more noticeable\" signals something \"pronounced\"; the others describe something barely detectable, the opposite effect.",
            },
          },
          {
            word: "Marginal",
            fact: "\"Marginal\" means minimal in degree or barely significant enough to matter. The new update offered only a marginal improvement in speed.",
            quiz: {
              sentence: "Analysts described the change in approval ratings as ______ — a single point, well within the margin of error.",
              options: ["Marginal", "Substantial", "Dramatic", "Pronounced"],
              correctIndex: 0,
              explanation: "A single point within the margin of error is \"marginal\"; the others describe a large, meaningful shift.",
            },
          },
          {
            word: "Profound",
            fact: "\"Profound\" means very great or intense in degree, often describing an effect or feeling. The loss had a profound effect on the entire community.",
            quiz: {
              sentence: "The mentor's advice had a ______ impact on her career, one she still credits decades later.",
              options: ["Profound", "Negligible", "Marginal", "Superficial"],
              correctIndex: 0,
              explanation: "An impact still credited decades later is \"profound\"; the others describe an impact too small or shallow to leave a lasting mark.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "change-consequence",
    title: "Change & Consequence",
    description: "Words describing how and why things shift or resolve.",
    levels: [
      {
        id: "change-consequence-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Cause",
            fact: "\"Cause\" means to make something happen. Heavy rain caused the river to flood.",
            quiz: {
              sentence: "Investigators determined that a faulty wire had ______ the fire.",
              options: ["Caused", "Prevented", "Solved", "Ignored"],
              correctIndex: 0,
              explanation: "A faulty wire making a fire happen is \"caused\"; the others describe stopping, fixing, or disregarding it.",
            },
          },
          {
            word: "Result",
            fact: "\"Result\" (used as \"result in\") means to happen as an effect of something else. The new policy resulted in a sharp drop in complaints.",
            quiz: {
              sentence: "The delayed shipment ______ in dozens of frustrated customer calls.",
              options: ["Resulted", "Prevented", "Solved", "Avoided"],
              correctIndex: 0,
              explanation: "A delay leading to customer calls as its effect is \"resulted\" in; the others describe stopping or avoiding that outcome.",
            },
          },
          {
            word: "Create",
            fact: "\"Create\" means to cause something new to exist. The new law created several unexpected loopholes.",
            quiz: {
              sentence: "The merger ______ a single company twice the size of either original business.",
              options: ["Created", "Destroyed", "Prevented", "Ignored"],
              correctIndex: 0,
              explanation: "Forming something new that didn't exist before is \"create\"; the others describe eliminating or disregarding it.",
            },
          },
          {
            word: "Produce",
            fact: "\"Produce\" means to bring about a particular result or effect. The experiment produced results no one expected.",
            quiz: {
              sentence: "The new fertilizer ______ noticeably larger crops within a single growing season.",
              options: ["Produced", "Prevented", "Delayed", "Reduced"],
              correctIndex: 0,
              explanation: "Bringing about larger crops as a result is \"produce\"; the others describe stopping, postponing, or shrinking the crops.",
            },
          },
          {
            word: "Change",
            fact: "\"Change\" means to become or make something different. Her opinion changed after she heard the full story.",
            quiz: {
              sentence: "Hearing the whole story completely ______ his opinion of what had happened.",
              options: ["Changed", "Preserved", "Repeated", "Ignored"],
              correctIndex: 0,
              explanation: "An opinion becoming different after new information is \"changed\"; the others describe keeping it the same or disregarding it.",
            },
          },
          {
            word: "Transform",
            fact: "\"Transform\" means to change dramatically in form, appearance, or nature. The renovation transformed the abandoned warehouse into a bright, modern office.",
            quiz: {
              sentence: "Over a decade, the sleepy fishing village was ______ into a bustling tourist destination.",
              options: ["Transformed", "Preserved", "Abandoned", "Photographed"],
              correctIndex: 0,
              explanation: "A dramatic shift from one kind of place to a completely different one is \"transformed\"; the others describe keeping it the same, leaving it, or just recording it.",
            },
          },
          {
            word: "Improve",
            fact: "\"Improve\" means to become or make something better. Her grades improved after she started studying earlier.",
            quiz: {
              sentence: "The team's communication ______ noticeably once they started having daily check-ins.",
              options: ["Improved", "Worsened", "Stopped", "Vanished"],
              correctIndex: 0,
              explanation: "Communication getting better after a change is \"improve\"; the others describe it getting worse or disappearing.",
            },
          },
          {
            word: "Worsen",
            fact: "\"Worsen\" means to become or make something more severe or bad. The traffic worsened as more construction began downtown.",
            quiz: {
              sentence: "Instead of easing the shortage, the new regulation actually ______ it.",
              options: ["Worsened", "Solved", "Prevented", "Fixed"],
              correctIndex: 0,
              explanation: "A regulation making a problem more severe instead of easing it is \"worsened\"; the others describe fixing or preventing the problem, the opposite outcome.",
            },
          },
          {
            word: "Fix",
            fact: "\"Fix\" means to repair or correct a problem. The technician fixed the printer in under ten minutes.",
            quiz: {
              sentence: "A single line of code was enough to ______ the bug that had crashed the app for days.",
              options: ["Fix", "Cause", "Ignore", "Hide"],
              correctIndex: 0,
              explanation: "Correcting the bug that caused crashes is \"fix\"; the others describe creating, ignoring, or concealing the problem instead.",
            },
          },
          {
            word: "Solve",
            fact: "\"Solve\" means to find an answer to a problem. The mechanic finally solved the mystery of the strange engine noise.",
            quiz: {
              sentence: "It took the team three weeks to ______ the puzzle that had stumped everyone else.",
              options: ["Solve", "Create", "Ignore", "Worsen"],
              correctIndex: 0,
              explanation: "Finding an answer to a puzzle is \"solve\"; the others describe making the puzzle, disregarding it, or making it more difficult.",
            },
          },
          {
            word: "Prevent",
            fact: "\"Prevent\" means to stop something from happening. Regular maintenance prevented the machine from breaking down.",
            quiz: {
              sentence: "The new vaccine was designed to ______ the disease from spreading further.",
              options: ["Prevent", "Cause", "Encourage", "Ignore"],
              correctIndex: 0,
              explanation: "Stopping a disease from spreading is \"prevent\"; the others describe causing, promoting, or disregarding the spread.",
            },
          },
          {
            word: "Trigger",
            fact: "\"Trigger\" means to cause something to start happening, often suddenly. A single spark triggered the massive wildfire.",
            quiz: {
              sentence: "The unexpected announcement ______ a wave of panic selling on the stock market.",
              options: ["Triggered", "Prevented", "Delayed", "Calmed"],
              correctIndex: 0,
              explanation: "An announcement causing a sudden wave of selling to start is \"trigger\"; the others describe stopping, postponing, or soothing that reaction.",
            },
          },
        ],
      },
      {
        id: "change-consequence-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Stem",
            fact: "\"Stem\" (used as \"stem from\") means to originate or result from a particular cause. Her fear of dogs stemmed from a bad experience as a child.",
            quiz: {
              sentence: "Much of the team's recent success seems to ______ from a change in leadership last year.",
              options: ["Stem", "Prevent", "Conclude", "Vanish"],
              correctIndex: 0,
              explanation: "Success originating from an earlier cause is \"stem\" from; the others don't describe tracing an effect back to its source.",
            },
          },
          {
            word: "Derive",
            fact: "\"Derive\" means to obtain or trace something from a particular source. Many English words derive from Latin roots.",
            quiz: {
              sentence: "Researchers were able to ______ the new material's strength from its unusual molecular structure.",
              options: ["Derive", "Prevent", "Discard", "Interrupt"],
              correctIndex: 0,
              explanation: "Tracing a property back to its source is \"derive\"; the others describe stopping, discarding, or interrupting rather than tracing an origin.",
            },
          },
          {
            word: "Prompt",
            fact: "\"Prompt\" means to cause something to happen or be done, often by inspiring or encouraging it. The customer complaints prompted a full review of the return policy.",
            quiz: {
              sentence: "The surprising test results ______ scientists to redesign the entire experiment.",
              options: ["Prompted", "Discouraged", "Delayed", "Concluded"],
              correctIndex: 0,
              explanation: "Results causing scientists to take a new action is \"prompted\"; the others describe discouraging, postponing, or ending that action.",
            },
          },
          {
            word: "Spur",
            fact: "\"Spur\" means to encourage or cause an increase in activity or development. Falling prices spurred a wave of new investment.",
            quiz: {
              sentence: "The threat of new competition ______ the company to finally modernize its factories.",
              options: ["Spurred", "Discouraged", "Delayed", "Prevented"],
              correctIndex: 0,
              explanation: "A threat pushing a company to act is \"spurred\"; the others describe holding the company back instead of pushing it forward.",
            },
          },
          {
            word: "Yield",
            fact: "\"Yield\" means to produce or result in a particular outcome. Years of research finally yielded a breakthrough treatment.",
            quiz: {
              sentence: "Months of careful negotiation eventually ______ a compromise both sides could accept.",
              options: ["Yielded", "Prevented", "Delayed", "Erased"],
              correctIndex: 0,
              explanation: "Negotiation producing a compromise as its outcome is \"yielded\"; the others describe blocking, postponing, or removing that outcome.",
            },
          },
          {
            word: "Culminate",
            fact: "\"Culminate\" (used as \"culminate in\") means to reach a final, climactic result after a series of events. Months of tension culminated in a heated public debate.",
            quiz: {
              sentence: "Years of quiet research finally ______ in a discovery that changed the field overnight.",
              options: ["Culminated", "Began", "Paused", "Vanished"],
              correctIndex: 0,
              explanation: "A long process reaching its climactic final result is \"culminate\"; the others describe starting, pausing, or disappearing rather than concluding.",
            },
          },
          {
            word: "Resolve",
            fact: "\"Resolve\" means to find a satisfactory solution to a problem or conflict. The two neighbors finally resolved their dispute over the fence.",
            quiz: {
              sentence: "After months of back-and-forth, the two companies finally ______ their disagreement over the contract.",
              options: ["Resolved", "Escalated", "Ignored", "Prolonged"],
              correctIndex: 0,
              explanation: "Reaching a satisfactory end to a disagreement is \"resolved\"; the others describe making it worse, disregarding it, or dragging it out.",
            },
          },
          {
            word: "Restore",
            fact: "\"Restore\" means to bring something back to its original or a better condition. The museum spent years restoring the damaged painting.",
            quiz: {
              sentence: "Engineers worked through the night to ______ power to the hospital after the storm.",
              options: ["Restore", "Interrupt", "Damage", "Delay"],
              correctIndex: 0,
              explanation: "Bringing power back after it was lost is \"restore\"; the others describe cutting it off, harming it, or postponing its return.",
            },
          },
          {
            word: "Revert",
            fact: "\"Revert\" means to return to a previous state or condition. Once the experiment ended, the readings reverted to normal.",
            quiz: {
              sentence: "As soon as the new manager left, the team quietly ______ to its old, inefficient habits.",
              options: ["Reverted", "Advanced", "Improved", "Evolved"],
              correctIndex: 0,
              explanation: "Going back to old habits after a change ends is \"reverted\"; the others describe moving forward or improving instead of going back.",
            },
          },
          {
            word: "Persist",
            fact: "\"Persist\" means to continue to exist or happen despite difficulty or opposition. The rumors persisted long after the company denied them.",
            quiz: {
              sentence: "Despite the new treatment, her symptoms continued to ______ for weeks.",
              options: ["Persist", "Vanish", "Resolve", "Improve"],
              correctIndex: 0,
              explanation: "Symptoms continuing despite treatment is \"persist\"; the others describe them disappearing or getting better, the opposite of continuing.",
            },
          },
          {
            word: "Evolve",
            fact: "\"Evolve\" means to develop gradually, often into a more complex or different form. The startup evolved from a two-person garage project into a global company.",
            quiz: {
              sentence: "Over several decades, the small local newspaper ______ into a major national publication.",
              options: ["Evolved", "Vanished", "Collapsed", "Paused"],
              correctIndex: 0,
              explanation: "Gradually developing into something bigger and different over time is \"evolved\"; the others describe disappearing, failing, or stopping.",
            },
          },
          {
            word: "Stabilize",
            fact: "\"Stabilize\" means to make or become steady and no longer likely to change suddenly. Doctors worked quickly to stabilize the patient's condition.",
            quiz: {
              sentence: "After weeks of wild swings, prices finally began to ______.",
              options: ["Stabilize", "Fluctuate", "Collapse", "Escalate"],
              correctIndex: 0,
              explanation: "Prices settling down after swinging wildly is \"stabilize\"; the others describe continued instability or worsening conditions.",
            },
          },
        ],
      },
      {
        id: "change-consequence-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Precipitate",
            fact: "\"Precipitate\" (as a verb) means to cause something, especially something sudden or unwelcome, to happen prematurely. The resignation of two board members precipitated a full leadership crisis.",
            quiz: {
              sentence: "The sudden currency collapse ______ a financial crisis that experts had expected to unfold gradually over years, not overnight.",
              options: ["Precipitated", "Engendered", "Ameliorated", "Regressed"],
              correctIndex: 0,
              explanation: "\"Precipitate\" specifically implies causing something to happen abruptly and ahead of schedule, matching \"overnight\" instead of \"gradually\"; \"engender\" lacks that sense of suddenness, and the other two mean improving or worsening, not triggering.",
            },
          },
          {
            word: "Engender",
            fact: "\"Engender\" means to give rise to a feeling, situation, or attitude. The town hall's dismissive tone engendered deep distrust among residents.",
            quiz: {
              sentence: "The CEO's vague, evasive answers ______ a level of suspicion that a direct response might have avoided entirely.",
              options: ["Engendered", "Rectified", "Superseded", "Precipitated"],
              correctIndex: 0,
              explanation: "\"Engender\" fits giving rise to an intangible feeling like suspicion; \"rectify\" means to correct an error, \"supersede\" means to replace, and \"precipitate\" implies a sudden concrete crisis rather than a gradually building attitude.",
            },
          },
          {
            word: "Instigate",
            fact: "\"Instigate\" means to bring about or provoke an action or event, often something disruptive, typically by urging others on. Investigators believed a single employee had instigated the walkout.",
            quiz: {
              sentence: "Prosecutors argued that the defendant hadn't just joined the scheme — he had actively ______ it from the very beginning.",
              options: ["Instigated", "Ameliorated", "Rectified", "Superseded"],
              correctIndex: 0,
              explanation: "\"Instigate\" implies deliberately provoking or initiating a disruptive action, matching \"actively... from the beginning\"; the other options describe improving, correcting, or replacing something, not inciting it.",
            },
          },
          {
            word: "Catalyze",
            fact: "\"Catalyze\" means to cause or speed up a process or change, especially by acting as a spark for it. The viral video catalyzed a nationwide conversation about the issue.",
            quiz: {
              sentence: "Historians argue that the pamphlet didn't cause the revolution single-handedly, but it did ______ ideas that were already spreading.",
              options: ["Catalyze", "Regress", "Supersede", "Remediate"],
              correctIndex: 0,
              explanation: "\"Catalyze\" fits accelerating a change already in motion, matching \"ideas that were already spreading\"; the others describe reversing, replacing, or fixing something, not speeding it along.",
            },
          },
          {
            word: "Supersede",
            fact: "\"Supersede\" means to take the place of something, typically because it is newer, better, or more current. The new safety standards superseded the decade-old regulations.",
            quiz: {
              sentence: "The updated treaty was designed to ______ the outdated 1950s agreement entirely, not simply amend it.",
              options: ["Supersede", "Engender", "Precipitate", "Ameliorate"],
              correctIndex: 0,
              explanation: "\"Supersede\" specifically means to replace something outdated, matching \"not simply amend it\"; the others describe causing a feeling, triggering a crisis, or partially improving something, not replacing it outright.",
            },
          },
          {
            word: "Rectify",
            fact: "\"Rectify\" means to correct a mistake or put right something that is wrong. The airline rushed to rectify the booking error before the flight departed.",
            quiz: {
              sentence: "Once the accounting mistake was discovered, the firm moved quickly to ______ it before the audit began.",
              options: ["Rectify", "Engender", "Instigate", "Supersede"],
              correctIndex: 0,
              explanation: "\"Rectify\" means to correct a specific known error, matching \"the accounting mistake\"; the others describe causing a feeling, provoking an action, or replacing something, not fixing a mistake.",
            },
          },
          {
            word: "Remediate",
            fact: "\"Remediate\" means to correct or reverse a problem, often through a deliberate technical or environmental process. The factory spent years working to remediate the contaminated soil around the plant.",
            quiz: {
              sentence: "Cleanup crews spent five years working to ______ the soil the old factory had left contaminated.",
              options: ["Remediate", "Rectify", "Ameliorate", "Regress"],
              correctIndex: 0,
              explanation: "\"Remediate\" specifically describes a sustained technical or environmental cleanup process, matching \"soil\" and \"five years\"; \"rectify\" fits correcting a discrete error rather than an ongoing physical process, and the others mean improving slightly or worsening.",
            },
          },
          {
            word: "Ameliorate",
            fact: "\"Ameliorate\" means to make a bad or difficult situation somewhat better, without necessarily solving it completely. The new subsidies helped ameliorate, but did not eliminate, food insecurity in the region.",
            quiz: {
              sentence: "The program didn't end homelessness in the city, but it did measurably ______ conditions for thousands of families.",
              options: ["Ameliorate", "Rectify", "Supersede", "Instigate"],
              correctIndex: 0,
              explanation: "\"Ameliorate\" implies a partial improvement rather than a full fix, matching \"didn't end... but did measurably\"; \"rectify\" implies fully correcting a problem, which the sentence explicitly rules out.",
            },
          },
          {
            word: "Regress",
            fact: "\"Regress\" means to return to a former, usually less developed or worse, state. Without regular practice, even skilled musicians can regress.",
            quiz: {
              sentence: "After skipping physical therapy for a month, the patient's mobility began to ______ toward where it had been right after the surgery.",
              options: ["Regress", "Evolve", "Stabilize", "Culminate"],
              correctIndex: 0,
              explanation: "Moving backward to an earlier, worse state is \"regress\"; the others describe developing forward, staying steady, or reaching a climax, not slipping backward.",
            },
          },
          {
            word: "Metamorphose",
            fact: "\"Metamorphose\" means to transform completely, especially in a dramatic or surprising way. Under the new director, the struggling theater metamorphosed into the city's most celebrated stage.",
            quiz: {
              sentence: "Within just a few seasons, the losing team ______ into one of the league's most feared contenders.",
              options: ["Metamorphosed", "Persisted", "Regressed", "Stabilized"],
              correctIndex: 0,
              explanation: "A complete, dramatic transformation into something unrecognizable is \"metamorphose\"; the others describe continuing unchanged, declining, or staying steady, not transforming.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "certainty-doubt",
    title: "Certainty & Doubt",
    description: "Words that signal confidence or uncertainty about a claim.",
    levels: [
      {
        id: "certainty-doubt-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Certain",
            fact: "\"Certain\" means having no doubt about something; completely sure. She was certain she had locked the door before leaving.",
            quiz: {
              sentence: "After reviewing the footage three times, the officer felt completely ______ about what he had seen.",
              options: ["Certain", "Doubtful", "Confused", "Mistaken"],
              correctIndex: 0,
              explanation: "Feeling completely sure after reviewing something is \"certain\"; the others describe feeling unsure or being wrong.",
            },
          },
          {
            word: "Doubt",
            fact: "\"Doubt\" means to feel uncertain about whether something is true. Few people doubted the results after seeing the data.",
            quiz: {
              sentence: "Even after hearing his explanation twice, she still ______ that he was telling the whole truth.",
              options: ["Doubted", "Trusted", "Confirmed", "Repeated"],
              correctIndex: 0,
              explanation: "Feeling uncertain about the truth of an explanation is \"doubted\"; the others describe believing or restating it.",
            },
          },
          {
            word: "Confident",
            fact: "\"Confident\" means feeling sure about one's abilities or about the truth of something. The coach felt confident the team would win.",
            quiz: {
              sentence: "Despite the tough opponent, the coach seemed ______ the team would still pull off a win.",
              options: ["Confident", "Doubtful", "Nervous", "Unsure"],
              correctIndex: 0,
              explanation: "Feeling sure of a win despite a tough opponent is \"confident\"; the others describe feeling unsure or worried.",
            },
          },
          {
            word: "Skeptical",
            fact: "\"Skeptical\" means having doubts about whether a claim is true. Scientists remained skeptical of the surprising results until they were repeated.",
            quiz: {
              sentence: "Most economists were ______ of the report's optimistic predictions, unwilling to accept them without more evidence.",
              options: ["Skeptical", "Convinced", "Delighted", "Certain"],
              correctIndex: 0,
              explanation: "Being unwilling to accept a claim without more evidence is \"skeptical\"; the others describe already believing it or being pleased.",
            },
          },
          {
            word: "Convinced",
            fact: "\"Convinced\" means firmly persuaded that something is true. After seeing the evidence, the jury was convinced of his innocence.",
            quiz: {
              sentence: "After hearing all the testimony, the jury was fully ______ that the defendant was innocent.",
              options: ["Convinced", "Doubtful", "Confused", "Suspicious"],
              correctIndex: 0,
              explanation: "Being firmly persuaded after hearing testimony is \"convinced\"; the others describe remaining unsure or distrustful.",
            },
          },
          {
            word: "Hesitant",
            fact: "\"Hesitant\" means feeling uncertain or reluctant, especially before doing or believing something. She was hesitant to trust the stranger's directions.",
            quiz: {
              sentence: "Even with the map in hand, he felt ______ to trust a shortcut he'd never taken before.",
              options: ["Hesitant", "Eager", "Certain", "Confident"],
              correctIndex: 0,
              explanation: "Feeling reluctant to trust something new is \"hesitant\"; the others describe eagerness or full confidence.",
            },
          },
          {
            word: "Suspicious",
            fact: "\"Suspicious\" means having a feeling that something is wrong or untrue, without full proof. The cashier grew suspicious of the oddly worn bill.",
            quiz: {
              sentence: "Something about the stranger's story felt off, and the guard grew increasingly ______ of his explanation.",
              options: ["Suspicious", "Trusting", "Convinced", "Indifferent"],
              correctIndex: 0,
              explanation: "Feeling that something is wrong without full proof is \"suspicious\"; the others describe trusting, believing, or not caring about it.",
            },
          },
          {
            word: "Assume",
            fact: "\"Assume\" means to accept something as true without proof. She assumed the meeting had been canceled since no one showed up.",
            quiz: {
              sentence: "Since no one answered the phone, he ______ the office must already be closed.",
              options: ["Assumed", "Proved", "Doubted", "Denied"],
              correctIndex: 0,
              explanation: "Accepting something as likely true without checking is \"assumed\"; the others describe verifying, disbelieving, or rejecting it.",
            },
          },
          {
            word: "Guess",
            fact: "\"Guess\" means to estimate or suppose something without certain knowledge. He guessed the crowd size at around two thousand people.",
            quiz: {
              sentence: "With no scale nearby, the shopper had to ______ the weight of the package before mailing it.",
              options: ["Guess", "Verify", "Confirm", "Measure"],
              correctIndex: 0,
              explanation: "Estimating something without exact knowledge is \"guess\"; the others describe checking or measuring it precisely.",
            },
          },
          {
            word: "Wonder",
            fact: "\"Wonder\" means to feel curious or uncertain about something, often silently questioning it. She wondered whether she had made the right choice.",
            quiz: {
              sentence: "Watching the empty parking lot, she began to ______ if the store had closed early.",
              options: ["Wonder", "Confirm", "Announce", "Prove"],
              correctIndex: 0,
              explanation: "Silently questioning a possibility is \"wonder\"; the others describe verifying, announcing, or proving it.",
            },
          },
          {
            word: "Unsure",
            fact: "\"Unsure\" means lacking confidence or certainty about something. He was unsure whether he had sent the email.",
            quiz: {
              sentence: "Even after checking his notes twice, he remained ______ about which date the meeting was actually scheduled for.",
              options: ["Unsure", "Certain", "Confident", "Convinced"],
              correctIndex: 0,
              explanation: "Remaining unclear even after checking is \"unsure\"; the others describe feeling settled and certain.",
            },
          },
          {
            word: "Trust",
            fact: "\"Trust\" means to believe that something or someone is reliable or true. She trusted his account of what had happened.",
            quiz: {
              sentence: "After years of accurate predictions, investors had learned to ______ her judgment completely.",
              options: ["Trust", "Doubt", "Question", "Dismiss"],
              correctIndex: 0,
              explanation: "Believing someone's judgment is reliable after a track record is \"trust\"; the others describe doubting or rejecting it.",
            },
          },
        ],
      },
      {
        id: "certainty-doubt-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Presume",
            fact: "\"Presume\" means to suppose that something is true based on likelihood, without direct proof. Since the lights were off, she presumed no one was home.",
            quiz: {
              sentence: "Because the store's gates were down, delivery drivers ______ it was closed for the holiday.",
              options: ["Presumed", "Verified", "Denied", "Announced"],
              correctIndex: 0,
              explanation: "Supposing something is true based on an indirect sign is \"presume\"; the others describe confirming, denying, or announcing it directly.",
            },
          },
          {
            word: "Speculate",
            fact: "\"Speculate\" means to form an opinion or theory without firm evidence. Analysts speculated about the reasons behind the sudden resignation.",
            quiz: {
              sentence: "With no official statement released, reporters could only ______ about what had caused the delay.",
              options: ["Speculate", "Confirm", "Document", "Verify"],
              correctIndex: 0,
              explanation: "Forming a theory without an official statement to rely on is \"speculate\"; the others require having solid, confirmed information.",
            },
          },
          {
            word: "Dubious",
            fact: "\"Dubious\" means feeling doubt or hesitating to believe something, or, of a claim, not to be trusted. The salesman's dubious claims made several customers walk away.",
            quiz: {
              sentence: "The professor seemed ______ of the study's conclusions, noting that the sample size was far too small.",
              options: ["Dubious", "Convinced", "Impressed", "Confident"],
              correctIndex: 0,
              explanation: "Doubting a conclusion because the evidence seems weak is \"dubious\"; the others describe being persuaded or impressed by it.",
            },
          },
          {
            word: "Ambiguous",
            fact: "\"Ambiguous\" means open to more than one interpretation; unclear in meaning. The contract's ambiguous wording led to a long legal dispute.",
            quiz: {
              sentence: "The witness's ______ answer left the jury unsure whether she meant yes or no.",
              options: ["Ambiguous", "Precise", "Blunt", "Emphatic"],
              correctIndex: 0,
              explanation: "An answer that could mean either yes or no is \"ambiguous\"; the others describe answers that are clear and direct.",
            },
          },
          {
            word: "Tentative",
            fact: "\"Tentative\" means not fully certain or fixed; provisional, subject to change. They made tentative plans to meet on Friday, pending confirmation.",
            quiz: {
              sentence: "The two companies reached only a ______ agreement, one that still needed approval from both boards.",
              options: ["Tentative", "Final", "Binding", "Unanimous"],
              correctIndex: 0,
              explanation: "An agreement that still needs approval is \"tentative,\" not yet fixed; the others describe something already settled and complete.",
            },
          },
          {
            word: "Adamant",
            fact: "\"Adamant\" means refusing to change one's mind or position; completely certain and unwilling to be persuaded otherwise. She was adamant that she had turned off the stove.",
            quiz: {
              sentence: "No matter how much evidence they presented, the witness remained ______ that he had seen nothing unusual that night.",
              options: ["Adamant", "Uncertain", "Confused", "Persuadable"],
              correctIndex: 0,
              explanation: "Refusing to budge despite evidence is \"adamant\"; the others describe being open to doubt or persuasion, the opposite stance.",
            },
          },
          {
            word: "Wary",
            fact: "\"Wary\" means cautious about possible dangers or problems; feeling uneasy trust. Investors grew wary of the company after its erratic earnings reports.",
            quiz: {
              sentence: "After the earlier scam, residents became ______ of any stranger offering unusually generous deals.",
              options: ["Wary", "Enthusiastic", "Trusting", "Indifferent"],
              correctIndex: 0,
              explanation: "Becoming cautious after being scammed is \"wary\"; the others describe eagerness, trust, or not caring, the opposite reaction.",
            },
          },
          {
            word: "Ascertain",
            fact: "\"Ascertain\" means to find out or determine something with certainty, usually through careful checking. Investigators worked to ascertain the exact cause of the crash.",
            quiz: {
              sentence: "Before approving the loan, the bank needed to ______ that the applicant's income was accurately reported.",
              options: ["Ascertain", "Assume", "Guess", "Suspect"],
              correctIndex: 0,
              explanation: "Confirming something with careful checking before acting is \"ascertain\"; the others describe accepting something without verifying it.",
            },
          },
          {
            word: "Assured",
            fact: "\"Assured\" means confident and free from self-doubt. She gave an assured performance despite it being her first time on stage.",
            quiz: {
              sentence: "Despite the tough questions, the candidate answered every one in a calm, ______ tone.",
              options: ["Assured", "Hesitant", "Nervous", "Confused"],
              correctIndex: 0,
              explanation: "Answering calmly and with confidence is \"assured\"; the others describe uncertainty or nervousness.",
            },
          },
          {
            word: "Contend",
            fact: "\"Contend\" means to assert or maintain firmly, especially as part of an argument. The lawyer contended that the contract had never been legally valid.",
            quiz: {
              sentence: "Defense attorneys ______ that their client had been nowhere near the building that night.",
              options: ["Contended", "Wondered", "Speculated", "Doubted"],
              correctIndex: 0,
              explanation: "Firmly asserting a claim as part of an argument is \"contend\"; the others describe uncertainty rather than a confident assertion.",
            },
          },
          {
            word: "Postulate",
            fact: "\"Postulate\" means to suggest or assume something as a basis for reasoning, without yet proving it. Early astronomers postulated that the Earth orbited the sun.",
            quiz: {
              sentence: "Long before it could be tested, the physicist ______ the existence of a particle no one had ever observed.",
              options: ["Postulated", "Confirmed", "Disproved", "Witnessed"],
              correctIndex: 0,
              explanation: "Proposing an untested idea as a starting assumption is \"postulate\"; the others describe already having proof, disproof, or direct observation.",
            },
          },
          {
            word: "Hypothesize",
            fact: "\"Hypothesize\" means to propose an explanation based on limited evidence, to be tested further. Researchers hypothesized that the drug might also treat a second condition.",
            quiz: {
              sentence: "Based on the early data alone, the team could only ______ that the two symptoms were related.",
              options: ["Hypothesize", "Prove", "Verify", "Establish"],
              correctIndex: 0,
              explanation: "Proposing an explanation from limited data, still needing to be tested, is \"hypothesize\"; the others imply the connection is already firmly established.",
            },
          },
        ],
      },
      {
        id: "certainty-doubt-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Unequivocal",
            fact: "\"Unequivocal\" means expressed clearly and without any ambiguity, leaving no room for doubt about what is meant. The CEO issued an unequivocal denial of the rumors, using no hedging language at all.",
            quiz: {
              sentence: "Unlike her usual carefully hedged statements, this time the senator's response was ______ — a flat yes, with no qualifications attached.",
              options: ["Unequivocal", "Incontrovertible", "Ostensible", "Purported"],
              correctIndex: 0,
              explanation: "\"Unequivocal\" describes a statement expressed with total clarity, matching \"a flat yes, with no qualifications\"; \"incontrovertible\" describes evidence that can't be disputed rather than a statement's clarity, and the other two both mean \"claimed\" rather than \"clearly stated.\"",
            },
          },
          {
            word: "Incontrovertible",
            fact: "\"Incontrovertible\" means not able to be denied or disputed; beyond argument, usually describing evidence or facts. The security footage provided incontrovertible proof of who had entered the building.",
            quiz: {
              sentence: "The DNA match left ______ proof of the suspect's presence at the scene, evidence no defense attorney could realistically challenge.",
              options: ["Incontrovertible", "Unequivocal", "Ostensible", "Conjectural"],
              correctIndex: 0,
              explanation: "\"Incontrovertible\" specifically describes evidence too solid to be disputed, matching \"no defense attorney could realistically challenge\"; \"unequivocal\" better describes the clarity of a statement than the undeniability of evidence, and the other two both suggest unproven claims.",
            },
          },
          {
            word: "Ostensible",
            fact: "\"Ostensible\" means appearing or stated to be true, often while hiding a different real reason. The ostensible purpose of the meeting was budgeting, though everyone knew layoffs would be discussed.",
            quiz: {
              sentence: "The ______ reason for the trip was a business conference, though he spent most of it visiting old friends.",
              options: ["Ostensible", "Incontrovertible", "Unequivocal", "Indubitable"],
              correctIndex: 0,
              explanation: "\"Ostensible\" fits a stated reason that turns out to differ from the real one, matching \"though he spent most of it\"; the other three all describe something certain or undeniable, not a cover story.",
            },
          },
          {
            word: "Purported",
            fact: "\"Purported\" means claimed or alleged to be true, often with the implication that the claim is unverified or doubtful. The purported cure had never been tested in a real clinical trial.",
            quiz: {
              sentence: "The ______ eyewitness account turned out to have come from someone who wasn't even in the country that day.",
              options: ["Purported", "Incontrovertible", "Unequivocal", "Verified"],
              correctIndex: 0,
              explanation: "\"Purported\" fits a claim later revealed to be unreliable, matching the twist in the sentence; the others all describe something confirmed or beyond doubt, the opposite of an unverified claim.",
            },
          },
          {
            word: "Equivocate",
            fact: "\"Equivocate\" means to use vague or ambiguous language on purpose, in order to avoid committing to a clear answer. When asked directly about the layoffs, the spokesperson equivocated instead of giving a real answer.",
            quiz: {
              sentence: "Reporters noticed that instead of confirming or denying the rumor, the mayor simply began to ______.",
              options: ["Equivocate", "Confirm", "Deny", "Elaborate"],
              correctIndex: 0,
              explanation: "Deliberately avoiding a clear yes or no is \"equivocate\"; the others all describe giving a direct, clear response, the opposite of dodging the question.",
            },
          },
          {
            word: "Conjecture",
            fact: "\"Conjecture\" means an opinion or conclusion formed on the basis of incomplete information; an informed guess. Without the missing pages, historians were left with only conjecture about the manuscript's ending.",
            quiz: {
              sentence: "With the flight recorder still missing, investigators admitted that their theory about the crash was still largely ______, not established fact.",
              options: ["Conjecture", "Certainty", "Consensus", "Verification"],
              correctIndex: 0,
              explanation: "A theory based on incomplete information is \"conjecture,\" explicitly contrasted with \"established fact\" in the sentence; the others all describe something settled and confirmed.",
            },
          },
          {
            word: "Indubitable",
            fact: "\"Indubitable\" means too obvious or certain to be doubted. His talent was indubitable, even to critics who disliked his style.",
            quiz: {
              sentence: "Whatever their opinion of her personality, her skill as a surgeon was ______ — not one colleague questioned it.",
              options: ["Indubitable", "Ostensible", "Purported", "Conjectural"],
              correctIndex: 0,
              explanation: "\"Indubitable\" fits something no one questions, matching \"not one colleague questioned it\"; the other three all describe claims that are merely alleged or unproven, the opposite of beyond-doubt.",
            },
          },
          {
            word: "Circumspect",
            fact: "\"Circumspect\" means cautious and careful to consider all circumstances and possible consequences before acting or speaking. The diplomat remained circumspect, choosing her words carefully to avoid an international incident.",
            quiz: {
              sentence: "Aware that any misstep could reignite the conflict, the negotiator stayed deliberately ______ throughout the talks.",
              options: ["Circumspect", "Reckless", "Impulsive", "Candid"],
              correctIndex: 0,
              explanation: "Carefully weighing consequences before speaking to avoid a crisis is \"circumspect\"; the others describe acting carelessly or too openly, the opposite of caution.",
            },
          },
          {
            word: "Credulous",
            fact: "\"Credulous\" means too willing to believe things without enough evidence; easily deceived. The credulous investors never questioned the fund's suspiciously consistent returns.",
            quiz: {
              sentence: "Fraud experts noted that the scheme worked mainly on ______ investors who never thought to ask for independent proof.",
              options: ["Credulous", "Skeptical", "Wary", "Circumspect"],
              correctIndex: 0,
              explanation: "Believing something without demanding proof is \"credulous\"; the others describe doubting or carefully questioning a claim, the opposite of gullibility.",
            },
          },
          {
            word: "Vacillate",
            fact: "\"Vacillate\" means to waver or be indecisive, moving back and forth between different opinions or choices. The committee vacillated for weeks before finally settling on a candidate.",
            quiz: {
              sentence: "For months the board seemed to ______ between the two finalists, unable to commit to either.",
              options: ["Vacillate", "Commit", "Decide", "Resolve"],
              correctIndex: 0,
              explanation: "Being unable to settle on one choice is \"vacillate\"; the others all describe reaching a firm decision, the opposite of wavering.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "tone-attitude",
    title: "Tone & Attitude",
    description: "Words for describing feelings and attitudes precisely.",
    levels: [
      {
        id: "tone-attitude-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Cheerful",
            fact: "\"Cheerful\" means noticeably happy and positive in mood or tone. She greeted every customer with a cheerful smile, even on the busiest days.",
            quiz: {
              sentence: "Despite the rainy weather, his voice on the phone sounded surprisingly ______.",
              options: ["Cheerful", "Gloomy", "Bitter", "Nervous"],
              correctIndex: 0,
              explanation: "A surprisingly positive voice despite bad weather is \"cheerful\"; the others describe sadness, resentment, or anxiety.",
            },
          },
          {
            word: "Serious",
            fact: "\"Serious\" means thoughtful or solemn in manner; not joking or lighthearted. His tone turned serious the moment the topic shifted to layoffs.",
            quiz: {
              sentence: "Her usually joking tone turned completely ______ once she began discussing the test results.",
              options: ["Serious", "Playful", "Sarcastic", "Cheerful"],
              correctIndex: 0,
              explanation: "A shift away from joking is \"serious\"; the others all describe lighthearted or mocking tones, the opposite of solemn.",
            },
          },
          {
            word: "Sarcastic",
            fact: "\"Sarcastic\" means saying the opposite of what one means, usually to mock or criticize. \"Oh, great, another meeting,\" he said in a sarcastic tone.",
            quiz: {
              sentence: "\"Wow, what a fantastic parking spot,\" she said in an obviously ______ tone, staring at the puddle beneath the car.",
              options: ["Sarcastic", "Sincere", "Grateful", "Cheerful"],
              correctIndex: 0,
              explanation: "Saying \"fantastic\" about an obviously bad spot signals \"sarcastic\"; the others describe genuinely meaning what was said.",
            },
          },
          {
            word: "Enthusiastic",
            fact: "\"Enthusiastic\" means showing eager excitement or interest. The new hire was enthusiastic about every project she was assigned.",
            quiz: {
              sentence: "Even after a long day, he was still ______ about the plan, talking about it nonstop.",
              options: ["Enthusiastic", "Indifferent", "Bitter", "Gloomy"],
              correctIndex: 0,
              explanation: "Talking about something nonstop with excitement is \"enthusiastic\"; the others describe not caring or feeling negative.",
            },
          },
          {
            word: "Bitter",
            fact: "\"Bitter\" means feeling or showing resentment or anger, often over unfair treatment. He remained bitter about being passed over for the promotion.",
            quiz: {
              sentence: "Years after being fired unfairly, she still sounded ______ whenever the company's name came up.",
              options: ["Bitter", "Cheerful", "Grateful", "Calm"],
              correctIndex: 0,
              explanation: "Lingering resentment years after unfair treatment is \"bitter\"; the others describe positive or neutral feelings.",
            },
          },
          {
            word: "Calm",
            fact: "\"Calm\" means free from excitement, anxiety, or strong emotion; steady. The pilot's calm voice reassured the nervous passengers.",
            quiz: {
              sentence: "Even as alarms blared around her, the surgeon's voice remained perfectly ______.",
              options: ["Calm", "Frantic", "Nervous", "Panicked"],
              correctIndex: 0,
              explanation: "Staying steady despite chaos is \"calm\"; the others describe losing composure.",
            },
          },
          {
            word: "Nervous",
            fact: "\"Nervous\" means feeling anxious or worried, often before or during something stressful. He grew visibly nervous as his turn to speak approached.",
            quiz: {
              sentence: "Her voice grew noticeably ______ the closer she got to the microphone.",
              options: ["Nervous", "Calm", "Confident", "Relaxed"],
              correctIndex: 0,
              explanation: "A voice growing anxious as a stressful moment nears is \"nervous\"; the others describe staying composed.",
            },
          },
          {
            word: "Proud",
            fact: "\"Proud\" means feeling deep satisfaction from one's own achievements or those of someone close. Her parents beamed with a proud smile at the graduation.",
            quiz: {
              sentence: "He couldn't stop smiling, clearly ______ of how far the team had come.",
              options: ["Proud", "Ashamed", "Embarrassed", "Indifferent"],
              correctIndex: 0,
              explanation: "Smiling with satisfaction over an achievement is \"proud\"; the others describe shame or not caring.",
            },
          },
          {
            word: "Sincere",
            fact: "\"Sincere\" means genuine and honest in feeling; not pretended. His apology sounded sincere, not just something he was told to say.",
            quiz: {
              sentence: "Unlike the rehearsed thank-you speeches from earlier, hers felt completely ______.",
              options: ["Sincere", "Sarcastic", "Fake", "Rehearsed"],
              correctIndex: 0,
              explanation: "A speech that feels genuine rather than rehearsed is \"sincere\"; the others describe insincerity or mockery.",
            },
          },
          {
            word: "Playful",
            fact: "\"Playful\" means lighthearted and fun in manner; not serious. Their playful banter made the long meeting feel less tense.",
            quiz: {
              sentence: "Despite the tense topic, he kept his tone light and ______, cracking jokes throughout.",
              options: ["Playful", "Somber", "Grim", "Serious"],
              correctIndex: 0,
              explanation: "Cracking jokes and staying light is \"playful\"; the others describe a heavy, humorless tone.",
            },
          },
          {
            word: "Gloomy",
            fact: "\"Gloomy\" means sad or dark in mood; without hope or cheer. The gloomy weather matched the mood of the entire office that day.",
            quiz: {
              sentence: "The team's mood turned ______ after hearing the project had been cancelled.",
              options: ["Gloomy", "Cheerful", "Excited", "Playful"],
              correctIndex: 0,
              explanation: "A mood turning sad after bad news is \"gloomy\"; the others describe happiness or excitement.",
            },
          },
          {
            word: "Grateful",
            fact: "\"Grateful\" means feeling or showing thankfulness. She wrote a grateful note to everyone who had helped during the move.",
            quiz: {
              sentence: "His voice was ______ as he thanked the strangers who had stopped to help.",
              options: ["Grateful", "Bitter", "Indifferent", "Annoyed"],
              correctIndex: 0,
              explanation: "Thanking people warmly is \"grateful\"; the others describe resentment or not caring.",
            },
          },
        ],
      },
      {
        id: "tone-attitude-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Nostalgic",
            fact: "\"Nostalgic\" means feeling a sentimental longing for the past. Looking through old photos left her feeling nostalgic for her childhood summers.",
            quiz: {
              sentence: "The old song came on the radio, and he suddenly felt ______ for his college years.",
              options: ["Nostalgic", "Indifferent", "Furious", "Embarrassed"],
              correctIndex: 0,
              explanation: "A song triggering sentimental longing for the past is \"nostalgic\"; the others describe not caring or feeling angry.",
            },
          },
          {
            word: "Cynical",
            fact: "\"Cynical\" means distrustful of people's motives, assuming they are selfish. Years in politics had left him cynical about anyone's promises.",
            quiz: {
              sentence: "After being lied to so many times, she grew ______ about every politician's promises.",
              options: ["Cynical", "Trusting", "Naive", "Optimistic"],
              correctIndex: 0,
              explanation: "Distrusting promises after repeated lies is \"cynical\"; the others describe believing them readily.",
            },
          },
          {
            word: "Reverent",
            fact: "\"Reverent\" means showing deep respect or awe. The visitors fell silent, speaking in reverent whispers inside the ancient cathedral.",
            quiz: {
              sentence: "Standing before the massive canyon for the first time, they fell into a ______ silence.",
              options: ["Reverent", "Mocking", "Bored", "Irreverent"],
              correctIndex: 0,
              explanation: "Silence out of awe and respect is \"reverent\"; the others describe mockery or boredom, not admiration.",
            },
          },
          {
            word: "Indifferent",
            fact: "\"Indifferent\" means having no particular interest or concern; not caring either way. He remained indifferent to the outcome of the game.",
            quiz: {
              sentence: "While everyone else cheered, she watched with an oddly ______ expression, as if she hadn't noticed the score at all.",
              options: ["Indifferent", "Enthusiastic", "Ecstatic", "Devastated"],
              correctIndex: 0,
              explanation: "Showing no reaction while others cheer is \"indifferent\"; the others describe strong emotional reactions.",
            },
          },
          {
            word: "Wistful",
            fact: "\"Wistful\" means having a feeling of vague or regretful longing, often gentler and quieter than nostalgia. She gave a wistful smile, thinking about the trip they'd never taken.",
            quiz: {
              sentence: "He looked out the window with a ______ expression, thinking about the path he hadn't taken.",
              options: ["Wistful", "Furious", "Indifferent", "Cheerful"],
              correctIndex: 0,
              explanation: "A quiet, gentle longing over what might have been is \"wistful\"; the others describe anger, apathy, or plain happiness.",
            },
          },
          {
            word: "Solemn",
            fact: "\"Solemn\" means deeply serious and formal in manner, especially at an important occasion. The room fell solemn as the names of the fallen soldiers were read.",
            quiz: {
              sentence: "The ceremony had a ______ air, with no laughter and every speaker choosing their words carefully.",
              options: ["Solemn", "Playful", "Cheerful", "Sarcastic"],
              correctIndex: 0,
              explanation: "A no-laughter, careful, formal atmosphere is \"solemn\"; the others describe humor or lightness, the opposite mood.",
            },
          },
          {
            word: "Mocking",
            fact: "\"Mocking\" means showing contempt or ridicule, often through imitation or exaggeration. He repeated her words back in a mocking, singsong voice.",
            quiz: {
              sentence: "He repeated the coach's instructions in a ______ voice, exaggerating every word to get a laugh from the team.",
              options: ["Mocking", "Respectful", "Sincere", "Reverent"],
              correctIndex: 0,
              explanation: "Exaggerating someone's words to ridicule them for laughs is \"mocking\"; the others describe treating them with genuine respect.",
            },
          },
          {
            word: "Earnest",
            fact: "\"Earnest\" means showing sincere and serious intent or effort, without irony. He made an earnest attempt to apologize, choosing his words carefully.",
            quiz: {
              sentence: "Unlike his usual joking around, his request this time sounded completely ______.",
              options: ["Earnest", "Sarcastic", "Mocking", "Flippant"],
              correctIndex: 0,
              explanation: "A sincere, serious tone unlike his usual joking is \"earnest\"; the others all describe joking or dismissive tones.",
            },
          },
          {
            word: "Condescending",
            fact: "\"Condescending\" means showing a superior, patronizing attitude toward someone, as if they were less intelligent or important. His condescending tone made the new intern feel talked down to.",
            quiz: {
              sentence: "Instead of just explaining the process, he used a ______ tone that made her feel like a child.",
              options: ["Condescending", "Respectful", "Encouraging", "Humble"],
              correctIndex: 0,
              explanation: "Talking to someone as though they were beneath you is \"condescending\"; the others describe treating them as an equal or with kindness.",
            },
          },
          {
            word: "Somber",
            fact: "\"Somber\" means dark, serious, and gloomy in mood; without brightness or cheer. A somber mood settled over the town after the factory closed.",
            quiz: {
              sentence: "The usually lively newsroom fell ______ as the anchor read the breaking news.",
              options: ["Somber", "Playful", "Cheerful", "Giddy"],
              correctIndex: 0,
              explanation: "A mood turning dark and heavy after bad news is \"somber\"; the others describe lightness or joy, the opposite reaction.",
            },
          },
          {
            word: "Irreverent",
            fact: "\"Irreverent\" means showing a lack of respect for things usually taken seriously, often humorously. The comedian's irreverent jokes about tradition upset some older audience members.",
            quiz: {
              sentence: "The new host's ______ jokes about the ceremony's strict traditions shocked some of the older guests.",
              options: ["Irreverent", "Reverent", "Solemn", "Respectful"],
              correctIndex: 0,
              explanation: "Joking disrespectfully about serious traditions is \"irreverent\"; the others describe treating those traditions with respect.",
            },
          },
          {
            word: "Nonchalant",
            fact: "\"Nonchalant\" means calm and casual in a way that suggests a lack of concern or worry. He gave a nonchalant shrug, as if losing the game meant nothing to him.",
            quiz: {
              sentence: "Despite just missing the final shot, she walked off the court with a ______ shrug.",
              options: ["Nonchalant", "Devastated", "Furious", "Panicked"],
              correctIndex: 0,
              explanation: "A casual shrug suggesting no real concern is \"nonchalant\"; the others describe strong emotional reactions to the loss.",
            },
          },
        ],
      },
      {
        id: "tone-attitude-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Sardonic",
            fact: "\"Sardonic\" means mocking or cynical in a dry, understated way, often through a single sharp comment rather than open ridicule. He gave a sardonic smile and asked if anyone was surprised the meeting had run late again.",
            quiz: {
              sentence: "\"Shocking,\" he said with a ______ smile, watching the third meeting in a row start twenty minutes late.",
              options: ["Sardonic", "Ardent", "Plaintive", "Unctuous"],
              correctIndex: 0,
              explanation: "A dry, mocking comment delivered with a knowing smile is \"sardonic\"; the others describe passionate devotion, sorrowful longing, or excessive flattery — none of which fit a cynical one-liner.",
            },
          },
          {
            word: "Derisive",
            fact: "\"Derisive\" means openly expressing contempt or ridicule. The proposal was met with derisive laughter from half the room.",
            quiz: {
              sentence: "His idea was met with ______ laughter, several people openly scoffing before he'd even finished explaining it.",
              options: ["Derisive", "Sardonic", "Reverent", "Earnest"],
              correctIndex: 0,
              explanation: "Open, obvious scoffing and ridicule is \"derisive\"; \"sardonic\" implies a subtler, drier form of mockery, while the other two describe respect or sincerity.",
            },
          },
          {
            word: "Vehement",
            fact: "\"Vehement\" means showing strong, forceful feeling, especially anger, opposition, or conviction. Her vehement objection to the plan surprised even her closest colleagues.",
            quiz: {
              sentence: "His denial wasn't quiet or measured — it was ______, delivered with a raised voice and a pounding fist.",
              options: ["Vehement", "Ardent", "Wistful", "Complacent"],
              correctIndex: 0,
              explanation: "A forceful, angry denial with a raised voice is \"vehement\"; \"ardent\" better fits passionate devotion than anger, and the other two describe quiet longing or self-satisfaction.",
            },
          },
          {
            word: "Ardent",
            fact: "\"Ardent\" means showing great enthusiasm, passion, or devotion, usually toward something admired or loved. He remained an ardent supporter of the local team through every losing season.",
            quiz: {
              sentence: "Even through a decade of losing seasons, she stayed an ______ fan, never missing a single home game.",
              options: ["Ardent", "Vehement", "Indifferent", "Complacent"],
              correctIndex: 0,
              explanation: "\"Ardent\" fits loyal, passionate devotion, matching \"never missing a single game\"; \"vehement\" better describes forceful anger or protest than warm devotion, and the other two describe not caring or being self-satisfied.",
            },
          },
          {
            word: "Complacent",
            fact: "\"Complacent\" means showing smug, uncritical satisfaction with oneself, often while ignoring real risks. After years of easy wins, the champion had grown complacent.",
            quiz: {
              sentence: "After dominating the market for a decade, the company grew ______, ignoring the small startups that would eventually overtake it.",
              options: ["Complacent", "Vigilant", "Ardent", "Wary"],
              correctIndex: 0,
              explanation: "Feeling too satisfied to notice a real threat is \"complacent\"; the others describe staying alert or passionate, the opposite of self-satisfied carelessness.",
            },
          },
          {
            word: "Glib",
            fact: "\"Glib\" means speaking fluently and smoothly but in a way that seems insincere or superficial. The candidate's glib answers avoided every hard question with a smile.",
            quiz: {
              sentence: "Reporters found his answer a little too ______ — smooth and quick, but never actually addressing the question asked.",
              options: ["Glib", "Earnest", "Sincere", "Solemn"],
              correctIndex: 0,
              explanation: "A smooth, evasive answer that dodges the real question is \"glib\"; the others describe genuine, sincere, or serious responses, the opposite of superficial smoothness.",
            },
          },
          {
            word: "Sanctimonious",
            fact: "\"Sanctimonious\" means making a show of being morally superior to others; hypocritically self-righteous. His sanctimonious lecture about honesty rang hollow, since he'd been caught lying himself.",
            quiz: {
              sentence: "It was hard to take his ______ lecture on discipline seriously, given that he'd missed every practice that season.",
              options: ["Sanctimonious", "Earnest", "Humble", "Reverent"],
              correctIndex: 0,
              explanation: "A hypocritical show of moral superiority — lecturing about discipline he doesn't practice — is \"sanctimonious\"; the others describe sincerity, modesty, or genuine respect.",
            },
          },
          {
            word: "Plaintive",
            fact: "\"Plaintive\" means sounding sad and mournful, often expressing a quiet longing or complaint. The plaintive cry of the violin matched the sorrow of the final scene.",
            quiz: {
              sentence: "From somewhere down the hall came a soft, ______ cry, one that sounded more sad than angry.",
              options: ["Plaintive", "Derisive", "Sardonic", "Vehement"],
              correctIndex: 0,
              explanation: "A soft, sorrowful cry is \"plaintive\"; the others describe mockery or anger, not sadness.",
            },
          },
          {
            word: "Truculent",
            fact: "\"Truculent\" means eager to argue or fight; aggressively defiant. The truculent teenager answered every question with a sharp, defensive retort.",
            quiz: {
              sentence: "Every question to the witness was met with a ______ reply, as if he were spoiling for a fight.",
              options: ["Truculent", "Nonchalant", "Wistful", "Reverent"],
              correctIndex: 0,
              explanation: "A defiant, combative reply as if looking for a fight is \"truculent\"; the others describe calm indifference, gentle longing, or respect.",
            },
          },
          {
            word: "Unctuous",
            fact: "\"Unctuous\" means excessively flattering or ingratiating in a way that feels insincere. The unctuous waiter's constant compliments made the diners uncomfortable.",
            quiz: {
              sentence: "The salesman's ______ compliments about her taste made her trust him even less, not more.",
              options: ["Unctuous", "Candid", "Blunt", "Earnest"],
              correctIndex: 0,
              explanation: "Excessive, insincere flattery that breeds distrust is \"unctuous\"; the others describe honest, direct, or sincere speech, the opposite effect.",
            },
          },
        ],
      },
    ],
  },
];

// The courses layer. Each course: { id, title, description, categories }.
// SAT Vocab = the original categories plus a 4th, optional "Expert" level in
// each (lib/satExpertTier.js). Appended here, not written into the literal above,
// so the original data stays byte-identical.
const satVocabCategories = satVocabCoreCategories.map((category) =>
  satExpertLevels[category.id] ? { ...category, levels: [...category.levels, satExpertLevels[category.id]] } : category
);

export const courses = [
  {
    id: "sat-vocab",
    title: "SAT Vocab",
    description:
      "Function-based vocabulary matched to the Digital SAT's Words in Context questions — how a word works in an argument, not just what it means.",
    categories: satVocabCategories,
    // Optional extra sections. A course only shows a section (a tab on its
    // course page) if it defines it; the other courses are plain category lists.
    passages: satPassages,
    guides: satStrategyGuides,
    grammar: satGrammarCategories,
  },
  {
    id: "everyday-vocabulary",
    title: "Everyday Vocabulary",
    description:
      "Evergreen words for reading, writing and conversation, grouped by theme. No exam required.",
    categories: everydayVocabularyCategories,
  },
  {
    id: "professional-vocabulary",
    title: "Professional Vocabulary",
    description:
      "Words for meetings, decisions, and leading people, practiced in the emails, reviews, and negotiations where they actually come up.",
    categories: professionalVocabularyCategories,
  },
];

// Every category across every course, in course order. This is what the
// rest of the app has always called `categories`, so code that doesn't care
// about courses (review, the paywall gate, missed words, milestones, …) keeps
// working unchanged. Category ids are unique across courses.
export const categories = courses.flatMap((course) => course.categories);

export function getCourse(courseId) {
  return courses.find((c) => c.id === courseId) || null;
}

// The sections a course page is split into, or null when the course is just its
// category list (Everyday and Professional). "Vocabulary" is always first — it
// is the course as it has always looked and the default tab — and the others
// appear only if the course defines them: `passages` (reading passages) and
// `guides` (written strategy guides).
export function getCourseSections(course) {
  const sections = [{ id: "vocabulary", label: "Vocabulary" }];
  if ((course.passages || []).length > 0) sections.push({ id: "passages", label: "Passages" });
  if ((course.grammar || []).length > 0) sections.push({ id: "grammar", label: "Grammar" });
  // Practice Test needs BOTH passages and grammar to build a real mixed
  // section — inferred, not an explicit flag, so a future course only needs
  // passages/grammar of its own to get this tab too, no extra registration.
  if ((course.passages || []).length > 0 && (course.grammar || []).length > 0) {
    sections.push({ id: "practice-test", label: "Practice Test" });
  }
  if ((course.guides || []).length > 0) sections.push({ id: "strategy", label: "Strategy" });
  return sections.length > 1 ? sections : null;
}

// A strategy guide by id, with the course it belongs to, or null.
export function findGuide(guideId) {
  for (const course of courses) {
    const guide = (course.guides || []).find((g) => g.id === guideId);
    if (guide) return { course, guide };
  }
  return null;
}

// A reading passage by id, with the course it belongs to, or null.
export function findPassage(passageId) {
  for (const course of courses) {
    const passage = (course.passages || []).find((p) => p.id === passageId);
    if (passage) return { course, passage };
  }
  return null;
}

// A grammar level by id (e.g. "boundaries-1"), with its category and course,
// or null. Mirrors findLevel() but walks course.grammar, a separate tree from
// course.categories — grammar levels are never vocabulary levels and vice
// versa, so the two lookups never collide.
export function findGrammarLevel(levelId) {
  for (const course of courses) {
    for (const category of course.grammar || []) {
      const level = category.levels.find((l) => l.id === levelId);
      if (level) return { course, category, level };
    }
  }
  return null;
}

// The course a category belongs to, or null for an unknown id.
export function getCategoryCourse(categoryId) {
  return courses.find((course) => course.categories.some((c) => c.id === categoryId)) || null;
}

// Flat lookup by level id (e.g. "agreement-support-2"), used by the
// study/quiz pages so routes don't need to know which category or course a
// level belongs to. Level ids are unique across every course.
export function findLevel(setId) {
  for (const course of courses) {
    for (const category of course.categories) {
      const level = category.levels.find((l) => l.id === setId);
      if (level) return { course, category, level };
    }
  }
  return null;
}

// A stable, deterministic ID for a single word, used by the spaced
// repetition system in lib/progress.js. Computed from the level it lives
// in + the word itself, so no ID needs to be hand-written into the data.
export function wordId(levelId, word) {
  return `${levelId}::${word.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

// Every word across every course/category/level, flattened into one list with
// its id and the course/category/level it belongs to attached. Used by the
// review screen and the spaced-repetition system, which deliberately pull
// from the whole library regardless of course — the daily habit loop is not
// scoped to one course.
export function getAllWordsFlat() {
  const flat = [];
  courses.forEach((course) => {
    course.categories.forEach((category) => {
      category.levels.forEach((level) => {
        level.words.forEach((w) => {
          flat.push({
            id: wordId(level.id, w.word),
            word: w.word,
            fact: w.fact,
            quiz: w.quiz,
            categoryId: category.id,
            categoryTitle: category.title,
            levelId: level.id,
            levelLabel: level.label,
            courseId: course.id,
            courseTitle: course.title,
          });
        });
      });
    });
  });
  return flat;
}

// Reserved setId suffix for a category's dynamic "still learning" course —
// not a real entry in `categories`, so it's special-cased by the study/quiz
// pages instead of going through findLevel(). One per category (not one
// global course), so learners can drill a specific weak spot instead of a
// mixed bag from everywhere. Real level ids always end in "-1"/"-2"/"-3", so
// this suffix can never collide with one.
const MISSED_WORDS_SUFFIX = "-missed-words";

export function missedWordsId(categoryId) {
  return `${categoryId}${MISSED_WORDS_SUFFIX}`;
}

// If setId looks like a category's "still learning" id, returns that
// category's real id (only if it actually matches a real category);
// otherwise null. Lets the study/quiz pages tell a normal level id apart
// from a dynamic one with a single check.
export function missedWordsCategoryId(setId) {
  if (!setId || !setId.endsWith(MISSED_WORDS_SUFFIX)) return null;
  const categoryId = setId.slice(0, -MISSED_WORDS_SUFFIX.length);
  return categories.some((c) => c.id === categoryId) ? categoryId : null;
}

// Resolves any setId to the category it belongs to, for paywall-gating
// study/quiz routes (see lib/purchase.js). Returns null for ids that don't
// belong to one category — an unrecognized id, or DUE_FOR_REVIEW_ID, which
// deliberately pools words from every category. That's safe to leave
// ungated: a word can only be due for review if the learner already
// studied it once, which means its category was unlocked at the time.
export function getSetCategoryId(setId) {
  const missedCategoryId = missedWordsCategoryId(setId);
  if (missedCategoryId) return missedCategoryId;
  const found = findLevel(setId);
  return found ? found.category.id : null;
}

// Builds a synthetic category+level, shaped exactly like what findLevel()
// returns, out of whichever words *in this one category* are currently
// struggling (Leitner box 1) — so the existing /sets/[setId]/study and
// .../quiz routes can be reused for it without any new pages. Takes the
// struggling word ids as a plain array rather than reading progress data
// directly, so this file stays free of any localStorage dependency,
// matching the rest of this module — callers (client components) are
// responsible for loading that list.
//
// Each word keeps its true source id in `srsId`, so answering a question
// here updates the word's *real* box in lib/progress.js — not a separate
// "missed-words::word" record disconnected from the rest of its history.
export function getMissedWordsLevel(categoryId, struggleIds) {
  const idSet = new Set(struggleIds);
  const parentCategory = categories.find((c) => c.id === categoryId);
  const words = getAllWordsFlat()
    .filter((w) => w.categoryId === categoryId && idSet.has(w.id))
    .map((w) => ({ word: w.word, fact: w.fact, quiz: w.quiz, srsId: w.id }));

  return {
    category: {
      id: missedWordsId(categoryId),
      title: parentCategory ? parentCategory.title : "Missed Words",
      description: "Words you've gotten wrong most recently in this category.",
    },
    level: {
      id: missedWordsId(categoryId),
      level: 0,
      label: "Still learning",
      words,
    },
  };
}

// Reserved setId for a "study before you quiz" pass over every word
// currently due for review, pooled across every category — the study-mode
// counterpart to /review. Deliberately global rather than per-category
// (unlike Missed Words): due-for-review is the one place that's supposed
// to put everything together in one list, so studying it should match.
export const DUE_FOR_REVIEW_ID = "due-for-review";

// Builds a synthetic category+level, shaped exactly like what findLevel()
// returns, out of a set of due word ids — so /sets/[setId]/study can be
// reused for it without a separate page. `dueWordIds` should already be
// prioritized and capped by the caller (see getDueWordIds() and
// REVIEW_SESSION_CAP in lib/progress.js) — this just attaches content and
// preserves whatever order it's given.
//
// Each word keeps its true source id in `srsId`, so studying here doesn't
// change any box on its own (study never calls recordWordResult — only
// quizzing does), but keeps the shape consistent with the other dynamic
// courses in case that ever changes.
export function getDueForReviewLevel(dueWordIds) {
  const byId = new Map(getAllWordsFlat().map((w) => [w.id, w]));
  const words = dueWordIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((w) => ({ word: w.word, fact: w.fact, quiz: w.quiz, srsId: w.id }));

  return {
    category: {
      id: DUE_FOR_REVIEW_ID,
      title: "Due for Review",
      description: "Every word due today, pulled from across every category.",
    },
    level: {
      id: DUE_FOR_REVIEW_ID,
      level: 0,
      label: "Across every category",
      words,
    },
  };
}
