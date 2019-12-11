let canvas
let number



const grid = 8
const backgroundColor = '#f8f8f8'
const lineStroke = '#ebebeb'
const lineStroke2 = 'rgba(192,192,192, 0.7)' 
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

        var  photoUrlLandscape = 'https://images8.alphacoders.com/292/292379.jpg',
            photoUrlPortrait = 'https://presspack.rte.ie/wp-content/blogs.dir/2/files/2015/04/AMC_TWD_Maggie_Portraits_4817_V1.jpg'


let widthEl = document.getElementById('width')
let heightEl = document.getElementById('height')
let canvasEl = document.getElementById('canvas')

function initCanvas() {
  if (canvas) {
    canvas.clear()
    canvas.dispose()
  }
  
  
  
  
  
  function drawGrid(cellSize, gridWidth, gridHeight, xPos, yPos) {

    var bkgndrect = new fabric.Rect({
        width: gridWidth + 50,
        height: gridHeight + 50,
        stroke: lineStroke2,
        fill: 'transparent',
        selectable: false
    });

    var rect = new fabric.Rect({
        left: 25,
        top: 25,
        width: gridWidth,
        height: gridHeight,
        stroke: lineStroke2,
        fill: 'transparent',
        selectable: false
    });

    var gridGroup = new fabric.Group([bkgndrect, rect], {
        left: xPos,
        top: yPos,
        selectable: false
    });

    canvas.add(gridGroup);

    for (var i = 1; i < (gridWidth / cellSize); i++) {
        var line = new fabric.Line([0, 0, 0, gridHeight], {
            left: (gridWidth / 2) - i * cellSize,
            top: -gridHeight / 2,
            stroke: lineStroke2,
            selectable: false
        });
        gridGroup.add(line);
    }

 

    for (var i = 0; i < (gridWidth / cellSize); i++) {
        var text = new fabric.Text(String((i) * 5), {
            left: -(gridWidth / 2) + i * cellSize,
            top: -(gridHeight / 2) - 20,
            fontSize: 14,
            selectable: false
        });
        gridGroup.add(text);
    }

    for (var i = 0; i < (gridHeight / cellSize); i++) {
        var text = new fabric.Text(String((i) * 5), {
            left: -(gridWidth / 2) - 20,
            top: -(gridHeight / 2) + (i) * cellSize,
            fontSize: 14,
            textAlign: 'right',
            selectable: false
        });
        gridGroup.add(text);
    }
        sendLinesToBack()
    canvas.renderAll();
}

  
  
  
  
  $(function() {
  
   canvas.renderAll();
   //Change background using Image
   document.getElementById('bg_image').addEventListener('change', function(e) {
      canvas.setBackgroundColor('', canvas.renderAll.bind(canvas));
      canvas.setBackgroundImage(0, canvas.renderAll.bind(canvas));
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function(f) {
         var data = f.target.result;
         fabric.Image.fromURL(data, function(img) {
          
           canvas.setHeight(img.height);
           canvas.setWidth(img.width);
            
            document.getElementById("width").value = img.width; 
            document.getElementById("height").value = img.height; 
            document.getElementById("canvas").style.width = img.width;
            document.getElementById("canvas").style.height = img.height;   
 
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
  
  
  canvas = new fabric.Canvas('canvas',{ renderOnAddRemove: false }) 
  number = 1
  canvas.backgroundColor = backgroundColor
  canvas.setBackgroundImage('bg2.jpg', canvas.renderAll.bind(canvas));
 
  
// drawGrid(50, 4320, 1350, 0, 0);

canvas.on('object:moving', function(options) { 
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
initCanvas()

function resizeCanvas() {
  widthEl = document.getElementById('width')
  heightEl = document.getElementById('height')
  canvasEl.width = widthEl.value ? widthEl.value : 1200
  canvasEl.height = heightEl.value ? heightEl.value : 1350
  const canvasContainerEl = document.querySelectorAll('.canvas-container')[0]
  canvasContainerEl.style.width = canvasEl.width
  canvasContainerEl.style.height = canvasEl.height
}
resizeCanvas()

widthEl.addEventListener('change', () => {
  resizeCanvas()
  initCanvas()
  addDefaultObjects()
})
heightEl.addEventListener('change', () => {
  resizeCanvas()
  initCanvas()
  addDefaultObjects()
})

function generateId() {
  return Math.random().toString(36).substr(2, 8)
}

function addRect(left, top, width, height) {
  const id = generateId()
  const o = new fabric.Rect({
    width: width,
    height: height,
    fill: tableFill,
    stroke: tableStroke,
    strokeWidth: 0,
    shadow: tableShadow,
    originX: 'center',
    originY: 'center',
    centeredRotation: true,
    lockScalingX: false,
    lockScalingY: false,
    lockRotation: false,
    snapAngle: 5,
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
    snapAngle: 5,
    selectable: true,
                lockScalingX: false,
            lockScalingY: false,
            lockRotation: false,
    type: 'table',
    id: id,
    number: number
  })
  canvas.add(g)
  number++
  return g
}
 
 

function snapToGrid(target) {
  target.set({
    left: Math.round(target.left / (grid / 2)) * grid / 2,
    top: Math.round(target.top / (grid / 2)) * grid / 2
  })
}

function checkBoudningBox(e) {
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

function sendLinesToBack() {
  canvas.getObjects().map(o => {
    if (o.type === 'line') {
      canvas.sendToBack(o)
    }
  })
}

document.querySelectorAll('.rectangle')[0].addEventListener('click', function() {
  const o = addRect(0, 0, 60, 60)
  canvas.setActiveObject(o)
})


 
 

 
document.querySelectorAll('.remove')[0].addEventListener('click', function() {
  const o = canvas.getActiveObject()
  if (o) {
    o.remove()
    canvas.remove(o)
    canvas.discardActiveObject()
    canvas.renderAll()
  }
})
 
 

function formatTime(val) {
  const hours =  Math.floor(val / 60)
  const minutes = val % 60
  const englishHours = hours > 12 ? hours - 12 : hours
  
  const normal = hours + ':' + minutes + (minutes === 0 ? '0' : '')
  const english = englishHours + ':' + minutes + (minutes === 0 ? '0' : '') + ' ' + (hours > 12 ? 'PM' : 'AM')
  
  return normal + ' (' + english + ')'
}

 
 

function addDefaultObjects() {
  addRect(0, 330, 90, 60)
}
addDefaultObjects()
 

 
  $("#canvas2json").click(function() { 
    var json = canvas.toJSON();
    $("#myTextArea").text(JSON.stringify(json));
    
    
  });
  
  $("#loadJson2Canvas").click(function() {
    canvas.loadFromJSON(
      $("#myTextArea").val(),
      canvas.renderAll.bind(canvas));
      
 
  });
 
 
  $("#add2Canvas").click(function() {
   canvas.add(new fabric.Circle({
    radius: 50,
    left: 0,
    top: 0,
    fill: '#0B61A4'
  }));
  });
  
  
  
  
  
  
  
  
  
  
  
// event handlers
$("#select").click(function(){
    canvas.DrawingMode = false;
});
$("#draw").click(function(){
    canvas.DrawingMode = true;
});
$("#copy").click(function(){
    copy();
});
$("#paste").click(function(){
    paste();
});

// Adding some objects onto canvas
 
  
createListenersKeyboard();
function createListenersKeyboard() {
    document.onkeydown = onKeyDownHandler;
    //document.onkeyup = onKeyUpHandler;
}
 
$(window).keydown(function(e) {   
    switch (e.keyCode) {
        case 46: // delete
         var obj = canvas.getActiveObject();
         canvas.remove(obj);
         canvas.renderAll();
         return false;
    }
    return; //using "return" other attached events will execute
});


function onKeyDownHandler(event) {
    //event.preventDefault();
    var key;
    if(window.event){
        key = window.event.keyCode;
    }
    else{
        key = event.keyCode;
    }
    
    switch(key){
        // Shortcuts
        case 67: // Ctrl+C
                if(event.ctrlKey){
                    event.preventDefault();
                    copy();
                }
            break;
        // Paste (Ctrl+V)
        case 86: // Ctrl+V
                if(event.ctrlKey){
                    event.preventDefault();
                    paste();
                }
            break;
            
        default:
            // TODO
            break;
    }
}

var copiedObject,
copiedObjects = new Array();
function copy(){
    copiedObjects = new Array();
    if(canvas.getActiveGroup()){
        //console.log(canvas.getActiveGroup().getObjects());
        canvas.getActiveGroup().getObjects().forEach(function(o){
            var object = fabric.util.object.clone(o);
            copiedObjects.push(object);
        });             
    }
    else if(canvas.getActiveObject()){
        var object = fabric.util.object.clone(canvas.getActiveObject());
        copiedObject = object;
        copiedObjects = new Array();
        
    }
}

function paste(){
    if(copiedObjects.length > 0){
        for(var i in copiedObjects){
        	copiedObjects[i]=fabric.util.object.clone(copiedObjects[i]);
			
            copiedObjects[i].set("top", copiedObjects[i].top+100);
            copiedObjects[i].set("left", copiedObjects[i].left+100);
            
            canvas.add(copiedObjects[i]);
            canvas.item(canvas.size() - 1).hasControls = true;
        }                
    }
    else if(copiedObject){
    	copiedObject= fabric.util.object.clone(copiedObject);
		copiedObject.set("top", 150);
    	copiedObject.set("left", 150);
        canvas.add(copiedObject);
        canvas.item(canvas.size() - 1).hasControls = true;
    }
    canvas.renderAll();  
}








var Rectangle = (function () {
    function Rectangle(canvas) {
        var inst=this;
        this.canvas = canvas;
        this.className= 'Rectangle';
        this.isDrawing = false;
        this.bindEvents();
    }

	 Rectangle.prototype.bindEvents = function() {
    var inst = this;
    inst.canvas.on('mouse:down', function(o) {
      inst.onMouseDown(o);
    });
    inst.canvas.on('mouse:move', function(o) {
      inst.onMouseMove(o);
    });
    inst.canvas.on('mouse:up', function(o) {
      inst.onMouseUp(o);
    });
    inst.canvas.on('object:moving', function(o) {
      inst.disable();
    })
  }
    Rectangle.prototype.onMouseUp = function (o) {
      var inst = this;
      inst.disable();
    };

    Rectangle.prototype.onMouseMove = function (o) {
      var inst = this;
      

      if(!inst.isEnable()){ return; }
      console.log("mouse move rectange");
      var pointer = inst.canvas.getPointer(o.e);
      var activeObj = inst.canvas.getActiveObject();


      if(origX > pointer.x){
          activeObj.set({ left: Math.abs(pointer.x) }); 
      }
      if(origY > pointer.y){
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
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x-origX,
          height: pointer.y-origY,
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

    Rectangle.prototype.isEnable = function(){
      return this.isDrawing;
    }

    Rectangle.prototype.enable = function(){
      this.isDrawing = true;
    }

    Rectangle.prototype.disable = function(){
      this.isDrawing = false;
    }

    return Rectangle;
}());

 
var arrow = new Rectangle(canvas);



