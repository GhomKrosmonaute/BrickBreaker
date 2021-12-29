var app = (() => {
  var __defProp = Object.defineProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __export = (target, all) => {
    __markAsModule(target);
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    draw: () => draw,
    keyPressed: () => keyPressed,
    keyReleased: () => keyReleased,
    setup: () => setup
  });

  // src/constants.ts
  var ASPECT_RATIO = 16 / 9;
  var GRID_WIDTH = 20;
  var GRID_HEIGHT = 8;
  var MAX_DURABILITY = 5;
  var BACKGROUND_COLOR = [0, 0, 0];
  var BALL_BASE_SPEED = 5;
  var BASE_HP = 3;
  var DEBUG_MODE = false;

  // src/bar.ts
  var Bar = class {
    constructor(game2) {
      this.game = game2;
      this.x = 200;
      this.y = height * 0.9;
      this.width = width * 0.1;
      this.height = this.width / 4;
    }
    draw() {
      this.update();
      translate(this.x, this.y);
      noStroke();
      fill(60, 60, 200);
      rect(this.width / 2 * -1, this.height / 2 * -1, this.width, this.height, this.height);
      fill(60, 200, 255);
      rect(this.width / 4 * -1, this.height / 2 * -1, this.width / 2, this.height);
      translate(-this.x, -this.y);
    }
    update() {
      this.move();
      this.bounds();
    }
    bounds() {
      this.game.balls.forEach((ball2) => {
        if (ball2.y + ball2.radius > this.y - this.height / 2 && ball2.x + ball2.radius > this.x - this.width / 2 && ball2.x - ball2.radius < this.x + this.width / 2) {
          ball2.velocity.y = -abs(ball2.velocity.y);
          ball2.refreshAngle();
          if (ball2.x + ball2.radius < this.x - this.width / 4) {
            ball2.angle += map(ball2.x + ball2.radius, this.x - this.width / 4, this.x - this.width / 2, 1, 20, true);
            console.log("left corner", ball2.angle);
            ball2.angle = constrain(ball2.angle, -179, -1);
            ball2.refreshVelocity();
          }
          if (ball2.x - ball2.radius > this.x + this.width / 4) {
            ball2.angle -= map(ball2.x - ball2.radius, this.x + this.width / 4, this.x + this.width / 2, 1, 20, true);
            console.log("right corner", ball2.angle);
            ball2.angle = constrain(ball2.angle, -179, -1);
            ball2.refreshVelocity();
          }
          if (ball2.x <= this.x - this.width / 2) {
            ball2.x = this.x - this.width / 2 - ball2.radius;
          } else if (ball2.x >= this.x + this.width / 2) {
            ball2.x = this.x + this.width / 2 + ball2.radius;
          } else {
            ball2.y = this.y - this.height / 2 - ball2.radius;
          }
        }
      });
    }
    move() {
      const x = mouseX;
      this.x = min(max(this.width / 2, x), width - this.width / 2);
    }
  };

  // src/ball.ts
  var Ball = class {
    constructor(game2) {
      this.game = game2;
      this.x = width / 2;
      this.y = height * 0.8;
      this.radius = width * 0.01;
      this.angle = 0;
      this.velocity = createVector();
      this.speed = BALL_BASE_SPEED;
      this.setRandomVelocity();
    }
    setRandomVelocity() {
      this.setAngle(random(-179, -1));
      if (this.velocity.y > 0) {
        this.velocity.y *= -1;
        this.refreshAngle();
      }
    }
    setAngle(angle) {
      this.angle = angle;
      this.refreshVelocity();
    }
    draw() {
      this.update();
      noStroke();
      fill(255);
      circle(this.x, this.y, this.radius * 2);
      if (DEBUG_MODE)
        text(`speed: ${this.speed}
angle: ${Math.round(this.angle)}
velocity:
   x=${this.velocity.x}
    y=${this.velocity.y}`, this.x + this.radius, this.y + this.radius);
    }
    refreshVelocity() {
      this.velocity.set(cos(this.angle), sin(this.angle)).mult(this.speed);
      this.refreshAngle();
    }
    refreshAngle() {
      const a = createVector();
      const b = this.velocity;
      this.angle = degrees(atan2(b.y - a.y, b.x - a.x));
    }
    update() {
      this.checkFail();
      this.bricks();
      this.move();
      this.bounds();
    }
    checkFail() {
      if (this.y + this.radius >= height)
        this.onFail();
    }
    bounds() {
      if (this.x + this.radius >= width || this.x - this.radius <= 0) {
        this.velocity.x *= -1;
        this.refreshAngle();
      }
      if (this.y - this.radius <= 0) {
        this.velocity.y *= -1;
        this.refreshAngle();
      }
    }
    bricks() {
      const brick2 = Array.from(this.game.bricks).sort((a, b) => {
        return dist(a.screenX + a.width / 2, a.screenY + a.height / 2, this.x, this.y) - dist(b.screenX + b.width / 2, b.screenY + b.height / 2, this.x, this.y);
      })[0];
      if (!brick2)
        return;
      const innerX = this.x > brick2.screenX && this.x < brick2.screenX + brick2.width;
      const innerY = this.y + this.radius > brick2.screenY && this.y - this.radius < brick2.screenY + brick2.height;
      let touch = false;
      if (this.y + this.radius > brick2.screenY && this.y < brick2.screenY + brick2.height / 2 && innerX) {
        this.velocity.y *= -1;
        this.y = brick2.screenY - this.radius;
        touch = true;
        this.refreshAngle();
      } else if (this.y - this.radius < brick2.screenY + brick2.height && this.y > brick2.screenY + brick2.height / 2 && innerX) {
        this.velocity.y *= -1;
        this.y = brick2.screenY + brick2.height + this.radius;
        touch = true;
        this.refreshAngle();
      } else if (this.x + this.radius > brick2.screenX && this.x < brick2.screenX + brick2.width / 2 && innerY) {
        this.velocity.x *= -1;
        this.x = brick2.screenX - this.radius;
        touch = true;
        this.refreshAngle();
      } else if (this.x - this.radius < brick2.screenX + brick2.width && this.x > brick2.screenX + brick2.width / 2 && innerY) {
        this.velocity.x *= -1;
        this.x = brick2.screenX + brick2.width + this.radius;
        touch = true;
        this.refreshAngle();
      }
      brick2.touchBall = touch;
      if (touch) {
        brick2.durability--;
        if (brick2.durability === 0)
          this.game.bricks.delete(brick2);
      }
    }
    move() {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
    onFail() {
      this.game.balls.delete(this);
      this.game.hp--;
      if (this.game.hp <= 0)
        this.game.onFail();
      if (this.game.balls.size === 0) {
        this.game.launchBall();
      }
    }
  };

  // src/brick.ts
  var Brick = class {
    constructor(game2, options) {
      this.game = game2;
      this.options = options;
      this.touchBall = false;
      this.durability = options.durability;
    }
    get width() {
      return Math.floor(width / GRID_WIDTH);
    }
    get height() {
      return this.width / ASPECT_RATIO;
    }
    get screenX() {
      return this.options.x * this.width;
    }
    get screenY() {
      return this.options.y * this.height;
    }
    draw() {
      this.update();
      stroke(BACKGROUND_COLOR);
      strokeWeight(this.touchBall ? 4 : 1);
      fill(255, 0, 0, Math.floor(map(this.durability, MAX_DURABILITY, 0, 255, 0)));
      rect(this.screenX, this.screenY, this.width, this.height);
    }
    update() {
      this.bounds();
    }
    bounds() {
    }
  };
  function createRandomBrick(game2, x, y) {
    return new Brick(game2, {
      x,
      y,
      durability: Math.floor(Math.random() * MAX_DURABILITY)
    });
  }

  // src/game.ts
  var Game = class {
    constructor(onFail) {
      this.onFail = onFail;
      this.hp = BASE_HP;
      this.balls = new Set();
      this.bricks = new Set();
      for (let x = 2; x < GRID_WIDTH - 2; x++) {
        for (let y = 2; y < GRID_HEIGHT; y++) {
          const b = createRandomBrick(this, x, y);
          if (b.durability > 0)
            this.bricks.add(b);
        }
      }
      this.launchBall();
      this.bar = new Bar(this);
    }
    draw() {
      background(...BACKGROUND_COLOR);
      this.bar.draw();
      this.bricks.forEach((b) => b.draw());
      this.balls.forEach((b) => b.draw());
    }
    launchBall() {
      this.balls.add(new Ball(this));
    }
  };

  // src/index.ts
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  var game;
  function setup() {
    const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const _width = Math.min(windowWidth, windowHeight * ASPECT_RATIO);
    const _height = _width / ASPECT_RATIO;
    createCanvas(_width, _height);
    frameRate(30);
    game = new Game(() => frameRate(0));
  }
  function draw() {
    game.draw();
  }
  function keyPressed() {
  }
  function keyReleased() {
  }
  return src_exports;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvYnJpY2sudHMiLCAic3JjL2dhbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyBAdHMtY2hlY2tcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9ub2RlX21vZHVsZXMvQHR5cGVzL3A1L2dsb2JhbC5kLnRzXCIgLz5cblxuaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgR2FtZSB9IGZyb20gXCIuL2dhbWVcIlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgKGV2ZW50KSA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKVxuXG5sZXQgZ2FtZTogR2FtZVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGNvbnN0IHdpbmRvd1dpZHRoID0gTWF0aC5tYXgoXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgIHdpbmRvdy5pbm5lcldpZHRoIHx8IDBcbiAgKVxuICBjb25zdCB3aW5kb3dIZWlnaHQgPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwXG4gIClcblxuICBjb25zdCBfd2lkdGggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCwgd2luZG93SGVpZ2h0ICogXy5BU1BFQ1RfUkFUSU8pXG4gIGNvbnN0IF9oZWlnaHQgPSBfd2lkdGggLyBfLkFTUEVDVF9SQVRJT1xuXG4gIGNyZWF0ZUNhbnZhcyhfd2lkdGgsIF9oZWlnaHQpXG5cbiAgZnJhbWVSYXRlKDMwKVxuXG4gIGdhbWUgPSBuZXcgR2FtZSgoKSA9PiBmcmFtZVJhdGUoMCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xuICBnYW1lLmRyYXcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9XG5leHBvcnQgZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fVxuIiwgImV4cG9ydCBjb25zdCBBU1BFQ1RfUkFUSU8gPSAxNiAvIDlcbmV4cG9ydCBjb25zdCBHUklEX1dJRFRIID0gMjBcbmV4cG9ydCBjb25zdCBHUklEX0hFSUdIVCA9IDhcbmV4cG9ydCBjb25zdCBNQVhfRFVSQUJJTElUWSA9IDVcbmV4cG9ydCBjb25zdCBCQUNLR1JPVU5EX0NPTE9SOiBSR0IgPSBbMCwgMCwgMF1cbmV4cG9ydCBjb25zdCBCQUxMX0JBU0VfU1BFRUQgPSA1XG5leHBvcnQgY29uc3QgQkFTRV9IUCA9IDNcbmV4cG9ydCBjb25zdCBERUJVR19NT0RFID0gZmFsc2VcbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgQmFyIHtcbiAgeCA9IDIwMFxuICB5ID0gaGVpZ2h0ICogMC45XG4gIHdpZHRoID0gd2lkdGggKiAwLjFcbiAgaGVpZ2h0ID0gdGhpcy53aWR0aCAvIDRcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoNjAsIDYwLCAyMDApXG4gICAgcmVjdChcbiAgICAgICh0aGlzLndpZHRoIC8gMikgKiAtMSxcbiAgICAgICh0aGlzLmhlaWdodCAvIDIpICogLTEsXG4gICAgICB0aGlzLndpZHRoLFxuICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICB0aGlzLmhlaWdodFxuICAgIClcbiAgICBmaWxsKDYwLCAyMDAsIDI1NSlcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyA0KSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGggLyAyLFxuICAgICAgdGhpcy5oZWlnaHQsXG4gICAgKVxuICAgIHRyYW5zbGF0ZSgtdGhpcy54LCAtdGhpcy55KVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGUoKSB7XG4gICAgdGhpcy5tb3ZlKClcbiAgICB0aGlzLmJvdW5kcygpXG4gIH1cblxuICBwcml2YXRlIGJvdW5kcygpIHtcbiAgICB0aGlzLmdhbWUuYmFsbHMuZm9yRWFjaCgoYmFsbCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBiYWxsLnkgKyBiYWxsLnJhZGl1cyA+IHRoaXMueSAtIHRoaXMuaGVpZ2h0IC8gMiAmJlxuICAgICAgICBiYWxsLnggKyBiYWxsLnJhZGl1cyA+IHRoaXMueCAtIHRoaXMud2lkdGggLyAyICYmXG4gICAgICAgIGJhbGwueCAtIGJhbGwucmFkaXVzIDwgdGhpcy54ICsgdGhpcy53aWR0aCAvIDJcbiAgICAgICkge1xuICAgICAgICBiYWxsLnZlbG9jaXR5LnkgPSAtYWJzKGJhbGwudmVsb2NpdHkueSlcblxuICAgICAgICBiYWxsLnJlZnJlc2hBbmdsZSgpXG5cbiAgICAgICAgaWYgKGJhbGwueCArIGJhbGwucmFkaXVzIDwgdGhpcy54IC0gdGhpcy53aWR0aCAvIDQpIHtcbiAgICAgICAgICBiYWxsLmFuZ2xlICs9IG1hcChcbiAgICAgICAgICAgIGJhbGwueCArIGJhbGwucmFkaXVzLFxuICAgICAgICAgICAgdGhpcy54IC0gdGhpcy53aWR0aCAvIDQsXG4gICAgICAgICAgICB0aGlzLnggLSB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyMCxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICApXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcImxlZnQgY29ybmVyXCIsIGJhbGwuYW5nbGUpXG5cbiAgICAgICAgICBiYWxsLmFuZ2xlID0gY29uc3RyYWluKGJhbGwuYW5nbGUsIC0xNzksIC0xKVxuXG4gICAgICAgICAgYmFsbC5yZWZyZXNoVmVsb2NpdHkoKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJhbGwueCAtIGJhbGwucmFkaXVzID4gdGhpcy54ICsgdGhpcy53aWR0aCAvIDQpIHtcbiAgICAgICAgICBiYWxsLmFuZ2xlIC09IG1hcChcbiAgICAgICAgICAgIGJhbGwueCAtIGJhbGwucmFkaXVzLFxuICAgICAgICAgICAgdGhpcy54ICsgdGhpcy53aWR0aCAvIDQsXG4gICAgICAgICAgICB0aGlzLnggKyB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyMCxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICApXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhcInJpZ2h0IGNvcm5lclwiLCBiYWxsLmFuZ2xlKVxuXG4gICAgICAgICAgYmFsbC5hbmdsZSA9IGNvbnN0cmFpbihiYWxsLmFuZ2xlLCAtMTc5LCAtMSlcblxuICAgICAgICAgIGJhbGwucmVmcmVzaFZlbG9jaXR5KClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRcdTAwRTljYWxlciBsYSBiYWxsZSBob3JzIGRlIGxhIGJhciBzaSBlbGxlIGVzdCB0cm9wIGEgZHJvaXRlIG91IGEgZ2F1Y2hlXG4gICAgICAgIGlmKGJhbGwueCA8PSB0aGlzLnggLSB0aGlzLndpZHRoIC8gMil7XG4gICAgICAgICAgYmFsbC54ID0gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgLSBiYWxsLnJhZGl1c1xuICAgICAgICB9ZWxzZSBpZihiYWxsLnggPj0gdGhpcy54ICsgdGhpcy53aWR0aCAvIDIpe1xuICAgICAgICAgIGJhbGwueCA9IHRoaXMueCArIHRoaXMud2lkdGggLyAyICsgYmFsbC5yYWRpdXNcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYmFsbC55ID0gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyIC0gYmFsbC5yYWRpdXNcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIG1vdmUoKSB7XG4gICAgY29uc3QgeCA9IC8qIEFycmF5LmZyb20odGhpcy5nYW1lLmJhbGxzKVswXT8ueCA/PyAqLyBtb3VzZVhcblxuICAgIHRoaXMueCA9IG1pbihtYXgodGhpcy53aWR0aCAvIDIsIHgpLCB3aWR0aCAtIHRoaXMud2lkdGggLyAyKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgQmFsbCB7XG4gIHggPSB3aWR0aCAvIDJcbiAgeSA9IGhlaWdodCAqIDAuOFxuICByYWRpdXMgPSB3aWR0aCAqIDAuMDFcbiAgYW5nbGUgPSAwXG4gIHZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKClcbiAgc3BlZWQgPSBfLkJBTExfQkFTRV9TUEVFRFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lKSB7XG4gICAgdGhpcy5zZXRSYW5kb21WZWxvY2l0eSgpXG4gIH1cblxuICBzZXRSYW5kb21WZWxvY2l0eSgpIHtcbiAgICB0aGlzLnNldEFuZ2xlKHJhbmRvbSgtMTc5LCAtMSkpXG5cbiAgICBpZiAodGhpcy52ZWxvY2l0eS55ID4gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG4gIH1cblxuICBzZXRBbmdsZShhbmdsZTogbnVtYmVyKSB7XG4gICAgdGhpcy5hbmdsZSA9IGFuZ2xlXG5cbiAgICB0aGlzLnJlZnJlc2hWZWxvY2l0eSgpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICBub1N0cm9rZSgpXG4gICAgZmlsbCgyNTUpXG4gICAgY2lyY2xlKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cyAqIDIpXG4gICAgaWYoXy5ERUJVR19NT0RFKSB0ZXh0KFxuICAgICAgYHNwZWVkOiAke3RoaXMuc3BlZWR9XFxuYW5nbGU6ICR7TWF0aC5yb3VuZChcbiAgICAgICAgdGhpcy5hbmdsZVxuICAgICAgKX1cXG52ZWxvY2l0eTpcXG4gICB4PSR7dGhpcy52ZWxvY2l0eS54fVxcbiAgICB5PSR7dGhpcy52ZWxvY2l0eS55fWAsXG4gICAgICB0aGlzLnggKyB0aGlzLnJhZGl1cyxcbiAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzXG4gICAgKVxuICB9XG5cbiAgcmVmcmVzaFZlbG9jaXR5KCkge1xuICAgIHRoaXMudmVsb2NpdHkuc2V0KGNvcyh0aGlzLmFuZ2xlKSwgc2luKHRoaXMuYW5nbGUpKS5tdWx0KHRoaXMuc3BlZWQpXG5cbiAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gIH1cblxuICByZWZyZXNoQW5nbGUoKSB7XG4gICAgY29uc3QgYSA9IGNyZWF0ZVZlY3RvcigpXG4gICAgY29uc3QgYiA9IHRoaXMudmVsb2NpdHlcblxuICAgIHRoaXMuYW5nbGUgPSBkZWdyZWVzKGF0YW4yKGIueSAtIGEueSwgYi54IC0gYS54KSlcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCkge1xuICAgIHRoaXMuY2hlY2tGYWlsKClcbiAgICB0aGlzLmJyaWNrcygpXG4gICAgdGhpcy5tb3ZlKClcbiAgICB0aGlzLmJvdW5kcygpXG4gIH1cblxuICBwcml2YXRlIGNoZWNrRmFpbCgpIHtcbiAgICBpZiAodGhpcy55ICsgdGhpcy5yYWRpdXMgPj0gaGVpZ2h0KSB0aGlzLm9uRmFpbCgpXG4gIH1cblxuICBwcml2YXRlIGJvdW5kcygpIHtcbiAgICBpZiAodGhpcy54ICsgdGhpcy5yYWRpdXMgPj0gd2lkdGggfHwgdGhpcy54IC0gdGhpcy5yYWRpdXMgPD0gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy55IC0gdGhpcy5yYWRpdXMgPD0gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGJyaWNrcygpIHtcbiAgICBjb25zdCBicmljayA9IEFycmF5LmZyb20odGhpcy5nYW1lLmJyaWNrcykuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGlzdChcbiAgICAgICAgICBhLnNjcmVlblggKyBhLndpZHRoIC8gMixcbiAgICAgICAgICBhLnNjcmVlblkgKyBhLmhlaWdodCAvIDIsXG4gICAgICAgICAgdGhpcy54LFxuICAgICAgICAgIHRoaXMueVxuICAgICAgICApIC1cbiAgICAgICAgZGlzdChiLnNjcmVlblggKyBiLndpZHRoIC8gMiwgYi5zY3JlZW5ZICsgYi5oZWlnaHQgLyAyLCB0aGlzLngsIHRoaXMueSlcbiAgICAgIClcbiAgICB9KVswXVxuXG4gICAgaWYgKCFicmljaykgcmV0dXJuXG5cbiAgICBjb25zdCBpbm5lclggPVxuICAgICAgdGhpcy54ID4gYnJpY2suc2NyZWVuWCAmJiB0aGlzLnggPCBicmljay5zY3JlZW5YICsgYnJpY2sud2lkdGhcbiAgICBjb25zdCBpbm5lclkgPVxuICAgICAgdGhpcy55ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5ZICYmXG4gICAgICB0aGlzLnkgLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblkgKyBicmljay5oZWlnaHRcblxuICAgIGxldCB0b3VjaCA9IGZhbHNlXG5cbiAgICAvLyB0b3BcbiAgICBpZiAoXG4gICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblkgJiZcbiAgICAgIHRoaXMueSA8IGJyaWNrLnNjcmVlblkgKyBicmljay5oZWlnaHQgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSAtIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gYm90dG9tXG4gICAgZWxzZSBpZiAoXG4gICAgICB0aGlzLnkgLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblkgKyBicmljay5oZWlnaHQgJiZcbiAgICAgIHRoaXMueSA+IGJyaWNrLnNjcmVlblkgKyBicmljay5oZWlnaHQgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSArIGJyaWNrLmhlaWdodCArIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gbGVmdFxuICAgIGVsc2UgaWYgKFxuICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5YICYmXG4gICAgICB0aGlzLnggPCBicmljay5zY3JlZW5YICsgYnJpY2sud2lkdGggLyAyICYmXG4gICAgICBpbm5lcllcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuICAgICAgdGhpcy54ID0gYnJpY2suc2NyZWVuWCAtIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gcmlnaHRcbiAgICBlbHNlIGlmIChcbiAgICAgIHRoaXMueCAtIHRoaXMucmFkaXVzIDwgYnJpY2suc2NyZWVuWCArIGJyaWNrLndpZHRoICYmXG4gICAgICB0aGlzLnggPiBicmljay5zY3JlZW5YICsgYnJpY2sud2lkdGggLyAyICYmXG4gICAgICBpbm5lcllcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuICAgICAgdGhpcy54ID0gYnJpY2suc2NyZWVuWCArIGJyaWNrLndpZHRoICsgdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICBicmljay50b3VjaEJhbGwgPSB0b3VjaFxuXG4gICAgaWYgKHRvdWNoKSB7XG4gICAgICBicmljay5kdXJhYmlsaXR5LS1cblxuICAgICAgaWYgKGJyaWNrLmR1cmFiaWxpdHkgPT09IDApIHRoaXMuZ2FtZS5icmlja3MuZGVsZXRlKGJyaWNrKVxuICAgIH1cbiAgfVxuXG4gIG1vdmUoKSB7XG4gICAgdGhpcy54ICs9IHRoaXMudmVsb2NpdHkueFxuICAgIHRoaXMueSArPSB0aGlzLnZlbG9jaXR5LnlcbiAgfVxuXG4gIHByaXZhdGUgb25GYWlsKCkge1xuICAgIHRoaXMuZ2FtZS5iYWxscy5kZWxldGUodGhpcylcblxuICAgIHRoaXMuZ2FtZS5ocC0tXG5cbiAgICBpZiAodGhpcy5nYW1lLmhwIDw9IDApIHRoaXMuZ2FtZS5vbkZhaWwoKVxuXG4gICAgaWYgKHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmdhbWUubGF1bmNoQmFsbCgpXG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWNrT3B0aW9ucyB7XG4gIHg6IG51bWJlclxuICB5OiBudW1iZXJcbiAgZHVyYWJpbGl0eTogbnVtYmVyXG59XG5cbmV4cG9ydCBjbGFzcyBCcmljayB7XG4gIGR1cmFiaWxpdHk6IG51bWJlclxuICB0b3VjaEJhbGwgPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lLCBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogQnJpY2tPcHRpb25zKSB7XG4gICAgdGhpcy5kdXJhYmlsaXR5ID0gb3B0aW9ucy5kdXJhYmlsaXR5XG4gIH1cblxuICBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcih3aWR0aCAvIF8uR1JJRF9XSURUSClcbiAgfVxuXG4gIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy53aWR0aCAvIF8uQVNQRUNUX1JBVElPXG4gIH1cblxuICBnZXQgc2NyZWVuWCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueCAqIHRoaXMud2lkdGhcbiAgfVxuXG4gIGdldCBzY3JlZW5ZKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy55ICogdGhpcy5oZWlnaHRcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHN0cm9rZShfLkJBQ0tHUk9VTkRfQ09MT1IpXG4gICAgc3Ryb2tlV2VpZ2h0KHRoaXMudG91Y2hCYWxsID8gNCA6IDEpXG4gICAgZmlsbChcbiAgICAgIDI1NSxcbiAgICAgIDAsXG4gICAgICAwLFxuICAgICAgTWF0aC5mbG9vcihtYXAodGhpcy5kdXJhYmlsaXR5LCBfLk1BWF9EVVJBQklMSVRZLCAwLCAyNTUsIDApKVxuICAgIClcbiAgICByZWN0KHRoaXMuc2NyZWVuWCwgdGhpcy5zY3JlZW5ZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCkge1xuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJhbmRvbUJyaWNrKFxuICBnYW1lOiBnYW1lLkdhbWUsXG4gIHg6IG51bWJlcixcbiAgeTogbnVtYmVyXG4pOiBCcmljayB7XG4gIHJldHVybiBuZXcgQnJpY2soZ2FtZSwge1xuICAgIHgsXG4gICAgeSxcbiAgICBkdXJhYmlsaXR5OiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBfLk1BWF9EVVJBQklMSVRZKSxcbiAgfSlcbn1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGJhciBmcm9tIFwiLi9iYXJcIlxuaW1wb3J0ICogYXMgYmFsbCBmcm9tIFwiLi9iYWxsXCJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICBocCA9IF8uQkFTRV9IUFxuICBiYWxscyA9IG5ldyBTZXQ8YmFsbC5CYWxsPigpXG4gIGJyaWNrcyA9IG5ldyBTZXQ8YnJpY2suQnJpY2s+KClcbiAgYmFyOiBiYXIuQmFyXG5cbiAgY29uc3RydWN0b3IocHVibGljIG9uRmFpbDogKCkgPT4gdW5rbm93bikge1xuICAgIGZvciAobGV0IHggPSAyOyB4IDwgXy5HUklEX1dJRFRIIC0gMjsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMjsgeSA8IF8uR1JJRF9IRUlHSFQ7IHkrKykge1xuICAgICAgICBjb25zdCBiID0gYnJpY2suY3JlYXRlUmFuZG9tQnJpY2sodGhpcywgeCwgeSlcbiAgICAgICAgaWYgKGIuZHVyYWJpbGl0eSA+IDApIHRoaXMuYnJpY2tzLmFkZChiKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGF1bmNoQmFsbCgpXG5cbiAgICB0aGlzLmJhciA9IG5ldyBiYXIuQmFyKHRoaXMpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoLi4uXy5CQUNLR1JPVU5EX0NPTE9SKVxuXG4gICAgdGhpcy5iYXIuZHJhdygpXG5cbiAgICB0aGlzLmJyaWNrcy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcbiAgICB0aGlzLmJhbGxzLmZvckVhY2goKGIpID0+IGIuZHJhdygpKVxuICB9XG5cbiAgbGF1bmNoQmFsbCgpIHtcbiAgICB0aGlzLmJhbGxzLmFkZChuZXcgYmFsbC5CYWxsKHRoaXMpKVxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FPLE1BQU0sZUFBZSxLQUFLO0FBQzFCLE1BQU0sYUFBYTtBQUNuQixNQUFNLGNBQWM7QUFDcEIsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSxtQkFBd0IsQ0FBQyxHQUFHLEdBQUc7QUFDckMsTUFBTSxrQkFBa0I7QUFDeEIsTUFBTSxV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
