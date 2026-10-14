import React from 'react';
import {
  Camera,
  Compass,
  Dices,
  Eye,
  FolderHeart,
  RotateCw,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CameraPreset, OutfitState, StudioSettings } from '../types/wardrobe';
import { playClickSound } from '../utils/audioFX';

interface TopNavProps {
  currentOutfit: OutfitState;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  activeCameraPreset: CameraPreset;
  onRollFit: () => void;
  onOpenLookbook: () => void;
  onOpenSnapshot: () => void;
  onOpenStudio: () => void;
  studioSettings: StudioSettings;
  onToggleAutoRotate: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  savedOutfitsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentOutfit,
  onSelectCameraPreset,
  activeCameraPreset,
  onRollFit,
  onOpenLookbook,
  onOpenSnapshot,
  onOpenStudio,
  studioSettings,
  onToggleAutoRotate,
  soundEnabled,
  onToggleSound,
  savedOutfitsCount,
}) => {
  const cameraPresets: { id: CameraPreset; label: string }[] = [
    { id: 'full', label: 'Full Fit' },
    { id: 'upper', label: 'Torso' },
    { id: 'lower', label: 'Kicks' },
    { id: 'face', label: 'Profile' },
    { id: 'back', label: 'Back' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Brand & Active Fit Badge */}
      <div className="flex items-center gap-3.5 pointer-events-auto">
        <div className="flex items-center gap-2.5 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-purple-900/40 glow-purple-sm shadow-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center font-black text-sm tracking-tighter text-white shadow-inner">
            FF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold tracking-wider text-base text-white">
                FITFORM
              </span>
              <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                v2.6 3D
              </span>
            </div>
            <p className="text-[10px] font-mono-tech text-zinc-400 tracking-wide uppercase">
              Virtual Atelier // {currentOutfit.name}
            </p>
          </div>
        </div>

        {/* Roll Fit (Randomizer) */}
        <button
          onClick={() => {
            playClickSound();
            onRollFit();
          }}
          className="flex items-center gap-1.5 bg-zinc-900/80 hover:bg-purple-950/80 text-zinc-200 hover:text-white px-3 py-2 rounded-xl border border-zinc-800 hover:border-purple-500/50 backdrop-blur-md transition-all text-xs font-semibold shadow-lg group active:scale-95"
          title="Generate a randomized cohesive streetwear outfit"
        >
          <Dices className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Roll Fit</span>
        </button>
      </div>

      {/* Center: Camera Presets Bar */}
      <div className="pointer-events-auto flex items-center bg-black/80 backdrop-blur-md px-1.5 py-1.5 rounded-xl border border-zinc-800/80 shadow-2xl">
        <div className="flex items-center gap-1">
          {cameraPresets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                playClickSound();
                onSelectCameraPreset(p.id);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                activeCameraPreset === p.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-zinc-800 mx-1.5" />

        {/* 360 Auto-Rotate */}
        <button
          onClick={() => {
            playClickSound();
            onToggleAutoRotate();
          }}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            studioSettings.autoRotate
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Toggle 360° turntable rotation"
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${
              studioSettings.autoRotate ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
          />
        </button>
      </div>

      {/* Right: Studio Settings, Lookbook, Snapshot, Sound */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Studio Lighting & Backdrop */}
        <button
          onClick={() => {
            playClickSound();
            onOpenStudio();
          }}
          className="flex items-center gap-1.5 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white px-2.5 py-2 rounded-xl border border-zinc-800/80 backdrop-blur-md transition-all text-xs font-medium shadow-lg"
          title="Lighting, Mannequin & Stage Settings"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Studio</span>
        </button>

        {/* Saved Lookbook */}
        <button
          onClick={() => {
            playClickSound();
            onOpenLookbook();
          }}
          className="relative flex items-center gap-1.5 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white px-2.5 py-2 rounded-xl border border-zinc-800/80 backdrop-blur-md transition-all text-xs font-medium shadow-lg"
          title="Saved Wardrobe Outfits"
        >
          <FolderHeart className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Lookbook</span>
          {savedOutfitsCount > 0 && (
            <span className="bg-purple-600 text-white font-mono-tech text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {savedOutfitsCount}
            </span>
          )}
        </button>

        {/* Capture Snapshot */}
        <button
          onClick={() => {
            playClickSound();
            onOpenSnapshot();
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-2 rounded-xl shadow-lg shadow-purple-900/30 font-semibold text-xs transition-all active:scale-95"
          title="Capture High-Res Lookbook Photo"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Capture Fit</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            onToggleSound();
          }}
          className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80 backdrop-blur-md transition-colors"
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  );
};
