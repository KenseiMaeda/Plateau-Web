const chkTran  = $("#chk_tran");
const chkTrk   = $("#chk_trk");
const chkVegPc = $("#chk_veg_pc");
const chkVegSv = $("#chk_veg_sv");
const chkFrn   = $("#chk_frn");
const chkBrid  = $("#chk_brid");

// イベント
chkTran?.addEventListener("change",  (e) => { if (ts_tran)  ts_tran.show  = e.target.checked; });
chkTrk?.addEventListener("change",   (e) => { if (ts_trk)   ts_trk.show   = e.target.checked; });
chkVegPc?.addEventListener("change", (e) => { if (ts_veg_pc) ts_veg_pc.show = e.target.checked; });
chkVegSv?.addEventListener("change", (e) => { if (ts_veg_sv) ts_veg_sv.show = e.target.checked; });
chkFrn?.addEventListener("change",   (e) => { if (ts_frn)   ts_frn.show   = e.target.checked; });
chkBrid?.addEventListener("change",  (e) => { if (ts_brid)  ts_brid.show  = e.target.checked; });

// 初期状態に同期（ready 後にも反映）
function syncLayerVisibility() {
  if (ts_tran  && chkTran)  ts_tran.show  = chkTran.checked;
  if (ts_trk   && chkTrk)   ts_trk.show   = chkTrk.checked;
  if (ts_veg_pc && chkVegPc) ts_veg_pc.show = chkVegPc.checked;
  if (ts_veg_sv && chkVegSv) ts_veg_sv.show = chkVegSv.checked;
  if (ts_frn   && chkFrn)   ts_frn.show   = chkFrn.checked;
  if (ts_brid  && chkBrid)  ts_brid.show  = chkBrid.checked;
}
[() => ts_tran, () => ts_trk, () => ts_veg_pc, () => ts_veg_sv, () => ts_frn, () => ts_brid].forEach((getter) => {
  const trySync = () => {
    const ts = getter();
    if (!ts) return;
    ts.readyPromise?.then(syncLayerVisibility).catch(syncLayerVisibility);
  };
  let count = 0;
  const h = setInterval(() => {
    trySync();
    if (++count > 30) clearInterval(h);
  }, 100);
});

// 便利ホットキー（任意）：[ / ] で道路持上げ量の微調整
let roadExtra = EXTRA.TRAN;
window.addEventListener("keydown", async (e) => {
  if (e.key === "[" || e.key === "]") {
    roadExtra += (e.key === "]") ? +0.2 : -0.2;
    roadExtra = Math.max(0, Math.min(3, roadExtra));
    if (ts_tran) await autoLiftToTerrainMulti(viewer, ts_tran, { extra: roadExtra });
    if (ts_trk)  await autoLiftToTerrainMulti(viewer, ts_trk,  { extra: roadExtra });
    console.log(`Road lift extra = ${roadExtra.toFixed(1)} m`);
  }
});
