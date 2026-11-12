export const content = {
  "title": "Interpreting & Using Function Notation",
  "edition": "Kendall Hunt Algebra 1 · Unit 4 · Lesson 3",
  "alternateEdition": "IM v.360 Algebra 1 · Unit 5 · Lesson 3",
  "brand": {
    "name": "Math Is A Language",
    "school": "Ron Brown College Preparatory High School",
    "classroom": "Algebra 1 · Period 1 · Brother Truth & Ms. Joey"
  },
  "standards": [
    {"code": "HSF-IF.A.2", "plain": "Read and use function notation, find an output for a valid input, and explain what a function statement means in a situation."},
    {"code": "HSF-IF.B.4", "plain": "Explain important features of a graph or table in context and sketch a graph that matches a description."}
  ],
  "targets": [
    "Connect statements in function notation to a graph.",
    "Use function notation to express a relationship between two quantities.",
    "Sketch a possible graph from statements in function notation."
  ],
  "sources": [
    {"name": "Illustrative Mathematics · Kendall Hunt Algebra 1, Unit 4, Lesson 3", "url": "https://im.kendallhunt.com/HS/students/1/4/3/index.html", "detail": "© 2019 Illustrative Mathematics. The original task order, quantities, comparisons, and graph features are retained. Directions, supports, and response controls are adapted for this classroom pilot."},
    {"name": "Illustrative Mathematics · CC BY 4.0", "url": "https://creativecommons.org/licenses/by/4.0/", "detail": "License for the Kendall Hunt edition. The Ron Brown classroom branding is separate from the IM attribution."},
    {"name": "Illustrative Mathematics · Lesson 3 student task statements", "url": "https://cms-assets.illustrativemathematics.org/tq0rqz8ax7c7i5mj6n90y0ubupap", "detail": "Printed graph reference. The drone curve rises through 2 seconds, stays flat from 2 to 5 seconds, and lands at 7 seconds. The vertical axis has no numbered scale."},
    {"name": "Illustrative Mathematics · Teacher preparation", "url": "https://im.kendallhunt.com/HS/teachers/1/4/3/preparation.html", "detail": "Public learning targets and standards. The original teacher-only Cool-down is access-controlled. The pilot uses a clearly marked original exit ticket."},
    {"name": "OSSE · DC CAPE Next high school mathematics blueprint", "url": "https://osse.dc.gov/sites/default/files/dc/sites/osse/page_content/attachments/DC%20CAPE%202.0%20HS%20Math%20Blueprints.pdf", "detail": "The original task uses the Algebra I emphasis on interpreting functions in context and defending a mathematical claim."},
    {"name": "DC Pearson · High school practice and scoring resources", "url": "https://dc.mypearsonsupport.com/practice-tests.html", "detail": "The high school practice materials inform response formats and rubric design."},
    {"name": "DC Pearson · High school mathematics scoring guide", "url": "https://dc.mypearsonsupport.com/resources/practice-tests/math/Math%20Practice%20Test%20Scoring%20Guide%20-%20Grade%2011.pdf", "detail": "The performance task Lights, Candles, Action! item 2 models defending a claim with mathematical evidence. It is a format reference."},
    {"name": "New Meridian · 2019 Algebra I released items", "url": "https://resources.newmeridiancorp.org/wp-content/uploads/2020/01/2019-Algebra-1-Released-Items_AR_V2-1.pdf", "detail": "Released item VH210488 is a precedent for interpreting a contextual function statement and then writing function notation. The pilot task is original."}
  ],
  "graph": {
    "axes": {"x": "Time (seconds)", "y": "Height (meters)"},
    "points": [[0, 0], [2, 1], [5, 1], [7, 0]],
    "xMin": 0, "xMax": 8, "xStep": 1, "yMin": 0, "yMax": 1.2, "yTicks": false,
    "description": "A drone's height rises from launch at 0 seconds to 2 seconds, is flat from 2 through 5 seconds, and falls to the ground at 7 seconds. Heights are not numbered."
  },
  "sections": [
    {
      "id": "opener",
      "title": "3.1 Observing a Drone",
      "standard": "HSF-IF.A.2",
      "intro": "The graph shows f(t), the drone’s height in meters t seconds after it lifts off. Compare the outputs in each pair.",
      "scaffold": "Read across the horizontal axis to find the time. Follow a vertical guide to the graph. Compare the heights of the marked points.",
      "grading": "Each comparison is worth one accuracy point. Score accuracy as earned points divided by four. Score completion as the fraction of items with a meaningful response. The Opener grade is 70% accuracy plus 30% completion. The written response is pending teacher review until a score is entered.",
      "items": [
        {"id": "3.1-1", "prompt": "Compare f(0) and f(4).", "type": "choice", "choices": ["f(0) > f(4)", "f(0) = f(4)", "f(0) < f(4)"], "answer": "f(0) < f(4)", "points": 1, "rubric": "At launch the drone is on the ground. At 4 seconds it is above the ground.", "scaffold": "Mark 0 seconds and 4 seconds. Which mark on the curve is higher?"},
        {"id": "3.1-2", "prompt": "Compare f(2) and f(5).", "type": "choice", "choices": ["f(2) > f(5)", "f(2) = f(5)", "f(2) < f(5)"], "answer": "f(2) = f(5)", "points": 1, "rubric": "Both times lie on the same flat section, so the heights are equal.", "scaffold": "When two points have the same height, use the equals sign."},
        {"id": "3.1-3", "prompt": "Compare f(3) and f(7).", "type": "choice", "choices": ["f(3) > f(7)", "f(3) = f(7)", "f(3) < f(7)"], "answer": "f(3) > f(7)", "points": 1, "rubric": "At 3 seconds the drone is above the ground. At 7 seconds it has landed.", "scaffold": "Compare the vertical positions at the two times."},
        {"id": "3.1-4", "prompt": "Compare f(t) and f(t+1). Explain how the comparison depends on t and support your explanation with evidence from the graph.", "type": "text", "answer": null, "points": 1, "rubric": "Give one point for explaining that the comparison can change and supporting it with at least two valid time pairs with different outcomes. For example, f(0) < f(1), f(2) = f(3), and f(5) > f(6). Accept any valid examples with both inputs in the plotted domain.", "scaffold": "Try t = 0, t = 2, and t = 5. For each case, mark t and one second later. Then use the frame: When t is ___, f(t) is ___ f(t+1) because ___."}
      ]
    },
    {
      "id": "notes",
      "title": "3.2 Smartphones",
      "standard": "HSF-IF.A.2, HSF-IF.B.4",
      "intro": "P(t) is the number of people, measured in millions, who own a smartphone t years after 2000. Class notes: A graph point has coordinates (input, output). Here the input tells the time relative to 2000 and the output counts people in millions.",
      "scaffold": "Write the calendar year as 2000 + t. To convert a headcount to millions, divide the headcount by 1,000,000. Use the frame: In the year ___, ___ million people owned a smartphone.",
      "items": [
        {"id": "3.2-1a", "prompt": "Interpret P(17) = 2,320 in the smartphone context.", "type": "text", "answer": null, "points": 1, "rubric": "In 2017, 2,320 million people, or 2.32 billion people, owned a smartphone.", "scaffold": "Start by adding 17 to 2000. Keep the output unit attached to 2,320."},
        {"id": "3.2-1b", "prompt": "Interpret P(−10) = 0 in the smartphone context.", "type": "text", "answer": null, "points": 1, "rubric": "In 1990, zero people owned a smartphone in this model.", "scaffold": "A negative input means a year before 2000."},
        {"id": "3.2-2a", "prompt": "Write the statement in function notation. In 2010, 296,600,000 people owned a smartphone.", "type": "text", "answer": ["P(10)=296.6", "P(10) = 296.6"], "points": 1, "rubric": "P(10) = 296.6. The time is 10 years after 2000 and the output is 296.6 million people.", "scaffold": "Fill the structure P(years after 2000) = people in millions."},
        {"id": "3.2-2b", "prompt": "Write the statement in function notation. In 2015, about 1.86 billion people owned a smartphone.", "type": "text", "answer": ["P(15)=1860", "P(15)=1,860", "P(15)≈1860", "P(15)≈1,860", "P(15)~=1860"], "points": 1, "rubric": "P(15) ≈ 1,860. Accept P(15) = 1,860 as a rounded model value.", "scaffold": "One billion is one thousand million."},
        {"id": "3.2-3a", "prompt": "Mai is curious about t in P(t) = 1,000. What would this value of t tell her?", "type": "text", "answer": null, "points": 1, "rubric": "It gives the number of years after 2000 when one billion people owned a smartphone. Adding it to 2000 gives the calendar year.", "scaffold": "State what the input means and convert the output from millions to a headcount."},
        {"id": "3.2-3b", "prompt": "Is 4 a reasonable possible value of t in P(t) = 1,000? Explain.", "type": "text", "answer": null, "points": 1, "rubric": "No, under the reasonable adoption-growth interpretation. Year 2004 comes before 2010, when ownership was only 296.6 million. The observed 2010 and 2015 values bracket one billion. Accept a student who identifies the monotonicity assumption and clearly explains why the isolated points alone do not logically rule out an earlier temporary spike.", "scaffold": "Compare the year for t = 4 with 2010. Think about how widespread smartphone use changed over time."},
        {"id": "3.2-4", "prompt": "Sketch a possible graph of P from the information you have so far.", "type": "plot", "answer": null, "points": 2, "rubric": "One point for plotting the four known points: (−10, 0), (10, 296.6), (15, 1860), and (17, 2320). One point for a coherent graph that models adoption and has one output for each represented time. Accept sensible line or curve sketches and reasonable graphical rounding. The known points do not determine a unique graph.", "scaffold": "Use (input, output) for each given statement. Plot the known points first, then sketch a reasonable path.", "graph": {"axes":{"x":"Years after 2000","y":"Smartphone owners (millions)"},"xMin":-12,"xMax":22,"xStep":2,"yMin":0,"yMax":2800,"yStep":400}}
      ],
      "extension": "Optional IM extension. What can you say about the value or values of t for which P(t) = 1,000?"
    },
    {
      "id": "classwork",
      "title": "3.3 Boiling Water + CAPE-style practice",
      "standard": "HSF-IF.A.2, HSF-IF.B.4",
      "intro": "W(t) is the temperature in degrees Fahrenheit of a pot of water t minutes after the stove is turned on. Take turns explaining each statement with a partner. Listen, discuss any differences, and record your interpretation.",
      "scaffold": "For W(a) = b, write: At ___ minutes, the water temperature is ___ °F. For W(a) > W(b), name both times and describe which temperature is higher. Use the statements to decide what must be true on a sketch.",
      "items": [
        {"id": "3.3-1a", "prompt": "Interpret W(0) = 72.", "type": "text", "answer": null, "points": 1, "rubric": "When the stove was turned on, the water was 72 °F.", "scaffold": "Start with what 0 minutes means."},
        {"id": "3.3-1b", "prompt": "Interpret W(5) > W(2).", "type": "text", "answer": null, "points": 1, "rubric": "The water was warmer at 5 minutes than at 2 minutes.", "scaffold": "Use warmer than to compare temperatures."},
        {"id": "3.3-1c", "prompt": "Interpret W(10) = 212.", "type": "text", "answer": null, "points": 1, "rubric": "Ten minutes after the stove was turned on, the water was 212 °F.", "scaffold": "Name the time and the temperature with units."},
        {"id": "3.3-1d", "prompt": "Interpret W(12) = W(10).", "type": "text", "answer": null, "points": 1, "rubric": "At 12 minutes, the water had the same temperature as it did at 10 minutes. Both are 212 °F using the previous statement.", "scaffold": "Equal outputs can occur at two different times."},
        {"id": "3.3-1e", "prompt": "Interpret W(15) > W(30).", "type": "text", "answer": null, "points": 1, "rubric": "At 15 minutes the water was warmer than it was at 30 minutes.", "scaffold": "Which time has the higher temperature according to the symbol?"},
        {"id": "3.3-1f", "prompt": "Interpret W(0) < W(30).", "type": "text", "answer": null, "points": 1, "rubric": "At the start the water was cooler than at 30 minutes.", "scaffold": "Name the two times in the order shown."},
        {"id": "3.3-2", "prompt": "Sketch a possible graph of W that satisfies all six statements. Be ready to show where each statement appears in your graph.", "type": "plot", "answer": null, "points": 2, "rubric": "Award one point for a graph through (0, 72), (10, 212), and (12, 212). Award one point for satisfying all three strict inequalities and keeping one output per input. One possible set of values at t = 0, 2, 5, 10, 12, 15, 30 is 72, 100, 150, 212, 212, 212, 115. Accept other valid graphs.", "scaffold": "Plot the known points first. Next check the relative heights for each inequality. More than one graph can satisfy all six statements.", "graph": {"axes":{"x":"Time (minutes)","y":"Temperature (°F)"},"xMin":0,"xMax":30,"xStep":5,"yMin":0,"yMax":300,"yStep":50}},
        {"id": "CAPE-A", "label": "Original DC CAPE Next–style task · Robot Cooling", "intro": "A robotics team measures the temperature of a motor after its cooling fan starts. T(t) is the temperature in degrees Celsius t minutes after the fan starts. The temperature decreases continuously. The team records T(0) = 74, T(3) = 56, and T(6) = 44.", "prompt": "Explain what T(3) = 56 tells the team about the motor.", "type": "text", "answer": null, "points": 1, "rubric": "One point for identifying 56 °C as the motor temperature 3 minutes after the fan started.", "scaffold": "The input describes a time. The output is the motor temperature."},
        {"id": "CAPE-B", "prompt": "Plot the three recorded measurements and sketch one possible decreasing temperature graph for the first six minutes.", "type": "plot", "answer": null, "points": 2, "rubric": "Award one point for plotting (0, 74), (3, 56), and (6, 44). Award one point for sketching a continuous decreasing graph through them. Accept other mathematically valid curves or connected segments.", "scaffold": "Write the three ordered pairs as (minutes, degrees Celsius) before you plot.", "graph": {"axes":{"x":"Time (minutes)","y":"Temperature (°C)"},"xMin":0,"xMax":6,"xStep":1,"yMin":40,"yMax":80,"yStep":10}},
        {"id": "CAPE-C", "prompt": "Maya says the measurements prove the motor first reached 50 °C at exactly 5 minutes. Do you agree? Use the graph and recorded measurements to defend your claim.", "type": "text", "answer": null, "points": 2, "rubric": "Award one point for rejecting the claim and using 56 °C at 3 minutes and 44 °C at 6 minutes to justify that the continuous decreasing temperature crosses 50 °C between them. Award one point for explaining that the exact crossing is not fixed or showing a valid counterexample, such as a piecewise linear graph crossing 50 °C at 4.5 minutes. A graph that crosses at 5 minutes is possible but does not prove it must do so.", "scaffold": "Find the two plotted points on opposite sides of 50 °C. Write a claim and support it with those measurements."}
      ]
    },
    {
      "id": "exit",
      "title": "Exit Ticket · Aquarium Tank",
      "standard": "HSF-IF.A.2, HSF-IF.B.4",
      "intro": "Original classroom exit ticket. L(t) gives the water level in centimeters t minutes after an aquarium pump starts. You know that L(0) = 20, L(2) = 35, and L(4) = 30.",
      "scaffold": "Use the axis labels and the given statements. This exit ticket checks the same skills in both versions.",
      "items": [
        {"id": "E-1", "prompt": "Explain L(2) = 35 in the aquarium context. Include both units.", "type": "text", "answer": null, "points": 1, "rubric": "Two minutes after the pump starts, the water level is 35 centimeters.", "scaffold": "Use one complete sentence."},
        {"id": "E-2", "prompt": "Compare L(0) and L(4).", "type": "choice", "choices": ["L(0) > L(4)", "L(0) = L(4)", "L(0) < L(4)"], "answer": "L(0) < L(4)", "points": 1, "rubric": "20 centimeters is less than 30 centimeters.", "scaffold": ""},
        {"id": "E-3", "prompt": "Sketch a possible graph of L for the first four minutes.", "type": "plot", "answer": null, "points": 2, "rubric": "Award one point for plotting (0, 20), (2, 35), and (4, 30). Award one point for a coherent continuous sketch with one water level at each time. Accept valid alternatives.", "scaffold": "", "graph": {"axes":{"x":"Time (minutes)","y":"Water level (centimeters)"},"xMin":0,"xMax":4,"xStep":1,"yMin":0,"yMax":40,"yStep":5}}
      ]
    }
  ],
  "versions": {
    "grade-level": {"studentLabel":"Today’s lesson","teacherLabel":"Grade level","showScaffolds":false,"openerAccuracyWeight":0.7,"openerCompletionWeight":0.3},
    "scaffolded": {"studentLabel":"Today’s lesson","teacherLabel":"Scaffolded","showScaffolds":true,"openerAccuracyWeight":0.7,"openerCompletionWeight":0.3}
  }
}
;
export const circleContent = {
  "affirmations": [
    "I love myself, even on the days I am still figuring things out.",
    "I can take this day one step at a time.",
    "I belong in this room.",
    "I am good enough as I am, and I am still growing.",
    "I can be quiet and still have something important to say.",
    "I can ask for help and still be strong.",
    "I am allowed to rest and start again.",
    "I am proud of the young Black man I am becoming.",
    "I can feel nervous and still show up.",
    "My voice matters, even when it shakes.",
    "I love my brothers, and I want to see them win.",
    "I show respect to the people who raise and support me.",
    "I can respect adults and speak up for myself.",
    "I show love to my family through my actions.",
    "I make room for other people to shine.",
    "I keep my word, even when nobody is checking.",
    "I can own a mistake and make it right.",
    "I bring something good to my community.",
    "I can lead with kindness and still be strong.",
    "My brothers can count on me to show up.",
    "I can do hard things when I put my mind to them.",
    "I can figure out a math problem one move at a time.",
    "I am great at science, and I ask good questions.",
    "I can explain my thinking in my own words.",
    "I learn from the questions I get wrong.",
    "I am getting better at something that used to feel impossible.",
    "I can focus long enough to finish what I start.",
    "I have ideas worth sharing in class.",
    "I can work through confusion and find a way forward.",
    "I am a problem-solver, and my strategy matters.",
    "I am an excellent basketball player, and I work on my game.",
    "I am building a name for myself on the football field at Ron Brown.",
    "I practice like the player I want to become.",
    "I can bring the same focus to class that I bring to game day.",
    "I have the discipline to make my goals real.",
    "I can build something that makes my people proud.",
    "I am getting stronger in my body, my mind, and my choices.",
    "My creativity can take me places.",
    "I am making moves my future self will thank me for.",
    "I bring my own style to whatever I do.",
    "I am powerful, and I use my power with purpose.",
    "I feel confident about what I bring to the table.",
    "I am the GOAT of math at Ron Brown. Watch me show my work.",
    "I belong in rooms where big decisions get made.",
    "I walk in knowing I have something to offer.",
    "I can back up my confidence with effort.",
    "I set the pace for myself.",
    "I have big dreams and the nerve to go after them.",
    "I am a young Black man with ideas that can move the world.",
    "I am built for the moment, and I came ready."
  ],
  "moods": [
    {"id":"confident","label":"Confident","emoji":"💪"},
    {"id":"great","label":"Feeling great","emoji":"😄"},
    {"id":"calm","label":"Calm","emoji":"🙂"},
    {"id":"making-it","label":"Just making it","emoji":"😐"},
    {"id":"tired","label":"Tired","emoji":"😴"},
    {"id":"stressed","label":"Stressed","emoji":"😟"}
  ],
  "polls": [
    {"question":"Who wins a friendly matchup?","options":["Goku","Superman"]},
    {"question":"Which class would you make twice as long?","options":["Math","Science","English","History"]},
    {"question":"How would you rather tackle a new math challenge?","options":["Think on my own first","Talk it through with a partner"]},
    {"question":"Which school event would you rather plan?","options":["A basketball tournament","A talent showcase"]},
    {"question":"Which would you choose for a class field trip?","options":["A science museum","A live sports game"]},
    {"question":"Which would make the neighborhood better first?","options":["More places to play and hang out","Better access to buses and trains"]},
    {"question":"Which superpower would you choose for a day?","options":["Teleportation","Time travel"]},
    {"question":"Which math tool helps you see a pattern faster?","options":["A graph","A table"]}
  ]
}
;
