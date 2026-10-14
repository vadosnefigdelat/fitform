import * as THREE from 'three';
import { FabricType, GraphicPrintId } from '../types/wardrobe';

// Cache generated textures so we don't recreate them needlessly
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates or retrieves a procedural graphic print texture for tees/hoodies
 */
export function getProceduralGraphicTexture(
  graphicId: GraphicPrintId,
  rendererMaxAnisotropy = 4
): THREE.CanvasTexture | null {
  if (graphicId === 'none') return null;

  const key = `graphic_${graphicId}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, 1024, 1024);

  // Center coordinate
  const cx = 512;
  const cy = 460; // Slightly higher on chest

  ctx.save();

  if (graphicId === 'fitform_cyber') {
    // FITFORM Cyber Monogram
    // Outer cyber bounding box
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)';
    ctx.lineWidth = 6;
    ctx.strokeRect(cx - 240, cy - 180, 480, 360);

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - 270, cy);
    ctx.lineTo(cx - 240, cy);
    ctx.moveTo(cx + 240, cy);
    ctx.lineTo(cx + 270, cy);
    ctx.moveTo(cx, cy - 210);
    ctx.lineTo(cx, cy - 180);
    ctx.moveTo(cx, cy + 180);
    ctx.lineTo(cx, cy + 210);
    ctx.stroke();

    // Brand text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FITFORM', cx, cy - 50);

    // Subtitle
    ctx.fillStyle = '#a855f7';
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillText('ATELIER // PROTO-01', cx, cy + 15);

    // Barcode / Tech specs
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText('LAT: 35.6762° N // LNG: 139.6503° E', cx, cy + 60);

    // Barcode lines
    const barY = cy + 100;
    for (let i = 0; i < 36; i++) {
      const w = (i % 3 === 0) ? 6 : (i % 2 === 0 ? 3 : 2);
      ctx.fillRect(cx - 180 + i * 10, barY, w, 32);
    }
  } else if (graphicId === 'tokyo_acid') {
    // Tokyo Acid Grid
    // Acid Purple circular badge
    const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 220);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
    grad.addColorStop(0.7, 'rgba(124, 58, 237, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.fill();

    // Bold Japanese typography
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 130px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('東京', cx, cy - 30);

    // Cyber acid banner
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(cx - 190, cy + 80, 380, 48);

    ctx.fillStyle = '#08080c';
    ctx.font = '800 28px "Space Grotesk", sans-serif';
    ctx.fillText('NEO ACID 2088', cx, cy + 104);
  } else if (graphicId === 'null_void') {
    // NULL // VOID Distressed streetwear
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NULL // VOID', cx, cy - 30);

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx - 220, cy + 30);
    ctx.lineTo(cx + 220, cy + 30);
    ctx.stroke();

    ctx.fillStyle = '#a855f7';
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillText('SYSTEM DESYNCHRONIZED', cx, cy + 70);
  } else if (graphicId === 'minimal_box') {
    // Minimal Box Logo
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(cx - 180, cy - 50, 360, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FITFORM', cx, cy);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 180, cy - 50, 360, 100);
  } else if (graphicId === 'kanji_atelier') {
    // Kanji Atelier
    ctx.fillStyle = '#a855f7';
    ctx.font = '900 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('サイバー', cx, cy - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('FITFORM VIRTUAL COUTURE', cx, cy + 60);

    // Subtle corner brackets
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4;
    const s = 180;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s + 30);
    ctx.lineTo(cx - s, cy - s);
    ctx.lineTo(cx - s + 30, cy - s);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(cx + s, cy + s - 30);
    ctx.lineTo(cx + s, cy + s);
    ctx.lineTo(cx + s - 30, cy + s);
    ctx.stroke();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = rendererMaxAnisotropy;
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates procedural normal/bump maps for different fabrics
 */
export function getProceduralFabricBumpTexture(fabric: FabricType): THREE.CanvasTexture {
  const key = `bump_${fabric}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  if (fabric === 'cotton') {
    // Fine woven cotton cross pattern
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4;
        const wave = Math.sin(x * 0.8) * Math.sin(y * 0.8) * 18;
        const noise = (Math.random() - 0.5) * 12;
        const val = Math.min(255, Math.max(0, 128 + wave + noise));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (fabric === 'denim') {
    // 45-degree diagonal twill lines
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4;
        const twill = Math.sin((x + y) * 1.2) * 26;
        const noise = (Math.random() - 0.5) * 16;
        const val = Math.min(255, Math.max(0, 128 + twill + noise));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (fabric === 'techwear') {
    // Ripstop micro grid
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    const step = 16;
    for (let x = 0; x <= 256; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  } else if (fabric === 'nylon') {
    // Smooth fine tech weave
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4;
        const subtle = Math.sin(x * 1.5) * 8 + (Math.random() - 0.5) * 6;
        const val = Math.min(255, Math.max(0, 128 + subtle));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (fabric === 'leather') {
    // Organic cellular grain
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const i = (y * 256 + x) * 4;
        const cell = (Math.sin(x * 0.4 + y * 0.3) * Math.cos(x * 0.2 - y * 0.4)) * 22;
        const noise = (Math.random() - 0.5) * 14;
        const val = Math.min(255, Math.max(0, 128 + cell + noise));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(fabric === 'techwear' ? 12 : 8, fabric === 'techwear' ? 12 : 8);
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}

/**
 * Creates the sleek futuristic circular floor pedestal texture
 */
export function getPedestalFloorTexture(rendererMaxAnisotropy = 4): THREE.CanvasTexture {
  const key = 'pedestal_floor';
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark studio floor
  ctx.fillStyle = '#09090e';
  ctx.fillRect(0, 0, 1024, 1024);

  const cx = 512;
  const cy = 512;

  // Concentric neon rings
  const rings = [
    { r: 470, color: 'rgba(168, 85, 247, 0.4)', w: 3 },
    { r: 430, color: 'rgba(124, 58, 237, 0.25)', w: 1.5 },
    { r: 350, color: 'rgba(168, 85, 247, 0.5)', w: 2 },
    { r: 240, color: 'rgba(255, 255, 255, 0.15)', w: 1 },
    { r: 120, color: 'rgba(168, 85, 247, 0.6)', w: 2.5 },
  ];

  rings.forEach((ring) => {
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Degree ticks around the outer ring
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.lineWidth = 1.5;
  for (let deg = 0; deg < 360; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const length = deg % 30 === 0 ? 18 : (deg % 10 === 0 ? 10 : 5);
    const r1 = 470;
    const r2 = r1 - length;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.lineTo(cx + Math.cos(rad) * r2, cy + Math.sin(rad) * r2);
    ctx.stroke();
  }

  // Streetwear Atelier markings
  ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText('FITFORM // 3D FASHION ATELIER', cx, cy - 390);
  ctx.fillText('PRECISION RUNWAY SCALE 1:1', cx, cy + 390);

  // Center crosshair
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy);
  ctx.lineTo(cx + 30, cy);
  ctx.moveTo(cx, cy - 30);
  ctx.lineTo(cx, cy + 30);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = rendererMaxAnisotropy;
  texture.needsUpdate = true;

  textureCache.set(key, texture);
  return texture;
}
