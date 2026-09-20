// Everyday Vocabulary — the second course. Original writing (definitions,
// example sentences and quiz sentences), not drawn from any published word list.
//
// Same category > level > word shape and the same quiz format as the SAT course
// (see lib/wordbanks.js): a sentence with a blank, four plausible options, one
// precisely correct. Here that format is kept for a different reason — it
// teaches how a word is actually USED, not just what it means, which is good
// practice whether or not an exam is involved. The 3 levels (Foundational,
// Intermediate, Advanced) escalate the difficulty of the distractors, from
// clearly wrong to close near-synonyms.
//
// Deliberately NOT organized by argumentative function: that structure was
// justified by matching the real Digital SAT's test format, which doesn't apply
// here. This course is organized by THEME, in groupings a curious general
// reader would recognize. See CLAUDE.md ("Courses") for the reasoning.
//
// Never change level or word ids — users' localStorage references them.

export const everydayVocabularyCategories = [
  {
    id: "precise-description",
    title: "Precise Description",
    description: "Words that say exactly how something looks, sounds, or feels — the sharper alternative to nice, big, or very.",
    levels: [
      {
        id: "precise-description-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Vivid",
            fact: "\"Vivid\" means strikingly bright, clear, or lifelike. The vivid orange of the sunset made everyone on the beach stop and stare.",
            quiz: {
              sentence: "The mural used ______ colors that seemed to glow against the plain gray wall.",
              options: ["Vivid", "Faded", "Murky", "Colorless"],
              correctIndex: 0,
              explanation: "Colors that seem to glow are \"vivid\"; the others describe colors that are weak, cloudy, or missing altogether.",
            },
          },
          {
            word: "Sturdy",
            fact: "\"Sturdy\" means strongly built and not easily damaged or knocked over. He climbed onto the sturdy ladder and started painting the ceiling.",
            quiz: {
              sentence: "We needed a ______ shelf to hold all of Grandpa's heavy encyclopedias.",
              options: ["Sturdy", "Flimsy", "Delicate", "Tiny"],
              correctIndex: 0,
              explanation: "Holding heavy books takes something strongly built, which is \"sturdy\"; \"flimsy\" and \"delicate\" describe things that would collapse, and \"tiny\" says nothing about strength.",
            },
          },
          {
            word: "Cramped",
            fact: "\"Cramped\" means too small or tight to be comfortable. The cramped apartment had barely enough room for a bed and a desk.",
            quiz: {
              sentence: "Six of us squeezed into the ______ kitchen, bumping elbows every time someone reached for a spoon.",
              options: ["Cramped", "Spacious", "Spotless", "Ancient"],
              correctIndex: 0,
              explanation: "Bumping elbows in a small room describes a \"cramped\" space; \"spacious\" is the opposite, and the others don't say anything about size.",
            },
          },
          {
            word: "Faint",
            fact: "\"Faint\" means barely noticeable or weak in strength. The lights in the far window were so faint that I almost missed them.",
            quiz: {
              sentence: "From the far end of the hallway, we could catch only a ______ murmur of the conversation.",
              options: ["Faint", "Deafening", "Booming", "Shrill"],
              correctIndex: 0,
              explanation: "Catching only a little of a conversation from far away means it is barely audible, or \"faint\"; the others describe sounds that are loud or piercing.",
            },
          },
          {
            word: "Sleek",
            fact: "\"Sleek\" means smooth, glossy, and streamlined in shape. The sleek silver train glided out of the station without a sound.",
            quiz: {
              sentence: "The ______ black car slid through the parking lot, its polished surface reflecting every streetlight.",
              options: ["Sleek", "Bulky", "Rusty", "Battered"],
              correctIndex: 0,
              explanation: "A smooth, polished car with a streamlined shape is \"sleek\"; the others describe something clumsy, corroded, or damaged.",
            },
          },
          {
            word: "Bland",
            fact: "\"Bland\" means lacking flavor, spice, or interest. Plain rice with no sauce makes a bland dinner.",
            quiz: {
              sentence: "The soup was so ______ that everyone at the table reached for the salt.",
              options: ["Bland", "Peppery", "Salty", "Scalding"],
              correctIndex: 0,
              explanation: "Reaching for salt shows the soup had almost no flavor, which is \"bland\"; \"peppery\" and \"salty\" would make that unnecessary, and \"scalding\" describes temperature, not taste.",
            },
          },
          {
            word: "Gleaming",
            fact: "\"Gleaming\" means shining brightly, especially from being polished. After an hour of scrubbing, the pots were gleaming.",
            quiz: {
              sentence: "After hours of scrubbing, the kitchen floor was ______, and the ceiling lights were reflected in it.",
              options: ["Gleaming", "Grimy", "Sticky", "Cluttered"],
              correctIndex: 0,
              explanation: "A floor that reflects the ceiling lights is shining, or \"gleaming\"; the others describe a floor that is dirty, tacky, or covered with stuff.",
            },
          },
          {
            word: "Rugged",
            fact: "\"Rugged\" means rough and uneven, or tough and built for hard use. The hikers crossed the rugged hills in thick-soled boots.",
            quiz: {
              sentence: "Only a ______ truck with high wheels could make it up the rocky mountain trail.",
              options: ["Rugged", "Refined", "Delicate", "Glossy"],
              correctIndex: 0,
              explanation: "A rocky trail calls for something tough and built for rough ground, which is \"rugged\"; the other three describe things suited to smooth, gentle use.",
            },
          },
          {
            word: "Jagged",
            fact: "\"Jagged\" means having sharp, uneven points or edges. The jagged edge of the broken plate caught her thumb.",
            quiz: {
              sentence: "She was careful not to cut her hand on the ______ edge of the broken window glass.",
              options: ["Jagged", "Smooth", "Rounded", "Polished"],
              correctIndex: 0,
              explanation: "Broken glass leaves sharp, uneven edges, which is \"jagged\"; the others describe surfaces that wouldn't cut anyone.",
            },
          },
          {
            word: "Scarce",
            fact: "\"Scarce\" means hard to find or available in very small amounts. Parking is scarce downtown on game days.",
            quiz: {
              sentence: "After the storm, batteries and bottled water became ______ at the few stores that were still open.",
              options: ["Scarce", "Plentiful", "Colorful", "Ancient"],
              correctIndex: 0,
              explanation: "Items that are hard to find after a storm are \"scarce\"; \"plentiful\" is the opposite, and the others don't describe supply.",
            },
          },
          {
            word: "Sluggish",
            fact: "\"Sluggish\" means slow-moving and lacking energy. The old computer was so sluggish that it took a full minute to open a file.",
            quiz: {
              sentence: "After the enormous lunch, I felt ______ all afternoon and could barely keep my eyes open at my desk.",
              options: ["Sluggish", "Energetic", "Nimble", "Jumpy"],
              correctIndex: 0,
              explanation: "Feeling heavy and sleepy after a big meal is \"sluggish\"; the other three describe someone lively or quick.",
            },
          },
          {
            word: "Vast",
            fact: "\"Vast\" means extremely large in area or amount. A vast field of sunflowers stretched all the way to the horizon.",
            quiz: {
              sentence: "From the airplane window, the ______ desert seemed to go on forever without a single road or building.",
              options: ["Vast", "Tiny", "Crowded", "Narrow"],
              correctIndex: 0,
              explanation: "Something that seems to go on forever is enormously large, or \"vast\"; \"tiny\" and \"narrow\" are the opposite, and \"crowded\" contradicts the empty scene.",
            },
          },
        ],
      },
      {
        id: "precise-description-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Meticulous",
            fact: "\"Meticulous\" means showing extreme care and attention to small details. The jeweler was meticulous, checking every stone under a magnifying glass.",
            quiz: {
              sentence: "The baker was so ______ that every cookie on the tray had exactly the same number of chocolate chips.",
              options: ["Meticulous", "Generous", "Ambitious", "Cheerful"],
              correctIndex: 0,
              explanation: "Counting chips so every cookie matches shows extreme attention to detail, which is \"meticulous\"; the others are personality traits that don't explain the counting.",
            },
          },
          {
            word: "Sparse",
            fact: "\"Sparse\" means thinly scattered or present in small numbers. The sparse crowd at the Tuesday matinee left rows of empty seats.",
            quiz: {
              sentence: "The crowd at the Tuesday show was so ______ that we had our pick of any seat in the theater.",
              options: ["Sparse", "Rowdy", "Diverse", "Restless"],
              correctIndex: 0,
              explanation: "A crowd small enough to leave every seat open is \"sparse\"; the others describe how an audience behaves or who is in it, not how many people came.",
            },
          },
          {
            word: "Ornate",
            fact: "\"Ornate\" means elaborately decorated with fine detail. The ornate clock was covered in tiny carved leaves and gold trim.",
            quiz: {
              sentence: "The hotel lobby was so ______ that gold trim framed every mirror and carved figures lined the ceiling.",
              options: ["Ornate", "Plain", "Cavernous", "Weathered"],
              correctIndex: 0,
              explanation: "Gold trim and carved figures everywhere describe a richly decorated room, or \"ornate\"; \"plain\" is the opposite, and the others describe size or wear.",
            },
          },
          {
            word: "Brittle",
            fact: "\"Brittle\" means hard but easily broken or snapped. Old candy can turn brittle and crack when you bite it.",
            quiz: {
              sentence: "After years in the sun, the plastic chair had turned so ______ that it cracked the moment he sat down.",
              options: ["Brittle", "Flexible", "Sticky", "Heavy"],
              correctIndex: 0,
              explanation: "A hard material that cracks under a little weight is \"brittle\"; \"flexible\" is the opposite, and \"sticky\" and \"heavy\" wouldn't cause cracking.",
            },
          },
          {
            word: "Tangible",
            fact: "\"Tangible\" means real enough to be touched or clearly measured. The team wanted tangible results, not just promises.",
            quiz: {
              sentence: "The manager wanted ______ proof of progress, something she could hold in her hands, not just promises in a meeting.",
              options: ["Tangible", "Abstract", "Immediate", "Impressive"],
              correctIndex: 0,
              explanation: "Proof she can hold in her hands is real and touchable, or \"tangible\"; \"abstract\" is the opposite, and \"immediate\" and \"impressive\" describe timing and quality, not whether it can be touched.",
            },
          },
          {
            word: "Muted",
            fact: "\"Muted\" means softened or subdued in color, sound, or feeling. The room's muted greens and grays made it feel calm.",
            quiz: {
              sentence: "She chose ______ shades of gray and olive for the outfit so that nothing would draw attention.",
              options: ["Muted", "Radiant", "Clashing", "Glossy"],
              correctIndex: 0,
              explanation: "Soft, quiet colors that don't draw attention are \"muted\"; the others describe colors that stand out.",
            },
          },
          {
            word: "Pungent",
            fact: "\"Pungent\" means having a sharp, strong smell or taste. The pungent smell of raw onions filled the kitchen.",
            quiz: {
              sentence: "The ______ odor of the fermenting cabbage made him wrinkle his nose from across the room.",
              options: ["Pungent", "Fragrant", "Subtle", "Stale"],
              correctIndex: 0,
              explanation: "A sharp, strong smell that makes you wrinkle your nose is \"pungent\"; \"fragrant\" would be pleasant, \"subtle\" would be mild, and \"stale\" means flat or old.",
            },
          },
          {
            word: "Erratic",
            fact: "\"Erratic\" means unpredictable and not following a steady pattern. The erratic bus schedule made it hard to plan mornings.",
            quiz: {
              sentence: "The bus was so ______ that some mornings it arrived ten minutes early and other mornings it never came at all.",
              options: ["Erratic", "Reliable", "Punctual", "Crowded"],
              correctIndex: 0,
              explanation: "Arriving early one day and not at all another is unpredictable, or \"erratic\"; \"reliable\" and \"punctual\" are the opposite, and \"crowded\" says nothing about timing.",
            },
          },
          {
            word: "Haphazard",
            fact: "\"Haphazard\" means done without any order or plan. The books were piled in a haphazard heap by the door.",
            quiz: {
              sentence: "The shelves were stacked in such a ______ way that cookbooks sat beside paint cans with no pattern at all.",
              options: ["Haphazard", "Deliberate", "Symmetrical", "Fragile"],
              correctIndex: 0,
              explanation: "No pattern at all means arranged without a plan, or \"haphazard\"; \"deliberate\" and \"symmetrical\" describe careful order, and \"fragile\" is about breakability.",
            },
          },
          {
            word: "Lucid",
            fact: "\"Lucid\" means clearly expressed and easy to understand. Her lucid explanation cleared up the confusing instructions.",
            quiz: {
              sentence: "Her ______ explanation of the tax form finally made everything make sense to the whole table.",
              options: ["Lucid", "Lengthy", "Hurried", "Polite"],
              correctIndex: 0,
              explanation: "An explanation that finally makes things clear is \"lucid\"; the others describe how long, how fast, or how courteous it was, not how clear.",
            },
          },
          {
            word: "Compact",
            fact: "\"Compact\" means small and neatly arranged to save space. A compact car is easy to squeeze into a tight parking spot.",
            quiz: {
              sentence: "The ______ laptop slid easily into her tote bag next to a water bottle and a paperback.",
              options: ["Compact", "Bulky", "Obsolete", "Sensitive"],
              correctIndex: 0,
              explanation: "Fitting easily alongside other items in a small bag describes something small and space-saving, or \"compact\"; \"bulky\" is the opposite.",
            },
          },
          {
            word: "Grueling",
            fact: "\"Grueling\" means extremely tiring and demanding. The grueling hike left everyone too sore to walk the next day.",
            quiz: {
              sentence: "After a ______ twelve-hour shift on his feet, he could barely climb the stairs to his apartment.",
              options: ["Grueling", "Rewarding", "Leisurely", "Routine"],
              correctIndex: 0,
              explanation: "A shift that leaves someone barely able to climb stairs is exhausting, or \"grueling\"; \"leisurely\" is the opposite, and \"rewarding\" and \"routine\" don't explain the exhaustion.",
            },
          },
        ],
      },
      {
        id: "precise-description-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Terse",
            fact: "\"Terse\" means using very few words, in a way that can seem abrupt. His terse reply, \"Fine,\" ended the conversation.",
            quiz: {
              sentence: "Her reply was so ______ that it felt almost rude: just a single \"No,\" with no explanation and no goodbye.",
              options: ["Terse", "Concise", "Succinct", "Reserved"],
              correctIndex: 0,
              explanation: "A one-word answer that feels almost rude is abrupt as well as brief, which is \"terse\"; \"concise\" and \"succinct\" praise efficient brevity, and \"reserved\" describes a personality, not a reply.",
            },
          },
          {
            word: "Frugal",
            fact: "\"Frugal\" means careful about spending money and avoiding waste. The frugal traveler packed lunches instead of eating out.",
            quiz: {
              sentence: "He was ______ with his own money, clipping coupons and reusing bags, yet never hesitated to pick up the bill for his friends.",
              options: ["Frugal", "Stingy", "Miserly", "Cheap"],
              correctIndex: 0,
              explanation: "Being careful with money while staying generous to others is \"frugal\"; \"stingy,\" \"miserly,\" and \"cheap\" all suggest an unwillingness to spend on anyone, which the end of the sentence contradicts.",
            },
          },
          {
            word: "Ubiquitous",
            fact: "\"Ubiquitous\" means seeming to be present everywhere at once. Smartphones are now ubiquitous, from classrooms to construction sites.",
            quiz: {
              sentence: "By mid-December the smell of pine had become ______, drifting out of every shop, lobby, and elevator in town.",
              options: ["Ubiquitous", "Prominent", "Conspicuous", "Familiar"],
              correctIndex: 0,
              explanation: "A smell turning up in every shop, lobby, and elevator is present everywhere, which is \"ubiquitous\"; \"prominent\" and \"conspicuous\" mean easy to notice, and \"familiar\" says nothing about how widespread it is.",
            },
          },
          {
            word: "Nuanced",
            fact: "\"Nuanced\" means marked by small, subtle distinctions rather than all-or-nothing judgments. A nuanced review praised the acting but questioned the pacing.",
            quiz: {
              sentence: "Her ______ view of the debate weighed the fine differences between the two positions and refused to call either side entirely right or entirely wrong.",
              options: ["Nuanced", "Vague", "Neutral", "Ambivalent"],
              correctIndex: 0,
              explanation: "A view that carefully weighs subtle differences is \"nuanced\"; \"vague\" means unclear, \"neutral\" means taking no side, and \"ambivalent\" means torn between feelings, none of which describes a detailed, precise view.",
            },
          },
          {
            word: "Fleeting",
            fact: "\"Fleeting\" means lasting only a very short time. Fame can be fleeting; last year's stars are already forgotten.",
            quiz: {
              sentence: "The joy of winning was ______; by the next morning she was already worrying about the next round.",
              options: ["Fleeting", "Superficial", "Muted", "Hollow"],
              correctIndex: 0,
              explanation: "A joy that was gone by the next morning was short-lived, or \"fleeting\"; \"superficial,\" \"muted,\" and \"hollow\" describe its depth or strength, not how long it lasted.",
            },
          },
          {
            word: "Austere",
            fact: "\"Austere\" means severely plain and strict, with no comfort or luxury. The monks lived an austere life of early mornings and simple meals.",
            quiz: {
              sentence: "The monk's ______ lifestyle allowed no comforts at all: no heating, no meat, and no idle conversation.",
              options: ["Austere", "Modest", "Humble", "Frugal"],
              correctIndex: 0,
              explanation: "A lifestyle of strict self-denial with no comforts is \"austere\"; \"modest\" and \"humble\" describe being unshowy, and \"frugal\" is about spending, none of which captures the severity.",
            },
          },
          {
            word: "Ostentatious",
            fact: "\"Ostentatious\" means designed to show off wealth or importance. Wearing a diamond watch to a picnic struck everyone as ostentatious.",
            quiz: {
              sentence: "The car he bought was ______, chosen less for comfort than to make sure every neighbor noticed it.",
              options: ["Ostentatious", "Luxurious", "Expensive", "Spacious"],
              correctIndex: 0,
              explanation: "A purchase meant to be noticed by others is \"ostentatious\"; \"luxurious\" and \"expensive\" describe quality or price, and \"spacious\" describes room, not the wish to impress.",
            },
          },
          {
            word: "Ambient",
            fact: "\"Ambient\" means existing in the immediate surroundings, like background light or sound. The ambient temperature in the cave stayed cool all year.",
            quiz: {
              sentence: "The café's ______ noise, a soft blend of chatter and clinking cups that seemed to come from everywhere at once, made it easy to focus on her work.",
              options: ["Ambient", "Muffled", "Distant", "Rhythmic"],
              correctIndex: 0,
              explanation: "Background sound that fills the surrounding space is \"ambient\"; \"muffled\" means dulled, \"distant\" means far away, and \"rhythmic\" means following a regular beat, none of which names a sound that simply surrounds you.",
            },
          },
          {
            word: "Gaunt",
            fact: "\"Gaunt\" means very thin and bony, often from illness or hunger. After weeks in the hospital, he looked pale and gaunt.",
            quiz: {
              sentence: "After weeks of illness he looked ______, his cheekbones sharp beneath loose skin.",
              options: ["Gaunt", "Slender", "Lean", "Wiry"],
              correctIndex: 0,
              explanation: "Sharp cheekbones after a long illness point to unhealthy thinness, which is \"gaunt\"; \"slender,\" \"lean,\" and \"wiry\" describe thinness that looks healthy or strong.",
            },
          },
          {
            word: "Opaque",
            fact: "\"Opaque\" means not able to be seen through, or hard to understand. The opaque glass blocked the view into the room.",
            quiz: {
              sentence: "The company's finances were ______: no one outside the board could see where the money went.",
              options: ["Opaque", "Complex", "Convoluted", "Cryptic"],
              correctIndex: 0,
              explanation: "Finances no outsider can see into are \"opaque\"; \"complex\" and \"convoluted\" mean complicated, and \"cryptic\" means puzzling, but none of them means hidden from view.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "emotional-nuance",
    title: "Emotional Nuance",
    description: "Words for the shades of feeling that \"happy,\" \"sad,\" and \"mad\" can't quite capture.",
    levels: [
      {
        id: "emotional-nuance-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Thrilled",
            fact: "\"Thrilled\" means extremely excited and pleased. The kids were thrilled to see snow on the first day of vacation.",
            quiz: {
              sentence: "She was ______ when the letter arrived saying she had won two front-row tickets to her favorite band.",
              options: ["Thrilled", "Disappointed", "Bored", "Annoyed"],
              correctIndex: 0,
              explanation: "Winning front-row tickets to a favorite band would make someone extremely happy, or \"thrilled\"; the others describe unhappy or uninterested feelings.",
            },
          },
          {
            word: "Bored",
            fact: "\"Bored\" means tired and restless because something isn't interesting. The bored children counted the ceiling tiles.",
            quiz: {
              sentence: "The lecture dragged on for two hours, and by the end everyone in the back row was ______, doodling in the margins of their notes.",
              options: ["Bored", "Fascinated", "Alarmed", "Grateful"],
              correctIndex: 0,
              explanation: "Doodling through a long lecture shows a lack of interest, or being \"bored\"; \"fascinated\" is the opposite, and \"alarmed\" and \"grateful\" don't fit the scene.",
            },
          },
          {
            word: "Lonely",
            fact: "\"Lonely\" means sad because of having no one to talk to or be with. He felt lonely in the big house after his roommates moved out.",
            quiz: {
              sentence: "After moving to a city where she knew nobody, she felt ______ every Saturday night.",
              options: ["Lonely", "Crowded", "Furious", "Energized"],
              correctIndex: 0,
              explanation: "Knowing nobody in a new city leads to feeling alone, or \"lonely\"; the others don't follow from having no company.",
            },
          },
          {
            word: "Jealous",
            fact: "\"Jealous\" means unhappy because someone else has something you want. He felt jealous when his cousin showed off a brand-new phone.",
            quiz: {
              sentence: "He couldn't help feeling ______ when his best friend showed off the new bike he had been saving for all year.",
              options: ["Jealous", "Relieved", "Amused", "Sleepy"],
              correctIndex: 0,
              explanation: "Wanting what a friend has, and being unhappy about it, is \"jealous\"; the others don't match watching someone else get the thing you wanted.",
            },
          },
          {
            word: "Grumpy",
            fact: "\"Grumpy\" means in a bad mood and easily annoyed. My dad is grumpy until he's had his coffee.",
            quiz: {
              sentence: "He was ______ all morning because he had missed the bus and hadn't had any coffee.",
              options: ["Grumpy", "Joyful", "Talkative", "Generous"],
              correctIndex: 0,
              explanation: "A bad morning leaves someone in a bad mood, or \"grumpy\"; the others describe pleasant or friendly states.",
            },
          },
          {
            word: "Relieved",
            fact: "\"Relieved\" means comforted because something worrying has ended or turned out fine. We were relieved when the storm finally passed.",
            quiz: {
              sentence: "When the doctor said the test results were clear, everyone in the waiting room felt ______.",
              options: ["Relieved", "Worried", "Insulted", "Confused"],
              correctIndex: 0,
              explanation: "Good news after a stressful wait brings relief, so \"relieved\" fits; the others describe unpleasant or unrelated reactions.",
            },
          },
          {
            word: "Curious",
            fact: "\"Curious\" means eager to learn or know something. The curious toddler opened every cabinet in the kitchen.",
            quiz: {
              sentence: "The children were ______ about the strange box on the porch and kept asking what could be inside.",
              options: ["Curious", "Uninterested", "Frightened", "Sleepy"],
              correctIndex: 0,
              explanation: "Asking again and again what's inside shows a strong wish to know, which is \"curious\"; the others don't match that eagerness.",
            },
          },
          {
            word: "Startled",
            fact: "\"Startled\" means suddenly surprised or slightly frightened. The startled cat leaped off the couch.",
            quiz: {
              sentence: "The cat leaped off the counter, ______ by a sudden clap of thunder.",
              options: ["Startled", "Comforted", "Amused", "Satisfied"],
              correctIndex: 0,
              explanation: "A sudden crash of thunder gives a quick jolt of fear, which is \"startled\"; the others describe calm or pleased reactions.",
            },
          },
          {
            word: "Content",
            fact: "\"Content\" means quietly satisfied, wanting nothing more. She sat by the fire, perfectly content with her tea and her book.",
            quiz: {
              sentence: "With a warm blanket, a good book, and rain on the window, he felt perfectly ______.",
              options: ["Content", "Restless", "Miserable", "Furious"],
              correctIndex: 0,
              explanation: "Feeling quietly satisfied with a cozy setup is being \"content\"; the others describe unhappy or agitated states.",
            },
          },
          {
            word: "Disgusted",
            fact: "\"Disgusted\" means feeling strong dislike or sickness at something unpleasant. He was disgusted by the smell of the overflowing trash.",
            quiz: {
              sentence: "She felt ______ when she opened the fridge and found that the forgotten leftovers had turned green.",
              options: ["Disgusted", "Delighted", "Flattered", "Sleepy"],
              correctIndex: 0,
              explanation: "Moldy leftovers cause revulsion, which is \"disgusted\"; the others describe pleasant or unrelated feelings.",
            },
          },
          {
            word: "Overwhelmed",
            fact: "\"Overwhelmed\" means buried under more than one can handle. She was overwhelmed by the pile of unread emails.",
            quiz: {
              sentence: "With three deadlines due tomorrow and a full inbox, she felt completely ______.",
              options: ["Overwhelmed", "Relaxed", "Puzzled", "Flattered"],
              correctIndex: 0,
              explanation: "Too many demands at once leaves someone \"overwhelmed\"; \"relaxed\" is the opposite, and the others don't describe being buried in work.",
            },
          },
          {
            word: "Homesick",
            fact: "\"Homesick\" means sad from missing your home and family. He was homesick during his first week at camp.",
            quiz: {
              sentence: "During his first week at summer camp, he felt ______ and wrote long letters asking to come home.",
              options: ["Homesick", "Adventurous", "Triumphant", "Sleepy"],
              correctIndex: 0,
              explanation: "Asking to come home shows a longing for home, which is \"homesick\"; the others don't explain why he would want to leave.",
            },
          },
        ],
      },
      {
        id: "emotional-nuance-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Apprehensive",
            fact: "\"Apprehensive\" means uneasy or worried that something bad may happen. He felt apprehensive before the results came in.",
            quiz: {
              sentence: "She felt ______ about the meeting, unsure whether the news would be good or bad.",
              options: ["Apprehensive", "Skeptical", "Reluctant", "Indignant"],
              correctIndex: 0,
              explanation: "Uneasy anticipation of news that could be bad is \"apprehensive\"; \"skeptical\" means doubtful, \"reluctant\" means unwilling, and \"indignant\" means angry.",
            },
          },
          {
            word: "Resentful",
            fact: "\"Resentful\" means feeling bitter anger about being treated unfairly. She grew resentful when others took credit for her work.",
            quiz: {
              sentence: "She grew ______ toward her coworkers after years of watching them take credit for her ideas.",
              options: ["Resentful", "Envious", "Nostalgic", "Discouraged"],
              correctIndex: 0,
              explanation: "Lasting bitterness over unfair treatment is \"resentful\"; \"envious\" is wanting what another has, \"nostalgic\" is fond longing for the past, and \"discouraged\" means having lost hope.",
            },
          },
          {
            word: "Exasperated",
            fact: "\"Exasperated\" means extremely irritated and frustrated, especially after repeated annoyance. The exasperated teacher rubbed her forehead.",
            quiz: {
              sentence: "After explaining the rules for the fourth time, the teacher was openly ______.",
              options: ["Exasperated", "Curious", "Grateful", "Amused"],
              correctIndex: 0,
              explanation: "Having to repeat instructions again and again leaves someone at the end of their patience, or \"exasperated\"; the others describe pleasant or curious reactions.",
            },
          },
          {
            word: "Sheepish",
            fact: "\"Sheepish\" means embarrassed because of a small mistake or misdeed. He looked sheepish when he realized he had locked the keys in the car.",
            quiz: {
              sentence: "He gave a ______ grin, his ears turning pink, as he admitted he had eaten the last slice of cake.",
              options: ["Sheepish", "Defiant", "Smug", "Bewildered"],
              correctIndex: 0,
              explanation: "A shy, slightly embarrassed grin about a small misdeed is \"sheepish\"; \"defiant\" and \"smug\" would show no embarrassment, and \"bewildered\" means confused.",
            },
          },
          {
            word: "Bewildered",
            fact: "\"Bewildered\" means deeply confused and unable to make sense of things. The bewildered tourists studied the map upside down.",
            quiz: {
              sentence: "The travelers stood ______ in the middle of the station, staring at signs in a language none of them could read.",
              options: ["Bewildered", "Startled", "Intrigued", "Amused"],
              correctIndex: 0,
              explanation: "Being unable to make sense of unreadable signs is being \"bewildered\"; \"startled\" is sudden surprise, and \"intrigued\" and \"amused\" are pleasant reactions that don't fit being lost.",
            },
          },
          {
            word: "Disillusioned",
            fact: "\"Disillusioned\" means disappointed on discovering that something is not as good as you believed. She grew disillusioned with the job when the promised promotion never came.",
            quiz: {
              sentence: "He joined the firm believing every promise in the recruiting brochure, and within a year he grew ______ as he watched none of them come true.",
              options: ["Disillusioned", "Discouraged", "Nervous", "Grateful"],
              correctIndex: 0,
              explanation: "Losing a belief because the promises proved empty is being \"disillusioned\"; \"discouraged\" means losing hope in general, and \"nervous\" and \"grateful\" don't fit broken promises.",
            },
          },
          {
            word: "Indignant",
            fact: "\"Indignant\" means angry because something seems unfair or insulting. She was indignant when the waiter suggested she hadn't paid.",
            quiz: {
              sentence: "She was ______ when the cashier accused her of shoplifting, and she held up her receipt as proof.",
              options: ["Indignant", "Embarrassed", "Grateful", "Perplexed"],
              correctIndex: 0,
              explanation: "Anger at a false accusation is \"indignant\"; \"embarrassed\" and \"perplexed\" don't match the assertive response, and \"grateful\" doesn't fit at all.",
            },
          },
          {
            word: "Smug",
            fact: "\"Smug\" means annoyingly pleased with oneself. He wore a smug smile after winning the argument.",
            quiz: {
              sentence: "He wore a ______ smile as he pointed out, once again, that he had predicted the exact result.",
              options: ["Smug", "Modest", "Sympathetic", "Nervous"],
              correctIndex: 0,
              explanation: "Rubbing in an accurate prediction with a self-satisfied smile is \"smug\"; \"modest\" is the opposite, and the others don't match bragging.",
            },
          },
          {
            word: "Ambivalent",
            fact: "\"Ambivalent\" means having mixed, conflicting feelings about something. She felt ambivalent about the promotion: thrilled by the raise, dreading the longer hours.",
            quiz: {
              sentence: "She felt ______ about moving abroad, excited by the adventure yet dreading leaving her family.",
              options: ["Ambivalent", "Indifferent", "Apprehensive", "Reluctant"],
              correctIndex: 0,
              explanation: "Being pulled in two directions at once is \"ambivalent\"; \"indifferent\" means not caring either way, and \"apprehensive\" and \"reluctant\" each describe only one of her feelings.",
            },
          },
          {
            word: "Enthralled",
            fact: "\"Enthralled\" means completely captivated and unable to look away. The children sat enthralled by the storyteller.",
            quiz: {
              sentence: "The audience sat ______, no one moving or whispering, as the magician revealed the final trick.",
              options: ["Enthralled", "Amused", "Impressed", "Entertained"],
              correctIndex: 0,
              explanation: "Total stillness shows people are completely captivated, which is \"enthralled\"; \"amused,\" \"impressed,\" and \"entertained\" are milder reactions that wouldn't hold a room silent.",
            },
          },
          {
            word: "Dejected",
            fact: "\"Dejected\" means sad and discouraged, often after a disappointment. The dejected fans trudged out of the stadium.",
            quiz: {
              sentence: "The team walked off the field ______ after losing the final by a single point.",
              options: ["Dejected", "Defiant", "Composed", "Bewildered"],
              correctIndex: 0,
              explanation: "Sad and deflated after a narrow loss is \"dejected\"; \"defiant\" and \"composed\" don't describe sadness, and \"bewildered\" means confused.",
            },
          },
          {
            word: "Pensive",
            fact: "\"Pensive\" means deep in quiet thought, often with a touch of sadness. He grew pensive as he looked through old photographs.",
            quiz: {
              sentence: "He sat on the porch, ______, watching the light fade and turning the day's conversation over in his mind.",
              options: ["Pensive", "Distracted", "Idle", "Withdrawn"],
              correctIndex: 0,
              explanation: "Quietly turning something over in your mind is \"pensive\"; \"distracted\" and \"idle\" suggest a lack of focus, and \"withdrawn\" means pulling away from people.",
            },
          },
        ],
      },
      {
        id: "emotional-nuance-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Livid",
            fact: "\"Livid\" means furiously angry. He was livid when he saw the dent in his brand-new car.",
            quiz: {
              sentence: "When she discovered that her neighbor had cut down her favorite oak without asking, she was ______, shaking as she marched across the lawn.",
              options: ["Livid", "Irritated", "Upset", "Displeased"],
              correctIndex: 0,
              explanation: "Shaking with rage is far beyond mild annoyance, which makes it \"livid\"; \"irritated,\" \"upset,\" and \"displeased\" all describe much weaker feelings.",
            },
          },
          {
            word: "Jaded",
            fact: "\"Jaded\" means worn out and unimpressed from having seen or done too much. The jaded traveler yawned at yet another famous cathedral.",
            quiz: {
              sentence: "After decades of reviewing restaurants, the critic had grown ______; even a spectacular twelve-course dinner felt like just another Tuesday.",
              options: ["Jaded", "Disillusioned", "Weary", "Bitter"],
              correctIndex: 0,
              explanation: "Losing excitement through too much of the same experience is \"jaded\"; \"disillusioned\" means let down by a broken belief, \"weary\" means tired, and \"bitter\" means resentful, which nothing here suggests.",
            },
          },
          {
            word: "Sanguine",
            fact: "\"Sanguine\" means hopeful and optimistic, especially in a difficult situation. The coach stayed sanguine even after three straight losses.",
            quiz: {
              sentence: "Though the forecast looked grim, the farmer remained ______ that the rain would arrive before the crops failed.",
              options: ["Sanguine", "Complacent", "Naive", "Resigned"],
              correctIndex: 0,
              explanation: "Staying hopeful despite a bad outlook is \"sanguine\"; \"complacent\" means smugly unconcerned, \"naive\" means lacking experience, and \"resigned\" means having accepted the worst.",
            },
          },
          {
            word: "Resigned",
            fact: "\"Resigned\" means accepting something unpleasant without further protest. She gave a resigned sigh and put the umbrella away.",
            quiz: {
              sentence: "He shrugged, ______, having accepted that the flight would not be leaving tonight.",
              options: ["Resigned", "Indifferent", "Defeated", "Apathetic"],
              correctIndex: 0,
              explanation: "Quietly accepting an unwelcome fact is \"resigned\"; \"indifferent\" and \"apathetic\" mean not caring at all, and \"defeated\" suggests losing a struggle.",
            },
          },
          {
            word: "Petulant",
            fact: "\"Petulant\" means childishly sulky and bad-tempered when things don't go one's way. The petulant player threw his cap on the ground.",
            quiz: {
              sentence: "When he didn't get his way, he sank into a ______ silence, arms folded and lip stuck out like a child's.",
              options: ["Petulant", "Pensive", "Brooding", "Reserved"],
              correctIndex: 0,
              explanation: "Sulking childishly over not getting his way is \"petulant\"; \"pensive\" is thoughtful, \"brooding\" is dwelling darkly on something, and \"reserved\" is naturally quiet.",
            },
          },
          {
            word: "Euphoric",
            fact: "\"Euphoric\" means intensely, almost dizzyingly happy. She felt euphoric as she crossed the finish line.",
            quiz: {
              sentence: "Standing at the summit after hours of thin air, she felt ______, almost light-headed with joy.",
              options: ["Euphoric", "Content", "Satisfied", "Pleased"],
              correctIndex: 0,
              explanation: "Joy so strong it makes you light-headed is \"euphoric\"; \"content,\" \"satisfied,\" and \"pleased\" describe far milder happiness.",
            },
          },
          {
            word: "Contrite",
            fact: "\"Contrite\" means feeling and showing sincere regret for having done wrong. The contrite driver apologized to everyone he had cut off.",
            quiz: {
              sentence: "After realizing his joke had genuinely wounded a friend, he was ______, and he spent the rest of dinner trying to make amends.",
              options: ["Contrite", "Sheepish", "Defensive", "Reluctant"],
              correctIndex: 0,
              explanation: "Real remorse for hurting others is \"contrite\"; \"sheepish\" is mild embarrassment over a small slip, \"defensive\" means protecting oneself, and \"reluctant\" means unwilling.",
            },
          },
          {
            word: "Wry",
            fact: "\"Wry\" means dryly humorous, often with a hint of irony. Her wry remark about the rain made everyone laugh.",
            quiz: {
              sentence: "Stuck in the traffic jam, she gave a ______, good-humored smile and remarked, deadpan, that it was a great chance to appreciate the scenery.",
              options: ["Wry", "Smug", "Sardonic", "Sincere"],
              correctIndex: 0,
              explanation: "A dry, gently ironic joke delivered with a straight face is \"wry\"; \"sardonic\" would be bitter and scornful, \"smug\" is self-satisfied, and \"sincere\" means she meant it literally, with no irony.",
            },
          },
          {
            word: "Poignant",
            fact: "\"Poignant\" means sharply touching or affecting, often bittersweet. The poignant final scene had half the audience in tears.",
            quiz: {
              sentence: "The ______ closing scene, quiet and understated, in which the old man returns to his empty childhood home, left half the audience in tears.",
              options: ["Poignant", "Sentimental", "Melodramatic", "Dramatic"],
              correctIndex: 0,
              explanation: "A scene that deeply, genuinely touches people is \"poignant\"; \"sentimental\" and \"melodramatic\" suggest exaggerated emotion, and \"dramatic\" says nothing about being touching.",
            },
          },
          {
            word: "Effusive",
            fact: "\"Effusive\" means expressing feelings in a lavish, gushing, unrestrained way. Her effusive thanks embarrassed the shy delivery driver.",
            quiz: {
              sentence: "Her ______ thanks, pouring out for a full five minutes over a simple jar of jam, left the neighbor blushing.",
              options: ["Effusive", "Sincere", "Courteous", "Reserved"],
              correctIndex: 0,
              explanation: "Gushing thanks that go on and on are \"effusive\"; \"sincere\" and \"courteous\" say nothing about the excess, and \"reserved\" is the opposite.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "persuasion-influence",
    title: "Persuasion & Influence",
    description: "Words for convincing, urging, pressuring, and swaying people — in conversation, writing, and everyday life.",
    levels: [
      {
        id: "persuasion-influence-1",
        level: 1,
        label: "Foundational",
        words: [
          {
            word: "Persuade",
            fact: "\"Persuade\" means to convince someone to do or believe something by giving reasons. He persuaded his parents to let him stay out late for the concert.",
            quiz: {
              sentence: "It took an hour of careful arguments, but she finally managed to ______ her dad, and the puppy came home that weekend.",
              options: ["Persuade", "Ignore", "Forbid", "Forget"],
              correctIndex: 0,
              explanation: "Winning her dad over with arguments is to \"persuade\" him; the others describe doing nothing, blocking, or overlooking.",
            },
          },
          {
            word: "Urge",
            fact: "\"Urge\" means to strongly encourage someone to do something. The mayor urged residents to stay indoors during the storm.",
            quiz: {
              sentence: "After the operation, the doctor ______ rest for at least a full week.",
              options: ["Urged", "Discouraged", "Forgot", "Refused"],
              correctIndex: 0,
              explanation: "Strongly recommending rest is to \"urge\" it; \"discouraged\" is the opposite, and \"forgot\" and \"refused\" don't fit a doctor's advice.",
            },
          },
          {
            word: "Pressure",
            fact: "\"Pressure\" means to push someone hard to do something, often making them uncomfortable. Don't let anyone pressure you into signing.",
            quiz: {
              sentence: "The salesman kept trying to ______ them, hovering until they agreed to buy the extended warranty.",
              options: ["Pressure", "Praise", "Thank", "Greet"],
              correctIndex: 0,
              explanation: "Hovering until they give in is pushing hard, or to \"pressure\"; the others are friendly acts that don't force anyone.",
            },
          },
          {
            word: "Tempt",
            fact: "\"Tempt\" means to make someone want to do something, especially something they shouldn't. The smell of fresh doughnuts tempted him off his diet.",
            quiz: {
              sentence: "The smell of warm cinnamon rolls began to ______ him, and his diet didn't last the morning.",
              options: ["Tempt", "Protect", "Bore", "Warn"],
              correctIndex: 0,
              explanation: "A smell pulling him off his diet is to \"tempt\" him; the others don't describe drawing someone toward something they want.",
            },
          },
          {
            word: "Influence",
            fact: "\"Influence\" means to have an effect on someone's choices or opinions. Friends often influence what music we listen to.",
            quiz: {
              sentence: "Older siblings often ______ their younger brothers' taste in music without even trying.",
              options: ["Influence", "Erase", "Repair", "Measure"],
              correctIndex: 0,
              explanation: "Shaping someone's tastes without trying is to \"influence\" them; the others don't describe an effect on preferences.",
            },
          },
          {
            word: "Bribe",
            fact: "\"Bribe\" means to give someone something, often improperly, to get them to do what you want. He tried to bribe the guard with a twenty-dollar bill.",
            quiz: {
              sentence: "The little boy tried to ______ his sister with half his dessert so she wouldn't tell their mom.",
              options: ["Bribe", "Thank", "Scold", "Ignore"],
              correctIndex: 0,
              explanation: "Offering dessert in exchange for silence is to \"bribe\"; the others don't involve trading something to get a favor.",
            },
          },
          {
            word: "Nag",
            fact: "\"Nag\" means to keep asking or complaining in an annoying way. She had to nag her brother again and again about his homework.",
            quiz: {
              sentence: "She had to ______ her brother three times before he finally took out the trash.",
              options: ["Nag", "Trust", "Photograph", "Outrun"],
              correctIndex: 0,
              explanation: "Asking again and again until it gets done is to \"nag\"; the others don't describe repeated requests.",
            },
          },
          {
            word: "Flatter",
            fact: "\"Flatter\" means to praise someone too much, often to win their favor. She flattered the manager, hoping for a day off.",
            quiz: {
              sentence: "He tried to ______ the manager with compliments about her haircut, hoping to get Friday off.",
              options: ["Flatter", "Insult", "Interrupt", "Correct"],
              correctIndex: 0,
              explanation: "Piling on compliments to win a favor is to \"flatter\"; the others would hurt his chances rather than help.",
            },
          },
          {
            word: "Bargain",
            fact: "\"Bargain\" means to discuss a price or deal until both sides agree. Tourists are expected to bargain at the market.",
            quiz: {
              sentence: "Visitors were expected to ______ over the price of every souvenir at the crowded market.",
              options: ["Bargain", "Apologize", "Whisper", "Applaud"],
              correctIndex: 0,
              explanation: "Haggling over prices is to \"bargain\"; the others aren't ways to settle a price.",
            },
          },
          {
            word: "Recruit",
            fact: "\"Recruit\" means to persuade people to join a team, group, or effort. The club recruited three new members at the fair.",
            quiz: {
              sentence: "The coach spent all summer trying to ______ new players for the struggling team.",
              options: ["Recruit", "Fire", "Ban", "Bench"],
              correctIndex: 0,
              explanation: "Getting new players to join is to \"recruit\"; \"fire,\" \"ban,\" and \"bench\" all remove or sideline people.",
            },
          },
          {
            word: "Warn",
            fact: "\"Warn\" means to tell someone about a danger or problem so they can avoid it. The sign warned drivers about the icy bridge.",
            quiz: {
              sentence: "The lifeguard blew her whistle to ______ the swimmers as the storm rolled in.",
              options: ["Warn", "Amuse", "Invite", "Reward"],
              correctIndex: 0,
              explanation: "A whistle blown as a storm arrives alerts people to danger, which is to \"warn\"; the others don't fit an emergency.",
            },
          },
          {
            word: "Promote",
            fact: "\"Promote\" means to publicize something so more people want it. The theater promoted the new film with posters all over town.",
            quiz: {
              sentence: "The bakery hired a student to ______ its new sandwiches with flyers around campus.",
              options: ["Promote", "Hide", "Ban", "Refund"],
              correctIndex: 0,
              explanation: "Handing out flyers to get people interested is to \"promote\"; the others would keep people away or give money back.",
            },
          },
        ],
      },
      {
        id: "persuasion-influence-2",
        level: 2,
        label: "Intermediate",
        words: [
          {
            word: "Coax",
            fact: "\"Coax\" means to gently and patiently persuade someone. She coaxed the shy kitten out from under the couch with a bowl of tuna.",
            quiz: {
              sentence: "The patient instructor ______ the nervous new swimmers into the deep end one small step at a time.",
              options: ["Coaxed", "Forced", "Tricked", "Ordered"],
              correctIndex: 0,
              explanation: "Gently guiding nervous swimmers one small step at a time is to \"coax\"; \"forced\" and \"ordered\" are the opposite of gentle, and \"tricked\" implies deception.",
            },
          },
          {
            word: "Entice",
            fact: "\"Entice\" means to attract someone by offering something pleasing. The bakery enticed passersby with free samples.",
            quiz: {
              sentence: "The store tried to ______ shoppers inside with a giant sign promising free samples.",
              options: ["Entice", "Warn", "Require", "Reassure"],
              correctIndex: 0,
              explanation: "Using a sign to draw people in with a treat is to \"entice\"; \"warn\" and \"require\" push people away or force them, and \"reassure\" calms worries.",
            },
          },
          {
            word: "Implore",
            fact: "\"Implore\" means to beg someone earnestly to do something. She implored the driver to wait a moment longer.",
            quiz: {
              sentence: "The mother's voice broke as she ______ the police chief, \"Please, don't stop looking for my son.\"",
              options: ["Implored", "Instructed", "Demanded", "Questioned"],
              correctIndex: 0,
              explanation: "A broken voice and a \"please\" show desperate begging, which is to \"implore\"; \"instructed\" and \"demanded\" suggest authority, and \"questioned\" means asking for information.",
            },
          },
          {
            word: "Lobby",
            fact: "\"Lobby\" means to try to influence officials or lawmakers to act a certain way. Parents lobbied the school board for safer crosswalks.",
            quiz: {
              sentence: "Parents began to ______ the school board, attending every meeting to push for safer crosswalks.",
              options: ["Lobby", "Ignore", "Replace", "Audit"],
              correctIndex: 0,
              explanation: "Pressing officials at every meeting for a change is to \"lobby\"; the others don't describe trying to influence a decision.",
            },
          },
          {
            word: "Appease",
            fact: "\"Appease\" means to calm someone down by giving them what they want. The airline gave passengers vouchers to appease them.",
            quiz: {
              sentence: "To ______ the angry customer, the manager offered a full refund and a free dessert.",
              options: ["Appease", "Scold", "Impress", "Question"],
              correctIndex: 0,
              explanation: "Giving in with a refund and a treat to calm someone is to \"appease\"; \"scold\" would only add to her anger, \"impress\" aims at admiration rather than calm, and \"question\" doesn't offer anything.",
            },
          },
          {
            word: "Rally",
            fact: "\"Rally\" means to bring people together in support of a cause. The mayor rallied the neighborhood behind the new playground.",
            quiz: {
              sentence: "The mayor hoped a free concert would ______ the whole neighborhood behind the park project.",
              options: ["Rally", "Divide", "Distract", "Educate"],
              correctIndex: 0,
              explanation: "Bringing everyone together in support is to \"rally\" them; \"divide\" is the opposite, and \"distract\" and \"educate\" don't build support.",
            },
          },
          {
            word: "Insinuate",
            fact: "\"Insinuate\" means to suggest something unpleasant indirectly, without saying it outright. He insinuated that she had taken the money.",
            quiz: {
              sentence: "She never accused him outright, but she seemed to ______ that he had been the one who took the money.",
              options: ["Insinuate", "Confess", "Prove", "Declare"],
              correctIndex: 0,
              explanation: "Hinting at blame without saying it is to \"insinuate\"; \"prove\" and \"declare\" are direct, and \"confess\" means admitting your own wrongdoing.",
            },
          },
          {
            word: "Incentive",
            fact: "\"Incentive\" means something that motivates a person to act. A free coffee is a small incentive to try a new cafe.",
            quiz: {
              sentence: "The bonus was meant as a strong ______ for the team to finish the project ahead of schedule.",
              options: ["Incentive", "Penalty", "Warning", "Excuse"],
              correctIndex: 0,
              explanation: "A bonus meant to motivate is an \"incentive\"; \"penalty\" and \"warning\" discourage, and an \"excuse\" explains failure.",
            },
          },
          {
            word: "Rhetoric",
            fact: "\"Rhetoric\" means language designed to persuade, often impressive-sounding but lacking substance. The speech was all rhetoric and no plan.",
            quiz: {
              sentence: "The candidate's speech was full of grand ______, but it contained no actual plan for fixing the roads.",
              options: ["Rhetoric", "Evidence", "Statistics", "Detail"],
              correctIndex: 0,
              explanation: "Impressive words without substance are \"rhetoric\"; \"evidence,\" \"statistics,\" and \"detail\" are exactly what the speech lacked.",
            },
          },
          {
            word: "Compelling",
            fact: "\"Compelling\" means strongly convincing or holding your attention. The lawyer made a compelling case that had the jury leaning forward.",
            quiz: {
              sentence: "The lawyer made such a ______ argument that even the skeptical jurors were nodding along.",
              options: ["Compelling", "Lengthy", "Polite", "Loud"],
              correctIndex: 0,
              explanation: "An argument that wins over skeptics is \"compelling\"; the others describe length, manners, or volume, which don't convince anyone.",
            },
          },
          {
            word: "Gullible",
            fact: "\"Gullible\" means too willing to believe things without checking. The gullible shopper believed the fake discount.",
            quiz: {
              sentence: "He was so ______ that he believed the stranger's story about needing bus fare, for the fourth time this month.",
              options: ["Gullible", "Generous", "Polite", "Curious"],
              correctIndex: 0,
              explanation: "Believing the same tale again and again is being \"gullible\"; \"generous\" and \"polite\" are kind traits but don't involve being easily fooled, and \"curious\" means eager to learn.",
            },
          },
          {
            word: "Bluff",
            fact: "\"Bluff\" means to pretend to have knowledge, strength, or a good hand in order to win an advantage. He bluffed his way through the interview.",
            quiz: {
              sentence: "He tried to ______ his way past the security desk by acting like he had been there a hundred times.",
              options: ["Bluff", "Apologize", "Hurry", "Stumble"],
              correctIndex: 0,
              explanation: "Pretending to belong in order to get through is to \"bluff\"; the others don't involve pretending to gain an advantage.",
            },
          },
        ],
      },
      {
        id: "persuasion-influence-3",
        level: 3,
        label: "Advanced",
        words: [
          {
            word: "Sophistry",
            fact: "\"Sophistry\" means clever-sounding reasoning that is actually misleading. The lawyer's sophistry made a weak case sound airtight.",
            quiz: {
              sentence: "His argument sounded brilliant until you noticed that every step quietly changed the meaning of a key word, so the conclusion only seemed to follow: pure ______.",
              options: ["Sophistry", "Eloquence", "Hyperbole", "Propaganda"],
              correctIndex: 0,
              explanation: "Reasoning that hides a trick behind clever wording is \"sophistry\"; \"eloquence\" is graceful, honest speech, \"hyperbole\" is exaggeration, and \"propaganda\" is one-sided material pushed to promote a cause.",
            },
          },
          {
            word: "Ingratiating",
            fact: "\"Ingratiating\" means deliberately trying to win favor by being charming or flattering. His ingratiating smile fooled no one.",
            quiz: {
              sentence: "The new hire's ______ smile and endless flattery made his motives obvious to everyone in the office.",
              options: ["Ingratiating", "Impressive", "Persuasive", "Welcoming"],
              correctIndex: 0,
              explanation: "A smile and flattery aimed at winning favor are \"ingratiating\"; \"impressive,\" \"persuasive,\" and \"welcoming\" don't carry the sense of calculated favor-seeking.",
            },
          },
          {
            word: "Manipulate",
            fact: "\"Manipulate\" means to control or influence someone cleverly, often unfairly or deceptively. The site manipulated shoppers with a fake countdown clock.",
            quiz: {
              sentence: "Some websites ______ shoppers by inventing a fake countdown clock that creates a false sense of urgency.",
              options: ["Manipulate", "Persuade", "Influence", "Inform"],
              correctIndex: 0,
              explanation: "Using a fake deadline to trick people is to \"manipulate\" them; \"persuade\" and \"influence\" can be honest, and \"inform\" means telling them the truth.",
            },
          },
          {
            word: "Pander",
            fact: "\"Pander\" means to cater to people's tastes or desires, often unworthily, to gain their approval. The show panders to viewers with cheap drama.",
            quiz: {
              sentence: "Rather than tell voters any hard truths, the candidate chose to ______ to them, promising free everything without saying how it would be paid for.",
              options: ["Pander", "Preach", "Lobby", "Campaign"],
              correctIndex: 0,
              explanation: "Telling people only what they want to hear, without substance, to win them over is to \"pander\"; \"preach\" means lecturing them, which is the opposite of promising them treats, \"lobby\" means pressing officials, and \"campaign\" is neutral.",
            },
          },
          {
            word: "Demagogue",
            fact: "\"Demagogue\" means a leader who wins support by stirring up emotions and prejudice instead of offering real solutions. The demagogue blamed one group for every problem.",
            quiz: {
              sentence: "The ______ whipped the crowd into a frenzy with rumors and promises but offered no real solutions.",
              options: ["Demagogue", "Orator", "Statesman", "Negotiator"],
              correctIndex: 0,
              explanation: "A leader who inflames a crowd without offering solutions is a \"demagogue\"; an \"orator\" is simply a skilled speaker, and a \"statesman\" or \"negotiator\" works toward real solutions.",
            },
          },
          {
            word: "Fawning",
            fact: "\"Fawning\" means flattering someone excessively to win favor, in a servile way. The fawning assistant laughed at every remark.",
            quiz: {
              sentence: "The ______ assistant laughed at every remark the director made and hovered at his elbow between meetings.",
              options: ["Fawning", "Attentive", "Loyal", "Courteous"],
              correctIndex: 0,
              explanation: "Laughing at every remark and hovering to win favor is \"fawning\"; \"attentive,\" \"loyal,\" and \"courteous\" are positive qualities without the servile flattery.",
            },
          },
          {
            word: "Coerce",
            fact: "\"Coerce\" means to force someone to act by using threats or pressure. The thugs tried to coerce the shopkeeper into paying.",
            quiz: {
              sentence: "The gang tried to ______ the shopkeeper into paying \"protection\" money by threatening to smash his windows.",
              options: ["Coerce", "Persuade", "Convince", "Charm"],
              correctIndex: 0,
              explanation: "Forcing someone with threats is to \"coerce\"; \"persuade,\" \"convince,\" and \"charm\" rely on reasons or pleasantness, not fear.",
            },
          },
          {
            word: "Cogent",
            fact: "\"Cogent\" means clear, logical, and convincing. Her cogent summary settled the debate.",
            quiz: {
              sentence: "Her argument was so ______ that even those who disagreed admitted she had made her case.",
              options: ["Cogent", "Passionate", "Persistent", "Elaborate"],
              correctIndex: 0,
              explanation: "An argument that is clear, logical, and convincing is \"cogent\"; \"passionate,\" \"persistent,\" and \"elaborate\" describe feeling, stubbornness, or complexity, not logical strength.",
            },
          },
          {
            word: "Incite",
            fact: "\"Incite\" means to stir people up to take action, often angry or violent action. The false rumor incited a riot.",
            quiz: {
              sentence: "The rumor was spread on purpose to ______ the crowd into a violent riot.",
              options: ["Incite", "Inspire", "Console", "Inform"],
              correctIndex: 0,
              explanation: "Stirring a crowd toward violence is to \"incite\"; \"inspire\" implies something positive, and \"console\" and \"inform\" don't push anyone to act.",
            },
          },
          {
            word: "Capitulate",
            fact: "\"Capitulate\" means to give in completely after resisting. The company capitulated to the union's demands.",
            quiz: {
              sentence: "After weeks of pressure and a public boycott, the company was forced to ______, accepting every one of the union's demands without changing a word.",
              options: ["Capitulate", "Compromise", "Negotiate", "Cooperate"],
              correctIndex: 0,
              explanation: "Accepting every demand unchanged is to \"capitulate\"; \"compromise\" and \"negotiate\" involve meeting partway, and \"cooperate\" means working together willingly.",
            },
          },
        ],
      },
    ],
  },
];
