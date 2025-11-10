// ◆ Cesium トークン設定（TerrainやIon資産を使うために必須）
Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;

// ◆ Viewer（3D地図本体）の作成
//   - imageryProvider: false → 最初は地図画像を入れない（自分で追加するため）
//   - baseLayerPicker: false → 右上のレイヤー切替UIを非表示
//   - timeline/animation: false → 下のタイムライン・再生UIを使わないのでOFF
window.viewer = new Cesium.Viewer("cesiumContainer", {
  imageryProvider: false,
  baseLayerPicker: false,
  timeline: false,
  animation: false,
});

// ◆ 地形と建物の"埋もれ"対策
//   falseにすると、地形とモデルのZ判定を弱めて、モデルが地面に隠れにくくなる
viewer.scene.globe.depthTestAgainstTerrain = false;

// ◆ 地形の読み込み設定（PLATEAU Terrain on Cesium Ion）
viewer.scene.setTerrain(
  new Cesium.Terrain(
    Cesium.CesiumTerrainProvider.fromIonAssetId(2488101) // ← PLATEAU地形のAsset ID
  )
);
viewer.scene.globe.show = true;      // 地形を表示
viewer.scene.globe.enableLighting = false; // 太陽光による明暗変化をOFF（見やすさ重視）
viewer.scene.highDynamicRange = true; // 色域を広げて綺麗に表示
viewer.shadows = false;               // 影OFF（重いので基本OFF推奨）

// ◆ ベース地図（OpenStreetMap）
//   建物モデルと喧嘩しないよう、淡く明るめに調整している
const il = viewer.scene.imageryLayers;
const osmBase = il.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", // OSMタイルURL
  maximumLevel: 19,
  credit: "© OpenStreetMap contributors",
}));

// --- 色調整（必要に応じて好みで変更OK） ---
// 推奨範囲：コメントに記載
osmBase.brightness = 1.25;   // 明るさ（0.5 ～ 2.0）
osmBase.contrast   = 1.50;   // コントラスト（0.5 ～ 2.0）
osmBase.saturation = 1.50;   // 彩度（0.0 ～ 2.0）
osmBase.gamma      = 1.05;   // ガンマ補正（0.3 ～ 3.0）※1.0付近が自然
osmBase.alpha      = 0.80;   // 不透明度（0.0 ～ 1.0）

// ◆ 初期視点（カメラ位置）
//   - つくば市中央付近（緯度36.1113 経度140.1006）上空1500m
//   - ピッチを -45° にして斜め上から俯瞰
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(140.1006, 36.1113, 1500.0),
  orientation: {
    heading: 0,                                // 水平方向の向き（0°）
    pitch: Cesium.Math.toRadians(-45),         // 上下角（下方向へ45°）
    roll: 0,
  },
});

// ◆ マウス操作の有効化と制限設定
//   - 各操作を明示的にONにしておくと、カスタマイズがしやすい
const c = viewer.scene.screenSpaceCameraController;
c.enableRotate = c.enableTranslate = c.enableZoom = c.enableTilt = c.enableLook = true;

c.minimumZoomDistance = 10.0;       // 最小ズーム距離（地面にめり込まないように）
c.maximumZoomDistance = 500000.0;   // 最大ズーム距離（50万m = 500km）

// ドラッグ操作の割り当て
c.rotateEventTypes = [
  Cesium.CameraEventType.LEFT_DRAG,   // 左ドラッグ → 回転
  Cesium.CameraEventType.MIDDLE_DRAG, // 中ドラッグ → 回転（代替）
];
c.tiltEventTypes = [
  Cesium.CameraEventType.RIGHT_DRAG,  // 右ドラッグ → チルト（上下視点）
  Cesium.CameraEventType.PINCH,       // ピンチ操作 → チルト
  { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL }, // Ctrl + 左ドラッグ → チルト
];
c.zoomEventTypes = [
  Cesium.CameraEventType.WHEEL, // ホイール → ズーム
  Cesium.CameraEventType.PINCH, // ピンチ → ズーム
];

// ◆ 各レイヤのTilesetを格納する変数（他ファイルでも参照できるようにwindowに置く）
window.ts_bldg =        // 建物
window.ts_tran =        // 道路
window.ts_trk =         // 歩道
window.ts_veg_pc =      // 植被（PlantCover）
window.ts_veg_sv =      // 単独木（SolitaryVegetation）
window.ts_frn =         // 都市設備（Furniture）
window.ts_brid = null;  // 橋梁（Bridge）
// どれも初期値は null → ロードされたら代入される
