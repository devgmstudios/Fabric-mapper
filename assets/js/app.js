let canvas
let number

const grid = 8
const backgroundColor = '#f8f8f8'

let widthEl = document.getElementById('width')
let heightEl = document.getElementById('height')
let canvasEl = document.getElementById('workspace')

// Load background image from URL
function initCanvas() {
  if (canvas) {
    canvas.clear()
    canvas.dispose()
  }

  $(function () {

    canvas.renderAll();
    //Change background using Image
    document.getElementById('addBackground').addEventListener('change', function (e) {
      canvas.setBackgroundColor('', canvas.renderAll.bind(canvas));
      canvas.setBackgroundImage(0, canvas.renderAll.bind(canvas));
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function (f) {
        var data = f.target.result;
        fabric.Image.fromURL(data, function (img) {

          canvas.setWidth($(".canvas-area").width());

          document.getElementById("width").value = img.width;
          document.getElementById("height").value = img.height;

          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
          });

        });
      };
      reader.readAsDataURL(file);
      canvas.setBackgroundImage(0, canvas.renderAll.bind(canvas));
    });
  });

  canvas = new fabric.Canvas('workspace', { renderOnAddRemove: false })
  number = 1
  canvas.backgroundColor = backgroundColor

  canvas.on('object:moving', function (options) {
    options.target.set({
      left: Math.round(options.target.left / grid) * grid,
      top: Math.round(options.target.top / grid) * grid
    });
  });
  canvas.observe('object:moving', function (e) {
    checkBoudningBox(e)
  })
  canvas.observe('object:rotating', function (e) {
    checkBoudningBox(e)
  })
  canvas.observe('object:scaling', function (e) {
    checkBoudningBox(e)
  })
}

initCanvas();