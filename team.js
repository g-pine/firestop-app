// Shared team layer: Supabase auth, obras (job sites), shared plans/photos.
// Used by both the phone app (index.html) and the team website (equipo/).
// Requires vendor/supabase.js loaded first (global `supabase`).
var Team = (function () {
  "use strict";

  var SUPABASE_URL = "https://ghqzdtjkbjfasjgcuhql.supabase.co";
  // Publishable key: safe to ship in the browser. Access is enforced by
  // row-level security on every table and on the storage bucket.
  var SUPABASE_KEY = "sb_publishable_Biwsbbsds9w7x6GYtMK8nA_rVIDlLnA";
  var BUCKET = "obras";
  var OBRA_KEY = "firestop-team-obra";
  var CACHE_PREFIX = "firestop-team-cache-";

  var client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  // ---------- small IndexedDB: offline outbox + cached files ----------
  var DB_NAME = "firestop-team";
  var DB_VERSION = 1;

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox", { keyPath: "id", autoIncrement: true });
        if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "path" });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idb(storeName, mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, mode);
        var out = fn(tx.objectStore(storeName));
        tx.oncomplete = function () { db.close(); resolve(out && "result" in out ? out.result : out); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      });
    });
  }

  function idbAll(storeName) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readonly");
        var req = tx.objectStore(storeName).getAll();
        tx.oncomplete = function () { db.close(); resolve(req.result || []); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      });
    });
  }

  // ---------- auth ----------
  function getSession() {
    return client.auth.getSession().then(function (r) { return r.data.session; });
  }

  function onAuth(cb) {
    client.auth.onAuthStateChange(function (_event, session) { cb(session); });
  }

  function afterLogin() {
    // Turn any pending email invitations into memberships.
    return client.rpc("aceptar_invitaciones").then(function () {}, function () {});
  }

  function signIn(email, password) {
    return client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: password }).then(function (r) {
      if (r.error) throw r.error;
      return afterLogin().then(function () { return r.data.session; });
    });
  }

  function signUp(email, password, nombre) {
    return client.auth
      .signUp({ email: email.trim().toLowerCase(), password: password, options: { data: { nombre: nombre || "" } } })
      .then(function (r) {
        if (r.error) throw r.error;
        if (!r.data.session) return { needsConfirm: true };
        return afterLogin().then(function () { return { session: r.data.session }; });
      });
  }

  function signOut() {
    try { localStorage.removeItem(OBRA_KEY); } catch (e) {}
    return client.auth.signOut();
  }

  function me() {
    return getSession().then(function (s) {
      if (!s) return null;
      return client.from("perfiles").select("id,email,nombre").eq("id", s.user.id).maybeSingle().then(function (r) {
        return r.data || { id: s.user.id, email: s.user.email, nombre: "" };
      });
    });
  }

  function updateName(nombre) {
    return getSession().then(function (s) {
      return client.from("perfiles").update({ nombre: nombre }).eq("id", s.user.id).then(check);
    });
  }

  function check(r) {
    if (r.error) throw r.error;
    return r.data;
  }

  // ---------- obras ----------
  function listObras() {
    return getSession().then(function (s) {
      return client
        .from("obra_miembros")
        .select("rol, obra:obras(id,nombre,direccion,creado)")
        .eq("user_id", s.user.id)
        .then(check)
        .then(function (rows) {
          var obras = rows
            .filter(function (r) { return r.obra; })
            .map(function (r) { var o = r.obra; o.rol = r.rol; return o; })
            .sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
          cacheSet("obras", obras);
          return obras;
        });
    });
  }

  function crearObra(nombre, direccion) {
    return client.from("obras").insert({ nombre: nombre, direccion: direccion || null }).select().single().then(check);
  }

  function getObraId() {
    try { return localStorage.getItem(OBRA_KEY); } catch (e) { return null; }
  }

  function setObraId(id) {
    try { id ? localStorage.setItem(OBRA_KEY, id) : localStorage.removeItem(OBRA_KEY); } catch (e) {}
  }

  function miembros(obraId) {
    return client
      .from("obra_miembros")
      .select("rol, user_id, perfil:perfiles(email,nombre)")
      .eq("obra_id", obraId)
      .then(check);
  }

  // Every signed-up user, for an admin to pick from when assigning a task
  // or plan — not just people already invited into this particular obra.
  // RLS only returns the full list to admins; everyone else gets back just
  // themselves and their own obra co-members.
  function todosLosUsuarios() {
    return client.from("perfiles").select("id,nombre,email").order("nombre", { ascending: true }).then(check);
  }

  // Add a user straight into an obra as a regular member, so an admin can
  // assign them work without going through the email-invitation flow.
  // Silently a no-op if they're already a member.
  function asegurarMiembro(obraId, userId) {
    if (!userId) return Promise.resolve();
    return client
      .from("obra_miembros")
      .upsert({ obra_id: obraId, user_id: userId, rol: "miembro" }, { onConflict: "obra_id,user_id", ignoreDuplicates: true })
      .then(check);
  }

  function invitaciones(obraId) {
    return client.from("invitaciones").select("email,rol,creado").eq("obra_id", obraId).then(check);
  }

  // Invite by email. If that person already has an account, add them right
  // away the next time they sign in; until then it stays as a pending invite.
  function invitar(obraId, email, rol) {
    return getSession().then(function (s) {
      return client
        .from("invitaciones")
        .upsert({ obra_id: obraId, email: email.trim().toLowerCase(), rol: rol || "miembro", invitado_por: s.user.id })
        .then(check);
    });
  }

  function quitarInvitacion(obraId, email) {
    return client.from("invitaciones").delete().eq("obra_id", obraId).eq("email", email).then(check);
  }

  function quitarMiembro(obraId, userId) {
    return client.from("obra_miembros").delete().eq("obra_id", obraId).eq("user_id", userId).then(check);
  }

  function cambiarRol(obraId, userId, rol) {
    return client.from("obra_miembros").update({ rol: rol }).eq("obra_id", obraId).eq("user_id", userId).then(check);
  }

  // ---------- publicaciones (plans + photos) ----------
  function listPublicaciones(obraId) {
    return client
      .from("publicaciones")
      .select("id,obra_id,autor_id,tipo,titulo,nota,ubicacion,sistema,archivo,mime,creado,asignado_a,autor:perfiles!publicaciones_autor_id_fkey(nombre,email),asignado:perfiles!publicaciones_asignado_a_fkey(nombre,email)")
      .eq("obra_id", obraId)
      .order("creado", { ascending: false })
      .limit(500)
      .then(check)
      .then(function (rows) {
        cacheSet("pubs-" + obraId, rows);
        return rows;
      });
  }

  function asignarPublicacion(pubId, obraId, userId) {
    return asegurarMiembro(obraId, userId).then(function () {
      return client.from("publicaciones").update({ asignado_a: userId || null }).eq("id", pubId).then(check);
    });
  }

  // ---------- tareas (free-text tasks, optionally assigned) ----------
  function listTareas(obraId) {
    return client
      .from("tareas")
      .select("id,obra_id,titulo,descripcion,estado,asignado_a,creado_por,creado,asignado:perfiles!tareas_asignado_a_fkey(nombre,email)")
      .eq("obra_id", obraId)
      .order("creado", { ascending: false })
      .then(check)
      .then(function (rows) {
        cacheSet("tareas-" + obraId, rows);
        return rows;
      });
  }

  function crearTarea(obraId, titulo, descripcion, asignadoA) {
    return getSession().then(function (s) {
      return asegurarMiembro(obraId, asignadoA).then(function () {
        return client
          .from("tareas")
          .insert({ obra_id: obraId, titulo: titulo, descripcion: descripcion || null, asignado_a: asignadoA || null, creado_por: s.user.id })
          .select()
          .single()
          .then(check);
      });
    });
  }

  function actualizarTarea(id, changes) {
    return client.from("tareas").update(changes).eq("id", id).select().single().then(check);
  }

  function borrarTarea(id) {
    return client.from("tareas").delete().eq("id", id).then(check);
  }

  function signedUrls(paths) {
    if (!paths.length) return Promise.resolve({});
    return client.storage
      .from(BUCKET)
      .createSignedUrls(paths, 60 * 60 * 6)
      .then(function (r) {
        if (r.error) throw r.error;
        var map = {};
        (r.data || []).forEach(function (d) { if (d.signedUrl) map[d.path] = d.signedUrl; });
        return map;
      });
  }

  function extFor(file) {
    var t = (file.type || "").toLowerCase();
    if (t === "application/pdf") return "pdf";
    if (t === "image/png") return "png";
    if (t === "image/webp") return "webp";
    if (t === "image/heic") return "heic";
    if (t === "image/heif") return "heif";
    return "jpg";
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // Downscale photos so they upload fast from the job site.
  function downscale(file, maxDim) {
    maxDim = maxDim || 2000;
    if (!file.type || file.type.indexOf("image/") !== 0 || /heic|heif/i.test(file.type)) return Promise.resolve(file);
    return new Promise(function (resolve) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        if (scale === 1 && file.size < 1.5 * 1024 * 1024) return resolve(file);
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { resolve(b || file); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function doUpload(obraId, blob, meta) {
    var path = obraId + "/" + uuid() + "." + extFor(blob);
    return getSession().then(function (s) {
      if (!s) throw new Error("not_signed_in");
      return client.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: blob.type || "application/octet-stream", upsert: false })
        .then(function (r) {
          if (r.error) throw r.error;
          return client
            .from("publicaciones")
            .insert({
              obra_id: obraId,
              autor_id: s.user.id,
              tipo: meta.tipo,
              titulo: meta.titulo || null,
              nota: meta.nota || null,
              ubicacion: meta.ubicacion || null,
              sistema: meta.sistema || null,
              archivo: path,
              mime: blob.type || null,
            })
            .select()
            .single()
            .then(function (ins) {
              if (ins.error) {
                client.storage.from(BUCKET).remove([path]);
                throw ins.error;
              }
              // Keep our own uploads available offline.
              return idb("files", "readwrite", function (st) { st.put({ path: path, blob: blob }); }).then(
                function () { return ins.data; },
                function () { return ins.data; }
              );
            });
        });
    });
  }

  function isNetworkError(err) {
    if (!navigator.onLine) return true;
    var m = String((err && (err.message || err)) || "");
    return /fetch|network|load failed|timeout/i.test(m);
  }

  // Publish a plan or photo. Offline? It goes to the outbox and is sent
  // automatically when the phone gets signal again. Resolves {queued:true}
  // in that case.
  function publicar(obraId, file, meta) {
    var prep = meta.tipo === "foto" ? downscale(file) : Promise.resolve(file);
    return prep.then(function (blob) {
      if (!navigator.onLine) return queue(obraId, blob, meta);
      return doUpload(obraId, blob, meta).catch(function (err) {
        if (isNetworkError(err)) return queue(obraId, blob, meta);
        throw err;
      });
    });
  }

  function queue(obraId, blob, meta) {
    return idb("outbox", "readwrite", function (st) {
      st.add({ obraId: obraId, blob: blob, meta: meta, creado: Date.now() });
    }).then(function () {
      notifyOutbox();
      return { queued: true };
    });
  }

  var outboxListeners = [];
  function onOutboxChange(cb) { outboxListeners.push(cb); }
  function notifyOutbox() {
    pendientes().then(function (items) {
      outboxListeners.forEach(function (cb) { try { cb(items); } catch (e) {} });
    });
  }

  function pendientes() {
    return idbAll("outbox").catch(function () { return []; });
  }

  var flushing = false;
  function flushOutbox() {
    if (flushing || !navigator.onLine) return Promise.resolve(0);
    flushing = true;
    var sent = 0;
    return getSession()
      .then(function (s) {
        if (!s) return;
        return pendientes().then(function (items) {
          return items.reduce(function (p, item) {
            return p.then(function () {
              return doUpload(item.obraId, item.blob, item.meta).then(
                function () {
                  sent++;
                  return idb("outbox", "readwrite", function (st) { st.delete(item.id); });
                },
                function (err) {
                  // Permanent errors (e.g. removed from the obra) are dropped
                  // so one bad item never blocks the queue forever.
                  if (!isNetworkError(err)) return idb("outbox", "readwrite", function (st) { st.delete(item.id); });
                }
              );
            });
          }, Promise.resolve());
        });
      })
      .then(function () {
        flushing = false;
        notifyOutbox();
        return sent;
      }, function () {
        flushing = false;
        return sent;
      });
  }

  window.addEventListener("online", function () { flushOutbox(); });

  function borrarPublicacion(pub) {
    return client
      .from("publicaciones")
      .delete()
      .eq("id", pub.id)
      .then(check)
      .then(function () {
        return client.storage.from(BUCKET).remove([pub.archivo]);
      })
      .then(function () {
        return idb("files", "readwrite", function (st) { st.delete(pub.archivo); }).catch(function () {});
      });
  }

  // Get the file as a blob: from the offline cache, else download + cache.
  function getFile(path, opts) {
    return idb("files", "readonly", function (st) { return st.get(path); })
      .then(function (rec) {
        if (rec && rec.blob) return rec.blob;
        return client.storage.from(BUCKET).download(path).then(function (r) {
          if (r.error) throw r.error;
          if (opts && opts.cache === false) return r.data;
          return idb("files", "readwrite", function (st) { st.put({ path: path, blob: r.data }); }).then(
            function () { return r.data; },
            function () { return r.data; }
          );
        });
      });
  }

  function isCached(path) {
    return idb("files", "readonly", function (st) { return st.getKey(path); }).then(function (k) { return !!k; }, function () { return false; });
  }

  // Save all plans of an obra on the phone so they open without signal.
  function cachePlanos(pubs) {
    var planos = pubs.filter(function (p) { return p.tipo === "plano"; });
    return planos.reduce(function (p, pub) {
      return p.then(function () { return getFile(pub.archivo).catch(function () {}); });
    }, Promise.resolve());
  }

  function suscribir(obraId, cb) {
    var ch = client
      .channel("pubs-" + obraId)
      .on("postgres_changes", { event: "*", schema: "public", table: "publicaciones", filter: "obra_id=eq." + obraId }, function () { cb(); })
      .subscribe();
    return function () { client.removeChannel(ch); };
  }

  // ---------- tiny JSON cache for offline lists ----------
  function cacheSet(key, value) {
    try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }
  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function errorText(err) {
    var m = String((err && (err.message || err.error_description || err)) || "");
    if (/invalid login credentials/i.test(m)) return "login_bad";
    if (/email not confirmed/i.test(m)) return "login_unconfirmed";
    if (/already registered|already exists/i.test(m)) return "signup_exists";
    if (/password should be|weak/i.test(m)) return "signup_weak";
    if (/rate limit|too many/i.test(m)) return "rate_limited";
    if (isNetworkError(err)) return "offline";
    return m || "error";
  }

  return {
    client: client,
    getSession: getSession,
    onAuth: onAuth,
    signIn: signIn,
    signUp: signUp,
    signOut: signOut,
    me: me,
    updateName: updateName,
    listObras: listObras,
    crearObra: crearObra,
    getObraId: getObraId,
    setObraId: setObraId,
    miembros: miembros,
    todosLosUsuarios: todosLosUsuarios,
    invitaciones: invitaciones,
    invitar: invitar,
    quitarInvitacion: quitarInvitacion,
    quitarMiembro: quitarMiembro,
    cambiarRol: cambiarRol,
    listPublicaciones: listPublicaciones,
    asignarPublicacion: asignarPublicacion,
    listTareas: listTareas,
    crearTarea: crearTarea,
    actualizarTarea: actualizarTarea,
    borrarTarea: borrarTarea,
    signedUrls: signedUrls,
    publicar: publicar,
    pendientes: pendientes,
    flushOutbox: flushOutbox,
    onOutboxChange: onOutboxChange,
    borrarPublicacion: borrarPublicacion,
    getFile: getFile,
    isCached: isCached,
    cachePlanos: cachePlanos,
    suscribir: suscribir,
    cacheGet: cacheGet,
    errorText: errorText,
  };
})();
