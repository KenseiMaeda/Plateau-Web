// ====== チェックボックス要素の取得（存在しない環境でも落ちないよう安全に） ======
const chkBldg  = $("#chk_bldg");   // 建物
const chkTran  = $("#chk_tran");   // 道路
const chkTrk   = $("#chk_trk");    // 歩道
const chkVegPc = $("#chk_veg_pc"); // 植被
const chkVegSv = $("#chk_veg_sv"); // 単独木
const chkFrn   = $("#chk_frn");    // 都市設備
const chkBrid  = $("#chk_brid");   // 橋梁

// ====== チェックON/OFFで Tileset の表示/非表示を切り替える ======
//   - 各 Tileset（ts_xxx）は layers.js 側でロード済みを想定
//   - 「?」（オプショナルチェーン）で null セーフにしている
chkBldg?.addEventListener("change",  (e) => { if (ts_tran)  ts_bldg.show  = e.target.checked; });
chkTran?.addEventListener("change",  (e) => { if (ts_tran)  ts_tran.show  = e.target.checked; });
chkTrk?.addEventListener("change",   (e) => { if (ts_trk)   ts_trk.show   = e.target.checked; });
chkVegPc?.addEventListener("change", (e) => { if (ts_veg_pc) ts_veg_pc.show = e.target.checked; });
chkVegSv?.addEventListener("change", (e) => { if (ts_veg_sv) ts_veg_sv.show = e.target.checked; });
chkFrn?.addEventListener("change",   (e) => { if (ts_frn)   ts_frn.show   = e.target.checked; });
chkBrid?.addEventListener("change",  (e) => { if (ts_brid)  ts_brid.show  = e.target.checked; });

// ====== 初期状態の同期（Tileset の ready 後にも UI 状態を反映する） ======
//   - 3D Tiles は fromUrl 直後は未準備（readyPromise 待ちが必要）
//   - ロード完了のタイミングで check 状態（ON/OFF）を .show に反映する
function syncLayerVisibility() {
  if (ts_bldg  && chkBldg)  ts_bldg.show  = chkBldg.checked;
  if (ts_tran  && chkTran)  ts_tran.show  = chkTran.checked;
  if (ts_trk   && chkTrk)   ts_trk.show   = chkTrk.checked;
  if (ts_veg_pc && chkVegPc) ts_veg_pc.show = chkVegPc.checked;
  if (ts_veg_sv && chkVegSv) ts_veg_sv.show = chkVegSv.checked;
  if (ts_frn   && chkFrn)   ts_frn.show   = chkFrn.checked;
  if (ts_brid  && chkBrid)  ts_brid.show  = chkBrid.checked;
}

// 各 Tileset が「いつ ready になるか」わからないので、短時間ポーリングして同期
// - getter 関数で最新の参照を取り出し
// - 100ms 間隔で最大 30 回（= 約3秒）チェック
[() => ts_tran, () => ts_trk, () => ts_veg_pc, () => ts_veg_sv, () => ts_frn, () => ts_brid].forEach((getter) => {
  const trySync = () => {
    const ts = getter();
    if (!ts) return; // まだロードされていない
    // readyPromise 解決後に同期（失敗しても同期だけは実施）
    ts.readyPromise?.then(syncLayerVisibility).catch(syncLayerVisibility);
  };
  let count = 0;
  const h = setInterval(() => {
    trySync();
    if (++count > 30) clearInterval(h); // タイムアウト
  }, 100);
});

// ====== 便利ホットキー（任意機能）： [ / ] で道路の持上げ量を微調整 ======
// - autoLiftToTerrainMulti の extra（地面クリアランス[m]）を実行時に調整
// - TRAN/TRK に同じオフセットを再適用して“埋まり/浮き”を目視で追い込む
let roadExtra = EXTRA.TRAN; // 初期値は config の TRAN 推奨値（例: 0.8）
window.addEventListener("keydown", async (e) => {
  if (e.key === "[" || e.key === "]") {
    // ] キーで +0.2 m、[ キーで -0.2 m
    roadExtra += (e.key === "]") ? +0.2 : -0.2;
    // 0〜3m の範囲にクランプ（安全策）
    roadExtra = Math.max(0, Math.min(3, roadExtra));
    // 道路・歩道に反映（※ 相対オフセットなので多重適用にならないよう注意）
    if (ts_tran) await autoLiftToTerrainMulti(viewer, ts_tran, { extra: roadExtra });
    if (ts_trk)  await autoLiftToTerrainMulti(viewer, ts_trk,  { extra: roadExtra });
    console.log(`Road lift extra = ${roadExtra.toFixed(1)} m`);
  }
});
