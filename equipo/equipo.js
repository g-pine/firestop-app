(function () {
  "use strict";

  // ---------- i18n (es / en) ----------
  var S = {
    es: {
      brand_sub: "· Equipo",
      obras: "Obras",
      new_obra: "+ Nueva obra",
      login_title: "Entrar",
      login_lead: "Planos y fotos compartidos de tus obras.",
      signup_title: "Crear cuenta",
      signup_lead: "Usa el mismo correo al que te invitaron.",
      f_name: "Nombre",
      f_email: "Correo",
      f_password: "Contraseña (mínimo 8)",
      btn_login: "Entrar",
      btn_signup: "Crear cuenta",
      no_account: "¿No tienes cuenta?",
      have_account: "¿Ya tienes cuenta?",
      login_bad: "Correo o contraseña incorrectos.",
      login_unconfirmed: "Falta confirmar tu correo. Revisa tu bandeja de entrada.",
      signup_exists: "Ese correo ya tiene cuenta. Entra con tu contraseña.",
      signup_weak: "La contraseña es muy corta o débil.",
      signup_confirm: "Te enviamos un correo para confirmar la cuenta. Después vuelve y entra.",
      rate_limited: "Demasiados intentos. Espera un momento.",
      offline: "Sin conexión. Revisa tu internet.",
      sign_out: "Cerrar sesión",
      all: "Todo",
      planos: "Planos",
      fotos: "Fotos",
      upload: "Subir",
      members: "Equipo",
      search_ph: "Buscar por título, ubicación, sistema o nota…",
      all_people: "Todas las personas",
      no_obras_title: "Todavía no estás en ninguna obra",
      no_obras_body: "Crea una obra o pide a tu supervisor que te invite con tu correo.",
      empty_title: "Nada publicado aún",
      empty_body: "Sube un plano o una foto. Todos los de la obra lo verán en la app y aquí.",
      empty_filter: "Nada coincide con el filtro.",
      obra_name: "Nombre de la obra",
      obra_addr: "Dirección (opcional)",
      create: "Crear",
      cancel: "Cancelar",
      close: "Cerrar",
      save: "Guardar",
      type: "Tipo",
      t_plano: "Plano",
      t_foto: "Foto",
      drop: "<strong>Elige archivos</strong> o arrástralos aquí<br><small>PDF o imagen · hasta 50 MB</small>",
      f_title: "Título",
      f_title_ph: "Ej: Nivel 3 – Mecánico",
      f_loc: "Ubicación",
      f_loc_ph: "Ej: Piso 3, eje C-4, unidad 302",
      f_sys: "Sistema firestop",
      f_sys_ph: "Ej: W-L-1054",
      f_note: "Nota",
      publish: "Publicar",
      publishing: "Publicando {i} de {n}…",
      published: "Publicado",
      n_files: "{n} archivo(s) elegido(s)",
      pick_files: "Elige al menos un archivo.",
      download: "Descargar",
      delete: "Eliminar",
      delete_confirm: "¿Eliminar esta publicación para todos?",
      deleted: "Eliminado",
      by: "Por",
      date: "Fecha",
      loc: "Ubicación",
      sys: "Sistema",
      note: "Nota",
      members_title: "Equipo de la obra",
      invite: "Invitar",
      invite_ph: "correo@empresa.com",
      invite_help: "La persona entra (o crea su cuenta) con este correo y la obra le aparece sola.",
      invited: "Invitación guardada",
      pending: "Pendiente",
      admin: "Admin",
      member: "Miembro",
      make_admin: "Hacer admin",
      make_member: "Quitar admin",
      remove: "Quitar",
      remove_confirm: "¿Quitar a esta persona de la obra?",
      leave: "Salir de la obra",
      leave_confirm: "¿Salir de esta obra? Dejarás de ver sus planos y fotos.",
      you: "tú",
      error: "Algo falló: {m}",
      live: "En vivo",
      items: "{n} publicaciones",
      unnamed_plano: "Plano sin título",
      unnamed_foto: "Foto",
      rename: "Tu nombre",
      tareas: "Tareas",
      new_tarea: "+ Nueva tarea",
      t_titulo: "Título",
      t_titulo_ph: "Ej: Sellar piso 3, torre B",
      t_desc: "Descripción (opcional)",
      t_asignar: "Asignar a",
      unassigned: "Sin asignar",
      assigned_to: "Asignado a {who}",
      done: "Hecho",
      pending_task: "Pendiente",
      no_tareas: "No hay tareas todavía.",
      tarea_created: "Tarea creada",
      mark_done: "Marcar hecho",
      mark_pending: "Marcar pendiente",
    },
    en: {
      brand_sub: "· Team",
      obras: "Job sites",
      new_obra: "+ New job site",
      login_title: "Sign in",
      login_lead: "Shared drawings and photos for your job sites.",
      signup_title: "Create account",
      signup_lead: "Use the same email you were invited with.",
      f_name: "Name",
      f_email: "Email",
      f_password: "Password (min. 8)",
      btn_login: "Sign in",
      btn_signup: "Create account",
      no_account: "No account yet?",
      have_account: "Already have an account?",
      login_bad: "Wrong email or password.",
      login_unconfirmed: "Your email isn't confirmed yet. Check your inbox.",
      signup_exists: "That email already has an account. Sign in instead.",
      signup_weak: "Password is too short or weak.",
      signup_confirm: "We sent you an email to confirm your account. Then come back and sign in.",
      rate_limited: "Too many attempts. Wait a moment.",
      offline: "No connection. Check your internet.",
      sign_out: "Sign out",
      all: "All",
      planos: "Drawings",
      fotos: "Photos",
      upload: "Upload",
      members: "Team",
      search_ph: "Search title, location, system or note…",
      all_people: "Everyone",
      no_obras_title: "You're not on any job site yet",
      no_obras_body: "Create a job site, or ask your supervisor to invite your email.",
      empty_title: "Nothing posted yet",
      empty_body: "Upload a drawing or photo. Everyone on the job site sees it here and in the app.",
      empty_filter: "Nothing matches the filter.",
      obra_name: "Job site name",
      obra_addr: "Address (optional)",
      create: "Create",
      cancel: "Cancel",
      close: "Close",
      save: "Save",
      type: "Type",
      t_plano: "Drawing",
      t_foto: "Photo",
      drop: "<strong>Choose files</strong> or drop them here<br><small>PDF or image · up to 50 MB</small>",
      f_title: "Title",
      f_title_ph: "E.g. Level 3 – Mechanical",
      f_loc: "Location",
      f_loc_ph: "E.g. Floor 3, grid C-4, unit 302",
      f_sys: "Firestop system",
      f_sys_ph: "E.g. W-L-1054",
      f_note: "Note",
      publish: "Publish",
      publishing: "Publishing {i} of {n}…",
      published: "Published",
      n_files: "{n} file(s) selected",
      pick_files: "Choose at least one file.",
      download: "Download",
      delete: "Delete",
      delete_confirm: "Delete this post for everyone?",
      deleted: "Deleted",
      by: "By",
      date: "Date",
      loc: "Location",
      sys: "System",
      note: "Note",
      members_title: "Job site team",
      invite: "Invite",
      invite_ph: "name@company.com",
      invite_help: "They sign in (or create an account) with this email and the job site shows up automatically.",
      invited: "Invitation saved",
      pending: "Pending",
      admin: "Admin",
      member: "Member",
      make_admin: "Make admin",
      make_member: "Remove admin",
      remove: "Remove",
      remove_confirm: "Remove this person from the job site?",
      leave: "Leave job site",
      leave_confirm: "Leave this job site? You'll stop seeing its drawings and photos.",
      you: "you",
      error: "Something went wrong: {m}",
      live: "Live",
      items: "{n} posts",
      unnamed_plano: "Untitled drawing",
      unnamed_foto: "Photo",
      rename: "Your name",
      tareas: "Tasks",
      new_tarea: "+ New task",
      t_titulo: "Title",
      t_titulo_ph: "E.g. Seal floor 3, tower B",
      t_desc: "Description (optional)",
      t_asignar: "Assign to",
      unassigned: "Unassigned",
      assigned_to: "Assigned to {who}",
      done: "Done",
      pending_task: "Pending",
      no_tareas: "No tasks yet.",
      tarea_created: "Task created",
      mark_done: "Mark done",
      mark_pending: "Mark pending",
    },
  };

  var LANG_KEY = "firestop-lang";
  var THEME_KEY = "firestop-theme";

  function lang() {
    var l;
    try { l = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (l === "es" || l === "en") return l;
    if (l) return "en"; // fr/ru/uk users of the app get English here
    return (navigator.language || "es").slice(0, 2) === "es" ? "es" : "en";
  }

  function t(k, p) {
    var s = (S[lang()] || S.en)[k];
    if (s === undefined) s = S.en[k] !== undefined ? S.en[k] : k;
    if (p) s = s.replace(/\{(\w+)\}/g, function (_, x) { return p[x] !== undefined ? p[x] : ""; });
    return s;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function $(id) { return document.getElementById(id); }

  function theme() {
    var v;
    try { v = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (v === "light" || v === "dark") return v;
    return window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme());
    $("themeBtn").innerHTML = theme() === "light" ? "&#9789;" : "&#9728;";
  }

  function applyStatic() {
    document.documentElement.lang = lang();
    $("langSel").value = lang();
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = t(el.getAttribute("data-t")); });
  }

  var toastTimer;
  function toast(msg) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }

  function errMsg(err) {
    var k = Team.errorText(err);
    return S.en[k] !== undefined ? t(k) : t("error", { m: k });
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString(lang() === "es" ? "es-CL" : "en-CA", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function personName(p) {
    if (!p) return "—";
    return p.nombre || (p.email ? p.email.split("@")[0] : "—");
  }

  // ---------- state ----------
  var state = {
    me: null,
    obras: [],
    obraId: null,
    pubs: [],
    tareas: [],
    members: [],
    urls: {},
    tab: "all",
    q: "",
    autor: "",
    unsub: null,
  };

  function isAdmin() {
    var o = currentObra();
    return !!(o && o.rol === "admin");
  }

  // ---------- auth view ----------
  var authMode = "login";

  function showAuth() {
    $("appView").hidden = true;
    $("authView").hidden = false;
    $("userBtn").hidden = true;
    $("menuBtn").hidden = true;
    renderAuth();
  }

  function renderAuth(msg, kind) {
    var login = authMode === "login";
    $("authTitle").textContent = t(login ? "login_title" : "signup_title");
    $("authLead").textContent = t(login ? "login_lead" : "signup_lead");
    $("nameField").hidden = login;
    $("authSubmit").textContent = t(login ? "btn_login" : "btn_signup");
    $("authSwitchText").textContent = t(login ? "no_account" : "have_account");
    $("authSwitch").textContent = t(login ? "btn_signup" : "btn_login");
    $("authPass").setAttribute("autocomplete", login ? "current-password" : "new-password");
    $("authMsg").innerHTML = msg ? '<div class="msg ' + (kind || "err") + '">' + esc(msg) + "</div>" : "";
  }

  $("authSwitch").addEventListener("click", function () {
    authMode = authMode === "login" ? "signup" : "login";
    renderAuth();
  });

  $("authForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("authSubmit");
    btn.disabled = true;
    var email = $("authEmail").value;
    var pass = $("authPass").value;
    var p =
      authMode === "login"
        ? Team.signIn(email, pass).then(function () { return boot(); })
        : Team.signUp(email, pass, $("authName").value.trim()).then(function (r) {
            if (r.needsConfirm) {
              authMode = "login";
              renderAuth(t("signup_confirm"), "ok");
              return;
            }
            return boot();
          });
    p.catch(function (err) { renderAuth(errMsg(err)); }).then(function () { btn.disabled = false; });
  });

  // ---------- app view ----------
  function boot() {
    return Team.getSession().then(function (s) {
      if (!s) return showAuth();
      $("authView").hidden = true;
      $("appView").hidden = false;
      $("menuBtn").hidden = false;
      return Team.me().then(function (me) {
        state.me = me;
        $("userBtn").hidden = false;
        $("userBtn").textContent = personName(me);
        return loadObras();
      });
    });
  }

  function loadObras(selectId) {
    return Team.listObras()
      .then(function (obras) {
        state.obras = obras;
        var want = selectId || state.obraId || Team.getObraId();
        var found = obras.find(function (o) { return o.id === want; });
        selectObra(found ? found.id : obras[0] ? obras[0].id : null);
      })
      .catch(function (err) {
        $("main").innerHTML = '<div class="empty">' + esc(errMsg(err)) + "</div>";
      });
  }

  function renderSide() {
    var html = "";
    state.obras.forEach(function (o) {
      html +=
        '<button class="obra-item" data-id="' + o.id + '" aria-current="' + (o.id === state.obraId) + '">' +
        "<strong>" + esc(o.nombre) + "</strong>" +
        (o.direccion ? "<small>" + esc(o.direccion) + "</small>" : "") +
        "</button>";
    });
    $("obraList").innerHTML = html;
    $("obraList").querySelectorAll(".obra-item").forEach(function (b) {
      b.addEventListener("click", function () {
        selectObra(b.getAttribute("data-id"));
        $("side").classList.remove("open");
      });
    });
  }

  function currentObra() {
    return state.obras.find(function (o) { return o.id === state.obraId; }) || null;
  }

  function selectObra(id) {
    if (state.unsub) { state.unsub(); state.unsub = null; }
    state.obraId = id;
    state.pubs = [];
    state.tareas = [];
    state.members = [];
    state.urls = {};
    state.autor = "";
    Team.setObraId(id);
    renderSide();
    if (!id) return renderNoObras();
    renderMain(true);
    loadPubs();
    loadTareas();
    Team.todosLosUsuarios().then(function (rows) { state.members = rows; }, function () {});
    var reloadSoon = debounce(loadPubs, 400);
    state.unsub = Team.suscribir(id, reloadSoon);
  }

  function loadPubs() {
    var id = state.obraId;
    return Team.listPublicaciones(id)
      .then(function (pubs) {
        if (id !== state.obraId) return;
        state.pubs = pubs;
        var need = pubs
          .filter(function (p) { return !state.urls[p.archivo]; })
          .map(function (p) { return p.archivo; });
        return Team.signedUrls(need).then(function (map) {
          Object.keys(map).forEach(function (k) { state.urls[k] = map[k]; });
          if (id === state.obraId) renderMain();
        });
      })
      .catch(function (err) { toast(errMsg(err)); });
  }

  function loadTareas() {
    var id = state.obraId;
    return Team.listTareas(id)
      .then(function (rows) {
        if (id !== state.obraId) return;
        state.tareas = rows;
        if (state.tab === "tarea") renderGrid();
        else renderMain();
      })
      .catch(function (err) { toast(errMsg(err)); });
  }

  function renderNoObras() {
    $("main").innerHTML =
      '<div class="empty" style="margin-top:20px"><strong>' + esc(t("no_obras_title")) + "</strong>" + esc(t("no_obras_body")) +
      '<div style="margin-top:16px"><button class="btn primary" id="emptyNewObra">' + esc(t("new_obra")) + "</button></div></div>";
    $("emptyNewObra").addEventListener("click", openNewObra);
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return state.pubs.filter(function (p) {
      if (state.tab === "plano" && p.tipo !== "plano") return false;
      if (state.tab === "foto" && p.tipo !== "foto") return false;
      if (state.autor && p.autor_id !== state.autor) return false;
      if (q) {
        var hay = [p.titulo, p.ubicacion, p.sistema, p.nota, personName(p.autor)].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderMain(loading) {
    var o = currentObra();
    if (!o) return renderNoObras();
    var nPl = state.pubs.filter(function (p) { return p.tipo === "plano"; }).length;
    var nFo = state.pubs.length - nPl;

    var autores = {};
    state.pubs.forEach(function (p) { autores[p.autor_id] = personName(p.autor); });

    var html = "";
    html += '<div class="main-head"><div style="flex:1;min-width:200px">';
    html += "<h1>" + esc(o.nombre) + "</h1>";
    html += '<div class="sub">' + (o.direccion ? esc(o.direccion) + " · " : "") + esc(t("items", { n: state.pubs.length })) + "</div>";
    html += "</div>";
    html += '<button class="btn" id="membersBtn">' + esc(t("members")) + "</button>";
    if (isAdmin()) html += '<button class="btn" id="newTareaBtn">' + esc(t("new_tarea")) + "</button>";
    html += '<button class="btn primary" id="uploadBtn">' + esc(t("upload")) + "</button>";
    html += "</div>";

    html += '<div class="tabs">';
    [["all", t("all"), state.pubs.length], ["plano", t("planos"), nPl], ["foto", t("fotos"), nFo], ["tarea", t("tareas"), state.tareas.length]].forEach(function (x) {
      html += '<button class="tab" data-tab="' + x[0] + '" aria-pressed="' + (state.tab === x[0]) + '">' + esc(x[1]) + '<span class="n">' + x[2] + "</span></button>";
    });
    html += "</div>";

    if (state.tab !== "tarea") {
      html += '<div class="filters">';
      html += '<input class="input" id="qInput" type="search" placeholder="' + esc(t("search_ph")) + '" value="' + esc(state.q) + '">';
      html += '<select class="input" id="autorSel" style="flex:0 1 220px"><option value="">' + esc(t("all_people")) + "</option>";
      Object.keys(autores).forEach(function (id) {
        html += '<option value="' + id + '"' + (state.autor === id ? " selected" : "") + ">" + esc(autores[id]) + "</option>";
      });
      html += "</select></div>";
    }

    html += '<div id="gridWrap"></div>';
    $("main").innerHTML = html;

    $("membersBtn").addEventListener("click", openMembers);
    if (isAdmin()) $("newTareaBtn").addEventListener("click", openNewTarea);
    $("uploadBtn").addEventListener("click", function () { openUpload(); });
    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () {
        state.tab = b.getAttribute("data-tab");
        renderMain();
      });
    });
    var qInput = $("qInput");
    if (qInput) qInput.addEventListener("input", debounce(function () { state.q = $("qInput").value; renderGrid(); }, 150));
    var autorSel = $("autorSel");
    if (autorSel) autorSel.addEventListener("change", function () { state.autor = $("autorSel").value; renderGrid(); });

    if (!loading) renderGrid();
    setupDrop($("main"));
  }

  var DOC_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h5"/></svg>';

  function isImage(p) { return (p.mime || "").indexOf("image/") === 0 && !/heic|heif/i.test(p.mime || ""); }

  function renderGrid() {
    var wrap = $("gridWrap");
    if (!wrap) return;
    if (state.tab === "tarea") return renderTareas(wrap);
    var items = filtered();
    if (!state.pubs.length) {
      wrap.innerHTML = '<div class="empty"><strong>' + esc(t("empty_title")) + "</strong>" + esc(t("empty_body")) + "</div>";
      return;
    }
    if (!items.length) {
      wrap.innerHTML = '<div class="empty">' + esc(t("empty_filter")) + "</div>";
      return;
    }
    var html = '<div class="grid">';
    items.forEach(function (p) {
      var url = state.urls[p.archivo];
      var title = p.titulo || (p.tipo === "plano" ? t("unnamed_plano") : p.ubicacion || t("unnamed_foto"));
      html += '<button class="card" data-id="' + p.id + '"><div class="thumb">';
      if (isImage(p) && url) html += '<img loading="lazy" src="' + esc(url) + '" alt="">';
      else html += '<div class="doc">' + DOC_ICON + (p.mime === "application/pdf" ? "PDF" : "") + "</div>";
      html += '<span class="badge ' + p.tipo + '">' + esc(p.tipo === "plano" ? t("t_plano") : t("t_foto")) + "</span>";
      html += '</div><div class="body"><div class="title">' + esc(title) + "</div>";
      html += '<div class="meta">' + esc(personName(p.autor)) + " · " + esc(fmtDate(p.creado)) + "</div>";
      var chips = [];
      if (p.sistema) chips.push(p.sistema);
      if (p.ubicacion && p.titulo) chips.push(p.ubicacion);
      if (p.tipo === "plano" && p.asignado_a) chips.push(t("assigned_to", { who: personName(p.asignado) }));
      if (chips.length) {
        html += '<div class="chips">' + chips.map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join("") + "</div>";
      }
      html += "</div></button>";
    });
    html += "</div>";
    wrap.innerHTML = html;
    wrap.querySelectorAll(".card").forEach(function (c) {
      c.addEventListener("click", function () {
        var p = state.pubs.find(function (x) { return x.id === c.getAttribute("data-id"); });
        if (p) openViewer(p);
      });
    });
  }

  function canEditTarea(tarea) {
    return !!(state.me && (isAdmin() || tarea.asignado_a === state.me.id));
  }

  function renderTareas(wrap) {
    if (!state.tareas.length) {
      wrap.innerHTML = '<div class="empty"><strong>' + esc(t("no_tareas")) + "</strong></div>";
      return;
    }
    var html = '<div class="grid">';
    state.tareas.forEach(function (x) {
      var done = x.estado === "hecho";
      html += '<div class="card" data-id="' + x.id + '" style="cursor:default"><div class="body">';
      html += '<div class="title">' + esc(x.titulo) + '<span class="badge ' + (done ? "foto" : "plano") + '">' + esc(done ? t("done") : t("pending_task")) + "</span></div>";
      if (x.descripcion) html += '<div class="meta">' + esc(x.descripcion) + "</div>";
      html += '<div class="meta">' + esc(t("assigned_to", { who: x.asignado ? personName(x.asignado) : t("unassigned") })) + " · " + esc(fmtDate(x.creado)) + "</div>";
      html += '<div class="row" style="margin-top:8px">';
      if (canEditTarea(x)) {
        html += '<button type="button" class="btn sm" data-toggle="' + x.id + '">' + esc(done ? t("mark_pending") : t("mark_done")) + "</button>";
      }
      if (isAdmin()) html += '<button type="button" class="btn sm danger" data-del="' + x.id + '">' + esc(t("delete")) + "</button>";
      html += "</div></div></div>";
    });
    html += "</div>";
    wrap.innerHTML = html;
    wrap.querySelectorAll("[data-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var x = state.tareas.find(function (r) { return r.id === b.getAttribute("data-toggle"); });
        if (!x) return;
        Team.actualizarTarea(x.id, { estado: x.estado === "hecho" ? "pendiente" : "hecho" })
          .then(loadTareas)
          .catch(function (err) { toast(errMsg(err)); });
      });
    });
    wrap.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!confirm(t("delete_confirm"))) return;
        Team.borrarTarea(b.getAttribute("data-del"))
          .then(function () {
            toast(t("deleted"));
            return loadTareas();
          })
          .catch(function (err) { toast(errMsg(err)); });
      });
    });
  }

  function openNewTarea() {
    var members = state.members;
    var d = dialog(
      "<h2>" + esc(t("new_tarea").replace("+ ", "")) + "</h2>" +
      '<form id="ntForm"><label class="field"><span>' + esc(t("t_titulo")) + '</span><input class="input" id="ntTitulo" required maxlength="200" placeholder="' + esc(t("t_titulo_ph")) + '"></label>' +
      '<label class="field"><span>' + esc(t("t_desc")) + '</span><textarea class="input" id="ntDesc" maxlength="2000"></textarea></label>' +
      '<label class="field"><span>' + esc(t("t_asignar")) + '</span><select class="input" id="ntAsignado"><option value="">' + esc(t("unassigned")) + "</option>" +
      members.map(function (m) { return '<option value="' + m.id + '">' + esc(personName(m)) + "</option>"; }).join("") +
      "</select></label>" +
      '<div class="row"><button type="button" class="btn" id="ntCancel">' + esc(t("cancel")) + '</button><button class="btn primary" id="ntOk">' + esc(t("create")) + "</button></div></form>"
    );
    d.q("#ntTitulo").focus();
    d.q("#ntCancel").addEventListener("click", d.close);
    d.q("#ntForm").addEventListener("submit", function (e) {
      e.preventDefault();
      d.q("#ntOk").disabled = true;
      Team.crearTarea(state.obraId, d.q("#ntTitulo").value.trim(), d.q("#ntDesc").value.trim(), d.q("#ntAsignado").value || null)
        .then(function () {
          d.close();
          toast(t("tarea_created"));
          loadTareas();
        })
        .catch(function (err) {
          d.q("#ntOk").disabled = false;
          toast(errMsg(err));
        });
    });
  }

  // ---------- viewer ----------
  function openViewer(p) {
    var o = currentObra();
    var canDelete = state.me && (p.autor_id === state.me.id || (o && o.rol === "admin"));
    var v = document.createElement("div");
    v.className = "viewer";
    var title = p.titulo || (p.tipo === "plano" ? t("unnamed_plano") : t("unnamed_foto"));
    v.innerHTML =
      '<div class="viewer-head"><div class="t"><strong>' + esc(title) + "</strong><small>" + esc(personName(p.autor)) + " · " + esc(fmtDate(p.creado)) + "</small></div>" +
      '<button class="btn sm" id="vDl">' + esc(t("download")) + "</button>" +
      (canDelete ? '<button class="btn sm danger" id="vDel">' + esc(t("delete")) + "</button>" : "") +
      '<button class="btn iconbtn" id="vClose" aria-label="' + esc(t("close")) + '">&times;</button></div>' +
      '<div class="viewer-body"><div class="viewer-media" id="vMedia"><div style="color:#9aa6b2">…</div></div>' +
      '<dl class="viewer-info">' +
      "<dt>" + esc(t("type")) + "</dt><dd>" + esc(p.tipo === "plano" ? t("t_plano") : t("t_foto")) + "</dd>" +
      (p.ubicacion ? "<dt>" + esc(t("loc")) + "</dt><dd>" + esc(p.ubicacion) + "</dd>" : "") +
      (p.sistema ? "<dt>" + esc(t("sys")) + "</dt><dd>" + esc(p.sistema) + "</dd>" : "") +
      (p.nota ? "<dt>" + esc(t("note")) + "</dt><dd>" + esc(p.nota) + "</dd>" : "") +
      "<dt>" + esc(t("by")) + "</dt><dd>" + esc(personName(p.autor)) + (p.autor && p.autor.email ? "<br><small>" + esc(p.autor.email) + "</small>" : "") + "</dd>" +
      "<dt>" + esc(t("date")) + "</dt><dd>" + esc(fmtDate(p.creado)) + "</dd>" +
      (p.tipo === "plano"
        ? isAdmin()
          ? '<dt>' + esc(t("t_asignar")) + '</dt><dd><select class="input" id="vAsignado" style="max-width:220px"><option value="">' + esc(t("unassigned")) + "</option>" +
            state.members.map(function (m) { return '<option value="' + m.id + '"' + (p.asignado_a === m.id ? " selected" : "") + ">" + esc(personName(m)) + "</option>"; }).join("") +
            "</select></dd>"
          : p.asignado_a ? "<dt>" + esc(t("t_asignar")) + "</dt><dd>" + esc(personName(p.asignado)) + "</dd>" : ""
        : "") +
      "</dl></div>";
    document.body.appendChild(v);
    document.body.style.overflow = "hidden";

    var objUrl = null;
    function close() {
      if (objUrl) URL.revokeObjectURL(objUrl);
      v.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    v.querySelector("#vClose").addEventListener("click", close);

    // Load as blob so PDFs render inline instead of forcing a download.
    Team.getFile(p.archivo, { cache: false })
      .then(function (blob) {
        objUrl = URL.createObjectURL(blob);
        var media = v.querySelector("#vMedia");
        if (p.mime === "application/pdf") media.innerHTML = '<iframe src="' + objUrl + '" title="' + esc(title) + '"></iframe>';
        else if (isImage(p)) media.innerHTML = '<img src="' + objUrl + '" alt="' + esc(title) + '">';
        else media.innerHTML = '<div style="color:#9aa6b2;text-align:center">' + DOC_ICON + "</div>";
      })
      .catch(function (err) {
        v.querySelector("#vMedia").innerHTML = '<div style="color:#ff9c94">' + esc(errMsg(err)) + "</div>";
      });

    v.querySelector("#vDl").addEventListener("click", function () {
      Team.getFile(p.archivo, { cache: false }).then(function (blob) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        var ext = (p.archivo.split(".").pop() || "bin");
        a.download = (p.titulo || p.sistema || p.tipo).replace(/[^\w\- ]+/g, "_") + "." + ext;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      });
    });

    if (canDelete) {
      v.querySelector("#vDel").addEventListener("click", function () {
        if (!confirm(t("delete_confirm"))) return;
        Team.borrarPublicacion(p)
          .then(function () {
            close();
            toast(t("deleted"));
            loadPubs();
          })
          .catch(function (err) { toast(errMsg(err)); });
      });
    }

    var vAsignado = v.querySelector("#vAsignado");
    if (vAsignado) {
      vAsignado.addEventListener("change", function () {
        var val = vAsignado.value || null;
        vAsignado.disabled = true;
        Team.asignarPublicacion(p.id, p.obra_id, val)
          .then(function () {
            p.asignado_a = val;
            loadPubs();
          })
          .catch(function (err) {
            toast(errMsg(err));
            vAsignado.disabled = false;
          });
      });
    }
  }

  // ---------- dialogs ----------
  function dialog(html) {
    var ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = '<div class="dialog" role="dialog">' + html + "</div>";
    document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(); });
    return { el: ov, close: close, q: function (s) { return ov.querySelector(s); } };
  }

  function openNewObra() {
    var d = dialog(
      "<h2>" + esc(t("new_obra").replace("+ ", "")) + "</h2>" +
      '<form id="noForm"><label class="field"><span>' + esc(t("obra_name")) + '</span><input class="input" id="noName" required maxlength="120"></label>' +
      '<label class="field"><span>' + esc(t("obra_addr")) + '</span><input class="input" id="noAddr" maxlength="200"></label>' +
      '<div class="row"><button type="button" class="btn" id="noCancel">' + esc(t("cancel")) + '</button><button class="btn primary" id="noOk">' + esc(t("create")) + "</button></div></form>"
    );
    d.q("#noName").focus();
    d.q("#noCancel").addEventListener("click", d.close);
    d.q("#noForm").addEventListener("submit", function (e) {
      e.preventDefault();
      d.q("#noOk").disabled = true;
      Team.crearObra(d.q("#noName").value.trim(), d.q("#noAddr").value.trim())
        .then(function (o) {
          d.close();
          return loadObras(o.id);
        })
        .catch(function (err) {
          d.q("#noOk").disabled = false;
          toast(errMsg(err));
        });
    });
  }

  function openUpload(initialFiles) {
    var tipo = "plano";
    var files = [];
    var d = dialog(
      "<h2>" + esc(t("upload")) + "</h2>" +
      '<div class="seg"><button type="button" class="btn" data-tipo="plano">' + esc(t("t_plano")) + '</button><button type="button" class="btn" data-tipo="foto">' + esc(t("t_foto")) + "</button></div>" +
      '<div class="drop" id="upDrop">' + t("drop") + '</div><input type="file" id="upFile" multiple accept="application/pdf,image/*" hidden>' +
      '<div id="upCount" class="meta" style="margin:-4px 0 12px;color:var(--text-dim)"></div>' +
      '<form id="upForm"><label class="field"><span>' + esc(t("f_title")) + '</span><input class="input" id="upTitle" maxlength="200" placeholder="' + esc(t("f_title_ph")) + '"></label>' +
      '<label class="field"><span>' + esc(t("f_loc")) + '</span><input class="input" id="upLoc" maxlength="200" placeholder="' + esc(t("f_loc_ph")) + '"></label>' +
      '<label class="field" id="upSysField"><span>' + esc(t("f_sys")) + '</span><input class="input" id="upSys" maxlength="100" placeholder="' + esc(t("f_sys_ph")) + '"></label>' +
      '<label class="field"><span>' + esc(t("f_note")) + '</span><textarea class="input" id="upNote" maxlength="2000"></textarea></label>' +
      '<div id="upStatus"></div>' +
      '<div class="row"><button type="button" class="btn" id="upCancel">' + esc(t("cancel")) + '</button><button class="btn primary" id="upOk">' + esc(t("publish")) + "</button></div></form>"
    );

    function setTipo(x) {
      tipo = x;
      d.el.querySelectorAll(".seg button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tipo") === x); });
    }
    function setFiles(list) {
      files = Array.prototype.slice.call(list || []);
      d.q("#upCount").textContent = files.length ? t("n_files", { n: files.length }) + " — " + files.map(function (f) { return f.name; }).join(", ") : "";
      // Guess the type: all images → photo, any PDF → drawing.
      if (files.length) {
        var allImg = files.every(function (f) { return (f.type || "").indexOf("image/") === 0; });
        setTipo(allImg && tipo !== "plano" ? "foto" : files.some(function (f) { return f.type === "application/pdf"; }) ? "plano" : tipo);
        if (!d.q("#upTitle").value && files.length === 1) d.q("#upTitle").value = files[0].name.replace(/\.[^.]+$/, "");
      }
    }
    setTipo(tipo);
    d.el.querySelectorAll(".seg button").forEach(function (b) {
      b.addEventListener("click", function () { setTipo(b.getAttribute("data-tipo")); });
    });
    var drop = d.q("#upDrop");
    drop.addEventListener("click", function () { d.q("#upFile").click(); });
    d.q("#upFile").addEventListener("change", function (e) { setFiles(e.target.files); });
    ["dragenter", "dragover"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); });
    });
    drop.addEventListener("drop", function (e) { setFiles(e.dataTransfer.files); });
    if (initialFiles) setFiles(initialFiles);

    d.q("#upCancel").addEventListener("click", d.close);
    d.q("#upForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!files.length) return toast(t("pick_files"));
      var ok = d.q("#upOk");
      ok.disabled = true;
      var meta = {
        tipo: tipo,
        titulo: d.q("#upTitle").value.trim(),
        ubicacion: d.q("#upLoc").value.trim(),
        sistema: d.q("#upSys").value.trim().toUpperCase(),
        nota: d.q("#upNote").value.trim(),
      };
      var obraId = state.obraId;
      var status = d.q("#upStatus");
      var i = 0;
      files
        .reduce(function (p, f) {
          return p.then(function () {
            i++;
            status.innerHTML = '<div class="meta">' + esc(t("publishing", { i: i, n: files.length })) + '</div><div class="progress"><i style="width:' + Math.round(((i - 1) / files.length) * 100) + '%"></i></div>';
            var m = Object.assign({}, meta);
            if (files.length > 1 && !m.titulo) m.titulo = f.name.replace(/\.[^.]+$/, "");
            else if (files.length > 1) m.titulo = meta.titulo + " — " + f.name.replace(/\.[^.]+$/, "");
            return Team.publicar(obraId, f, m);
          });
        }, Promise.resolve())
        .then(function () {
          d.close();
          toast(t("published"));
          loadPubs();
        })
        .catch(function (err) {
          ok.disabled = false;
          status.innerHTML = '<div class="msg err">' + esc(errMsg(err)) + "</div>";
          loadPubs();
        });
    });
  }

  // Drag files anywhere onto the main area to upload.
  function setupDrop(el) {
    if (el._dropReady) return;
    el._dropReady = true;
    el.addEventListener("dragover", function (e) {
      if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") !== -1) e.preventDefault();
    });
    el.addEventListener("drop", function (e) {
      if (!state.obraId || !e.dataTransfer || !e.dataTransfer.files.length) return;
      if (document.querySelector(".overlay")) return;
      e.preventDefault();
      openUpload(e.dataTransfer.files);
    });
  }

  function openMembers() {
    var o = currentObra();
    var isAdmin = o && o.rol === "admin";
    var d = dialog(
      "<h2>" + esc(t("members_title")) + "</h2>" +
      (isAdmin
        ? '<form id="invForm" style="display:flex;gap:8px;margin-bottom:6px"><input class="input" id="invEmail" type="email" required placeholder="' + esc(t("invite_ph")) + '">' +
          '<button class="btn primary" id="invOk">' + esc(t("invite")) + "</button></form>" +
          '<p style="color:var(--text-dim);font-size:12.5px;margin:0 0 10px">' + esc(t("invite_help")) + "</p>"
        : "") +
      '<div id="memList">…</div>' +
      '<div class="row"><button type="button" class="btn danger" id="leaveBtn">' + esc(t("leave")) + '</button><button type="button" class="btn" id="memClose">' + esc(t("close")) + "</button></div>"
    );
    d.q("#memClose").addEventListener("click", d.close);
    d.q("#leaveBtn").addEventListener("click", function () {
      if (!confirm(t("leave_confirm"))) return;
      Team.quitarMiembro(o.id, state.me.id)
        .then(function () {
          d.close();
          state.obraId = null;
          return loadObras();
        })
        .catch(function (err) { toast(errMsg(err)); });
    });

    function load() {
      Promise.all([Team.miembros(o.id), isAdmin ? Team.invitaciones(o.id) : Promise.resolve([])])
        .then(function (r) {
          var mem = r[0];
          var inv = r[1];
          var html = "";
          mem.forEach(function (m) {
            var p = m.perfil || {};
            var nm = personName(p);
            var isMe = state.me && m.user_id === state.me.id;
            html += '<div class="member"><div class="avatar">' + esc(nm.slice(0, 1).toUpperCase()) + "</div>";
            html += '<div class="who"><strong>' + esc(nm) + (isMe ? " (" + esc(t("you")) + ")" : "") + "</strong><small>" + esc(p.email || "") + "</small></div>";
            html += '<span class="pill ' + (m.rol === "admin" ? "admin" : "") + '">' + esc(m.rol === "admin" ? t("admin") : t("member")) + "</span>";
            if (isAdmin && !isMe) {
              html += '<button class="btn sm" data-rol="' + m.user_id + '" data-to="' + (m.rol === "admin" ? "miembro" : "admin") + '">' + esc(m.rol === "admin" ? t("make_member") : t("make_admin")) + "</button>";
              html += '<button class="btn sm danger" data-rm="' + m.user_id + '">' + esc(t("remove")) + "</button>";
            }
            html += "</div>";
          });
          inv.forEach(function (i) {
            html += '<div class="member"><div class="avatar">✉</div><div class="who"><strong>' + esc(i.email) + "</strong><small>" + esc(t("pending")) + "</small></div>";
            html += '<button class="btn sm danger" data-rminv="' + esc(i.email) + '">' + esc(t("remove")) + "</button></div>";
          });
          d.q("#memList").innerHTML = html;
          d.el.querySelectorAll("[data-rol]").forEach(function (b) {
            b.addEventListener("click", function () {
              Team.cambiarRol(o.id, b.getAttribute("data-rol"), b.getAttribute("data-to")).then(load, function (err) { toast(errMsg(err)); });
            });
          });
          d.el.querySelectorAll("[data-rm]").forEach(function (b) {
            b.addEventListener("click", function () {
              if (!confirm(t("remove_confirm"))) return;
              Team.quitarMiembro(o.id, b.getAttribute("data-rm")).then(load, function (err) { toast(errMsg(err)); });
            });
          });
          d.el.querySelectorAll("[data-rminv]").forEach(function (b) {
            b.addEventListener("click", function () {
              Team.quitarInvitacion(o.id, b.getAttribute("data-rminv")).then(load, function (err) { toast(errMsg(err)); });
            });
          });
        })
        .catch(function (err) { d.q("#memList").innerHTML = '<div class="msg err">' + esc(errMsg(err)) + "</div>"; });
    }
    load();

    if (isAdmin) {
      d.q("#invForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var em = d.q("#invEmail").value.trim().toLowerCase();
        // Already a member? Nothing to do.
        Team.invitar(o.id, em, "miembro")
          .then(function () {
            d.q("#invEmail").value = "";
            toast(t("invited"));
            load();
          })
          .catch(function (err) { toast(errMsg(err)); });
      });
    }
  }

  function openUserMenu() {
    var me = state.me || {};
    var d = dialog(
      "<h2>" + esc(personName(me)) + "</h2>" +
      '<p style="color:var(--text-dim);margin:-8px 0 14px">' + esc(me.email || "") + "</p>" +
      '<form id="nmForm"><label class="field"><span>' + esc(t("rename")) + '</span><input class="input" id="nmName" maxlength="80" value="' + esc(me.nombre || "") + '"></label>' +
      '<div class="row"><button type="button" class="btn danger" id="soBtn">' + esc(t("sign_out")) + '</button><button class="btn primary">' + esc(t("save")) + "</button></div></form>"
    );
    d.q("#soBtn").addEventListener("click", function () {
      if (state.unsub) state.unsub();
      Team.signOut().then(function () {
        d.close();
        state = { me: null, obras: [], obraId: null, pubs: [], urls: {}, tab: "all", q: "", autor: "", unsub: null };
        showAuth();
      });
    });
    d.q("#nmForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var n = d.q("#nmName").value.trim();
      Team.updateName(n)
        .then(function () {
          state.me.nombre = n;
          $("userBtn").textContent = personName(state.me);
          d.close();
          loadPubs();
        })
        .catch(function (err) { toast(errMsg(err)); });
    });
  }

  function debounce(fn, ms) {
    var tm;
    return function () {
      var a = arguments;
      clearTimeout(tm);
      tm = setTimeout(function () { fn.apply(null, a); }, ms);
    };
  }

  // ---------- wire up ----------
  $("themeBtn").addEventListener("click", function () {
    try { localStorage.setItem(THEME_KEY, theme() === "light" ? "dark" : "light"); } catch (e) {}
    applyTheme();
  });
  $("langSel").addEventListener("change", function () {
    try { localStorage.setItem(LANG_KEY, $("langSel").value); } catch (e) {}
    applyStatic();
    if (!$("authView").hidden) renderAuth();
    else if (state.obraId) renderMain();
    else if (state.me) renderNoObras();
  });
  $("newObraBtn").addEventListener("click", openNewObra);
  $("userBtn").addEventListener("click", openUserMenu);
  $("menuBtn").addEventListener("click", function () { $("side").classList.toggle("open"); });

  applyTheme();
  applyStatic();
  boot();
})();
