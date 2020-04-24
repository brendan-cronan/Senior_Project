let ray;
let shapes;

//Interaction Flags
let SHOW_SHAPES = false;
let DELTA = .005;
let MOUSE_CONTROL = false;

let NUMBER_OF_SHAPES = 5;

//Interactivity Controls
let angleSlider;
let deltaSlider;
let shapeSlider;

let displayShapesB;
let mouseControlB;


function setup() {
  createCanvas(1000, 1000);
  frameRate(60);

  init();


  this.createInteractivity();
  this.updateValues();

}

function init() {
  ray = new Ray();
  shapes = [];

  for (var i = 0; i < NUMBER_OF_SHAPES; i++) {
    var pos = createVector(random(width), random(height));
    var size = random(20, 100);
    shapes.push(new Circle(pos, size));
  }
}


function createInteractivity() {
  push();
  createP('Click on canvas to set the origin of the ray.');
  createP('Enable mouse control and drag to view distance function from a single point.');
  createP('Press R to restart the simulation');
  createSpan('Angle:');
  createSpan('0');
  angleSlider = createSlider(0, 360, 0, 0);
  angleSlider.style('width', '1080px');
  createSpan('360');

  createP('');

  createSpan('Rate of Change:');
  createSpan('-1');
  deltaSlider = createSlider(-1000, 1000, 0, 2);
  createSpan('1');

  createP('');

  createSpan('Number of Shapes to Generate');
  createSpan('1');
  shapeSlider = createSlider(1, 10, NUMBER_OF_SHAPES);
  createSpan('10');

  createP('');

  displayShapes = createButton("Toggle Shape Display");
  displayShapes.mousePressed(() => {
    SHOW_SHAPES = !SHOW_SHAPES;
  });

  mouseControlB = createButton("Control Ray With Mouse");
  mouseControlB.mousePressed(() => {
    MOUSE_CONTROL = !MOUSE_CONTROL;
    deltaSlider.value(0);
  });

  pop();
}

function updateValues() {
  DELTA = deltaSlider.value() / 1500;
  NUMBER_OF_SHAPES = shapeSlider.value();
  let ang = angleSlider.value();
  ang += DELTA;
  ang %= 360;
  angleSlider.value(ang);
  ray.setDirection(p5.Vector.fromAngle(radians(ang)));
}

function moveToMouse() {
  if (mouseX <= width && mouseX >= 0 && mouseY >= 0 && mouseY <= height)
    ray.setOrigin(createVector(mouseX, mouseY));
}

function mousePressed() {
  moveToMouse();
}

function mouseDragged() {
  moveToMouse();
}

function keyTyped() {
  if (key === 'r') {
    init();
  }
}

function addShape() {
  let pos = createVector(random(width), random(height));
  shapes.push(new Circle());
}

function draw() {
  background(80);
  updateValues();

  if (SHOW_SHAPES) {
    for (var k = 0; k < shapes.length; k++) {
      shapes[k].show();
    }
  }

  ray.update(createVector(mouseX, mouseY));
  let pt = ray.castRay(createVector(), shapes, 0);
  if (pt) {
    ray.addPt(pt);
  }
  ray.show();


}