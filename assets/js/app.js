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

  canvas.on('object:moving', function (e) {
    snapToGrid(e.target)
  })

  canvas.on('object:scaling', function (e) {
    if (e.target.scaleX > 5) {
      e.target.scaleX = 5
    }
    if (e.target.scaleY > 5) {
      e.target.scaleY = 5
    }
    if (!e.target.strokeWidthUnscaled && e.target.strokeWidth) {
      e.target.strokeWidthUnscaled = e.target.strokeWidth
    }
    if (e.target.strokeWidthUnscaled) {
      e.target.strokeWidth = e.target.strokeWidthUnscaled / e.target.scaleX
      if (e.target.strokeWidth === e.target.strokeWidthUnscaled) {
        e.target.strokeWidth = e.target.strokeWidthUnscaled / e.target.scaleY
      }
    }
  })

  canvas.on('object:modified', function (e) {
    e.target.scaleX = e.target.scaleX >= 0.25 ? (Math.round(e.target.scaleX * 2) / 2) : 0.5
    e.target.scaleY = e.target.scaleY >= 0.25 ? (Math.round(e.target.scaleY * 2) / 2) : 0.5
    snapToGrid(e.target)
  })

  canvas.observe('object:moving', function (e) {
    checkBoundingBox(e)
  })
  canvas.observe('object:rotating', function (e) {
    checkBoundingBox(e)
  })
  canvas.observe('object:scaling', function (e) {
    checkBoundingBox(e)
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

// Generate ID for created objects
function generateId() {
  return Math.random().toString(36).substr(2, 8)
}

// Add rectangle to canvas
function addRect(left, top, width, height) {
  const id = generateId()
  const o = new fabric.Rect({
    width: width,
    height: height,
    fill: tableFill,
    stroke: tableStroke,
    strokeWidth: 2,
    shadow: tableShadow,
    originX: 'center',
    originY: 'center',
    centeredRotation: true,
    snapAngle: 45,
    selectable: true
  })
  const t = new fabric.IText(number.toString(), {
    fontFamily: 'Calibri',
    fontSize: 14,
    fill: '#fff',
    textAlign: 'center',
    originX: 'center',
    originY: 'center'
  })
  const g = new fabric.Group([o, t], {
    left: left,
    top: top,
    centeredRotation: true,
    snapAngle: 45,
    selectable: true,
    type: 'table',
    id: id,
    number: number
  })
  canvas.add(g)
  number++
  return g
}

// Add circle to canvas
function addCircle(left, top, radius) {
  const id = generateId()
  const o = new fabric.Circle({
    radius: radius,
    fill: tableFill,
    stroke: tableStroke,
    strokeWidth: 2,
    shadow: tableShadow,
    originX: 'center',
    originY: 'center',
    centeredRotation: true
  })
  const t = new fabric.IText(number.toString(), {
    fontFamily: 'Calibri',
    fontSize: 14,
    fill: '#fff',
    textAlign: 'center',
    originX: 'center',
    originY: 'center'
  })
  const g = new fabric.Group([o, t], {
    left: left,
    top: top,
    centeredRotation: true,
    snapAngle: 45,
    selectable: true,
    type: 'table',
    id: id,
    number: number
  })
  canvas.add(g)
  number++
  return g
}

$("#addRectangle").click(function(){
  const o = addRect(0, 0, 60, 60)
  canvas.setActiveObject(o)
});

$("#addCircle").click(function(){
  const o = addCircle(0, 0, 30)
  canvas.setActiveObject(o)
});

initCanvas();