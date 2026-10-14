import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Download, Share2, Sparkles, X } from 'lucide-react';
import { GARMENT_ITEMS } from '../data/wardrobeItems';
import { OutfitState } from '../types/wardrobe';
import { playClickSound, playShutterSound } from '../utils/audioFX';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOutfit: OutfitState;
  onCaptureImage: () => string;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  currentOutfit,
  onCaptureImage,
}) => {
  const [compositeDataUrl, setCompositeDataUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCompositeDataUrl(null);
      return;
    }

    playShutterSound();

    // Grab raw high-res 3D capture from WebGL canvas
    const rawImage = onCaptureImage();
    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      // Create high-res composite lookbook card (1200 x 1500 portrait)
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d')!;

      // Dark background
      ctx.fillStyle = '#08080d';
      ctx.fillRect(0, 0, 1200, 1500);

      // Draw 3D avatar centered
      ctx.drawImage(img, 0, 80, 1200, 1240);

      // Gradient overlay at top and bottom for typography readability
      const topGrad = ctx.createLinearGradient(0, 0, 0, 260);
      topGrad.addColorStop(0, 'rgba(8, 8, 13, 0.95)');
      topGrad.addColorStop(0.7, 'rgba(8, 8, 13, 0.6)');
      topGrad.addColorStop(1, 'rgba(8, 8, 13, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1200, 260);

      const botGrad = ctx.createLinearGradient(0, 1150, 0, 1500);
      botGrad.addColorStop(0, 'rgba(8, 8, 13, 0)');
      botGrad.addColorStop(0.35, 'rgba(8, 8, 13, 0.85)');
      botGrad.addColorStop(1, 'rgba(8, 8, 13, 0.98)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 1150, 1200, 350);

      // Top Editorial Brand Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Space Grotesk", sans-serif';
      ctx.fillText('FITFORM', 60, 95);

      ctx.fillStyle = '#a855f7';
      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.fillText('ATELIER LOOKBOOK // STREETWEAR ARCHIVE', 60, 135);

      ctx.fillStyle = '#71717a';
      ctx.font = '500 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`CAPTURE: ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}`, 1140, 95);
      ctx.fillText('35.6762° N // 139.6503° E', 1140, 125);
      ctx.textAlign = 'left';

      // Outer accent frame borders
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 1140, 1440);

      // Bottom Outfit Formula Breakdown
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 36px "Space Grotesk", sans-serif';
      ctx.fillText(currentOutfit.name.toUpperCase(), 60, 1280);

      const topName = GARMENT_ITEMS.find((g) => g.id === currentOutfit.topId)?.name || 'Top';
      const outerName = GARMENT_ITEMS.find((g) => g.id === currentOutfit.outerwearId)?.name || 'None';
      const pantsName = GARMENT_ITEMS.find((g) => g.id === currentOutfit.pantsId)?.name || 'Pants';
      const shoeName = GARMENT_ITEMS.find((g) => g.id === currentOutfit.sneakersId)?.name || 'Sneakers';

      // Item tags
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 18px "JetBrains Mono", monospace';
      ctx.fillText(`TOP: [ ${topName} ]`, 60, 1330);
      if (currentOutfit.outerwearId !== 'outer-none') {
        ctx.fillText(`OUTER: [ ${outerName} ]`, 60, 1365);
      }
      ctx.fillText(`PANTS: [ ${pantsName} ]`, 60, 1400);
      ctx.fillText(`KICKS: [ ${shoeName} ]`, 60, 1435);

      // Swatches on bottom right
      const colors = [
        currentOutfit.topColor,
        currentOutfit.outerwearId !== 'outer-none' ? currentOutfit.outerwearColor : null,
        currentOutfit.pantsColor,
        currentOutfit.sneakersColor,
      ].filter(Boolean) as string[];

      colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(1100 - (colors.length - 1 - idx) * 45, 1400, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      setCompositeDataUrl(canvas.toDataURL('image/png'));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!compositeDataUrl) return;
    playClickSound();
    const a = document.createElement('a');
    a.href = compositeDataUrl;
    a.download = `fitform_${currentOutfit.name.toLowerCase().replace(/\s+/g, '_')}_lookbook.png`;
    a.click();
  };

  const handleCopyFormula = () => {
    playClickSound();
    const outerLabel =
      currentOutfit.outerwearId && currentOutfit.outerwearId !== 'outer-none'
        ? `${currentOutfit.outerwearId} (${currentOutfit.outerwearColor})`
        : 'None';
    const formula = `FITFORM // ${currentOutfit.name}\n- Top: ${currentOutfit.topId} (${currentOutfit.topColor})\n- Outerwear: ${outerLabel}\n- Pants: ${currentOutfit.pantsId} (${currentOutfit.pantsColor})\n- Kicks: ${currentOutfit.sneakersId}`;
    navigator.clipboard.writeText(formula);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-purple-900/50 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden glow-purple-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-bold text-base text-white">
              Lookbook Capture Studio
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-black/50">
          {compositeDataUrl ? (
            <img
              src={compositeDataUrl}
              alt="FITFORM Lookbook"
              className="max-h-[58vh] rounded-xl border border-purple-900/40 shadow-2xl object-contain"
            />
          ) : (
            <div className="py-24 text-zinc-500 font-mono-tech text-xs animate-pulse">
              RENDERING RUNWAY RESOLUTION...
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-850 flex items-center justify-between gap-3 bg-zinc-900/50">
          <button
            onClick={handleCopyFormula}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            <span>{isCopied ? 'Formula Copied!' : 'Copy Fit Spec'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!compositeDataUrl}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
