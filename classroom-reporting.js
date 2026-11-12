/** Read-only reporting for one server-authorized classroom period.
 * This module does not assign scores, change the 70/30 Opener grade, or infer
 * attendance/mastery. The API must scope every query before calling it. A roster
 * allowlist and optional period tags provide defense in depth, not authorization.
 */
const VARIANTS = ['grade', 'scaffold'];
const TERMINAL = new Set(['correct', 'incorrect', 'partial']);
const MIN_EVIDENCE_STUDENTS = 5;
const A2 = 'HSF-IF.A.2';
const B4 = 'HSF-IF.B.4';

// Candidate alignment based on the actual prompts/rubrics, not section labels.
// A point can support two standards; never sum standards into a lesson grade.
export const ITEM_STANDARD_MAP = Object.freeze({
  '3.1-1': { codes: [A2], rationale: 'Read two function outputs from the drone graph and compare them.' },
  '3.1-2': { codes: [A2], rationale: 'Read and compare equal function outputs from the drone graph.' },
  '3.1-3': { codes: [A2], rationale: 'Read two function outputs from the drone graph and compare them.' },
  '3.1-4': { codes: [A2, B4], rationale: 'Interpret f(t) and f(t+1), using increasing, constant, and decreasing portions of a contextual graph.' },
  '3.2-1a': { codes: [A2], rationale: 'Interpret function notation with the correct calendar year and output units.' },
  '3.2-1b': { codes: [A2], rationale: 'Interpret a negative function input and zero output in context.' },
  '3.2-2a': { codes: [A2], rationale: 'Express contextual input and output quantities in function notation.' },
  '3.2-2b': { codes: [A2], rationale: 'Express contextual input and output quantities in function notation.' },
  '3.2-3a': { codes: [A2], rationale: 'Explain the meaning of an input when the function output is specified.' },
  '3.2-3b': { codes: [A2, B4], rationale: 'Interpret the proposed input and reason about contextual growth from given values, including the growth assumption.' },
  '3.2-4': { codes: [A2, B4], rationale: 'Translate function statements to ordered pairs and sketch a coherent contextual graph.' },
  '3.3-1a': { codes: [A2], rationale: 'Interpret function notation as an initial time and temperature.' },
  '3.3-1b': { codes: [A2], rationale: 'Interpret an inequality between function outputs in temperature context.' },
  '3.3-1c': { codes: [A2], rationale: 'Interpret function notation with time and temperature units.' },
  '3.3-1d': { codes: [A2], rationale: 'Interpret equal function outputs at different times.' },
  '3.3-1e': { codes: [A2], rationale: 'Interpret an inequality between function outputs in temperature context.' },
  '3.3-1f': { codes: [A2], rationale: 'Interpret an inequality between function outputs in temperature context.' },
  '3.3-2': { codes: [A2, B4], rationale: 'Translate function equalities and inequalities into a possible contextual graph.' },
  'CAPE-A': { codes: [A2], rationale: 'Interpret a function statement using elapsed time and motor temperature.' },
  'CAPE-B': { codes: [A2, B4], rationale: 'Translate recorded function values to points and sketch a continuous decreasing contextual graph.' },
  'CAPE-C': { codes: [B4], rationale: 'Use a continuous decreasing graph and measurements to justify a crossing interval without claiming an exact crossing time.' },
  'E-1': { codes: [A2], rationale: 'Interpret function notation with elapsed time and water-level units.' },
  'E-2': { codes: [A2], rationale: 'Compare two given function outputs in the aquarium context.' },
  'E-3': { codes: [A2, B4], rationale: 'Translate function values to points and sketch a coherent contextual graph.' },
});

function valueObject(value, fallback) {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function hasResponse(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return Boolean((Array.isArray(value) ? value : value?.points)?.length);
}

function accountId(row) { return row.accountId ?? row.account_id ?? row.id; }
function sectionId(row) { return row.sectionId ?? row.section_id; }
function inPeriod(row, periodId) {
  const tagged = row.periodId ?? row.period_id;
  return periodId == null || tagged == null || tagged === periodId;
}
function itemForVariant(item, variant) {
  return variant === 'scaffold' && item.scaffoldOverride
    ? { ...item, ...item.scaffoldOverride, id: item.id } : item;
}
function percent(numerator, denominator) {
  return denominator > 0 ? Math.round(numerator * 1000 / denominator) / 10 : null;
}
function sampleCaveat(count) {
  return count === 0 ? 'No scored responses yet. Do not infer understanding from participation or completion.'
    : count < MIN_EVIDENCE_STUDENTS ? `Small sample: ${count} student${count === 1 ? '' : 's'} with scored responses. Inspect the work before planning reteaching; this is not a mastery judgment.`
      : 'This is item-level evidence from this lesson, not a mastery judgment.';
}
function counts() {
  return { submittedCount: 0, blankCount: 0, pendingCount: 0, incorrectCount: 0,
    partialCount: 0, correctCount: 0, manualReviewedCount: 0, evidenceCount: 0,
    earnedPoints: 0, possiblePoints: 0 };
}

// A submitted blank is visible but is not evidence of demonstrated correctness.
// Missing/malformed scoring for a nonblank answer remains pending, never zero.
function observation(item, submission) {
  const answers = valueObject(submission.answers, {});
  const results = valueObject(submission.results, []);
  const result = Array.isArray(results) ? results.find((row) => row.itemId === item.id) : null;
  const points = item.points ?? 1;
  const manual = item.answer == null || item.type === 'plot';
  if (result?.status === 'blank') return { status: 'blank', manualReviewed: false };
  const responded = hasResponse(answers?.[item.id]);
  if (!responded) return { status: 'blank', manualReviewed: false };
  const validScore = result && TERMINAL.has(result.status) && Number.isFinite(result.earned)
    && Number.isFinite(points) && points > 0 && result.points === points
    && result.earned >= 0 && result.earned <= points
    && (result.status === 'correct' ? result.earned === points
      : result.status === 'incorrect' ? result.earned === 0 : result.earned > 0 && result.earned < points);
  if (!validScore) return { status: 'pending', manualReviewed: false };
  return { status: result.status, earned: result.earned, points, manualReviewed: manual };
}

function addObservation(target, result) {
  target.submittedCount += 1;
  target[`${result.status}Count`] += 1;
  if (TERMINAL.has(result.status)) {
    target.evidenceCount += 1;
    target.earnedPoints += result.earned;
    target.possiblePoints += result.points;
    if (result.manualReviewed) target.manualReviewedCount += 1;
  }
}
function finishCounts(target, evidenceStudentCount) {
  return {
    ...target,
    answeredCount: target.submittedCount - target.blankCount,
    completionPercent: percent(target.submittedCount - target.blankCount, target.submittedCount),
    correctnessPercent: percent(target.earnedPoints, target.possiblePoints),
    evidenceStudentCount,
    lowSample: evidenceStudentCount < MIN_EVIDENCE_STUDENTS,
    caveat: sampleCaveat(evidenceStudentCount),
  };
}

function timestamp(row) {
  const value = row.submittedAt ?? row.submitted_at;
  return typeof value === 'number' ? value : Date.parse(value) || 0;
}

/**
 * @param {object} input
 * @param {object} input.content Unmodified lesson content and variant overrides.
 * @param {Array} input.roster Authorized fictional students: {id,label,variant}.
 * @param {Array} input.submissions Teacher-unpacked submissions; answers and
 * results may also be JSON from sanitized database rows. No score is recalculated.
 * @param {Array} [input.progress] Raw item rows (snake_case or camelCase) or
 * grouped {accountId,variant,sectionId,answers} draft rows.
 * @param {Array} [input.circleAccountIds] Account IDs already scoped to report date.
 * @param {string|null} [input.periodId] Selected period; queries MUST be scoped upstream.
 * @param {string|null} [input.date] Circle date/as-of date, not a lesson-time filter.
 */
export function buildClassroomReport({ content, roster, submissions = [], progress = [], circleAccountIds = [], periodId = null, date = null }) {
  if (!Array.isArray(content?.sections) || !Array.isArray(roster)) throw new TypeError('Reporting requires lesson content and an authorized roster.');
  const sections = content.sections;
  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const students = [...new Map(roster.filter((row) => row && inPeriod(row, periodId)
    && typeof accountId(row) === 'string' && VARIANTS.includes(row.variant))
    .map((row) => [accountId(row), { id: accountId(row), label: row.label ?? row.accountLabel ?? accountId(row), variant: row.variant }])).values()];
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const submissionMap = new Map();
  const draftMap = new Map();
  const key = (id, section) => JSON.stringify([id, section]);
  const eligible = (row) => row && inPeriod(row, periodId) && studentMap.has(accountId(row))
    && row.variant === studentMap.get(accountId(row)).variant && sectionMap.has(sectionId(row));
  for (const submission of submissions.filter(eligible)) {
    const k = key(accountId(submission), sectionId(submission));
    const previous = submissionMap.get(k);
    // The DB normally enforces one submission. Deterministic deduplication avoids
    // inflated counts if a caller supplies history or a repeated join result.
    if (!previous || timestamp(submission) > timestamp(previous)
      || (timestamp(submission) === timestamp(previous) && (submission.revision ?? 0) >= (previous.revision ?? 0))) submissionMap.set(k, submission);
  }
  for (const row of progress.filter(eligible)) {
    const k = key(accountId(row), sectionId(row));
    const draft = draftMap.get(k) ?? {};
    const itemId = row.itemId ?? row.item_id;
    if (itemId) draft[itemId] = valueObject(row.answer, row.answer ?? '');
    else Object.assign(draft, valueObject(row.answers, {}));
    draftMap.set(k, draft);
  }
  const circle = new Set(circleAccountIds.filter((id) => studentMap.has(id)));
  const observations = new Map();
  const dailyStudents = students.map((student) => {
    const studentSections = sections.map((section) => {
      const k = key(student.id, section.id);
      const submission = submissionMap.get(k);
      const draft = draftMap.get(k);
      const itemResults = submission ? section.items.map((base) => ({ itemId: base.id, ...observation(itemForVariant(base, student.variant), submission) })) : [];
      observations.set(k, itemResults);
      const totals = counts();
      for (const result of itemResults) addObservation(totals, result);
      const answeredCount = submission ? totals.submittedCount - totals.blankCount
        : section.items.filter((item) => hasResponse(draft?.[item.id])).length;
      return {
        sectionId: section.id,
        status: submission ? totals.pendingCount > 0 ? 'awaiting-review' : 'scored' : draft ? 'draft' : 'not-started',
        submitted: Boolean(submission),
        ...(submission ? { submissionId: submission.id, submittedAt: submission.submittedAt ?? submission.submitted_at ?? null } : {}),
        itemCount: section.items.length,
        answeredCount,
        completionPercent: percent(answeredCount, section.items.length),
        blankCount: submission ? totals.blankCount : 0,
        pendingCount: totals.pendingCount,
        scoredItemCount: totals.evidenceCount,
        manualReviewedCount: totals.manualReviewedCount,
        correctness: { earnedPoints: totals.earnedPoints, possiblePoints: totals.possiblePoints,
          percent: percent(totals.earnedPoints, totals.possiblePoints) },
      };
    });
    return { accountId: student.id, label: student.label, variant: student.variant,
      circleSubmitted: circle.has(student.id), sections: studentSections,
      submittedSectionCount: studentSections.filter((section) => section.submitted).length,
      fullyAnsweredSectionCount: studentSections.filter((section) => section.submitted && section.answeredCount === section.itemCount).length,
      allSectionsSubmitted: sections.length > 0 && studentSections.every((section) => section.submitted),
      lessonStarted: studentSections.some((section) => section.status !== 'not-started') };
  });
  const dailySections = sections.map((section) => {
    const rows = dailyStudents.map((student) => student.sections.find((row) => row.sectionId === section.id));
    return { sectionId: section.id, title: section.title, rosterCount: students.length,
      notStartedCount: rows.filter((row) => row.status === 'not-started').length,
      draftCount: rows.filter((row) => row.status === 'draft').length,
      awaitingReviewCount: rows.filter((row) => row.status === 'awaiting-review').length,
      scoredCount: rows.filter((row) => row.status === 'scored').length,
      submittedCount: rows.filter((row) => row.submitted).length,
      fullyAnsweredCount: rows.filter((row) => row.submitted && row.answeredCount === row.itemCount).length,
      submittedItemCount: rows.filter((row) => row.submitted).reduce((sum, row) => sum + row.itemCount, 0),
      answeredSubmittedItemCount: rows.filter((row) => row.submitted).reduce((sum, row) => sum + row.answeredCount, 0),
      pendingItemCount: rows.reduce((sum, row) => sum + row.pendingCount, 0),
      scoredItemCount: rows.reduce((sum, row) => sum + row.scoredItemCount, 0) };
  });
  const reteach = [];
  const standards = [];
  for (const variant of VARIANTS) {
    const variantStudents = students.filter((student) => student.variant === variant);
    for (const section of sections) {
      for (const base of section.items) {
        const item = itemForVariant(base, variant);
        const totals = counts();
        let draftCount = 0;
        for (const student of variantStudents) {
          const k = key(student.id, section.id);
          const result = observations.get(k)?.find((row) => row.itemId === item.id);
          if (result) addObservation(totals, result);
          else if (draftMap.has(k)) draftCount += 1;
        }
        const mapping = ITEM_STANDARD_MAP[item.id];
        reteach.push({ sectionId: section.id, itemId: item.id, prompt: item.prompt, variant,
          rosterCount: variantStudents.length,
          missingSubmissionCount: variantStudents.length - totals.submittedCount,
          draftCount, ...finishCounts(totals, totals.evidenceCount),
          standards: mapping?.codes ?? [], mappingStatus: 'candidate-for-teacher-review',
          mappingRationale: mapping?.rationale ?? 'No item alignment has been reviewed.',
          followUp: totals.incorrectCount + totals.partialCount > 0 ? 'Inspect scored responses for reteaching.'
            : totals.pendingCount > 0 ? 'Review pending responses before deciding on reteaching.'
              : totals.blankCount > 0 ? 'Follow up on submitted blanks before judging understanding.'
                : totals.evidenceCount === 0 ? 'Collect responses before judging understanding.' : 'Use scored responses as lesson evidence only.' });
      }
    }
    for (const standard of content.standards ?? []) {
      const mapped = reteach.filter((row) => row.variant === variant && row.standards.includes(standard.code));
      const totals = counts();
      for (const row of mapped) for (const field of Object.keys(totals)) totals[field] += row[field];
      const evidenceStudents = new Set();
      for (const student of variantStudents) for (const row of mapped) {
        const result = observations.get(key(student.id, row.sectionId))?.find((result) => result.itemId === row.itemId);
        if (result && TERMINAL.has(result.status)) evidenceStudents.add(student.id);
      }
      standards.push({ code: standard.code, description: standard.plain, variant,
        mappingStatus: 'candidate-for-teacher-review',
        mappedItemIds: mapped.map((row) => row.itemId),
        mappedItemCount: mapped.length,
        rosterCount: variantStudents.length,
        missingSubmissionItemCount: mapped.reduce((sum, row) => sum + row.missingSubmissionCount, 0),
        ...finishCounts(totals, evidenceStudents.size) });
    }
  }
  return {
    periodId, date,
    daily: { students: dailyStudents, sections: dailySections, counts: {
      rosterCount: students.length,
      circleSubmittedCount: circle.size,
      lessonStartedCount: dailyStudents.filter((student) => student.lessonStarted).length,
      studentsWithSubmissionsCount: dailyStudents.filter((student) => student.submittedSectionCount > 0).length,
      allSectionsSubmittedCount: dailyStudents.filter((student) => student.allSectionsSubmitted).length,
      fullyAnsweredLessonCount: dailyStudents.filter((student) => sections.length > 0 && student.fullyAnsweredSectionCount === sections.length).length,
      submittedSectionCount: dailySections.reduce((sum, row) => sum + row.submittedCount, 0),
      sectionOpportunityCount: sections.length * students.length,
      awaitingReviewSectionCount: dailySections.reduce((sum, row) => sum + row.awaitingReviewCount, 0),
    } },
    reteach, standards,
    definitions: {
      scope: 'Selected authorized period only. Lesson status is an assignment snapshot; circle participation is for the supplied date. No attendance inference.',
      completion: 'Answered items / items in submitted sections. Draft answers are shown separately and are never scored.',
      correctness: 'Earned points / possible points for nonblank, scored responses only. Blank, pending, draft, and unsubmitted work are excluded from this evidence denominator.',
      outcomes: 'Blank, pending, incorrect, partial, and correct are mutually exclusive for submitted items. Manual-reviewed is an overlapping count of scored written or plotted responses.',
      standards: 'Candidate item alignments require teacher review. Evidence is not mastery. Items mapped to two standards appear under both; do not add standard totals together.',
      grades: 'Reporting evidence percentages are not assignment grades. Existing scores, including the 70% accuracy / 30% completion Opener grade, are unchanged.',
      lowSampleThreshold: MIN_EVIDENCE_STUDENTS,
    },
  };
}
