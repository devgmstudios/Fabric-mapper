let canvas
let number

const grid = 8
const backgroundColor = '#f8f8f8'

let widthEl = document.getElementById('width')
let heightEl = document.getElementById('height')
let canvasEl = document.getElementById('workspace')

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

          canvas.setHeight(img.height);
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
  // canvas.setBackgroundImage('bg2.jpg', canvas.renderAll.bind(canvas));

  canvas.on('object:moving', function (options) {
    options.target.set({
      left: Math.round(options.target.left / grid) * grid,
      top: Math.round(options.target.top / grid) * grid
    });
  });


  /* canvas.on('object:moving', function (options) {
     var currentScrollLeft = $('#leftDiv2')[0].scrollLeft;
     var currentScrollTop = $('#leftDiv2')[0].scrollTop;
     if (currentScrollLeft > options.target.left) {
         $('#leftDiv2')[0].scrollLeft = options.target.left;
     }
     if (currentScrollTop > options.target.top) {
         $('#leftDiv2')[0].scrollTop = options.target.top;
     }
     var minScrollLeft = (options.target.left + options.target.width) - 660;
     if (currentScrollLeft < minScrollLeft) {
         $('#leftDiv2')[0].scrollLeft = minScrollLeft;
     }
     var minScrollTop = (options.target.top + options.target.height) - 450;
     if (currentScrollTop < minScrollTop) {
         $('#leftDiv2')[0].scrollTop = minScrollTop;
     }
 }); */


  /*   canvas.on('object:modified', function(e) {
      e.target.scaleX = e.target.scaleX >= 0.25 ? (Math.round(e.target.scaleX * 2) / 2) : 0.5
      e.target.scaleY = e.target.scaleY >= 0.25 ? (Math.round(e.target.scaleY * 2) / 2) : 0.5
      snapToGrid(e.target)
      if (e.target.type === 'table') {
        canvas.bringToFront(e.target)
      }
      else {
        canvas.sendToBack(e.target)
      }
      sendLinesToBack()
    }) */

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

console.log($(".canvas-area").width())