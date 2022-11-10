import * as THREE from "three"

// rotation consts
const zee = new THREE.Vector3(0, 0, 1);
const euler = new THREE.Euler();
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

const alphaOffset = 0;

export const setObjectQuaternion = (quaternion, alpha, beta, gamma, orient) => {
    euler.set(beta, alpha, -gamma, "YXZ"); // 'ZXY' for the device, but 'YXZ' for us
    quaternion.setFromEuler(euler); // orient the device
    quaternion.multiply(q1); // camera looks out the back of the device, not the top
    quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation
  }

export const cameraRotate = (obj, cam) => {
    let alpha = obj.alpha ? THREE.MathUtils.degToRad(obj.alpha) + alphaOffset : 0; // Z
    let beta = obj.beta ? THREE.MathUtils.degToRad(obj.beta) : 0; // X'
    let gamma = obj.gamma ? THREE.MathUtils.degToRad(obj.gamma) : 0; // Y''
    // I LUCKED OUT AND EVERYTHING WORKS IF I MULTIPLY BETA BY -1
    beta = -beta;

    // var orient = this.screenOrientation ? THREE.MathUtils.degToRad(this.screenOrientation) : 0; // O
    const orient = 0
    // if(this.gimble) this.setObjectQuaternion(this.gimble.quaternion, alpha, beta, gamma, orient);
    setObjectQuaternion(cam.quaternion, alpha, beta, gamma, orient);
  }

