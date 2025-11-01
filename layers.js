//layers.js
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
  await autoLiftToTerrainMulti(viewer, window.ts_tran, { extra: EXTRA.TRAN });
});

// 徒歩道
Cesium.Cesium3DTileset.fromUrl(URLS.TRK).then(async (ts) => {
  window.ts_trk = tuneTileset(ts);
  viewer.scene.primitives.add(window.ts_trk);
  styleTileset(window.ts_trk, STYLES.TRK.color, STYLES.TRK.alpha);
  await autoLiftToTerrainMulti(viewer, window.ts_trk, { extra: EXTRA.TRK });
});

// 植被
Cesium.Cesium3DTileset.fromUrl(URLS.VEG_PC).then(async (ts) => {
  window.ts_veg_pc = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_veg_pc);
  styleTileset(window.ts_veg_pc, STYLES.VEG_PC.color, STYLES.VEG_PC.alpha);
  await autoLiftToTerrainMulti(viewer, window.ts_veg_pc, { extra: EXTRA.VEG_PC });
});

// 単独木
Cesium.Cesium3DTileset.fromUrl(URLS.VEG_SV).then(async (ts) => {
  window.ts_veg_sv = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_veg_sv);
  styleTileset(window.ts_veg_sv, STYLES.VEG_SV.color, STYLES.VEG_SV.alpha);
  await autoLiftToTerrainMulti(viewer, window.ts_veg_sv, { extra: EXTRA.VEG_SV });
});

// 都市設備
Cesium.Cesium3DTileset.fromUrl(URLS.FRN).then(async (ts) => {
  window.ts_frn = tuneTileset(ts, { mssError: 10 });
  viewer.scene.primitives.add(window.ts_frn);
  styleTileset(window.ts_frn, STYLES.FRN.color, STYLES.FRN.alpha);
  await autoLiftToTerrainMulti(viewer, window.ts_frn, { extra: EXTRA.FRN });
});

// 橋梁
Cesium.Cesium3DTileset.fromUrl(URLS.BRID).then(async (ts) => {
  window.ts_brid = tuneTileset(ts, { mssError: 8 });
  viewer.scene.primitives.add(window.ts_brid);
  styleTileset(window.ts_brid, STYLES.BRID.color, STYLES.BRID.alpha);
  await autoLiftToTerrainMulti(viewer, window.ts_brid, { extra: EXTRA.BRID });
});
