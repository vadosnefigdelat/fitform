import React, { useEffect, useRef, useState } from 'react';
import { CURATED_OUTFITS, GARMENT_ITEMS, STREETWEAR_PALETTE } from './data/wardrobeItems';
import { FitformSceneManager } from './3d/sceneManager';
import { LookbookModal } from './components/LookbookModal';
import { SnapshotModal } from './components/SnapshotModal';
import { StudioSettingsModal } from './components/StudioSettingsModal';
import { TopNav } from './components/TopNav';
import { WardrobeDock } from './components/WardrobeDock';
import {
  CameraPreset,
  FabricType,
  GarmentItem,
  GraphicPrintId,
  OutfitState,
  StudioSettings,
} from './types/wardrobe';
import { isSoundEnabled, playEquipSound, setSoundEnabled } from './utils/audioFX';

const STORAGE_KEY = 'fitform_saved_outfits_v1';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneManagerRef = useRef<FitformSceneManager | null>(null);

  // Active outfit state
  const [currentOutfit, setCurrentOutfit] = useState<OutfitState>(() => CURATED_OUTFITS[0]);

  // Saved outfits library
  const [savedOutfits, setSavedOutfits] = useState<OutfitState[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return [CURATED_OUTFITS[0], CURATED_OUTFITS[1]];
  });

  // Camera & Studio state
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('full');
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    lighting: 'neo_ultraviolet',
    autoRotate: false,
    autoRotateSpeed: 0.8,
    bloomEffect: true,
    gridFloor: true,
    pedestalUnderglow: true,
  });

  // Modals state
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);

  // Hints visibility
  const [showControlsHint, setShowControlsHint] = useState(true);

  // 1. Initialize 3D Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new FitformSceneManager(containerRef.current, currentOutfit);
    sceneManagerRef.current = manager;

    // Hide gesture hint after 6 seconds
    const timer = setTimeout(() => {
      setShowControlsHint(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  // Save outfits to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOutfits));
    } catch {
      // Ignore
    }
  }, [savedOutfits]);

  // -------------------------------------------------------------
  // WARDROBE UPDATES HANDLERS
  // -------------------------------------------------------------

  const handleUpdateTop = (topId: string) => {
    const item = GARMENT_ITEMS.find((g) => g.id === topId);
    setCurrentOutfit((prev) => {
      const next = {
        ...prev,
        topId,
        topColor: item?.defaultColor || prev.topColor,
        topFabric: item?.defaultFabric || prev.topFabric,
        topGraphic: item?.defaultGraphic || prev.topGraphic,
      };
      sceneManagerRef.current?.updateTop(topId, next.topColor, next.topFabric, next.topGraphic);
      return next;
    });
  };

  const handleUpdateTopColor = (color: string) => {
    setCurrentOutfit((prev) => ({ ...prev, topColor: color }));
    sceneManagerRef.current?.updateTopColor(color);
  };

  const handleUpdateTopFabric = (fabric: FabricType) => {
    setCurrentOutfit((prev) => ({ ...prev, topFabric: fabric }));
    sceneManagerRef.current?.updateTopFabric(fabric);
  };

  const handleUpdateTopGraphic = (graphic: GraphicPrintId) => {
    setCurrentOutfit((prev) => ({ ...prev, topGraphic: graphic }));
    sceneManagerRef.current?.updateTopGraphic(graphic);
  };

  const handleUpdateOuterwear = (outerwearId: string) => {
    const item = GARMENT_ITEMS.find((g) => g.id === outerwearId);
    setCurrentOutfit((prev) => {
      const next = {
        ...prev,
        outerwearId,
        outerwearColor: item?.defaultColor || prev.outerwearColor,
        outerwearFabric: item?.defaultFabric || prev.outerwearFabric,
      };
      sceneManagerRef.current?.updateOuterwear(outerwearId, next.outerwearColor, next.outerwearFabric);
      return next;
    });
  };

  const handleUpdateOuterwearColor = (color: string) => {
    setCurrentOutfit((prev) => ({ ...prev, outerwearColor: color }));
    sceneManagerRef.current?.updateOuterwearColor(color);
  };

  const handleUpdateOuterwearFabric = (fabric: FabricType) => {
    setCurrentOutfit((prev) => ({ ...prev, outerwearFabric: fabric }));
    sceneManagerRef.current?.updateOuterwearFabric(fabric);
  };

  const handleUpdatePants = (pantsId: string) => {
    const item = GARMENT_ITEMS.find((g) => g.id === pantsId);
    setCurrentOutfit((prev) => {
      const next = {
        ...prev,
        pantsId,
        pantsColor: item?.defaultColor || prev.pantsColor,
        pantsFabric: item?.defaultFabric || prev.pantsFabric,
      };
      sceneManagerRef.current?.updatePants(pantsId, next.pantsColor, next.pantsFabric);
      return next;
    });
  };

  const handleUpdatePantsColor = (color: string) => {
    setCurrentOutfit((prev) => ({ ...prev, pantsColor: color }));
    sceneManagerRef.current?.updatePantsColor(color);
  };

  const handleUpdatePantsFabric = (fabric: FabricType) => {
    setCurrentOutfit((prev) => ({ ...prev, pantsFabric: fabric }));
    sceneManagerRef.current?.updatePantsFabric(fabric);
  };

  const handleUpdateSneakers = (sneakersId: string) => {
    const item = GARMENT_ITEMS.find((g) => g.id === sneakersId);
    setCurrentOutfit((prev) => {
      const next = {
        ...prev,
        sneakersId,
        sneakersColor: item?.defaultColor || prev.sneakersColor,
      };
      sceneManagerRef.current?.updateSneakers(
        sneakersId,
        next.sneakersColor,
        next.sneakersAccentColor
      );
      return next;
    });
  };

  const handleUpdateSneakersColor = (color: string) => {
    setCurrentOutfit((prev) => ({ ...prev, sneakersColor: color }));
    sceneManagerRef.current?.updateSneakersColor(color);
  };

  const handleUpdateSneakersAccentColor = (accentColor: string) => {
    setCurrentOutfit((prev) => {
      const next = { ...prev, sneakersAccentColor: accentColor };
      sceneManagerRef.current?.updateSneakers(prev.sneakersId, prev.sneakersColor, accentColor);
      return next;
    });
  };

  const handleUpdateAccessory = (accessoryId: string) => {
    const item = GARMENT_ITEMS.find((g) => g.id === accessoryId);
    setCurrentOutfit((prev) => {
      const next = {
        ...prev,
        accessoryId,
        accessoryColor: item?.defaultColor || prev.accessoryColor,
      };
      sceneManagerRef.current?.updateAccessory(accessoryId, next.accessoryColor);
      return next;
    });
  };

  const handleUpdateAccessoryColor = (color: string) => {
    setCurrentOutfit((prev) => ({ ...prev, accessoryColor: color }));
    sceneManagerRef.current?.updateAccessoryColor(color);
  };

  const handleUpdateAvatarSkin = (skin: OutfitState['avatarSkin']) => {
    setCurrentOutfit((prev) => ({ ...prev, avatarSkin: skin }));
    sceneManagerRef.current?.updateAvatarSkin(skin);
  };

  const handleUpdateAvatarPose = (pose: OutfitState['avatarPose']) => {
    setCurrentOutfit((prev) => ({ ...prev, avatarPose: pose }));
    sceneManagerRef.current?.updateAvatarPose(pose);
  };

  // -------------------------------------------------------------
  // CAMERA & STUDIO CONTROLS
  // -------------------------------------------------------------

  const handleSelectCameraPreset = (preset: CameraPreset) => {
    setActiveCameraPreset(preset);
    sceneManagerRef.current?.setCameraPreset(preset);
  };

  const handleToggleAutoRotate = () => {
    setStudioSettings((prev) => {
      const next = { ...prev, autoRotate: !prev.autoRotate };
      sceneManagerRef.current?.setStudioSettings({ autoRotate: next.autoRotate });
      return next;
    });
  };

  const handleUpdateStudioSettings = (newSettings: Partial<StudioSettings>) => {
    setStudioSettings((prev) => {
      const next = { ...prev, ...newSettings };
      sceneManagerRef.current?.setStudioSettings(next);
      return next;
    });
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  // -------------------------------------------------------------
  // ROLL FIT (RANDOMIZER)
  // -------------------------------------------------------------

  const handleRollFit = () => {
    playEquipSound();

    const topItems = GARMENT_ITEMS.filter((g) => g.category === 'top');
    const outerItems = GARMENT_ITEMS.filter((g) => g.category === 'outerwear');
    const pantsItems = GARMENT_ITEMS.filter((g) => g.category === 'pants');
    const sneakerItems = GARMENT_ITEMS.filter((g) => g.category === 'sneakers');
    const accessoryItems = GARMENT_ITEMS.filter((g) => g.category === 'accessory');

    const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
    const randomOuter = outerItems[Math.floor(Math.random() * outerItems.length)];
    const randomPants = pantsItems[Math.floor(Math.random() * pantsItems.length)];
    const randomSneakers = sneakerItems[Math.floor(Math.random() * sneakerItems.length)];
    const randomAcc = accessoryItems[Math.floor(Math.random() * accessoryItems.length)];

    const randomColor1 = STREETWEAR_PALETTE[Math.floor(Math.random() * STREETWEAR_PALETTE.length)].hex;
    const randomColor2 = STREETWEAR_PALETTE[Math.floor(Math.random() * STREETWEAR_PALETTE.length)].hex;
    const randomColor3 = STREETWEAR_PALETTE[Math.floor(Math.random() * STREETWEAR_PALETTE.length)].hex;

    const fabrics: FabricType[] = ['cotton', 'nylon', 'denim', 'techwear', 'leather'];
    const randomFabric = fabrics[Math.floor(Math.random() * fabrics.length)];

    const graphics: GraphicPrintId[] = [
      'fitform_cyber',
      'tokyo_acid',
      'null_void',
      'minimal_box',
      'kanji_atelier',
      'none',
    ];
    const randomGraphic = graphics[Math.floor(Math.random() * graphics.length)];

    const poses: OutfitState['avatarPose'][] = ['atelier', 'street', 'dynamic', 'arms_folded'];
    const randomPose = poses[Math.floor(Math.random() * poses.length)];

    const randomizedFit: OutfitState = {
      id: `roll-${Date.now()}`,
      name: `Proto Fit #${Math.floor(Math.random() * 900) + 100}`,
      createdAt: Date.now(),
      topId: randomTop.id,
      topColor: randomColor1,
      topFabric: randomFabric,
      topGraphic: randomGraphic,
      outerwearId: randomOuter.id,
      outerwearColor: randomColor2,
      outerwearFabric: randomOuter.id === 'outer-bomber' || randomOuter.id === 'outer-puffer' ? 'nylon' : 'cotton',
      pantsId: randomPants.id,
      pantsColor: randomColor3,
      pantsFabric: randomPants.id === 'pants-denim' ? 'denim' : 'cotton',
      sneakersId: randomSneakers.id,
      sneakersColor: Math.random() > 0.5 ? '#121217' : '#e8e5de',
      sneakersAccentColor: '#8b5cf6',
      accessoryId: randomAcc.id,
      accessoryColor: '#8b5cf6',
      avatarSkin: currentOutfit.avatarSkin,
      avatarPose: randomPose,
    };

    setCurrentOutfit(randomizedFit);
    sceneManagerRef.current?.applyOutfit(randomizedFit);
  };

  // -------------------------------------------------------------
  // OUTFIT SAVING & LOADING
  // -------------------------------------------------------------

  const handleSaveOutfit = (name: string) => {
    const newSavedOutfit: OutfitState = {
      ...currentOutfit,
      id: `fit-${Date.now()}`,
      name,
      createdAt: Date.now(),
    };
    setSavedOutfits((prev) => [newSavedOutfit, ...prev]);
    setCurrentOutfit(newSavedOutfit);
  };

  const handleLoadOutfit = (outfit: OutfitState) => {
    setCurrentOutfit(outfit);
    sceneManagerRef.current?.applyOutfit(outfit);
  };

  const handleDeleteOutfit = (id: string) => {
    setSavedOutfits((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCaptureImage = (): string => {
    if (!sceneManagerRef.current) return '';
    return sceneManagerRef.current.captureSnapshot();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07070a] text-white">
      {/* 3D WebGL Canvas Viewport Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing w-full h-full"
      />

      {/* Top Navigation & Fast Controls */}
      <TopNav
        currentOutfit={currentOutfit}
        onSelectCameraPreset={handleSelectCameraPreset}
        activeCameraPreset={activeCameraPreset}
        onRollFit={handleRollFit}
        onOpenLookbook={() => setIsLookbookOpen(true)}
        onOpenSnapshot={() => setIsSnapshotOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        studioSettings={studioSettings}
        onToggleAutoRotate={handleToggleAutoRotate}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        savedOutfitsCount={savedOutfits.length}
      />

      {/* On-Screen Gesture Guidance (Fades out gracefully or dismissed) */}
      {showControlsHint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none transition-opacity duration-700">
          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-500/30 text-[11px] font-mono-tech text-zinc-300 shadow-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            <span>Drag to rotate • Scroll to zoom • Right-click to pan</span>
          </div>
        </div>
      )}

      {/* Unified Bottom Wardrobe Dock (Zero Viewport Occlusion Directive) */}
      <WardrobeDock
        currentOutfit={currentOutfit}
        onUpdateTop={handleUpdateTop}
        onUpdateTopColor={handleUpdateTopColor}
        onUpdateTopFabric={handleUpdateTopFabric}
        onUpdateTopGraphic={handleUpdateTopGraphic}
        onUpdateOuterwear={handleUpdateOuterwear}
        onUpdateOuterwearColor={handleUpdateOuterwearColor}
        onUpdateOuterwearFabric={handleUpdateOuterwearFabric}
        onUpdatePants={handleUpdatePants}
        onUpdatePantsColor={handleUpdatePantsColor}
        onUpdatePantsFabric={handleUpdatePantsFabric}
        onUpdateSneakers={handleUpdateSneakers}
        onUpdateSneakersColor={handleUpdateSneakersColor}
        onUpdateSneakersAccentColor={handleUpdateSneakersAccentColor}
        onUpdateAccessory={handleUpdateAccessory}
        onUpdateAccessoryColor={handleUpdateAccessoryColor}
        onUpdateAvatarSkin={handleUpdateAvatarSkin}
        onUpdateAvatarPose={handleUpdateAvatarPose}
      />

      {/* Lookbook Saved Fits Modal */}
      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        currentOutfit={currentOutfit}
        savedOutfits={savedOutfits}
        onSaveOutfit={handleSaveOutfit}
        onLoadOutfit={handleLoadOutfit}
        onDeleteOutfit={handleDeleteOutfit}
      />

      {/* Snapshot High-Res Photo Studio Modal */}
      <SnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        currentOutfit={currentOutfit}
        onCaptureImage={handleCaptureImage}
      />

      {/* Studio Lighting & Backdrop Modal */}
      <StudioSettingsModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        settings={studioSettings}
        onUpdateSettings={handleUpdateStudioSettings}
      />
    </div>
  );
}
