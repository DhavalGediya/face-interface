// Varibale Declare
let selfieIndex = 1;
let countSelfie = 0;
let isMobileView = window.innerWidth < 600 ? true : false;

let ismultipleCamera = false;
let isFontCamera = true;
// Set the BRFv5 library name here, also set your own appId for reference.
const _libraryName = "brfv5_js_tk240320_v5.1.5_trial.brfv5";
const _appId = "brfv5.browser.minimal.nomodules"; // (mandatory): 8 to 64 characters, a-z . 0-9 allowed
const brfv5 = {}; // The library namespace.
// Those variables will be retrieved from the stream and the library.
let _brfv5Manager = null;
let _brfv5Config = null;
let _width = 0;
let _height = 0;
navigator.mediaDevices?.enumerateDevices().then(gotDevices);
var selectedCameraNum = 0;
let cameraList = [];
let micList = [];
let playSound = false;
let faceData = document.getElementById("faceData");

var tour;

function loadBRFv5Model(
  modelName,
  numChunksToLoad,
  pathToModels = "",
  appId = null,
  onProgress = null
) {
  if (!modelName) {
    throw "Please provide a modelName.";
  }
  return new Promise((resolve, reject) => {
    if (_brfv5Manager && _brfv5Config) {
      resolve({
        brfv5Manager: _brfv5Manager,
        brfv5Config: _brfv5Config,
      });
    } else {
      try {
        brfv5.appId = appId ? appId : _appId;
        brfv5.binaryLocation = pathToModels + _libraryName;
        brfv5.modelLocation = pathToModels + modelName + "_c";
        brfv5.modelChunks = numChunksToLoad; // 4, 6, 8
        brfv5.binaryProgress = onProgress;
        brfv5.binaryError = (e) => {
          reject(e);
        };
        brfv5.onInit = (brfv5Manager, brfv5Config) => {
          _brfv5Manager = brfv5Manager;
          _brfv5Config = brfv5Config;
          resolve({
            brfv5Manager: _brfv5Manager,
            brfv5Config: _brfv5Config,
          });
        };
        brfv5Module(brfv5);
      } catch (e) {
        reject(e);
      }
    }
  });
}

//Get device Cameras for show SwitchCamera button
function gotDevices(mediaDevices) {
  try {
    cameraList = [];
    micList = [];
    mediaDevices.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
        cameraList.push(mediaDevice);
      }
      if (mediaDevice.kind === "audioinput") {
        micList.push(mediaDevice);
      }
    });

    if (cameraList.length > 1 || swCamera) {
      ismultipleCamera = true;
      document.getElementById("btn-switch-camera").style.display = "flex";
    } else {
      ismultipleCamera = false;
      document.getElementById("btn-switch-camera").style.display = "none";
    }
  } catch (err) {
    errorLog("gotDevices", err, "");
  }
}

// Start Camera
function openCamera() {
  return new Promise((resolve, reject) => {
    window.navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 640,
          height: 480,
          frameRate: 30,
          facingMode: isFontCamera
            ? "user"
            : {
                exact: "environment",
              },
        },
      })
      .then((mediaStream) => {
        _webcam.srcObject = mediaStream;
        _webcam
          .play()
          .then(() => {
            resolve({
              width: _webcam.videoWidth,
              height: _webcam.videoHeight,
            });
          })
          .catch((e) => {
            reject(e);
          });
      })
      .catch((e) => {
        reject(e);
      });
  });
}

// Stop Camera
function StopCamera() {
  try {
    const mediaStream = _webcam.srcObject;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      _webcam.pause();
    }
  } catch (err) {
    errorLog("StopCamera", err, "");
  }
}

// configur Faces Tracking
function configureTracking() {
  try {
    if (_brfv5Config !== null && _width > 0) {
      // Camera stream and BRFv5 are ready. Now configure. Internal defaults are set for a 640x480 resolution.
      // So the following isn't really necessary.
      const brfv5Config = _brfv5Config;
      const imageWidth = _width;
      const imageHeight = _height;
      const inputSize = imageWidth > imageHeight ? imageHeight : imageWidth;
      // Setup image data dimensions
      brfv5Config.imageConfig.inputWidth = imageWidth;
      brfv5Config.imageConfig.inputHeight = imageHeight;
      const sizeFactor = inputSize / 480.0;
      // Set face detection region of interest and parameters scaled to the image base size.
      brfv5Config.faceDetectionConfig.regionOfInterest.setTo(
        0,
        0,
        imageWidth,
        imageHeight
      );
      brfv5Config.faceDetectionConfig.minFaceSize = 144 * sizeFactor;
      brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor;
      if (imageWidth < imageHeight) {
        // Portrait mode: probably smartphone, faces tend to be closer to the camera, processing time is an issue,
        // so save a bit of time and increase minFaceSize.
        brfv5Config.faceDetectionConfig.minFaceSize = 240 * sizeFactor;
      }
      // Set face tracking region of interest and parameters scaled to the image base size.
      brfv5Config.faceTrackingConfig.regionOfInterest.setTo(
        0,
        0,
        imageWidth,
        imageHeight
      );
      brfv5Config.faceTrackingConfig.minFaceScaleStart = 70.0 * sizeFactor;
      brfv5Config.faceTrackingConfig.maxFaceScaleStart = 320.0 * sizeFactor;
      brfv5Config.faceTrackingConfig.minFaceScaleReset = 35.0 * sizeFactor;
      brfv5Config.faceTrackingConfig.maxFaceScaleReset = 420.0 * sizeFactor;
      brfv5Config.faceTrackingConfig.confidenceThresholdReset = 0.001;
      brfv5Config.faceTrackingConfig.enableStabilizer = true;
      brfv5Config.faceDetectionConfig.filterNoise = true;
      brfv5Config.faceTrackingConfig.maxRotationXReset = 35.0;
      brfv5Config.faceTrackingConfig.maxRotationYReset = 45.0;
      brfv5Config.faceTrackingConfig.maxRotationZReset = 34.0;
      brfv5Config.faceTrackingConfig.numTrackingPasses = 3;
      brfv5Config.faceTrackingConfig.enableFreeRotation = true;
      brfv5Config.faceTrackingConfig.maxRotationZReset = 999.0;
      brfv5Config.faceTrackingConfig.numFacesToTrack = 1;
      brfv5Config.enableFaceTracking = true;
      _brfv5Manager.configure(_brfv5Config);
      document.getElementsByTagName("body")[0].classList.remove("loader");
      trackFaces();
    }
  } catch (err) {
    errorLog("configureTracking", err, "");
  }
}

// Track Face
function trackFaces() {
  try {
    if (!_brfv5Manager || !_brfv5Config || !_imageData) {
      return;
    }
    const ctx = _imageData.getContext("2d");
    if (fileUpload) {
      ctx.drawImage(faceData, 0, 0, _width, _height);
    } else {
      if (isFontCamera) {
        ctx.setTransform(-1.0, 0, 0, 1, _width, 0); // A virtual mirror should be... mirrored
      }
      ctx.drawImage(_webcam, 0, 0, _width, _height);
    }
    ctx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirror to draw the results
    _brfv5Manager.update(ctx.getImageData(0, 0, _width, _height));
    let doDrawFaceDetection = !_brfv5Config.enableFaceTracking;
    if (_brfv5Config.enableFaceTracking) {
      const sizeFactor = Math.min(_width, _height) / 480.0;
      const faces = _brfv5Manager.getFaces();
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        if (imageIsReady && face.state === brfv5.BRFv5State.FACE_TRACKING) {
          playSound = false;

          document.getElementById("nofaceFoundmob").style.display = "none";
          document.getElementById("nofaceFound").style.display = "none";
          document.getElementById("overlayShade").style.display = "none";

          processLandmarksCallback(
            ctx,
            face.landmarks,
            "#00a0ff",
            2.0 * sizeFactor
          );
        } else {
          var JewelleryToTry1;
          if (!playSound) {
            playSound = true;
          }
          document.getElementById("overlayShade").style.display = "flex";

          let imageB = document.getElementById("nofaceFound");
          imageB.style.position = "relative";
          imageB.style.display = "flex";
          imageB.style.zIndex = "0.9";
          imageB.style.height = _height + "px";
        }
      }
    }
    if (!idImageLoaded || isIphoneDevice) requestAnimationFrame(trackFaces);
  } catch (err) {
    errorLog("trackFaces", err, "");
  }
}

// Call loadBRFv5Model
loadBRFv5Model("68l", 8, "../models/", _appId, (progress) => {
  modelLoadingProgress(progress);
})
  .then(({ brfv5Manager, brfv5Config }) => {
    modelLoadingCompleted();
    _brfv5Manager = brfv5Manager;
    _brfv5Config = brfv5Config;
    configureTracking();
  })
  .catch((e) => {
    errorLog("Face Model Load", e, "");
    // console.error(e);
  });

function drawCircles(ctx, array, color, radius) {
  try {
    ctx.strokeStyle = null;
    ctx.fillStyle = getColor(color, 1.0);
    let _radius = radius || 2.0;
    for (let i = 0; i < array.length; ++i) {
      ctx.beginPath();
      ctx.arc(array[i].x, array[i].y, _radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  } catch (err) {
    errorLog("drawCircles", err, "");
  }
}

function drawRect(ctx, rect, color, lineWidth) {
  try {
    ctx.strokeStyle = getColor(color, 1.0);
    ctx.fillStyle = null;
    ctx.lineWidth = lineWidth || 1.0;
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();
  } catch (err) {
    errorLog("drawRect", err, "");
  }
}

function drawRects(ctx, rects, color, lineWidth) {
  try {
    ctx.strokeStyle = getColor(color, 1.0);
    ctx.fillStyle = null;
    ctx.lineWidth = lineWidth || 1.0;
    for (let i = 0; i < rects.length; ++i) {
      let rect = rects[i];
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.stroke();
    }
  } catch (err) {
    errorLog("drawRects", err, "");
  }
}

// Get Color For Stop Drawing image
function getColor(color, alpha) {
  const colorStr = color + "";
  if (colorStr.startsWith("rgb")) {
    return color;
  }
  if (colorStr.startsWith("#")) {
    color = parseInt("0x" + colorStr.substr(1));
  }
  return (
    "rgb(" +
    ((color >> 16) & 0xff).toString(10) +
    ", " +
    ((color >> 8) & 0xff).toString(10) +
    ", " +
    (color & 0xff).toString(10) +
    ", " +
    alpha +
    ")"
  );
}

// Uploaded or Model Image load in model
function loadImage(path) {
  return new Promise((resolve, reject) => {
    faceData.onload = () => {
      resolve({
        width: faceData.naturalWidth,
        height: faceData.naturalHeight,
      });
    };

    faceData.onerror = (e) => {
      errorLog("loadImage", e, "");
    };

    faceData.src = path;
  });
}

// Uploaded File Image Track
function trackImage(path) {
  try {
    loadImage(path)
      .then(({ width, height }) => {
        if (width >= 540) {
          _width = 540;
        } else {
          _width = width;
        }

        if (height >= 480) {
          _height = 480;
        } else {
          _height = height;
        }
        _imageData.width = _width;
        _imageData.height = _height;
        if (FULLSCREEN == true) {
          _imageData.style.width = "540px";
          _imageData.style.height = "480px";
        }
        configureTracking();
        configureImageInput(_brfv5Config, _width, _height);
      })
      .catch((e) => {
        if (e) {
          errorLog("Model Try on ", e, "");
          // console.error("loadImage failed: ", e);
        }
      });
  } catch (err) {
    errorLog("trackImage", err, "");
  }
}

// Tracked Image Configure
function configureImageInput(brfv5Config, imageWidth, imageHeight) {
  try {
    const inputSize = imageWidth > imageHeight ? imageHeight : imageWidth;

    const sizeFactor = inputSize / 480.0;

    brfv5Config.faceDetectionConfig.minFaceSize = 48 * sizeFactor;
    brfv5Config.faceDetectionConfig.maxFaceSize = 480 * sizeFactor;

    brfv5Config.faceDetectionConfig.faceSizeIncrease = 24;
    brfv5Config.faceDetectionConfig.stepSize = 0;
    brfv5Config.faceDetectionConfig.minNumNeighbors = 12;
    brfv5Config.faceDetectionConfig.filterNoise = true;

    brfv5Config.faceTrackingConfig.minFaceScaleStart = 24.0 * sizeFactor;
    brfv5Config.faceTrackingConfig.maxFaceScaleStart = 1480.0 * sizeFactor;

    brfv5Config.faceTrackingConfig.maxRotationXStart = 999.0;
    brfv5Config.faceTrackingConfig.maxRotationYStart = 999.0;
    brfv5Config.faceTrackingConfig.maxRotationZStart = 999.0;

    brfv5Config.faceTrackingConfig.confidenceThresholdStart = 0.0;

    brfv5Config.faceTrackingConfig.minFaceScaleReset = 16.0 * sizeFactor;
    brfv5Config.faceTrackingConfig.maxFaceScaleReset = 1480.0 * sizeFactor;

    brfv5Config.faceTrackingConfig.maxRotationXReset = 999.0;
    brfv5Config.faceTrackingConfig.maxRotationYReset = 999.0;
    brfv5Config.faceTrackingConfig.maxRotationZReset = 999.0;

    brfv5Config.faceTrackingConfig.confidenceThresholdReset = 0.0;

    brfv5Config.faceTrackingConfig.enableStabilizer = true;

    _brfv5Manager.configure(_brfv5Config);
    document.getElementsByTagName("body")[0].classList.remove("loader");
    trackFaces();
  } catch (err) {
    errorLog("configureImageInput", err, "");
  }
}

// For Page Load than call
function pageLoaded() {
  try {
    loadProjectCatalogueImages();
    camerastart();
  } catch (err) {
    errorLog("Page Load", err, "");
  }
}

// Upload Image
function uploadimage() {
  try {
    document.getElementById("file").click();
  } catch (err) {
    errorLog("uploadimage", err, "");
  }
}

// Uploaded file output for background image and model draw
function getoutput(input) {
  try {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $("#faceData").attr("src", e.target.result).width(150).height(200);
        fileUpload = true;
        imageIsReady = true;
        StopCamera();
        document.getElementById("photoUpload").style.background =
          "url(" + e.target.result + ")";
        trackImage(e.target.result);

        requestAnimationFrame(trackFaces);

        _imageData.classList.remove("_imageData");
        _imageData.classList.remove("_imagePhoto");
        _imageData.classList.add("_imageUploadPhoto");
        document
          .getElementById("_canvas_container")
          .classList.add("_canvas_container_upload");
        document
          .getElementById("_canvas_container")
          .classList.remove("_canvas_container");
        document.getElementById("btn-live-tryon").style.display = "flex";

        if (ismultipleCamera)
          document.getElementById("btn-switch-camera").style.display = "none";
      };

      reader.readAsDataURL(input.files[0]);
    }
  } catch (err) {
    errorLog("getoutput", err, "");
  }
}

// Camera Start
function camerastart() {
  try {
    document.getElementById("loder").style.display = "flex";
    _imageData.classList.add("_imageData");
    _imageData.classList.remove("_imagePhoto");
    _imageData.classList.remove("_imageUploadPhoto");
    imageIsReady = false;
    idImageLoaded = false;
    document.getElementById("btn-live-tryon").style.display = "none";

    if (ismultipleCamera)
      document.getElementById("btn-switch-camera").style.display = "flex";

    fileUpload = false;
    _imageData.classList.add("_imageData");
    _imageData.classList.remove("_imagePhoto");

    document
      .getElementById("_canvas_container")
      .classList.remove("_canvas_container_upload");
    document
      .getElementById("_canvas_container")
      .classList.add("_canvas_container");

    document.getElementById("file").value = "";

    openCamera()
      .then(({ width, height }) => {
        imageIsReady = true;
        document.getElementById("loder").style.display = "none";

        _width = width;
        _height = height;
        _imageData.width = _width;
        _imageData.height = _height;
        if (FULLSCREEN == true) {
          if (isMobile()) {
            _imageData.style.width = "100%";
            _imageData.style.height = "100%";
            _imageData.style.Objectfit = "cover";
          } else {
            _imageData.style.width = "540px";
            _imageData.style.height = "480px";
          }
        }
        configureTracking();
        tour.start();
      })
      .catch((e) => {
        if (e) {
          cameraFailedCallback(e);
        }
      });
  } catch (err) {
    errorLog("camerastart", err, "");
  }
}

// Model Popup Open
function tryItonModel() {
  try {
    document.getElementById("modelTryon").style.display = "block";
  } catch (err) {
    errorLog("tryItonModel", err, "");
  }
}

// Opened Model POPup Close
function closeModel() {
  try {
    document.getElementById("modelTryon").style.display = "none";
  } catch (err) {
    errorLog("closeModel", err, "");
  }
}

// popUp Out side Click Than Close
$(".overlaytrymodel").click(function () {
  try {
    document.getElementById("modelTryon").style.display = "none";
  } catch (err) {
    errorLog("overlaytrymodel", err, "");
  }
});

// Model popup Image Select
function imageClick(imageUrl) {
  try {
    requestAnimationFrame(trackFaces);
    _imageData.classList.remove("_imageData");
    _imageData.classList.remove("_imagePhoto");
    _imageData.classList.add("_imageUploadPhoto");

    document.getElementById("btn-live-tryon").style.display = "flex";
    document.getElementById("modelTryon").style.display = "none";

    if (ismultipleCamera)
      document.getElementById("btn-switch-camera").style.display = "none";

    document
      .getElementById("_canvas_container")
      .classList.add("_canvas_container_upload");
    document
      .getElementById("_canvas_container")
      .classList.remove("_canvas_container");

    document.getElementById("photoUpload").style.background =
      "url(" + imageUrl + ")";
    $("#faceData").attr("src", imageUrl).width(150).height(200);
    fileUpload = true;
    imageIsReady = true;
    StopCamera();
    trackImage(imageUrl);
  } catch (err) {
    errorLog("imageClick", err, "");
  }
}

// Swith Camera Click
function switchCamera() {
  try {
    StopCamera();
    isFontCamera = !isFontCamera;

    openCamera()
      .then(({ width, height }) => {
        imageIsReady = true;
        document.getElementById("loder").style.display = "none";
        _width = width;
        _height = height;
        _imageData.width = _width;
        _imageData.height = _height;
        if (FULLSCREEN == true) {
          if (isMobile()) {
            _imageData.style.width = "100%";
            _imageData.style.height = "100%";
            _imageData.style.Objectfit = "cover";
          } else {
            _imageData.style.width = "540px";
            _imageData.style.height = "480px";
          }
        }
        configureTracking();
        tour.start();
      })
      .catch((e) => {
        if (e) {
          cameraFailedCallback(e);
        }
      });
  } catch (err) {
    errorLog("switchCamera", err, "");
  }
}

// Goto Tryon Image tab
function Openmenu() {
  try {
    document
      .getElementById("ImagePanelselfie")
      .classList.remove("imagepanelactive");

    document.getElementById("Menu_layer").classList.add("menuactive");
    document.getElementById("ImagePanel").classList.add("imagepanelactive");

    document.getElementById("selfie-gallery").classList.remove("ishidden");
    document.getElementById("menu").classList.add("ishidden");
    document.getElementById("menutext").classList.add("ishidden");
    document.getElementById("selfietext").classList.remove("ishidden");

    document.getElementById("countSelfie").style.display = "flex";

    setTimeout(() => {
      document.getElementById("NecklaceImage").classList.add("moveanimation");
      document
        .getElementById("NecklaceImage")
        .classList.remove("removeanimation");
      setTimeout(() => {
        document
          .getElementById("NecklaceImage")
          .classList.add("removeanimation");
        document
          .getElementById("NecklaceImage")
          .classList.remove("moveanimation");
      }, 1000);
    }, 1000);
  } catch (err) {
    errorLog("Openmenu", err, "");
  }
}

// Goto Selfie Gallery tab
function selfiegallery() {
  try {
    document.getElementById("ImagePanel").classList.remove("imagepanelactive");

    document
      .getElementById("ImagePanelselfie")
      .classList.add("imagepanelactive");

    document.getElementById("selfie-gallery").classList.add("ishidden");
    document.getElementById("menu").classList.remove("ishidden");
    document.getElementById("menutext").classList.remove("ishidden");
    document.getElementById("selfietext").classList.add("ishidden");

    document.getElementById("countSelfie").style.display = "none";
  } catch (err) {
    errorLog("selfiegallery", err, "");
  }
}

// Start Tour
function getHelp() {
  try {
    localStorage.removeItem("tour_end");
    localStorage.removeItem("tour_current_step");
    localStorage.removeItem("faceHint");
    setTimeout(() => {
      tour.start();
    }, 1000);
  } catch (err) {
    errorLog("getHelp", err, "");
  }
}

// Find is Web or Mobile Device
function isMobile() {
  try {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    errorLog("isMobile", err, "");
    return false;
  }
}

// Capture Selfies
function captureScreen() {
  addToSelfieGallery();
}

// Capture Selfies Add in Selfie Gallery
function addToSelfieGallery() {
  try {
    let canvas = document.getElementById("_imageData");
    let clientWaterMark = document.getElementById("clientLogo");
    let dupCanvas = canvas;
    let ctx = dupCanvas.getContext("2d");
    ctx.drawImage(clientWaterMark, canvas.width - 125, 0, "125", "125");
    let img = dupCanvas.toDataURL("image/png");
    let filename = "MelzoLiveTryOn";
    let imgel = document.createElement("img");
    imgel.src = img;
    imgel.id = "capturedSelfieImageel" + selfieIndex;

    imgel.style.padding = "2px";

    imgel.className = "imageImgSelfie";

    let imgcontainer = document.getElementById("Selfie__Container");

    let div = document.createElement("div");
    div.className = "containerImgSelfie";
    div.appendChild(imgel);

    let middleDiv = document.createElement("div");
    middleDiv.className = "middle";

    let graylayerDiv = document.createElement("div");
    graylayerDiv.className = "graylayer";

    let dwnldbtn = document.createElement("img");
    dwnldbtn.addEventListener("click", () => {
      downloadURI(imgel.id);
    });
    dwnldbtn.style.margin = "auto 10px auto auto";
    dwnldbtn.className = "downloadbutton";
    dwnldbtn.src = "../image/singledownloadcolor.png";
    dwnldbtn.style.marginRight = "10px";

    let sharebtn = document.createElement("img");
    sharebtn.addEventListener("click", () => {
      sharePic(imgel.id);
    });
    sharebtn.style.margin = "auto 10px auto auto";

    sharebtn.src = "../image/singlesharinggrey.png";
    sharebtn.className = "sharebutton";

    middleDiv.appendChild(dwnldbtn);
    div.appendChild(middleDiv);
    div.appendChild(graylayerDiv);

    imgcontainer.appendChild(div);

    selfieIndex++;
    if (document.getElementById("toolTip1").style.display == "none") {
      document.getElementById("selfie-gallery").click();
    }
    document.getElementById("toolTip1").style.display = "flex";
    document.getElementById("notification-box").style.display = "block";
    setTimeout(() => {
      document.getElementById("notification-box").style.display = "none";
    }, 1500);

    document.getElementById("finalMenu").style.display = "flex";
    countSelfie++;
    document.getElementById("countSelfie").innerHTML = countSelfie;
  } catch (err) {
    errorLog("addToSelfieGallery", err, "");
  }
}

// Download Captured Selfies
downloadURI = (id) => {
  try {
    let filename = "MelzoLiveTryOn";
    var link = document.createElement("a");
    link.download = filename;
    link.href = document.getElementById(id).src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  } catch (err) {
    errorLog("downloadURI", err, "");
  }
};

// Get blob File URL
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURI.split(",")[1]);
  else byteString = unescape(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {
    type: mimeString,
  });
}

// Download All Captured Selfies
function downloadAllPic() {
  try {
    let totalNumberOfImg = selfieIndex;
    for (let index = 1; index < totalNumberOfImg; index++) {
      let str = "capturedSelfieImageel" + index;
      downloadURI(str);
    }
  } catch (err) {
    errorLog("downloadAllPic", err, "");
  }
}
