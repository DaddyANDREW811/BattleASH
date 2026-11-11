import * as BABYLON from "@babylonjs/core";

const canvas = document.createElement("canvas");
canvas.id = "game";
document.body.appendChild(canvas);

canvas.style.width = "100%";
canvas.style.height = "100vh";
canvas.style.display = "block";

const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.35, 0.65, 0.9, 1);

  const camera = new BABYLON.UniversalCamera(
    "camera",
    new BABYLON.Vector3(0, 2, -8),
    scene
  );
