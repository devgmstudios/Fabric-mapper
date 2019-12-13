let canvas
let number

const grid = 8
const backgroundColor = '#f8f8f8'
const lineStroke = '#ebebeb'
const tableFill = 'rgba(255,0, 0, 1)'
const tableStroke = 'rgba(255,0, 0, 1)'
const tableShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const chairFill = 'rgba(67, 42, 4, 0.7)'
const chairStroke = '#32230b'
const chairShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const barFill = 'rgba(0, 93, 127, 1)'
const barStroke = '#003e54'
const barShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const barText = 'Bar'
const wallFill = 'rgba(136, 136, 136, 1)'
const wallStroke = '#686868'
const wallShadow = 'rgba(0, 0, 0, 0.4) 5px 5px 20px'

let widthEl = document.getElementById('width')
let heightEl = document.getElementById('height')
let canvasEl = document.getElementById('workspace')

var ctrlDown = false;
var copiedObjects = new Array();
// Initialize canvas
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

          canvasHeight = $(".canvas-area").height();
          canvasWidth = (img.width / img.height) * canvasHeight;

          canvas.setHeight(canvasHeight);
          canvas.setWidth(canvasWidth);

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

  canvas.on('object:added', function (e) {
    getObjDimensions(e);
  })

  canvas.on('object:moving', function (e) {
    snapToGrid(e.target);
    getObjDimensions(e);
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

    getObjDimensions(e);
  })

  canvas.on('object:modified', function (e) {
    e.target.scaleX = e.target.scaleX >= 0.25 ? (Math.round(e.target.scaleX * 2) / 2) : 0.5
    e.target.scaleY = e.target.scaleY >= 0.25 ? (Math.round(e.target.scaleY * 2) / 2) : 0.5
    snapToGrid(e.target);
    getObjDimensions(e);
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

// Check bounding box i.e. make sure that object remains inside canvas
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

// Get dimensions of active object
function getObjDimensions(obj) {
  let target = obj.target;

  heightObj = target.height * target.scaleY;
  widthObj = target.width * target.scaleX;

  $("#heightObj").val(heightObj);
  $("#widthObj").val(widthObj);

}

// ************** HANDLE COPY PASTE HERE ************** //
function copy() {
  // clone what are you copying since you
  // may want copy and paste on different moment.
  // and you do not want the changes happened
  // later to reflect on the copy.
  getSelection().clone(function (cloned) {
    _clipboard = cloned;
  });
}

function paste() {
  // clone again, so you can do multiple copies.
  _clipboard.clone(function (clonedObj) {
    canvas.discardActiveObject();
    clonedObj.set({
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true,
    });
    if (clonedObj.type === 'activeSelection') {
      // active selection needs a reference to the canvas.
      clonedObj.canvas = canvas;
      clonedObj.forEachObject(function (obj) {
        canvas.add(obj);
      });
      // this should solve the unselectability
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }
    _clipboard.top += 10;
    _clipboard.left += 10;
    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
  });
}

function getSelection() {
  return canvas.getActiveObject() == null ? canvas.getActiveGroup() : canvas.getActiveObject()
};

// For delete handling via button 
$(window).keydown(function (e) {
  switch (e.keyCode) {
    case 46: // delete
      var obj = canvas.getActiveObject();
      canvas.remove(obj);
      canvas.renderAll();
      return false;
  }
  return; //using "return" other attached events will execute
});

// Add rectangle on click of button
$("#addRectangle").click(function () {
  const o = addRect(0, 0, 60, 60)
  canvas.setActiveObject(o)
});

// Add circle on click of button
$("#addCircle").click(function () {
  const o = addCircle(0, 0, 30)
  canvas.setActiveObject(o)
});

// Remove active object
$("#removeObject").click(function () {
  const o = getSelection()
  if (o.remove) {
    o.remove();
    canvas.remove(o);
    canvas.discardActiveObject();
    canvas.renderAll();

    $("#heightObj").val("");
    $("#widthObj").val("");
  }
  else {
    console.log(o.id);
    removeObjectFromCanvas(o.id);
  }
});

// Select objects
$("#select").click(function () {
  canvas.DrawingMode = false;
});

$("#draw").click(function () {
  canvas.DrawingMode = true;
});

$("#copy").click(function () {
  copy();
});

$("#paste").click(function () {
  paste();
});

$("#bringToFront").click(function (){
  const o = getSelection();
  canvas.bringToFront(o);
});

$("#bringForward").click(function (){
  const o = getSelection();
  canvas.bringForward(o);
});

$("#sendBackwards").click(function (){
  const o = getSelection();
  canvas.sendBackwards(o);
});

$("#sendToBack").click(function (){
  const o = getSelection();
  canvas.sendToBack(o);
});

initCanvas();

// When drawing mode is enabled
var Rectangle = (function () {
  function Rectangle(canvas) {
    var inst = this;
    this.canvas = canvas;
    this.className = 'Rectangle';
    this.isDrawing = false;
    this.bindEvents();
  }

  Rectangle.prototype.bindEvents = function () {
    var inst = this;
    inst.canvas.on('mouse:down', function (o) {
      inst.onMouseDown(o);
    });
    inst.canvas.on('mouse:move', function (o) {
      inst.onMouseMove(o);
    });
    inst.canvas.on('mouse:up', function (o) {
      inst.onMouseUp(o);
    });
    inst.canvas.on('object:moving', function (o) {
      inst.disable();
    })
  }
  Rectangle.prototype.onMouseUp = function (o) {
    var inst = this;
    inst.disable();
  };

  Rectangle.prototype.onMouseMove = function (o) {
    var inst = this;

    if (!inst.isEnable()) { return; }
    var pointer = inst.canvas.getPointer(o.e);
    var activeObj = inst.canvas.getActiveObject();

    if (origX > pointer.x) {
      activeObj.set({ left: Math.abs(pointer.x) });
    }
    if (origY > pointer.y) {
      activeObj.set({ top: Math.abs(pointer.y) });
    }

    activeObj.set({ width: Math.abs(origX - pointer.x) });
    activeObj.set({ height: Math.abs(origY - pointer.y) });

    activeObj.setCoords();
    inst.canvas.renderAll();

  };

  Rectangle.prototype.onMouseDown = function (o) {
    if (canvas.DrawingMode == true) {
      var inst = this;
      inst.enable();

      var pointer = inst.canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;

      var rect = new fabric.Rect({
        id: generateId(),
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        width: pointer.x - origX,
        height: pointer.y - origY,
        angle: 0,
        transparentCorners: false,
        hasBorders: true,
        hasControls: true,
        fill: 'rgba(255,0, 0, 0.4)',
        stroke: tableStroke,
        strokeWidth: 0,
        shadow: tableShadow,
        centeredRotation: true,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        snapAngle: 5
      });
      canvas.DrawingMode = false;
      inst.canvas.add(rect).setActiveObject(rect);
    }
  };

  Rectangle.prototype.isEnable = function () {
    return this.isDrawing;
  }

  Rectangle.prototype.enable = function () {
    this.isDrawing = true;
  }

  Rectangle.prototype.disable = function () {
    this.isDrawing = false;
  }

  return Rectangle;
}());

var arrow = new Rectangle(canvas);
