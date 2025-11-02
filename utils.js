//utils.js
// 便利クエリ
window.$ = (sel) => document.querySelector(sel);

// 建物の“質感を少し残して近づける”
window.brightenButKeepTexture = function(ts, hex = STYLES.BUILDING_TINT) {
  ts.shadows = Cesium.ShadowMode.DISABLED;
  ts.backFaceCulling = false;

  ts.colorBlendMode = Cesium.ColorBlendMode.MIX;
  ts.colorBlendAmount = 0.55;

  ts.imageBasedLightingFactor = new Cesium.Cartesian2(0.2, 0.1);
  ts.specularEnvironmentMaps = undefined;
  ts.lightColor = new Cesium.Cartesian3(1.5, 1.5, 1.5);

  const apply = () => ts.style = new Cesium.Cesium3DTileStyle({ color: `color('${hex}', 0.97)` });
  ts.readyPromise?.then(apply).catch(apply);
};

// 軽量化設定
window.tuneTileset = function(ts, { mssError = 8, skipLOD = true, cullMove = true } = {}) {
  ts.maximumScreenSpaceError = mssError;
  ts.skipLevelOfDetail = skipLOD;
  ts.cullRequestsWhileMoving = cullMove;
  ts.dynamicScreenSpaceError = true;
  ts.shadows = Cesium.ShadowMode.DISABLED;
  ts.backFaceCulling = false;
  return ts;
};

// 単色スタイル
window.styleTileset = function(ts, cssColor, alpha = 1.0) {
  const apply = () => ts.style = new Cesium.Cesium3DTileStyle({ color: `color('${cssColor}', ${alpha.toFixed(2)})` });
  ts.readyPromise?.then(apply).catch(apply);
};

// ENU座標で (dx,dy [m]) 平面移動した Cartographic を返す
window.displaceCartographic = function(centerCarto, dxEastMeters, dyNorthMeters) {
  const centerCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(centerCarto);
  const enuFrame = Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian);
  const offsetENU = new Cesium.Cartesian3(dxEastMeters, dyNorthMeters, 0.0);
  const offsetWorld = Cesium.Matrix4.multiplyByPoint(enuFrame, offsetENU, new Cesium.Cartesian3());
  return Cesium.Ellipsoid.WGS84.cartesianToCartographic(offsetWorld);
};

// 高精度：複数点サンプリングでロバストに高さ合わせ
window.autoLiftToTerrainMulti = async function(viewer, tileset, {
  rings = 2, ptsPerRing = 12, ringStepMeters = 60, usePercentile = 0.7, extra = 0.6,
} = {}) {
  if (!viewer?.terrainProvider) return;
  if (!tileset?.boundingSphere) await tileset.readyPromise;
  if (viewer.terrainProvider.readyPromise) {
    try { await viewer.terrainProvider.readyPromise; } catch(e) {}
  }

  // 3D Tilesの「現在のワールド中心」とそのCartographic（= 今の高さを含む）
  const centerWorld = tileset.boundingSphere.center;
  const centerCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerWorld);

  // 周囲をサンプリングして頑健な地形高さを推定
  const samplesCarto = [centerCarto];
  for (let r = 1; r <= rings; r++) {
    const radius = r * ringStepMeters;
    for (let i = 0; i < ptsPerRing; i++) {
      const theta = (2 * Math.PI * i) / ptsPerRing;
      const dx = radius * Math.cos(theta);
      const dy = radius * Math.sin(theta);
      samplesCarto.push(window.displaceCartographic(centerCarto, dx, dy));
    }
  }
  const sampled = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, samplesCarto);
  const heights = sampled.map(p => (typeof p.height === "number" ? p.height : 0)).sort((a,b)=>a-b);
  const idx = Math.min(heights.length - 1, Math.max(0, Math.floor(heights.length * usePercentile)));
  const robustTerrainHeight = heights[idx];

  // 「今のモデル中心の高さ」と「目標高さ（地形+extra）」の差分だけ上げ下げ
  const currentHeight = centerCarto.height;
  const delta = (robustTerrainHeight + extra) - currentHeight; // ← 差分（m）

  // ENUのUp方向に delta だけ移動する相対変換を、既存transformに乗せる
  const enuFrame = Cesium.Transforms.eastNorthUpToFixedFrame(centerWorld);
  const up = Cesium.Matrix4.getColumn(enuFrame, 2, new Cesium.Cartesian3()); // ENUのZ(Up)
  const upUnit = Cesium.Cartesian3.normalize(up, new Cesium.Cartesian3());
  const offsetVec = Cesium.Cartesian3.multiplyByScalar(upUnit, delta, new Cesium.Cartesian3());
  const offsetMat = Cesium.Matrix4.fromTranslation(offsetVec);

  // 既存transformを維持しつつオフセットを前掛け
  tileset.modelMatrix = Cesium.Matrix4.multiply(offsetMat, tileset.modelMatrix, new Cesium.Matrix4());
};
