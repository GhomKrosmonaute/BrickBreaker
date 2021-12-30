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
  var BALL_BASE_SPEED = () => width / 150;
  var BASE_HP = 3;
  var DEBUG_MODE = false;
  var TAIL_LENGTH = 10;
  var FRAMERATE = 25;
  var NO_SMOOTH = true;

  // src/bar.ts
  var Bar = class {
    constructor(game2) {
      this.game = game2;
      this.x = width / 2;
      this.y = height * 1.1;
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
        if (ball2.y + ball2.radius > this.y - this.height / 2 && ball2.y + ball2.radius < this.y + this.height / 2 && ball2.x + ball2.radius > this.x - this.width / 2 && ball2.x - ball2.radius < this.x + this.width / 2) {
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
      const x = this.x + (mouseX - this.x) / 4;
      const y = this.y + (mouseY - this.y) / 4;
      this.x = min(max(x, this.width / 2), width - this.width / 2);
      this.y = min(max(y, height * 0.9), height - this.height / 2);
    }
  };

  // src/ball.ts
  var Ball = class {
    constructor(game2) {
      this.game = game2;
      this.x = width / 2;
      this.y = height * 0.8;
      this.radius = width * 7e-3;
      this.angle = 0;
      this.velocity = createVector();
      this.speed = BALL_BASE_SPEED();
      this.tail = [];
      this.setRandomVelocity();
    }
    draw() {
      this.update();
      noStroke();
      fill(255);
      for (const part of this.tail) {
        circle(part.x, part.y, map(this.tail.indexOf(part), 0, this.tail.length - 1, this.radius / 2, this.radius * 2));
      }
      circle(this.x, this.y, this.radius * 2);
      if (DEBUG_MODE)
        text(`speed: ${this.speed}
angle: ${Math.round(this.angle)}
velocity:
   x=${this.velocity.x}
    y=${this.velocity.y}`, this.x + this.radius, this.y + this.radius);
    }
    update() {
      this.save();
      this.checkFail();
      this.bricks();
      this.accelerate();
      this.move();
      this.bounds();
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
    refreshVelocity() {
      this.velocity.set(cos(this.angle), sin(this.angle)).mult(this.speed);
      this.refreshAngle();
    }
    refreshAngle() {
      const a = createVector();
      const b = this.velocity;
      this.angle = degrees(atan2(b.y - a.y, b.x - a.x));
    }
    save() {
      this.tail.push({
        x: this.x,
        y: this.y
      });
      if (this.tail.length > TAIL_LENGTH)
        this.tail.shift();
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
        return dist(a.screenX + this.game.BRICK_WIDTH / 2, a.screenY + this.game.BRICK_HEIGHT / 2, this.x, this.y) - dist(b.screenX + this.game.BRICK_WIDTH / 2, b.screenY + this.game.BRICK_HEIGHT / 2, this.x, this.y);
      })[0];
      if (!brick2)
        return;
      const innerX = this.x > brick2.screenX && this.x < brick2.screenX + this.game.BRICK_WIDTH;
      const innerY = this.y + this.radius > brick2.screenY && this.y - this.radius < brick2.screenY + this.game.BRICK_HEIGHT;
      let touch = false;
      if (this.y + this.radius > brick2.screenY && this.y < brick2.screenY + this.game.BRICK_HEIGHT / 2 && innerX) {
        this.velocity.y *= -1;
        this.y = brick2.screenY - this.radius;
        touch = true;
        this.refreshAngle();
      } else if (this.y - this.radius < brick2.screenY + this.game.BRICK_HEIGHT && this.y > brick2.screenY + this.game.BRICK_HEIGHT / 2 && innerX) {
        this.velocity.y *= -1;
        this.y = brick2.screenY + this.game.BRICK_HEIGHT + this.radius;
        touch = true;
        this.refreshAngle();
      } else if (this.x + this.radius > brick2.screenX && this.x < brick2.screenX + this.game.BRICK_WIDTH / 2 && innerY) {
        this.velocity.x *= -1;
        this.x = brick2.screenX - this.radius;
        touch = true;
        this.refreshAngle();
      } else if (this.x - this.radius < brick2.screenX + this.game.BRICK_WIDTH && this.x > brick2.screenX + this.game.BRICK_WIDTH / 2 && innerY) {
        this.velocity.x *= -1;
        this.x = brick2.screenX + this.game.BRICK_WIDTH + this.radius;
        touch = true;
        this.refreshAngle();
      }
      brick2.touchBall = touch;
      if (touch)
        brick2.hit();
    }
    accelerate() {
      this.speed = map(this.game.score, 0, 500, BALL_BASE_SPEED(), Math.min(BALL_BASE_SPEED() * 10, Math.min(this.game.BRICK_HEIGHT, this.game.BRICK_WIDTH)));
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

  // src/info.ts
  var Info = class {
    constructor(game2) {
      this.game = game2;
    }
    draw() {
      this.score();
      this.highScore();
      this.hp();
      this.speed();
    }
    score() {
      fill(50);
      noStroke();
      textStyle("bold");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 20));
      text(`Score: ${this.game.score}`, width / 2, height * 0.5);
    }
    highScore() {
      fill(45);
      noStroke();
      textStyle("bold");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 35));
      text(`High Score: ${this.game.highScore}`, width / 2, height * 0.58);
    }
    hp() {
      fill(30);
      noStroke();
      textStyle("bold");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 15));
      text(`\u2665 = ${this.game.hp}`, width / 2, height * 0.68);
    }
    speed() {
      var _a2, _b;
      fill(25);
      noStroke();
      textStyle("normal");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 25));
      text(`Speed x${(_b = (_a2 = Array.from(this.game.balls)[0]) == null ? void 0 : _a2.speed.toFixed(1)) != null ? _b : 0}`, width / 2, height * 0.79);
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
    get screenX() {
      return this.options.x * this.game.BRICK_WIDTH;
    }
    get screenY() {
      return this.options.y * this.game.BRICK_HEIGHT;
    }
    draw() {
      stroke(BACKGROUND_COLOR);
      strokeWeight(this.touchBall ? 4 : 1);
      fill(255, 0, 0, Math.floor(map(this.durability, MAX_DURABILITY, 0, 255, 0)));
      rect(this.screenX, this.screenY, this.game.BRICK_WIDTH, this.game.BRICK_HEIGHT);
    }
    hit() {
      this.game.score++;
      this.durability--;
      if (this.durability === 0) {
        this.game.bricks.delete(this);
      }
    }
  };
  function createRandomBrick(game2, x, y) {
    return new Brick(game2, {
      x,
      y,
      durability: 1 + Math.floor(Math.random() * (MAX_DURABILITY - 1))
    });
  }

  // src/game.ts
  var _a;
  var Game = class {
    constructor(onFail) {
      this.onFail = onFail;
      this.hp = BASE_HP;
      this.balls = new Set();
      this.bricks = new Set();
      this.framerate = FRAMERATE;
      this._score = 0;
      this._highScore = Number((_a = localStorage.getItem("highScore")) != null ? _a : 0);
      this.BRICK_WIDTH = width / GRID_WIDTH;
      this.BRICK_HEIGHT = this.BRICK_WIDTH / ASPECT_RATIO;
      for (let x = 2; x < GRID_WIDTH - 2; x++) {
        for (let y = 2; y < GRID_HEIGHT; y++) {
          const b = createRandomBrick(this, x, y);
          if (b.durability > 0)
            this.bricks.add(b);
        }
      }
      this.launchBall();
      this.bar = new Bar(this);
      this.info = new Info(this);
    }
    set score(score) {
      this._score = score;
      if (this._score > this.highScore) {
        this.highScore = this._score;
      }
    }
    get score() {
      return this._score;
    }
    set highScore(score) {
      this._highScore = score;
      localStorage.setItem("highScore", String(this._highScore));
    }
    get highScore() {
      return this._highScore;
    }
    draw() {
      background(...BACKGROUND_COLOR);
      if (mouseIsPressed || keyIsPressed)
        frameRate(Math.round(this.framerate * 5));
      else
        frameRate(this.framerate);
      this.info.draw();
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
    if (NO_SMOOTH)
      noSmooth();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvaW5mby50cyIsICJzcmMvYnJpY2sudHMiLCAic3JjL2dhbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyBAdHMtY2hlY2tcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9ub2RlX21vZHVsZXMvQHR5cGVzL3A1L2dsb2JhbC5kLnRzXCIgLz5cblxuaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgR2FtZSB9IGZyb20gXCIuL2dhbWVcIlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgKGV2ZW50KSA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKVxuXG5sZXQgZ2FtZTogR2FtZVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGNvbnN0IHdpbmRvd1dpZHRoID0gTWF0aC5tYXgoXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgIHdpbmRvdy5pbm5lcldpZHRoIHx8IDBcbiAgKVxuICBjb25zdCB3aW5kb3dIZWlnaHQgPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwXG4gIClcblxuICBjb25zdCBfd2lkdGggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCwgd2luZG93SGVpZ2h0ICogXy5BU1BFQ1RfUkFUSU8pXG4gIGNvbnN0IF9oZWlnaHQgPSBfd2lkdGggLyBfLkFTUEVDVF9SQVRJT1xuXG4gIGNyZWF0ZUNhbnZhcyhfd2lkdGgsIF9oZWlnaHQpXG5cbiAgaWYgKF8uTk9fU01PT1RIKSBub1Ntb290aCgpXG4gIGZyYW1lUmF0ZSgzMClcblxuICBnYW1lID0gbmV3IEdhbWUoKCkgPT4gZnJhbWVSYXRlKDApKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhdygpIHtcbiAgZ2FtZS5kcmF3KClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleVByZXNzZWQoKSB7fVxuZXhwb3J0IGZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge31cbiIsICJleHBvcnQgY29uc3QgQVNQRUNUX1JBVElPID0gMTYgLyA5XG5leHBvcnQgY29uc3QgR1JJRF9XSURUSCA9IDIwXG5leHBvcnQgY29uc3QgR1JJRF9IRUlHSFQgPSA4XG5leHBvcnQgY29uc3QgTUFYX0RVUkFCSUxJVFkgPSA1XG5leHBvcnQgY29uc3QgQkFDS0dST1VORF9DT0xPUjogUkdCID0gWzAsIDAsIDBdXG5leHBvcnQgY29uc3QgQkFMTF9CQVNFX1NQRUVEID0gKCkgPT4gd2lkdGggLyAxNTBcbmV4cG9ydCBjb25zdCBCQVNFX0hQID0gM1xuZXhwb3J0IGNvbnN0IERFQlVHX01PREUgPSBmYWxzZVxuZXhwb3J0IGNvbnN0IFRBSUxfTEVOR1RIID0gMTBcbmV4cG9ydCBjb25zdCBGUkFNRVJBVEUgPSAyNVxuZXhwb3J0IGNvbnN0IE5PX1NNT09USCA9IHRydWVcbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgQmFyIHtcbiAgeCA9IHdpZHRoIC8gMlxuICB5ID0gaGVpZ2h0ICogMS4xXG4gIHdpZHRoID0gd2lkdGggKiAwLjFcbiAgaGVpZ2h0ID0gdGhpcy53aWR0aCAvIDRcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoNjAsIDYwLCAyMDApXG4gICAgcmVjdChcbiAgICAgICh0aGlzLndpZHRoIC8gMikgKiAtMSxcbiAgICAgICh0aGlzLmhlaWdodCAvIDIpICogLTEsXG4gICAgICB0aGlzLndpZHRoLFxuICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICB0aGlzLmhlaWdodFxuICAgIClcbiAgICBmaWxsKDYwLCAyMDAsIDI1NSlcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyA0KSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGggLyAyLFxuICAgICAgdGhpcy5oZWlnaHRcbiAgICApXG4gICAgdHJhbnNsYXRlKC10aGlzLngsIC10aGlzLnkpXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLm1vdmUoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge1xuICAgIHRoaXMuZ2FtZS5iYWxscy5mb3JFYWNoKChiYWxsKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzID4gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzIDwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueCArIGJhbGwucmFkaXVzID4gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgJiZcbiAgICAgICAgYmFsbC54IC0gYmFsbC5yYWRpdXMgPCB0aGlzLnggKyB0aGlzLndpZHRoIC8gMlxuICAgICAgKSB7XG4gICAgICAgIGJhbGwudmVsb2NpdHkueSA9IC1hYnMoYmFsbC52ZWxvY2l0eS55KVxuXG4gICAgICAgIGJhbGwucmVmcmVzaEFuZ2xlKClcblxuICAgICAgICBpZiAoYmFsbC54ICsgYmFsbC5yYWRpdXMgPCB0aGlzLnggLSB0aGlzLndpZHRoIC8gNCkge1xuICAgICAgICAgIGJhbGwuYW5nbGUgKz0gbWFwKFxuICAgICAgICAgICAgYmFsbC54ICsgYmFsbC5yYWRpdXMsXG4gICAgICAgICAgICB0aGlzLnggLSB0aGlzLndpZHRoIC8gNCxcbiAgICAgICAgICAgIHRoaXMueCAtIHRoaXMud2lkdGggLyAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIwLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgIClcblxuICAgICAgICAgIGNvbnNvbGUubG9nKFwibGVmdCBjb3JuZXJcIiwgYmFsbC5hbmdsZSlcblxuICAgICAgICAgIGJhbGwuYW5nbGUgPSBjb25zdHJhaW4oYmFsbC5hbmdsZSwgLTE3OSwgLTEpXG5cbiAgICAgICAgICBiYWxsLnJlZnJlc2hWZWxvY2l0eSgpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmFsbC54IC0gYmFsbC5yYWRpdXMgPiB0aGlzLnggKyB0aGlzLndpZHRoIC8gNCkge1xuICAgICAgICAgIGJhbGwuYW5nbGUgLT0gbWFwKFxuICAgICAgICAgICAgYmFsbC54IC0gYmFsbC5yYWRpdXMsXG4gICAgICAgICAgICB0aGlzLnggKyB0aGlzLndpZHRoIC8gNCxcbiAgICAgICAgICAgIHRoaXMueCArIHRoaXMud2lkdGggLyAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIwLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgIClcblxuICAgICAgICAgIGNvbnNvbGUubG9nKFwicmlnaHQgY29ybmVyXCIsIGJhbGwuYW5nbGUpXG5cbiAgICAgICAgICBiYWxsLmFuZ2xlID0gY29uc3RyYWluKGJhbGwuYW5nbGUsIC0xNzksIC0xKVxuXG4gICAgICAgICAgYmFsbC5yZWZyZXNoVmVsb2NpdHkoKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZFx1MDBFOWNhbGVyIGxhIGJhbGxlIGhvcnMgZGUgbGEgYmFyIHNpIGVsbGUgZXN0IHRyb3AgYSBkcm9pdGUgb3UgYSBnYXVjaGVcbiAgICAgICAgaWYgKGJhbGwueCA8PSB0aGlzLnggLSB0aGlzLndpZHRoIC8gMikge1xuICAgICAgICAgIGJhbGwueCA9IHRoaXMueCAtIHRoaXMud2lkdGggLyAyIC0gYmFsbC5yYWRpdXNcbiAgICAgICAgfSBlbHNlIGlmIChiYWxsLnggPj0gdGhpcy54ICsgdGhpcy53aWR0aCAvIDIpIHtcbiAgICAgICAgICBiYWxsLnggPSB0aGlzLnggKyB0aGlzLndpZHRoIC8gMiArIGJhbGwucmFkaXVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmFsbC55ID0gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyIC0gYmFsbC5yYWRpdXNcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIG1vdmUoKSB7XG4gICAgY29uc3QgeCA9XG4gICAgICB0aGlzLnggKyAobW91c2VYIC0gdGhpcy54KSAvIDQgLyogQXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpWzBdPy54ID8/ICovXG4gICAgY29uc3QgeSA9IHRoaXMueSArIChtb3VzZVkgLSB0aGlzLnkpIC8gNFxuXG4gICAgdGhpcy54ID0gbWluKG1heCh4LCB0aGlzLndpZHRoIC8gMiksIHdpZHRoIC0gdGhpcy53aWR0aCAvIDIpXG4gICAgdGhpcy55ID0gbWluKG1heCh5LCBoZWlnaHQgKiAwLjkpLCBoZWlnaHQgLSB0aGlzLmhlaWdodCAvIDIpXG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBCYWxsIHtcbiAgeCA9IHdpZHRoIC8gMlxuICB5ID0gaGVpZ2h0ICogMC44XG4gIHJhZGl1cyA9IHdpZHRoICogMC4wMDdcbiAgYW5nbGUgPSAwXG4gIHZlbG9jaXR5ID0gY3JlYXRlVmVjdG9yKClcbiAgc3BlZWQgPSBfLkJBTExfQkFTRV9TUEVFRCgpXG4gIHRhaWw6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfVtdID0gW11cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge1xuICAgIHRoaXMuc2V0UmFuZG9tVmVsb2NpdHkoKVxuICB9XG5cbiAgZHJhdygpIHtcbiAgICB0aGlzLnVwZGF0ZSgpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoMjU1KVxuICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLnRhaWwpIHtcbiAgICAgIGNpcmNsZShcbiAgICAgICAgcGFydC54LFxuICAgICAgICBwYXJ0LnksXG4gICAgICAgIG1hcChcbiAgICAgICAgICB0aGlzLnRhaWwuaW5kZXhPZihwYXJ0KSxcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMudGFpbC5sZW5ndGggLSAxLFxuICAgICAgICAgIHRoaXMucmFkaXVzIC8gMixcbiAgICAgICAgICB0aGlzLnJhZGl1cyAqIDJcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBjaXJjbGUodGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzICogMilcbiAgICBpZiAoXy5ERUJVR19NT0RFKVxuICAgICAgdGV4dChcbiAgICAgICAgYHNwZWVkOiAke3RoaXMuc3BlZWR9XFxuYW5nbGU6ICR7TWF0aC5yb3VuZChcbiAgICAgICAgICB0aGlzLmFuZ2xlXG4gICAgICAgICl9XFxudmVsb2NpdHk6XFxuICAgeD0ke3RoaXMudmVsb2NpdHkueH1cXG4gICAgeT0ke3RoaXMudmVsb2NpdHkueX1gLFxuICAgICAgICB0aGlzLnggKyB0aGlzLnJhZGl1cyxcbiAgICAgICAgdGhpcy55ICsgdGhpcy5yYWRpdXNcbiAgICAgIClcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCkge1xuICAgIHRoaXMuc2F2ZSgpXG4gICAgdGhpcy5jaGVja0ZhaWwoKVxuICAgIHRoaXMuYnJpY2tzKClcbiAgICB0aGlzLmFjY2VsZXJhdGUoKVxuICAgIHRoaXMubW92ZSgpXG4gICAgdGhpcy5ib3VuZHMoKVxuICB9XG5cbiAgc2V0UmFuZG9tVmVsb2NpdHkoKSB7XG4gICAgdGhpcy5zZXRBbmdsZShyYW5kb20oLTE3OSwgLTEpKVxuXG4gICAgaWYgKHRoaXMudmVsb2NpdHkueSA+IDApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuICB9XG5cbiAgc2V0QW5nbGUoYW5nbGU6IG51bWJlcikge1xuICAgIHRoaXMuYW5nbGUgPSBhbmdsZVxuXG4gICAgdGhpcy5yZWZyZXNoVmVsb2NpdHkoKVxuICB9XG5cbiAgcmVmcmVzaFZlbG9jaXR5KCkge1xuICAgIHRoaXMudmVsb2NpdHkuc2V0KGNvcyh0aGlzLmFuZ2xlKSwgc2luKHRoaXMuYW5nbGUpKS5tdWx0KHRoaXMuc3BlZWQpXG5cbiAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gIH1cblxuICByZWZyZXNoQW5nbGUoKSB7XG4gICAgY29uc3QgYSA9IGNyZWF0ZVZlY3RvcigpXG4gICAgY29uc3QgYiA9IHRoaXMudmVsb2NpdHlcblxuICAgIHRoaXMuYW5nbGUgPSBkZWdyZWVzKGF0YW4yKGIueSAtIGEueSwgYi54IC0gYS54KSlcbiAgfVxuXG4gIHNhdmUoKSB7XG4gICAgdGhpcy50YWlsLnB1c2goe1xuICAgICAgeDogdGhpcy54LFxuICAgICAgeTogdGhpcy55LFxuICAgIH0pXG5cbiAgICBpZiAodGhpcy50YWlsLmxlbmd0aCA+IF8uVEFJTF9MRU5HVEgpIHRoaXMudGFpbC5zaGlmdCgpXG4gIH1cblxuICBwcml2YXRlIGNoZWNrRmFpbCgpIHtcbiAgICBpZiAodGhpcy55ICsgdGhpcy5yYWRpdXMgPj0gaGVpZ2h0KSB0aGlzLm9uRmFpbCgpXG4gIH1cblxuICBwcml2YXRlIGJvdW5kcygpIHtcbiAgICBpZiAodGhpcy54ICsgdGhpcy5yYWRpdXMgPj0gd2lkdGggfHwgdGhpcy54IC0gdGhpcy5yYWRpdXMgPD0gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy55IC0gdGhpcy5yYWRpdXMgPD0gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGJyaWNrcygpIHtcbiAgICBjb25zdCBicmljayA9IEFycmF5LmZyb20odGhpcy5nYW1lLmJyaWNrcykuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGlzdChcbiAgICAgICAgICBhLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggLyAyLFxuICAgICAgICAgIGEuc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyLFxuICAgICAgICAgIHRoaXMueCxcbiAgICAgICAgICB0aGlzLnlcbiAgICAgICAgKSAtXG4gICAgICAgIGRpc3QoXG4gICAgICAgICAgYi5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMixcbiAgICAgICAgICBiLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUIC8gMixcbiAgICAgICAgICB0aGlzLngsXG4gICAgICAgICAgdGhpcy55XG4gICAgICAgIClcbiAgICAgIClcbiAgICB9KVswXVxuXG4gICAgaWYgKCFicmljaykgcmV0dXJuXG5cbiAgICBjb25zdCBpbm5lclggPVxuICAgICAgdGhpcy54ID4gYnJpY2suc2NyZWVuWCAmJiB0aGlzLnggPCBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIXG4gICAgY29uc3QgaW5uZXJZID1cbiAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzID4gYnJpY2suc2NyZWVuWSAmJlxuICAgICAgdGhpcy55IC0gdGhpcy5yYWRpdXMgPCBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVFxuXG4gICAgbGV0IHRvdWNoID0gZmFsc2VcblxuICAgIC8vIHRvcFxuICAgIGlmIChcbiAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzID4gYnJpY2suc2NyZWVuWSAmJlxuICAgICAgdGhpcy55IDwgYnJpY2suc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSAtIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gYm90dG9tXG4gICAgZWxzZSBpZiAoXG4gICAgICB0aGlzLnkgLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUICYmXG4gICAgICB0aGlzLnkgPiBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDIgJiZcbiAgICAgIGlubmVyWFxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG4gICAgICB0aGlzLnkgPSBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCArIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gbGVmdFxuICAgIGVsc2UgaWYgKFxuICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5YICYmXG4gICAgICB0aGlzLnggPCBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMiAmJlxuICAgICAgaW5uZXJZXG4gICAgKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnggKj0gLTFcbiAgICAgIHRoaXMueCA9IGJyaWNrLnNjcmVlblggLSB0aGlzLnJhZGl1c1xuXG4gICAgICB0b3VjaCA9IHRydWVcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cblxuICAgIC8vIHJpZ2h0XG4gICAgZWxzZSBpZiAoXG4gICAgICB0aGlzLnggLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggJiZcbiAgICAgIHRoaXMueCA+IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggLyAyICYmXG4gICAgICBpbm5lcllcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuICAgICAgdGhpcy54ID0gYnJpY2suc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCArIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgYnJpY2sudG91Y2hCYWxsID0gdG91Y2hcblxuICAgIGlmICh0b3VjaCkgYnJpY2suaGl0KClcbiAgfVxuXG4gIHByaXZhdGUgYWNjZWxlcmF0ZSgpIHtcbiAgICB0aGlzLnNwZWVkID0gbWFwKFxuICAgICAgdGhpcy5nYW1lLnNjb3JlLFxuICAgICAgMCxcbiAgICAgIDUwMCxcbiAgICAgIF8uQkFMTF9CQVNFX1NQRUVEKCksXG4gICAgICBNYXRoLm1pbihcbiAgICAgICAgXy5CQUxMX0JBU0VfU1BFRUQoKSAqIDEwLFxuICAgICAgICBNYXRoLm1pbih0aGlzLmdhbWUuQlJJQ0tfSEVJR0hULCB0aGlzLmdhbWUuQlJJQ0tfV0lEVEgpXG4gICAgICApXG4gICAgKVxuICB9XG5cbiAgbW92ZSgpIHtcbiAgICB0aGlzLnggKz0gdGhpcy52ZWxvY2l0eS54XG4gICAgdGhpcy55ICs9IHRoaXMudmVsb2NpdHkueVxuICB9XG5cbiAgcHJpdmF0ZSBvbkZhaWwoKSB7XG4gICAgdGhpcy5nYW1lLmJhbGxzLmRlbGV0ZSh0aGlzKVxuXG4gICAgdGhpcy5nYW1lLmhwLS1cblxuICAgIGlmICh0aGlzLmdhbWUuaHAgPD0gMCkgdGhpcy5nYW1lLm9uRmFpbCgpXG5cbiAgICBpZiAodGhpcy5nYW1lLmJhbGxzLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZ2FtZS5sYXVuY2hCYWxsKClcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lKSB7fVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy5zY29yZSgpXG4gICAgdGhpcy5oaWdoU2NvcmUoKVxuICAgIHRoaXMuaHAoKVxuICAgIHRoaXMuc3BlZWQoKVxuICB9XG5cbiAgcHJpdmF0ZSBzY29yZSgpIHtcbiAgICBmaWxsKDUwKVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAyMCkpXG4gICAgdGV4dChgU2NvcmU6ICR7dGhpcy5nYW1lLnNjb3JlfWAsIHdpZHRoIC8gMiwgaGVpZ2h0ICogMC41KVxuICB9XG5cbiAgcHJpdmF0ZSBoaWdoU2NvcmUoKSB7XG4gICAgZmlsbCg0NSlcbiAgICBub1N0cm9rZSgpXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMzUpKVxuICAgIHRleHQoYEhpZ2ggU2NvcmU6ICR7dGhpcy5nYW1lLmhpZ2hTY29yZX1gLCB3aWR0aCAvIDIsIGhlaWdodCAqIDAuNTgpXG4gIH1cblxuICBwcml2YXRlIGhwKCkge1xuICAgIGZpbGwoMzApXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDE1KSlcbiAgICB0ZXh0KGBcdTI2NjUgPSAke3RoaXMuZ2FtZS5ocH1gLCB3aWR0aCAvIDIsIGhlaWdodCAqIDAuNjgpXG4gIH1cblxuICBwcml2YXRlIHNwZWVkKCkge1xuICAgIGZpbGwoMjUpXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcIm5vcm1hbFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMjUpKVxuICAgIHRleHQoXG4gICAgICBgU3BlZWQgeCR7QXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpWzBdPy5zcGVlZC50b0ZpeGVkKDEpID8/IDB9YCxcbiAgICAgIHdpZHRoIC8gMixcbiAgICAgIGhlaWdodCAqIDAuNzlcbiAgICApXG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpY2tPcHRpb25zIHtcbiAgeDogbnVtYmVyXG4gIHk6IG51bWJlclxuICBkdXJhYmlsaXR5OiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIEJyaWNrIHtcbiAgZHVyYWJpbGl0eTogbnVtYmVyXG4gIHRvdWNoQmFsbCA9IGZhbHNlXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnYW1lOiBnYW1lLkdhbWUsIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBCcmlja09wdGlvbnMpIHtcbiAgICB0aGlzLmR1cmFiaWxpdHkgPSBvcHRpb25zLmR1cmFiaWxpdHlcbiAgfVxuXG4gIGdldCBzY3JlZW5YKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54ICogdGhpcy5nYW1lLkJSSUNLX1dJRFRIXG4gIH1cblxuICBnZXQgc2NyZWVuWSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueSAqIHRoaXMuZ2FtZS5CUklDS19IRUlHSFRcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgc3Ryb2tlKF8uQkFDS0dST1VORF9DT0xPUilcbiAgICBzdHJva2VXZWlnaHQodGhpcy50b3VjaEJhbGwgPyA0IDogMSlcbiAgICBmaWxsKFxuICAgICAgMjU1LFxuICAgICAgMCxcbiAgICAgIDAsXG4gICAgICBNYXRoLmZsb29yKG1hcCh0aGlzLmR1cmFiaWxpdHksIF8uTUFYX0RVUkFCSUxJVFksIDAsIDI1NSwgMCkpXG4gICAgKVxuICAgIHJlY3QoXG4gICAgICB0aGlzLnNjcmVlblgsXG4gICAgICB0aGlzLnNjcmVlblksXG4gICAgICB0aGlzLmdhbWUuQlJJQ0tfV0lEVEgsXG4gICAgICB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUXG4gICAgKVxuICB9XG5cbiAgaGl0KCkge1xuICAgIHRoaXMuZ2FtZS5zY29yZSsrXG4gICAgdGhpcy5kdXJhYmlsaXR5LS1cblxuICAgIGlmICh0aGlzLmR1cmFiaWxpdHkgPT09IDApIHtcbiAgICAgIHRoaXMuZ2FtZS5icmlja3MuZGVsZXRlKHRoaXMpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSYW5kb21CcmljayhcbiAgZ2FtZTogZ2FtZS5HYW1lLFxuICB4OiBudW1iZXIsXG4gIHk6IG51bWJlclxuKTogQnJpY2sge1xuICByZXR1cm4gbmV3IEJyaWNrKGdhbWUsIHtcbiAgICB4LFxuICAgIHksXG4gICAgZHVyYWJpbGl0eTogMSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChfLk1BWF9EVVJBQklMSVRZIC0gMSkpLFxuICB9KVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgYmFyIGZyb20gXCIuL2JhclwiXG5pbXBvcnQgKiBhcyBiYWxsIGZyb20gXCIuL2JhbGxcIlxuaW1wb3J0ICogYXMgaW5mbyBmcm9tIFwiLi9pbmZvXCJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICBocCA9IF8uQkFTRV9IUFxuICBiYXI6IGJhci5CYXJcbiAgaW5mbzogaW5mby5JbmZvXG4gIGJhbGxzID0gbmV3IFNldDxiYWxsLkJhbGw+KClcbiAgYnJpY2tzID0gbmV3IFNldDxicmljay5Ccmljaz4oKVxuICBmcmFtZXJhdGUgPSBfLkZSQU1FUkFURVxuXG4gIHByaXZhdGUgX3Njb3JlID0gMFxuICBwcml2YXRlIF9oaWdoU2NvcmUgPSBOdW1iZXIobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoU2NvcmVcIikgPz8gMClcblxuICByZWFkb25seSBCUklDS19XSURUSCA9IHdpZHRoIC8gXy5HUklEX1dJRFRIXG4gIHJlYWRvbmx5IEJSSUNLX0hFSUdIVCA9IHRoaXMuQlJJQ0tfV0lEVEggLyBfLkFTUEVDVF9SQVRJT1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvbkZhaWw6ICgpID0+IHVua25vd24pIHtcbiAgICBmb3IgKGxldCB4ID0gMjsgeCA8IF8uR1JJRF9XSURUSCAtIDI7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDI7IHkgPCBfLkdSSURfSEVJR0hUOyB5KyspIHtcbiAgICAgICAgY29uc3QgYiA9IGJyaWNrLmNyZWF0ZVJhbmRvbUJyaWNrKHRoaXMsIHgsIHkpXG4gICAgICAgIGlmIChiLmR1cmFiaWxpdHkgPiAwKSB0aGlzLmJyaWNrcy5hZGQoYilcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxhdW5jaEJhbGwoKVxuXG4gICAgdGhpcy5iYXIgPSBuZXcgYmFyLkJhcih0aGlzKVxuICAgIHRoaXMuaW5mbyA9IG5ldyBpbmZvLkluZm8odGhpcylcbiAgfVxuXG4gIHNldCBzY29yZShzY29yZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc2NvcmUgPSBzY29yZVxuXG4gICAgaWYgKHRoaXMuX3Njb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcbiAgICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5fc2NvcmVcbiAgICB9XG4gIH1cblxuICBnZXQgc2NvcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njb3JlXG4gIH1cblxuICBzZXQgaGlnaFNjb3JlKHNjb3JlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9oaWdoU2NvcmUgPSBzY29yZVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIFN0cmluZyh0aGlzLl9oaWdoU2NvcmUpKVxuICB9XG5cbiAgZ2V0IGhpZ2hTY29yZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGlnaFNjb3JlXG4gIH1cblxuICBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoLi4uXy5CQUNLR1JPVU5EX0NPTE9SKVxuXG4gICAgaWYgKG1vdXNlSXNQcmVzc2VkIHx8IGtleUlzUHJlc3NlZClcbiAgICAgIGZyYW1lUmF0ZShNYXRoLnJvdW5kKHRoaXMuZnJhbWVyYXRlICogNSkpXG4gICAgZWxzZSBmcmFtZVJhdGUodGhpcy5mcmFtZXJhdGUpXG5cbiAgICB0aGlzLmluZm8uZHJhdygpXG4gICAgdGhpcy5iYXIuZHJhdygpXG5cbiAgICB0aGlzLmJyaWNrcy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcbiAgICB0aGlzLmJhbGxzLmZvckVhY2goKGIpID0+IGIuZHJhdygpKVxuICB9XG5cbiAgbGF1bmNoQmFsbCgpIHtcbiAgICB0aGlzLmJhbGxzLmFkZChuZXcgYmFsbC5CYWxsKHRoaXMpKVxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FPLE1BQU0sZUFBZSxLQUFLO0FBQzFCLE1BQU0sYUFBYTtBQUNuQixNQUFNLGNBQWM7QUFDcEIsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSxtQkFBd0IsQ0FBQyxHQUFHLEdBQUc7QUFDckMsTUFBTSxrQkFBa0IsTUFBTSxRQUFRO0FBQ3RDLE1BQU0sVUFBVTtBQUNoQixNQUFNLGFBQWE7QUFDbkIsTUFBTSxjQUFjO0FBQ3BCLE1BQU0sWUFBWTtBQUNsQixNQUFNLFlBQVk7OztBQ1JsQixrQkFBVTtBQUFBLElBTWYsWUFBb0IsT0FBaUI7QUFBakI7QUFMcEIsZUFBSSxRQUFRO0FBQ1osZUFBSSxTQUFTO0FBQ2IsbUJBQVEsUUFBUTtBQUNoQixvQkFBUyxLQUFLLFFBQVE7QUFBQTtBQUFBLElBSXRCLE9BQU87QUFDTCxXQUFLO0FBQ0wsZ0JBQVUsS0FBSyxHQUFHLEtBQUs7QUFDdkI7QUFDQSxXQUFLLElBQUksSUFBSTtBQUNiLFdBQ0csS0FBSyxRQUFRLElBQUssSUFDbEIsS0FBSyxTQUFTLElBQUssSUFDcEIsS0FBSyxPQUNMLEtB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
