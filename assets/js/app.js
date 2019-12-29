let canvas
let file
let bgImg, bgJSON, jsonImport

var polygonMode = false;
var polygonMove = false;

const grid = 3;
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
    if (e.target.type == 'rect') {
      addToSortableList(e);
      fabricToJSON();
    }
    else {
      polygonMove = false;
    }
  })
  canvas.on('object:moving', function (e) {
    if (e.target.type == 'polygon') {
      polygonMove = true;
    }
    getObjDimensions(e);
    fabricToJSON();
  })
  canvas.on('object:scaling', function (e) {
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
    // checkBoundingBox(e);
    fabricToJSON();
  })
  canvas.observe('object:rotating', function (e) {
    // checkBoundingBox(e)
    console.log(e);
  })
  canvas.observe('object:scaling', function (e) {
    // checkBoundingBox(e)
  })
  canvas.observe('mouse:down', function (e) {
    if (canvas.DrawingMode) {
      rectmousedown(e);
    }

    if (polygonMode) {
      polyMouseDown(e);
    }
    // getObjDimensions(e);
  });
  canvas.observe('mouse:move', function (e) {
    if (canvas.DrawingMode) {
      rectmousemove(e);
    }

    if (polygonMode) {
      polyMouseMove(e);
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
    originX: "center",
    originY: "center",
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

  let widthRatio = width / canvas.width;
  let heightRatio = height / canvas.height;

  heightObj = target.height * target.scaleY * (heightRatio);
  widthObj = target.width * target.scaleX * (widthRatio);

  heightObj = Math.round(heightObj);
  widthObj = Math.round(widthObj);

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
      id: generateId()
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

    if (clonedObj.type == 'polygon') {
      addPolygonToSortableList(clonedObj);
    }
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
    type: 'rect',
    originX: 'center',
    originY: 'center'
  });

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

}

function rectmouseup(e) {
  isDown = false;

  rect.set({ left: rect.left + (rect.width / 2) });
  rect.set({ top: rect.top + (rect.height / 2) });

  canvas.add(rect);

  rect.setCoords();
  canvas.renderAll();

  canvas.setActiveObject(rect);
  canvas.DrawingMode = false;
}
// ************** HANDLE RECTANGLE FREE DRAW END ************** //

// ************** HANDLE OBJECT ORDERING HERE ************** //

function addToSortableList(obj) {
  target = obj.target;
  var zindex = canvas.getObjects().indexOf(target);

  zindex = (zindex) + 1;

  if (target.type == 'rect') {
    target.item(1).set({ 'text': zindex.toString() });
    $("#sortable").append('<li class="ui-state-default list-group-item" data-id="' + target.id + '" >' + zindex + '</li>');
    $("#defaultItem").remove();
  }
}

function addPolygonToSortableList(obj) {
  target = obj;
  var zindex = canvas.getObjects().indexOf(target);

  zindex = (zindex) + 1;

  if (target.type == 'polygon') {
    // target.item(1).set({ 'text': zindex.toString() });
    $("#sortable").append('<li class="ui-state-default list-group-item" data-id="' + target.id + '" >' + zindex + '</li>');
    $("#defaultItem").remove();
  }
}

function orderChanged() {
  var listInOrder = $("#sortable").sortable("toArray", { attribute: 'data-id' });

  listInOrder.forEach(function (item, i) {
    canvas.getObjects().forEach(function (o) {
      if (o.id == item) {
        o.moveTo(i + 1);
      }
    });
  });

  canvas.renderAll();
  fabricToJSON();
}

function removeFromList(id) {
  let itemID = $('*[data-id="' + id + '"]');
  itemID.remove();

  orderChanged();
}
// ************** HANDLE OBJECT ORDERING END ************** //

// ************** HANDLE JSON HERE ************** //

// Find greatest common divider
function gcd(a, b) {
  return (b == 0) ? a : gcd(b, a % b);
}

function fabricToJSON() {

  // Needs to be modified to handle imports
  if (bgJSON) {

    frameRatio = jsonImport.details[0].frameSize.split('x');
    let baseJSON = {
      details: [{
        frameSize: jsonImport.details[0].frameSize,
        fileName: jsonImport.details[0].fileName,
        width: jsonImport.details[0].width,
        height: jsonImport.details[0].height
      }],
      areas: []
    }
    let widthRatio = jsonImport.details[0].width / canvas.width;
    let heightRatio = jsonImport.details[0].height / canvas.height;

    canvas.getObjects().forEach(function (o) {
      let target = o;
      heightObj = Math.round(target.height * target.scaleY * heightRatio);
      widthObj = Math.round(target.width * target.scaleX * widthRatio);

      if (target.type == 'rect') {
        objLeft = Math.round(o.left * widthRatio) - (widthObj / 2);
        objTop = Math.round(o.top * heightRatio) - (heightObj / 2);
        objRight = Math.round((o.left + o.width) * widthRatio) - (widthObj / 2);
        objBottom = Math.round((o.top + o.height) * heightRatio) - (heightObj / 2);

        baseJSON.areas.push({
          order: canvas.getObjects().indexOf(o) + 1,
          width: widthObj,
          height: heightObj,
          coords: objLeft + "," + objTop + "," + objRight + "," + objBottom,
          shape: o.type,
          rotate: o.get('angle')
        });
      }
      else {

        polyTarget = target;

        let matrix = polyTarget.calcTransformMatrix();
        let transformedPoints;
        if (polygonMove) {
          transformedPoints = polyTarget.get("points")
            .map(function (p) {
              return new fabric.Point(p.x - polyTarget.pathOffset.x, p.y - polyTarget.pathOffset.y);
            })
            .map(function (p) {
              return fabric.util.transformPoint(p, matrix);
            });
        } else {
          transformedPoints = polyTarget.get("points")
            .map(function (p) {
              return new fabric.Point(p.x, p.y);
            })
            .map(function (p) {
              return fabric.util.transformPoint(p, matrix);
            });
        }

        let polyPoints = []
        transformedPoints.map(function (p) {
          let points;

          if (polygonMove) {
            points = {
              "x": Math.round((p.x) * widthRatio + (widthObj / 2)),
              "y": Math.round((p.y) * heightRatio + (heightObj / 2))
            };
          } else {
            points = {
              "x": Math.round((p.x)),
              "y": Math.round((p.y))
            };
          }

          polyPoints.push(points);
        });

        baseJSON.areas.push({
          order: canvas.getObjects().indexOf(polyTarget) + 1,
          width: widthObj,
          height: heightObj,
          coords: polyPoints,
          shape: polyTarget.type,
          rotate: polyTarget.get('angle')
        });
      }
    });

    $("#jsonOutput").val(JSON.stringify(baseJSON, null, 2));

  } else if (file) {
    const width = bgImg ? bgImg.width : 1;
    const height = bgImg ? bgImg.height : 1;

    let fileName;
    let ratio = gcd(width, height);
    let widthRatio = width / canvas.width;
    let heightRatio = height / canvas.height;

    frameHeight = height / ratio;
    frameWidth = width / ratio;

    if (file) {
      fileName = file.name;
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
      let heightObj = Math.round(target.height * target.scaleY * heightRatio);
      let widthObj = Math.round(target.width * target.scaleX * widthRatio);

      if (target.type == 'rect') {
        objLeft = Math.round((o.left * widthRatio) - (widthObj / 2));
        objTop = Math.round((o.top * heightRatio) - (heightObj / 2));
        objRight = Math.round(((o.left + o.width) * widthRatio) - (widthObj / 2));
        objBottom = Math.round(((o.top + o.height) * heightRatio) - (heightObj / 2));

        baseJSON.areas.push({
          order: canvas.getObjects().indexOf(o) + 1,
          width: widthObj,
          height: heightObj,
          coords: objLeft + "," + objTop + "," + objRight + "," + objBottom,
          shape: o.type,
          rotate: o.get('angle')
        });
      }
      else {

        polyTarget = target;

        let matrix = polyTarget.calcTransformMatrix();
        let transformedPoints;
        if (polygonMove) {
          transformedPoints = polyTarget.get("points")
            .map(function (p) {
              return new fabric.Point(p.x - polyTarget.pathOffset.x, p.y - polyTarget.pathOffset.y);
            })
            .map(function (p) {
              return fabric.util.transformPoint(p, matrix);
            });
        } else {
          transformedPoints = polyTarget.get("points")
            .map(function (p) {
              return new fabric.Point(p.x, p.y);
            })
            .map(function (p) {
              return fabric.util.transformPoint(p, matrix);
            });
        }

        let polyPoints = []
        transformedPoints.map(function (p) {
          let points;

          if (polygonMove) {
            points = {
              "x": Math.round((p.x) * widthRatio + (widthObj / 2)),
              "y": Math.round((p.y) * heightRatio + (heightObj / 2))
            };
          } else {
            points = {
              "x": Math.round((p.x)),
              "y": Math.round((p.y))
            };
          }

          polyPoints.push(points);
        });

        baseJSON.areas.push({
          order: canvas.getObjects().indexOf(polyTarget) + 1,
          width: widthObj,
          height: heightObj,
          coords: polyPoints,
          shape: polyTarget.type,
          rotate: polyTarget.get('angle')
        });
      }

    });

    $("#jsonOutput").val(JSON.stringify(baseJSON, null, 2));
  }
}

// JSON import and related
function JSONToFabric(data) {

  try {
    if (canvas) {
      canvas.clear()
    }

    parsed = JSON.parse(data);
    // Get BG and load onto canvas
    backgroundImage = parsed.details[0].fileName;

    canvasWidth = $(".canvas-area").width();
    canvasHeight = (parsed.details[0].height / parsed.details[0].width) * canvasWidth;

    canvas.setHeight(canvasHeight);
    canvas.setWidth(canvasWidth);

    loadFabricBackground(backgroundImage);

    bgJSON = backgroundImage;
    jsonImport = parsed;
    let widthRatio = Math.round((parsed.details[0].width / canvas.width) * 100) / 100;
    let heightRatio = Math.round((parsed.details[0].height / canvas.height) * 100) / 100;

    if (parsed.areas) {
      cvObjects = parsed.areas;

      cvObjects.forEach(function (obj) {
        if (obj.shape == "rect") {
          let objWidth = ((obj.width) / widthRatio);
          let objHeight = ((obj.height) / heightRatio);

          let coordinates = obj.coords.split(",");
          let objLeft = (coordinates[0] / widthRatio) + (objWidth / 2);
          let objTop = (coordinates[1] / heightRatio) + (objHeight / 2);

          const o = addRect(objLeft, objTop, objWidth, objHeight);
          // o.rotate(obj.rotate);
          // o.set({"originX": "center", "originY": "center"});
          o.set({ "angle": obj.rotate });
          // o.set({"originX": "top", "originY": "left"});
          canvas.setActiveObject(o);
        }
        else if (obj.shape == "polygon") {
          let objWidth = ((obj.width) / widthRatio);
          let objHeight = ((obj.height) / heightRatio);

          let coordinates = obj.coords;
          let polyPointsArray = new Array();

          coordinates.map(function (p) {

            let obLeft = Math.round((p.x / widthRatio) - (objWidth / 2));
            let obTop = Math.round((p.y / heightRatio) - (objHeight / 2));

            let points = {
              x: obLeft,
              y: obTop,
            }

            polyPointsArray.push(points);
          });

          console.log(polyPointsArray);

          let polygon = new fabric.Polygon(polyPointsArray, {
            stroke: '#333333',
            strokeWidth: 0.5,
            fill: 'red',
            opacity: 1,
            hasBorders: true,
            hasControls: true
          });
          canvas.add(polygon);
          polygon.set({ "angle": obj.rotate });
          canvas.setActiveObject(polygon);

          canvas.renderAll();
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

    fabricToJSON();
  });
}

// ************** HANDLE JSON END ************** //

function getSelection() {
  aOG = canvas.getActiveObject() == null ? canvas.getActiveGroup() : canvas.getActiveObject();
  return aOG;
};

// ************** HANDLE POLYGON HERE ************** //

var min = 99;
var max = 999999;
var pointArray = new Array();
var lineArray = new Array();
var activeLine;
var activeShape = false;

var prototypefabric = new function () { };

// POLYGON PROTOTYPE
prototypefabric.polygon = {
  drawPolygon: function () {
    polygonMode = true;
    pointArray = new Array();
    lineArray = new Array();
    activeLine;
  },
  addPoint: function (options) {
    var random = Math.floor(Math.random() * (max - min + 1)) + min;
    var id = generateId();
    var circle = new fabric.Circle({
      radius: 10,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: (options.e.layerX / canvas.getZoom()),
      top: (options.e.layerY / canvas.getZoom()),
      selectable: true,
      hasBorders: true,
      hasControls: true,
      originX: 'center',
      originY: 'center',
      id: id,
      objectCaching: false
    });
    if (pointArray.length == 0) {
      circle.set({
        fill: tableFill
      })
    }
    var points = [(options.e.layerX / canvas.getZoom()), (options.e.layerY / canvas.getZoom()), (options.e.layerX / canvas.getZoom()), (options.e.layerY / canvas.getZoom())];
    line = new fabric.Line(points, {
      strokeWidth: 2,
      fill: '#999999',
      stroke: '#999999',
      class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasBorders: true,
      hasControls: true,
      evented: true,
      objectCaching: false
    });
    if (activeShape) {
      var pos = canvas.getPointer(options.e);
      var points = activeShape.get("points");
      points.push({
        x: pos.x,
        y: pos.y
      });
      var polygon = new fabric.Polygon(points, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.3,
        selectable: true,
        hasBorders: true,
        hasControls: true,
        evented: true,
        objectCaching: false
      });
      canvas.remove(activeShape);
      canvas.add(polygon);
      activeShape = polygon;
      canvas.renderAll();
    }
    else {
      var polyPoint = [{ x: (options.e.layerX / canvas.getZoom()), y: (options.e.layerY / canvas.getZoom()) }];
      var polygon = new fabric.Polygon(polyPoint, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.3,
        selectable: true,
        hasBorders: true,
        hasControls: true,
        evented: true,
        objectCaching: false
      });
      activeShape = polygon;
      canvas.add(polygon);
    }
    activeLine = line;

    pointArray.push(circle);
    lineArray.push(line);

    canvas.add(line);
    canvas.add(circle);
    canvas.selection = false;
  },
  generatePolygon: function (pointArray) {
    var points = new Array();
    $.each(pointArray, function (index, point) {
      points.push({
        x: point.left,
        y: point.top
      });
      canvas.remove(point);
    });
    $.each(lineArray, function (index, line) {
      canvas.remove(line);
    });
    canvas.remove(activeShape).remove(activeLine);
    var polygon = new fabric.Polygon(points, {
      stroke: '#333333',
      strokeWidth: 0.5,
      fill: 'red',
      opacity: 1,
      hasBorders: true,
      hasControls: true,
    });
    canvas.add(polygon);

    activeLine = null;
    activeShape = null;
    polygonMode = false;
    canvas.selection = true;
    polygon.set('type', 'polygon');
    addPolygonToSortableList(polygon);
    fabricToJSON();
  }
};

function polyMouseDown(options) {
  if (options.target && options.target.id == pointArray[0].id) {
    prototypefabric.polygon.generatePolygon(pointArray);
  }
  if (polygonMode) {
    prototypefabric.polygon.addPoint(options);
  }
}

function polyMouseMove(options) {
  if (activeLine && activeLine.class == "line") {
    var pointer = canvas.getPointer(options.e);
    activeLine.set({ x2: pointer.x, y2: pointer.y });

    var points = activeShape.get("points");
    points[pointArray.length] = {
      x: pointer.x,
      y: pointer.y
    }
    activeShape.set({
      points: points
    });
    canvas.renderAll();
  }
  canvas.renderAll();
}

// ************** HANDLE POLYGON END ************** //
// For delete handling via button 
$(window).keydown(function (e) {
  switch (e.keyCode) {
    case 46: // delete
      var obj = canvas.getActiveObject();
      removeFromList(obj.id);
      canvas.remove(obj);
      canvas.renderAll();

      fabricToJSON();

      return false;
  }
  return; //using "return" other attached events will execute
});

// CTRL + C
$(window).keydown(function (e) {
  if ((e.metaKey || e.ctrlKey) && (String.fromCharCode(e.which).toLowerCase() === 'c')) {
    console.log("You pressed CTRL + C");
    copy();
  }
  return;
});

// CTRL + V
$(window).keydown(function (e) {
  if ((e.metaKey || e.ctrlKey) && (String.fromCharCode(e.which).toLowerCase() === 'v')) {
    console.log("You pressed CTRL + V");
    paste();
  }
  return;
});

// Add rectangle on click of button
$("#addRectangle").click(function () {
  const o = addRect(30, 30, 60, 60)
  canvas.setActiveObject(o)
});

// Remove active object
$("#removeObject").click(function () {
  const o = getSelection()
  if (o.remove) {
    removeFromList(o.id);
    o.remove();
    canvas.remove(o);
    canvas.discardActiveObject();
    canvas.renderAll();

    $("#heightObj").val("");
    $("#widthObj").val("");

    fabricToJSON();
  }
  else {
    removeObjectFromCanvas(o.id);
  }
});

$("#select").click(function () {
  canvas.DrawingMode = false;
  polygonMode = false;
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

$("#submitJSON").click(function () {
  data = $("#jsonInput").val();
  JSONToFabric(data);
  $("#jsonModal").modal('hide');
});

$("#drawPolygon").click(function () {
  polygonMode = true;
});

// Handle item sorting
$(function () {
  $("#sortable").sortable();
});

initCanvas();
fabricToJSON();