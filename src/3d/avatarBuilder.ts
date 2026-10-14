import * as THREE from 'three';

export interface AvatarBones {
  root: THREE.Group;
  head: THREE.Group;
  neck: THREE.Group;
  hair: THREE.Group;
  torso: THREE.Group;
  chest: THREE.Group;
  pelvis: THREE.Group;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
  leftThigh: THREE.Group;
  rightThigh: THREE.Group;
  leftCalf: THREE.Group;
  rightCalf: THREE.Group;
  leftFoot: THREE.Group;
  rightFoot: THREE.Group;
  skinMeshes: THREE.Mesh[];
}

export function createSkinMaterial(skinType: string): THREE.MeshStandardMaterial {
  switch (skinType) {
    case 'mannequin_chrome':
      return new THREE.MeshStandardMaterial({
        color: 0x22222a,
        metalness: 0.85,
        roughness: 0.22,
        envMapIntensity: 1.4,
      });
    case 'human_fair':
      return new THREE.MeshStandardMaterial({
        color: 0xf3d6c6,
        roughness: 0.65,
        metalness: 0.05,
      });
    case 'human_tan':
      return new THREE.MeshStandardMaterial({
        color: 0xc8987b,
        roughness: 0.62,
        metalness: 0.05,
      });
    case 'human_rich':
      return new THREE.MeshStandardMaterial({
        color: 0x5a3d2e,
        roughness: 0.58,
        metalness: 0.08,
      });
    case 'mannequin_dark':
    default:
      return new THREE.MeshStandardMaterial({
        color: 0x141418,
        metalness: 0.25,
        roughness: 0.45,
        envMapIntensity: 0.8,
      });
  }
}

export function buildAvatar(skinMaterial: THREE.MeshStandardMaterial): AvatarBones {
  const root = new THREE.Group();
  root.name = 'AvatarRoot';
  const skinMeshes: THREE.Mesh[] = [];

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.85,
    metalness: 0.1,
  });

  // Pelvis / Hips (y ≈ 0.95m from floor)
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  root.add(pelvis);

  // Pelvis mesh
  const pelvisGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.14, 16);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, skinMaterial);
  pelvisMesh.castShadow = true;
  pelvisMesh.receiveShadow = true;
  pelvis.add(pelvisMesh);
  skinMeshes.push(pelvisMesh);

  // Torso / Abdomen
  const torso = new THREE.Group();
  torso.position.y = 0.08;
  pelvis.add(torso);

  const torsoGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.22, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, skinMaterial);
  torsoMesh.position.y = 0.11;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torso.add(torsoMesh);
  skinMeshes.push(torsoMesh);

  // Chest / Pectorals
  const chest = new THREE.Group();
  chest.position.y = 0.22;
  torso.add(chest);

  const chestGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.26, 18);
  const chestMesh = new THREE.Mesh(chestGeo, skinMaterial);
  chestMesh.position.y = 0.13;
  chestMesh.scale.set(1.15, 1, 0.85); // Athletic tapered broad chest
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  chest.add(chestMesh);
  skinMeshes.push(chestMesh);

  // Neck
  const neck = new THREE.Group();
  neck.position.y = 0.26;
  chest.add(neck);

  const neckGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.12, 16);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neckMesh.position.y = 0.06;
  neckMesh.castShadow = true;
  neckMesh.receiveShadow = true;
  neck.add(neckMesh);
  skinMeshes.push(neckMesh);

  // Head
  const head = new THREE.Group();
  head.position.y = 0.12;
  neck.add(head);

  // Sculpted head
  const headGeo = new THREE.SphereGeometry(0.12, 24, 20);
  headGeo.scale(0.85, 1.08, 0.95);
  const headMesh = new THREE.Mesh(headGeo, skinMaterial);
  headMesh.position.y = 0.1;
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  head.add(headMesh);
  skinMeshes.push(headMesh);

  // Jaw / Chin subtle contour
  const chinGeo = new THREE.ConeGeometry(0.06, 0.09, 12);
  const chinMesh = new THREE.Mesh(chinGeo, skinMaterial);
  chinMesh.rotation.x = Math.PI;
  chinMesh.position.set(0, 0.02, 0.05);
  head.add(chinMesh);
  skinMeshes.push(chinMesh);

  // Streetwear modern crop hair
  const hair = new THREE.Group();
  const hairGeo = new THREE.SphereGeometry(0.124, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
  hairGeo.scale(0.88, 1.05, 0.98);
  const hairMesh = new THREE.Mesh(hairGeo, hairMaterial);
  hairMesh.position.y = 0.12;
  hairMesh.castShadow = true;
  hair.add(hairMesh);
  head.add(hair);

  // Ears
  [-0.105, 0.105].forEach((xSide) => {
    const earGeo = new THREE.SphereGeometry(0.025, 8, 8);
    earGeo.scale(0.4, 1.2, 0.8);
    const earMesh = new THREE.Mesh(earGeo, skinMaterial);
    earMesh.position.set(xSide, 0.1, -0.01);
    head.add(earMesh);
    skinMeshes.push(earMesh);
  });

  // --- ARMS ---
  // Left Shoulder
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(0.24, 0.22, 0);
  chest.add(leftShoulder);

  const shoulderCapGeo = new THREE.SphereGeometry(0.065, 16, 12);
  const leftShoulderCap = new THREE.Mesh(shoulderCapGeo, skinMaterial);
  leftShoulder.add(leftShoulderCap);
  skinMeshes.push(leftShoulderCap);

  const leftArm = new THREE.Group();
  leftShoulder.add(leftArm);

  const armGeo = new THREE.CylinderGeometry(0.052, 0.046, 0.26, 16);
  const leftArmMesh = new THREE.Mesh(armGeo, skinMaterial);
  leftArmMesh.position.y = -0.13;
  leftArmMesh.castShadow = true;
  leftArmMesh.receiveShadow = true;
  leftArm.add(leftArmMesh);
  skinMeshes.push(leftArmMesh);

  const leftForearm = new THREE.Group();
  leftForearm.position.y = -0.26;
  leftArm.add(leftForearm);

  const forearmGeo = new THREE.CylinderGeometry(0.046, 0.038, 0.25, 16);
  const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
  leftForearmMesh.position.y = -0.125;
  leftForearmMesh.castShadow = true;
  leftForearmMesh.receiveShadow = true;
  leftForearm.add(leftForearmMesh);
  skinMeshes.push(leftForearmMesh);

  const leftHand = new THREE.Group();
  leftHand.position.y = -0.25;
  leftForearm.add(leftHand);

  const handGeo = new THREE.BoxGeometry(0.045, 0.09, 0.03);
  const leftHandMesh = new THREE.Mesh(handGeo, skinMaterial);
  leftHandMesh.position.y = -0.045;
  leftHandMesh.castShadow = true;
  leftHand.add(leftHandMesh);
  skinMeshes.push(leftHandMesh);

  // Right Shoulder
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(-0.24, 0.22, 0);
  chest.add(rightShoulder);

  const rightShoulderCap = new THREE.Mesh(shoulderCapGeo, skinMaterial);
  rightShoulder.add(rightShoulderCap);
  skinMeshes.push(rightShoulderCap);

  const rightArm = new THREE.Group();
  rightShoulder.add(rightArm);

  const rightArmMesh = new THREE.Mesh(armGeo, skinMaterial);
  rightArmMesh.position.y = -0.13;
  rightArmMesh.castShadow = true;
  rightArmMesh.receiveShadow = true;
  rightArm.add(rightArmMesh);
  skinMeshes.push(rightArmMesh);

  const rightForearm = new THREE.Group();
  rightForearm.position.y = -0.26;
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMaterial);
  rightForearmMesh.position.y = -0.125;
  rightForearmMesh.castShadow = true;
  rightForearmMesh.receiveShadow = true;
  rightForearm.add(rightForearmMesh);
  skinMeshes.push(rightForearmMesh);

  const rightHand = new THREE.Group();
  rightHand.position.y = -0.25;
  rightForearm.add(rightHand);

  const rightHandMesh = new THREE.Mesh(handGeo, skinMaterial);
  rightHandMesh.position.y = -0.045;
  rightHandMesh.castShadow = true;
  rightHand.add(rightHandMesh);
  skinMeshes.push(rightHandMesh);

  // --- LEGS ---
  // Left Thigh
  const leftThigh = new THREE.Group();
  leftThigh.position.set(0.1, -0.05, 0);
  pelvis.add(leftThigh);

  const thighGeo = new THREE.CylinderGeometry(0.082, 0.065, 0.44, 16);
  const leftThighMesh = new THREE.Mesh(thighGeo, skinMaterial);
  leftThighMesh.position.y = -0.22;
  leftThighMesh.castShadow = true;
  leftThighMesh.receiveShadow = true;
  leftThigh.add(leftThighMesh);
  skinMeshes.push(leftThighMesh);

  const leftCalf = new THREE.Group();
  leftCalf.position.y = -0.44;
  leftThigh.add(leftCalf);

  const calfGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.42, 16);
  const leftCalfMesh = new THREE.Mesh(calfGeo, skinMaterial);
  leftCalfMesh.position.y = -0.21;
  leftCalfMesh.castShadow = true;
  leftCalfMesh.receiveShadow = true;
  leftCalf.add(leftCalfMesh);
  skinMeshes.push(leftCalfMesh);

  const leftFoot = new THREE.Group();
  leftFoot.position.set(0, -0.42, 0.04);
  leftCalf.add(leftFoot);

  const footGeo = new THREE.BoxGeometry(0.08, 0.05, 0.18);
  const leftFootMesh = new THREE.Mesh(footGeo, skinMaterial);
  leftFootMesh.position.set(0, -0.025, 0.03);
  leftFootMesh.castShadow = true;
  leftFoot.add(leftFootMesh);
  skinMeshes.push(leftFootMesh);

  // Right Thigh
  const rightThigh = new THREE.Group();
  rightThigh.position.set(-0.1, -0.05, 0);
  pelvis.add(rightThigh);

  const rightThighMesh = new THREE.Mesh(thighGeo, skinMaterial);
  rightThighMesh.position.y = -0.22;
  rightThighMesh.castShadow = true;
  rightThighMesh.receiveShadow = true;
  rightThigh.add(rightThighMesh);
  skinMeshes.push(rightThighMesh);

  const rightCalf = new THREE.Group();
  rightCalf.position.y = -0.44;
  rightThigh.add(rightCalf);

  const rightCalfMesh = new THREE.Mesh(calfGeo, skinMaterial);
  rightCalfMesh.position.y = -0.21;
  rightCalfMesh.castShadow = true;
  rightCalfMesh.receiveShadow = true;
  rightCalf.add(rightCalfMesh);
  skinMeshes.push(rightCalfMesh);

  const rightFoot = new THREE.Group();
  rightFoot.position.set(0, -0.42, 0.04);
  rightCalf.add(rightFoot);

  const rightFootMesh = new THREE.Mesh(footGeo, skinMaterial);
  rightFootMesh.position.set(0, -0.025, 0.03);
  rightFootMesh.castShadow = true;
  rightFoot.add(rightFootMesh);
  skinMeshes.push(rightFootMesh);

  return {
    root,
    head,
    neck,
    hair,
    torso,
    chest,
    pelvis,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftForearm,
    rightForearm,
    leftHand,
    rightHand,
    leftThigh,
    rightThigh,
    leftCalf,
    rightCalf,
    leftFoot,
    rightFoot,
    skinMeshes,
  };
}

/**
 * Applies natural posture angles to the avatar bones
 */
export function applyAvatarPose(bones: AvatarBones, pose: string) {
  // Reset all rotations
  const allGroups = [
    bones.pelvis,
    bones.torso,
    bones.chest,
    bones.neck,
    bones.head,
    bones.leftShoulder,
    bones.rightShoulder,
    bones.leftArm,
    bones.rightArm,
    bones.leftForearm,
    bones.rightForearm,
    bones.leftHand,
    bones.rightHand,
    bones.leftThigh,
    bones.rightThigh,
    bones.leftCalf,
    bones.rightCalf,
    bones.leftFoot,
    bones.rightFoot,
  ];
  allGroups.forEach((g) => g.rotation.set(0, 0, 0));

  if (pose === 'atelier') {
    // Natural model stance: slight hip rotation, relaxed arms, subtle head tilt
    bones.pelvis.rotation.y = 0.06;
    bones.pelvis.rotation.z = -0.02;

    bones.chest.rotation.y = -0.04;
    bones.head.rotation.y = -0.05;
    bones.head.rotation.z = 0.03;

    bones.leftArm.rotation.z = 0.12;
    bones.leftArm.rotation.x = 0.05;
    bones.leftForearm.rotation.z = 0.08;

    bones.rightArm.rotation.z = -0.12;
    bones.rightArm.rotation.x = -0.05;
    bones.rightForearm.rotation.z = -0.08;

    bones.leftThigh.rotation.x = -0.05;
    bones.leftThigh.rotation.z = 0.04;
    bones.rightThigh.rotation.x = 0.04;
    bones.rightThigh.rotation.z = -0.04;
  } else if (pose === 'street') {
    // Relaxed streetwear slouch
    bones.torso.rotation.x = 0.04;
    bones.head.rotation.x = -0.04;

    bones.leftArm.rotation.z = 0.18;
    bones.leftArm.rotation.y = 0.08;
    bones.leftForearm.rotation.x = -0.15;

    bones.rightArm.rotation.z = -0.18;
    bones.rightArm.rotation.y = -0.08;
    bones.rightForearm.rotation.x = -0.15;

    bones.leftThigh.rotation.z = 0.08;
    bones.rightThigh.rotation.z = -0.08;
  } else if (pose === 'dynamic') {
    // Runway pivot stride
    bones.pelvis.rotation.y = 0.22;
    bones.torso.rotation.y = -0.12;
    bones.chest.rotation.y = -0.1;
    bones.head.rotation.y = 0.05;

    bones.leftArm.rotation.x = 0.25;
    bones.leftArm.rotation.z = 0.14;
    bones.leftForearm.rotation.x = -0.2;

    bones.rightArm.rotation.x = -0.28;
    bones.rightArm.rotation.z = -0.14;

    bones.leftThigh.rotation.x = -0.22;
    bones.leftCalf.rotation.x = 0.26;

    bones.rightThigh.rotation.x = 0.18;
    bones.rightCalf.rotation.x = 0.1;
  } else if (pose === 'arms_folded') {
    // Confident folded arms
    bones.head.rotation.y = 0.04;
    bones.chest.rotation.x = -0.02;

    bones.leftArm.rotation.x = -0.65;
    bones.leftArm.rotation.y = 0.45;
    bones.leftArm.rotation.z = 0.25;
    bones.leftForearm.rotation.y = 0.9;
    bones.leftForearm.rotation.x = -0.3;

    bones.rightArm.rotation.x = -0.65;
    bones.rightArm.rotation.y = -0.45;
    bones.rightArm.rotation.z = -0.25;
    bones.rightForearm.rotation.y = -0.9;
    bones.rightForearm.rotation.x = -0.3;

    bones.leftThigh.rotation.z = 0.06;
    bones.rightThigh.rotation.z = -0.06;
  }
}
