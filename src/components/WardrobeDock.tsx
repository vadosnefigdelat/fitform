import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Palette,
  Pipette,
  Shirt,
  Sparkles,
  Tag,
  User,
  Zap,
} from 'lucide-react';
import {
  FABRICS_LIST,
  GARMENT_ITEMS,
  GRAPHIC_PRINTS,
  STREETWEAR_PALETTE,
} from '../data/wardrobeItems';
import {
  ClothingCategory,
  FabricType,
  GraphicPrintId,
  OutfitState,
} from '../types/wardrobe';
import { playClickSound, playEquipSound } from '../utils/audioFX';

interface WardrobeDockProps {
  currentOutfit: OutfitState;
  onUpdateTop: (id: string) => void;
  onUpdateTopColor: (color: string) => void;
  onUpdateTopFabric: (fabric: FabricType) => void;
  onUpdateTopGraphic: (graphic: GraphicPrintId) => void;

  onUpdateOuterwear: (id: string) => void;
  onUpdateOuterwearColor: (color: string) => void;
  onUpdateOuterwearFabric: (fabric: FabricType) => void;

  onUpdatePants: (id: string) => void;
  onUpdatePantsColor: (color: string) => void;
  onUpdatePantsFabric: (fabric: FabricType) => void;

  onUpdateSneakers: (id: string) => void;
  onUpdateSneakersColor: (color: string) => void;
  onUpdateSneakersAccentColor: (color: string) => void;

  onUpdateAccessory: (id: string) => void;
  onUpdateAccessoryColor: (color: string) => void;

  onUpdateAvatarSkin: (skin: OutfitState['avatarSkin']) => void;
  onUpdateAvatarPose: (pose: OutfitState['avatarPose']) => void;
}

type DockTab = 'top' | 'outerwear' | 'pants' | 'sneakers' | 'accessory' | 'model';

export const WardrobeDock: React.FC<WardrobeDockProps> = ({
  currentOutfit,
  onUpdateTop,
  onUpdateTopColor,
  onUpdateTopFabric,
  onUpdateTopGraphic,
  onUpdateOuterwear,
  onUpdateOuterwearColor,
  onUpdateOuterwearFabric,
  onUpdatePants,
  onUpdatePantsColor,
  onUpdatePantsFabric,
  onUpdateSneakers,
  onUpdateSneakersColor,
  onUpdateSneakersAccentColor,
  onUpdateAccessory,
  onUpdateAccessoryColor,
  onUpdateAvatarSkin,
  onUpdateAvatarPose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<DockTab>('top');
  const [activeSubSection, setActiveSubSection] = useState<'items' | 'colors' | 'fabrics' | 'prints'>('items');

  // Filter items by active tab
  const categoryItems = GARMENT_ITEMS.filter((item) => item.category === activeTab);

  // Active item info
  const getActiveItemId = () => {
    switch (activeTab) {
      case 'top':
        return currentOutfit.topId;
      case 'outerwear':
        return currentOutfit.outerwearId;
      case 'pants':
        return currentOutfit.pantsId;
      case 'sneakers':
        return currentOutfit.sneakersId;
      case 'accessory':
        return currentOutfit.accessoryId;
      default:
        return '';
    }
  };

  const getActiveItemColor = () => {
    switch (activeTab) {
      case 'top':
        return currentOutfit.topColor;
      case 'outerwear':
        return currentOutfit.outerwearColor;
      case 'pants':
        return currentOutfit.pantsColor;
      case 'sneakers':
        return currentOutfit.sneakersColor;
      case 'accessory':
        return currentOutfit.accessoryColor;
      default:
        return '#8b5cf6';
    }
  };

  const getActiveItemFabric = () => {
    switch (activeTab) {
      case 'top':
        return currentOutfit.topFabric;
      case 'outerwear':
        return currentOutfit.outerwearFabric;
      case 'pants':
        return currentOutfit.pantsFabric;
      default:
        return 'cotton';
    }
  };

  const handleColorChange = (color: string) => {
    playClickSound();
    switch (activeTab) {
      case 'top':
        onUpdateTopColor(color);
        break;
      case 'outerwear':
        onUpdateOuterwearColor(color);
        break;
      case 'pants':
        onUpdatePantsColor(color);
        break;
      case 'sneakers':
        onUpdateSneakersColor(color);
        break;
      case 'accessory':
        onUpdateAccessoryColor(color);
        break;
    }
  };

  const handleFabricChange = (fabric: FabricType) => {
    playClickSound();
    switch (activeTab) {
      case 'top':
        onUpdateTopFabric(fabric);
        break;
      case 'outerwear':
        onUpdateOuterwearFabric(fabric);
        break;
      case 'pants':
        onUpdatePantsFabric(fabric);
        break;
    }
  };

  const handleItemSelect = (id: string) => {
    playEquipSound();
    switch (activeTab) {
      case 'top':
        onUpdateTop(id);
        break;
      case 'outerwear':
        onUpdateOuterwear(id);
        break;
      case 'pants':
        onUpdatePants(id);
        break;
      case 'sneakers':
        onUpdateSneakers(id);
        break;
      case 'accessory':
        onUpdateAccessory(id);
        break;
    }
  };

  const activeId = getActiveItemId();
  const currentColor = getActiveItemColor();
  const currentFabric = getActiveItemFabric();

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-[960px] px-3 sm:px-4 transition-transform duration-300 ease-out ${
        isCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Tab Handle */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            playClickSound();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-zinc-950/90 hover:bg-zinc-900 border-t border-x border-purple-900/40 text-zinc-300 hover:text-white backdrop-blur-md text-xs font-semibold shadow-2xl transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
              <span>Show Wardrobe</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
              <span>Hide Wardrobe</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-t-2xl shadow-2xl p-3 sm:p-4 text-white">
        {/* Top: Category Tabs */}
        <div className="flex items-center justify-between gap-1 border-b border-zinc-800/80 pb-3 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'top', label: 'Tops / Tees', count: 4 },
              { id: 'outerwear', label: 'Outerwear', count: 5 },
              { id: 'pants', label: 'Pants', count: 4 },
              { id: 'sneakers', label: 'Sneakers', count: 4 },
              { id: 'accessory', label: 'Accessories', count: 4 },
              { id: 'model', label: 'Pose & Avatar', count: 4 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id as DockTab);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-900/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-section buttons (Items, Colors, Fabrics, Prints) */}
          {activeTab !== 'model' && (
            <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-xl border border-zinc-800 shrink-0 ml-2">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveSubSection('items');
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  activeSubSection === 'items'
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Silhouettes
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveSubSection('colors');
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  activeSubSection === 'colors'
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Colors
              </button>
              {(activeTab === 'top' || activeTab === 'outerwear' || activeTab === 'pants') && (
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveSubSection('fabrics');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    activeSubSection === 'fabrics'
                      ? 'bg-purple-600 text-white font-semibold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Fabrics
                </button>
              )}
              {activeTab === 'top' && (
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveSubSection('prints');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    activeSubSection === 'prints'
                      ? 'bg-purple-600 text-white font-semibold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Graphics
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Content Panel */}
        <div className="pt-3">
          {/* 1. SILHOUETTES / ITEMS LIST */}
          {activeTab !== 'model' && activeSubSection === 'items' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[175px] overflow-y-auto pr-1">
              {categoryItems.map((item) => {
                const isSelected = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`flex flex-col text-left p-2.5 rounded-xl border transition-all text-xs relative group cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-900/30'
                        : 'bg-zinc-900/50 hover:bg-zinc-850/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono-tech uppercase text-purple-400/90 font-medium">
                        {item.subType}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
                      )}
                    </div>
                    <span className="font-semibold text-zinc-100 group-hover:text-white line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                      {item.description}
                    </span>
                    {item.priceTag && (
                      <div className="mt-2 text-[10px] font-mono-tech text-zinc-300 font-semibold">
                        {item.priceTag}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. COLORS SELECTOR */}
          {activeTab !== 'model' && activeSubSection === 'colors' && (
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">
                  Streetwear Curated Tones for {activeTab.toUpperCase()}:
                </span>
                {/* Live Custom Color Picker */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                    <Pipette className="w-3.5 h-3.5 text-purple-400" />
                    <span>Custom Hex:</span>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="font-mono-tech text-[11px] uppercase text-purple-300 font-bold">
                      {currentColor}
                    </span>
                  </label>
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="flex flex-wrap items-center gap-2">
                {STREETWEAR_PALETTE.map((swatch) => {
                  const isCurrent = currentColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      onClick={() => handleColorChange(swatch.hex)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-purple-400 bg-purple-950/40 text-white shadow-sm shadow-purple-800'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span className="font-medium text-[11px]">{swatch.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sneakers Extra: Accent Color for Bubble / Sole */}
              {activeTab === 'sneakers' && (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-purple-300 font-medium">
                    Sneaker Bubble / Accent Detail:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {['#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#ffffff', '#121217'].map(
                      (accHex) => (
                        <button
                          key={accHex}
                          onClick={() => {
                            playClickSound();
                            onUpdateSneakersAccentColor(accHex);
                          }}
                          className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                            currentOutfit.sneakersAccentColor === accHex
                              ? 'scale-110 border-white ring-2 ring-purple-500'
                              : 'border-zinc-700 hover:scale-105'
                          }`}
                          style={{ backgroundColor: accHex }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. FABRICS SELECTOR */}
          {activeTab !== 'model' && activeSubSection === 'fabrics' && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 py-1">
              {FABRICS_LIST.map((fab) => {
                const isSelected = currentFabric === fab.id;
                return (
                  <button
                    key={fab.id}
                    onClick={() => handleFabricChange(fab.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-900/30'
                        : 'bg-zinc-900/50 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white mb-0.5">{fab.name}</div>
                    <div className="text-[11px] text-zinc-400">{fab.description}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. GRAPHIC PRINTS (For Tops) */}
          {activeTab === 'top' && activeSubSection === 'prints' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 py-1">
              {GRAPHIC_PRINTS.map((print) => {
                const isSelected = currentOutfit.topGraphic === print.id;
                return (
                  <button
                    key={print.id}
                    onClick={() => {
                      playEquipSound();
                      onUpdateTopGraphic(print.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500 text-white shadow-md'
                        : 'bg-zinc-900/50 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="font-mono-tech text-[11px] text-purple-400 font-bold mb-1">
                      {print.label}
                    </div>
                    <div className="font-semibold text-xs line-clamp-1">{print.name}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 5. POSE & AVATAR MODEL TAB */}
          {activeTab === 'model' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
              {/* Pose Selection */}
              <div>
                <span className="text-xs font-semibold text-zinc-300 mb-2 block">
                  Model Stance & Pose:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'atelier', name: 'Atelier Runway', desc: 'Relaxed runway posture' },
                    { id: 'street', name: 'Street Slouch', desc: 'Casual streetwear stance' },
                    { id: 'dynamic', name: 'Runway Pivot', desc: 'Forward stride angle' },
                    { id: 'arms_folded', name: 'Arms Folded', desc: 'Confident editorial look' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        playClickSound();
                        onUpdateAvatarPose(p.id as OutfitState['avatarPose']);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        currentOutfit.avatarPose === p.id
                          ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                          : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="font-semibold text-xs">{p.name}</div>
                      <div className="text-[10px] text-zinc-400">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Skin Finish */}
              <div>
                <span className="text-xs font-semibold text-zinc-300 mb-2 block">
                  Avatar Mannequin Finish:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mannequin_chrome', name: 'Dark Titanium', hex: '#22222a' },
                    { id: 'mannequin_dark', name: 'Matte Obsidian', hex: '#141418' },
                    { id: 'human_fair', name: 'Fair Tone', hex: '#f3d6c6' },
                    { id: 'human_tan', name: 'Tan Tone', hex: '#c8987b' },
                    { id: 'human_rich', name: 'Bronze Tone', hex: '#5a3d2e' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        playClickSound();
                        onUpdateAvatarSkin(s.id as OutfitState['avatarSkin']);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                        currentOutfit.avatarSkin === s.id
                          ? 'bg-purple-950/40 border-purple-500 text-white'
                          : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: s.hex }}
                      />
                      <span className="text-xs font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
