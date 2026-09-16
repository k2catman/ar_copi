// === 基本セットアップ ===
let scene, camera, renderer;
let clock = new THREE.Clock();

// モデル格納用
let models = {
  zeiss: null,
  heartlung: null
};

// マーカーごとの Root（3Dの親）
let markerRoots = {};

// === 初期化 ===
window.addEventListener("load", () => {
  // Three.js シーン
  scene = new THREE.Scene();

  // カメラ
  camera = new THREE.Camera();
  scene.add(camera);

  // レンダラー
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // AR.js 初期化
  let arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam"
  });

  arToolkitSource.init(() => {
    setTimeout(() => {
      onResize();
    }, 2000);
  });

  window.addEventListener("resize", () => {
    onResize();
  });

  function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
  }

  // AR.js コンテキスト
  let arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/data/camera_para.dat",
    detectionMode: "image",
    imageSmoothingEnabled: true
  });

  arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  // === マーカー登録（imageUrl を使うのが超重要） ===
  const markers = [
    { id: "zeiss", url: "./markers/zeiss-marker.png" },
    { id: "heartlung", url: "./markers/heartlung-marker.png" }
  ];

  markers.forEach(m => {
    let root = new THREE.Group();
    scene.add(root);
    markerRoots[m.id] = root;

    new THREEx.ArMarkerControls(arToolkitContext, root, {
      type: "image",
      imageUrl: m.url   // ← ここが最重要（patternUrl では絶対に動かない）
    });
  });

  // === モデル読み込み ===
  const loader = new THREE.GLTFLoader();

  loader.load("./models/zeiss.glb", gltf => {
    models.zeiss = gltf.scene;
    models.zeiss.scale.set(0.5, 0.5, 0.5); // サイズ固定
    markerRoots.zeiss.add(models.zeiss);
  });

  loader.load("./models/heartlung.glb", gltf => {
    models.heartlung = gltf.scene;
    models.heartlung.scale.set(0.5, 0.5, 0.5); // サイズ固定
    markerRoots.heartlung.add(models.heartlung);
  });

  // === 描画ループ ===
  function animate() {
    requestAnimationFrame(animate);

    if (arToolkitSource.ready) {
      arToolkitContext.update(arToolkitSource.domElement);
    }

    renderer.render(scene, camera);
  }

  animate();
});
