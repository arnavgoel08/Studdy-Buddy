/* Study Buddy simple and explainable recommendation engine.
 * No AI claims: uses exam date, self-rated confidence and recency only. */
(function (root, make) {
  var lib = make();
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  if (root) root.SBStudyEngine = lib;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  function daysUntil(ymd, now) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd || '')) return Infinity;
    var end = new Date(ymd + 'T23:59:59');
    if (Number.isNaN(end.getTime())) return Infinity;
    return Math.ceil((end.getTime() - now) / 86400000);
  }
  function recommend(exams, now) {
    now = now || Date.now();
    var options = [];
    (exams || []).forEach(function (exam) {
      var left = daysUntil(exam.date, now);
      if (!Number.isFinite(left) || left < 0) return;
      (exam.topics || []).forEach(function (topic) {
        var conf = Math.max(0, Math.min(3, Number(topic.confidence) || 0));
        // Prioritize unstarted/weak topics, then approaching exams. Completed topics can be revised, too.
        var age = topic.lastPracticed ? Math.max(0, (now - topic.lastPracticed) / 86400000) : 14;
        var score = (3 - conf) * 35 + 18 / (left + 1) + Math.min(age, 14) * 1.5;
        options.push({ exam: exam, topic: topic, daysLeft: left, score: score, minutes: conf <= 1 ? 25 : 15, questions: conf <= 1 ? 3 : 2 });
      });
    });
    options.sort(function (a, b) { return b.score - a.score || a.daysLeft - b.daysLeft; });
    return options[0] || null;
  }
  return { recommend: recommend, daysUntil: daysUntil };
});
