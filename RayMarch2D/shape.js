class Shape {
  
  constructor(position, size) {
    this.pos = position;
    this.size = size;
    this.color = createVector(random(255), random(255), random(255));
    
    
  }
  
  getPosition() {
    return this.pos;
  }
    
  getDistance(eye) {
    return p5.Vector.dist(this.pos, eye);
  }
  
  show() {
  }  
}


class Square extends Shape {
  
  
}

class Circle extends Shape {
  
  constructor(position, radius) {
    super(position, createVector(radius, radius));
  }
  
  getDistance(eye) {
    return p5.Vector.dist(this.pos, eye) - this.size.x;
  }
  
  show() {
    push();
    stroke(0);
    fill(this.color.x,this.color.y, this.color.z);
    strokeWeight(2);
    ellipse(this.pos.x,this.pos.y, this.size.x*2,this.size.x*2);
    pop();
  }
  
}