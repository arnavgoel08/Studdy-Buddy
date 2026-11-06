'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'instant-planner.js'), 'utf8');
const context = { window: {}, Date, Math, Number, String, Array, Object, Intl };
vm.runInNewContext(source, context);
const planner = context.window.SBInstantPlanner;
assert(planner && typeof planner.generate === 'function');

function datePlus(days, now) {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
const now = new Date(2026, 9, 29, 12, 0, 0).getTime();
const exams = [
  { subject: 'Maths', date: datePlus(5, now), topics: [
    { name: 'Double integrals', confidence: 0, lastPracticed: 0 },
    { name: 'Jacobian', confidence: 2, lastPracticed: 0 }
  ] },
  { subject: 'Physics', date: datePlus(10, now), topics: [
    { name: 'Quantum mechanics', confidence: 1, lastPracticed: 0 }
  ] }
];
const result = planner.generate(exams, 1.5, now);
assert(result.plan, result.error || 'Expected a generated plan');
assert(result.stats.tasks > 0);
assert(result.plan.days.length <= 14);
assert(result.plan.days[0].label === 'Today');
assert(!/AI model|paid API/i.test(result.plan.tips), 'planner tips must not show technical AI/provider status');
for (const day of result.plan.days) {
  const total = day.tasks.reduce((sum, task) => sum + task.mins, 0);
  assert(total <= 90, `Daily plan exceeded 90 minutes: ${total}`);
  assert(day.tasks.length <= 4);
  for (const task of day.tasks) {
    assert(task.mins >= 15 && task.mins <= 90);
    assert(['Maths', 'Physics'].includes(task.subject));
    assert(task.text.length > 5);
  }
}
assert(result.plan.days.some(day => day.tasks.some(task => /Double integrals/.test(task.text))));
assert(result.plan.days.some(day => day.tasks.some(task => /Quantum mechanics/.test(task.text))));
console.log('PASS instant plans are generated locally and cover supplied subjects/topics');
console.log('PASS every day respects the selected study-time budget');

const generic = planner.generate([{ subject: 'Python', date: datePlus(2, now), topics: [] }], 0.5, now);
assert(generic.plan);
assert(generic.plan.days.every(day => day.tasks.reduce((sum, task) => sum + task.mins, 0) <= 30));
assert(generic.plan.days.some(day => day.tasks.some(task => /Core concepts|Practice questions|Revision and self-test/.test(task.text))));
console.log('PASS topic-free exams receive generic tasks and obey a 30-minute budget');

const today = planner.generate([{ subject: 'English', date: datePlus(0, now), topics: [{ name: 'Essay structure', confidence: 3 }] }], 1, now);
assert(today.plan);
assert.equal(today.plan.days.length, 1);
assert(today.plan.days[0].tasks.every(task => task.mins <= 15));
console.log('PASS same-day exams only receive short recall tasks');

assert.match(planner.generate(exams, 0.25, now).error, /between 0.5 and 10/i);
assert.match(planner.generate([{ subject: 'Old exam', date: datePlus(-2, now), topics: [] }], 2, now).error, /upcoming exam/i);
console.log('PASS invalid hours and past exams are rejected');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(html.includes('<script src="instant-planner.js"></script>'));
assert(html.includes('⚡ Instant planner'));
assert(html.includes('function tryInstantPlanRequest(text)'));
assert(html.includes('var result = window.SBInstantPlanner.generate(state.study.exams, hours, Date.now());'));
assert(html.includes('Add each subject and its exact exam date'));
assert(html.includes('aria-label="Instant Planner, page 2"'));
assert(html.includes('id="plannerPageTasks"'));
assert(html.includes('id="speakTodayBtn"'));
assert(html.includes('id="speakPlanBtn"'));
assert(!html.includes('id="chatBuddy"'));
assert(!html.includes('id="aiPlanBtn"'));
assert(!html.includes('No AI model or paid API was used.'));
console.log('PASS app UI uses the instant planner and page 2 voice task reader');

// Exercise the actual chat intent router without a DOM or an AI model.
const routerStart = html.indexOf('function tryInstantPlanRequest(text) {');
const routerEnd = html.indexOf('\nfunction tryCommand(text)', routerStart);
assert(routerStart >= 0 && routerEnd > routerStart, 'could not locate instant-plan router');
const routerSource = html.slice(routerStart, routerEnd);
function routerContext(exams) {
  const input = { value: '2' };
  const status = { textContent: '' };
  const subjectInput = { focus() {} };
  const calls = { opened: 0, generated: 0, spoken: [] };
  const context = {
    state: { study: { exams: exams || [] } },
    Date, Number, String, Math,
    window: { setTimeout(fn) { fn(); } },
    $: selector => selector === '#dailyStudyHours' ? input : selector === '#planGenerationStatus' ? status : subjectInput,
    openOverlay() { calls.opened++; },
    createInstantPlan() { calls.generated++; return { plan: {}, stats: { tasks: 4, days: 2, dailyBudgetMinutes: 180 } }; },
    speakBot(message) { calls.spoken.push(message); },
    setPlannerStatus(message) { status.textContent = message; }
  };
  vm.runInNewContext(routerSource, context);
  return { route: context.tryInstantPlanRequest, input, status, calls };
}
const noExams = routerContext([]);
assert.equal(noExams.route('I have exams in 2 weeks: Maths, Physics and Chemistry. I can study 3 hours a day.'), true);
assert.equal(noExams.calls.opened, 1);
assert.equal(noExams.calls.generated, 0);
assert.equal(noExams.input.value, '3');
assert.match(noExams.status.textContent, /exact exam date/i);
console.log('PASS spoken planning intent opens the instant planner instead of a Buddy chat');

const future = datePlus(5, Date.now());
const saved = routerContext([{ subject: 'Maths', date: future, topics: [] }]);
assert.equal(saved.route('Plan my exam weeks'), true);
assert.equal(saved.calls.generated, 1);
assert.equal(saved.calls.opened, 0);
console.log('PASS generic planning requests use saved exams and the instant planner');
assert(saved.calls.spoken.some(message => /instant plan is ready on page 2/i.test(message)));
console.log('PASS planning confirmation refers to page 2, not the removed Buddy chat');

const mismatch = routerContext([{ subject: 'Maths', date: future, topics: [] }]);
assert.equal(mismatch.route('I need a weekend revision plan for Python and web development, 4 hours each day.'), true);
assert.equal(mismatch.calls.generated, 0);
assert.equal(mismatch.calls.opened, 1);
console.log('PASS requests for different subjects do not silently reuse unrelated saved exams');

const ordinary = routerContext([]);
assert.equal(ordinary.route('hello'), false);
assert.equal(ordinary.route('What is a study plan?'), false);
assert.equal(ordinary.route('Remind me to study my plan in 30 minutes'), false);
console.log('PASS ordinary questions and reminder requests are not misrouted to planning');
