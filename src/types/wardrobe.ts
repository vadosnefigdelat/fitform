export type ClothingCategory = 'top' | 'outerwear' | 'pants' | 'sneakers' | 'accessory';

export type FabricType = 'cotton' | 'nylon' | 'denim' | 'techwear' | 'leather';

export type GraphicPrintId = 'none' | 'fitform_cyber' | 'tokyo_acid' | 'null_void' | 'minimal_box' | 'kanji_atelier';

export interface GarmentItem {
  id: string;
  name: string;
  category: ClothingCategory;
  description: string;
  subType: string;
  defaultColor: string;
  defaultFabric: FabricType;
  defaultGraphic?: GraphicPrintId;
  priceTag?: string;
  tags: string[];
}

export interface OutfitState {
  id: string;
  name: string;
  createdAt: number;
  // Selected garment IDs
  topId: string;
  topColor: string;
  topFabric: FabricType;
  topGraphic: GraphicPrintId;

  outerwearId: string; // 'none' or garmentId
  outerwearColor: string;
  outerwearFabric: FabricType;

  pantsId: string;
  pantsColor: string;
  pantsFabric: FabricType;

  sneakersId: string;
  sneakersColor: string;
  sneakersAccentColor: string;

  accessoryId: string; // 'none' or accessoryId
  accessoryColor: string;

  // Avatar customization
  avatarSkin: 'mannequin_dark' | 'mannequin_chrome' | 'human_fair' | 'human_tan' | 'human_rich';
  avatarPose: 'atelier' | 'street' | 'dynamic' | 'arms_folded';
}

export type CameraPreset = 'full' | 'upper' | 'lower' | 'face' | 'back';

export type LightingPreset = 'neo_ultraviolet' | 'dark_atelier' | 'cyber_runway' | 'golden_hour';

export interface StudioSettings {
  lighting: LightingPreset;
  autoRotate: boolean;
  autoRotateSpeed: number;
  bloomEffect: boolean;
  gridFloor: boolean;
  pedestalUnderglow: boolean;
}
