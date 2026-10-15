(function () {
  "use strict";

  var appEl = document.getElementById("app");
  var titleEl = document.getElementById("screenTitle");
  var backBtn = document.getElementById("backBtn");
  var homeBtn = document.getElementById("homeBtn");
  var offlineBadge = document.getElementById("offlineBadge");

  var DATA = [];
  var PRODUCTS = [];
  var stack = []; // [{name, params}]

  var FAMILY_ORDER_THROUGH = ["C-AJ", "C-BJ", "W-L", "W-J", "F-A", "F-B", "F-C", "F-E"];
  var FAMILY_ORDER_JOINT = ["HW-D", "FW-D", "FF-D", "WW-D", "BW-S"];
  var PENETRANT_ORDER = ["1", "2", "5", "3", "4", "7", "6", "8", "0"];

  function byCount(items, getKey, getLabel) {
    var counts = {};
    var labels = {};
    items.forEach(function (it) {
      var k = getKey(it);
      if (k === null || k === undefined) return;
      counts[k] = (counts[k] || 0) + 1;
      labels[k] = getLabel(it);
    });
    return { counts: counts, labels: labels };
  }

  function parseHours(value) {
    if (!value) return [];
    var out = [];
    var re = /(\d+(?:\.\d+)?)\s*-?\s*HR/gi;
    var m;
    while ((m = re.exec(value))) out.push(parseFloat(m[1]));
    return out;
  }

  function bestRatingValue(sys, codes) {
    for (var i = 0; i < codes.length; i++) {
      if (sys.ratings[codes[i]]) return sys.ratings[codes[i]];
    }
    return null;
  }

  function meetsMinRating(sys, minHr) {
    if (!minHr) return true;
    var val = bestRatingValue(sys, ["F", "FT", "FH", "FTH", "ASSEMBLY"]);
    var hours = parseHours(val);
    if (!hours.length) return false;
    return hours.some(function (h) { return h >= minHr; });
  }

  // ---------- navigation ----------
  function go(name, params) {
    stack.push({ name: name, params: params || {} });
    render();
  }

  function goHome() {
    stack = [{ name: "home", params: {} }];
    render();
  }

  function goBack() {
    if (stack.length > 1) {
      stack.pop();
      render();
    }
  }

  backBtn.addEventListener("click", goBack);
  homeBtn.addEventListener("click", goHome);

  // ---------- screens ----------
  var screens = {};

  screens.home = function () {
    titleEl.textContent = "Firestop Finder";
    backBtn.hidden = true;

    var through = DATA.filter(function (s) { return s.family_kind === "through_penetration"; });
    var joints = DATA.filter(function (s) { return s.family_kind === "joint"; });

    var html = "";
    html += '<p class="lead">Encuentra el sistema Hilti aprobado para tu ensamblaje. Elige qué estás firestopeando.</p>';
    html += '<div class="option-grid">';
    html += optionCard("throughHome", { label: "Penetrante a través de muro o losa", sub: "Tubo, cable, ducto, bandeja, múltiple...", count: through.length });
    html += optionCard("jointHome", { label: "Junta perimetral", sub: "Cabeza de muro, piso-muro, piso-piso...", count: joints.length });
    html += optionCard("materialHome", { label: "¿Para qué sirve este material?", sub: "Confirma en qué sistemas se usa un sellador/producto Hilti", count: PRODUCTS.length });
    html += optionCard("search", { label: "Buscar por código de sistema", sub: "Ej: C-AJ-1575, W-L-1290" });
    html += "</div>";
    html += '<p class="footer-note">Catálogo: Hilti CDN FS Library (May 2019) · ' + DATA.length + " sistemas indexados.</p>";
    appEl.innerHTML = html;

    bindOptionCard("throughHome", function () { go("family", { kind: "through_penetration" }); });
    bindOptionCard("jointHome", function () { go("family", { kind: "joint" }); });
    bindOptionCard("materialHome", function () { go("products", {}); });
    bindOptionCard("search", function () { go("search", {}); });
  };

  screens.products = function () {
    titleEl.textContent = "Confirmar un material";
    backBtn.hidden = false;

    var html = '<p class="lead">Elige el producto que tienes a mano. Te muestro en qué sistemas está aprobado para usarse.</p>';
    html += '<input type="search" class="search-box" id="productSearch" placeholder="Ej: FS-ONE, CP 606, putty...">';
    html += '<div class="option-grid" id="productList"></div>';
    appEl.innerHTML = html;

    var listEl = document.getElementById("productList");
    var searchEl = document.getElementById("productSearch");

    function renderProducts(filterText) {
      var q = (filterText || "").trim().toUpperCase();
      var items = PRODUCTS.filter(function (p) {
        return !q || p.code.indexOf(q) !== -1 || p.label.toUpperCase().indexOf(q) !== -1;
      });
      if (!items.length) {
        listEl.innerHTML = '<div class="empty-state">Sin productos que coincidan con "' + escapeHtml(filterText) + '".</div>';
        return;
      }
      var html = "";
      items.forEach(function (p) {
        html += optionCard("prod_" + p.code.replace(/[^A-Z0-9]/gi, "_"), { label: p.code, sub: p.label, count: p.count });
      });
      listEl.innerHTML = html;
      items.forEach(function (p) {
        var id = "prod_" + p.code.replace(/[^A-Z0-9]/gi, "_");
        bindOptionCard(id, function () { go("results", { productCode: p.code }); });
      });
    }

    renderProducts("");
    searchEl.addEventListener("input", debounce(function () { renderProducts(searchEl.value); }, 120));
  };

  screens.family = function (params) {
    var kind = params.kind;
    var isThrough = kind === "through_penetration";
    titleEl.textContent = isThrough ? "Tipo de muro / losa" : "Tipo de junta";
    backBtn.hidden = false;

    var items = DATA.filter(function (s) { return s.family_kind === kind; });
    var agg = byCount(items, function (s) { return s.family_prefix; }, function (s) { return s.family_label; });
    var order = isThrough ? FAMILY_ORDER_THROUGH : FAMILY_ORDER_JOINT;
    var keys = order.filter(function (k) { return agg.counts[k]; });

    var html = '<p class="lead">' + (isThrough ? "¿Qué ensamblaje estás atravesando?" : "¿Qué tipo de junta estás sellando?") + "</p>";
    html += '<div class="option-grid">';
    keys.forEach(function (k) {
      html += optionCard("fam_" + k, { label: agg.labels[k], sub: k, count: agg.counts[k] });
    });
    html += "</div>";
    appEl.innerHTML = html;

    keys.forEach(function (k) {
      bindOptionCard("fam_" + k, function () {
        if (isThrough) {
          go("penetrant", { familyPrefix: k });
        } else {
          go("results", { familyPrefix: k, kind: "joint" });
        }
      });
    });
  };

  screens.penetrant = function (params) {
    titleEl.textContent = "Tipo de penetrante";
    backBtn.hidden = false;

    var items = DATA.filter(function (s) { return s.family_prefix === params.familyPrefix; });
    var agg = byCount(items, function (s) { return s.penetrant_code; }, function (s) { return s.penetrant_label; });
    var keys = PENETRANT_ORDER.filter(function (k) { return agg.counts[k]; });

    var html = '<p class="lead">Ensamblaje: <strong>' + items[0].family_label + "</strong></p>";
    html += '<div class="option-grid">';
    keys.forEach(function (k) {
      html += optionCard("pen_" + k, { label: agg.labels[k], count: agg.counts[k] });
    });
    html += "</div>";
    appEl.innerHTML = html;

    keys.forEach(function (k) {
      bindOptionCard("pen_" + k, function () {
        go("results", { familyPrefix: params.familyPrefix, penetrantCode: k });
      });
    });
  };

  screens.results = function (params) {
    titleEl.textContent = params.productCode ? params.productCode : "Sistemas que calzan";
    backBtn.hidden = false;

    var items = DATA.filter(function (s) {
      if (params.familyPrefix && s.family_prefix !== params.familyPrefix) return false;
      if (params.penetrantCode && s.penetrant_code !== params.penetrantCode) return false;
      if (params.productCode && s.products.indexOf(params.productCode) === -1) return false;
      return true;
    });

    var state = { minHr: params._minHr || 0 };

    function renderList() {
      var filtered = items.filter(function (s) { return meetsMinRating(s, state.minHr); });
      var html = "";
      if (params.productCode) {
        var prod = PRODUCTS.find(function (p) { return p.code === params.productCode; });
        html += '<p class="lead">' + escapeHtml(prod ? prod.label : "") + " — sistemas donde aparece este producto (" + items.length + ").</p>";
      }
      html += '<div class="rating-row" id="ratingRow">';
      [0, 1, 2, 3, 4].forEach(function (hr) {
        var label = hr === 0 ? "Cualquier rating" : hr + "-HR mínimo";
        html += '<button class="chip" data-hr="' + hr + '" aria-pressed="' + (state.minHr === hr) + '">' + label + "</button>";
      });
      html += "</div>";

      if (!filtered.length) {
        html += '<div class="empty-state">No hay sistemas que cumplan ese rating mínimo en esta combinación.<br>Prueba bajando el rating requerido.</div>';
      } else {
        filtered
          .slice()
          .sort(function (a, b) { return a.code.localeCompare(b.code); })
          .forEach(function (s) {
            html += resultCard(s);
          });
      }
      appEl.innerHTML = html;

      appEl.querySelectorAll(".chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.minHr = parseInt(btn.getAttribute("data-hr"), 10);
          renderList();
        });
      });
      bindResultCards(filtered);
    }

    renderList();
  };

  screens.search = function () {
    titleEl.textContent = "Buscar sistema";
    backBtn.hidden = false;

    var html = '<input type="search" class="search-box" id="searchInput" placeholder="Código o palabra clave (ej. cobre, PVC, C-AJ-1575)" autofocus>';
    html += '<div id="searchResults"></div>';
    appEl.innerHTML = html;

    var input = document.getElementById("searchInput");
    var resultsEl = document.getElementById("searchResults");

    function runSearch() {
      var q = input.value.trim().toUpperCase();
      if (q.length < 2) {
        resultsEl.innerHTML = '<div class="empty-state">Escribe al menos 2 caracteres.</div>';
        return;
      }
      var matches = DATA.filter(function (s) {
        return s.code.indexOf(q) !== -1 || (s.description || "").indexOf(q) !== -1 || (s.text || "").toUpperCase().indexOf(q) !== -1;
      }).slice(0, 60);

      if (!matches.length) {
        resultsEl.innerHTML = '<div class="empty-state">Sin resultados para "' + escapeHtml(input.value) + '".</div>';
        return;
      }
      var html = "";
      matches.forEach(function (s) { html += resultCard(s); });
      resultsEl.innerHTML = html;
      bindResultCards(matches);
    }

    input.addEventListener("input", debounce(runSearch, 150));
  };

  screens.detail = function (params) {
    var sys = DATA.find(function (s) { return s.code === params.code; });
    titleEl.textContent = sys.code;
    backBtn.hidden = false;

    var html = "";
    html += '<h2 class="detail-code">' + sys.code + "</h2>";
    html += '<p class="detail-desc">' + escapeHtml(sys.description || "") + "</p>";

    html += '<div class="rating-card">';
    if (sys.raw_ratings && sys.raw_ratings.length) {
      sys.raw_ratings.forEach(function (pair) {
        html += '<div class="row"><span class="label">' + escapeHtml(pair[0]) + '</span><span class="value">' + escapeHtml(pair[1]) + "</span></div>";
      });
    } else {
      html += '<div class="row"><span class="label">Rating</span><span class="value">No especificado</span></div>';
    }
    html += "</div>";

    if (sys.products && sys.products.length) {
      html += '<div class="section-title">Productos Hilti usados en este sistema</div>';
      html += '<div class="option-grid">';
      sys.products.forEach(function (code) {
        var prod = PRODUCTS.find(function (p) { return p.code === code; });
        html += optionCard("goprod_" + code.replace(/[^A-Z0-9]/gi, "_"), { label: code, sub: prod ? prod.label : "" });
      });
      html += "</div>";
    }

    html += '<div class="section-title">Texto completo de la ficha (OCR del catálogo)</div>';
    html += '<div class="detail-text">' + escapeHtml(sys.text || "") + "</div>";

    html += '<p class="page-note">Página aprox. ' + sys.pdf_page + ' del PDF "Hilti CDN FS Library (May 2019)". El diagrama no está incluido en esta versión de la app — revisa el PDF original en Dropbox para ver el dibujo técnico.</p>';

    appEl.innerHTML = html;

    if (sys.products && sys.products.length) {
      sys.products.forEach(function (code) {
        bindOptionCard("goprod_" + code.replace(/[^A-Z0-9]/gi, "_"), function () {
          go("results", { productCode: code });
        });
      });
    }
  };

  // ---------- render helpers ----------
  function optionCard(id, opts) {
    var html = '<button class="option-card" id="' + id + '">' + escapeHtml(opts.label);
    if (opts.sub) html += '<span class="sub">' + escapeHtml(opts.sub) + "</span>";
    if (opts.count !== undefined) html += '<span class="count">' + opts.count + " sistema" + (opts.count === 1 ? "" : "s") + "</span>";
    html += "</button>";
    return html;
  }

  function bindOptionCard(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }

  function resultCard(s) {
    var html = '<button class="result-card" data-code="' + s.code + '">';
    html += '<div class="result-code">' + s.code + "</div>";
    html += '<div class="result-desc">' + escapeHtml((s.description || "").slice(0, 90)) + "</div>";
    html += '<div class="rating-tags">';
    ["F", "FT", "T", "FH", "FTH", "ASSEMBLY", "L"].forEach(function (k) {
      if (s.ratings[k]) {
        var cls = k === "F" || k === "FH" ? "tag f" : k === "T" ? "tag t" : "tag";
        html += '<span class="' + cls + '">' + k + ": " + escapeHtml(s.ratings[k]) + "</span>";
      }
    });
    html += "</div></button>";
    return html;
  }

  function bindResultCards(items) {
    appEl.querySelectorAll(".result-card").forEach(function (el) {
      el.addEventListener("click", function () {
        go("detail", { code: el.getAttribute("data-code") });
      });
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function render() {
    var top = stack[stack.length - 1];
    screens[top.name](top.params);
    window.scrollTo(0, 0);
  }

  // ---------- boot ----------
  Promise.all([
    fetch("data/systems.json").then(function (r) { return r.json(); }),
    fetch("data/products.json").then(function (r) { return r.json(); }),
  ])
    .then(function (results) {
      DATA = results[0];
      PRODUCTS = results[1];
      goHome();
    })
    .catch(function (err) {
      appEl.innerHTML = '<div class="empty-state">No se pudo cargar el catálogo (' + escapeHtml(err.message) + ").</div>";
    });

  window.addEventListener("online", function () { offlineBadge.hidden = true; });
  window.addEventListener("offline", function () { offlineBadge.hidden = false; });
  if (!navigator.onLine) offlineBadge.hidden = false;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
