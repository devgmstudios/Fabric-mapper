let canvas
let file
let bgImg

const grid = 8
const backgroundColor = '#f8f8f8'
const lineStroke = '#ebebeb'
const tableFill = 'rgba(255,0, 0, 0.5)'
const tableStroke = 'rgba(255,0, 0, 1)'
const tableShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'

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
      file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function (f) {
        var data = f.target.result;
        loadFabricBackground(data);
      };
      reader.readAsDataURL(file);
      canvas.setBackgroundImage(0, canvas.renderAll.bind(canvas));
      fabricToJSON();
    });
  });

  canvas = new fabric.Canvas('workspace', { renderOnAddRemove: false })
  number = 1
  canvas.backgroundColor = backgroundColor

  canvas.on('object:added', function (e) {
    getObjDimensions(e);
    addToSortableList(e);
    fabricToJSON();
  })
  canvas.on('object:moving', function (e) {
    // snapToGrid(e.target);
    getObjDimensions(e);
    fabricToJSON();
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
    fabricToJSON();
  })
  canvas.on('object:modified', function (e) {
    // e.target.scaleX = e.target.scaleX >= 0.25 ? (Math.round(e.target.scaleX * 2) / 2) : 0.5
    // e.target.scaleY = e.target.scaleY >= 0.25 ? (Math.round(e.target.scaleY * 2) / 2) : 0.5
    // snapToGrid(e.target);
    getObjDimensions(e);
    fabricToJSON();

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
  canvas.observe('mouse:down', function (e) {
    if (canvas.DrawingMode) {
      rectmousedown(e);
    }
    // getObjDimensions(e);
  });
  canvas.observe('mouse:move', function (e) {
    if (canvas.DrawingMode) {
      rectmousemove(e);
    }
  });
  canvas.observe('mouse:up', function (e) {
    if (canvas.DrawingMode) {
      rectmouseup(e);
    }
  });
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
    snapAngle: 1,
    selectable: true
  });
  target = o;
  const zindex = canvas.getObjects().indexOf(target);
  const zindexG = zindex + 1;

  const t = new fabric.IText(zindexG.toString(), {
    fontFamily: 'Calibri',
    fontSize: 14,
    fill: '#fff',
    textAlign: 'center',
    originX: 'center',
    originY: 'center'
  });
  const g = new fabric.Group([o, t], {
    left: left,
    top: top,
    centeredRotation: true,
    snapAngle: 1,
    selectable: true,
    lockScalingX: false,
    lockScalingY: false,
    lockRotation: false,
    type: 'rect',
    id: id
  });

  canvas.add(g);
  canvas.renderAll();
  return g;
}

// Get dimensions of active object
function getObjDimensions(obj) {
  let target = obj.target;

  const width = bgImg ? bgImg.width : 1;
  const height = bgImg ? bgImg.height : 1;

  let ratio = gcd(width, height);

  heightObj = target.height * target.scaleY * (height / ratio);
  widthObj = target.width * target.scaleX * (width / ratio);

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
// ************** HANDLE COPY PASTE END ************** //

// ************** HANDLE RECTANGLE FREE DRAW HERE ************** //

var rect, isDown, origX, origY, o;
function rectmousedown(e) {
  isDown = true;
  var pointer = canvas.getPointer(e.e);
  origX = pointer.x;
  origY = pointer.y;

  const id = generateId()
  o = new fabric.Rect({
    width: pointer.x - origX,
    height: pointer.y - origY,
    fill: tableFill,
    stroke: tableStroke,
    strokeWidth: 2,
    shadow: tableShadow,
    originX: 'center',
    originY: 'center',
    centeredRotation: true,
    snapAngle: 1,
    selectable: true
  });
  const t = new fabric.IText(number.toString(), {
    fontFamily: 'Calibri',
    fontSize: 14,
    fill: '#fff',
    textAlign: 'center',
    originX: 'center',
    originY: 'center'
  });
  target = o.target;
  var zindex = canvas.getObjects().indexOf(target);
  zindex = (zindex) + 1;
  rect = new fabric.Group([o, t], {
    left: origX,
    top: origY,
    centeredRotation: true,
    snapAngle: 1,
    selectable: true,
    lockScalingX: false,
    lockScalingY: false,
    lockRotation: false,
    id: id,
    number: zindex,
    type: 'rect'
  });

  canvas.add(rect);
}

function rectmousemove(e) {
  if (!isDown) return;
  var pointer = canvas.getPointer(e.e);

  if (origX > pointer.x) {
    rect.set({ left: Math.abs(pointer.x) });
  }
  if (origY > pointer.y) {
    rect.set({ top: Math.abs(pointer.y) });
  }

  rect.item(0).set({ width: Math.abs(origX - pointer.x) });
  rect.item(0).set({ height: Math.abs(origY - pointer.y) });

  rect.set({ width: Math.abs(origX - pointer.x) });
  rect.set({ height: Math.abs(origY - pointer.y) });

  snapToGrid(e.target);

  canvas.renderAll();
}

function rectmouseup(e) {
  isDown = false;
  rect.setCoords();
  canvas.setActiveObject(rect);
  canvas.DrawingMode = false;
}
// ************** HANDLE RECTANGLE FREE DRAW END ************** //

// ************** HANDLE OBJECT ORDERING HERE ************** //

function addToSortableList(obj) {
  target = obj.target;
  var zindex = canvas.getObjects().indexOf(target);

  zindex = (zindex) + 1;

  target.item(1).set({ 'text': zindex.toString() });

  $("#sortable").append('<li class="ui-state-default list-group-item" data-id="' + target.id + '" >' + zindex + '</li>');
  $("#defaultItem").remove();
}

function orderChanged() {
  var listInOrder = $("#sortable").sortable("toArray", { attribute: 'data-id' });

  listInOrder.forEach(function (item, i) {
    canvas.getObjects().forEach(function (o) {
      if (o.id == item) {
        o.moveTo(i + 1);
        o.set('text', i + 1);
      }
    });
  });

  canvas.renderAll();
  fabricToJSON();
}

// ************** HANDLE OBJECT ORDERING END ************** //

// ************** HANDLE JSON HERE ************** //

// Find greatest common divider
function gcd(a, b) {
  return (b == 0) ? a : gcd(b, a % b);
}

function fabricToJSON() {

  const width = bgImg ? bgImg.width : 1;
  const height = bgImg ? bgImg.height : 1;

  let ratio = gcd(width, height);

  frameHeight = height / ratio;
  frameWidth = width / ratio;

  if (file) {
    fileName = file.name;
  } else {
    fileName = '';
  }

  let baseJSON = {
    details: [{
      frameSize: frameWidth + "x" + frameHeight,
      fileName: "https://data.creatorpresets.com/api/" + fileName,
      width: width,
      height: height
    }],
    areas: []
  }

  canvas.getObjects().forEach(function (o) {

    let target = o;
    heightObj = target.height * target.scaleY * frameHeight;
    widthObj = target.width * target.scaleX * frameWidth;

    baseJSON.areas.push({
      order: canvas.getObjects().indexOf(o) + 1,
      width: widthObj,
      height: heightObj,
      coords: (o.left * frameWidth) + "," + (o.top * frameHeight) + "," + ((o.left + o.width) * frameWidth) + "," + ((o.top + o.height) * frameHeight),
      shape: o.type,
      rotate: o.get('angle')
    });
  });

  $("#jsonOutput").val(JSON.stringify(baseJSON, null, 2));
}

// JSON import and related
function JSONToFabric(data) {

  try {
    parsed = JSON.parse(data);
    // Get BG and load onto canvas
    backgroundImage = parsed.details[0].fileName;

    canvasWidth = $(".canvas-area").width();
    canvasHeight = (parsed.details[0].height / parsed.details[0].width) * canvasWidth;

    canvas.setHeight(canvasHeight);
    canvas.setWidth(canvasWidth);

    loadFabricBackground(backgroundImage);

    // let canvasRatio = gcd(canvas.width, canvas.height);
    let canvasRatio = gcd(parsed.details[0].width, parsed.details[0].height);

    frameHeightCanvas = parsed.details[0].height / canvasRatio ;
    frameWidthCanvas = parsed.details[0].width / canvasRatio ;
    
    frameSize = parsed.details[0].frameSize.split('x')

    widthRatio = parsed.details[0].width / canvas.width;
    heightRatio = parsed.details[0].height / canvas.height ;

    if(parsed.areas) {
      cvObjects = parsed.areas;

      cvObjects.forEach(function(obj) {
        if(obj.shape == "rect") {
          objWidth = ((obj.width) / widthRatio);
          objHeight = ((obj.height) / heightRatio);

          coordinates = obj.coords.split(",");
          objLeft = (coordinates[0] / widthRatio);
          objTop = (coordinates[1] / heightRatio);

          const o = addRect(objLeft, objTop, objWidth, objHeight);
          o.set({angle: obj.rotate});
          canvas.setActiveObject(o);
        }
      });
      canvas.renderAll();

    }


  } catch (e) {
    alert("Error in JSON data. Check console for details"); // error in the above string (in this case, yes)!
    console.error(e);
  }

}

function loadFabricBackground(data) {
  fabric.Image.fromURL(data, function (img) {

    bgImg = img;
    canvasWidth = $(".canvas-area").width();
    canvasHeight = (img.height / img.width) * canvasWidth;

    canvas.setHeight(canvasHeight);
    canvas.setWidth(canvasWidth);

    document.getElementById("width").value = img.width;
    document.getElementById("height").value = img.height;

    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
      scaleX: canvas.width / img.width,
      scaleY: canvas.height / img.height
    });

    console.log(canvas);
  });
}

// ************** HANDLE JSON END ************** //

function getSelection() {
  aOG = canvas.getActiveObject() == null ? canvas.getActiveGroup() : canvas.getActiveObject();
  return aOG;
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
    removeObjectFromCanvas(o.id);
  }
});

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

$("#bringToFront").click(function () {
  const o = getSelection();
  canvas.bringToFront(o);
});

$("#bringForward").click(function () {
  const o = getSelection();
  canvas.bringForward(o);
});

$("#sendBackwards").click(function () {
  const o = getSelection();
  canvas.sendBackwards(o);
});

$("#sendToBack").click(function () {
  const o = getSelection();
  canvas.sendToBack(o);
});

$("#changeOrder").click(function () {
  orderChanged();
});

$("#submitJSON").click(function (){
  data = $("#jsonInput").val();
  JSONToFabric(data);
  $("#jsonModal").modal('hide');
});

// Handle item sorting
$(function () {
  $("#sortable").sortable();
});

initCanvas();
fabricToJSON();