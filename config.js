//config.js
// ===== トークン =====
window.CESIUM_ION_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNjk0MTM4NC1lMWI0LTQxNTgtYjcxZS01ZWJhMGJlMTE1MWQiLCJpZCI6MTQ5ODk3LCJpYXQiOjE3MTUxNTEyODZ9.2aUmEQ2-fDsjf-XeC6-hZpwkgwLse3yXoXF4xTOvPAY";

// ===== 3D Tiles URL =====
window.URLS = {
  BLDG:{
    LOD1:"https://assets.cms.plateau.reearth.io/assets/e5/5fef61-cfe5-4132-bc72-5f46fc8d0ea9/08220_tsukuba-shi_city_2023_citygml_2_op_bldg_3dtiles_lod1/tileset.json",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/44/60c228-5d7c-426d-8cbd-13407ee83578/08220_tsukuba-shi_city_2023_citygml_2_op_bldg_3dtiles_lod2/tileset.json",
    LOD3:"https://assets.cms.plateau.reearth.io/assets/b8/952c86-b562-403b-a4be-e4d5ffb577ed/08220_tsukuba-shi_city_2023_citygml_2_op_bldg_3dtiles_lod3/tileset.json",
  },
  TRAN:{
    LOD1:"https://assets.cms.plateau.reearth.io/assets/01/4e7c02-f1e0-4a00-ba03-31ab431b96a9/08220_tsukuba-shi_city_2023_citygml_2_op_tran_mvt_lod1/{z}/{x}/{y}.mvt",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/01/4e7c02-f1e0-4a00-ba03-31ab431b96a9/08220_tsukuba-shi_city_2023_citygml_2_op_tran_mvt_lod1/{z}/{x}/{y}.mvt",
    LOD3:"https://assets.cms.plateau.reearth.io/assets/02/8f40d1-d7eb-4586-b8b9-07ab85809edf/08220_tsukuba-shi_city_2023_citygml_2_op_tran_3dtiles_lod3/tileset.json",
  },
  TRK:{
    LOD1:"https://assets.cms.plateau.reearth.io/assets/29/395dc5-7463-44d6-8f85-916648d90a38/08220_tsukuba-shi_city_2023_citygml_2_op_trk_mvt_lod1/{z}/{x}/{y}.mvt",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/e7/ef24e2-2acd-4a5d-aca9-2cd7dc8713f8/08220_tsukuba-shi_city_2023_citygml_2_op_trk_mvt_lod2/{z}/{x}/{y}.mvt",
    LOD3:"https://assets.cms.plateau.reearth.io/assets/28/419410-fbee-484a-bded-563190d42edc/08220_tsukuba-shi_city_2023_citygml_2_op_trk_3dtiles_lod3/tileset.json",
  },
  VEG_PC:{
    LOD1: "https://assets.cms.plateau.reearth.io/assets/62/612220-13b6-4943-9797-538117cd4e19/08220_tsukuba-shi_city_2023_citygml_2_op_veg_PlantCover_3dtiles_lod1/tileset.json",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/bb/0f295a-2b67-4a1a-822c-8cc5f5307804/08220_tsukuba-shi_city_2023_citygml_2_op_veg_PlantCover_3dtiles_lod2/tileset.json",
    LOD3:"https://assets.cms.plateau.reearth.io/assets/01/baf57b-c2a5-4f8f-b2fa-2d7e9b11750e/08220_tsukuba-shi_city_2023_citygml_2_op_veg_PlantCover_3dtiles_lod3/tileset.json",
  },
  VEG_SV:{
    LOD1:"https://assets.cms.plateau.reearth.io/assets/ba/926c8e-115d-4f28-957e-4c4b5f82267e/08220_tsukuba-shi_city_2023_citygml_2_op_veg_SolitaryVegetationObject_3dtiles_lod1/tileset.json",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/86/25628a-e5f4-4687-8de6-731642546288/08220_tsukuba-shi_city_2023_citygml_2_op_veg_SolitaryVegetationObject_3dtiles_lod2/tileset.json",
    LOD3:"https://assets.cms.plateau.reearth.io/assets/51/2c0e87-c2ba-41b3-9ef9-6c5eb31d011c/08220_tsukuba-shi_city_2023_citygml_2_op_veg_SolitaryVegetationObject_3dtiles_lod3/tileset.json",
  },
  FRN:{
    LOD1:"https://assets.cms.plateau.reearth.io/assets/4a/d09bbc-c363-4cfd-8f1e-9cec63e90f29/08220_tsukuba-shi_city_2023_citygml_2_op_frn_3dtiles_lod1/tileset.json",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/2b/a88929-5909-407d-8231-b4743215c642/08220_tsukuba-shi_city_2023_citygml_2_op_frn_3dtiles_lod2/tileset.json",   
    LOD3:"https://assets.cms.plateau.reearth.io/assets/91/188be9-de93-4a9f-b472-7a1f66837203/08220_tsukuba-shi_city_2023_citygml_2_op_frn_3dtiles_lod3/tileset.json",
  },
  BRID:{
    LOD1:"https://assets.cms.plateau.reearth.io/assets/bc/6cc460-3a78-404f-8a89-3483480d56cb/08220_tsukuba-shi_city_2023_citygml_2_op_brid_3dtiles_lod1/tileset.json",
    LOD2:"https://assets.cms.plateau.reearth.io/assets/98/ff9962-271a-41c7-a4ce-d8e9ea8a34c2/08220_tsukuba-shi_city_2023_citygml_2_op_brid_3dtiles_lod2/tileset.json",
    LOD3:"https://assets.cms.plateau.reearth.io/assets/5f/f002e3-dc08-48fb-8036-5f3761c1acfc/08220_tsukuba-shi_city_2023_citygml_2_op_brid_3dtiles_lod3/tileset.json",
  },
};

// ===== 表示色（調整しやすいようにここで管理） =====
window.STYLES = {
  BUILDING_TINT: "#ffffff",
  TRAN:  { color: "#4b4f55", alpha: 0.98 },
  TRK:   { color: "#a8adb3", alpha: 0.92 },
  VEG_PC:{ color: "#4e8f5b", alpha: 0.55 },
  VEG_SV:{ color: "#3b8f3f", alpha: 0.75 },
  FRN:   { color: "#3A6FFF", alpha: 0.95 },
  BRID:  { color: "#f2f2f2", alpha: 0.98 },
};

// ===== 高さ余白（レイヤ別） =====
window.EXTRA = {
  TRAN: 0.8,
  TRK:  0.8,
  VEG_PC: 0.5,
  VEG_SV: 0.2,
  FRN: 0.3,
  BRID: 0.6,
};
