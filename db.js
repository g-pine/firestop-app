var PhotoDB = (function () {
  "use strict";

  var DB_NAME = "firestop-photos";
  var DB_VERSION = 1;
  var STORE = "photos";

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
          store.createIndex("systemCode", "systemCode", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function withStore(mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, mode);
        var store = tx.objectStore(STORE);
        var result = fn(store);
        tx.oncomplete = function () {
          db.close();
          resolve(result);
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error);
        };
      });
    });
  }

  // Downscale + compress an image File/Blob to a JPEG blob, max dimension ~1600px.
  function downscale(file, maxDim) {
    maxDim = maxDim || 1600;
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale);
        var ch = Math.round(h * scale);
        var canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, cw, ch);
        canvas.toBlob(
          function (blob) {
            if (blob) resolve(blob);
            else reject(new Error("toBlob failed"));
          },
          "image/jpeg",
          0.82
        );
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("image load failed"));
      };
      img.src = url;
    });
  }

  function addPhoto(file, systemCode, note) {
    return downscale(file).then(function (blob) {
      var record = {
        systemCode: systemCode || null,
        note: note || "",
        blob: blob,
        createdAt: Date.now(),
      };
      return withStore("readwrite", function (store) {
        store.add(record);
      });
    });
  }

  function listAll() {
    return withStore("readonly", function (store) {
      var out = [];
      store.openCursor(null, "prev").onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
          out.push(cursor.value);
          cursor.continue();
        }
      };
      return out;
    });
  }

  function listBySystem(systemCode) {
    return listAll().then(function (all) {
      return all.filter(function (p) { return p.systemCode === systemCode; });
    });
  }

  function deletePhoto(id) {
    return withStore("readwrite", function (store) {
      store.delete(id);
    });
  }

  return {
    addPhoto: addPhoto,
    listAll: listAll,
    listBySystem: listBySystem,
    deletePhoto: deletePhoto,
  };
})();

// Stores plan sheets (PDF or image) uploaded for review, kept at full
// resolution (no downscale) so dimensions/text stay legible.
var PlansDB = (function () {
  "use strict";

  var DB_NAME = "firestop-plans";
  var DB_VERSION = 1;
  var STORE = "plans";

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function withStore(mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, mode);
        var store = tx.objectStore(STORE);
        var result = fn(store);
        tx.oncomplete = function () {
          db.close();
          resolve(result);
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error);
        };
      });
    });
  }

  function addPlan(file) {
    var record = {
      name: file.name || "plano",
      mimeType: file.type || "application/octet-stream",
      blob: file,
      note: "",
      reviewed: false,
      createdAt: Date.now(),
    };
    return withStore("readwrite", function (store) {
      store.add(record);
    });
  }

  function listAll() {
    return withStore("readonly", function (store) {
      var out = [];
      store.openCursor(null, "prev").onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
          out.push(cursor.value);
          cursor.continue();
        }
      };
      return out;
    });
  }

  function getPlan(id) {
    return withStore("readonly", function (store) {
      return store.get(id);
    }).then(function (req) {
      return req.result || null;
    });
  }

  function updatePlan(id, changes) {
    return withStore("readwrite", function (store) {
      var req = store.get(id);
      req.onsuccess = function () {
        var rec = req.result;
        if (!rec) return;
        Object.keys(changes).forEach(function (k) { rec[k] = changes[k]; });
        store.put(rec);
      };
    });
  }

  function deletePlan(id) {
    return withStore("readwrite", function (store) {
      store.delete(id);
    });
  }

  return {
    addPlan: addPlan,
    listAll: listAll,
    getPlan: getPlan,
    updatePlan: updatePlan,
    deletePlan: deletePlan,
  };
})();
