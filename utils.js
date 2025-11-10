//utils.js
// document.querySelector() を 短縮
window.$ = (sel) => document.querySelector(sel);

// 建物の“質感を少し残して近づける”
window.brightenButKeepTexture = function(ts, hex = STYLES.BUILDING_TINT) {
  ts.shadows = Cesium.ShadowMode.DISABLED; // 影の表示
  ts.backFaceCulling = false; // 裏面の描画
  ts.colorBlendMode = Cesium.ColorBlendMode.MIX; // 元色と指定色の混合
  ts.colorBlendAmount = 0.55; // 混合割合
  ts.imageBasedLightingFactor = new Cesium.Cartesian2(0.2, 0.1); // 光の反射強さ
  ts.specularEnvironmentMaps = undefined; // 鏡面反射
  ts.lightColor = new Cesium.Cartesian3(1.5, 1.5, 1.5); // 光源色の明るさ
  const apply = () => ts.style = new Cesium.Cesium3DTileStyle({ color: `color('${hex}', 0.97)` }); // hex は色（デフォルト：白）
  ts.readyPromise?.then(apply).catch(apply);
};

// 軽量化設定
window.tuneTileset = function(ts, { mssError = 8, skipLOD = true, cullMove = true } = {}) {
  ts.maximumScreenSpaceError = mssError; // 描画精度の許容（大きいほど粗い）
  ts.skipLevelOfDetail = skipLOD; // 描画精度の許容（大きいほど粗い）
  ts.cullRequestsWhileMoving = cullMove; // カメラ移動中読み込み処理
  ts.dynamicScreenSpaceError = true; // 遠くのタイルは自動で精度を低下
  ts.shadows = Cesium.ShadowMode.DISABLED; //影の設定
  ts.backFaceCulling = false; //裏面カリング無効化
  return ts;
};

// Cesium3DTileStyle を使って色を設定
window.styleTileset = function(ts, cssColor, alpha = 1.0) {
  const apply = () => ts.style = new Cesium.Cesium3DTileStyle({ color: `color('${cssColor}', ${alpha.toFixed(2)})` });
  ts.readyPromise?.then(apply).catch(apply);
};

// 座標変換
window.displaceCartographic = function(centerCarto, dxEastMeters, dyNorthMeters) {
  // 1) 地球中心座標へ変換
  const centerCartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(centerCarto); 
  // 2) その地点におけるENU座標系（East, North, Up） の行列を作成
  const enuFrame = Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian);
  // 3) ENUの x=東,y=北 方向に[m]でオフセットベクトルを作成
  const offsetENU = new Cesium.Cartesian3(dxEastMeters, dyNorthMeters, 0.0);
  // 4) ENUオフセットを 世界座標へ変換
  const offsetWorld = Cesium.Matrix4.multiplyByPoint(enuFrame, offsetENU, new Cesium.Cartesian3());
  // 5) Cartesian → Cartographicへ（経緯度+高さ）
  return Cesium.Ellipsoid.WGS84.cartesianToCartographic(offsetWorld);
};

// 高精度：複数点サンプリングでロバストに高さ合わせ
window.autoLiftToTerrainMulti = async function(viewer, tileset, {
  rings = 2,              // サンプリングする円の層数（中心から何段階外側まで調べるか）
  ptsPerRing = 12,        // 各リング上のサンプル点の数（1周あたり何点測るか）
  ringStepMeters = 60,    // リングごとの半径の増加量（距離[m]）
  usePercentile = 0.7,    // どの順位の高さを採用するか（0.7=70%位置 → 外れ値に強い）
  extra = 0.6,            // 地面から少し浮かせる高さ（m）※道路なら0.8、木なら0.2など調整
} = {}) {
  // ▼ 地形がない場合は処理できないので終了
  if (!viewer?.terrainProvider) return;

  // ▼ タイルセットが読み込み完了していない場合は待つ
  if (!tileset?.boundingSphere) await tileset.readyPromise;

  // ▼ 地形データの準備が終わるまで待つ（エラーは無視）
  if (viewer.terrainProvider.readyPromise) {
    try { await viewer.terrainProvider.readyPromise; } catch(e) {}
  }

  // ---------------------------------------------
  // ① タイルセット中心の現在位置（経度・緯度・高さ）を取得
  // ---------------------------------------------
  const centerWorld = tileset.boundingSphere.center;  // 3D空間上の中心点
  const centerCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerWorld); // 経緯度＋高さに変換

  // ---------------------------------------------
  // ② 周囲（リング状）に複数のサンプル点を作り、地形の高さを測る準備
  // ---------------------------------------------
  const samplesCarto = [centerCarto]; // 最初に中心点を入れておく

  for (let r = 1; r <= rings; r++) {
    const radius = r * ringStepMeters; // 例: 60m, 120m のように外側へ広がる
    for (let i = 0; i < ptsPerRing; i++) {
      const theta = (2 * Math.PI * i) / ptsPerRing;   // 360°を均等に分ける
      const dx = radius * Math.cos(theta);            // 東西方向のずれ[m]
      const dy = radius * Math.sin(theta);            // 南北方向のずれ[m]
      // 中心位置から dx,dy[m] オフセットした地点（Cartographic）を追加
      samplesCarto.push(window.displaceCartographic(centerCarto, dx, dy));
    }
  }

  // ---------------------------------------------
  // ③ サンプル地点それぞれの地形の高さを取得（最も詳細な地形データで）
  // ---------------------------------------------
  const sampled = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, samplesCarto);

  // 高さだけ取り出し、昇順に並べる（外れ値除去のため）
  const heights = sampled
    .map(p => (typeof p.height === "number" ? p.height : 0))
    .sort((a, b) => a - b);

  // 指定されたパーセンタイルの高さを採用（例: 0.7 → 上から70%の位置）
  const idx = Math.min(heights.length - 1, Math.max(0, Math.floor(heights.length * usePercentile)));
  const robustTerrainHeight = heights[idx]; // = 外れ値に強い地形高さ

  // ---------------------------------------------
  // ④ 現在の高さとの差分を求める → どれだけ持ち上げ/下げすればよいか
  // ---------------------------------------------
  const currentHeight = centerCarto.height;
  const delta = (robustTerrainHeight + extra) - currentHeight; // extra分だけ浮かせる

  // ---------------------------------------------
  // ⑤ ENU座標系（東・北・上）の "Up" 方向に delta[m] 移動させる行列を作る
  // ---------------------------------------------
  const enuFrame = Cesium.Transforms.eastNorthUpToFixedFrame(centerWorld);
  const up = Cesium.Matrix4.getColumn(enuFrame, 2, new Cesium.Cartesian3()); // ENUの上向きベクトル
  const upUnit = Cesium.Cartesian3.normalize(up, new Cesium.Cartesian3());   // 正規化（単位ベクトル）
  const offsetVec = Cesium.Cartesian3.multiplyByScalar(upUnit, delta, new Cesium.Cartesian3()); // delta[m]分移動
  const offsetMat = Cesium.Matrix4.fromTranslation(offsetVec); // 移動行列に変換

  // ---------------------------------------------
  // ⑥ 既存の位置・回転・スケールを維持したまま高さだけ調整
  // ---------------------------------------------
  tileset.modelMatrix = Cesium.Matrix4.multiply(offsetMat, tileset.modelMatrix, new Cesium.Matrix4());
};