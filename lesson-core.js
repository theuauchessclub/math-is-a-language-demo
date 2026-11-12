function fail(status,message){const e=new Error(message);e.status=status;throw e;}
function itemForVariant(item, variant) {
  const override = variant === 'scaffold' ? item.scaffoldOverride : null;
  return override ? { ...item, ...override, id: item.id } : item;
}

function lessonForStudent(content, variant) {
  return {
    title: content.title,
    brand: content.brand,
    edition: content.edition,
    alternateEdition: content.alternateEdition,
    standards: content.standards,
    targets: content.targets,
    sources: content.sources,
    graph: content.graph,
    sections: content.sections.map((section) => ({
      id: section.id,
      title: section.title,
      standard: section.standard,
      intro: section.intro,
      graph: section.graph,
      ...(variant === 'scaffold' && section.scaffold ? { scaffold: section.scaffold } : {}),
      items: section.items.map((base) => {
        const item = itemForVariant(base, variant);
        return {
          id: item.id,
          label: item.label,
          intro: item.intro,
          prompt: item.prompt,
          type: item.type,
          choices: item.choices,
          graph: item.graph,
          points: item.points ?? 1,
          ...(variant === 'scaffold' && item.scaffold ? { scaffold: item.scaffold } : {}),
        };
      }),
    })),
  };
}

function cleanPlot(value, graph) {
  if (typeof value === 'string' && !value.trim()) return '';
  const points = Array.isArray(value) ? value : value?.points;
  if (!Array.isArray(points) || points.length > 50) fail(400, 'The sketch must contain up to 50 graph points.');
  const valid = points.every((point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)
    && (!graph || (point[0] >= graph.xMin && point[0] <= graph.xMax && point[1] >= graph.yMin && point[1] <= graph.yMax)));
  if (!valid) fail(400, 'Place sketch points inside the graph.');
  if (!Array.isArray(value) && value.connect !== undefined && typeof value.connect !== 'boolean') fail(400, 'Choose whether to connect sketch points.');
  return Array.isArray(value) ? points : { points, ...(value.connect !== undefined ? { connect: value.connect } : {}) };
}

function cleanAnswer(item, value) {
  if (value === undefined || value === null) return '';
  if (item.type === 'plot') return cleanPlot(value, item.graph);
  if (typeof value !== 'string' && typeof value !== 'number') fail(400, `Use text for ${item.id}.`);
  const clean = String(value).trim();
  if (clean.length > 4_000) fail(400, `Shorten the response to ${item.id} to 4,000 characters.`);
  if (item.type === 'choice' && clean && !item.choices?.includes(clean)) fail(400, `Choose a listed answer for ${item.id}.`);
  return clean;
}

function hasResponse(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return Boolean((Array.isArray(value) ? value : value?.points)?.length);
}

function normalized(value) {
  return String(value).normalize('NFKC').toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/,$/, '');
}

function grade(section, variant, rawAnswers) {
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) fail(400, 'Send responses for this section.');
  const items = section.items.map((item) => itemForVariant(item, variant));
  const allowed = new Set(items.map(({ id }) => id));
  if (Object.keys(rawAnswers).some((key) => !allowed.has(key))) fail(400, 'One or more questions are outside this section.');
  const answers = Object.fromEntries(items.map((item) => [item.id, cleanAnswer(item, rawAnswers[item.id])]));
  const results = items.map((item) => {
    const points = item.points ?? 1;
    const answer = answers[item.id];
    const manual = item.answer === null || item.answer === undefined || item.type === 'plot';
    if (!hasResponse(answer)) return { itemId: item.id, status: 'blank', earned: 0, points };
    if (manual) return { itemId: item.id, status: 'pending', earned: null, points };
    const acceptable = Array.isArray(item.answer) ? item.answer : [item.answer];
    const correct = acceptable.some((expected) => normalized(answer) === normalized(expected));
    return { itemId: item.id, status: correct ? 'correct' : 'incorrect', earned: correct ? points : 0, points };
  });
  return { answers, results };
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function sectionScore(sectionId, results, version) {
  const complete = results.filter(({ status }) => status !== 'blank').length;
  const graded = results.filter(({ status }) => status !== 'pending');
  const earned = graded.reduce((sum, result) => sum + result.earned, 0);
  const points = results.reduce((sum, result) => sum + result.points, 0);
  const gradedPoints = graded.reduce((sum, result) => sum + result.points, 0);
  const pending = graded.length < results.length;
  const completion = results.length ? complete * 100 / results.length : 100;
  const accuracy = pending ? null : points ? earned * 100 / points : 100;
  return {
    accuracy: accuracy === null ? null : round(accuracy),
    completion: round(completion),
    total: accuracy === null ? null : round(sectionId === 'opener'
      ? (version?.openerAccuracyWeight ?? 0.7) * accuracy + (version?.openerCompletionWeight ?? 0.3) * completion
      : accuracy),
    pending,
    scoredAccuracy: gradedPoints ? round(earned * 100 / gradedPoints) : null,
    earned,
    gradedPoints,
    points,
    complete,
  };
}


export {itemForVariant,lessonForStudent,cleanAnswer,hasResponse,grade,sectionScore};
