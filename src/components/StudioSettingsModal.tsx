import React from 'react';
import { Sliders, Sun, X, Zap } from 'lucide-react';
import { LightingPreset, StudioSettings } from '../types/wardrobe';
import { playClickSound } from '../utils/audioFX';

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
}

export const StudioSettingsModal: React.FC<StudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const lightingPresets: { id: LightingPreset; name: string; desc: string; tone: string }[] = [
    {
      id: 'neo_ultraviolet',
      name: 'Neo Ultraviolet',
      desc: 'FITFORM signature deep violet rim lights and cyber aesthetic',
      tone: '#8b5cf6',
    },
    {
      id: 'dark_atelier',
      name: 'Dark Noir Atelier',
      desc: 'High-contrast monochrome studio lighting with soft specular highlights',
      tone: '#e4e4e7',
    },
    {
      id: 'cyber_runway',
      name: 'Cyber Runway',
      desc: 'Dual-tone neon cyan & magenta split lighting',
      tone: '#06b6d4',
    },
    {
      id: 'golden_hour',
      name: 'Golden Hour Atelier',
      desc: 'Warm amber rim light with dusk violet ambiance',
      tone: '#f59e0b',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-purple-900/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden glow-purple-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Studio Atmosphere</h3>
              <p className="text-xs text-zinc-400 font-mono-tech">
                Lighting rigs, stage platform & turntable
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Lighting Presets */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2.5">
              Runway Lighting Rig:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lightingPresets.map((preset) => {
                const isSelected = settings.lighting === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      playClickSound();
                      onUpdateSettings({ lighting: preset.id });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm shadow-purple-900/30'
                        : 'bg-zinc-900/50 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset.tone }}
                      />
                      <span className="font-semibold text-xs text-white">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Turntable Auto-Rotate Speed */}
          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">
                Turntable 360° Spin Speed:
              </span>
              <span className="text-xs font-mono-tech text-purple-400 font-bold">
                {settings.autoRotateSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={settings.autoRotateSpeed}
              onChange={(e) => {
                onUpdateSettings({ autoRotateSpeed: parseFloat(e.target.value) });
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Stage Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                playClickSound();
                onUpdateSettings({ gridFloor: !settings.gridFloor });
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.gridFloor
                  ? 'bg-purple-950/30 border-purple-500 text-purple-200'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="text-xs font-semibold">Cyber Stage Grid</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {settings.gridFloor ? 'Visible' : 'Hidden'}
              </div>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onUpdateSettings({ pedestalUnderglow: !settings.pedestalUnderglow });
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.pedestalUnderglow
                  ? 'bg-purple-950/30 border-purple-500 text-purple-200'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="text-xs font-semibold">Neon Underglow</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {settings.pedestalUnderglow ? 'Active' : 'Disabled'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
