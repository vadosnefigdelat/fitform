import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraPreset, LightingPreset, OutfitState, StudioSettings } from '../types/wardrobe';
import { AvatarBones, applyAvatarPose, buildAvatar, createSkinMaterial } from './avatarBuilder';
import {
  GarmentMeshes,
  attachAccessory,
  attachOuterwearGarment,
  attachPantsGarment,
  attachSneakers,
  attachTopGarment,
} from './garmentGeometries';
import { getPedestalFloorTexture } from './proceduralTextures';

export interface CameraPresetConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

const CAMERA_PRESETS: Record<CameraPreset, CameraPresetConfig> = {
  full: {
    position: new THREE.Vector3(0, 1.15, 3.3),
    target: new THREE.Vector3(0, 0.95, 0),
  },
  upper: {
    position: new THREE.Vector3(0, 1.38, 1.7),
    target: new THREE.Vector3(0, 1.25, 0),
  },
  lower: {
    position: new THREE.Vector3(0, 0.52, 1.9),
    target: new THREE.Vector3(0, 0.45, 0),
  },
  face: {
    position: new THREE.Vector3(0, 1.58, 1.05),
    target: new THREE.Vector3(0, 1.52, 0),
  },
  back: {
    position: new THREE.Vector3(0, 1.25, -3.2),
    target: new THREE.Vector3(0, 1.0, 0),
  },
};

export class FitformSceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pmremGenerator: THREE.PMREMGenerator;

  // Animation & Loop
  private clock = new THREE.Clock();
  private animFrameId: number | null = null;
  private isDestroyed = false;

  // Lighting rigs
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.PointLight;
  private rimLight1: THREE.DirectionalLight;
  private rimLight2: THREE.DirectionalLight;
  private underglowLight: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;

  // Pedestal & Contact shadow
  private pedestalMesh: THREE.Mesh;
  private floorGridMesh: THREE.GridHelper;
  private contactShadowMesh: THREE.Mesh;

  // Avatar & Garments
  private avatarBones: AvatarBones;
  private skinMaterial: THREE.MeshStandardMaterial;
  private currentTopMesh: GarmentMeshes | null = null;
  private currentOuterwearMesh: GarmentMeshes | null = null;
  private currentPantsMesh: GarmentMeshes | null = null;
  private currentSneakersMesh: GarmentMeshes | null = null;
  private currentAccessoryMesh: GarmentMeshes | null = null;

  // Camera damping state
  private targetCamPos = new THREE.Vector3();
  private currentCamPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();

  // Orbit controls state (custom buttery smooth damping)
  private isPointerDown = false;
  private pointerButton = 0; // 0: left, 2: right
  private lastPointerX = 0;
  private lastPointerY = 0;
  private orbitTheta = 0; // Azimuthal angle around target
  private orbitPhi = Math.PI / 2.15; // Polar angle
  private orbitRadius = 3.3; // Distance from target
  private targetOrbitTheta = 0;
  private targetOrbitPhi = Math.PI / 2.15;
  private targetOrbitRadius = 3.3;

  // Studio Settings
  private settings: StudioSettings = {
    lighting: 'neo_ultraviolet',
    autoRotate: false,
    autoRotateSpeed: 0.8,
    bloomEffect: true,
    gridFloor: true,
    pedestalUnderglow: true,
  };

  constructor(container: HTMLElement, initialOutfit: OutfitState) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07070a);
    this.scene.fog = new THREE.FogExp2(0x07070a, 0.08);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 40);
    this.setCameraPreset('full', true);

    // 3. Renderer with PBR standards
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // For screenshot export
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Room Environment for reflections
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    const envTexture = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;

    // 5. Lighting Rig
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Key Light (Casts soft directional shadow)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(2.5, 4.0, 3.0);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 10;
    const d = 1.8;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    // Fill Light (Soft cool violet fill)
    this.fillLight = new THREE.PointLight(0xa855f7, 1.8, 12);
    this.fillLight.position.set(-3.0, 2.2, 2.5);
    this.scene.add(this.fillLight);

    // Rim Lights for streetwear silhouette contouring
    this.rimLight1 = new THREE.DirectionalLight(0x8b5cf6, 3.2); // Intense ultraviolet rim
    this.rimLight1.position.set(-2.5, 2.8, -2.5);
    this.scene.add(this.rimLight1);

    this.rimLight2 = new THREE.DirectionalLight(0xc084fc, 2.4);
    this.rimLight2.position.set(2.5, 2.5, -2.5);
    this.scene.add(this.rimLight2);

    // Neon Pedestal Underglow
    this.underglowLight = new THREE.PointLight(0xa855f7, 4.5, 3.5);
    this.underglowLight.position.set(0, 0.05, 0);
    this.scene.add(this.underglowLight);

    // 6. Ground Pedestal & Shadow
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const pedestalTexture = getPedestalFloorTexture(maxAnisotropy);
    
    // Circular Runway Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.68, 0.06, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x101017,
      map: pedestalTexture,
      roughness: 0.35,
      metalness: 0.6,
    });
    this.pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    this.pedestalMesh.position.y = -0.03;
    this.pedestalMesh.receiveShadow = true;
    this.scene.add(this.pedestalMesh);

    // Glowing Neon Ring Edge for Pedestal
    const neonRingGeo = new THREE.TorusGeometry(1.64, 0.014, 16, 64);
    const neonRingMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
    });
    const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = 0.005;
    this.scene.add(neonRing);

    // Soft Contact Shadow Plane directly on pedestal
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const radGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    radGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadowMesh.rotation.x = -Math.PI / 2;
    this.contactShadowMesh.position.y = 0.002;
    this.scene.add(this.contactShadowMesh);

    // Cyber Floor Grid
    this.floorGridMesh = new THREE.GridHelper(16, 32, 0x8b5cf6, 0x241d38);
    this.floorGridMesh.position.y = -0.05;
    this.scene.add(this.floorGridMesh);

    // 7. Build Avatar & Initial Outfit
    this.skinMaterial = createSkinMaterial(initialOutfit.avatarSkin);
    this.avatarBones = buildAvatar(this.skinMaterial);
    this.scene.add(this.avatarBones.root);

    this.applyOutfit(initialOutfit);

    // 8. Event Listeners
    this.initEventListeners();

    // 9. Start Render Loop
    this.startLoop();
  }

  // -------------------------------------------------------------
  // INTERACTION & CONTROLS
  // -------------------------------------------------------------

  private initEventListeners() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.pointerButton = e.button;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      dom.setPointerCapture(e.pointerId);
    });

    dom.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;

      const deltaX = e.clientX - this.lastPointerX;
      const deltaY = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (this.pointerButton === 0) {
        // Left drag: Orbit rotation
        this.targetOrbitTheta -= deltaX * 0.008;
        this.targetOrbitPhi = Math.max(
          0.1,
          Math.min(Math.PI / 1.8, this.targetOrbitPhi - deltaY * 0.008)
        );
      } else if (this.pointerButton === 2) {
        // Right drag: Pan target up/down
        this.targetLookAt.y = Math.max(0.2, Math.min(1.8, this.targetLookAt.y + deltaY * 0.004));
      }
    });

    const endPointer = (e: PointerEvent) => {
      this.isPointerDown = false;
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if already released
      }
    };
    dom.addEventListener('pointerup', endPointer);
    dom.addEventListener('pointercancel', endPointer);

    // Prevent context menu on right click pan
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Wheel zoom
    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const zoomDelta = e.deltaY * 0.0025;
        this.targetOrbitRadius = Math.max(0.9, Math.min(5.5, this.targetOrbitRadius + zoomDelta));
      },
      { passive: false }
    );

    // Resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setCameraPreset(preset: CameraPreset, immediate = false) {
    const cfg = CAMERA_PRESETS[preset];
    if (!cfg) return;

    this.targetLookAt.copy(cfg.target);

    // Compute spherical coordinates from target to preset position
    const offset = new THREE.Vector3().subVectors(cfg.position, cfg.target);
    const radius = offset.length();
    const phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));
    const theta = Math.atan2(offset.x, offset.z);

    this.targetOrbitRadius = radius;
    this.targetOrbitPhi = phi;
    this.targetOrbitTheta = theta;

    if (immediate) {
      this.orbitRadius = radius;
      this.orbitPhi = phi;
      this.orbitTheta = theta;
      this.currentLookAt.copy(cfg.target);
      this.updateCameraTransform();
    }
  }

  public resetOrbit() {
    this.setCameraPreset('full');
  }

  public setAvatarRotation(radians: number) {
    this.avatarBones.root.rotation.y = radians;
  }

  private updateCameraTransform() {
    // Convert spherical coordinates back to Cartesian relative to currentLookAt
    const x = this.orbitRadius * Math.sin(this.orbitPhi) * Math.sin(this.orbitTheta);
    const y = this.orbitRadius * Math.cos(this.orbitPhi);
    const z = this.orbitRadius * Math.sin(this.orbitPhi) * Math.cos(this.orbitTheta);

    this.currentCamPos.set(
      this.currentLookAt.x + x,
      this.currentLookAt.y + y,
      this.currentLookAt.z + z
    );

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);
  }

  // -------------------------------------------------------------
  // OUTFIT APPLICATION & UPDATES
  // -------------------------------------------------------------

  public applyOutfit(outfit: OutfitState) {
    // 1. Skin & Pose
    this.updateAvatarSkin(outfit.avatarSkin);
    applyAvatarPose(this.avatarBones, outfit.avatarPose);

    // 2. Tops
    this.currentTopMesh?.dispose();
    this.currentTopMesh = attachTopGarment(
      this.avatarBones,
      outfit.topId,
      outfit.topColor,
      outfit.topFabric,
      outfit.topGraphic
    );

    // 3. Outerwear
    this.currentOuterwearMesh?.dispose();
    this.currentOuterwearMesh = attachOuterwearGarment(
      this.avatarBones,
      outfit.outerwearId,
      outfit.outerwearColor,
      outfit.outerwearFabric
    );

    // 4. Pants
    this.currentPantsMesh?.dispose();
    this.currentPantsMesh = attachPantsGarment(
      this.avatarBones,
      outfit.pantsId,
      outfit.pantsColor,
      outfit.pantsFabric
    );

    // 5. Sneakers
    this.currentSneakersMesh?.dispose();
    this.currentSneakersMesh = attachSneakers(
      this.avatarBones,
      outfit.sneakersId,
      outfit.sneakersColor,
      outfit.sneakersAccentColor
    );

    // 6. Accessories
    this.currentAccessoryMesh?.dispose();
    this.currentAccessoryMesh = attachAccessory(
      this.avatarBones,
      outfit.accessoryId,
      outfit.accessoryColor
    );
  }

  public updateTop(
    topId: string,
    color: string,
    fabric: OutfitState['topFabric'],
    graphic: OutfitState['topGraphic']
  ) {
    this.currentTopMesh?.dispose();
    this.currentTopMesh = attachTopGarment(this.avatarBones, topId, color, fabric, graphic);
  }

  public updateTopColor(color: string) {
    this.currentTopMesh?.updateColor?.(color);
  }

  public updateTopFabric(fabric: OutfitState['topFabric']) {
    this.currentTopMesh?.updateFabric?.(fabric);
  }

  public updateTopGraphic(graphic: OutfitState['topGraphic']) {
    this.currentTopMesh?.updateGraphic?.(graphic);
  }

  public updateOuterwear(outerwearId: string, color: string, fabric: OutfitState['outerwearFabric']) {
    this.currentOuterwearMesh?.dispose();
    this.currentOuterwearMesh = attachOuterwearGarment(
      this.avatarBones,
      outerwearId,
      color,
      fabric
    );
  }

  public updateOuterwearColor(color: string) {
    this.currentOuterwearMesh?.updateColor?.(color);
  }

  public updateOuterwearFabric(fabric: OutfitState['outerwearFabric']) {
    this.currentOuterwearMesh?.updateFabric?.(fabric);
  }

  public updatePants(pantsId: string, color: string, fabric: OutfitState['pantsFabric']) {
    this.currentPantsMesh?.dispose();
    this.currentPantsMesh = attachPantsGarment(this.avatarBones, pantsId, color, fabric);
  }

  public updatePantsColor(color: string) {
    this.currentPantsMesh?.updateColor?.(color);
  }

  public updatePantsFabric(fabric: OutfitState['pantsFabric']) {
    this.currentPantsMesh?.updateFabric?.(fabric);
  }

  public updateSneakers(sneakersId: string, color: string, accentColor: string) {
    this.currentSneakersMesh?.dispose();
    this.currentSneakersMesh = attachSneakers(this.avatarBones, sneakersId, color, accentColor);
  }

  public updateSneakersColor(color: string) {
    this.currentSneakersMesh?.updateColor?.(color);
  }

  public updateAccessory(accessoryId: string, color: string) {
    this.currentAccessoryMesh?.dispose();
    this.currentAccessoryMesh = attachAccessory(this.avatarBones, accessoryId, color);
  }

  public updateAccessoryColor(color: string) {
    this.currentAccessoryMesh?.updateColor?.(color);
  }

  public updateAvatarSkin(skinType: OutfitState['avatarSkin']) {
    const newMat = createSkinMaterial(skinType);
    this.avatarBones.skinMeshes.forEach((mesh) => {
      mesh.material = newMat;
    });
    this.skinMaterial.dispose();
    this.skinMaterial = newMat;
  }

  public updateAvatarPose(pose: OutfitState['avatarPose']) {
    applyAvatarPose(this.avatarBones, pose);
  }

  // -------------------------------------------------------------
  // STUDIO SETTINGS & LIGHTING
  // -------------------------------------------------------------

  public setStudioSettings(settings: Partial<StudioSettings>) {
    this.settings = { ...this.settings, ...settings };

    if (settings.lighting) {
      this.applyLightingPreset(settings.lighting);
    }
    if (settings.gridFloor !== undefined) {
      this.floorGridMesh.visible = settings.gridFloor;
    }
    if (settings.pedestalUnderglow !== undefined) {
      this.underglowLight.visible = settings.pedestalUnderglow;
    }
  }

  private applyLightingPreset(preset: LightingPreset) {
    if (preset === 'neo_ultraviolet') {
      this.scene.background = new THREE.Color(0x07070a);
      this.keyLight.color.set(0xffffff);
      this.keyLight.intensity = 2.2;
      this.fillLight.color.set(0x8b5cf6);
      this.fillLight.intensity = 2.4;
      this.rimLight1.color.set(0xa855f7);
      this.rimLight1.intensity = 3.6;
      this.rimLight2.color.set(0xc084fc);
      this.rimLight2.intensity = 2.8;
      this.underglowLight.color.set(0xa855f7);
      this.renderer.toneMappingExposure = 1.15;
    } else if (preset === 'dark_atelier') {
      this.scene.background = new THREE.Color(0x040406);
      this.keyLight.color.set(0xf5f3ef);
      this.keyLight.intensity = 2.6;
      this.fillLight.color.set(0x404040);
      this.fillLight.intensity = 1.0;
      this.rimLight1.color.set(0xffffff);
      this.rimLight1.intensity = 2.0;
      this.rimLight2.color.set(0x8b5cf6);
      this.rimLight2.intensity = 1.5;
      this.underglowLight.color.set(0x7c3aed);
      this.renderer.toneMappingExposure = 1.05;
    } else if (preset === 'cyber_runway') {
      this.scene.background = new THREE.Color(0x050508);
      this.keyLight.color.set(0x06b6d4); // Cyan key
      this.keyLight.intensity = 2.0;
      this.fillLight.color.set(0xec4899); // Magenta fill
      this.fillLight.intensity = 2.6;
      this.rimLight1.color.set(0xa855f7);
      this.rimLight1.intensity = 4.0;
      this.rimLight2.color.set(0x06b6d4);
      this.rimLight2.intensity = 3.2;
      this.underglowLight.color.set(0xec4899);
      this.renderer.toneMappingExposure = 1.25;
    } else if (preset === 'golden_hour') {
      this.scene.background = new THREE.Color(0x0a0708);
      this.keyLight.color.set(0xfbbf24); // Warm golden amber
      this.keyLight.intensity = 2.8;
      this.fillLight.color.set(0x7c3aed);
      this.fillLight.intensity = 1.8;
      this.rimLight1.color.set(0xf59e0b);
      this.rimLight1.intensity = 3.0;
      this.rimLight2.color.set(0x9333ea);
      this.rimLight2.intensity = 2.0;
      this.underglowLight.color.set(0xf59e0b);
      this.renderer.toneMappingExposure = 1.2;
    }
  }

  // -------------------------------------------------------------
  // SCREENSHOT / HIGH-RES EXPORT
  // -------------------------------------------------------------

  public captureSnapshot(width = 1920, height = 1080): string {
    const originalWidth = this.container.clientWidth;
    const originalHeight = this.container.clientHeight;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    // Restore original size
    this.renderer.setSize(originalWidth, originalHeight);
    this.camera.aspect = originalWidth / originalHeight;
    this.camera.updateProjectionMatrix();

    return dataUrl;
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP & SMOOTH DAMPING
  // -------------------------------------------------------------

  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Auto rotation
      if (this.settings.autoRotate && !this.isPointerDown) {
        this.targetOrbitTheta += this.settings.autoRotateSpeed * delta * 0.8;
      }

      // Smooth exponential damping on orbit spherical parameters
      this.orbitTheta = THREE.MathUtils.damp(this.orbitTheta, this.targetOrbitTheta, 12, delta);
      this.orbitPhi = THREE.MathUtils.damp(this.orbitPhi, this.targetOrbitPhi, 12, delta);
      this.orbitRadius = THREE.MathUtils.damp(this.orbitRadius, this.targetOrbitRadius, 10, delta);

      // Smooth look-at target damping
      this.currentLookAt.x = THREE.MathUtils.damp(
        this.currentLookAt.x,
        this.targetLookAt.x,
        10,
        delta
      );
      this.currentLookAt.y = THREE.MathUtils.damp(
        this.currentLookAt.y,
        this.targetLookAt.y,
        10,
        delta
      );
      this.currentLookAt.z = THREE.MathUtils.damp(
        this.currentLookAt.z,
        this.targetLookAt.z,
        10,
        delta
      );

      this.updateCameraTransform();

      // Render
      this.renderer.render(this.scene, this.camera);

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    window.removeEventListener('resize', this.onWindowResize);

    this.currentTopMesh?.dispose();
    this.currentOuterwearMesh?.dispose();
    this.currentPantsMesh?.dispose();
    this.currentSneakersMesh?.dispose();
    this.currentAccessoryMesh?.dispose();

    this.skinMaterial.dispose();
    this.pmremGenerator.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
