window.addEventListener("DOMContentLoaded", async () => {
  const cameraCanvas = document.querySelector("#cameraCanvas");
  const threeCanvas = document.querySelector("#threeCanvas");

  // MindAR 初期化（videoTexture を使わない Canvas モード）
  const mindar = new window.MindAR.ImageTracker({
    imageTargetSrc: "./assets/pattern-zeiss-marker.png",
    maxTrack: 2,
  });

  const { renderer, scene, camera } = await mindar.start({
    canvas: threeCanvas,
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

  // GLTF Loader
  const loader = new THREE.GLTFLoader();

  // モデル読み込み（顕微鏡）
  let zeissModel;
  loader.load("./assets/zeiss.glb", (gltf) => {
    zeissModel = gltf.scene;
    zeissModel.scale.set(0.5, 0.5, 0.5);
    zeissModel.visible = false;
    scene.add(zeissModel);
  });

  // モデル読み込み（人工心肺）
  let heartlungModel;
  loader.load("./assets/heartlung.glb", (gltf) => {
    heartlungModel = gltf.scene;
    heartlungModel.scale.set(0.5, 0.5, 0.5);
    heartlungModel.visible = false;
    scene.add(heartlungModel);
  });

  // マーカーごとのイベント
  mindar.on("targetFound", (targetIndex) => {
    if (targetIndex === 0) {
      zeissModel.visible = true;
    }
    if (targetIndex === 1) {
      heartlungModel.visible = true;
    }
  });

  mindar.on("targetLost", (targetIndex) => {
    if (targetIndex === 0) {
      zeissModel.visible = false;
    }
    if (targetIndex === 1) {
      heartlungModel.visible = false;
    }
  });

  // Three.js レンダリングループ
  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
});
