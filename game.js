(() => {
  "use strict";

  const notation = "HSF-IF.A.2";
  const graphStandard = "HSF-IF.B.4";
  const clue = (prompt, choices, answer, explanation, graph) =>
    ({ prompt, choices, answer, explanation, graph });
  const flight = (heights) => ({
    name: "Drone height by time",
    xLabel: "Time (seconds)",
    yLabel: "Height (meters)",
    x: [0, 1, 2, 3, 4, 5],
    lines: [{ name: "d", values: heights }]
  });
  const trails = (first, second) => ({
    name: "Distance from the starting point by time",
    xLabel: "Time (minutes)",
    yLabel: "Distance (meters)",
    x: [0, 1, 2, 3, 4],
    lines: [{ name: "f", values: first }, { name: "g", values: second }]
  });

  const unit4 = {
    name: "Unit 4 Review",
    description: "Lesson 2 · Function Notation / Lesson 3 · Interpreting & Using Function Notation",
    categories: [
      {
        name: "Read the Notation",
        questions: [
          {
            points: 100, lesson: 2, standard: notation,
            team: clue("P(t) gives the number of pages read after t minutes. What does P(8) = 12 mean?",
              ["8 pages in 12 minutes", "12 pages in 8 minutes", "20 pages in 8 minutes"], 1,
              "8 is the input in minutes. 12 is the output in pages."),
            solo: clue("B(t) gives the number of books packed after t minutes. What does B(5) = 14 mean?",
              ["14 books in 5 minutes", "5 books in 14 minutes", "19 books in 5 minutes"], 0,
              "The input is 5 minutes and the output is 14 books.")
          },
          {
            points: 200, lesson: 2, standard: notation,
            team: clue("H(t) gives a plant’s height in centimeters t days after planting. On day 6 it is 15 centimeters tall. Write that in function notation.",
              ["H(15) = 6", "H(6) = 9", "H(6) = 15"], 2,
              "6 days is the input, and 15 centimeters is the output."),
            solo: clue("W(t) gives the water depth in inches t minutes after filling began. At 9 minutes the depth is 16 inches. Which equation matches?",
              ["W(16) = 9", "W(9) = 16", "W(9) = 25"], 1,
              "The time, 9 minutes, goes in the parentheses. The depth is 16 inches.")
          },
          {
            points: 300, lesson: 3, standard: notation,
            team: clue("C(t) is a room’s temperature in degrees Celsius t hours after noon. Interpret C(4) = C(7).",
              ["4 p.m. and 7 p.m. had the same temperature.", "The temperature was 4°C at 7 p.m.", "The temperature stayed constant from 4 p.m. through 7 p.m."], 0,
              "The statement only compares the two outputs. It gives no information about the times between them."),
            solo: clue("S(t) is the amount of water in a tank t minutes after noon. Interpret S(3) = S(8).",
              ["There are 3 liters after 8 minutes.", "The tank holds the same amount after 3 and after 8 minutes.", "The tank never gains or loses water between 3 and 8 minutes."], 1,
              "The two inputs have equal outputs. This does not tell you what happens between them.")
          }
        ]
      },
      {
        name: "Compare Outputs",
        questions: [
          {
            points: 100, lesson: 2, standard: notation,
            team: clue("For the same input of 3 minutes, f(3) = 7 and g(3) = 5. Which output is greater?",
              ["f(3)", "g(3)", "The outputs are equal"], 0,
              "Compare the outputs: 7 > 5."),
            solo: clue("At 4 seconds, f(4) = 9 and g(4) = 11. Which output is greater?",
              ["f(4)", "They are equal", "g(4)"], 2,
              "At the same input, g produces 11 while f produces 9.")
          },
          {
            points: 200, lesson: 3, standard: notation,
            team: clue("Use the flight graph. Which comparison is true?",
              ["d(2) > d(3)", "d(2) = d(3)", "d(2) < d(3)"], 1,
              "The graph is flat from 2 to 3 seconds. Both outputs are 4 meters.",
              flight([0, 2, 4, 4, 2, 0])),
            solo: clue("Use the flight graph. Which comparison is true?",
              ["d(1) = d(2)", "d(1) < d(2)", "d(1) > d(2)"], 0,
              "Both points have height 3 meters. Different inputs can have equal outputs.",
              flight([0, 3, 3, 5, 2, 0]))
          },
          {
            points: 300, lesson: 3, standard: graphStandard,
            team: clue("For which listed input t is d(t) greater than d(t + 1)?",
              ["t = 0", "t = 2", "t = 3"], 2,
              "At t = 3 the drone is 6 meters high, and at t + 1 = 4 it is 3 meters high.",
              flight([0, 3, 6, 6, 3, 0])),
            solo: clue("For which listed input t is d(t) less than d(t + 1)?",
              ["t = 1", "t = 2", "t = 4"], 1,
              "At t = 2 the drone is 2 meters high, and at t + 1 = 3 it is 4 meters high.",
              flight([0, 2, 2, 4, 4, 0]))
          }
        ]
      },
      {
        name: "Graph Evidence",
        questions: [
          {
            points: 100, lesson: 3, standard: notation,
            team: clue("Which point must appear on the graph of a function if f(3) = 8?",
              ["(8, 3)", "(3, 8)", "(0, 8)"], 1,
              "An input-output pair is graphed as (input, output)."),
            solo: clue("Which point must appear on the graph of a function if g(4) = 6?",
              ["(6, 4)", "(0, 6)", "(4, 6)"], 2,
              "The input is the horizontal coordinate and the output is the vertical coordinate.")
          },
          {
            points: 200, lesson: 2, standard: notation,
            team: clue("The graph shows f and g on the same axes. What is f(2) − g(2)?",
              ["2 meters", "−2 meters", "6 meters"], 0,
              "At the same input of 2 minutes, f gives 4 meters and g gives 2 meters.",
              trails([0, 2, 4, 4, 1], [0, 1, 2, 3, 5])),
            solo: clue("Use the two trails on the graph. What is g(3) − f(3)?",
              ["−2 meters", "4 meters", "2 meters"], 2,
              "At 3 minutes, g is at 3 meters and f is at 1 meter.",
              trails([0, 2, 2, 1, 0], [0, 1, 2, 3, 4]))
          },
          {
            points: 300, lesson: 3, standard: graphStandard,
            team: clue("A possible graph must satisfy f(0) = 1, f(2) = 4, and f(4) = 3. Which list of points fits all three conditions?",
              ["(0, 1), (4, 2), (3, 4)", "(0, 1), (2, 4), (4, 3)", "(0, 1), (2, 3), (4, 4)"], 1,
              "Each statement gives a point (input, output). Connecting those points is one possible sketch."),
            solo: clue("A possible graph must satisfy p(0) = 2, p(3) = 5, and p(5) = 1. Which list fits?",
              ["(0, 2), (3, 5), (5, 1)", "(0, 2), (5, 3), (1, 5)", "(0, 2), (3, 1), (5, 5)"], 0,
              "The three inputs are 0, 3, and 5, and their outputs are 2, 5, and 1, in that order.")
          }
        ]
      },
      {
        name: "Name the Units",
        questions: [
          {
            points: 100, lesson: 2, standard: notation,
            team: clue("D(t) gives distance in meters after t seconds. What unit belongs to the 6 in D(6)?",
              ["Meters", "Meters per second", "Seconds"], 2,
              "6 is the time input, so its unit is seconds."),
            solo: clue("R(t) gives the distance in miles after t hours. What unit belongs to the 3 in R(3)?",
              ["Hours", "Miles", "Miles per hour"], 0,
              "The number inside the parentheses measures time in hours.")
          },
          {
            points: 200, lesson: 3, standard: notation,
            team: clue("N(t) gives the number of visitors in thousands t days after opening. If N(5) = 2.4, how many visitors are represented?",
              ["24 visitors", "2,400 visitors", "240 visitors"], 1,
              "2.4 thousands means 2.4 × 1,000 = 2,400 visitors."),
            solo: clue("M(t) gives the number of messages in hundreds t hours after noon. If M(4) = 3.7, how many messages are represented?",
              ["37 messages", "3,700 messages", "370 messages"], 2,
              "3.7 hundreds means 3.7 × 100 = 370 messages.")
          },
          {
            points: 300, lesson: 3, standard: notation,
            team: clue("T(h) gives the temperature in °F h hours after 8 a.m. At 10:30 a.m. the temperature is 72°F. Which statement matches?",
              ["T(10.5) = 72", "T(72) = 2.5", "T(2.5) = 72"], 2,
              "10:30 a.m. is 2.5 hours after 8 a.m. The output is 72°F."),
            solo: clue("C(t) gives water depth in inches t hours after 9 a.m. The depth at 12:15 p.m. is 18 inches. Which statement matches?",
              ["C(3.25) = 18", "C(12.25) = 18", "C(18) = 3.25"], 0,
              "The elapsed time is 3 hours 15 minutes, which is 3.25 hours.")
          }
        ]
      },
      {
        name: "Defend a Claim",
        questions: [
          {
            points: 100, lesson: 2, standard: notation,
            team: clue("Maya says f(5) is the same as 5 × f because 5 is in parentheses. What is the best response?",
              ["f(5) is the output of f at input 5.", "f(5) always equals 5.", "The 5 gives the output of f."], 0,
              "Parentheses in function notation enclose the input. They do not show multiplication."),
            solo: clue("A student says the 7 in g(7) is an output. Which correction is best?",
              ["7 is the output if the graph crosses 7.", "7 is the input and g(7) is the corresponding output.", "g(7) means 7 × g."], 1,
              "In g(7), the argument 7 is the input, and the entire expression names the output.")
          },
          {
            points: 200, lesson: 2, standard: notation,
            team: clue("f(2) = g(4) = 6. A student says the equality means the two inputs must match. Which explanation corrects the claim?",
              ["The functions must both be named f.", "The outputs match even though the inputs are 2 and 4.", "The two outputs must be 2 and 4."], 1,
              "The equality compares function values. It does not claim the input values are equal."),
            solo: clue("A graph gives h(1) = k(3) = 8. A student says h and k must have the same output at every input. Which explanation is valid?",
              ["The statement means h and k have the same rule.", "The statement means both inputs are 8.", "The statement only shows an equal output at the specified inputs."], 2,
              "Equality of two specified outputs is not equality of the two functions.")
          },
          {
            points: 300, lesson: 3, standard: graphStandard,
            team: clue("Jalen claims f is farther from the start than g at every time after 0 minutes. Which evidence disproves the claim?",
              ["At 1 minute, f(1) = 2 and g(1) = 1.", "At 4 minutes, f(4) = 2 and g(4) = 5.", "At 2 minutes, f(2) = 4 and g(2) = 2."], 1,
              "At 4 minutes, g is 5 meters from the start and f is 2 meters. One counterexample disproves an every-time claim.",
              trails([0, 2, 4, 3, 2], [0, 1, 2, 4, 5])),
            solo: clue("Kai claims d(t + 1) is greater than d(t) at every plotted time with a next point. Which comparison disproves this?",
              ["d(1) = 2 and d(0) = 0", "d(2) = 4 and d(1) = 2", "d(4) = 3 and d(3) = 5"], 2,
              "At t = 3, the next output is 3 meters, less than the current output of 5 meters.",
              flight([0, 2, 4, 5, 3, 0]))
          }
        ]
      }
    ]
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function graphMarkup(graph) {
    const width = 420, height = 200;
    const left = 62, right = 398, top = 16, bottom = 148;
    const maxY = Math.max(...graph.lines.flatMap((line) => line.values));
    const x = (index) => left + index * (right - left) / (graph.x.length - 1);
    const y = (value) => bottom - value * (bottom - top) / maxY;
    const yGrid = Array.from({ length: maxY + 1 }, (_, value) =>
      `<line x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}" class="mr-grid-line"/>
       <text x="${left - 10}" y="${y(value) + 4}" text-anchor="end">${value}</text>`
    ).join("");
    const xGrid = graph.x.map((value, index) =>
      `<line x1="${x(index)}" y1="${top}" x2="${x(index)}" y2="${bottom}" class="mr-grid-line"/>
       <text x="${x(index)}" y="${bottom + 18}" text-anchor="middle">${value}</text>`
    ).join("");
    const lines = graph.lines.map((line, lineIndex) => {
      const marker = (value, index) => lineIndex
        ? `<rect x="${x(index) - 3}" y="${y(value) - 3}" width="6" height="6"/>`
        : `<circle cx="${x(index)}" cy="${y(value)}" r="3.3"/>`;
      const coordinates = line.values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
      return `<g class="mr-series mr-series-${lineIndex}"><polyline points="${coordinates}"/>${line.values.map(marker).join("")}</g>`;
    }).join("");
    const legend = graph.lines.map((line, index) =>
      `<span><b class="mr-legend-${index}" aria-hidden="true">${index ? "■" : "●"}</b> ${escapeHtml(line.name)}</span>`
    ).join("");
    const columns = graph.lines.map((line) => `<th scope="col">${escapeHtml(line.name)}</th>`).join("");
    const rows = graph.x.map((value, index) =>
      `<tr><th scope="row">${value}</th>${graph.lines.map((line) => `<td>${line.values[index]}</td>`).join("")}</tr>`
    ).join("");
    return `<figure class="mr-figure">
      <figcaption>${escapeHtml(graph.name)}</figcaption>
      <svg role="img" aria-label="${escapeHtml(graph.name)}. Point values are available in the table below." viewBox="0 0 ${width} ${height}">
        ${xGrid}${yGrid}<path d="M ${left} ${top} V ${bottom} H ${right}" class="mr-axes"/>
        ${lines}
        <text x="${(left + right) / 2}" y="193" text-anchor="middle">${escapeHtml(graph.xLabel)}</text>
        <text x="15" y="82" text-anchor="middle" transform="rotate(-90 15 82)">${escapeHtml(graph.yLabel)}</text>
      </svg>
      <div class="mr-legend" aria-label="Graph legend">${legend}</div>
      <details><summary>View graph values as a table</summary><table>
        <thead><tr><th scope="col">${escapeHtml(graph.xLabel)}</th>${columns}</tr></thead>
        <tbody>${rows}</tbody></table></details>
    </figure>`;
  }

  function mount(container, { mode = "solo", onExit } = {}) {
    if (!["solo", "team"].includes(mode)) throw new TypeError("Expected review mode 'solo' or 'team'.");
    const teamMode = mode === "team";
    const state = {
      view: teamMode ? "setup" : "board",
      count: 2,
      teams: [],
      turn: 0,
      soloScore: 0,
      used: new Set(),
      selected: null,
      response: null,
      revealed: false,
      scored: false,
      awarded: null
    };
    const root = document.createElement("section");
    root.className = "math-review";
    root.setAttribute("aria-label", "Math Is A Language review game");
    container.replaceChildren(root);

    const totalClues = unit4.categories.reduce((total, category) => total + category.questions.length, 0);

    function setupMarkup() {
      return `<form class="mr-setup" data-team-setup>
        <h3 tabindex="-1">Set up teams</h3>
        <label>Number of teams <select data-team-count name="count">
          ${[2, 3, 4, 5].map((count) => `<option value="${count}"${state.count === count ? " selected" : ""}>${count}</option>`).join("")}
        </select></label>
        <div class="mr-team-fields">${Array.from({ length: state.count }, (_, index) =>
          `<label>Team ${index + 1} name<input name="team${index}" maxlength="32" placeholder="Team ${index + 1}" value="${escapeHtml(state.teams[index]?.name || "")}"></label>`
        ).join("")}</div>
        <button class="mr-primary" type="submit">Start team game</button>
      </form>`;
    }

    function scoresMarkup() {
      if (!teamMode) return `<p class="mr-score"><strong>Practice points</strong> <output>${state.soloScore}</output></p>`;
      const scores = state.teams.map((team, index) =>
        `<div class="mr-score"><strong>${escapeHtml(team.name)}</strong><output>${team.points}</output>${index === state.turn && state.used.size < totalClues ? '<span class="mr-turn">Up next</span>' : ""}</div>`
      ).join("");
      const controls = state.view === "board" && state.used.size < totalClues
        ? `<label class="mr-turn-picker">Choose the active team <select data-turn>${state.teams.map((team, index) =>
            `<option value="${index}"${index === state.turn ? " selected" : ""}>${escapeHtml(team.name)}</option>`
          ).join("")}</select></label>`
        : "";
      return `<div class="mr-scoreboard" aria-label="Team scores">${scores}</div>${controls}`;
    }

    function boardMarkup() {
      const complete = state.used.size === totalClues;
      const columns = unit4.categories.map((category, categoryIndex) => {
        const questions = category.questions.map((question, questionIndex) => {
          const id = `${categoryIndex}-${questionIndex}`;
          const used = state.used.has(id);
          return `<button type="button" data-clue="${id}" aria-label="${escapeHtml(category.name)}, ${question.points} points${used ? ", played" : ""}"${used ? " disabled" : ""}>
            ${question.points}${used ? '<span class="mr-played">Played</span>' : ""}
          </button>`;
        }).join("");
        return `<section class="mr-column" aria-label="${escapeHtml(category.name)}"><h4>${escapeHtml(category.name)}</h4>${questions}</section>`;
      }).join("");
      let finish = "";
      if (complete) {
        const leaders = state.teams.filter((team) => team.points === Math.max(...state.teams.map((other) => other.points)));
        const result = teamMode
          ? `${leaders.map((team) => escapeHtml(team.name)).join(" and ")} ${leaders.length > 1 ? "tie" : "wins"} with ${leaders[0].points} points.`
          : `You earned ${state.soloScore} of ${unit4.categories.flatMap((category) => category.questions).reduce((sum, item) => sum + item.points, 0)} practice points.`;
        finish = `<div class="mr-feedback" role="status"><strong>Board complete.</strong> ${result} <button type="button" data-action="restart">Start a new round</button></div>`;
      }
      return `<h3 tabindex="-1">Choose a question</h3>${scoresMarkup()}${finish}
        <div class="mr-board">${columns}</div>
        <p class="mr-caption">${state.used.size} of ${totalClues} questions played</p>`;
    }

    function clueMarkup() {
      const { category, question } = state.selected;
      const active = question[mode];
      const correct = state.response === active.answer;
      let interaction = "";
      if (teamMode) {
        interaction = state.revealed
          ? (state.scored
            ? `<p class="mr-award" role="status">${state.awarded ? `${escapeHtml(state.teams[state.turn].name)} earned ${question.points} points.` : "No points awarded."}</p>
               <button type="button" class="mr-primary" data-action="board">Return to board</button>`
            : `<div class="mr-actions"><button type="button" class="mr-primary" data-action="award">Award ${question.points} points</button>
               <button type="button" data-action="no-points">No points</button></div>`)
          : `<p>Ask ${escapeHtml(state.teams[state.turn].name)} to respond aloud, then reveal the answer.</p>
             <div class="mr-actions"><button type="button" class="mr-primary" data-action="reveal">Reveal answer</button>
             <button type="button" data-action="cancel">Back to board</button></div>`;
      } else if (state.revealed) {
        interaction = `<div class="mr-actions"><button type="button" class="mr-primary" data-action="board">Return to board</button></div>`;
      } else {
        interaction = `<form data-solo-answer>
          <fieldset><legend>Choose your answer</legend>
            ${active.choices.map((choice, index) => `<label class="mr-option"><input type="radio" name="answer" value="${index}" required> ${escapeHtml(choice)}</label>`).join("")}
          </fieldset>
          <div class="mr-actions"><button type="submit" class="mr-primary">Check answer</button><button type="button" data-action="cancel">Back to board</button></div>
        </form>`;
      }
      const choices = teamMode
        ? `<ol class="mr-host-choices" type="A">${active.choices.map((choice) => `<li>${escapeHtml(choice)}</li>`).join("")}</ol>`
        : "";
      const feedback = state.revealed
        ? `<div class="mr-feedback" role="status" tabindex="-1"><strong>${teamMode ? "Answer" : correct ? `Correct. +${question.points} points.` : "Review this answer."}</strong>
          <p>${escapeHtml(active.choices[active.answer])}</p><p>${escapeHtml(active.explanation)}</p></div>`
        : "";
      return `<h3 tabindex="-1">${escapeHtml(category.name)} · ${question.points} points</h3>
        <p class="mr-caption">Lesson ${question.lesson} · ${escapeHtml(question.standard)}</p>
        <p class="mr-prompt">${escapeHtml(active.prompt)}</p>${active.graph ? graphMarkup(active.graph) : ""}
        ${choices}${feedback}${interaction}`;
    }

    function render(focus = false, focusFeedback = false) {
      const content = state.view === "setup" ? setupMarkup() : state.view === "board" ? boardMarkup() : clueMarkup();
      root.innerHTML = `<header class="mr-heading">
        <div><div class="mr-brand">Math Is A Language</div><h2>${escapeHtml(unit4.name)}</h2>
          <p>${escapeHtml(unit4.description)} · ${teamMode ? "Team game" : "Solo practice"}</p></div>
        ${typeof onExit === "function" ? '<button type="button" data-action="exit">Back to class</button>' : ""}
      </header>
      <div class="mr-body">${content}</div>`;
      if (focus) (root.querySelector(focusFeedback ? ".mr-feedback" : "h3") || root.querySelector("h3"))?.focus();
    }

    function startRound() {
      state.turn = 0;
      state.soloScore = 0;
      state.used.clear();
      state.teams.forEach((team) => { team.points = 0; });
      state.view = teamMode ? "setup" : "board";
      render(true);
    }

    function finishClue() {
      state.used.add(state.selected.id);
      if (teamMode) state.turn = (state.turn + 1) % state.teams.length;
      state.view = "board";
      render(true);
    }

    root.addEventListener("change", (event) => {
      if (event.target.matches("[data-team-count]")) {
        const form = event.target.form;
        state.teams = Array.from({ length: 5 }, (_, index) => ({
          name: form.elements.namedItem(`team${index}`)?.value ?? state.teams[index]?.name ?? "",
          points: 0
        }));
        state.count = Number(event.target.value);
        render();
        root.querySelector("[data-team-count]")?.focus();
      }
      if (event.target.matches("[data-turn]")) {
        state.turn = Number(event.target.value);
        render();
        root.querySelector("[data-turn]")?.focus();
      }
    });

    root.addEventListener("submit", (event) => {
      const form = event.target;
      if (form.matches("[data-team-setup]")) {
        event.preventDefault();
        state.teams = Array.from({ length: state.count }, (_, index) => ({
          name: form.elements.namedItem(`team${index}`).value.trim() || `Team ${index + 1}`,
          points: 0
        }));
        state.view = "board";
        render(true);
      }
      if (form.matches("[data-solo-answer]") && !state.revealed) {
        event.preventDefault();
        const answer = new FormData(form).get("answer");
        if (answer === null) return;
        state.response = Number(answer);
        state.revealed = true;
        if (state.response === state.selected.question.solo.answer) state.soloScore += state.selected.question.points;
        render(true, true);
      }
    });

    root.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !root.contains(button)) return;
      const id = button.dataset.clue;
      if (id && !state.used.has(id)) {
        const [categoryIndex, questionIndex] = id.split("-").map(Number);
        const category = unit4.categories[categoryIndex];
        state.selected = { id, category, question: category.questions[questionIndex] };
        state.response = null;
        state.revealed = false;
        state.scored = false;
        state.awarded = null;
        state.view = "clue";
        render(true);
        return;
      }
      const action = button.dataset.action;
      if (action === "exit") onExit();
      if (action === "restart") startRound();
      if (action === "cancel") {
        state.view = "board";
        render(true);
      }
      if (action === "reveal" && teamMode && !state.revealed) {
        state.revealed = true;
        render(true, true);
      }
      if ((action === "award" || action === "no-points") && teamMode && state.revealed && !state.scored) {
        state.scored = true;
        state.awarded = action === "award";
        if (state.awarded) state.teams[state.turn].points += state.selected.question.points;
        render();
        root.querySelector('[data-action="board"]')?.focus();
      }
      if (action === "board" && state.revealed && (!teamMode || state.scored)) finishClue();
    });

    render();
  }

  window.MathReview = { mount };
})();
