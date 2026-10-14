import * as THREE from 'three';
import { FabricType, GraphicPrintId } from '../types/wardrobe';
import { AvatarBones } from './avatarBuilder';
import { getProceduralFabricBumpTexture, getProceduralGraphicTexture } from './proceduralTextures';

/**
 * Creates PBR material for garments based on color, fabric type, and optional graphic
 */
export function createGarmentMaterial(
  colorHex: string,
  fabric: FabricType,
  graphicId?: GraphicPrintId
): { bodyMat: THREE.MeshStandardMaterial; graphicMat?: THREE.MeshStandardMaterial } {
  const color = new THREE.Color(colorHex);
  const bumpMap = getProceduralFabricBumpTexture(fabric);

  let roughness = 0.85;
  let metalness = 0.05;
  let bumpScale = 0.003;

  if (fabric === 'cotton') {
    roughness = 0.88;
    metalness = 0.02;
    bumpScale = 0.004;
  } else if (fabric === 'nylon') {
    roughness = 0.28;
    metalness = 0.15;
    bumpScale = 0.002;
  } else if (fabric === 'denim') {
    roughness = 0.78;
    metalness = 0.04;
    bumpScale = 0.006;
  } else if (fabric === 'techwear') {
    roughness = 0.45;
    metalness = 0.12;
    bumpScale = 0.005;
  } else if (fabric === 'leather') {
    roughness = 0.35;
    metalness = 0.08;
    bumpScale = 0.003;
  }

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    bumpMap,
    bumpScale,
    side: THREE.DoubleSide,
  });

  let graphicMat: THREE.MeshStandardMaterial | undefined = undefined;
  if (graphicId && graphicId !== 'none') {
    const graphicTex = getProceduralGraphicTexture(graphicId);
    if (graphicTex) {
      graphicMat = new THREE.MeshStandardMaterial({
        map: graphicTex,
        transparent: true,
        opacity: 0.95,
        roughness: 0.6,
        metalness: 0.1,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
    }
  }

  return { bodyMat, graphicMat };
}

/**
 * Updates an existing garment MeshStandardMaterial with PBR parameters for the selected fabric
 */
export function applyFabricProperties(mat: THREE.MeshStandardMaterial, fabric: FabricType) {
  mat.bumpMap = getProceduralFabricBumpTexture(fabric);
  if (fabric === 'cotton') {
    mat.roughness = 0.88;
    mat.metalness = 0.02;
    mat.bumpScale = 0.004;
  } else if (fabric === 'nylon') {
    mat.roughness = 0.28;
    mat.metalness = 0.15;
    mat.bumpScale = 0.002;
  } else if (fabric === 'denim') {
    mat.roughness = 0.78;
    mat.metalness = 0.04;
    mat.bumpScale = 0.006;
  } else if (fabric === 'techwear') {
    mat.roughness = 0.45;
    mat.metalness = 0.12;
    mat.bumpScale = 0.005;
  } else if (fabric === 'leather') {
    mat.roughness = 0.35;
    mat.metalness = 0.08;
    mat.bumpScale = 0.003;
  } else {
    mat.roughness = 0.85;
    mat.metalness = 0.05;
    mat.bumpScale = 0.003;
  }
  mat.needsUpdate = true;
}

// -------------------------------------------------------------
// GARMENT BUILDERS
// -------------------------------------------------------------

export interface GarmentMeshes {
  group: THREE.Group;
  category: string;
  updateColor?: (newColor: string) => void;
  updateFabric?: (newFabric: FabricType) => void;
  updateGraphic?: (newGraphic: GraphicPrintId) => void;
  dispose: () => void;
}

/**
 * Builds and attaches a T-shirt or tank top
 */
export function attachTopGarment(
  bones: AvatarBones,
  itemId: string,
  color: string,
  fabric: FabricType,
  graphicId: GraphicPrintId = 'none'
): GarmentMeshes {
  const container = new THREE.Group();
  container.name = `Top_${itemId}`;

  const { bodyMat, graphicMat } = createGarmentMaterial(color, fabric, graphicId);

  // Ribbed collar / trim material (slightly darker/contrast)
  const collarMat = bodyMat.clone();
  collarMat.roughness = 0.95;

  const createdMeshes: THREE.Mesh[] = [];

  // Graphic chest plane
  let graphicMesh: THREE.Mesh | null = null;
  if (graphicMat && itemId !== 'tee-tank') {
    const graphicGeo = new THREE.PlaneGeometry(0.24, 0.24);
    graphicMesh = new THREE.Mesh(graphicGeo, graphicMat);
    graphicMesh.position.set(0, 0.12, 0.155); // Front chest
    bones.chest.add(graphicMesh);
    createdMeshes.push(graphicMesh);
  }

  if (itemId === 'tee-boxy' || itemId === 'tee-fitted' || itemId === 'tee-skate') {
    const isBoxy = itemId === 'tee-boxy';
    const isSkate = itemId === 'tee-skate';
    const radiusTop = isBoxy ? 0.235 : isSkate ? 0.23 : 0.225;
    const radiusBottom = isBoxy ? 0.23 : isSkate ? 0.22 : 0.19;
    const length = isSkate ? 0.44 : 0.4;

    // Main Torso Shirt Cylinder
    const chestTeeGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 24, 1, true);
    const chestTeeMesh = new THREE.Mesh(chestTeeGeo, bodyMat);
    chestTeeMesh.position.set(0, 0.06, 0);
    chestTeeMesh.scale.set(1.18, 1, 0.92);
    chestTeeMesh.castShadow = true;
    chestTeeMesh.receiveShadow = true;
    bones.chest.add(chestTeeMesh);
    createdMeshes.push(chestTeeMesh);

    // Ribbed Collar
    const collarGeo = new THREE.TorusGeometry(0.09, 0.016, 12, 24);
    collarGeo.scale(1, 1.25, 0.85);
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.26, 0);
    bones.chest.add(collarMesh);
    createdMeshes.push(collarMesh);

    // Sleeves
    const sleeveLength = isBoxy ? 0.19 : isSkate ? 0.21 : 0.15;
    const sleeveRadTop = isBoxy ? 0.08 : 0.07;
    const sleeveRadBot = isBoxy ? 0.075 : 0.062;

    const sleeveGeo = new THREE.CylinderGeometry(sleeveRadTop, sleeveRadBot, sleeveLength, 16);
    
    // Left Sleeve
    const leftSleeve = new THREE.Mesh(sleeveGeo, bodyMat);
    leftSleeve.position.set(0, -sleeveLength / 2, 0);
    leftSleeve.castShadow = true;
    bones.leftArm.add(leftSleeve);
    createdMeshes.push(leftSleeve);

    // Right Sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeo, bodyMat);
    rightSleeve.position.set(0, -sleeveLength / 2, 0);
    rightSleeve.castShadow = true;
    bones.rightArm.add(rightSleeve);
    createdMeshes.push(rightSleeve);
  } else if (itemId === 'tee-tank') {
    // Sleeveless Muscle Tank
    const tankGeo = new THREE.CylinderGeometry(0.222, 0.185, 0.38, 24, 1, true);
    const tankMesh = new THREE.Mesh(tankGeo, bodyMat);
    tankMesh.position.set(0, 0.06, 0);
    tankMesh.scale.set(1.14, 1, 0.88);
    tankMesh.castShadow = true;
    tankMesh.receiveShadow = true;
    bones.chest.add(tankMesh);
    createdMeshes.push(tankMesh);

    // High rib collar
    const collarGeo = new THREE.TorusGeometry(0.085, 0.014, 12, 24);
    collarGeo.scale(1, 1.2, 0.8);
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.25, 0);
    bones.chest.add(collarMesh);
    createdMeshes.push(collarMesh);
  }

  return {
    group: container,
    category: 'top',
    updateColor: (newColor: string) => {
      bodyMat.color.set(newColor);
      collarMat.color.set(newColor);
    },
    updateFabric: (newFabric: FabricType) => {
      applyFabricProperties(bodyMat, newFabric);
    },
    updateGraphic: (newGraphic: GraphicPrintId) => {
      if (!graphicMesh) return;
      if (newGraphic === 'none') {
        graphicMesh.visible = false;
      } else {
        const tex = getProceduralGraphicTexture(newGraphic);
        if (tex && graphicMesh.material instanceof THREE.MeshStandardMaterial) {
          graphicMesh.material.map = tex;
          graphicMesh.material.needsUpdate = true;
          graphicMesh.visible = true;
        }
      }
    },
    dispose: () => {
      createdMeshes.forEach((mesh) => {
        mesh.parent?.remove(mesh);
        mesh.geometry.dispose();
      });
      bodyMat.dispose();
      collarMat.dispose();
      graphicMat?.dispose();
    },
  };
}

/**
 * Builds and attaches outerwear (hoodie, bomber, puffer, tech shell)
 */
export function attachOuterwearGarment(
  bones: AvatarBones,
  itemId: string,
  color: string,
  fabric: FabricType
): GarmentMeshes | null {
  if (itemId === 'outer-none') return null;

  const container = new THREE.Group();
  container.name = `Outer_${itemId}`;

  const { bodyMat } = createGarmentMaterial(color, fabric);
  const trimMat = bodyMat.clone();
  trimMat.roughness = 0.95;

  // Zipper / metal hardware material
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.2,
  });

  const createdMeshes: THREE.Mesh[] = [];

  if (itemId === 'outer-hoodie-boxy') {
    // Sculpted Heavyweight Boxy Hoodie
    const bodyGeo = new THREE.CylinderGeometry(0.245, 0.23, 0.44, 24);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.05, 0);
    bodyMesh.scale.set(1.22, 1, 0.95);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bones.chest.add(bodyMesh);
    createdMeshes.push(bodyMesh);

    // Kangaroo front pouch pocket
    const pouchGeo = new THREE.BoxGeometry(0.26, 0.16, 0.05);
    const pouchMesh = new THREE.Mesh(pouchGeo, bodyMat);
    pouchMesh.position.set(0, -0.06, 0.16);
    pouchMesh.castShadow = true;
    bones.chest.add(pouchMesh);
    createdMeshes.push(pouchMesh);

    // Sculpted Hood resting on back/neck
    const hoodGeo = new THREE.SphereGeometry(0.16, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
    hoodGeo.scale(1.15, 0.9, 1.25);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
    hoodMesh.position.set(0, 0.18, -0.09);
    hoodMesh.rotation.x = 0.35;
    hoodMesh.castShadow = true;
    bones.chest.add(hoodMesh);
    createdMeshes.push(hoodMesh);

    // Drawstrings
    [-0.035, 0.035].forEach((x) => {
      const cordGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.16, 8);
      const cordMesh = new THREE.Mesh(cordGeo, metalMat);
      cordMesh.position.set(x, 0.15, 0.15);
      bones.chest.add(cordMesh);
      createdMeshes.push(cordMesh);
    });

    // Upper Arm Sleeves
    const armGeo = new THREE.CylinderGeometry(0.082, 0.075, 0.28, 16);
    const lArm = new THREE.Mesh(armGeo, bodyMat);
    lArm.position.y = -0.13;
    lArm.castShadow = true;
    bones.leftArm.add(lArm);
    createdMeshes.push(lArm);

    const rArm = new THREE.Mesh(armGeo, bodyMat);
    rArm.position.y = -0.13;
    rArm.castShadow = true;
    bones.rightArm.add(rArm);
    createdMeshes.push(rArm);

    // Forearm Sleeves with ribbed cuffs
    const forearmGeo = new THREE.CylinderGeometry(0.075, 0.055, 0.25, 16);
    const lForearm = new THREE.Mesh(forearmGeo, bodyMat);
    lForearm.position.y = -0.125;
    lForearm.castShadow = true;
    bones.leftForearm.add(lForearm);
    createdMeshes.push(lForearm);

    const rForearm = new THREE.Mesh(forearmGeo, bodyMat);
    rForearm.position.y = -0.125;
    rForearm.castShadow = true;
    bones.rightForearm.add(rForearm);
    createdMeshes.push(rForearm);
  } else if (itemId === 'outer-bomber') {
    // MA-1 Bomber Jacket (Gathered sleeves, utility flight pocket)
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.235, 0.42, 24);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.05, 0);
    bodyMesh.scale.set(1.24, 1, 0.98);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bones.chest.add(bodyMesh);
    createdMeshes.push(bodyMesh);

    // Heavy Metal Center Zipper
    const zipGeo = new THREE.BoxGeometry(0.016, 0.42, 0.02);
    const zipMesh = new THREE.Mesh(zipGeo, metalMat);
    zipMesh.position.set(0, 0.05, 0.16);
    bones.chest.add(zipMesh);
    createdMeshes.push(zipMesh);

    // Ribbed collar
    const collarGeo = new THREE.TorusGeometry(0.1, 0.02, 12, 24);
    collarGeo.scale(1, 1.25, 0.85);
    const collarMesh = new THREE.Mesh(collarGeo, trimMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.26, 0);
    bones.chest.add(collarMesh);
    createdMeshes.push(collarMesh);

    // Puffy curved sleeves
    const upperGeo = new THREE.CylinderGeometry(0.088, 0.082, 0.28, 16);
    const lUpper = new THREE.Mesh(upperGeo, bodyMat);
    lUpper.position.y = -0.13;
    lUpper.castShadow = true;
    bones.leftArm.add(lUpper);
    createdMeshes.push(lUpper);

    const rUpper = new THREE.Mesh(upperGeo, bodyMat);
    rUpper.position.y = -0.13;
    rUpper.castShadow = true;
    bones.rightArm.add(rUpper);
    createdMeshes.push(rUpper);

    const lowerGeo = new THREE.CylinderGeometry(0.082, 0.06, 0.25, 16);
    const lLower = new THREE.Mesh(lowerGeo, bodyMat);
    lLower.position.y = -0.125;
    lLower.castShadow = true;
    bones.leftForearm.add(lLower);
    createdMeshes.push(lLower);

    const rLower = new THREE.Mesh(lowerGeo, bodyMat);
    rLower.position.y = -0.125;
    rLower.castShadow = true;
    bones.rightForearm.add(rLower);
    createdMeshes.push(rLower);

    // Left Arm Utility Zip Pocket with Red/Purple Streetwear Flight Tag
    const tagPocketGeo = new THREE.BoxGeometry(0.04, 0.08, 0.05);
    const tagPocket = new THREE.Mesh(tagPocketGeo, bodyMat);
    tagPocket.position.set(0.065, -0.08, 0);
    bones.leftArm.add(tagPocket);
    createdMeshes.push(tagPocket);

    // Purple "REMOVE BEFORE FLIGHT" streetwear ribbon
    const tagGeo = new THREE.BoxGeometry(0.015, 0.09, 0.004);
    const tagMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      roughness: 0.5,
    });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(0.085, -0.14, 0);
    bones.leftArm.add(tagMesh);
    createdMeshes.push(tagMesh);
  } else if (itemId === 'outer-puffer') {
    // Quilted Down Puffer Jacket (Segmented horizontal baffles)
    const segments = 4;
    const segHeight = 0.11;
    for (let i = 0; i < segments; i++) {
      const puffGeo = new THREE.TorusGeometry(0.24, 0.055, 16, 24);
      puffGeo.scale(1.22, 0.95, 0.9);
      const puffMesh = new THREE.Mesh(puffGeo, bodyMat);
      puffMesh.rotation.x = Math.PI / 2;
      puffMesh.position.set(0, 0.2 - i * segHeight, 0);
      puffMesh.castShadow = true;
      bones.chest.add(puffMesh);
      createdMeshes.push(puffMesh);
    }

    // Tall insulated collar
    const collarGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 20, 1, true);
    const collarMesh = new THREE.Mesh(collarGeo, bodyMat);
    collarMesh.position.set(0, 0.3, 0);
    collarMesh.castShadow = true;
    bones.chest.add(collarMesh);
    createdMeshes.push(collarMesh);

    // Puffy Baffled Sleeves
    [bones.leftArm, bones.rightArm].forEach((armBone) => {
      for (let s = 0; s < 3; s++) {
        const puffArmGeo = new THREE.SphereGeometry(0.088, 16, 12);
        puffArmGeo.scale(1, 0.7, 1);
        const pArmMesh = new THREE.Mesh(puffArmGeo, bodyMat);
        pArmMesh.position.y = -0.06 - s * 0.085;
        pArmMesh.castShadow = true;
        armBone.add(pArmMesh);
        createdMeshes.push(pArmMesh);
      }
    });

    [bones.leftForearm, bones.rightForearm].forEach((forearmBone) => {
      for (let s = 0; s < 2; s++) {
        const puffForearmGeo = new THREE.SphereGeometry(0.075, 16, 12);
        puffForearmGeo.scale(1, 0.7, 1);
        const pForearmMesh = new THREE.Mesh(puffForearmGeo, bodyMat);
        pForearmMesh.position.y = -0.06 - s * 0.09;
        pForearmMesh.castShadow = true;
        forearmBone.add(pForearmMesh);
        createdMeshes.push(pForearmMesh);
      }
    });
  } else if (itemId === 'outer-techshell') {
    // Techwear Waterproof Shell
    const bodyGeo = new THREE.CylinderGeometry(0.245, 0.23, 0.44, 24);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.05, 0);
    bodyMesh.scale.set(1.22, 1, 0.95);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bones.chest.add(bodyMesh);
    createdMeshes.push(bodyMesh);

    // Tactical chest harness pockets & clip buckles
    [-0.1, 0.1].forEach((xSide) => {
      const pocketGeo = new THREE.BoxGeometry(0.08, 0.11, 0.035);
      const pocketMesh = new THREE.Mesh(pocketGeo, bodyMat);
      pocketMesh.position.set(xSide, 0.11, 0.155);
      pocketMesh.castShadow = true;
      bones.chest.add(pocketMesh);
      createdMeshes.push(pocketMesh);

      // Strap buckle
      const buckleGeo = new THREE.BoxGeometry(0.04, 0.015, 0.01);
      const buckleMesh = new THREE.Mesh(buckleGeo, metalMat);
      buckleMesh.position.set(xSide, 0.05, 0.175);
      bones.chest.add(buckleMesh);
      createdMeshes.push(buckleMesh);
    });

    // High storm collar
    const stormCollarGeo = new THREE.CylinderGeometry(0.095, 0.1, 0.12, 20, 1, true);
    const stormCollar = new THREE.Mesh(stormCollarGeo, bodyMat);
    stormCollar.position.set(0, 0.3, 0);
    bones.chest.add(stormCollar);
    createdMeshes.push(stormCollar);

    // Sleeves
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.28, 16);
    const lArm = new THREE.Mesh(armGeo, bodyMat);
    lArm.position.y = -0.13;
    lArm.castShadow = true;
    bones.leftArm.add(lArm);
    createdMeshes.push(lArm);

    const rArm = new THREE.Mesh(armGeo, bodyMat);
    rArm.position.y = -0.13;
    rArm.castShadow = true;
    bones.rightArm.add(rArm);
    createdMeshes.push(rArm);

    const forearmGeo = new THREE.CylinderGeometry(0.07, 0.055, 0.25, 16);
    const lForearm = new THREE.Mesh(forearmGeo, bodyMat);
    lForearm.position.y = -0.125;
    lForearm.castShadow = true;
    bones.leftForearm.add(lForearm);
    createdMeshes.push(lForearm);

    const rForearm = new THREE.Mesh(forearmGeo, bodyMat);
    rForearm.position.y = -0.125;
    rForearm.castShadow = true;
    bones.rightForearm.add(rForearm);
    createdMeshes.push(rForearm);
  }

  return {
    group: container,
    category: 'outerwear',
    updateColor: (newColor: string) => {
      bodyMat.color.set(newColor);
      trimMat.color.set(newColor);
    },
    updateFabric: (newFabric: FabricType) => {
      applyFabricProperties(bodyMat, newFabric);
    },
    dispose: () => {
      createdMeshes.forEach((mesh) => {
        mesh.parent?.remove(mesh);
        mesh.geometry.dispose();
      });
      bodyMat.dispose();
      trimMat.dispose();
      metalMat.dispose();
    },
  };
}

/**
 * Builds and attaches pants (cargo, denim, track, utility shorts)
 */
export function attachPantsGarment(
  bones: AvatarBones,
  itemId: string,
  color: string,
  fabric: FabricType
): GarmentMeshes {
  const container = new THREE.Group();
  container.name = `Pants_${itemId}`;

  const { bodyMat } = createGarmentMaterial(color, fabric);

  // Hardware / strap / contrast material
  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x111116,
    roughness: 0.9,
  });

  const createdMeshes: THREE.Mesh[] = [];

  // Pelvis / Waistband section
  const waistGeo = new THREE.CylinderGeometry(0.185, 0.175, 0.16, 20);
  const waistMesh = new THREE.Mesh(waistGeo, bodyMat);
  waistMesh.castShadow = true;
  waistMesh.receiveShadow = true;
  bones.pelvis.add(waistMesh);
  createdMeshes.push(waistMesh);

  if (itemId === 'pants-cargo' || itemId === 'pants-denim' || itemId === 'pants-techtrack') {
    const isCargo = itemId === 'pants-cargo';
    const isDenim = itemId === 'pants-denim';
    const isTrack = itemId === 'pants-techtrack';

    const thighRadTop = isCargo ? 0.108 : isDenim ? 0.105 : 0.098;
    const thighRadBot = isCargo ? 0.098 : isDenim ? 0.095 : 0.082;
    const calfRadTop = isCargo ? 0.098 : isDenim ? 0.094 : 0.082;
    const calfRadBot = isCargo ? 0.088 : isDenim ? 0.092 : 0.065; // Track is tapered

    // Thighs
    const thighGeo = new THREE.CylinderGeometry(thighRadTop, thighRadBot, 0.45, 18);
    const lThigh = new THREE.Mesh(thighGeo, bodyMat);
    lThigh.position.y = -0.22;
    lThigh.castShadow = true;
    bones.leftThigh.add(lThigh);
    createdMeshes.push(lThigh);

    const rThigh = new THREE.Mesh(thighGeo, bodyMat);
    rThigh.position.y = -0.22;
    rThigh.castShadow = true;
    bones.rightThigh.add(rThigh);
    createdMeshes.push(rThigh);

    // Calves
    const calfGeo = new THREE.CylinderGeometry(calfRadTop, calfRadBot, 0.43, 18);
    const lCalf = new THREE.Mesh(calfGeo, bodyMat);
    lCalf.position.y = -0.21;
    lCalf.castShadow = true;
    bones.leftCalf.add(lCalf);
    createdMeshes.push(lCalf);

    const rCalf = new THREE.Mesh(calfGeo, bodyMat);
    rCalf.position.y = -0.21;
    rCalf.castShadow = true;
    bones.rightCalf.add(rCalf);
    createdMeshes.push(rCalf);

    if (isCargo) {
      // 3D Bellows Cargo Pockets on outer thighs
      const cargoPocketGeo = new THREE.BoxGeometry(0.06, 0.18, 0.14);
      
      const lPocket = new THREE.Mesh(cargoPocketGeo, bodyMat);
      lPocket.position.set(0.095, -0.22, 0);
      lPocket.castShadow = true;
      bones.leftThigh.add(lPocket);
      createdMeshes.push(lPocket);

      const rPocket = new THREE.Mesh(cargoPocketGeo, bodyMat);
      rPocket.position.set(-0.095, -0.22, 0);
      rPocket.castShadow = true;
      bones.rightThigh.add(rPocket);
      createdMeshes.push(rPocket);

      // Hanging modular tactical straps
      const strapGeo = new THREE.BoxGeometry(0.015, 0.22, 0.01);
      const lStrap = new THREE.Mesh(strapGeo, strapMat);
      lStrap.position.set(0.125, -0.28, 0.03);
      bones.leftThigh.add(lStrap);
      createdMeshes.push(lStrap);

      const rStrap = new THREE.Mesh(strapGeo, strapMat);
      rStrap.position.set(-0.125, -0.28, 0.03);
      bones.rightThigh.add(rStrap);
      createdMeshes.push(rStrap);
    } else if (isTrack) {
      // Reflective side racing stripes
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      });

      const stripeGeo = new THREE.BoxGeometry(0.015, 0.44, 0.02);
      const lStripe1 = new THREE.Mesh(stripeGeo, stripeMat);
      lStripe1.position.set(0.1, -0.22, 0);
      bones.leftThigh.add(lStripe1);
      createdMeshes.push(lStripe1);

      const rStripe1 = new THREE.Mesh(stripeGeo, stripeMat);
      rStripe1.position.set(-0.1, -0.22, 0);
      bones.rightThigh.add(rStripe1);
      createdMeshes.push(rStripe1);

      const stripeCalfGeo = new THREE.BoxGeometry(0.015, 0.42, 0.02);
      const lStripe2 = new THREE.Mesh(stripeCalfGeo, stripeMat);
      lStripe2.position.set(0.088, -0.21, 0);
      bones.leftCalf.add(lStripe2);
      createdMeshes.push(lStripe2);

      const rStripe2 = new THREE.Mesh(stripeCalfGeo, stripeMat);
      rStripe2.position.set(-0.088, -0.21, 0);
      bones.rightCalf.add(rStripe2);
      createdMeshes.push(rStripe2);
    }
  } else if (itemId === 'pants-utilityshorts') {
    // Streetwear Knee-Length Utility Shorts
    const shortThighGeo = new THREE.CylinderGeometry(0.115, 0.11, 0.36, 18);
    const lShort = new THREE.Mesh(shortThighGeo, bodyMat);
    lShort.position.y = -0.18;
    lShort.castShadow = true;
    bones.leftThigh.add(lShort);
    createdMeshes.push(lShort);

    const rShort = new THREE.Mesh(shortThighGeo, bodyMat);
    rShort.position.y = -0.18;
    rShort.castShadow = true;
    bones.rightThigh.add(rShort);
    createdMeshes.push(rShort);

    // Side pocket flaps
    const flapGeo = new THREE.BoxGeometry(0.04, 0.12, 0.1);
    const lFlap = new THREE.Mesh(flapGeo, bodyMat);
    lFlap.position.set(0.1, -0.2, 0);
    bones.leftThigh.add(lFlap);
    createdMeshes.push(lFlap);

    const rFlap = new THREE.Mesh(flapGeo, bodyMat);
    rFlap.position.set(-0.1, -0.2, 0);
    bones.rightThigh.add(rFlap);
    createdMeshes.push(rFlap);
  }

  return {
    group: container,
    category: 'pants',
    updateColor: (newColor: string) => {
      bodyMat.color.set(newColor);
    },
    updateFabric: (newFabric: FabricType) => {
      applyFabricProperties(bodyMat, newFabric);
    },
    dispose: () => {
      createdMeshes.forEach((mesh) => {
        mesh.parent?.remove(mesh);
        mesh.geometry.dispose();
      });
      bodyMat.dispose();
      strapMat.dispose();
    },
  };
}

/**
 * Builds and attaches sneakers / footwear
 */
export function attachSneakers(
  bones: AvatarBones,
  itemId: string,
  color: string,
  accentColor: string
): GarmentMeshes {
  const container = new THREE.Group();
  container.name = `Sneakers_${itemId}`;

  const upperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.38,
    metalness: 0.08,
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x121216,
    roughness: 0.65,
    metalness: 0.05,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    emissive: new THREE.Color(accentColor),
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });

  const createdMeshes: THREE.Mesh[] = [];

  [bones.leftFoot, bones.rightFoot].forEach((footBone) => {
    if (itemId === 'kicks-chunky') {
      // Futuristic Chunky Runner
      // Chunky undulating midsole
      const soleGeo = new THREE.BoxGeometry(0.12, 0.045, 0.26);
      const soleMesh = new THREE.Mesh(soleGeo, soleMat);
      soleMesh.position.set(0, -0.04, 0.03);
      soleMesh.castShadow = true;
      footBone.add(soleMesh);
      createdMeshes.push(soleMesh);

      // Layered Upper
      const upperGeo = new THREE.BoxGeometry(0.105, 0.065, 0.22);
      const upperMesh = new THREE.Mesh(upperGeo, upperMat);
      upperMesh.position.set(0, 0.005, 0.03);
      upperMesh.castShadow = true;
      footBone.add(upperMesh);
      createdMeshes.push(upperMesh);

      // Neon visible heel bubble cushion
      const heelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
      const heelMesh = new THREE.Mesh(heelGeo, accentMat);
      heelMesh.rotation.z = Math.PI / 2;
      heelMesh.position.set(0, -0.035, -0.07);
      footBone.add(heelMesh);
      createdMeshes.push(heelMesh);

      // Toe guard bumper
      const toeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12);
      const toeMesh = new THREE.Mesh(toeGeo, soleMat);
      toeMesh.position.set(0, -0.015, 0.135);
      footBone.add(toeMesh);
      createdMeshes.push(toeMesh);
    } else if (itemId === 'kicks-hightop') {
      // High-Top Street Court
      const soleGeo = new THREE.BoxGeometry(0.105, 0.035, 0.25);
      const soleMesh = new THREE.Mesh(soleGeo, soleMat);
      soleMesh.position.set(0, -0.04, 0.03);
      soleMesh.castShadow = true;
      footBone.add(soleMesh);
      createdMeshes.push(soleMesh);

      // Main Foot Upper
      const vampGeo = new THREE.BoxGeometry(0.098, 0.06, 0.22);
      const vampMesh = new THREE.Mesh(vampGeo, upperMat);
      vampMesh.position.set(0, 0.005, 0.03);
      vampMesh.castShadow = true;
      footBone.add(vampMesh);
      createdMeshes.push(vampMesh);

      // High Padded Ankle Collar
      const collarGeo = new THREE.CylinderGeometry(0.068, 0.065, 0.12, 16);
      const collarMesh = new THREE.Mesh(collarGeo, upperMat);
      collarMesh.position.set(0, 0.08, 0);
      collarMesh.castShadow = true;
      footBone.add(collarMesh);
      createdMeshes.push(collarMesh);

      // Accent Ankle Strap / Swoosh panel
      const strapGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.03, 16);
      const strapMesh = new THREE.Mesh(strapGeo, accentMat);
      strapMesh.position.set(0, 0.09, 0);
      footBone.add(strapMesh);
      createdMeshes.push(strapMesh);
    } else if (itemId === 'kicks-minimal') {
      // Atelier Minimalist Low-Top
      const soleGeo = new THREE.BoxGeometry(0.095, 0.03, 0.24);
      const soleMesh = new THREE.Mesh(soleGeo, soleMat);
      soleMesh.position.set(0, -0.04, 0.03);
      soleMesh.castShadow = true;
      footBone.add(soleMesh);
      createdMeshes.push(soleMesh);

      const upperGeo = new THREE.BoxGeometry(0.09, 0.055, 0.21);
      const upperMesh = new THREE.Mesh(upperGeo, upperMat);
      upperMesh.position.set(0, 0, 0.03);
      upperMesh.castShadow = true;
      footBone.add(upperMesh);
      createdMeshes.push(upperMesh);

      // Contrast heel tab
      const heelGeo = new THREE.BoxGeometry(0.085, 0.035, 0.02);
      const heelMesh = new THREE.Mesh(heelGeo, accentMat);
      heelMesh.position.set(0, 0.025, -0.075);
      footBone.add(heelMesh);
      createdMeshes.push(heelMesh);
    } else if (itemId === 'kicks-tactical') {
      // Tactical Lug Combat Boot
      const lugSoleGeo = new THREE.BoxGeometry(0.115, 0.055, 0.27);
      const lugSole = new THREE.Mesh(lugSoleGeo, soleMat);
      lugSole.position.set(0, -0.04, 0.03);
      lugSole.castShadow = true;
      footBone.add(lugSole);
      createdMeshes.push(lugSole);

      // Boot shaft extending up the calf
      const bootShaftGeo = new THREE.CylinderGeometry(0.072, 0.068, 0.18, 16);
      const bootShaft = new THREE.Mesh(bootShaftGeo, upperMat);
      bootShaft.position.set(0, 0.09, 0);
      bootShaft.castShadow = true;
      footBone.add(bootShaft);
      createdMeshes.push(bootShaft);

      // Foot section
      const footUpperGeo = new THREE.BoxGeometry(0.1, 0.07, 0.22);
      const footUpper = new THREE.Mesh(footUpperGeo, upperMat);
      footUpper.position.set(0, 0.015, 0.03);
      footBone.add(footUpper);
      createdMeshes.push(footUpper);

      // Metal quick-lace speed hooks
      for (let h = 0; h < 4; h++) {
        const hookGeo = new THREE.BoxGeometry(0.015, 0.01, 0.01);
        const hook = new THREE.Mesh(hookGeo, accentMat);
        hook.position.set(0, 0.04 + h * 0.035, 0.07);
        footBone.add(hook);
        createdMeshes.push(hook);
      }
    }
  });

  return {
    group: container,
    category: 'sneakers',
    updateColor: (newColor: string) => {
      upperMat.color.set(newColor);
    },
    dispose: () => {
      createdMeshes.forEach((mesh) => {
        mesh.parent?.remove(mesh);
        mesh.geometry.dispose();
      });
      upperMat.dispose();
      soleMat.dispose();
      accentMat.dispose();
    },
  };
}

/**
 * Builds and attaches accessories (beanie, sunglasses, Cuban link chain)
 */
export function attachAccessory(
  bones: AvatarBones,
  itemId: string,
  color: string
): GarmentMeshes | null {
  if (itemId === 'acc-none') return null;

  const container = new THREE.Group();
  container.name = `Acc_${itemId}`;

  const createdMeshes: THREE.Mesh[] = [];

  if (itemId === 'acc-beanie') {
    const beanieMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.9,
      metalness: 0.05,
    });

    // Ribbed folded beanie
    const beanieGeo = new THREE.SphereGeometry(0.13, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
    beanieGeo.scale(0.92, 1.15, 1.02);
    const beanieMesh = new THREE.Mesh(beanieGeo, beanieMat);
    beanieMesh.position.set(0, 0.12, 0);
    beanieMesh.castShadow = true;
    bones.head.add(beanieMesh);
    createdMeshes.push(beanieMesh);

    // Thick fold cuff
    const cuffGeo = new THREE.TorusGeometry(0.122, 0.022, 12, 24);
    cuffGeo.scale(0.95, 1.25, 0.85);
    const cuffMesh = new THREE.Mesh(cuffGeo, beanieMat);
    cuffMesh.rotation.x = Math.PI / 2;
    cuffMesh.position.set(0, 0.13, 0);
    bones.head.add(cuffMesh);
    createdMeshes.push(cuffMesh);

    return {
      group: container,
      category: 'accessory',
      updateColor: (newColor: string) => {
        beanieMat.color.set(newColor);
      },
      dispose: () => {
        createdMeshes.forEach((mesh) => {
          mesh.parent?.remove(mesh);
          mesh.geometry.dispose();
        });
        beanieMat.dispose();
      },
    };
  } else if (itemId === 'acc-sunglasses') {
    // Cyber Shield shades
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x09090d,
      roughness: 0.2,
      metalness: 0.8,
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness: 0.05,
      metalness: 0.95,
      transmission: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // Monolithic wrap visor
    const visorGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.038, 24, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
    const visorMesh = new THREE.Mesh(visorGeo, lensMat);
    visorMesh.position.set(0, 0.1, 0.03);
    bones.head.add(visorMesh);
    createdMeshes.push(visorMesh);

    // Brow frame bar
    const barGeo = new THREE.BoxGeometry(0.18, 0.008, 0.01);
    const barMesh = new THREE.Mesh(barGeo, frameMat);
    barMesh.position.set(0, 0.12, 0.1);
    bones.head.add(barMesh);
    createdMeshes.push(barMesh);

    return {
      group: container,
      category: 'accessory',
      updateColor: (newColor: string) => {
        lensMat.color.set(newColor);
      },
      dispose: () => {
        createdMeshes.forEach((mesh) => {
          mesh.parent?.remove(mesh);
          mesh.geometry.dispose();
        });
        frameMat.dispose();
        lensMat.dispose();
      },
    };
  } else if (itemId === 'acc-chain') {
    // Heavy Cuban Link Silver Chain
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });

    const chainGeo = new THREE.TorusGeometry(0.105, 0.012, 16, 32);
    chainGeo.scale(1, 1.4, 0.85);
    const chainMesh = new THREE.Mesh(chainGeo, silverMat);
    chainMesh.rotation.x = Math.PI / 2.3;
    chainMesh.position.set(0, 0.23, 0.02);
    chainMesh.castShadow = true;
    bones.chest.add(chainMesh);
    createdMeshes.push(chainMesh);

    return {
      group: container,
      category: 'accessory',
      updateColor: (newColor: string) => {
        silverMat.color.set(newColor);
      },
      dispose: () => {
        createdMeshes.forEach((mesh) => {
          mesh.parent?.remove(mesh);
          mesh.geometry.dispose();
        });
        silverMat.dispose();
      },
    };
  }

  return null;
}
