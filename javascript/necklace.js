/* eslint-disable */
let fileUpload = false;
let imageIsReady = false;
let idImageLoaded = false;

const queryString = new URLSearchParams(window.location.search);
var data = queryString.get("imageurl");
if (data == null) {
  data = "images/jewellery/earring01.png";
}
const JEWELLERY_IMAGE_URL = data;

var data = queryString.get("imagetype");
if (data == null) {
  data = "EARRING";
}
const IMAGE_TYPE = data;

var data = queryString.get("EDT");
if (data == null) {
  data = 0.28;
}
const THRESHOLD_FOR_EARING_DETECTION = Number(data);

var data = queryString.get("EPT");
if (data == null) {
  data = 5;
}
const THRESHOLD_FOR_EARING_PLACEMENT = Number(data);

var data = queryString.get("FTT");
if (data == null) {
  data = 0.25;
}
const THRESHOLD_FOR_FACE_TILT = Number(data);

var data = queryString.get("JScale");
if (data == null) {
  data = 0.5;
}
const JEWELLERY_SIZE = Number(data);

var data = queryString.get("verbose");
if (data == null) {
  data = false;
} else if (data == "true") {
  data = true;
} else {
  data = false;
}
const VERBOSE = true;

var data = queryString.get("fullscreen");
if (data == null) {
  data = true;
} else if (data == "false") {
  data = false;
} else {
  data = true;
}
const FULLSCREEN = data;

// Create Canvas
if (FULLSCREEN == true) {
  document.getElementById("_canvas_container").innerHTML =
    '<canvas id="_imageData" class="_imageData"></canvas>';
} else {
  document.getElementById("_canvas_container").innerHTML =
    '<h2>JEWELLERY TRY ON</h2><div style="border-bottom: 1px solid #f0f0f0;">&nbsp;</div><br/>&nbsp;<br/><canvas id="_imageData" class="_imageData"></canvas>';
}

const _webcam = document.getElementById("_webcam");
const _imageData = document.getElementById("_imageData");
const BRFv5ModelPath = "./models/";

// Camera Load Error
function cameraFailedCallback(err) {
  try {
    if (document.getElementById("camera-popup")) {
      document.getElementById("camera-popup").style.display = "block";
    }
    errorLog("Camera Start Error", err, "");
  } catch (error) {
    errorLog("Camera Start Error", error, "");
  }
}

// Model Load Error
function modelLoadingFailedCallback(err) {
  try {
    errorLog("BRFv5 Model Load ", err, "");
  } catch (error) {
    errorLog("BRFv5 Model Load", error, "");
  }
}

function modelLoadingProgress(progress) {}

function modelLoadingCompleted() {}

// Close Model PopUp
function closePopup() {
  try {
    document.getElementById("camera-popup").style.display = "none";
    window.location.href = "/";
  } catch (err) {
    errorLog("closePopup", err, "");
  }
}



// Get Array And LandMark of Face Points Array
function processLandmarksCallback(ctx, array, color, radius) {
  try {
    const nose_point = array[30];
    const nosepin_right_point = array[34];
    const nosepin_left_point = array[31];

    const left_ear_point = array[2];
    const right_ear_point = array[14];
    const point_above_nose_point = array[29];
    const left_neck_point = array[3];
    const right_neck_point = array[13];
    const lip_point = array[62];

    // Initializing the Drawing Colors
    ctx.strokeStyle = null;
    ctx.fillStyle = getColor(color, 1.0);
    let _radius = radius || 2.0;

    // Transforming the Plane Coordinates to that of Geometric Plane
    var left_ear_point_transformed = {
      x: left_ear_point.x - nose_point.x,
      y: nose_point.y - left_ear_point.y,
    };
    var right_ear_point_transformed = {
      x: right_ear_point.x - nose_point.x,
      y: nose_point.y - right_ear_point.y,
    };

    // Transforming the plane cordinates to that of geometric plane for neck
    var left_neck_point_transformed = {
      x: left_neck_point.x - lip_point.x,
      y: lip_point.y - left_neck_point.y,
    };
    var right_neck_point_transformed = {
      x: right_neck_point.x - lip_point.x,
      y: lip_point.y - right_neck_point.y,
    };

    var point_of_intersection = {
      x: 0,
      y: 0,
    };
    var slope = 0;

    var point_of_neck_intersection = {
      x: 0,
      y: 0,
    };
    var neck_slope = 0;
    var point_of_neck_midpoint = {
      x: 0,
      y: 0,
    };

    // Calculating the Slope of the Line
    if (left_ear_point_transformed.x == right_ear_point_transformed.x) {
      point_of_intersection.x = left_ear_point_transformed.x;
    } else if (left_ear_point_transformed.y == right_ear_point_transformed.y) {
      point_of_intersection.y = left_ear_point_transformed.y;
    } else {
      slope =
        (right_ear_point_transformed.y - left_ear_point_transformed.y) /
        (right_ear_point_transformed.x - left_ear_point_transformed.x);
      point_of_intersection.x =
        (slope * slope * left_ear_point_transformed.x -
          slope * left_ear_point_transformed.y) /
        (1 + slope * slope);
      point_of_intersection.y =
        left_ear_point_transformed.y +
        slope * point_of_intersection.x -
        slope * left_ear_point_transformed.x;
    }
    point_of_intersection.x = point_of_intersection.x + nose_point.x;
    point_of_intersection.y = nose_point.y - point_of_intersection.y;

    // Calculating the Slope of the neck Line
    if (left_neck_point.x == right_neck_point.x) {
      point_of_neck_intersection.x = left_neck_point.x;
    } else if (left_neck_point.y == right_neck_point.y) {
      point_of_neck_intersection.y = left_neck_point.y;
    } else {
      neck_slope =
        (right_neck_point_transformed.y - left_neck_point_transformed.y) /
        (right_neck_point_transformed.x - left_neck_point_transformed.x);

      point_of_neck_intersection.x =
        (neck_slope * neck_slope * left_neck_point.x -
          neck_slope * left_neck_point.y) /
        (1 + neck_slope * neck_slope);
      point_of_neck_intersection.y =
        left_neck_point.y +
        neck_slope * point_of_neck_intersection.x -
        neck_slope * left_neck_point.x;
    }
    point_of_neck_intersection.x = point_of_neck_intersection.x + lip_point.x;
    point_of_neck_intersection.y = lip_point.y - point_of_neck_intersection.y;
    point_of_neck_midpoint.x = array[62].x;
    point_of_neck_midpoint.y = array[62].y + 60;

    if (VERBOSE == true) {
      // Drawing the Normal Line
    }

    // Exit if Tilt is Large
    if (!fileUpload && Math.abs(neck_slope) > THRESHOLD_FOR_FACE_TILT) {
      ctx.fillStyle = "red";
      return;
    }

    // Exit if Not Vertically Center
    if (
      !fileUpload &&
      Math.abs(_height / 2 - lip_point.y) / (_height / 2) > 0.2
    ) {
      ctx.fillStyle = "red";
      return;
    }

    // Exit if Not Horizontally Center
    var twv = _width - right_neck_point.x + left_neck_point.x;
    if (
      !fileUpload &&
      Math.abs(twv / 2 - left_neck_point.x) / (twv / 2) > 0.5
    ) {
      ctx.fillStyle = "red";
      return;
    }

    // Calculating the Face Angle For determing which all Earrings to Show
    var distanceBetweenNeckPoints = Math.sqrt(
      Math.pow(left_neck_point.y - right_neck_point.y, 2) +
        Math.pow(left_neck_point.x - right_neck_point.x, 2)
    );
    var distanceBetweenLNeckAndMidPoint = Math.sqrt(
      Math.pow(point_of_neck_midpoint.y - left_neck_point.y, 2) +
        Math.pow(point_of_neck_midpoint.x - left_neck_point.x, 2)
    );
    var distanceBetweenRNeckAndMidPoint = Math.sqrt(
      Math.pow(point_of_neck_midpoint.y - right_neck_point.y, 2) +
        Math.pow(point_of_neck_midpoint.x - right_neck_point.x, 2)
    );

    // Difference between distance of (leftEar, faceMidPoint) and distance of (rightEar,faceMidPoint)
    var SepartionNeckPointDistance =
      distanceBetweenLNeckAndMidPoint - distanceBetweenRNeckAndMidPoint;
    var DifferenceNeckPercentage = "ERROR!...";
    if (distanceBetweenNeckPoints > 0) {
      // Calculating percentage ratio between Separation NeckPoint distance and distance between(leftPoint, RightPoint)
      DifferenceNeckPercentage =
        (SepartionNeckPointDistance * 100) / distanceBetweenNeckPoints;
      DifferenceNeckPercentage = DifferenceNeckPercentage.toFixed(2);
    }

    // Calculating the Face Angle For determing which all Earrings to Show

    // Distance between left point and right point
    var distanceBetweenEars = Math.sqrt(
      Math.pow(left_ear_point.y - right_ear_point.y, 2) +
        Math.pow(left_ear_point.x - right_ear_point.x, 2)
    );

    var distanceBetweenLEarAndIntersectionPoint = Math.sqrt(
      Math.pow(point_of_intersection.y - left_ear_point.y, 2) +
        Math.pow(point_of_intersection.x - left_ear_point.x, 2)
    );
    var distanceBetweenREarAndIntersectionPoint = Math.sqrt(
      Math.pow(point_of_intersection.y - right_ear_point.y, 2) +
        Math.pow(point_of_intersection.x - right_ear_point.x, 2)
    );
    var SepartionDistance =
      distanceBetweenLEarAndIntersectionPoint -
      distanceBetweenREarAndIntersectionPoint;
    var DifferencePercentage = "ERROR!...";
    if (distanceBetweenEars > 0) {
      DifferencePercentage = (SepartionDistance * 100) / distanceBetweenEars;
      DifferencePercentage = DifferencePercentage.toFixed(2);
    }

    // Necklace Draw in Canvas
    var JewelleryToTry1 = document.getElementById("NecklaceToTry");
    if (IMAGE_TYPE == "EARRING") {
      _imageData.classList.remove("card");
      OffsetToPlotNeck = {
        x: 0,
        y: 0,
      };
      var neck_angle = Math.atan(neck_slope);
      if (left_neck_point.y == right_neck_point.y) {
        OffsetToPlotNeck.x = THRESHOLD_FOR_EARING_PLACEMENT;
      } else if (left_neck_point.x == right_neck_point.x) {
        OffsetToPlotNeck.y = THRESHOLD_FOR_EARING_PLACEMENT;
      } else {
        OffsetToPlotNeck.y =
          Math.sin(neck_angle) * THRESHOLD_FOR_EARING_PLACEMENT;
        OffsetToPlotNeck.x =
          Math.cos(neck_angle) * THRESHOLD_FOR_EARING_PLACEMENT;
      }
      if (
        DifferenceNeckPercentage != "ERROR!..." &&
        Math.abs(DifferenceNeckPercentage) > THRESHOLD_FOR_EARING_DETECTION * 10
      ) {
        if (DifferenceNeckPercentage > THRESHOLD_FOR_EARING_DETECTION * 100) {
          //Code To Draw Image Here
          if (neck_slope >= 0) {
            ctx.drawImage(
              JewelleryToTry1,
              point_of_neck_midpoint.x -
                Math.abs(left_ear_point_transformed.x * 1.2),
              point_of_neck_midpoint.y,
              distanceBetweenNeckPoints * 1.3,
              (distanceBetweenNeckPoints * 1.3 * JewelleryToTry1.height) /
                JewelleryToTry1.width
            );
          } else {
            ctx.drawImage(
              JewelleryToTry1,
              point_of_neck_midpoint.x -
                Math.abs(left_ear_point_transformed.x * 1.3),
              point_of_neck_midpoint.y,
              distanceBetweenNeckPoints * 1.3,
              (distanceBetweenNeckPoints * 1.3 * JewelleryToTry1.height) /
                JewelleryToTry1.width
            );
          }
        } else {
          //Code To Draw Image Here
          if (neck_slope >= 0) {
            ctx.drawImage(
              JewelleryToTry1,
              point_of_neck_midpoint.x -
                Math.abs(left_ear_point_transformed.x * 1.2),
              point_of_neck_midpoint.y + OffsetToPlotNeck.y,
              distanceBetweenNeckPoints * 1.3,
              (distanceBetweenNeckPoints * 1.3 * JewelleryToTry1.height) /
                JewelleryToTry1.width
            );
          } else {
            ctx.drawImage(
              JewelleryToTry1,
              point_of_neck_midpoint.x -
                Math.abs(left_ear_point_transformed.x * 1.3),
              point_of_neck_midpoint.y + OffsetToPlotNeck.y,
              distanceBetweenNeckPoints * 1.3,
              (distanceBetweenNeckPoints * 1.3 * JewelleryToTry1.height) /
                JewelleryToTry1.width
            );
          }
        }
      } else if (DifferenceNeckPercentage != "ERROR!...") {
        //Code To Draw Image Here
        if (neck_slope >= 0) {
          try {
            ctx.drawImage(
              JewelleryToTry1,
              point_of_neck_midpoint.x - (distanceBetweenNeckPoints * 13) / 20,
              point_of_neck_midpoint.y,
              distanceBetweenNeckPoints * 1.3,
              (distanceBetweenNeckPoints * 1.3 * JewelleryToTry1.height) /
                JewelleryToTry1.width
            );
          } catch {}
        } else {
          try {
            ctx.drawImage(
              JewelleryToTry1,
              point_of_neck_midpoint.x - (distanceBetweenNeckPoints * 13) / 20,
              point_of_neck_midpoint.y - OffsetToPlotNeck.y,
              distanceBetweenNeckPoints * 1.3,
              (distanceBetweenNeckPoints * 1.3 * JewelleryToTry1.height) /
                JewelleryToTry1.width
            );
          } catch {}
        }
      } else if (DifferencePercentage == "ERROR!...") {
        // console.error("Error Calculating Values!....");
      } else {
        // console.error("Unexpected Error!....");
      }
    } else {
      if (VERBOSE == true) {
        ctx.fillStyle = "red";
      }
    }

    // Earing Draw in Canvas
    var JewelleryToTry = document.getElementById("EaringToTry");
    var EaringFlipedToTry = document.getElementById("EaringFlipedToTry");
    if (IMAGE_TYPE == "EARRING") {
      _imageData.classList.remove("card");
      OffsetToPlotEar = {
        x: 0,
        y: 0,
      };
      var angle = Math.atan(slope);
      if (left_ear_point.y == right_ear_point.y) {
        OffsetToPlotEar.x = THRESHOLD_FOR_EARING_PLACEMENT;
      } else if (left_ear_point.x == right_ear_point.x) {
        OffsetToPlotEar.y = THRESHOLD_FOR_EARING_PLACEMENT;
      } else {
        OffsetToPlotEar.y = Math.sin(angle) * THRESHOLD_FOR_EARING_PLACEMENT;
        OffsetToPlotEar.x = Math.cos(angle) * THRESHOLD_FOR_EARING_PLACEMENT;
      }
      if (
        DifferencePercentage != "ERROR!..." &&
        Math.abs(DifferencePercentage) > THRESHOLD_FOR_EARING_DETECTION * 100
      ) {
        if (DifferencePercentage > THRESHOLD_FOR_EARING_DETECTION * 100) {
          //Code To Draw Image Here
          //Draw image in Left Side
          if (slope >= 0) {
            ctx.drawImage(
              JewelleryToTry,
              left_ear_point.x -
                (JEWELLERY_SIZE * 100) / 2 -
                OffsetToPlotEar.x * 2.5,
              left_ear_point.y + OffsetToPlotEar.y,
              JEWELLERY_SIZE * 100,
              JEWELLERY_SIZE * 100
            );
          } else {
            ctx.drawImage(
              JewelleryToTry,
              left_ear_point.x -
                (JEWELLERY_SIZE * 100) / 2 -
                OffsetToPlotEar.x * 2.5,
              left_ear_point.y - OffsetToPlotEar.y,
              JEWELLERY_SIZE * 100,
              JEWELLERY_SIZE * 100
            );
          }
        } else {
          //Code To Draw Image Here
          //Draw image in right Side
          if (slope >= 0) {
            ctx.drawImage(
              EaringFlipedToTry,
              right_ear_point.x -
                (JEWELLERY_SIZE * 100) / 2 +
                OffsetToPlotEar.x * 2.5,
              right_ear_point.y - OffsetToPlotEar.y,
              JEWELLERY_SIZE * 100,
              JEWELLERY_SIZE * 100
            );
          } else {
            ctx.drawImage(
              EaringFlipedToTry,
              right_ear_point.x -
                (JEWELLERY_SIZE * 100) / 2 +
                OffsetToPlotEar.x * 2.5,
              right_ear_point.y + OffsetToPlotEar.y,
              JEWELLERY_SIZE * 100,
              JEWELLERY_SIZE * 100
            );
          }
        }
      } else if (DifferencePercentage != "ERROR!...") {
        //Code To Draw Image Here
        // Earring Draw in Left or Right Side
        if (slope >= 0) {
          ctx.drawImage(
            JewelleryToTry,
            left_ear_point.x - (JEWELLERY_SIZE * 100) / 2 - OffsetToPlotEar.x,
            left_ear_point.y + OffsetToPlotEar.y,
            JEWELLERY_SIZE * 100,
            JEWELLERY_SIZE * 100
          );

          ctx.drawImage(
            EaringFlipedToTry,
            right_ear_point.x - (JEWELLERY_SIZE * 100) / 2 + OffsetToPlotEar.x,
            right_ear_point.y - OffsetToPlotEar.y,
            JEWELLERY_SIZE * 100,
            JEWELLERY_SIZE * 100
          );
        } else {
          ctx.drawImage(
            JewelleryToTry,
            left_ear_point.x - (JEWELLERY_SIZE * 100) / 2 - OffsetToPlotEar.x,
            left_ear_point.y - OffsetToPlotEar.y,
            JEWELLERY_SIZE * 100,
            JEWELLERY_SIZE * 100
          );

          ctx.drawImage(
            EaringFlipedToTry,
            right_ear_point.x - (JEWELLERY_SIZE * 100) / 2 + OffsetToPlotEar.x,
            right_ear_point.y + OffsetToPlotEar.y,
            JEWELLERY_SIZE * 100,
            JEWELLERY_SIZE * 100
          );
        }
      } else if (DifferencePercentage == "ERROR!...") {
        // console.error("Error Calculating Values!....");
      } else {
        // console.error("Unexpected Error!....");
      }
    } else {
    }

    // Nosering Draw in Canvas
    var JewelleryToTry = document.getElementById("NoseringToTry");
    if (IMAGE_TYPE == "EARRING") {
      _imageData.classList.remove("card");
      OffsetToPlotEar = {
        x: 0,
        y: 0,
      };
      var angle = Math.atan(slope);
      if (left_ear_point.y == right_ear_point.y) {
        OffsetToPlotEar.x = THRESHOLD_FOR_EARING_PLACEMENT;
      } else if (left_ear_point.x == right_ear_point.x) {
        OffsetToPlotEar.y = THRESHOLD_FOR_EARING_PLACEMENT;
      } else {
        OffsetToPlotEar.y = Math.sin(angle) * THRESHOLD_FOR_EARING_PLACEMENT;
        OffsetToPlotEar.x = Math.cos(angle) * THRESHOLD_FOR_EARING_PLACEMENT;
      }
      if (
        DifferencePercentage != "ERROR!..." &&
        Math.abs(DifferencePercentage) > THRESHOLD_FOR_EARING_DETECTION * 100
      ) {
        if (DifferencePercentage > THRESHOLD_FOR_EARING_DETECTION * 100) {
          //Code To Draw Image Here
          if (slope >= 0) {
            ctx.drawImage(
              JewelleryToTry,
              nosepin_left_point.x -
                (JEWELLERY_SIZE * 50) / 2 +
                OffsetToPlotEar.x,
              nosepin_left_point.y + OffsetToPlotEar.y - 20,
              JEWELLERY_SIZE * 50,
              JEWELLERY_SIZE * 50
            );
          } else {
            ctx.drawImage(
              JewelleryToTry,
              nosepin_left_point.x -
                (JEWELLERY_SIZE * 50) / 2 +
                OffsetToPlotEar.x,
              nosepin_left_point.y + OffsetToPlotEar.y - 20,
              JEWELLERY_SIZE * 50,
              JEWELLERY_SIZE * 50
            );
          }
        } else {
          //Code To Draw Image Here
          if (slope >= 0) {
            ctx.drawImage(
              JewelleryToTry,
              nosepin_right_point.x -
                (JEWELLERY_SIZE * 50) / 2 +
                OffsetToPlotEar.x,
              nosepin_right_point.y + OffsetToPlotEar.y - 20,
              JEWELLERY_SIZE * 50,
              JEWELLERY_SIZE * 50
            );
          } else {
            ctx.drawImage(
              JewelleryToTry,
              nosepin_right_point.x -
                (JEWELLERY_SIZE * 50) / 2 +
                OffsetToPlotEar.x,
              nosepin_right_point.y + OffsetToPlotEar.y - 20,
              JEWELLERY_SIZE * 50,
              JEWELLERY_SIZE * 50
            );
          }
        }
      } else if (DifferencePercentage != "ERROR!...") {
        if (fileUpload) {
          ctx.drawImage(
            JewelleryToTry,
            nosepin_right_point.x -
              (JEWELLERY_SIZE * 50) / 2 +
              OffsetToPlotEar.x,
            nosepin_right_point.y + OffsetToPlotEar.y - 15,
            JEWELLERY_SIZE * 50,
            JEWELLERY_SIZE * 50
          );
        }
      } else if (DifferencePercentage == "ERROR!...") {
      } else {
      }
    } else {
    }

    // If File upload than call one time this function
    if (fileUpload) {
      idImageLoaded = true;
    }
  } catch (error) {
    errorLog("processLandmarksCallback", error, "");
  }
}
