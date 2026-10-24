// "Obra / Equipo" section of the phone app: shared plans and photos per job
// site, synced through Supabase, with an offline outbox for photos taken
// without signal. Plugs into app.js through window.FirestopApp.
var TeamApp = (function () {
  "use strict";

  var A = window.FirestopApp;
  var esc = A.escapeHtml;

  var STR = {
    es: {
      home_label: "Obra · Equipo",
      home_sub_out: "Comparte planos y fotos con tu equipo",
      home_sub_in: "{obra}",
      title: "Obra",
      login_lead: "Entra con tu cuenta del equipo para ver los planos de la obra y publicar tus fotos.",
      signup_lead: "Crea tu cuenta con el correo al que te invitaron.",
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
      offline: "Sin señal. Necesitas internet para esto.",
      offline_login: "Sin señal. Para entrar la primera vez necesitas internet.",
      error: "Algo falló: {m}",
      pick_obra: "Elige la obra",
      no_obras: "Todavía no estás en ninguna obra. Pide a tu supervisor que te invite con tu correo, o crea una.",
      new_obra: "+ Nueva obra",
      obra_name_prompt: "Nombre de la obra:",
      change_obra: "Cambiar obra",
      sign_out: "Cerrar sesión",
      website: "Abrir sitio web del equipo",
      take_photo: "Tomar y publicar foto",
      upload_plan: "Subir plano",
      planos: "Planos",
      fotos: "Fotos",
      no_planos: "No hay planos en esta obra todavía.",
      no_fotos: "No hay fotos en esta obra todavía.",
      offline_saved: "guardado sin señal",
      pending: "{n} por subir — se envían solas cuando vuelva la señal.",
      pending_now: "Subir ahora",
      loc: "Ubicación (ej: piso 3, eje C-4)",
      sys: "Sistema (ej: W-L-1054)",
      note: "Nota",
      plan_title: "Título del plano",
      cancel: "Cancelar",
      publish: "Publicar",
      publishing: "Publicando…",
      published: "Publicado. Tu equipo ya lo ve.",
      queued: "Guardado. Se publicará cuando haya señal.",
      delete: "Eliminar",
      delete_confirm: "¿Eliminar para todos?",
      download: "Descargar",
      share: "Compartir",
      by: "Por {who} · {when}",
      plan_unavailable: "Este plano no está guardado en el teléfono. Ábrelo una vez con señal.",
      cached_list: "Mostrando la última copia guardada (sin señal).",
      publish_for_system: "Publicar foto en la obra",
      signed_as: "Conectado como {who}",
    },
    en: {
      home_label: "Job site · Team",
      home_sub_out: "Share drawings and photos with your team",
      home_sub_in: "{obra}",
      title: "Job site",
      login_lead: "Sign in with your team account to see the job site drawings and post your photos.",
      signup_lead: "Create your account with the email you were invited with.",
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
      offline: "No signal. You need internet for this.",
      offline_login: "No signal. You need internet to sign in the first time.",
      error: "Something went wrong: {m}",
      pick_obra: "Choose the job site",
      no_obras: "You're not on any job site yet. Ask your supervisor to invite your email, or create one.",
      new_obra: "+ New job site",
      obra_name_prompt: "Job site name:",
      change_obra: "Change job site",
      sign_out: "Sign out",
      website: "Open the team website",
      take_photo: "Take & post a photo",
      upload_plan: "Upload drawing",
      planos: "Drawings",
      fotos: "Photos",
      no_planos: "No drawings on this job site yet.",
      no_fotos: "No photos on this job site yet.",
      offline_saved: "saved offline",
      pending: "{n} waiting to upload — they send automatically when you get signal.",
      pending_now: "Upload now",
      loc: "Location (e.g. floor 3, grid C-4)",
      sys: "System (e.g. W-L-1054)",
      note: "Note",
      plan_title: "Drawing title",
      cancel: "Cancel",
      publish: "Post",
      publishing: "Posting…",
      published: "Posted. Your team can see it.",
      queued: "Saved. It will post when you have signal.",
      delete: "Delete",
      delete_confirm: "Delete for everyone?",
      download: "Download",
      share: "Share",
      by: "By {who} · {when}",
      plan_unavailable: "This drawing isn't saved on the phone. Open it once with signal.",
      cached_list: "Showing the last saved copy (no signal).",
      publish_for_system: "Post photo to job site",
      signed_as: "Signed in as {who}",
    },
  };

  function t(k, p) {
    var l = I18N.getLang();
    var s = (STR[l] && STR[l][k]) !== undefined ? STR[l][k] : STR.en[k] !== undefined ? STR.en[k] : k;
    if (p) s = s.replace(/\{(\w+)\}/g, function (_, x) { return p[x] !== undefined ? p[x] : ""; });
    return s;
  }

  function errMsg(err) {
    var k = Team.errorText(err);
    return STR.en[k] !== undefined ? t(k) : t("error", { m: k });
  }

  var session = null;
  var obras = Team.cacheGet("obras") || [];
  var pubs = [];
  var urls = {};
  var tab = "plano";
  var unsub = null;
  var subscribedObra = null;
  var pendingCount = 0;

  function obraActual() {
    var id = Team.getObraId();
    return obras.find(function (o) { return o.id === id; }) || null;
  }

  function hasObra() { return !!(session && obraActual()); }

  function homeSub() {
    var o = obraActual();
    return session && o ? t("home_sub_in", { obra: o.nombre }) : t("home_sub_out");
  }

  function personName(p) {
    if (!p) return "—";
    return p.nombre || (p.email ? p.email.split("@")[0] : "—");
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString(I18N.getLang(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return iso;
    }
  }

  function onTeamScreen() {
    var c = A.current();
    return c && c.name === "teamHome";
  }

  function rerenderIfHere() { if (onTeamScreen()) A.render(); }

  // ---------- screen: team home (login → pick obra → obra) ----------
  A.screens.teamHome = function () {
    A.titleEl.textContent = t("title");
    A.backBtn.hidden = false;
    if (!session) return renderLogin("login");
    var o = obraActual();
    if (!o) return renderObraPicker();
    renderObra(o);
  };

  function renderLogin(mode, msg, kind) {
    var login = mode === "login";
    var html = '<p class="lead">' + esc(t(login ? "login_lead" : "signup_lead")) + "</p>";
    if (msg) html += '<div class="team-msg ' + (kind || "err") + '">' + esc(msg) + "</div>";
    html += '<form id="tmLogin">';
    if (!login) html += '<input class="search-box" id="tmName" placeholder="' + esc(t("name")) + '" autocomplete="name">';
    html += '<input class="search-box" id="tmEmail" type="email" required placeholder="' + esc(t("email")) + '" autocomplete="email">';
    html += '<input class="search-box" id="tmPass" type="password" required minlength="8" placeholder="' + esc(t("password")) + '" autocomplete="' + (login ? "current-password" : "new-password") + '">';
    html += '<button class="btn-capture" id="tmSubmit" type="submit">' + esc(t(login ? "login" : "signup")) + "</button></form>";
    html += '<button class="team-link" id="tmSwitch">' + esc(t(login ? "no_account" : "have_account")) + "</button>";
    A.appEl.innerHTML = html;

    document.getElementById("tmSwitch").addEventListener("click", function () { renderLogin(login ? "signup" : "login"); });
    document.getElementById("tmLogin").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!navigator.onLine) return renderLogin(mode, t("offline_login"));
      var btn = document.getElementById("tmSubmit");
      btn.disabled = true;
      var email = document.getElementById("tmEmail").value;
      var pass = document.getElementById("tmPass").value;
      var p = login
        ? Team.signIn(email, pass)
        : Team.signUp(email, pass, (document.getElementById("tmName") || {}).value || "").then(function (r) {
            if (r.needsConfirm) throw { confirm: true };
            return r.session;
          });
      p.then(function (s) {
        session = s;
        return refreshObras();
      })
        .then(function () { A.render(); })
        .catch(function (err) {
          if (err && err.confirm) return renderLogin("login", t("signup_confirm"), "ok");
          renderLogin(mode, errMsg(err));
        });
    });
  }

  function refreshObras() {
    return Team.listObras().then(function (list) {
      obras = list;
      var cur = Team.getObraId();
      if (cur && !list.some(function (o) { return o.id === cur; })) Team.setObraId(null);
      if (!Team.getObraId() && list.length === 1) Team.setObraId(list[0].id);
      return list;
    });
  }

  function renderObraPicker() {
    var html = "";
    if (!obras.length) html += '<div class="empty-state">' + esc(t("no_obras")) + "</div>";
    else html += '<p class="lead">' + esc(t("pick_obra")) + "</p>";
    html += '<div class="option-grid">';
    obras.forEach(function (o) { html += A.optionCard("obra_" + o.id, { label: o.nombre, sub: o.direccion || "" }); });
    html += "</div>";
    html += '<button class="btn-capture btn-secondary" id="tmNewObra">' + esc(t("new_obra")) + "</button>";
    html += footerHtml();
    A.appEl.innerHTML = html;
    obras.forEach(function (o) {
      A.bindOptionCard("obra_" + o.id, function () {
        Team.setObraId(o.id);
        pubs = [];
        A.render();
      });
    });
    document.getElementById("tmNewObra").addEventListener("click", function () {
      if (!navigator.onLine) return alert(t("offline"));
      var name = prompt(t("obra_name_prompt"));
      if (!name || !name.trim()) return;
      Team.crearObra(name.trim(), null)
        .then(function (o) {
          Team.setObraId(o.id);
          return refreshObras();
        })
        .then(function () { A.render(); })
        .catch(function (err) { alert(errMsg(err)); });
    });
    bindFooter();
    if (navigator.onLine) refreshObras().then(function (list) { if (onTeamScreen() && !obraActual()) renderObraPickerIfChanged(list); }, function () {});
  }

  var lastPickerKey = "";
  function renderObraPickerIfChanged(list) {
    var key = list.map(function (o) { return o.id; }).join();
    if (key === lastPickerKey) return;
    lastPickerKey = key;
    A.render();
  }

  function footerHtml() {
    var who = session && session.user ? session.user.email : "";
    return (
      '<div class="team-footer">' +
      '<a class="team-link" href="equipo/" target="_blank" rel="noopener">' + esc(t("website")) + " ↗</a>" +
      (obraActual() ? '<button class="team-link" id="tmChange">' + esc(t("change_obra")) + "</button>" : "") +
      '<button class="team-link" id="tmOut">' + esc(t("sign_out")) + "</button>" +
      '<div class="team-who">' + esc(t("signed_as", { who: who })) + "</div></div>"
    );
  }

  function bindFooter() {
    var ch = document.getElementById("tmChange");
    if (ch) ch.addEventListener("click", function () { Team.setObraId(null); A.render(); });
    document.getElementById("tmOut").addEventListener("click", function () {
      Team.signOut().then(function () {
        session = null;
        obras = [];
        pubs = [];
        A.render();
      });
    });
  }

  function renderObra(o) {
    A.titleEl.textContent = o.nombre;
    var html = '<div id="tmPending"></div>';
    html += '<div class="team-actions">';
    html += '<button class="btn-capture" id="tmPhoto">' + esc(t("take_photo")) + "</button>";
    html += '<button class="btn-capture btn-secondary" id="tmPlan">' + esc(t("upload_plan")) + "</button>";
    html += "</div>";
    html += '<div id="captureArea"></div>';
    html += '<div class="rating-row" id="tmTabs">';
    html += '<button class="chip" data-tab="plano" aria-pressed="' + (tab === "plano") + '">' + esc(t("planos")) + "</button>";
    html += '<button class="chip" data-tab="foto" aria-pressed="' + (tab === "foto") + '">' + esc(t("fotos")) + "</button>";
    html += "</div>";
    html += '<div id="tmList"></div>';
    html += footerHtml();
    A.appEl.innerHTML = html;

    document.getElementById("tmPhoto").addEventListener("click", function () { capturePhoto("captureArea", null); });
    document.getElementById("tmPlan").addEventListener("click", pickPlan);
    document.querySelectorAll("#tmTabs .chip").forEach(function (b) {
      b.addEventListener("click", function () {
        tab = b.getAttribute("data-tab");
        document.querySelectorAll("#tmTabs .chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        renderList();
      });
    });
    bindFooter();
    renderPending();

    // Show the cached copy immediately, then refresh from the server.
    var cached = Team.cacheGet("pubs-" + o.id);
    if (cached && !pubs.length) pubs = cached;
    renderList(!navigator.onLine && cached);
    loadPubs(o.id);
    subscribe(o.id);
  }

  function subscribe(obraId) {
    if (subscribedObra === obraId) return;
    if (unsub) unsub();
    subscribedObra = obraId;
    var t0;
    unsub = Team.suscribir(obraId, function () {
      clearTimeout(t0);
      t0 = setTimeout(function () { loadPubs(obraId); }, 400);
    });
  }

  function loadPubs(obraId) {
    if (!navigator.onLine) return Promise.resolve();
    return Team.listPublicaciones(obraId)
      .then(function (rows) {
        if (Team.getObraId() !== obraId) return;
        pubs = rows;
        var fotos = rows.filter(function (p) { return p.tipo === "foto" && !urls[p.archivo]; }).map(function (p) { return p.archivo; });
        return Team.signedUrls(fotos).then(function (m) {
          Object.keys(m).forEach(function (k) { urls[k] = m[k]; });
          if (onTeamScreen()) renderList();
          // Keep every drawing on the phone for use without signal.
          Team.cachePlanos(rows).then(function () { if (onTeamScreen() && tab === "plano") renderList(); });
        });
      })
      .catch(function () {});
  }

  function renderPending() {
    var el = document.getElementById("tmPending");
    if (!el) return;
    if (!pendingCount) { el.innerHTML = ""; return; }
    el.innerHTML =
      '<div class="team-pending"><span>' + esc(t("pending", { n: pendingCount })) + "</span>" +
      (navigator.onLine ? '<button class="chip" id="tmFlush">' + esc(t("pending_now")) + "</button>" : "") + "</div>";
    var b = document.getElementById("tmFlush");
    if (b) b.addEventListener("click", function () { Team.flushOutbox().then(function () { loadPubs(Team.getObraId()); }); });
  }

  function renderList(showingCached) {
    var el = document.getElementById("tmList");
    if (!el) return;
    var items = pubs.filter(function (p) { return p.tipo === tab; });
    var html = showingCached ? '<p class="page-note">' + esc(t("cached_list")) + "</p>" : "";
    if (!items.length) {
      el.innerHTML = html + '<div class="empty-state">' + esc(t(tab === "plano" ? "no_planos" : "no_fotos")) + "</div>";
      return;
    }
    if (tab === "plano") {
      html += '<div class="option-grid">';
      items.forEach(function (p) {
        html += '<button class="option-card" data-pub="' + p.id + '">' + esc(p.titulo || t("planos")) +
          '<span class="sub">' + esc(t("by", { who: personName(p.autor), when: fmtDate(p.creado) })) +
          (p.ubicacion ? " · " + esc(p.ubicacion) : "") + '<span class="tm-off" data-off="' + esc(p.archivo) + '"></span></span></button>';
      });
      html += "</div>";
      el.innerHTML = html;
      items.forEach(function (p) {
        Team.isCached(p.archivo).then(function (yes) {
          var s = el.querySelector('[data-off="' + cssEsc(p.archivo) + '"]');
          if (s && yes) s.textContent = " · ✓ " + t("offline_saved");
        });
      });
    } else {
      html += '<div class="photo-grid">';
      items.forEach(function (p) {
        html += '<button class="photo-thumb" data-pub="' + p.id + '"><img data-path="' + esc(p.archivo) + '" alt="">' +
          (p.sistema || p.ubicacion ? '<span class="code-badge">' + esc(p.sistema || p.ubicacion) + "</span>" : "") + "</button>";
      });
      html += "</div>";
      el.innerHTML = html;
      el.querySelectorAll("img[data-path]").forEach(function (img) {
        var path = img.getAttribute("data-path");
        if (urls[path] && navigator.onLine) img.src = urls[path];
        else Team.isCached(path).then(function (yes) {
          if (yes) Team.getFile(path).then(function (b) { img.src = URL.createObjectURL(b); });
        });
      });
    }
    el.querySelectorAll("[data-pub]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = pubs.find(function (x) { return x.id === b.getAttribute("data-pub"); });
        if (!p) return;
        if (p.tipo === "plano") A.go("teamPlan", { id: p.id });
        else openPhoto(p);
      });
    });
  }

  function cssEsc(s) { return window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/"/g, '\\"'); }

  function canDelete(p) {
    var o = obraActual();
    return session && (p.autor_id === session.user.id || (o && o.rol === "admin"));
  }

  // ---------- screen: plan viewer ----------
  A.screens.teamPlan = function (params) {
    A.backBtn.hidden = false;
    var p = pubs.find(function (x) { return x.id === params.id; });
    if (!p) { A.goBack(); return; }
    A.titleEl.textContent = p.titulo || t("planos");
    A.appEl.innerHTML = '<div class="empty-state">…</div>';
    Team.getFile(p.archivo)
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var html = "";
        if (p.mime === "application/pdf") html += '<iframe src="' + url + '" class="plan-frame" title="' + esc(p.titulo || "") + '"></iframe>';
        else html += '<img src="' + url + '" class="plan-image" alt="">';
        html += '<p class="page-note">' + esc(t("by", { who: personName(p.autor), when: fmtDate(p.creado) })) + "</p>";
        if (p.ubicacion) html += '<p class="page-note">' + esc(p.ubicacion) + "</p>";
        if (p.nota) html += '<div class="detail-text" style="font-family:inherit">' + esc(p.nota) + "</div>";
        html += '<div class="note-actions"><button id="tpShare">' + esc(t("share")) + "</button>" +
          (canDelete(p) ? '<button id="tpDel" class="primary">' + esc(t("delete")) + "</button>" : "") + "</div>";
        A.appEl.innerHTML = html;
        document.getElementById("tpShare").addEventListener("click", function () { shareBlob(blob, fileName(p)); });
        var del = document.getElementById("tpDel");
        if (del) del.addEventListener("click", function () {
          if (!confirm(t("delete_confirm"))) return;
          Team.borrarPublicacion(p).then(function () {
            pubs = pubs.filter(function (x) { return x.id !== p.id; });
            A.goBack();
          }, function (err) { alert(errMsg(err)); });
        });
      })
      .catch(function () {
        A.appEl.innerHTML = '<div class="empty-state">' + esc(t("plan_unavailable")) + "</div>";
      });
  };

  function fileName(p) {
    var ext = p.archivo.split(".").pop() || "bin";
    return String(p.titulo || p.sistema || p.tipo).replace(/[^\w\- ]+/g, "_") + "." + ext;
  }

  function shareBlob(blob, name) {
    try {
      var file = new File([blob], name, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: name }).catch(function () {});
        return;
      }
    } catch (e) {}
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ---------- photo lightbox ----------
  function openPhoto(p) {
    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    var meta = [p.sistema, p.ubicacion].filter(Boolean).join(" · ");
    overlay.innerHTML =
      '<img id="lbImg" alt="">' +
      '<div class="meta">' + (meta ? esc(meta) + "<br>" : "") + esc(t("by", { who: personName(p.autor), when: fmtDate(p.creado) })) +
      (p.nota ? "<br>" + esc(p.nota) : "") + "</div>" +
      '<div class="actions"><button id="lbShare">' + esc(t("share")) + "</button>" +
      (canDelete(p) ? '<button id="lbDelete" class="danger">' + esc(t("delete")) + "</button>" : "") +
      '<button id="lbClose">&times;</button></div>';
    document.body.appendChild(overlay);
    var blobP = Team.getFile(p.archivo, { cache: false });
    blobP.then(function (b) { overlay.querySelector("#lbImg").src = URL.createObjectURL(b); }, function () {
      if (urls[p.archivo]) overlay.querySelector("#lbImg").src = urls[p.archivo];
    });
    function close() { overlay.remove(); }
    overlay.querySelector("#lbClose").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#lbShare").addEventListener("click", function () {
      blobP.then(function (b) { shareBlob(b, fileName(p)); });
    });
    var del = overlay.querySelector("#lbDelete");
    if (del) del.addEventListener("click", function () {
      if (!confirm(t("delete_confirm"))) return;
      Team.borrarPublicacion(p).then(function () {
        close();
        pubs = pubs.filter(function (x) { return x.id !== p.id; });
        renderList();
      }, function (err) { alert(errMsg(err)); });
    });
  }

  // ---------- capture & publish ----------
  function capturePhoto(containerId, systemCode) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      input.remove();
      if (file) publishForm(containerId, file, "foto", systemCode);
    });
    input.click();
  }

  function pickPlan() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      input.remove();
      if (file) publishForm("captureArea", file, "plano", null);
    });
    input.click();
  }

  function publishForm(containerId, file, tipo, systemCode) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var isImg = (file.type || "").indexOf("image/") === 0;
    var url = isImg ? URL.createObjectURL(file) : null;
    var obra = obraActual();
    container.innerHTML =
      '<div class="note-box">' +
      (obra ? '<div class="team-obra-tag">' + esc(obra.nombre) + "</div>" : "") +
      (url ? '<img src="' + url + '">' : '<div class="page-note">' + esc(file.name) + "</div>") +
      (tipo === "plano" ? '<input class="search-box" id="pfTitle" placeholder="' + esc(t("plan_title")) + '" value="' + esc(file.name.replace(/\.[^.]+$/, "")) + '">' : "") +
      '<input class="search-box" id="pfLoc" placeholder="' + esc(t("loc")) + '">' +
      (tipo === "foto" ? '<input class="search-box" id="pfSys" placeholder="' + esc(t("sys")) + '" value="' + esc(systemCode || "") + '" autocapitalize="characters">' : "") +
      '<textarea id="pfNote" placeholder="' + esc(t("note")) + '"></textarea>' +
      '<div class="note-actions"><button id="pfCancel">' + esc(t("cancel")) + '</button><button id="pfOk" class="primary">' + esc(t("publish")) + "</button></div></div>";
    container.scrollIntoView({ behavior: "smooth", block: "start" });

    function done() {
      if (url) URL.revokeObjectURL(url);
      container.innerHTML = "";
    }
    document.getElementById("pfCancel").addEventListener("click", done);
    document.getElementById("pfOk").addEventListener("click", function () {
      if (!obra) return;
      var btn = document.getElementById("pfOk");
      btn.disabled = true;
      btn.textContent = t("publishing");
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var meta = {
        tipo: tipo,
        titulo: val("pfTitle"),
        ubicacion: val("pfLoc"),
        sistema: val("pfSys").toUpperCase(),
        nota: val("pfNote"),
      };
      Team.publicar(obra.id, file, meta)
        .then(function (r) {
          done();
          toast(r && r.queued ? t("queued") : t("published"));
          if (onTeamScreen()) {
            tab = tipo;
            loadPubs(obra.id).then(function () { if (onTeamScreen()) A.render(); });
          }
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = t("publish");
          alert(errMsg(err));
        });
    });
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("teamToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "teamToast";
      el.className = "offline-badge";
      el.style.bottom = "calc(120px + env(safe-area-inset-bottom))";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  // ---------- boot ----------
  Team.onOutboxChange(function (items) {
    pendingCount = items.length;
    renderPending();
  });
  Team.pendientes().then(function (items) { pendingCount = items.length; });

  Team.getSession().then(function (s) {
    session = s;
    if (!s) return;
    if (navigator.onLine) {
      Team.flushOutbox();
      refreshObras().then(function () {
        var c = A.current();
        if (c && (c.name === "home" || c.name === "teamHome")) A.render();
      }, function () {});
    }
  });
  Team.onAuth(function (s) { session = s; });
  window.addEventListener("online", function () { renderPending(); if (onTeamScreen()) loadPubs(Team.getObraId()); });
  window.addEventListener("offline", renderPending);

  return {
    t: t,
    homeSub: homeSub,
    hasObra: hasObra,
    capturePhoto: capturePhoto,
  };
})();
