#!/usr/bin/env python3
"""Static Study Buddy repository checks. Python 3 standard library only."""
from pathlib import Path
import json
import re
import sys
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ['index.html', 'browser-ai.js', 'model-picker.js', 'shim.js', 'study-engine.js', 'instant-planner.js', 'study-guard.js', 'vercel.json', 'vendor/katex/katex.min.js', 'vendor/katex/katex.min.css', 'vendor/katex/LICENSE', 'LICENSES.md', 'README.md']

class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'script' and a.get('src'):
            self.refs.append(a['src'])
        if tag == 'link' and a.get('href') and a.get('rel', '').lower() in ('stylesheet', 'icon', 'manifest'):
            self.refs.append(a['href'])

def check():
    errors = []
    for rel in REQUIRED:
        if not (ROOT / rel).is_file(): errors.append(f'missing {rel}')
    if errors: return errors
    site = (ROOT / 'index.html').read_text(encoding='utf-8')
    refs = Refs()
    refs.feed(site)
    for ref in refs.refs:
        if ref.startswith(('https:', 'http:', 'data:', '#', '//')): continue
        path = ref.split('#', 1)[0].split('?', 1)[0].lstrip('/')
        if not (ROOT / path).is_file(): errors.append(f'broken asset reference: {ref}')
    try:
        cfg = json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))
        if cfg.get('version') != 2: errors.append('vercel.json must use version 2')
    except (ValueError, OSError) as e:
        errors.append(f'invalid vercel.json: {e}')
    if 'window.__SB_BROWSER_AI=true' not in site: errors.append('browser AI flag missing')
    if 'browserAiLoad' not in site: errors.append('AI tutor load control missing')
    if 'SBInstantPlanner.generate' not in site: errors.append('instant planner integration missing')
    if '<script src="study-guard.js"></script>' not in site: errors.append('study-only guard script missing')
    if 'window.SBStudyGuard.isStudyRequest(text, cfg.id, !!img)' not in site: errors.append('tutor request guard missing')
    if 'window.SBStudyGuard.isAcademicSubject(subject)' not in site: errors.append('planner subject validation missing')
    if site.count('STRICT STUDY-ONLY SCOPE') < 3: errors.append('model-level study-only rules missing from one or more tutors')
    if 'Create reliable study plan (no AI)' in site: errors.append('old hidden planner copy remains')
    if 'id="chatBuddy"' in site or 'Chat with Buddy' in site: errors.append('removed Buddy chat still appears on page 2')
    if 'id="aiPlanBtn"' in site: errors.append('AI planning control must not be present')
    if 'id="plannerPageTasks"' not in site or 'id="speakTodayBtn"' not in site: errors.append('instant planner voice page is incomplete')
    if 'No AI model or paid API was used.' in site: errors.append('technical AI/provider status must not appear in planner UI')
    if re.search(r'sk-ant-[A-Za-z0-9_-]{12,}', site): errors.append('possible real Anthropic key detected')
    if (ROOT / '.env').exists(): errors.append('do not include .env in public deployment folder')
    return errors

if __name__ == '__main__':
    failures = check()
    if failures:
        print('FAIL — Static checks:')
        for f in failures: print(' •', f)
        sys.exit(1)
    print('PASS — assets, Vercel JSON, instant planner, page 2 voice reader, study-only guardrails, AI tutor entry points, and secret checks')
