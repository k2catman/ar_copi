// ===============================
// AR.js + Three.js main.js
// microscope.patt / heartlung.patt の2マーカー対応
// ===============================

let renderer, scene, camera;
let arSource, arContext;
let markerMicroscope, markerHeartLung;

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

    arSource.init(function onReady() {
        onResize();
    });

    window.addEventListener('resize', function () {
        onResize();
    });

    // AR.js コンテキスト
    arContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono',
        maxDetectionRate: 30,
        canvasWidth: 640,
        canvasHeight: 480
    });

    arContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arContext.getProjectionMatrix());
    });

    // ===============================
    // マーカー設定
    // ===============================

    // 顕微鏡用マーカー
    markerMicroscope = new THREE.Group();
    scene.add(markerMicroscope);

    let markerControlsMicroscope = new THREEx.ArMarkerControls(arContext, markerMicroscope, {
        type: 'pattern',
        patternUrl: 'markers/microscope.patt'
    });

    // 人工心肺用マーカー
    markerHeartLung = new THREE.Group();
    scene.add(markerHeartLung);

    let markerControlsHeartLung = new THREEx.ArMarkerControls(arContext, markerHeartLung, {
        type: 'pattern',
        patternUrl: 'markers/heartlung.patt'
    });

    // ===============================
    // 3Dモデル読み込み
    // ===============================

    const loader = new THREE.GLTFLoader();

    // 顕微鏡モデル
    loader.load(
        'models/microscope.glb',
        function (gltf) {
            let model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);   // 適宜調整
            model.position.set(0, 0, 0);
            markerMicroscope.add(model);
        }
    );

    // 人工心肺モデル
    loader.load(
        'models/heartlung.glb',
        function (gltf) {
            let model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);   // 適宜調整
            model.position.set(0, 0, 0);
            markerHeartLung.add(model);
        }
    );

    // 簡易ライト
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
