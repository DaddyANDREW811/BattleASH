import * as BABYLON from "@babylonjs/core";
import "./style.css";

const canvas = document.createElement("canvas");
canvas.id = "game";
document.body.appendChild(canvas);

const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

scene.clearColor = new BABYLON.Color4(0.35, 0.65, 0.9, 1);

const camera = new BABYLON.UniversalCamera(
  "camera",
  new BABYLON.Vector3(0, 2, -8),
  scene
);

camera.attachControl(canvas, true);
camera.speed = 0.5;

const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);

const ground = BABYLON.MeshBuilder.CreateGround(
  "ground",
  { width: 100, height: 100 },
  scene
);

const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.45, 0.2);
ground.material = groundMat;

const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
boxMat.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.1);

for (let i = 0; i < 12; i++) {
  const box = BABYLON.MeshBuilder.CreateBox(
    "cover" + i,
    { size: 3 },
    scene
  );

  box.position = new BABYLON.Vector3(
    Math.random() * 35 - 17,
    1.5,
    Math.random() * 35 - 17
  );

  box.material = boxMat;
}

const title = document.createElement("div");
title.innerText = "BATTLEASH";
title.style.cssText =
  "position:fixed;top:15px;left:20px;color:white;font:bold 32px Arial;";
document.body.appendChild(title);

engine.runRenderLoop(() => scene.render());

window.addEventListener("resize", () => engine.resize());
