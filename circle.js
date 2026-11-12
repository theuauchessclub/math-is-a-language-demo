(() => {
  "use strict";

  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const sectionTitle = (number, title) => `<div class="circle-section-title"><span aria-hidden="true">${number}</span><h2>${title}</h2></div>`;
  const header = (title, description, data) => `<section class="circle-hero"><div class="eyebrow">${escape(data.periodLabel ?? "Selected period")} · Opening routine</div><h1 data-heading tabindex="-1">${title}</h1><p>${description}</p></section>`;
  const badge = (value, label) => `<span class="circle-badge"><strong>${escape(value)}</strong> ${escape(label)}</span>`;
  const voiceControls = () => '<p class="micro muted">Microphone recording and audio storage are disabled in this public local demo. Use fictional written responses only.</p>';
  function connectVoice(){return ()=>{};}
  function connectTeacherAudio(){return ()=>{};}
  function studentView(root, data, { request, onSubmitted }) {
    if (data.submission) {
      root.innerHTML = header("Community Circle", "You showed up for yourself and someone else today.", data) + `<div class="circle-finished card">
        <p class="feedback" role="status"><strong>Circle submitted.</strong> Your test check-in can be viewed through teacher demo tools in this browser only.</p>
        <p class="circle-quote">“${escape(data.submission.affirmation)}”</p>
        ${voiceControls(data)}
        <button class="btn primary" data-act="section:opener" type="button">Go to the math opener</button>
      </div>`;
      return connectVoice(root, data);
    }

    const { affirmations, recipients, moods, poll } = data;
    const groups = [...new Set(recipients.map(person => person.group))];
    const groupOptions = groups.map(group => `<optgroup label="${escape(group)}">${recipients.filter(person => person.group === group).map(person => `<option value="${escape(person.id)}">${escape(person.label)}</option>`).join("")}</optgroup>`).join("");
    root.innerHTML = header("Community Circle", "Start with yourself. Lift somebody up. Add your voice to the room.", data) + `
      <form class="circle-form">
        <section class="circle-block circle-affirm">
          ${sectionTitle(1, "Affirm yourself")}
          <p>Pick a statement that feels right today, or write your own.</p>
          <div class="circle-choices" role="group" aria-label="Affirmation ideas" data-circle-affirmations></div>
          <div class="actions circle-affirm-actions">
            <button class="btn" type="button" data-circle-more>Show more affirmations</button>
            <button class="btn" type="button" data-circle-own aria-expanded="false" aria-controls="circle-own-text">Write my own</button>
          </div>
          <p class="circle-selection" data-circle-choice role="status"></p>
          <label class="circle-own" id="circle-own-text" hidden>My affirmation
            <input class="control" name="affirmation" maxlength="140" placeholder="I am… or I can…">
          </label>
          <details class="circle-extra">
            <summary>How are you feeling today? <span class="micro">Optional</span></summary>
            <div class="circle-moods" role="group" aria-label="Mood">${moods.map(mood => `<button class="btn circle-mood" type="button" data-circle-mood="${escape(mood.id)}" aria-pressed="false"><span aria-hidden="true">${escape(mood.emoji)}</span> ${escape(mood.label)}</button>`).join("")}</div>
          </details>
          ${voiceControls(data)}
        </section>
        <section class="circle-block circle-shout">
          ${sectionTitle(2, "Give a shout-out")}
          <p>Use a fictional positive example, not personal or sensitive information.</p>
          <label class="circle-field">I’d like to shout out
            <select class="control" name="recipient" required><option value="">Choose a person</option>${groupOptions}</select>
          </label>
          <label class="circle-field">because… <span class="micro muted">Write one positive sentence.</span>
            <textarea class="control" name="reason" rows="2" maxlength="240" required placeholder="They helped me…"></textarea>
          </label>
        </section>
        <section class="circle-block circle-poll">
          ${sectionTitle(3, "Question of the Day")}
          <fieldset class="circle-fieldset" data-circle-poll>
            <legend>${escape(poll.question)}</legend>
            <div class="circle-choices">${poll.options.map((option, index) => `<label class="circle-pick"><input name="vote" type="radio" value="${index}" required><span>${escape(option)}</span></label>`).join("")}</div>
          </fieldset>
        </section>
        <div class="circle-submit"><button class="btn primary" type="submit">Submit Community Circle</button><p class="micro muted">Anyone using this browser can view these test responses in teacher demo tools. Circle is separate from your math grade.</p></div>
        <div data-circle-retry hidden><p class="error" role="alert" data-circle-error></p><button class="btn" type="button" data-act="circle:student">Refresh Community Circle</button></div>
      </form>`;

    const form = root.querySelector("form");
    const more = form.querySelector("[data-circle-more]");
    const own = form.querySelector("[data-circle-own]");
    const ownText = form.querySelector(".circle-own");
    const selectedText = form.querySelector("[data-circle-choice]");
    const affirmationsPanel = form.querySelector("[data-circle-affirmations]");
    const error = form.querySelector("[data-circle-error]");
    const retry = form.querySelector("[data-circle-retry]");
    const refresh = retry.querySelector("button");
    const dismissVoice = connectVoice(form, data);
    const pageSize = 5;
    const pageCount = Math.max(1, Math.ceil(affirmations.length / pageSize));
    const mixedAffirmations = Array.from({ length: pageCount * pageSize }, (_, index) => affirmations[(index % pageSize) * pageCount + Math.floor(index / pageSize)]).filter(Boolean);
    const day = Math.floor(Date.parse(data.date) / 86400000);
    let page = Number.isFinite(day) ? day % pageCount : 0;
    let selected = "", mood = "", ownActive = false;
    function showAffirmations() {
      const start = page * pageSize;
      affirmationsPanel.innerHTML = mixedAffirmations.slice(start, start + pageSize).map((statement, index) => `<button type="button" class="btn circle-pick" data-circle-choice-index="${start + index}" aria-pressed="${statement === selected && !ownActive}">${escape(statement)}</button>`).join("");
      more.textContent = `Show more affirmations (${page + 1}/${pageCount})`;
    }
    function useOwn(value) {
      ownActive = value;
      ownText.hidden = !value;
      own.setAttribute("aria-expanded", String(value));
      form.elements.affirmation.required = value;
      if (value) form.elements.affirmation.focus();
    }
    affirmationsPanel.addEventListener("click", event => {
      const control = event.target.closest("[data-circle-choice-index]");
      if (!control) return;
      selected = mixedAffirmations[Number(control.dataset.circleChoiceIndex)];
      useOwn(false);
      affirmationsPanel.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button === control)));
      selectedText.textContent = `Selected: ${selected}`;
      retry.hidden = true;
    });
    more.addEventListener("click", () => {
      page = (page + 1) % pageCount;
      showAffirmations();
      affirmationsPanel.querySelector("button")?.focus();
    });
    own.addEventListener("click", () => {
      useOwn(!ownActive);
      selectedText.textContent = !ownActive && selected ? `Selected: ${selected}` : "";
      showAffirmations();
      retry.hidden = true;
    });
    form.querySelectorAll("[data-circle-mood]").forEach(control => control.addEventListener("click", () => {
      mood = mood === control.dataset.circleMood ? "" : control.dataset.circleMood;
      form.querySelectorAll("[data-circle-mood]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.circleMood === mood)));
    }));
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const affirmation = ownActive ? form.elements.affirmation.value.trim() : selected;
      if (!affirmation) {
        error.textContent = "Choose an affirmation or write one of your own.";
        refresh.hidden = true;
        retry.hidden = false;
        (ownActive ? form.elements.affirmation : affirmationsPanel.querySelector("button"))?.focus();
        return;
      }
      const reason = form.elements.reason.value.trim();
      if (!reason) {
        error.textContent = "Write a sentence about why you’re giving this shout-out.";
        refresh.hidden = true;
        retry.hidden = false;
        form.elements.reason.focus();
        return;
      }
      event.submitter.disabled = true;
      retry.hidden = true;
      try {
        const result = await request("circle", { affirmation, mood, reason, recipient: form.elements.recipient.value, vote: Number(form.elements.vote.value), pollKey: poll.key });
        if (!root.isConnected) return;
        onSubmitted(result);
      } catch (err) {
        if (!root.isConnected) return;
        error.textContent = err.message;
        refresh.hidden = false;
        retry.hidden = false;
        event.submitter.disabled = false;
      }
    });
    showAffirmations();
    return dismissVoice;
  }

  function teacherView(root, data, { request, onUpdated }, message = "") {
    const { date, poll, presets, submissions, counts, total, moods = [], moodCounts = {} } = data;
    const dayLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const pollResults = poll.options.map((option, index) => `<li class="circle-result"><div><strong>${escape(option)}</strong> <span>${escape(counts[index] ?? 0)} ${counts[index] === 1 ? "vote" : "votes"}</span></div><meter aria-label="${escape(option)} votes" min="0" max="${Math.max(1, total)}" value="${escape(counts[index] ?? 0)}"></meter></li>`).join("");
    const moodResults = moods.filter(mood => moodCounts[mood.id] > 0).map(mood => badge(moodCounts[mood.id], `${mood.emoji} ${mood.label}`)).join("");
    const rosterSize = data.rosterSize ?? data.eligibleTotal;
    const participation = Number.isInteger(rosterSize) ? `${total} of ${rosterSize} demo roles submitted` : `${total} ${total === 1 ? "submission" : "submissions"}`;
    const audioCard = row => `<div class="circle-teacher-audio" data-circle-audio="${escape(row.audio.id)}"><button type="button" class="btn">Open saved recording</button><p class="micro" role="status"></p><audio controls hidden aria-label="Play ${escape(row.student)}’s recording"></audio></div>`;
    root.innerHTML = header("Community Circle", `${escape(dayLabel)} · ${escape(participation)}`, data) + `
      ${message ? `<p class="feedback" role="status">${escape(message)}</p>` : ""}
      <section class="circle-block">
        <h2>Question of the Day</h2><p class="circle-quote">${escape(poll.question)}</p>
        <ul class="circle-results" aria-label="Class poll totals">${pollResults}</ul>
        ${total ? '<p class="micro muted">The question is locked after the first submission.</p>' : `<form data-circle-poll-form>
          <label class="circle-field">Start with a poll idea
            <select class="control" data-circle-preset><option value="">Write or edit today’s question</option>${presets.map((preset, index) => `<option value="${index}">${escape(preset.question)}</option>`).join("")}</select>
          </label>
          <label class="circle-field">Question<input class="control" name="question" maxlength="120" required value="${escape(poll.question)}"></label>
          <label class="circle-field">Answer choices <span class="micro muted">Enter 2–6 different choices, one per line.</span>
            <textarea class="control" name="options" rows="4" required>${escape(poll.options.join("\n"))}</textarea>
          </label>
          <button class="btn primary" type="submit">Save today’s poll</button>
          <p class="error" role="alert" data-circle-error hidden></p>
        </form>`}
      </section>
      <section class="circle-block"><h2>Affirmations and shout-outs</h2>
        ${moodResults ? `<div class="circle-mood-totals" aria-label="Optional mood check-in totals">${moodResults}</div>` : ""}
        ${submissions.length ? `<div class="circle-submissions">${submissions.map(row => `<article><h3>${escape(row.student)}</h3><p>“${escape(row.affirmation)}”</p><p><strong>Shouted out ${escape(row.recipient)}</strong></p><p>${escape(row.reason)}</p>${row.audio ? audioCard(row) : ""}</article>`).join("")}</div>` : "<p>Today’s student check-ins will appear here.</p>"}
        ${data.audioOnly?.length ? `<div class="circle-submissions">${data.audioOnly.map(row => `<article><h3>${escape(row.student)}</h3><p class="micro muted">Recording saved. Written Circle check-in has not been submitted.</p>${audioCard(row)}</article>`).join("")}</div>` : ""}
        ${submissions.some(row => row.audio) || data.audioOnly?.length ? '<p class="micro muted">Saved recordings remain private pending an agreed retention policy. Recording is separate from math grades.</p>' : ""}
      </section>`;
    const dismissAudio = connectTeacherAudio(root, data);
    const form = root.querySelector("[data-circle-poll-form]");
    if (!form) return dismissAudio;
    const preset = form.querySelector("[data-circle-preset]");
    preset.addEventListener("change", () => {
      if (!preset.value) return;
      const idea = presets[Number(preset.value)];
      form.elements.question.value = idea.question;
      form.elements.options.value = idea.options.join("\n");
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      event.submitter.disabled = true;
      const error = form.querySelector("[data-circle-error]");
      error.hidden = true;
      const options = form.elements.options.value.split("\n").map(option => option.trim()).filter(Boolean);
      try {
        const next = await request("teacher/circle", { question: form.elements.question.value.trim(), options });
        if (!root.isConnected) return;
        onUpdated(next, "Today’s question is ready.");
      } catch (err) {
        if (!root.isConnected) return;
        error.textContent = err.message;
        error.hidden = false;
        event.submitter.disabled = false;
      }
    });
    return dismissAudio;
  }

  window.CommunityCircle = { studentView, teacherView };
})();
