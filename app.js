// Cesiumトークン
Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;

// Viewer（既定のBingは使わない）
window.viewer = new Cesium.Viewer("cesiumContainer", {
  imageryProvider: false,
  baseLayerPicker: false,
  timeline: false,
  animation: false,
});

// “埋もれ”より視認性を優先（良い感じになった設定）
viewer.scene.globe.depthTestAgainstTerrain = false;

// 地形（PLATEAU Terrain on Ion）
viewer.scene.setTerrain(new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromIonAssetId(2488101)));
viewer.scene.globe.show = true;
viewer.scene.globe.enableLighting = false;
viewer.scene.highDynamicRange = true;
viewer.shadows = false;

// ベース画像（OSM）：明るく淡く・薄め
const il = viewer.scene.imageryLayers;
const osmBase = il.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  maximumLevel: 19,
  credit: "© OpenStreetMap contributors",
}));
osmBase.brightness = 1.25;   // ← 明るさ（0.5 ～ 2.0推奨）
osmBase.contrast   = 1.50;   // ← コントラスト（0.5 ～ 2.0推奨）
osmBase.saturation = 1.50;   // ← 彩度（0.0 ～ 2.0推奨）
osmBase.gamma      = 1.05;   // ← ガンマ補正（0.3 ～ 3.0推奨）
osmBase.alpha      = 0.80;   // ← 不透明度（0.0 ～ 1.0 推奨）

// 初期視点
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(140.1006, 36.1113, 1500.0),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
});

// マウス操作（明示）
const c = viewer.scene.screenSpaceCameraController;
c.enableRotate = c.enableTranslate = c.enableZoom = c.enableTilt = c.enableLook = true;
c.minimumZoomDistance = 10.0;
c.maximumZoomDistance = 500000.0;
c.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG, Cesium.CameraEventType.MIDDLE_DRAG];
c.tiltEventTypes = [
  Cesium.CameraEventType.RIGHT_DRAG,
  Cesium.CameraEventType.PINCH,
  { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
];
c.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

// レイヤ参照（他ファイルから見えるようにwindowに置く）
window.ts_bldg = window.ts_tran = window.ts_trk = window.ts_veg_pc = window.ts_veg_sv = window.ts_frn = window.ts_brid = null;
