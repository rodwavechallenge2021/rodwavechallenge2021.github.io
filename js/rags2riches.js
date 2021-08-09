// Start upload preview image

// variables for flipping img horizontally
const NORMAL = 1;
const FLIP = 2;
// "normal" for a photo taken from iPhone camera is actually orientation 6 b/c it has to be rotated clockwise
const IPHONE_PORTRAIT_NORMAL = 6;
const IPHONE_PORTRAIT_FLIP = 5;
// don't use "orientation" as a variable name - reserved on iOS?
var croppieOrientation = NORMAL;

// for orientation on camera pics from iPhone - retrieve from EXIF.getTag(this, "Orientation")
var exifOrientation;

var $uploadCrop,
tempFilename,
rawImg,
imageId,
currentFaceNum;

function readFile(input) {
	if (input.files && input.files[0]) {
	  var reader = new FileReader();
		reader.onload = function (e) {
			$('#upload-demo').addClass('ready');
			$('#cropImagePop').modal('show');
			rawImg = e.target.result;
			input.value = null; // fix to allow the same image to be chosen two times in a row
		}
		reader.readAsDataURL(input.files[0]);
	}
	else {
		swal("Sorry - either there was an error, or your browser doesn't support the FileReader API. Please try again.");
	}
}

if (window.innerWidth <= 768) {
	$uploadCrop = $('#upload-demo').croppie({
		viewport: {
			width: "min(70vw, 380px)",
			height: "min(70vw, 380px)",
		},
		boundary: { width: "min(80vw, 420px)", height: "min(80vw, 420px)" },
		enforceBoundary: false,
		enableExif: true,
		enableOrientation: true,
	});
} else {
	$uploadCrop = $('#upload-demo').croppie({
		viewport: {
			width: 380,
			height: 380,
		},
		boundary: { width: 420, height: 420 },
		enforceBoundary: false,
		enableExif: true,
		enableOrientation: true,
	});
}
$('#cropImagePop').on('shown.bs.modal', function(){
	var boundaryWidth = $(".modal-body").width();
	console.log(boundaryWidth);

	// alert('Shown pop');
	$uploadCrop.croppie('bind', {
		url: rawImg
	}).then(function(){
		console.log('jQuery bind complete');
		// need to find exif orientation because of iphone cameras
		var exifImg = new Image;
		exifImg.src = rawImg;
		EXIF.getData(exifImg, function() {
			exifOrientation = EXIF.getTag(this, "Orientation");
			if (exifOrientation == IPHONE_PORTRAIT_NORMAL) {
				croppieOrientation = IPHONE_PORTRAIT_NORMAL;
			}
		});
	});
});

$('.uploadface-btn').on('change', function () {
		imageId = $(this).data('id');
		tempFilename = $(this).val();
		$('#cancelCropBtn').data('id', imageId); readFile(this);
	}
);

// flipping the image - https://github.com/Foliotek/Croppie/issues/506
function croppieOrientFlipHorizontal(or) {
    switch (or) {
        case 1: or = 2; break;
        case 2: or = 1; break;
        case 3: or = 4; break;
        case 4: or = 3; break;
        case 5: or = 6; break;
        case 6: or = 5; break;
        case 7: or = 8; break;
        case 8: or = 7; break;
    }
    return or;
}

$('#flipImageBtn').on('click', function () {
	// if (croppieOrientation == NORMAL) {
	// 	croppieOrientation = FLIP;
	// } else if (croppieOrientation == FLIP) {
	// 	croppieOrientation = NORMAL;
	// } else if (croppieOrientation == IPHONE_PORTRAIT_NORMAL) {
	// 	croppieOrientation = IPHONE_PORTRAIT_FLIP;
	// } else if (croppieOrientation == IPHONE_PORTRAIT_FLIP) {
	// 	croppieOrientation = IPHONE_PORTRAIT_NORMAL;
	// }
	// $uploadCrop.croppie('bind', {
	// 	url: rawImg,
	// 	orientation: croppieOrientation
	// });

	croppieOrientation = croppieOrientFlipHorizontal(croppieOrientation);

	$uploadCrop.croppie('bind', {
		url: rawImg,
		orientation: croppieOrientation
	});
});

// rotating the image - https://github.com/Foliotek/Croppie/issues/506
function croppieOrientRotateRight(or) {
    switch (or) {
        case 1: or = 6; break;
        case 2: or = 7; break;
        case 3: or = 8; break;
        case 4: or = 5; break;
        case 5: or = 2; break;
        case 6: or = 3; break;
        case 7: or = 4; break;
        case 8: or = 1; break;
    }
    return or;
}

$('#rotateBtn').on('click', function(ev) {
	croppieOrientation = croppieOrientRotateRight(croppieOrientation);
	$uploadCrop.croppie('bind', {
		url: rawImg,
		orientation: croppieOrientation
	});
});

$('#cropImageBtn').on('click', function (ev) {
	var faceSize;
	$uploadCrop.croppie('result', {
		type: 'base64',
		format: 'png',
		backgroundColor: '#FFFFFF',
		size: {width: 402, height: 402}
	}).then(function (resp) {
		$('#faceimg').attr('src', resp);
		$('#cropImagePop').modal('hide');
		createInitialBillCanvas();
	});
});
// End upload preview image

// will need this function for rotating background bills
function drawRotatedImage(image, ctx, x, y, angle, width, height) {
	var TO_RADIANS = Math.PI/180;

	// save the current co-ordinate system
	// before we screw with it
	ctx.save();

	// move to the middle of where we want to draw our image
	ctx.translate(x + (width / 2), y + (height / 2));

	// rotate around that point, converting our
	// angle from degrees to radians
	ctx.rotate(angle * TO_RADIANS);

	// draw it up and to the left by half the width
	// and height of the image
	// ctx.drawImage(image, -(image.width/2), -(image.height/2));
	ctx.drawImage(image, -(width/2), -(height/2), width, height);

	// and restore the co-ords to how they were when we began
	ctx.restore();
}

function createInitialBillCanvas() {
	var c = document.getElementById("initialbillcanvas");
	var ctx = c.getContext('2d');

	var faceXOffset = 209;
	var faceYOffset = 0;

	// clear out the canvas
	ctx.clearRect(0, 0, c.width, c.height);

	var face = new Image();
	face.onload = function() {

		ctx.drawImage(face, faceXOffset, faceYOffset);

		faceFilter(face, ctx, faceXOffset, faceYOffset);

		// apply overlay noise filter
		var noiseFilter = new Image();
		noiseFilter.onload = function() {
			var ctx = c.getContext('2d');
			ctx.globalCompositeOperation = 'overlay';
			ctx.drawImage(noiseFilter, faceXOffset, 0);

			// reset blending mode
			ctx.globalCompositeOperation = 'source-over';

			// draw the bill
			var rodbill = new Image();
			rodbill.onload = function() {
				var ctx = c.getContext('2d');
				ctx.drawImage(rodbill, 0, 0, 945, 402);

				// bill ends here - create the final bill canvas
				createFinalBillCanvas();
			}
			rodbill.src = 'assets/billcutout.png';
		}
		noiseFilter.src = "assets/noisefilter.jpg";
	}
	face.src = $('#faceimg').attr('src');
}

function faceFilter(img, ctx, x, y) {
	var imageData = ctx.getImageData(x, y, img.width, img.height);

	// grayscale
	var data = imageData.data;

	for(var i = 0; i < data.length; i += 4) {
	  var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
	  // red
	  data[i] = brightness;
	  // green
	  data[i + 1] = brightness;
	  // blue
	  data[i + 2] = brightness;
	}
	ctx.putImageData(imageData, x, y);

	// multiply
	ctx.globalCompositeOperation = 'multiply';

	ctx.fillStyle = '#ffffe1';
	ctx.fillRect(x, y, img.width, img.height);

	// screen
	ctx.globalCompositeOperation = 'screen';

	ctx.fillStyle = '#505a51';
	ctx.fillRect(x, y, img.width, img.height);

	// reset blend mode
	ctx.globalCompositeOperation = 'source-over';
}

function playCameraFlashAnimation() {
	$("#cameraflash").animate(
		{opacity: "1"}, 200, "linear", function(){
			$("#cameraflash").animate({opacity: "0"}, 1200, "linear");
		}
	);
}

// creating the final image w/ multiple bills
function createFinalBillCanvas() {
	var c = document.getElementById("finalrodcanvas");
	var initialBillCanvas = document.getElementById("initialbillcanvas");
	var ctx = c.getContext('2d');

	// clear out the canvas
	ctx.clearRect(0, 0, c.width, c.height);

	var billBackground = new Image();
	billBackground.onload = function() {
		// draw flat bill background
		ctx.drawImage(billBackground, 0, 0);

		// shadow on the bills
		ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetX = 4;
		ctx.shadowOffsetY = 4;

		// draw background bills
		drawRotatedImage(initialBillCanvas, ctx, -46, 91, -4.47, 945, 402); // "Photo 4" - visible face
		drawRotatedImage(initialBillCanvas, ctx, 765, 798, -13.01, 945, 402); // "Photo 3" - visible face

		drawRotatedImage(initialBillCanvas, ctx, -149, 329, -14.61, 945, 402); // hidden face

		drawRotatedImage(initialBillCanvas, ctx, 44, 812, 15.38, 945, 402); // "Photo 2" - visible face

		drawRotatedImage(initialBillCanvas, ctx, -430, 1094, -66, 945, 402); // hidden face
		drawRotatedImage(initialBillCanvas, ctx, 469, 1215, -102.3, 945, 402); // hidden face
		drawRotatedImage(initialBillCanvas, ctx, -565, 142, 18, 945, 402); // hidden face
		drawRotatedImage(initialBillCanvas, ctx, 423, 400, 102.2, 945, 402); // hidden face

		// draw the final bill
		drawRotatedImage(initialBillCanvas, ctx, 129, 403, -7.53, 945, 402);

		// clear drop shadow
		ctx.shadowColor = 'rgba(0, 0, 0, 0)';

		// draw the frame
		var outerFrame = new Image();
		outerFrame.onload = function() {
			ctx.drawImage(outerFrame, 0, 0);

			// the image is done - copy it to the main page
			var generatedImgUrl = c.toDataURL('image/jpeg', 1.0);
			$('#billgeneratedimg').attr('src', generatedImgUrl);

			// play the camera flash animation
			playCameraFlashAnimation();


			// enable the "save image button"
			$('#download-btn').attr("class","rodbutton");
		}
		outerFrame.src = "assets/frame.png";
	}
	billBackground.src = "assets/bill_background.jpg";
}

// detect iOS
let isIOS = /iPad|iPhone|iPod/.test(navigator.platform);

download_canvas_img = function(el) {
	var c = document.getElementById("finalrodcanvas");
	var image = c.toDataURL("image/jpeg");
	if (isIOS) {
		// don't let iOS 13 download the image - open in a new tab
		var downloadBtn = document.getElementById("download-btn");
		downloadBtn.removeAttribute("download");
		downloadBtn.setAttribute("target", "_blank");
	}
  	el.href = image;
};
