import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BookmarkCheck,
  Check,
  Copy,
  FolderHeart,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { CURATED_OUTFITS, GARMENT_ITEMS } from '../data/wardrobeItems';
import { OutfitState } from '../types/wardrobe';
import { playClickSound, playEquipSound } from '../utils/audioFX';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfit: OutfitState;
  savedOutfits: OutfitState[];
  onSaveOutfit: (name: string) => void;
  onLoadOutfit: (outfit: OutfitState) => void;
  onDeleteOutfit: (id: string) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  currentOutfit,
  savedOutfits,
  onSaveOutfit,
  onLoadOutfit,
  onDeleteOutfit,
}) => {
  const [newFitName, setNewFitName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_fits' | 'curated'>('my_fits');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFitName.trim() || `Fit #${savedOutfits.length + 1}`;
    onSaveOutfit(name);
    setNewFitName('');
    setSaveSuccess(true);
    playEquipSound();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#a855f7', '#8b5cf6', '#c084fc', '#ffffff'],
      });
    } catch {
      // Ignore
    }

    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getItemName = (id: string) => {
    const item = GARMENT_ITEMS.find((g) => g.id === id);
    return item ? item.name : id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-purple-900/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden glow-purple-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Wardrobe Lookbook</h2>
              <p className="text-xs text-zinc-400 font-mono-tech">
                Save, load, and manage your custom streetwear fits
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Outfit Section */}
        <div className="p-5 border-b border-zinc-850 bg-zinc-900/40">
          <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Name this fit (e.g., Shibuya Acid Bomber)..."
                value={newFitName}
                onChange={(e) => setNewFitName(e.target.value)}
                maxLength={36}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-purple-900/40 shrink-0 cursor-pointer active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Save Current Fit</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tab switch (My Saved Fits vs Curated Editorial) */}
        <div className="flex border-b border-zinc-850 px-5 pt-3 gap-4">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('my_fits');
            }}
            className={`pb-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'my_fits'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            My Custom Fits ({savedOutfits.length})
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('curated');
            }}
            className={`pb-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'curated'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            FITFORM Atelier Archive ({CURATED_OUTFITS.length})
          </button>
        </div>

        {/* Fits List Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeTab === 'my_fits' && savedOutfits.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              <FolderHeart className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
              <p className="font-semibold text-zinc-400">No saved outfits yet</p>
              <p className="mt-1">Style your avatar and click "Save Current Fit" above.</p>
            </div>
          )}

          {activeTab === 'my_fits' &&
            savedOutfits.map((fit) => (
              <div
                key={fit.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{fit.name}</span>
                    <span className="text-[10px] font-mono-tech text-zinc-500">
                      {new Date(fit.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Garments breakdown */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {getItemName(fit.topId)}
                    </span>
                    {fit.outerwearId !== 'outer-none' && (
                      <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        {getItemName(fit.outerwearId)}
                      </span>
                    )}
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {getItemName(fit.pantsId)}
                    </span>
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {getItemName(fit.sneakersId)}
                    </span>
                  </div>

                  {/* Swatch dots */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: fit.topColor }}
                      title="Top Color"
                    />
                    {fit.outerwearId !== 'outer-none' && (
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: fit.outerwearColor }}
                        title="Outerwear Color"
                      />
                    )}
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: fit.pantsColor }}
                      title="Pants Color"
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: fit.sneakersColor }}
                      title="Sneakers Color"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      playEquipSound();
                      onLoadOutfit(fit);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow cursor-pointer active:scale-95"
                  >
                    Equip Fit
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onDeleteOutfit(fit.id);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Delete outfit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

          {/* Curated Archive */}
          {activeTab === 'curated' &&
            CURATED_OUTFITS.map((fit) => (
              <div
                key={fit.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-purple-900/30 bg-purple-950/15 hover:bg-purple-950/30 transition-all gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-sm text-white">{fit.name}</span>
                    <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                      ARCHIVE LOOK
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {getItemName(fit.topId)}
                    </span>
                    {fit.outerwearId !== 'outer-none' && (
                      <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
                        {getItemName(fit.outerwearId)}
                      </span>
                    )}
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {getItemName(fit.pantsId)}
                    </span>
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {getItemName(fit.sneakersId)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playEquipSound();
                    onLoadOutfit(fit);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all self-end sm:self-center cursor-pointer active:scale-95"
                >
                  Load Curated Fit
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
