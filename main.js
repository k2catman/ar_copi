window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(camera);

  // カメラ映像
  const video = document.createElement("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;
    });

  // ARToolkit 初期化
  const arController = new ARController(canvas, 640, 480, "./assets/camera_para.dat");

  arController.onload = () => {
    arController.addPatternMarker("./assets/pattern-zeiss-marker.patt", (markerId) => {
      console.log("Zeiss marker loaded:", markerId);
    });

    arController.addPatternMarker("./assets/pattern-heartlung-marker.patt", (markerId) => {
      console.log("Heartlung marker loaded:", markerId);
    });

    // モデル読み込み
    const loader = new THREE.GLTFLoader();

    let zeissModel, heartlungModel;

    loader.load("./assets/zeiss.glb", (gltf) => {
      zeissModel = gltf.scene;
      zeissModel.scale.set(0.5, 0.5, 0.5);
      zeissModel.visible = false;
      scene.add(zeissModel);
    });

    loader.load("./assets/heartlung.glb", (gltf) => {
      heartlungModel = gltf.scene;
      heartlungModel.scale.set(0.5, 0.5, 0.5);
      heartlungModel.visible = false;
      scene.add(heartlungModel);
    });

    // レンダリングループ
    function render() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        arController.process(video);

        const markers = arController.getMarkerNum();
        for (let i = 0; i < markers; i++) {
          const marker = arController.getMarker(i);

          if (marker.idPatt === 0 && zeissModel) {
            zeissModel.visible = true;
            zeissModel.matrix.fromArray(marker.matrix);
          } else if (marker.idPatt === 1 && heartlungModel) {
            heartlungModel.visible = true;
            heartlungModel.matrix.fromArray(marker.matrix);
          }
        }
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    render();
  };
});
