/* Model catalog is server-validated. Changing picker never exposes API keys. */
(function () {
  'use strict';
  window.SBModelSelection = null; // null means auto free selection
  function init() {
    var select = document.getElementById('freeModelSelect');
    if (!select || location.protocol === 'file:' || window.__SB_BROWSER_AI) return;
    fetch('/api/models', { credentials: 'same-origin' }).then(function (res) { if (!res.ok) throw Error(); return res.json(); }).then(function (data) {
      var options = data.models || [];
      options.forEach(function (m) {
        var option = document.createElement('option');
        option.value = m.provider + '|' + m.id;
        option.textContent = m.label;
        select.appendChild(option);
      });
      var stored = ''; try { stored = localStorage.getItem('studybuddy.freeModel') || ''; } catch (e) {}
      if (stored && options.some(function (m) { return stored === m.provider + '|' + m.id; })) select.value = stored;
      select.onchange = function () {
        var parts = select.value.split('|');
        window.SBModelSelection = parts.length === 2 ? { provider: parts[0], model: parts[1] } : null;
        try { localStorage.setItem('studybuddy.freeModel', select.value); } catch (e) {}
      };
      select.onchange();
      if (!options.length) { select.options[0].textContent = 'No free models connected'; select.title = 'External AI requires operator approval and terms/privacy review first'; }
    }).catch(function () { select.options[0].textContent = 'Free model list unavailable'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
