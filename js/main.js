// ===============================
// AR.js + Three.js main.js
// pattern-zeiss-marker.patt
// pattern-heartlung-marker.patt
// zeiss.glb / heartlung.glb
// ===============================

let renderer, scene, camera;
let arSource, arContext;
let markerZeiss, markerHeartLung;

init();
animate();

function init() {
    // レンダラー
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    // シーン & カメラ
    scene = new THREE.Scene();
    camera = new THREE.Camera();
    scene.add(camera);

    // AR.js ソース（カメラ）
    arSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam'
    });

    arSource.init(() => onResize());
    window.addEventListener('resize', () => onResize());

    // AR.js コンテキスト
    arContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono',
        maxDetectionRate: 30,
        canvasWidth: 640,
        canvasHeight: 480
    });

    arContext.init(() => {
        camera.projectionMatrix.copy(arContext.getProjectionMatrix());
    });

    // ===============================
    // マーカー設定
    // ===============================

    // 顕微鏡（Zeiss）
    markerZeiss = new THREE.Group();
    scene.add(markerZeiss);

    new THREEx.ArMarkerControls(arContext, markerZeiss, {
        type: 'pattern',
        patternUrl: './markers/pattern-zeiss-marker.patt'
    });

    // 人工心肺
    markerHeartLung = new THREE.Group();
    scene.add(markerHeartLung);

    new THREEx.ArMarkerControls(arContext, markerHeartLung, {
        type: 'pattern',
        patternUrl: './markers/pattern-heartlung-marker.patt'
    });

    // ===============================
    // 3Dモデル読み込み
    // ===============================

    const loader = new THREE.GLTFLoader();

    // 顕微鏡モデル（zeiss.glb）
    loader.load(
        'models/zeiss.glb',
        gltf => {
            const model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(0, 0, 0);
            markerZeiss.add(model);
        }
    );

    // 人工心肺モデル（heartlung.glb）
    loader.load(
        'models/heartlung.glb',
        gltf => {
            const model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(0, 0, 0);
            markerHeartLung.add(model);
        }
    );

    // ライト
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(light);
}

function onResize() {
    arSource.onResizeElement();
    arSource.copyElementSizeTo(renderer.domElement);
    if (arContext.arController !== null) {
        arSource.copyElementSizeTo(arContext.arController.canvas);
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!arSource.ready) return;

    arContext.update(arSource.domElement);
    renderer.render(scene, camera);
}
