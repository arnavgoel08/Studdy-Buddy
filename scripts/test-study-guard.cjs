'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const guard = require('../study-guard.js');

const academic = [
  'Solve x² + 5x + 6 = 0',
  'Explain quantum tunnelling',
  'Why does this Python loop throw a syntax error?',
  'What is the function of mitochondria?',
  'How does rain form?',
  'Write an essay about the French Revolution',
  'Explain the role of love in Romeo and Juliet for my English literature assignment',
  'Solve this equation and write a love poem'
];
for (const prompt of academic) assert.equal(guard.isStudyRequest(prompt, 'solver', false), true, `academic request blocked: ${prompt}`);
console.log('PASS study guard permits academic questions and keeps the academic part of mixed requests');

const unrelated = [
  'Tell me a joke',
  'Tell me a joke about algebra',
  'Write a romantic poem for my girlfriend',
  'Write a poem about quantum physics',
  'Give me a chicken biryani recipe',
  'What should I text my crush?',
  'Explain the best way to invest',
  'Recommend a movie',
  'Explain why my girlfriend ignores me',
  'Help me solve my relationship problem',
  'How do I invest in crypto?',
  'What phone should I buy?'
];
for (const prompt of unrelated) assert.equal(guard.isStudyRequest(prompt, 'solver', false), false, `off-topic request passed: ${prompt}`);
console.log('PASS study guard rejects common unrelated requests, even if they mention an academic keyword');

for (const subject of ['IT', 'CS', 'Engineering Physics', 'Maths', 'Technical English', 'MDP', 'Intro to Psychology', 'Music Theory']) {
  assert.equal(guard.isAcademicSubject(subject), true, `valid subject rejected: ${subject}`);
}
for (const subject of ['Wedding planning', 'Love life', 'Travel', 'Grocery shopping', 'Movie night']) {
  assert.equal(guard.isAcademicSubject(subject), false, `non-academic planner subject accepted: ${subject}`);
}
assert.equal(guard.isStudyRequest('', 'solver', true), true, 'photo questions should reach the model-level image scope check');
assert.match(guard.redirect(), /Study Buddy/);
console.log('PASS planner subject validation, image handling and consistent redirect');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(html.includes('<script src="study-guard.js"></script>'));
assert(html.includes('window.SBStudyGuard.isStudyRequest(text, cfg.id, !!img)'));
assert(html.includes('window.SBStudyGuard.isAcademicSubject(subject)'));
assert((html.match(/STRICT STUDY-ONLY SCOPE/g) || []).length >= 3, 'both tutors need model-level scope rules');
console.log('PASS both tutor pages and planner form are wired to study-only guardrails');
