/* Deterministic, on-device study planning. This file never calls an AI model or network. */
(function (root) {
  'use strict';

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function dateOnly(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  function dayNumber(date) { return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000; }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
    var d = new Date(value + 'T12:00:00');
    return Number.isFinite(d.getTime()) && d.getFullYear() === Number(value.slice(0, 4)) &&
      d.getMonth() + 1 === Number(value.slice(5, 7)) && d.getDate() === Number(value.slice(8, 10)) ? d : null;
  }
  function dateLabel(date, index) {
    if (index === 0) return 'Today';
    return 'Day ' + (index + 1) + ' · ' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  function genericTopics() { return ['Core concepts', 'Practice questions', 'Revision and self-test']; }

  function generate(exams, hoursPerDay, nowMs) {
    var hours = Number(hoursPerDay);
    if (!Number.isFinite(hours) || hours < 0.5 || hours > 10) {
      return { error: 'Enter daily study time between 0.5 and 10 hours.' };
    }
    var now = new Date(Number.isFinite(nowMs) ? nowMs : Date.now());
    var today = dateOnly(now);
    var todayNumber = dayNumber(today);
    var source = Array.isArray(exams) ? exams : [];
    var active = source.map(function (exam) {
      var examDate = validDate(exam && exam.date);
      if (!examDate || !String(exam.subject || '').trim()) return null;
      var daysLeft = dayNumber(dateOnly(examDate)) - todayNumber;
      if (daysLeft < 0) return null;
      var topics = Array.isArray(exam.topics) ? exam.topics : [];
      topics = topics.map(function (topic) {
        if (typeof topic === 'string') return { name: topic, confidence: 0, lastPracticed: 0 };
        return topic && typeof topic === 'object' ? topic : null;
      }).filter(function (topic) { return topic && String(topic.name || '').trim(); });
      if (!topics.length) topics = genericTopics().map(function (name) { return { name: name, confidence: 0, lastPracticed: 0 }; });
      return { subject: String(exam.subject).trim().slice(0, 60), date: exam.date, daysLeft: daysLeft, topics: topics };
    }).filter(Boolean);

    if (!active.length) return { error: 'Add at least one upcoming exam with a valid date first.' };

    var maxDaysLeft = active.reduce(function (max, exam) { return Math.max(max, exam.daysLeft); }, 0);
    var horizon = Math.min(14, Math.max(1, maxDaysLeft + 1));
    var dailyBudget = Math.round(hours * 60);
    var candidates = [];
    active.forEach(function (exam) {
      exam.topics.forEach(function (topic) {
        candidates.push({
          subject: exam.subject,
          topic: String(topic.name).trim().slice(0, 100),
          confidence: clamp(Math.round(Number(topic.confidence) || 0), 0, 3),
          daysLeft: exam.daysLeft,
          lastPracticed: Number(topic.lastPracticed) || 0,
          lastAssigned: -99,
          count: 0
        });
      });
    });

    function score(candidate, dayIndex) {
      var weakTopic = (3 - candidate.confidence) * 2.2;
      var daysUntilExam = Math.max(0, candidate.daysLeft - dayIndex);
      var urgency = 4 / (daysUntilExam + 1);
      var freshness = Math.min(7, Math.max(0, dayIndex - candidate.lastAssigned)) * 0.9;
      var stalePractice = candidate.lastPracticed ? Math.min(1.5, Math.max(0, (now.getTime() - candidate.lastPracticed) / 86400000) / 7) : 1;
      return weakTopic + urgency + freshness + stalePractice - candidate.count * 0.15;
    }

    var days = [];
    for (var dayIndex = 0; dayIndex < horizon; dayIndex++) {
      var dayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayIndex);
      var remaining = dailyBudget;
      var picked = Object.create(null);
      var tasks = [];
      while (remaining >= 15 && tasks.length < 4) {
        var eligible = candidates.filter(function (candidate) {
          return candidate.daysLeft >= dayIndex && !picked[candidate.subject + '|' + candidate.topic];
        });
        if (!eligible.length) break;
        eligible.sort(function (a, b) {
          return score(b, dayIndex) - score(a, dayIndex) || a.count - b.count || a.subject.localeCompare(b.subject);
        });
        var candidate = eligible[0];
        var examDay = candidate.daysLeft === dayIndex;
        var preferred = examDay ? 15 : candidate.confidence <= 1 ? 35 : candidate.confidence === 2 ? 30 : 25;
        var minutes = Math.min(preferred, remaining);
        if (minutes < 15) break;
        var taskText;
        if (examDay) taskText = 'Quick recall and key-point review: ' + candidate.topic;
        else if (candidate.confidence <= 1) taskText = 'Review the basics, then solve 5 practice questions: ' + candidate.topic;
        else if (candidate.confidence === 2) taskText = 'Practise questions and review mistakes: ' + candidate.topic;
        else taskText = 'Active recall and timed revision: ' + candidate.topic;
        tasks.push({ subject: candidate.subject, text: taskText, mins: minutes, done: false });
        picked[candidate.subject + '|' + candidate.topic] = true;
        candidate.lastAssigned = dayIndex;
        candidate.count++;
        remaining -= minutes;
      }
      if (tasks.length) days.push({ label: dateLabel(dayDate, dayIndex), tasks: tasks });
    }

    if (!days.length) return { error: 'No study tasks could be scheduled. Check the exam dates and daily hours.' };
    var warnings = [];
    if (maxDaysLeft >= 14) warnings.push('This is a 14-day rolling plan. Rebuild it later to plan beyond this window.');
    return {
      plan: {
        title: 'Your instant study plan',
        tips: 'Daily study time is capped at ' + dailyBudget + ' minutes. Take short breaks between tasks.',
        days: days
      },
      stats: { days: days.length, tasks: days.reduce(function (total, day) { return total + day.tasks.length; }, 0), dailyBudgetMinutes: dailyBudget },
      warnings: warnings
    };
  }

  root.SBInstantPlanner = { generate: generate };
})(typeof window !== 'undefined' ? window : globalThis);
