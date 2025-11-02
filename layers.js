// ===============================================
// layers.js — LODをUIで切替しても“浮かない”完成版
// ・URLS は起動時/切替時に「単一URL」へ置換
// ・道路等のZオフセットは二重適用しない（liftOnce）
// ・TRAN/TRK の MVT は自動スキップして 3D Tiles にフォールバック
// ===============================================

// ===== 0) 起動時に使うLOD（UI初期値） =====
let currentLod = "LOD3"; // "LOD1" | "LOD2" | "LOD3"

// ===== 1) URLSのLODテーブルを退避（不変の原本）=====
window.URLS_LODS = JSON.parse(JSON.stringify(window.URLS)); // deep clone

// ----- 1-1) 3D Tiles判定（MVTは除外） -----
function is3DTiles(u) {
  return typeof u === "string" && u.endsWith("/tileset.json");
}

// ----- 1-2) 欲しいLODが無い場合の優先順 -----
const LOD_ORDER = {
  LOD3: ["LOD3","LOD2","LOD1"],
  LOD2: ["LOD2","LOD3","LOD1"],
  LOD1: ["LOD1","LOD2","LOD3"],
};

// ----- 1-3) (model, LOD) → 使える3D Tiles URLを選ぶ -----
function pickUrlForModel(model, wantLod) {
  const lods = window.URLS_LODS?.[model];
  if (!lods) return null;
  const order = LOD_ORDER[wantLod] || [wantLod,"LOD2","LOD1","LOD3"];
  for (const lod of order) {
    const u = lods[lod];
    if (is3DTiles(u)) return u; // 3D Tilesのみ採用
  }
  return null;
}

// ----- 1-4) 指定LODを window.URLS.* の“単一URL”へ反映 -----
function applyLodToConstants(lod) {
  const models = ["BLDG","TRAN","TRK","VEG_PC","VEG_SV","FRN","BRID"];
  for (const m of models) {
    const url = pickUrlForModel(m, lod);
    if (!url) {
      console.warn(`[${m}] LOD=${lod} で使える3D Tilesが見つかりません（MVTのみの可能性）`);
      window.URLS[m] = null;
    } else {
      window.URLS[m] = url;
    }
  }
}

// ===== 2) “一度だけ”持ち上げる安全ラッパ（浮き対策）=====
async function liftOnce(viewer, tileset, opts) {
  if (!tileset || tileset._liftApplied) return;
  await autoLiftToTerrainMulti(viewer, tileset, opts);
  tileset._liftApplied = true; // 二重適用ガード
}

// ===== 3) LODごとの余白（extra）をモデル別に最適化 =====
// まずは LOD3 の TRAN/TRK は 0m 推奨（舗装自体が高さを持つ想定）
const EXTRA_BY_LOD = {
  LOD1: { TRAN: 0.2, TRK: 0.2, VEG_PC: 0.5, VEG_SV: 0.2, FRN: 0.3, BRID: 0.6 },
  LOD2: { TRAN: 0.1, TRK: 0.1, VEG_PC: 0.5, VEG_SV: 0.2, FRN: 0.3, BRID: 0.6 },
  LOD3: { TRAN: 0.0, TRK: 0.0, VEG_PC: 0.5, VEG_SV: 0.2, FRN: 0.3, BRID: 0.6 },
};
function extraFor(model) {
  const by = EXTRA_BY_LOD[currentLod] || {};
  // 定義が無ければ従来のEXTRAをfallback
  return by[model] ?? (EXTRA?.[model] || 0);
}

// ===== 4) 各モデルの“従来どおり”ローダ（再読込にも使用）=====
async function reloadBLDG() {
  if (!URLS.BLDG) return;
  if (window.ts_bldg) viewer.scene.primitives.remove(window.ts_bldg);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.BLDG);
  window.ts_bldg = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_bldg);
  brightenButKeepTexture(window.ts_bldg, STYLES.BUILDING_TINT);
}

async function reloadTRAN() {
  if (!URLS.TRAN) return;
  if (window.ts_tran) viewer.scene.primitives.remove(window.ts_tran);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.TRAN);
  window.ts_tran = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_tran);
  styleTileset(window.ts_tran, STYLES.TRAN.color, STYLES.TRAN.alpha);
  await liftOnce(viewer, window.ts_tran, { extra: extraFor("TRAN") });
}

async function reloadTRK() {
  if (!URLS.TRK) return;
  if (window.ts_trk) viewer.scene.primitives.remove(window.ts_trk);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.TRK);
  window.ts_trk = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_trk);
  styleTileset(window.ts_trk, STYLES.TRK.color, STYLES.TRK.alpha);
  await liftOnce(viewer, window.ts_trk, { extra: extraFor("TRK") });
}

async function reloadVEG_PC() {
  if (!URLS.VEG_PC) return;
  if (window.ts_veg_pc) viewer.scene.primitives.remove(window.ts_veg_pc);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.VEG_PC);
  window.ts_veg_pc = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_veg_pc);
  styleTileset(window.ts_veg_pc, STYLES.VEG_PC.color, STYLES.VEG_PC.alpha);
  await liftOnce(viewer, window.ts_veg_pc, { extra: extraFor("VEG_PC") });
}

async function reloadVEG_SV() {
  if (!URLS.VEG_SV) return;
  if (window.ts_veg_sv) viewer.scene.primitives.remove(window.ts_veg_sv);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.VEG_SV);
  window.ts_veg_sv = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_veg_sv);
  styleTileset(window.ts_veg_sv, STYLES.VEG_SV.color, STYLES.VEG_SV.alpha);
  await liftOnce(viewer, window.ts_veg_sv, { extra: extraFor("VEG_SV") });
}

async function reloadFRN() {
  if (!URLS.FRN) return;
  if (window.ts_frn) viewer.scene.primitives.remove(window.ts_frn);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.FRN);
  window.ts_frn = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_frn);
  styleTileset(window.ts_frn, STYLES.FRN.color, STYLES.FRN.alpha);
  await liftOnce(viewer, window.ts_frn, { extra: extraFor("FRN") });
}

async function reloadBRID() {
  if (!URLS.BRID) return;
  if (window.ts_brid) viewer.scene.primitives.remove(window.ts_brid);

  const ts = await Cesium.Cesium3DTileset.fromUrl(URLS.BRID);
  window.ts_brid = tuneTileset(ts, { mssError: 8 });
  viewer.scene.primitives.add(window.ts_brid);
  styleTileset(window.ts_brid, STYLES.BRID.color, STYLES.BRID.alpha);
  await liftOnce(viewer, window.ts_brid, { extra: extraFor("BRID") });
}

// まとめて再読込
async function reloadAll() {
  await Promise.all([
    reloadBLDG(),
    reloadTRAN(),
    reloadTRK(),
    reloadVEG_PC(),
    reloadVEG_SV(),
    reloadFRN(),
    reloadBRID(),
  ]);
}

// ===== 5) 初期ロード（現在のLODを適用 → 従来どおり読み込み）=====
applyLodToConstants(currentLod);

// 建物
Cesium.Cesium3DTileset.fromUrl(URLS.BLDG).then((ts) => {
  window.ts_bldg = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_bldg);
  brightenButKeepTexture(window.ts_bldg, STYLES.BUILDING_TINT);
});
// 道路
Cesium.Cesium3DTileset.fromUrl(URLS.TRAN).then(async (ts) => {
  window.ts_tran = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_tran);
  styleTileset(window.ts_tran, STYLES.TRAN.color, STYLES.TRAN.alpha);
  await liftOnce(viewer, window.ts_tran, { extra: extraFor("TRAN") });
});
// 徒歩道
Cesium.Cesium3DTileset.fromUrl(URLS.TRK).then(async (ts) => {
  window.ts_trk = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_trk);
  styleTileset(window.ts_trk, STYLES.TRK.color, STYLES.TRK.alpha);
  await liftOnce(viewer, window.ts_trk, { extra: extraFor("TRK") });
});
// 植被
Cesium.Cesium3DTileset.fromUrl(URLS.VEG_PC).then(async (ts) => {
  window.ts_veg_pc = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_veg_pc);
  styleTileset(window.ts_veg_pc, STYLES.VEG_PC.color, STYLES.VEG_PC.alpha);
  await liftOnce(viewer, window.ts_veg_pc, { extra: extraFor("VEG_PC") });
});
// 単独木
Cesium.Cesium3DTileset.fromUrl(URLS.VEG_SV).then(async (ts) => {
  window.ts_veg_sv = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_veg_sv);
  styleTileset(window.ts_veg_sv, STYLES.VEG_SV.color, STYLES.VEG_SV.alpha);
  await liftOnce(viewer, window.ts_veg_sv, { extra: extraFor("VEG_SV") });
});
// 都市設備
Cesium.Cesium3DTileset.fromUrl(URLS.FRN).then(async (ts) => {
  window.ts_frn = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_frn);
  styleTileset(window.ts_frn, STYLES.FRN.color, STYLES.FRN.alpha);
  await liftOnce(viewer, window.ts_frn, { extra: extraFor("FRN") });
});
// 橋梁
Cesium.Cesium3DTileset.fromUrl(URLS.BRID).then(async (ts) => {
  window.ts_brid = tuneTileset(ts, { mssError: 8 });
  viewer.scene.primitives.add(window.ts_brid);
  styleTileset(window.ts_brid, STYLES.BRID.color, STYLES.BRID.alpha);
  await liftOnce(viewer, window.ts_brid, { extra: extraFor("BRID") });
});

// ===== 6) UI連動（任意）— <select id="lodSelect"> を置いた場合 =====
const lodSel = document.getElementById("lodSelect");
if (lodSel) {
  lodSel.value = currentLod;
  lodSel.addEventListener("change", async (e) => {
    currentLod = e.target.value;        // "LOD1" | "LOD2" | "LOD3"
    applyLodToConstants(currentLod);    // URLS.* を単一URLに差し替え
    await reloadAll();                  // 従来の流れで読み直し（liftOnceで浮き防止）
  });
}

// === デバッグ用ログ（任意）===
// console.log("BLDG:", URLS.BLDG);
// console.log("TRAN:", URLS.TRAN);
// console.log("TRK :", URLS.TRK);
