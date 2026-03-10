import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../public/models");

class NodeFileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }

  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }

  async readAsDataURL(blob) {
    const buffer = Buffer.from(await blob.arrayBuffer());
    this.result = `data:${blob.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    this.onloadend?.();
  }
}

globalThis.FileReader = NodeFileReader;

function buildJar() {
  const group = new THREE.Group();
  group.name = "GlassJar";

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.88, 1.9, 56, 1, true),
    new THREE.MeshStandardMaterial({ color: "#ffffff" }),
  );
  body.name = "GlassBody";
  group.add(body);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.88, 0.08, 56),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  base.name = "GlassBase";
  base.position.y = -0.94;
  group.add(base);

  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.8, 0.42, 56),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  lid.name = "Lid";
  lid.position.y = 1.14;
  group.add(lid);

  return group;
}

function buildPosterFrame() {
  const group = new THREE.Group();
  group.name = "PosterFrame";

  const material = new THREE.MeshStandardMaterial({ color: "#d6dae0" });
  const horizontal = new THREE.BoxGeometry(1.84, 0.1, 0.12);
  const vertical = new THREE.BoxGeometry(0.1, 2.36, 0.12);

  const top = new THREE.Mesh(horizontal, material);
  top.name = "FrameTop";
  top.position.y = 1.14;

  const bottom = top.clone();
  bottom.name = "FrameBottom";
  bottom.position.y = -1.14;

  const left = new THREE.Mesh(vertical, material);
  left.name = "FrameLeft";
  left.position.x = -0.87;

  const right = left.clone();
  right.name = "FrameRight";
  right.position.x = 0.87;

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(1.74, 2.26, 0.04),
    new THREE.MeshStandardMaterial({ color: "#11151c" }),
  );
  backing.name = "PosterSurface";
  backing.position.z = -0.02;

  group.add(top, bottom, left, right, backing);
  return group;
}

function buildBottle() {
  const group = new THREE.Group();
  group.name = "FragranceBottle";

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 1.85, 8, 1, false),
    new THREE.MeshStandardMaterial({ color: "#ffffff" }),
  );
  body.name = "BottleBody";
  group.add(body);

  const shoulder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.48, 0.38, 32),
    new THREE.MeshStandardMaterial({ color: "#ffffff" }),
  );
  shoulder.name = "BottleShoulder";
  shoulder.position.y = 1.1;
  group.add(shoulder);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.54, 0.44),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  cap.name = "Cap";
  cap.position.y = 1.56;
  group.add(cap);

  return group;
}

function buildBillboard() {
  const group = new THREE.Group();
  group.name = "Billboard";

  const legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 2.2, 0.16),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  legs.name = "BillboardLeg";
  legs.position.set(-0.9, -0.9, 0);

  const legsRight = legs.clone();
  legsRight.position.x = 0.9;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(3.08, 1.92, 0.14),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  frame.name = "BillboardFrame";
  frame.position.y = 0.55;

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(2.84, 1.68, 0.04),
    new THREE.MeshStandardMaterial({ color: "#11151c" }),
  );
  screen.name = "BillboardScreen";
  screen.position.set(0, 0.55, 0.06);

  group.add(legs, legsRight, frame, screen);
  return group;
}

function buildBox() {
  const group = new THREE.Group();
  group.name = "PackagingBox";

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.9, 1.4),
    new THREE.MeshStandardMaterial({ color: "#ffffff" }),
  );
  body.name = "BoxBody";
  group.add(body);

  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(1.68, 0.28, 1.48),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  lid.name = "BoxLid";
  lid.position.y = 1.08;
  group.add(lid);

  return group;
}

function buildTshirt() {
  const group = new THREE.Group();
  group.name = "Tshirt";

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-0.7, 1.05);
  bodyShape.lineTo(-1.2, 0.62);
  bodyShape.lineTo(-0.92, 0.18);
  bodyShape.lineTo(-0.62, 0.42);
  bodyShape.lineTo(-0.62, -1.1);
  bodyShape.lineTo(0.62, -1.1);
  bodyShape.lineTo(0.62, 0.42);
  bodyShape.lineTo(0.92, 0.18);
  bodyShape.lineTo(1.2, 0.62);
  bodyShape.lineTo(0.7, 1.05);
  bodyShape.lineTo(0.34, 1.05);
  bodyShape.absarc(0, 1.02, 0.34, 0, Math.PI, true);
  bodyShape.lineTo(-0.34, 1.05);

  const shirt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.14,
      bevelEnabled: false,
    }),
    new THREE.MeshStandardMaterial({ color: "#ffffff" }),
  );
  shirt.name = "ShirtBody";
  shirt.geometry.center();
  group.add(shirt);

  return group;
}

function buildLaptop() {
  const group = new THREE.Group();
  group.name = "Laptop";

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.12, 1.7),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  base.name = "LaptopBase";
  base.position.y = -0.92;
  group.add(base);

  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.42, 1.58, 0.1),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  screenFrame.name = "LaptopFrame";
  screenFrame.position.set(0, 0.1, -0.76);
  screenFrame.rotation.x = -1.12;
  group.add(screenFrame);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(2.22, 1.38, 0.03),
    new THREE.MeshStandardMaterial({ color: "#11151c" }),
  );
  screen.name = "LaptopScreen";
  screen.position.set(0, 0.12, -0.7);
  screen.rotation.x = -1.12;
  group.add(screen);

  return group;
}

function buildPhone() {
  const group = new THREE.Group();
  group.name = "Phone";

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 1.94, 0.14),
    new THREE.MeshStandardMaterial({ color: "#d6dae0" }),
  );
  body.name = "PhoneBody";
  group.add(body);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 1.72, 0.03),
    new THREE.MeshStandardMaterial({ color: "#11151c" }),
  );
  screen.name = "PhoneScreen";
  screen.position.z = 0.07;
  group.add(screen);

  return group;
}

async function exportModel(fileName, scene) {
  const exporter = new GLTFExporter();
  scene.updateMatrixWorld(true);

  const result = await new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (value) => resolve(value),
      (error) => reject(error),
      {
        binary: true,
        onlyVisible: true,
      },
    );
  });

  await writeFile(path.join(outputDir, fileName), Buffer.from(result));
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await exportModel("glass-jar.glb", buildJar());
  await exportModel("poster-frame.glb", buildPosterFrame());
  await exportModel("billboard.glb", buildBillboard());
  await exportModel("packaging-box.glb", buildBox());
  await exportModel("tshirt.glb", buildTshirt());
  await exportModel("laptop.glb", buildLaptop());
  await exportModel("phone.glb", buildPhone());
  await exportModel("fragrance-bottle.glb", buildBottle());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
