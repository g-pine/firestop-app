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

// Maps a scanned barcode's decoded text to a product code the user picked
// once. There is no public database of Hilti barcode numbers, so the app
// learns the mapping locally the first time a given code is scanned.
var BarcodeDB = (function () {
  "use strict";

  var DB_NAME = "firestop-barcodes";
  var DB_VERSION = 1;
  var STORE = "barcodes";

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "code" });
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

  function getProduct(code) {
    return withStore("readonly", function (store) {
      var req = store.get(code);
      return req;
    }).then(function (req) {
      return req.result ? req.result.productCode : null;
    });
  }

  function setProduct(code, productCode) {
    return withStore("readwrite", function (store) {
      store.put({ code: code, productCode: productCode, savedAt: Date.now() });
    });
  }

  return {
    getProduct: getProduct,
    setProduct: setProduct,
  };
})();
