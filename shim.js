/* Study Buddy standalone shim.
   Legacy compatibility adapter for the original server-backed edition.
   The current public static edition uses browser-ai.js and its local tutor adapter. */
(function () {
  if (window.claude) return; // running inside Claude: leave it alone

  function fail(code, extra) { var e = { code: code, message: code }; if (extra) for (var k in extra) e[k] = extra[k]; return e; }

  function toMessages(input) {
    if (typeof input === 'string') return { system: undefined, messages: [{ role: 'user', content: input }] };
    var arr = input.slice(), system;
    if (arr.length > 1 && arr[0].role === 'user') system = arr.shift().content; // first turn holds the rules
    return { system: system, messages: arr };
  }

  // Shrink photos so uploads stay small and always accepted
  function imageToPayload(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var max = 1568, s = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.85).split(',')[1] });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(fail('image_rejected')); };
      img.src = url;
    });
  }

  function buildBody(input, opts, stream) {
    var m = toMessages(input);
    var body = { messages: m.messages, system: m.system, tier: opts && opts.modelTier === 'complex' ? 'complex' : 'default', stream: stream };
    if (window.SBModelSelection && window.SBModelSelection.provider && window.SBModelSelection.model) { body.provider = window.SBModelSelection.provider; body.model = window.SBModelSelection.model; }
    if (opts && opts.mode === 'research') body.mode = 'research';
    if (opts && opts.verify === true) body.verify = true;
    var imgs = opts && opts.images ? [].concat(opts.images) : [];
    if (!imgs.length) return Promise.resolve(body);
    return Promise.all(imgs.slice(0, 1).map(function (f) { return imageToPayload(f.blob || f); })).then(function (list) { body.images = list; return body; });
  }

  function post(body, signal) {
    return fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: signal })
      .catch(function (e) { throw e && e.name === 'AbortError' ? fail('cancelled') : fail('network'); });
  }

  // Streaming text answer (Problem Solver, Tutor)
  function sample(input, opts) {
    opts = opts || {};
    return buildBody(input, opts, true).then(function (body) {
      return post(body, opts.signal).then(function (r) {
        if (!r.ok) return r.json().catch(function () { return {}; }).then(function (d) { throw fail(d.error || 'server_error'); });
        var reader = r.body.getReader(), dec = new TextDecoder(), buf = '', text = '', truncated = false;
        function pump() {
          return reader.read().then(function (x) {
            if (x.done) return { text: text, truncated: truncated, modelTierApplied: body.tier };
            buf += dec.decode(x.value, { stream: true });
            var i;
            while ((i = buf.indexOf('\n\n')) >= 0) {
              var line = buf.slice(0, i).split('\n').filter(function (l) { return l.indexOf('data:') === 0; })[0]; buf = buf.slice(i + 2);
              if (!line) continue;
              var ev; try { ev = JSON.parse(line.slice(5)); } catch (e) { continue; }
              if (ev.error) throw fail(ev.error, { text: text });
              if (ev.meta && opts.onMeta) opts.onMeta(ev.meta);
              if (ev.tool && opts.onTool) opts.onTool(ev.tool);
              if (ev.note && opts.onNote) opts.onNote(ev.note);
              if (ev.phase && opts.onPhase) opts.onPhase(ev.phase);
              if (ev.t) { text += ev.t; if (opts.onText) opts.onText({ text: text, delta: ev.t }); }
              if (ev.done) truncated = !!ev.truncated;
            }
            return pump();
          }, function (e) { throw e && e.name === 'AbortError' ? fail('cancelled', { text: text }) : fail('network', { text: text }); });
        }
        return pump();
      });
    });
  }

  sample.limits = function () {
    return Promise.resolve({ images: { maxCount: 1, maxInputBytes: 25 * 1024 * 1024, mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] } });
  };

  // ---- storage: the signed-in student's private notebook on the server ----
  function api(method, body) {
    return fetch('/api/notebook', { method: method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
      .catch(function () { throw fail('network'); })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw fail(d.error || 'server_error'); return d; }); });
  }
  var user = { id: function () { return Promise.resolve(window.__SB ? String(window.__SB.uid) : null); } };
  var dbApi = { doc: function (path) {
    var isNotebook = /\/notebook$/.test(path);
    return {
      get: function () {
        if (!isNotebook) return Promise.resolve({ exists: false });
        return api('GET').then(function (d) { return { exists: !!d.exists, data: function () { return d.data; } }; });
      },
      set: function (data) { return isNotebook ? api('PUT', data) : Promise.resolve(); }
    };
  } };

  window.claude = {
    standalone: true,
    usage: function () { return fetch('/api/usage', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); },
    use: function (name) { return Promise.resolve(name === 'sample' && location.protocol === 'file:' ? null : name === 'sample' ? sample : name === 'db' ? dbApi : name === 'user' ? user : null); }
  };
})();
