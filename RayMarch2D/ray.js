const RAY_LENGTH = 50;
const MAX_DISTANCE = 30;
const GRANULARITY = .05;
const MAX_RADIUS = 700;
const POINT_SIZE = 5;

class Ray {


  constructor(origin, direction) {
    this.org = origin ? origin : createVector();
    this.dir = direction ? direction : createVector();
    this.circles = [];
    this.randomRay();
  }

  randomRay() {
    this.org = createVector(random(width), random(height));
    this.dir = createVector(random(-1, 1), random(-1, 1)).normalize();

  }

  addPt(pt) {
    this.circles.push(pt);
  }

  setOrigin(origin) {
    this.org.set(origin);
  }
  setOrigin(x, y) {
    this.org.set(x, y);
  }

  setDirection(direction) {
    this.dir.set(direction.normalize());
  }
  setDirection(x, y) {
    this.dir.set(x, y).normalize();
  }

  getOrigin() {
    return this.org.copy();
  }
  getDirection() {
    return this.dir.copy();
  }

  getEndpoint(infinite) {
    let direct = this.getDirection();
    let endPt;
    if (infinite) {
      let maxScreenDim = width*height;
      direct.mult(maxScreenDim);
    } else {
      direct.mult(RAY_LENGTH);
    }

    endPt = this.getOrigin().add(direct);
    return endPt;
  }

  infiniteRay() {
    let maxScreenDim = max(width, height);
    this.dir.mult(maxScreenDim);
  }

  pointToMouse(mouseVec) {
    return mouseVec.copy().sub(this.getOrigin()).normalize();
  }

  findNearestShape(shapes, point) {
    let minDist = -1;
    for (var i = 0; i < shapes.length; i++) {
      strokeWeight(1);
      stroke(255, 0, 0);
      stroke(0, 0, 255);
      var dist = shapes[i].getDistance(point.copy());
      if (dist < minDist || minDist == -1) {
        minDist = dist;
      }
    }
    return minDist;
  }

  castRay(point, shapes, stepNum) {
    var originPoint;
    var stepSize;
    
    if (stepNum == 0) {
      originPoint = this.getOrigin();
    } else {
      originPoint = point;
    }
    
    stepNum += 1;
    stepSize = this.findNearestShape(shapes, originPoint);

    if (stepSize <= GRANULARITY) {
     return originPoint; 
    }

    let newOrigin = p5.Vector.add(originPoint, this.getDirection().mult(stepSize));

    this.showCircle(originPoint, stepSize);
    
    if (stepNum >= MAX_DISTANCE || stepSize >= MAX_RADIUS) {
      return null;
    }
    
    return this.castRay(newOrigin, shapes, stepNum);
  }


  update(mouseVector, angle) {
    if (MOUSE_CONTROL) {
      this.setDirection(this.pointToMouse(mouseVector));
    }
    this.setDirection(this.getDirection().rotate(DELTA));
    this.angle = this.getDirection().heading();
  }

  showVector(vec1, vec2) {
    push();
    var d = p5.Vector.dist(vec1, vec2);
    let x1 = vec1.x;
    let x2 = vec2.x;
    let y1 = vec1.y;
    let y2 = vec2.y;
    translate((x1 + x2) / 2, (y1 + y2) / 2);
    rotate(atan2(y2 - y1, x2 - x1));
    text(nfc(d, 1), 0, -5);
    pop();
    line(vec1.x, vec1.y, vec2.x, vec2.y);
  }

  showCircle(pt, dist) {
    // this.showVector(this.org, createVector(this.org.x + dist, this.org.y));
    var col = 180;
    fill(col, col, col, 50);
    stroke(110);
    strokeWeight(1);
    ellipse(pt.x, pt.y, dist * 2, dist * 2);
  }

  show() {
    // this.showCircle(this.getOrigin(), 10);
    let end = this.getEndpoint(true);

    push();
    strokeWeight(5);
    stroke(230);
    line(this.org.x, this.org.y, end.x, end.y);
    pop();
    
    if (this.circles.length > 0) {
      for (var i = 0; i < this.circles.length; i++) {
        push();
        strokeWeight(POINT_SIZE);
        stroke(255);
        point(this.circles[i].x, this.circles[i].y);
        pop();
      }
    }

  }




}