/* eslint-disable*/
// let uid;
const params = new URLSearchParams(window.location.search);
let projectId = params.get("p");
let itemId = params.get("q");
let projectName = "";
let objid = "";
let cal_usage = 0;
let necklace = false;
let earring = false;
let nosering = false;

let necklaceSelected = "";
let earringSelected = "";
let noseringSelected = "";

// projects Load
function loadProjectCatalogueImages() {
  // let project = res.data;

  document.getElementById("projectName").innerHTML = "Temp Server";

  [
    {
      type: "necklace",
      src: "./image/necklace.png",
      name: "Necklace",
      _id: 1,
    },
    {
      type: "earring",
      src: "./image/earing.png",
      name: "Earring",
      _id: 2,
    },
    {
      type: "nosering",
      src: "./image/nosering.png",
      name: "2d Nosering",
      _id: 3,
    },
  ].forEach((faceProjectImage) => {
    formatAllImages(
      faceProjectImage.type,
      faceProjectImage.src,
      faceProjectImage.name,
      faceProjectImage._id
    );
  });
  document.getElementById("loder").style.display = "none";
}

// format all images for set
function formatAllImages(type, imageSrc, imageName, objId) {
  try {
    let firstNecklaceImgSrc = "";
    let firstEarringImgSrc = "";
    let firstNoseringImgSrc = "";

    let isNecklaceIdGet = false;
    let isEarringIdGet = false;
    let isNoseringIdGet = false;

    if (type === "necklace") {
      if (firstNecklaceImgSrc === "" && imageSrc !== "") {
        firstNecklaceImgSrc = imageSrc;
      }
      setImageToContainer(imageSrc, "Necklace", imageName, objId);
      document.getElementById("lblNecklace").style.display = "block";
    }
    if (type === "earring") {
      if (firstEarringImgSrc === "" && imageSrc !== "") {
        firstEarringImgSrc = imageSrc;
      }
      setImageToContainer(imageSrc, "Earing", imageName, objId);
      document.getElementById("lblEaring").style.display = "block";
    }
    if (type === "nosering") {
      if (firstNoseringImgSrc === "" && imageSrc !== "") {
        firstNoseringImgSrc = imageSrc;
      }
      setImageToContainer(imageSrc, "Nosering", imageName, objId);
      document.getElementById("lblNoseRing").style.display = "block";
    }

    if (itemId && objId == itemId) {
      if (type === "necklace") {
        isNecklaceIdGet = true;
        firstNecklaceImgSrc = imageSrc;
      }
      if (type === "earring") {
        isEarringIdGet = true;
        firstEarringImgSrc = imageSrc;
      }
      if (type === "nosering") {
        isNoseringIdGet = true;
        firstNoseringImgSrc = imageSrc;
      }
    }

    setTimeout(() => {
      wearDefaultOrnament(
        firstNecklaceImgSrc,
        firstEarringImgSrc,
        firstNoseringImgSrc,
        isNecklaceIdGet,
        isEarringIdGet,
        isNoseringIdGet
      );
    }, 2500);
  } catch (err) {
    errorLog("Load Models ", err, "");
  }
}

// set All dynamic create div and images
function setImageToContainer(imageSource, imageContainer, imageName, objId) {
  try {
    let imageElement = document.createElement("img");
    let imageLblName = document.createElement("label");
    let divElement = document.createElement("div");
    imageElement.setAttribute("crossorigin", "anonymous");
    imageElement.setAttribute("id", "image" + imageSource);
    imageLblName.innerHTML = imageName != undefined ? imageName : "";
    imageLblName.setAttribute("class", "createdLabel");
    divElement.setAttribute("id", "div" + imageSource);
    imageElement.setAttribute("alt", objId);

    divElement.addEventListener("click", function (event) {
      let previousImage = document.getElementById(imageContainer + "ToTry").src;
      if (previousImage === imageSource) {
        if (imageContainer === "Necklace") {
          document
            .getElementById(necklaceSelected)
            .classList.remove("boxShadow");
          necklaceSelected = "";
        }
        if (imageContainer === "Earing") {
          document
            .getElementById(earringSelected)
            .classList.remove("boxShadow");
          earringSelected = "";
        }
        if (imageContainer === "Nosering") {
          document
            .getElementById(noseringSelected)
            .classList.remove("boxShadow");
          noseringSelected = "";
        }
        document
          .getElementById(imageContainer + "ToTry")
          .setAttribute("src", "./image/transparent.png");
      } else {
        if (imageContainer === "Necklace") {
          necklaceSelected = "div" + imageSource;
        }
        if (imageContainer === "Earing") {
          earringSelected = "div" + imageSource;
        }
        if (imageContainer === "Nosering") {
          noseringSelected = "div" + imageSource;
        }

        document
          .getElementById(imageContainer + "ToTry")
          .setAttribute("src", imageSource);
      }

      RefreshContainer(document.getElementById(imageContainer + "Image"));
      flipEarringImage();
      if (idImageLoaded) requestAnimationFrame(trackFaces);
    });
    imageElement.setAttribute("class", "imgwidth");
    divElement.setAttribute("class", "boximg");

    imageElement.setAttribute("src", imageSource);
    divElement.appendChild(imageElement);
    divElement.appendChild(imageLblName);
    document.getElementById(imageContainer + "Image").appendChild(divElement);
  } catch (err) {
    errorLog("Load Models ", err, "");
  }
}

// refresh container
function RefreshContainer(containerElement) {
  try {
    let images = containerElement.getElementsByClassName("imgwidth");
    for (let i = 0; i < images.length; i++) {
      images[i].parentNode.classList.remove("boxShadow");
    }
    if (necklaceSelected !== "" && document.getElementById(necklaceSelected)) {
      document.getElementById(necklaceSelected).classList.add("boxShadow");
    }
    if (earringSelected !== "" && document.getElementById(earringSelected)) {
      document.getElementById(earringSelected).classList.add("boxShadow");
    }
    if (noseringSelected !== "" && document.getElementById(noseringSelected)) {
      document.getElementById(noseringSelected).classList.add("boxShadow");
    }
  } catch (err) {
    errorLog("Load Models ", err, "");
  }
}

// default image set
function wearDefaultOrnament(
  firstNecklace,
  firstEarring,
  firstNosering,
  isNecklaceIdGet,
  isEarringIdGet,
  isNoseringIdGet
) {
  try {
    if ((necklaceSelected === "" && firstNecklace !== "") || isNecklaceIdGet) {
      if (document.getElementById("image" + firstNecklace)) {
        necklaceSelected = "div" + firstNecklace;
        document
          .getElementById("NecklaceToTry")
          .setAttribute("src", firstNecklace);
        RefreshContainer(document.getElementById("NecklaceImage"));
      }
    }
    if ((earringSelected === "" && firstEarring !== "") || isEarringIdGet) {
      if (document.getElementById("image" + firstEarring)) {
        earringSelected = "div" + firstEarring;
        document
          .getElementById("EaringToTry")
          .setAttribute("src", firstEarring);
        RefreshContainer(document.getElementById("EaringImage"));
        setTimeout(() => {
          flipEarringImage();
        }, 1000);
      }
    }
    if ((noseringSelected === "" && firstNosering !== "") || isNoseringIdGet) {
      if (document.getElementById("image" + firstNosering)) {
        noseringSelected = "div" + firstNosering;
        document
          .getElementById("NoseringToTry")
          .setAttribute("src", firstNosering);
        RefreshContainer(document.getElementById("NoseringImage"));
      }
    }
  } catch (err) {
    errorLog("Load Models ", err, "");
  }
}

// Drawimage in Canvas For flip Earring image in canvas
function flipEarringImage() {
  try {
    var c = document.getElementById("flipedEarring");
    var img = document.getElementById("EaringToTry");
    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext("2d");
    ctx.setTransform(-1.0, 0, 0, 1, img.width, 0);
    ctx.drawImage(img, 0, 0, img.width, img.height);

    let canvas = document.getElementById("flipedEarring");
    let Flipedimg = canvas.toDataURL("image/png");
    document.getElementById("EaringFlipedToTry").src = Flipedimg;
  } catch (err) {
    errorLog("FlipEarring Image", err, "");
  }
}
