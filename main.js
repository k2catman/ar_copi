import { MindARImage } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.0/dist/mindar-image.prod.js";

window.addEventListener("DOMContentLoaded", async () => {
  const cameraCanvas = document.querySelector("#cameraCanvas");
  const threeCanvas = document.querySelector("#threeCanvas");

  // MindAR 初期化（videoTexture を使わない）
  const mindar = new MindARImage({
    container: document.body,
    imageTargetSrc: "./assets/marker.png",
    maxTrack: 1,
  });

  const { renderer, scene, camera } = await mindar.start({
    canvas: threeCanvas,
    imageTargetSrc: "./assets/marker.png",
  });

  // カメラ映像を canvas に描画する
  const video = mindar.video;
  const ctx = cameraCanvas.getContext("2d");

  function drawCamera() {
    ctx.drawImage(video, 0, 0, cameraCanvas.width, cameraCanvas.height);
    requestAnimationFrame(drawCamera);
  }

  video.addEventListener("loadeddata", () => {
    cameraCanvas.width = video.videoWidth;
    cameraCanvas.height = video.videoHeight;
    drawCamera();
  });

  // 3Dモデル読み込み
  const loader = new THREE.GLTFLoader();
  loader.load("./assets/model.glb", (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    model.visible = false;
    scene.add(model);

    mindar.on("targetFound", () => {
      model.visible = true;
    });

    mindar.on("targetLost", () => {
      model.visible = false;
    });

    function render() {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();
  });
});
