/* dc-lite: runtime minimo per le pagine Sigma+ (holes, sc-for, sc-if, eventi).
   Il modello sta in <script type="text/x-template" id="dc-template">; il contenuto iniziale
   e' gia' pre-renderizzato in #dc-root. Nessun innerHTML su dati utente: solo nodi di testo e setAttribute. */
(function () {
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (o) { Object.assign(this.state, typeof o === 'function' ? o(this.state) : o); if (!window.__dcSilent) window.__dcRender(); };
  DCLogic.prototype.forceUpdate = function () { window.__dcRender(); };
  window.DCLogic = DCLogic;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g, WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function look(path, scope) {
    if (path === 'true') return true; if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  function txt(s, scope) { return s.replace(HOLE, function (_, p) { var v = look(p, scope); return v == null ? '' : String(v); }); }
  function build(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(txt(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    if (tag === 'sc-if') { if (look(WHOLE.exec(node.getAttribute('value'))[1], scope)) kids(node, scope, out); return; }
    if (tag === 'sc-for') {
      var list = look(WHOLE.exec(node.getAttribute('list'))[1], scope) || [], as = node.getAttribute('as') || 'item';
      list.forEach(function (it, i) { var s = Object.create(scope); s[as] = it; s.$index = i; kids(node, s, out); }); return;
    }
    var el = document.createElementNS(node.namespaceURI, node.localName);
    var deferred = [];
    Array.prototype.forEach.call(node.attributes, function (a) {
      var m = WHOLE.exec(a.value), name = a.name;
      if (name.indexOf('on') === 0 && m) {
        var fn = look(m[1], scope), ev = name.slice(2);
        if (typeof fn !== 'function') return;
        var t = (node.getAttribute('type') || '').toLowerCase(), isText = (tag === 'textarea') || (tag === 'input' && t !== 'checkbox' && t !== 'radio');
        if (ev === 'change' && isText) el.addEventListener('input', function (e) { window.__dcSilent = true; try { fn(e); } finally { window.__dcSilent = false; } });
        else el.addEventListener(ev, fn);
        return;
      }
      if (m && (name === 'value' || name === 'checked')) { deferred.push([name, look(m[1], scope)]); return; }
      el.setAttribute(name, m ? (look(m[1], scope) == null ? '' : String(look(m[1], scope))) : txt(a.value, scope));
    });
    kids(node.content || node, scope, el);
    deferred.forEach(function (d) { if (d[0] === 'checked') el.checked = !!d[1]; else el.value = d[1] == null ? '' : d[1]; });
    out.appendChild(el);
  }
  function kids(node, scope, out) { Array.prototype.forEach.call(node.childNodes, function (c) { build(c, scope, out); }); }
  document.addEventListener('DOMContentLoaded', function () {
    var src = document.getElementById('dc-template'), root = document.getElementById('dc-root'), tpl = src;
    if (!src.content) { tpl = document.createElement('template'); tpl.innerHTML = src.textContent; }
    var comp = new window.Component({});
    window.__dcRender = function () {
      var y = window.scrollY, frag = document.createDocumentFragment();
      kids(tpl.content, comp.renderVals(), frag);
      root.replaceChildren(frag); window.scrollTo(0, y);
    };
    window.__dcRender();
  });
})();
