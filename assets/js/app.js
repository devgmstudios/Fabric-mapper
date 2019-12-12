let canvas
let number

const grid = 8
const backgroundColor = '#f8f8f8'
const lineStroke = '#ebebeb'
const tableFill = 'rgba(255,0, 0, 0.4)'
const tableStroke = 'rgba(255,0, 0, 0.5)'
const tableShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const chairFill = 'rgba(67, 42, 4, 0.7)'
const chairStroke = '#32230b'
const chairShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const barFill = 'rgba(0, 93, 127, 0.7)'
const barStroke = '#003e54'
const barShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const barText = 'Bar'
const wallFill = 'rgba(136, 136, 136, 0.7)'
const wallStroke = '#686868'
const wallShadow = 'rgba(0, 0, 0, 0.4) 5px 5px 20px'

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

  // Load x-axis
  for (let i = 0; i < (canvas.height / grid); i++) {
    const lineX = new fabric.Line([0, i * grid, canvas.height, i * grid], {
      stroke: lineStroke,
      selectable: false,
      type: 'line'
    })
    sendLinesToBack()
    canvas.add(lineX)
  }

  // Load y-axis
  for (let i = 0; i < (canvas.width / grid); i++) {
    const lineY = new fabric.Line([i * grid, 0, i * grid, canvas.height], {
      stroke: lineStroke,
      selectable: false,
      type: 'line'
    })
    sendLinesToBack()
    canvas.add(lineY)
  }

  
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

// Code to snap items to grid
function snapToGrid(target) {
  target.set({
    left: Math.round(target.left / (grid / 2)) * grid / 2,
    top: Math.round(target.top / (grid / 2)) * grid / 2
  })
}

// Check bounding box
function checkBoundingBox(e) {
  const obj = e.target

  if (!obj) {
    return
  }
  obj.setCoords()

  const objBoundingBox = obj.getBoundingRect()
  if (objBoundingBox.top < 0) {
    obj.set('top', 0)
    obj.setCoords()
  }
  if (objBoundingBox.left > canvas.width - objBoundingBox.width) {
    obj.set('left', canvas.width - objBoundingBox.width)
    obj.setCoords()
  }
  if (objBoundingBox.top > canvas.height - objBoundingBox.height) {
    obj.set('top', canvas.height - objBoundingBox.height)
    obj.setCoords()
  }
  if (objBoundingBox.left < 0) {
    obj.set('left', 0)
    obj.setCoords()
  }
}

// Send to back
function sendLinesToBack() {
  canvas.getObjects().map(o => {
    if (o.type === 'line') {
      canvas.sendToBack(o)
    }
  })
}

// Set active rectangle
// document.querySelectorAll('.rectangle')[0].addEventListener('click', function () {
//   const o = addRect(0, 0, 60, 60)
//   canvas.setActiveObject(o)
// })

// Remove active object
// document.querySelectorAll('.remove')[0].addEventListener('click', function () {
//   const o = canvas.getActiveObject()
//   if (o) {
//     o.remove()
//     canvas.remove(o)
//     canvas.discardActiveObject()
//     canvas.renderAll()
//   }
// })

// Add circle
// $("#addCircle").click(function () {
//   canvas.add(new fabric.Circle({
//     radius: 50,
//     left: 0,
//     top: 0,
//     fill: '#0B61A4'
//   }));
// });


initCanvas();