(function () {
  "use strict";

  var appEl = document.getElementById("app");
  var titleEl = document.getElementById("screenTitle");
  var backBtn = document.getElementById("backBtn");
  var homeBtn = document.getElementById("homeBtn");
  var themeBtn = document.getElementById("themeBtn");
  var langSelect = document.getElementById("langSelect");
  var offlineBadge = document.getElementById("offlineBadge");

  var DATA = [];
  var PRODUCTS = [];
  var stack = []; // [{name, params}]
  var authed = false;
  var booted = false;

  var FAMILY_ORDER_THROUGH = ["C-AJ", "C-BJ", "W-L", "W-J", "F-A", "F-B", "F-C", "F-E"];
  var FAMILY_ORDER_JOINT = ["HW-D", "FW-D", "FF-D", "WW-D", "BW-S"];
  var PENETRANT_ORDER = ["1", "2", "5", "3", "4", "7", "6", "8", "0"];

  // ---------- favorites (localStorage: small list of system codes) ----------
  var FAVORITES_KEY = "firestop-favorites";

  function getFavorites() {
    try {
      var raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function isFavorite(code) {
    return getFavorites().indexOf(code) !== -1;
  }

  function toggleFavorite(code) {
    var favs = getFavorites();
    var i = favs.indexOf(code);
    if (i === -1) favs.push(code);
    else favs.splice(i, 1);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); } catch (e) {}
    return i === -1;
  }

  function byCount(items, getKey) {
    var counts = {};
    items.forEach(function (it) {
      var k = getKey(it);
      if (k === null || k === undefined) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
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

  // ---------- theme & language ----------
  function applyTheme() {
    var theme = I18N.getTheme();
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.innerHTML = theme === "light" ? "&#9789;" : "&#9728;";
    themeBtn.setAttribute("aria-label", I18N.t("theme_toggle_aria"));
  }

  themeBtn.addEventListener("click", function () {
    var next = I18N.getTheme() === "light" ? "dark" : "light";
    I18N.setTheme(next);
    applyTheme();
  });

  function populateLangSelect() {
    langSelect.innerHTML = "";
    I18N.LANGS.forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = I18N.LANG_NAMES[code];
      langSelect.appendChild(opt);
    });
    langSelect.value = I18N.getLang();
  }

  langSelect.addEventListener("change", function () {
    I18N.setLang(langSelect.value);
    applyStaticLabels();
    render();
  });

  function applyStaticLabels() {
    document.documentElement.lang = I18N.getLang();
    backBtn.setAttribute("aria-label", I18N.t("nav_back"));
    homeBtn.setAttribute("aria-label", I18N.t("nav_home"));
    offlineBadge.textContent = I18N.t("offline_badge");
    themeBtn.setAttribute("aria-label", I18N.t("theme_toggle_aria"));
  }

  // ---------- navigation ----------
  function go(name, params) {
    if (!authed) return;
    stack.push({ name: name, params: params || {} });
    render();
  }

  function goHome() {
    if (!authed) return;
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
    html += '<img class="home-logo" src="icons/icon-512.png" alt="Firestop Finder" width="96" height="96">';
    html += '<p class="lead">' + escapeHtml(I18N.t("home_lead")) + "</p>";
    html += '<div class="option-grid">';
    var favCount = getFavorites().length;

    html += optionCard("favoritesHome", { label: I18N.t("home_favorites_label"), sub: I18N.t("home_favorites_sub"), count: favCount });
    html += optionCard("throughHome", { label: I18N.t("home_through_label"), sub: I18N.t("home_through_sub"), count: through.length });
    html += optionCard("jointHome", { label: I18N.t("home_joint_label"), sub: I18N.t("home_joint_sub"), count: joints.length });
    html += optionCard("materialHome", { label: I18N.t("home_material_label"), sub: I18N.t("home_material_sub"), count: PRODUCTS.length });
    html += optionCard("search", { label: I18N.t("home_search_label"), sub: I18N.t("home_search_sub") });
    html += optionCard("photosHome", { label: I18N.t("home_photos_label"), sub: I18N.t("home_photos_sub") });
    html += optionCard("plansHome", { label: I18N.t("home_plans_label"), sub: I18N.t("home_plans_sub") });
    if (window.TeamApp) html += optionCard("teamHome", { label: TeamApp.t("home_label"), sub: TeamApp.homeSub() });
    html += "</div>";
    html += '<p class="footer-note">' + escapeHtml(I18N.t("home_footer", { n: DATA.length })) + "</p>";
    appEl.innerHTML = html;

    bindOptionCard("favoritesHome", function () { go("favorites", {}); });
    bindOptionCard("throughHome", function () { go("family", { kind: "through_penetration" }); });
    bindOptionCard("jointHome", function () { go("family", { kind: "joint" }); });
    bindOptionCard("materialHome", function () { go("products", {}); });
    bindOptionCard("search", function () { go("search", {}); });
    bindOptionCard("photosHome", function () { go("photos", {}); });
    bindOptionCard("plansHome", function () { go("plans", {}); });
    bindOptionCard("teamHome", function () { go("teamHome", {}); });
  };

  screens.products = function () {
    titleEl.textContent = I18N.t("products_title");
    backBtn.hidden = false;

    var html = '<p class="lead">' + escapeHtml(I18N.t("products_lead")) + "</p>";
    html += '<input type="search" class="search-box" id="productSearch" placeholder="' + escapeHtml(I18N.t("products_placeholder")) + '">';
    html += '<div class="option-grid" id="productList"></div>';
    appEl.innerHTML = html;

    var listEl = document.getElementById("productList");
    var searchEl = document.getElementById("productSearch");

    function renderProducts(filterText) {
      var q = (filterText || "").trim().toUpperCase();
      var items = PRODUCTS.filter(function (p) {
        var label = I18N.tProduct(p.code).toUpperCase();
        return !q || p.code.indexOf(q) !== -1 || label.indexOf(q) !== -1;
      });
      if (!items.length) {
        listEl.innerHTML = '<div class="empty-state">' + escapeHtml(I18N.t("products_empty", { q: filterText })) + "</div>";
        return;
      }
      var html = "";
      items.forEach(function (p) {
        html += optionCard("prod_" + p.code.replace(/[^A-Z0-9]/gi, "_"), { label: p.code, sub: I18N.tProduct(p.code), count: p.count });
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
    titleEl.textContent = isThrough ? I18N.t("family_title_through") : I18N.t("family_title_joint");
    backBtn.hidden = false;

    var items = DATA.filter(function (s) { return s.family_kind === kind; });
    var counts = byCount(items, function (s) { return s.family_prefix; });
    var order = isThrough ? FAMILY_ORDER_THROUGH : FAMILY_ORDER_JOINT;
    var keys = order.filter(function (k) { return counts[k]; });

    var html = '<p class="lead">' + escapeHtml(isThrough ? I18N.t("family_lead_through") : I18N.t("family_lead_joint")) + "</p>";
    html += '<div class="option-grid">';
    keys.forEach(function (k) {
      html += optionCard("fam_" + k, { label: I18N.tFamily(k), sub: k, count: counts[k] });
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
    titleEl.textContent = I18N.t("penetrant_title");
    backBtn.hidden = false;

    var items = DATA.filter(function (s) { return s.family_prefix === params.familyPrefix; });
    var counts = byCount(items, function (s) { return s.penetrant_code; });
    var keys = PENETRANT_ORDER.filter(function (k) { return counts[k]; });

    var html = '<p class="lead">' + escapeHtml(I18N.t("penetrant_lead", { family: I18N.tFamily(params.familyPrefix) })) + "</p>";
    html += '<div class="option-grid">';
    keys.forEach(function (k) {
      html += optionCard("pen_" + k, { label: I18N.tPenetrant(k), count: counts[k] });
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
    titleEl.textContent = params.productCode ? params.productCode : I18N.t("results_title_default");
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
        html += '<p class="lead">' + escapeHtml(I18N.t("results_product_lead", { label: I18N.tProduct(params.productCode), n: items.length })) + "</p>";
      }
      html += '<div class="rating-row" id="ratingRow">';
      [0, 1, 2, 3, 4].forEach(function (hr) {
        var label = hr === 0 ? I18N.t("chip_any") : I18N.t("chip_min", { n: hr });
        html += '<button class="chip" data-hr="' + hr + '" aria-pressed="' + (state.minHr === hr) + '">' + escapeHtml(label) + "</button>";
      });
      html += "</div>";

      if (!filtered.length) {
        html += '<div class="empty-state">' + I18N.t("results_empty") + "</div>";
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
    titleEl.textContent = I18N.t("search_title");
    backBtn.hidden = false;

    var html = '<input type="search" class="search-box" id="searchInput" placeholder="' + escapeHtml(I18N.t("search_placeholder")) + '" autofocus>';
    html += '<div id="searchResults"></div>';
    appEl.innerHTML = html;

    var input = document.getElementById("searchInput");
    var resultsEl = document.getElementById("searchResults");

    function runSearch() {
      var q = input.value.trim().toUpperCase();
      if (q.length < 2) {
        resultsEl.innerHTML = '<div class="empty-state">' + escapeHtml(I18N.t("search_min_chars")) + "</div>";
        return;
      }
      var matches = DATA.filter(function (s) {
        return s.code.indexOf(q) !== -1 || (s.description || "").indexOf(q) !== -1 || (s.text || "").toUpperCase().indexOf(q) !== -1;
      }).slice(0, 60);

      if (!matches.length) {
        resultsEl.innerHTML = '<div class="empty-state">' + escapeHtml(I18N.t("search_empty", { q: input.value })) + "</div>";
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
    html += '<div class="detail-head">';
    html += '<h2 class="detail-code">' + sys.code + "</h2>";
    html += '<button class="star-btn" id="favBtn" aria-label="' + escapeHtml(I18N.t("favorite_add")) + '">' + (isFavorite(sys.code) ? "★" : "☆") + "</button>";
    html += "</div>";
    html += '<p class="detail-desc">' + escapeHtml(sys.description || "") + "</p>";

    html += '<div class="rating-card">';
    if (sys.raw_ratings && sys.raw_ratings.length) {
      sys.raw_ratings.forEach(function (pair) {
        html += '<div class="row"><span class="label">' + escapeHtml(pair[0]) + '</span><span class="value">' + escapeHtml(pair[1]) + "</span></div>";
      });
    } else {
      html += '<div class="row"><span class="label">Rating</span><span class="value">' + escapeHtml(I18N.t("detail_rating_none")) + "</span></div>";
    }
    html += "</div>";

    if (sys.products && sys.products.length) {
      html += '<div class="section-title">' + escapeHtml(I18N.t("detail_section_products")) + "</div>";
      html += '<div class="option-grid">';
      sys.products.forEach(function (code) {
        html += optionCard("goprod_" + code.replace(/[^A-Z0-9]/gi, "_"), { label: code, sub: I18N.tProduct(code) });
      });
      html += "</div>";
    }

    html += '<div class="section-title">' + escapeHtml(I18N.t("photos_section_title")) + "</div>";
    html += '<button class="btn-capture" id="capBtn">' + escapeHtml(I18N.t("photos_add_button")) + "</button>";
    if (window.TeamApp && TeamApp.hasObra()) {
      html += '<button class="btn-capture btn-secondary" id="teamCapBtn">' + escapeHtml(TeamApp.t("publish_for_system")) + "</button>";
    }
    html += '<div id="captureArea"></div>';
    html += '<div id="photoGrid"></div>';

    html += '<div class="section-title">' + escapeHtml(I18N.t("detail_section_text")) + "</div>";
    html += '<div class="detail-text">' + escapeHtml(sys.text || "") + "</div>";

    html += '<p class="page-note">' + escapeHtml(I18N.t("detail_page_note", { page: sys.pdf_page })) + "</p>";

    appEl.innerHTML = html;

    if (sys.products && sys.products.length) {
      sys.products.forEach(function (code) {
        bindOptionCard("goprod_" + code.replace(/[^A-Z0-9]/gi, "_"), function () {
          go("results", { productCode: code });
        });
      });
    }

    function reloadPhotos() {
      PhotoDB.listBySystem(sys.code).then(function (photos) {
        renderPhotoGrid("photoGrid", photos, { showCode: false, emptyText: I18N.t("photos_empty_system"), onChange: reloadPhotos });
      });
    }
    reloadPhotos();

    document.getElementById("capBtn").addEventListener("click", function () {
      startCapture("captureArea", sys.code, reloadPhotos);
    });
    var teamCapBtn = document.getElementById("teamCapBtn");
    if (teamCapBtn) {
      teamCapBtn.addEventListener("click", function () { TeamApp.capturePhoto("captureArea", sys.code); });
    }

    var favBtn = document.getElementById("favBtn");
    favBtn.addEventListener("click", function () {
      var nowFav = toggleFavorite(sys.code);
      favBtn.textContent = nowFav ? "★" : "☆";
      favBtn.setAttribute("aria-label", I18N.t(nowFav ? "favorite_remove" : "favorite_add"));
    });
  };

  screens.favorites = function () {
    titleEl.textContent = I18N.t("favorites_title");
    backBtn.hidden = false;

    var codes = getFavorites();
    var items = DATA.filter(function (s) { return codes.indexOf(s.code) !== -1; });

    if (!items.length) {
      appEl.innerHTML = '<div class="empty-state">' + escapeHtml(I18N.t("favorites_empty")) + "</div>";
      return;
    }

    var html = "";
    items
      .slice()
      .sort(function (a, b) { return a.code.localeCompare(b.code); })
      .forEach(function (s) { html += resultCard(s); });
    appEl.innerHTML = html;
    bindResultCards(items, function () { screens.favorites(); });
  };

  screens.photos = function () {
    titleEl.textContent = I18N.t("photos_gallery_title");
    backBtn.hidden = false;

    var html = '<button class="btn-capture" id="capBtn">' + escapeHtml(I18N.t("photos_add_button")) + "</button>";
    html += '<div id="captureArea"></div>';
    html += '<div class="date-filter-row">';
    html += '<input type="date" id="dateFilter" class="search-box" style="margin-bottom:0;">';
    html += '<button class="chip" id="clearDateBtn">' + escapeHtml(I18N.t("photos_clear_date")) + "</button>";
    html += "</div>";
    html += '<div id="photoGrid"></div>';
    appEl.innerHTML = html;

    var dateFilter = document.getElementById("dateFilter");
    var allPhotos = [];

    function applyFilter() {
      var val = dateFilter.value;
      var filtered = allPhotos;
      if (val) {
        var parts = val.split("-").map(Number);
        filtered = allPhotos.filter(function (p) {
          var d = new Date(p.createdAt);
          return d.getFullYear() === parts[0] && d.getMonth() + 1 === parts[1] && d.getDate() === parts[2];
        });
      }
      renderPhotoGrid("photoGrid", filtered, { showCode: true, emptyText: I18N.t("photos_gallery_empty"), onChange: reloadPhotos });
    }

    function reloadPhotos() {
      PhotoDB.listAll().then(function (photos) {
        allPhotos = photos;
        applyFilter();
      });
    }
    reloadPhotos();

    dateFilter.addEventListener("change", applyFilter);
    document.getElementById("clearDateBtn").addEventListener("click", function () {
      dateFilter.value = "";
      applyFilter();
    });

    document.getElementById("capBtn").addEventListener("click", function () {
      startCapture("captureArea", null, reloadPhotos);
    });
  };

  screens.plans = function () {
    titleEl.textContent = I18N.t("plans_title");
    backBtn.hidden = false;

    var html = '<input type="file" id="planFileInput" accept="application/pdf,image/*" hidden>';
    html += '<button class="btn-capture" id="uploadPlanBtn">' + escapeHtml(I18N.t("plans_add_button")) + "</button>";
    html += '<div id="plansList"></div>';
    appEl.innerHTML = html;

    function renderList(plans) {
      var listEl = document.getElementById("plansList");
      if (!plans.length) {
        listEl.innerHTML = '<div class="empty-state">' + escapeHtml(I18N.t("plans_empty")) + "</div>";
        return;
      }
      var listHtml = '<div class="option-grid">';
      plans.forEach(function (p) {
        var sub = new Date(p.createdAt).toLocaleDateString(I18N.getLang());
        if (p.reviewed) sub += " · " + I18N.t("plan_reviewed_badge");
        listHtml += optionCard("plan_" + p.id, { label: p.name, sub: sub });
      });
      listHtml += "</div>";
      listEl.innerHTML = listHtml;
      plans.forEach(function (p) {
        bindOptionCard("plan_" + p.id, function () { go("planView", { id: p.id }); });
      });
    }

    function reload() {
      PlansDB.listAll().then(renderList);
    }
    reload();

    document.getElementById("uploadPlanBtn").addEventListener("click", function () {
      document.getElementById("planFileInput").click();
    });
    document.getElementById("planFileInput").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      PlansDB.addPlan(file).then(reload);
    });
  };

  screens.planView = function (params) {
    backBtn.hidden = false;
    titleEl.textContent = I18N.t("plans_title");

    PlansDB.getPlan(params.id).then(function (plan) {
      if (!plan) {
        appEl.innerHTML = "";
        return;
      }
      titleEl.textContent = plan.name;
      var url = URL.createObjectURL(plan.blob);

      var html = "";
      if (plan.mimeType === "application/pdf") {
        html += '<iframe src="' + url + '" class="plan-frame" title="' + escapeHtml(plan.name) + '"></iframe>';
      } else if (plan.mimeType.indexOf("image/") === 0) {
        html += '<img src="' + url + '" class="plan-image" alt="' + escapeHtml(plan.name) + '">';
      } else {
        html += '<div class="empty-state">' + escapeHtml(I18N.t("plan_unsupported")) + "</div>";
      }

      html += '<button class="btn-capture" id="reviewedBtn">' + escapeHtml(plan.reviewed ? I18N.t("plan_unmark_reviewed") : I18N.t("plan_mark_reviewed")) + "</button>";
      html += '<textarea class="search-box" id="planNote" placeholder="' + escapeHtml(I18N.t("plan_note_placeholder")) + '" style="min-height:70px;">' + escapeHtml(plan.note || "") + "</textarea>";
      html += '<div class="note-actions"><button id="downloadPlanBtn">' + escapeHtml(I18N.t("plan_download")) + '</button><button id="deletePlanBtn" class="primary">' + escapeHtml(I18N.t("plan_delete")) + "</button></div>";
      appEl.innerHTML = html;

      document.getElementById("reviewedBtn").addEventListener("click", function () {
        var newVal = !plan.reviewed;
        PlansDB.updatePlan(plan.id, { reviewed: newVal }).then(function () {
          plan.reviewed = newVal;
          document.getElementById("reviewedBtn").textContent = newVal ? I18N.t("plan_unmark_reviewed") : I18N.t("plan_mark_reviewed");
        });
      });
      document.getElementById("planNote").addEventListener("change", function (e) {
        PlansDB.updatePlan(plan.id, { note: e.target.value });
      });
      document.getElementById("downloadPlanBtn").addEventListener("click", function () {
        var a = document.createElement("a");
        a.href = url;
        a.download = plan.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
      document.getElementById("deletePlanBtn").addEventListener("click", function () {
        if (!confirm(I18N.t("plan_delete_confirm"))) return;
        PlansDB.deletePlan(plan.id).then(goBack);
      });
    });
  };

  // ---------- render helpers ----------
  function optionCard(id, opts) {
    var html = '<button class="option-card" id="' + id + '">' + escapeHtml(opts.label);
    if (opts.sub) html += '<span class="sub">' + escapeHtml(opts.sub) + "</span>";
    if (opts.count !== undefined) html += '<span class="count">' + escapeHtml(I18N.t("count_systems", { n: opts.count })) + "</span>";
    html += "</button>";
    return html;
  }

  function bindOptionCard(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }

  function resultCard(s) {
    var html = '<div class="result-card" data-code="' + s.code + '">';
    html += '<button class="star-btn-sm" data-fav-code="' + s.code + '" aria-label="' + escapeHtml(I18N.t("favorite_add")) + '">' + (isFavorite(s.code) ? "★" : "☆") + "</button>";
    html += '<div class="result-code">' + s.code + "</div>";
    html += '<div class="result-desc">' + escapeHtml((s.description || "").slice(0, 90)) + "</div>";
    html += '<div class="rating-tags">';
    ["F", "FT", "T", "FH", "FTH", "ASSEMBLY", "L"].forEach(function (k) {
      if (s.ratings[k]) {
        var cls = k === "F" || k === "FH" ? "tag f" : k === "T" ? "tag t" : "tag";
        html += '<span class="' + cls + '">' + k + ": " + escapeHtml(s.ratings[k]) + "</span>";
      }
    });
    html += "</div></div>";
    return html;
  }

  function bindResultCards(items, onFavToggle) {
    appEl.querySelectorAll(".result-card").forEach(function (el) {
      el.addEventListener("click", function () {
        go("detail", { code: el.getAttribute("data-code") });
      });
    });
    appEl.querySelectorAll(".star-btn-sm").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var code = btn.getAttribute("data-fav-code");
        var nowFav = toggleFavorite(code);
        btn.textContent = nowFav ? "★" : "☆";
        btn.setAttribute("aria-label", I18N.t(nowFav ? "favorite_remove" : "favorite_add"));
        if (onFavToggle) onFavToggle();
      });
    });
  }

  // ---------- photos ----------
  function startCapture(containerId, systemCode, onSaved) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      document.body.removeChild(input);
      if (!file) return;
      renderCaptureForm(containerId, file, systemCode, onSaved);
    });
    input.click();
  }

  function renderCaptureForm(containerId, file, systemCode, onSaved) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var url = URL.createObjectURL(file);
    container.innerHTML =
      '<div class="note-box">' +
      '<img src="' + url + '">' +
      '<textarea id="noteInput" placeholder="' + escapeHtml(I18N.t("photos_note_placeholder")) + '"></textarea>' +
      '<div class="note-actions">' +
      '<button id="noteCancel">' + escapeHtml(I18N.t("photos_cancel")) + "</button>" +
      '<button id="noteSave" class="primary">' + escapeHtml(I18N.t("photos_save")) + "</button>" +
      "</div></div>";

    document.getElementById("noteCancel").addEventListener("click", function () {
      URL.revokeObjectURL(url);
      container.innerHTML = "";
    });
    document.getElementById("noteSave").addEventListener("click", function () {
      var note = document.getElementById("noteInput").value;
      PhotoDB.addPhoto(file, systemCode, note)
        .then(function () {
          URL.revokeObjectURL(url);
          container.innerHTML = "";
          if (onSaved) onSaved();
        })
        .catch(function () {
          alert(I18N.t("photos_capture_error"));
        });
    });
  }

  function photoTitle(photo) {
    if (photo.systemCode) return photo.systemCode;
    if (photo.note && photo.note.trim()) {
      var n = photo.note.trim();
      return n.length > 28 ? n.slice(0, 27) + "…" : n;
    }
    return I18N.t("photos_no_system");
  }

  function renderPhotoGrid(containerId, photos, opts) {
    var container = document.getElementById(containerId);
    if (!container) return;
    if (!photos.length) {
      container.innerHTML = '<div class="empty-state">' + escapeHtml(opts.emptyText) + "</div>";
      return;
    }
    var html = '<div class="photo-grid">';
    photos.forEach(function (p) {
      var url = URL.createObjectURL(p.blob);
      html += '<button class="photo-thumb" data-id="' + p.id + '"><img src="' + url + '">';
      if (opts.showCode) {
        html += '<span class="code-badge">' + escapeHtml(photoTitle(p)) + "</span>";
      }
      html += "</button>";
    });
    html += "</div>";
    container.innerHTML = html;
    container.querySelectorAll(".photo-thumb").forEach(function (btn) {
      var id = parseInt(btn.getAttribute("data-id"), 10);
      var photo = photos.find(function (p) { return p.id === id; });
      btn.addEventListener("click", function () { openLightbox(photo, opts.onChange); });
    });
  }

  function fileNameForPhoto(photo) {
    var code = photo.systemCode ? photo.systemCode.replace(/[^A-Z0-9]/gi, "_") : "firestop";
    return code + "-" + photo.id + ".jpg";
  }

  function sharePhoto(photo) {
    try {
      var file = new File([photo.blob], fileNameForPhoto(photo), { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: photo.systemCode || "Firestop Finder" }).catch(function () {});
        return;
      }
    } catch (e) {}
    downloadPhoto(photo);
  }

  function downloadPhoto(photo) {
    var url = URL.createObjectURL(photo.blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fileNameForPhoto(photo);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function openLightbox(photo, onChange) {
    var url = URL.createObjectURL(photo.blob);
    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    var dateStr = new Date(photo.createdAt).toLocaleString(I18N.getLang());
    var titleLabel = photoTitle(photo);
    var showNoteLine = photo.note && photo.note.trim() && titleLabel !== photo.note.trim();
    overlay.innerHTML =
      '<img src="' + url + '">' +
      '<div class="meta">' + escapeHtml(titleLabel) + " · " + escapeHtml(dateStr) + (showNoteLine ? "<br>" + escapeHtml(photo.note) : "") + "</div>" +
      '<div class="actions">' +
      '<button id="lbShare">' + escapeHtml(I18N.t("photos_share")) + "</button>" +
      '<button id="lbDownload">' + escapeHtml(I18N.t("photos_download")) + "</button>" +
      '<button id="lbDelete" class="danger">' + escapeHtml(I18N.t("photos_delete")) + "</button>" +
      '<button id="lbClose">&times;</button>' +
      "</div>";
    document.body.appendChild(overlay);

    function close() {
      URL.revokeObjectURL(url);
      if (overlay.parentNode) document.body.removeChild(overlay);
    }

    overlay.querySelector("#lbClose").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#lbShare").addEventListener("click", function () { sharePhoto(photo); });
    overlay.querySelector("#lbDownload").addEventListener("click", function () { downloadPhoto(photo); });
    overlay.querySelector("#lbDelete").addEventListener("click", function () {
      if (!confirm(I18N.t("photos_delete_confirm"))) return;
      PhotoDB.deletePhoto(photo.id).then(function () {
        close();
        if (onChange) onChange();
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

  // Let the team module (team-app.js) add its own screens.
  window.FirestopApp = {
    screens: screens,
    go: go,
    goBack: goBack,
    render: render,
    current: function () { return stack[stack.length - 1]; },
    appEl: appEl,
    titleEl: titleEl,
    backBtn: backBtn,
    escapeHtml: escapeHtml,
    optionCard: optionCard,
    bindOptionCard: bindOptionCard,
  };

  // ---------- mandatory login gate ----------
  // The whole app requires a signed-in account. Once signed in, the session
  // is cached by the Supabase client (localStorage), so this only needs
  // network the first time (or after signing out) — not on every open.
  var LOGIN_STR = {
    es: {
      login_lead: "Inicia sesión para usar Firestop Finder.",
      signup_lead: "Crea tu cuenta para usar Firestop Finder.",
      email: "Correo",
      password: "Contraseña (mínimo 8)",
      name: "Nombre",
      login: "Entrar",
      signup: "Crear cuenta",
      no_account: "¿No tienes cuenta? Crear una",
      have_account: "¿Ya tienes cuenta? Entrar",
      login_bad: "Correo o contraseña incorrectos.",
      login_unconfirmed: "Falta confirmar tu correo.",
      signup_exists: "Ese correo ya tiene cuenta. Entra con tu contraseña.",
      signup_weak: "La contraseña es muy corta.",
      signup_confirm: "Te enviamos un correo para confirmar. Después entra aquí.",
      rate_limited: "Demasiados intentos. Espera un momento.",
      offline_login: "Sin señal. Para entrar la primera vez necesitas internet.",
      error: "Algo falló: {m}",
    },
    en: {
      login_lead: "Sign in to use Firestop Finder.",
      signup_lead: "Create your account to use Firestop Finder.",
      email: "Email",
      password: "Password (min. 8)",
      name: "Name",
      login: "Sign in",
      signup: "Create account",
      no_account: "No account? Create one",
      have_account: "Have an account? Sign in",
      login_bad: "Wrong email or password.",
      login_unconfirmed: "Your email isn't confirmed yet.",
      signup_exists: "That email already has an account. Sign in.",
      signup_weak: "Password is too short.",
      signup_confirm: "We sent you a confirmation email. Then sign in here.",
      rate_limited: "Too many attempts. Wait a moment.",
      offline_login: "No signal. You need internet to sign in the first time.",
      error: "Something went wrong: {m}",
    },
  };

  function lt(k, p) {
    var l = I18N.getLang();
    var s = (LOGIN_STR[l] && LOGIN_STR[l][k]) !== undefined ? LOGIN_STR[l][k] : LOGIN_STR.en[k] !== undefined ? LOGIN_STR.en[k] : k;
    if (p) s = s.replace(/\{(\w+)\}/g, function (_, x) { return p[x] !== undefined ? p[x] : ""; });
    return s;
  }

  function lgErrMsg(err) {
    var k = Team.errorText(err);
    return LOGIN_STR.en[k] !== undefined ? lt(k) : lt("error", { m: k });
  }

  function proceedPastGate() {
    authed = true;
    homeBtn.hidden = false;
    goHome();
  }

  function showLoginGate(mode, msg, kind) {
    authed = false;
    stack = [];
    homeBtn.hidden = true;
    backBtn.hidden = true;
    titleEl.textContent = "Firestop Finder";
    var login = mode === "login";
    var html = '<p class="lead">' + escapeHtml(lt(login ? "login_lead" : "signup_lead")) + "</p>";
    if (msg) html += '<div class="team-msg ' + (kind || "err") + '">' + escapeHtml(msg) + "</div>";
    html += '<form id="lgForm">';
    if (!login) html += '<input class="search-box" id="lgName" placeholder="' + escapeHtml(lt("name")) + '" autocomplete="name">';
    html += '<input class="search-box" id="lgEmail" type="email" required placeholder="' + escapeHtml(lt("email")) + '" autocomplete="email">';
    html += '<input class="search-box" id="lgPass" type="password" required minlength="8" placeholder="' + escapeHtml(lt("password")) + '" autocomplete="' + (login ? "current-password" : "new-password") + '">';
    html += '<button class="btn-capture" id="lgSubmit" type="submit">' + escapeHtml(lt(login ? "login" : "signup")) + "</button></form>";
    html += '<button class="team-link" id="lgSwitch">' + escapeHtml(lt(login ? "no_account" : "have_account")) + "</button>";
    appEl.innerHTML = html;

    document.getElementById("lgSwitch").addEventListener("click", function () { showLoginGate(login ? "signup" : "login"); });
    document.getElementById("lgForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!navigator.onLine) return showLoginGate(mode, lt("offline_login"));
      var btn = document.getElementById("lgSubmit");
      btn.disabled = true;
      var email = document.getElementById("lgEmail").value;
      var pass = document.getElementById("lgPass").value;
      var p = login
        ? Team.signIn(email, pass)
        : Team.signUp(email, pass, (document.getElementById("lgName") || {}).value || "").then(function (r) {
            if (r.needsConfirm) throw { confirm: true };
            return r.session;
          });
      p.then(function () {
        proceedPastGate();
      }).catch(function (err) {
        if (err && err.confirm) return showLoginGate("login", lt("signup_confirm"), "ok");
        showLoginGate(mode, lgErrMsg(err));
      });
    });
  }

  function requireAuth() {
    Team.getSession().then(function (s) {
      if (s) proceedPastGate();
      else showLoginGate("login");
    });
  }

  // Signing out anywhere in the app (e.g. from the Obra/Team section) must
  // lock the whole app again, not just that section.
  Team.onAuth(function (s) {
    if (!booted) return;
    if (s && !authed) proceedPastGate();
    else if (!s && authed) showLoginGate("login");
  });

  // ---------- boot ----------
  applyTheme();
  populateLangSelect();
  applyStaticLabels();

  var splashEl = document.getElementById("splash");
  var splashMinTime = new Promise(function (resolve) { setTimeout(resolve, 1600); });

  function hideSplash() {
    if (!splashEl) return;
    splashEl.classList.add("hide");
    setTimeout(function () {
      if (splashEl.parentNode) splashEl.parentNode.removeChild(splashEl);
    }, 400);
  }

  Promise.all([
    fetch("data/systems.json").then(function (r) { return r.json(); }),
    fetch("data/products.json").then(function (r) { return r.json(); }),
    splashMinTime,
  ])
    .then(function (results) {
      DATA = results[0];
      PRODUCTS = results[1];
      hideSplash();
      booted = true;
      requireAuth();
    })
    .catch(function (err) {
      appEl.innerHTML = '<div class="empty-state">' + escapeHtml(err.message) + "</div>";
      hideSplash();
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
