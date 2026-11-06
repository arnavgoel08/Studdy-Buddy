/* Study Buddy optional browser tutor. Runs text inference on visitor's WebGPU GPU.
 * On explicit request only, downloads WebLLM runtime and Apache-2.0 SmolLM2 models.
 * Third-party CDN/model hosts see normal download traffic (IP address); see docs.
 */
(function () {
  'use strict';
  if (!window.__SB_BROWSER_AI) return;
  const MODELS = [
    { id: 'SmolLM2-360M-Instruct-q4f32_1-MLC', name: 'SmolLM2 360M · recommended lightweight · ~580 MB GPU memory', mb: 580 },
    { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', name: 'SmolLM2 1.7B · higher memory · experimental · ~1.8 GB GPU memory', mb: 1800 }
  ];
  const LIBRARY_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.82';
  let engine = null, loading = null, selected = MODELS[0].id, generating = false, gpuFailed = false;
  let ui = {};
  function error(code, message) { const e = new Error(message || code); e.code = code; return e; }
  // Distinguish a lost WebGPU device from a harmless JSON/streaming error.
  function isDeviceLost(e) {
    let m = String(e && (e.message || e) || '');
    if (e && e.cause) m += ' ' + String(e.cause.message || e.cause);
    return /device (?:was )?lost|DXGI_ERROR_DEVICE_HUNG|DXGI_ERROR_DEVICE_REMOVED|GPUDeviceLostInfo|Object has already been disposed|device removed/i.test(m);
  }
  function failDevice(e) {
    if (!isDeviceLost(e)) return false;
    gpuFailed = true;
    engine = null;
    tell('GPU session crashed. Close ALL Chrome windows, reopen Chrome, then load the lightweight 360M model. Do not retry in this tab.', 'error');
    updateUI();
    return true;
  }
  function tell(message, state) {
    if (ui.status) { ui.status.textContent = message; ui.status.dataset.state = state || ''; }
  }
  function updateUI() {
    if (ui.load) { ui.load.disabled = !!loading || generating || gpuFailed; ui.load.textContent = gpuFailed ? 'Restart Chrome first' : loading ? 'Loading…' : engine ? 'AI tutor ready ✓' : 'Load AI tutor'; }
    if (ui.model) ui.model.disabled = !!loading || generating || gpuFailed;
  }
  function checkSupport() {
    if (!window.isSecureContext || !navigator.gpu) throw error('browser_ai_unsupported', 'Needs an HTTPS/localhost page and a browser with WebGPU enabled. Try current Chrome/Edge on a device with GPU support.');
  }
  async function load() {
    if (gpuFailed) throw error('browser_ai_device_lost', 'GPU session lost; close every Chrome window and restart Chrome.');
    if (engine) return engine;
    if (loading) return loading;
    loading = (async function () {
      try {
        checkSupport();
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw error('browser_ai_unsupported', 'No compatible WebGPU adapter found. Update graphics drivers or try a desktop Chrome/Edge browser.');
        tell('Downloading the AI tutor. The first load needs internet and significant storage…', 'loading');
        const webllm = await import('https://esm.run/@mlc-ai/web-llm@0.2.82');
        if (!webllm || typeof webllm.CreateMLCEngine !== 'function') throw error('browser_ai_load_failed', 'WebLLM runtime could not be loaded.');
        const target = selected;
        const loaded = await webllm.CreateMLCEngine(target, {
          initProgressCallback: function (p) {
            const pct = p && typeof p.progress === 'number' ? ' ' + Math.round(p.progress * 100) + '%' : '';
            const msg = p && p.text ? String(p.text).slice(0, 130) : 'Loading model';
            tell(msg + pct, 'loading');
          }
        });
        engine = loaded;
        tell('AI tutor ready. Answers may be inaccurate; check important work.', 'ready');
        return engine;
      } catch (e) {
        if (failDevice(e)) throw error('browser_ai_device_lost', 'GPU session lost; close and restart Chrome.');
        const unsupported = e && e.code === 'browser_ai_unsupported';
        tell((unsupported ? '' : 'Could not load AI: ') + (e && e.message || 'Unknown error') + ' · Try the lightweight model if memory is low.', 'error');
        throw e && e.code ? e : error('browser_ai_load_failed', e && e.message);
      } finally {
        loading = null;
        updateUI();
      }
    })();
    updateUI();
    return loading;
  }
  async function selectModel(id) {
    if (!MODELS.some(m => m.id === id) || generating || loading || selected === id) return;
    selected = id;
    if (engine) {
      const old = engine; engine = null;
      try { if (typeof old.unload === 'function') await old.unload(); } catch (e) {}
    }
    tell('Model changed. Press “Load AI tutor” to activate it.', 'idle');
    updateUI();
  }
  function toMessages(input) {
    const a = typeof input === 'string' ? [{ role:'user', content:input }] : (Array.isArray(input) ? input.slice() : []);
    let system = 'You are Study Buddy, a careful, helpful study tutor. Avoid verbatim copyrighted textbook passages. Do not invent sources; acknowledge uncertainty.';
    // Existing chat framework passes system instructions as the first user entry.
    if (a.length > 1 && a[0].role === 'user') system = String(a.shift().content || system);
    const messages = [{ role: 'system', content: system.slice(0, 3600) }];
    a.slice(-8).forEach(function (m) {
      if (!m || !['user', 'assistant'].includes(m.role)) return;
      messages.push({ role:m.role, content:String(m.content || '').slice(0, 3400) });
    });
    if (messages.length < 2) throw error('bad_request');
    return messages;
  }
  function guard(signal) {
    if (gpuFailed) throw error('browser_ai_device_lost', 'GPU session lost; restart Chrome.');
    if (signal && signal.aborted) throw error('cancelled');
    if (!engine) throw error('browser_ai_not_loaded');
    if (generating) throw error('browser_ai_busy');
    generating = true;
    updateUI();
    const stop = function () { try { engine && engine.interruptGenerate && engine.interruptGenerate(); } catch (e) {} };
    if (signal) signal.addEventListener('abort', stop, { once:true });
    return function () {
      if (signal) signal.removeEventListener('abort', stop);
      generating = false;
      updateUI();
    };
  }
  function assertReady(opts) {
    if (gpuFailed) throw error('browser_ai_device_lost', 'GPU session lost; restart Chrome.');
    if (opts && opts.images && opts.images.length) throw error('images_unavailable');
    if (opts && opts.mode === 'research') throw error('browser_ai_unsupported');
    if (opts && opts.signal && opts.signal.aborted) throw error('cancelled');
    if (!engine) throw error('browser_ai_not_loaded');
  }
  async function sample(input, opts) {
    opts = opts || {};
    assertReady(opts);
    const end = guard(opts.signal);
    let text = '';
    try {
      if (opts.onMeta) opts.onMeta({ mode:'standard', model:selected.replace('-Instruct-q4f16_1-MLC', '').replace('-Instruct-q4f32_1-MLC', ''), thinking:false, tools:false });
      const messages = toMessages(input);
      try {
        const stream = await engine.chat.completions.create({ messages, stream:true, temperature:0.25, max_tokens:650 });
        for await (const chunk of stream) {
          if (opts.signal && opts.signal.aborted) throw error('cancelled');
          const delta = chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content || '';
          if (delta) { text += delta; if (opts.onText) opts.onText({ text, delta }); }
        }
      } catch (streamErr) {
        // Some GPU/runtime combinations support non-streaming completions but fail during streaming.
        // Retry only when no partial answer was emitted to avoid duplicate/contradictory output.
        if (text || (opts.signal && opts.signal.aborted) || isDeviceLost(streamErr)) throw streamErr;
        console.warn('[Study Buddy AI] Streaming unavailable; trying basic completion:', streamErr);
        const response = await engine.chat.completions.create({ messages, stream:false, temperature:0.25, max_tokens:650 });
        text = String(response?.choices?.[0]?.message?.content || '');
        if (text && opts.onText) opts.onText({ text, delta:text });
      }
      if (opts.signal && opts.signal.aborted) throw error('cancelled');
      if (!text.trim()) throw error('browser_ai_generation_failed', 'The local model produced no text. Try another model or reload it.');
      return { text:text, truncated:false, modelTierApplied:'browser-local' };
    } catch (e) {
      if (opts.signal && opts.signal.aborted) throw error('cancelled');
      console.error('[Study Buddy AI] Chat generation failed:', e);
      if (failDevice(e)) throw error('browser_ai_device_lost', 'GPU session lost; restart Chrome.');
      throw e && e.code ? e : error('browser_ai_generation_failed', e && e.message || 'Local model generation failed');
    }
    finally { end(); }
  }
  sample.limits = function () { return Promise.resolve({ images:null }); };
  // Local-first optional tutoring interface.
  window.claude = {
    standalone:false,
    use:function (name) {
      return Promise.resolve(name === 'sample' ? sample : name === 'db' ? null : name === 'user' ? { id:() => Promise.resolve('public-browser') } : null);
    },
    usage:function () { return Promise.resolve(null); }
  };
  window.SBBrowserAI = { load:load, selectModel:selectModel, modelIds:MODELS.map(m=>m.id), getState:() => ({ ready:!!engine, loading:!!loading, selected, generating, gpuFailed }) };
  function initUI() {
    ui.load = document.getElementById('browserAiLoad');
    ui.status = document.getElementById('browserAiStatus');
    ui.model = document.getElementById('freeModelSelect');
    if (ui.model) {
      ui.model.textContent = '';
      MODELS.forEach(function (m) { const o = document.createElement('option'); o.value = m.id; o.textContent = m.name; ui.model.appendChild(o); });
      ui.model.value = selected;
      ui.model.addEventListener('change', function () { selectModel(this.value); });
    }
    if (ui.load) ui.load.addEventListener('click', function () { load().catch(function () {}); });
    try { checkSupport(); tell('Not loaded. Select a model and press “Load AI tutor”. First download can be large.', 'idle'); }
    catch (e) { tell(e.message, 'error'); }
    updateUI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI);
  else initUI();
})();
