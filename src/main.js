import * as BABYLON from "@babylonjs/core";
import "./style.css";

// GAME SETUP
const canvas = document.createElement("canvas");
canvas.id = "game";
document.body.appendChild(canvas);

const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.38, 0.65, 0.88, 1);

// LIGHTING
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 0.9;

// MATERIALS
function material(name, color) {
  const mat = new BABYLON.StandardMaterial(name, scene);
  mat.diffuseColor = color;
  return mat;
}

const grassMat = material("grass", new BABYLON.Color3(0.16, 0.38, 0.19));
const wallMat = material("walls", new BABYLON.Color3(0.25, 0.28, 0.33));
const crateMat = material("crates", new BABYLON.Color3(0.65, 0.29, 0.12));
const playerMat = material("player", new BABYLON.Color3(0.12, 0.35, 0.95));
const headMat = material("head", new BABYLON.Color3(0.95, 0.72, 0.53));

// ARENA
const ground = BABYLON.MeshBuilder.CreateGround(
  "ground",
  { width: 100, height: 100 },
  scene
);
ground.material = grassMat;

function makeBox(name, x, y, z, width, height, depth, mat) {
  const box = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, height, depth },
    scene
  );
  box.position.set(x, y, z);
  box.material = mat;
  return box;
}

// Arena walls
makeBox("northWall", 0, 3, 50, 100, 6, 2, wallMat);
makeBox("southWall", 0, 3, -50, 100, 6, 2, wallMat);
makeBox("eastWall", 50, 3, 0, 2, 6, 100, wallMat);
makeBox("westWall", -50, 3, 0, 2, 6, 100, wallMat);

// Training obstacles
for (let i = 0; i < 16; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  if (Math.abs(x) < 7 && Math.abs(z) < 7) continue;

  makeBox("crate" + i, x, 1.5, z, 3, 3, 3, crateMat);
}

// PLAYER
const player = BABYLON.MeshBuilder.CreateCapsule(
  "player",
  { height: 2, radius: 0.45 },
  scene
);
player.position.set(0, 1, 0);
player.material = playerMat;

const head = BABYLON.MeshBuilder.CreateSphere(
  "head",
  { diameter: 0.65 },
  scene
);
head.parent = player;
head.position.y = 0.85;
head.material = headMat;

// CAMERA
let yaw = 0;
let pitch = 0.25;

const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(0, 4, -8),
  scene
);
camera.minZ = 0.1;
camera.fov = 0.9;

// MOUSE CONTROL
canvas.addEventListener("click", () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === canvas) {
    yaw += event.movementX * 0.002;
    pitch += event.movementY * 0.002;
    pitch = Math.max(-0.2, Math.min(0.9, pitch));
  }
});

// KEYBOARD CONTROLS
const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.code] = true;

  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

window.addEventListener("blur", () => {
  for (const key in keys) keys[key] = false;
});

// MOVEMENT
let verticalSpeed = 0;
let grounded = true;

const moveSpeed = 9;
const gravity = 22;
const jumpPower = 8;

function updatePlayer(delta) {
  let forward = 0;
  let sideways = 0;

  if (keys["KeyW"] || keys["ArrowUp"]) forward++;
  if (keys["KeyS"] || keys["ArrowDown"]) forward--;
  if (keys["KeyD"] || keys["ArrowRight"]) sideways++;
  if (keys["KeyA"] || keys["ArrowLeft"]) sideways--;

  const length = Math.hypot(forward, sideways);

  if (length > 0) {
    forward /= length;
    sideways /= length;

    const moveX = Math.sin(yaw) * forward + Math.cos(yaw) * sideways;
    const moveZ = Math.cos(yaw) * forward - Math.sin(yaw) * sideways;

    player.position.x += moveX * moveSpeed * delta;
    player.position.z += moveZ * moveSpeed * delta;

    player.rotation.y = Math.atan2(moveX, moveZ);
  }

  if (keys["Space"] && grounded) {
    verticalSpeed = jumpPower;
    grounded = false;
  }

  verticalSpeed -= gravity * delta;
  player.position.y += verticalSpeed * delta;

  if (player.position.y < 1) {
    player.position.y = 1;
    verticalSpeed = 0;
    grounded = true;
  }

  // Keep player inside the arena
  player.position.x = Math.max(-47, Math.min(47, player.position.x));
  player.position.z = Math.max(-47, Math.min(47, player.position.z));
}

// HUD
const hud = document.createElement("div");
hud.innerHTML = `
  <div id="game-title">BATTLEASH</div>
  <div id="game-health">HEALTH: 100</div>
  <div id="game-controls">WASD: Move | SPACE: Jump | Mouse: Look</div>
  <div id="game-start">CLICK THE GAME TO PLAY</div>
`;
hud.style.cssText = `
  position:fixed;
  inset:0;
  pointer-events:none;
  color:white;
  font-family:Arial,sans-serif;
  text-shadow:2px 2px 4px black;
`;
document.body.appendChild(hud);

const hudStyle = document.createElement("style");
hudStyle.textContent = `
  #game-title {
    position:absolute;top:18px;left:22px;
    font-size:32px;font-weight:900;letter-spacing:3px;
  }
  #game-health {
    position:absolute;bottom:25px;left:22px;
    font-size:20px;font-weight:bold;
    background:#162331cc;padding:12px 18px;border-radius:8px;
  }
  #game-controls {
    position:absolute;bottom:25px;right:22px;
    background:#162331cc;padding:12px;border-radius:8px;
  }
  #game-start {
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%);
    font-size:22px;font-weight:bold;
    background:#162331cc;padding:16px 24px;border-radius:8px;
  }
`;
document.head.appendChild(hudStyle);

document.addEventListener("pointerlockchange", () => {
  document.getElementById("game-start").style.display =
    document.pointerLockElement === canvas ? "none" : "block";
});

// GAME LOOP
engine.runRenderLoop(() => {
  const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);

  updatePlayer(delta);

  const target = player.position.add(new BABYLON.Vector3(0, 0.6, 0));
  const distance = 8;

  camera.position.x = target.x - Math.sin(yaw) * distance * Math.cos(pitch);
  camera.position.y = target.y + Math.sin(pitch) * distance + 1;
  camera.position.z = target.z - Math.cos(yaw) * distance * Math.cos(pitch);

  camera.setTarget(target);
  scene.render();
});

window.addEventListener("resize", () => engine.resize());
