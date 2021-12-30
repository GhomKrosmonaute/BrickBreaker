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

  // src/scenes.ts
  var Scenes = class {
    constructor(game2) {
      this.game = game2;
    }
    drawGame() {
      if (mouseIsPressed || keyIsPressed)
        frameRate(Math.round(this.game.framerate * 5));
      else
        frameRate(this.game.framerate);
      this.score();
      this.highScore();
      this.hp();
      this.speed();
      this.game.bar.draw();
      this.game.bricks.forEach((b) => b.draw());
      this.game.balls.forEach((b) => b.draw());
      if (this.game.balls.size === 0) {
        this.game.launchBall();
      }
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
    drawGameOver() {
      this.gameOver(0.4);
      this.button("Retry", 0.6, () => this.game.restart());
    }
    gameOver(h) {
      fill(100, 0, 0);
      noStroke();
      textStyle("bold");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 10));
      text(`GAME OVER`, width / 2 + Math.cos(Date.now() / 1e4), height * h);
    }
    button(content, h, onClick) {
      const y = height * h;
      const hover = mouseY > y - height / 10 && mouseY < y + height / 10;
      fill(hover ? 255 : 200);
      stroke(hover ? 100 : 50);
      strokeWeight(hover ? width / 75 : width / 100);
      textStyle("bold");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 20));
      text(content, width / 2, y);
      if (hover && mouseIsPressed)
        onClick();
    }
  };

  // src/game.ts
  var _a;
  var Game = class {
    constructor() {
      this.hp = BASE_HP;
      this.balls = new Set();
      this.bricks = new Set();
      this.framerate = FRAMERATE;
      this.finish = false;
      this._score = 0;
      this._highScore = Number((_a = localStorage.getItem("highScore")) != null ? _a : 0);
      this.BRICK_WIDTH = width / GRID_WIDTH;
      this.BRICK_HEIGHT = this.BRICK_WIDTH / ASPECT_RATIO;
      this.restart();
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
      if (this.hp > 0) {
        this.scenes.drawGame();
      } else if (!this.finish) {
        this.finish = true;
      } else if (this.finish) {
        this.scenes.drawGameOver();
      } else {
      }
    }
    restart() {
      this.balls.clear();
      this.setGridShape();
      this.launchBall();
      this.bar = new Bar(this);
      this.scenes = new Scenes(this);
      this.hp = BASE_HP;
      this.finish = false;
      this.framerate = FRAMERATE;
    }
    launchBall() {
      this.balls.add(new Ball(this));
    }
    setGridShape() {
      this.bricks.clear();
      for (let x = 2; x < GRID_WIDTH - 2; x++) {
        for (let y = 2; y < GRID_HEIGHT; y++) {
          const b = createRandomBrick(this, x, y);
          if (b.durability > 0)
            this.bricks.add(b);
        }
      }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvYnJpY2sudHMiLCAic3JjL3NjZW5lcy50cyIsICJzcmMvZ2FtZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8vIEB0cy1jaGVja1xuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMvcDUvZ2xvYmFsLmQudHNcIiAvPlxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpXG5cbmxldCBnYW1lOiBHYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgd2luZG93LmlubmVyV2lkdGggfHwgMFxuICApXG4gIGNvbnN0IHdpbmRvd0hlaWdodCA9IE1hdGgubWF4KFxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsXG4gICAgd2luZG93LmlubmVySGVpZ2h0IHx8IDBcbiAgKVxuXG4gIGNvbnN0IF93aWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCB3aW5kb3dIZWlnaHQgKiBfLkFTUEVDVF9SQVRJTylcbiAgY29uc3QgX2hlaWdodCA9IF93aWR0aCAvIF8uQVNQRUNUX1JBVElPXG5cbiAgY3JlYXRlQ2FudmFzKF93aWR0aCwgX2hlaWdodClcblxuICBpZiAoXy5OT19TTU9PVEgpIG5vU21vb3RoKClcbiAgZnJhbWVSYXRlKDMwKVxuXG4gIGdhbWUgPSBuZXcgR2FtZSgoKSA9PiBmcmFtZVJhdGUoMCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xuICBnYW1lLmRyYXcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9XG5leHBvcnQgZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fVxuIiwgImV4cG9ydCBjb25zdCBBU1BFQ1RfUkFUSU8gPSAxNiAvIDlcbmV4cG9ydCBjb25zdCBHUklEX1dJRFRIID0gMjBcbmV4cG9ydCBjb25zdCBHUklEX0hFSUdIVCA9IDhcbmV4cG9ydCBjb25zdCBNQVhfRFVSQUJJTElUWSA9IDVcbmV4cG9ydCBjb25zdCBCQUNLR1JPVU5EX0NPTE9SOiBSR0IgPSBbMCwgMCwgMF1cbmV4cG9ydCBjb25zdCBCQUxMX0JBU0VfU1BFRUQgPSAoKSA9PiB3aWR0aCAvIDE1MFxuZXhwb3J0IGNvbnN0IEJBU0VfSFAgPSAzXG5leHBvcnQgY29uc3QgREVCVUdfTU9ERSA9IGZhbHNlXG5leHBvcnQgY29uc3QgVEFJTF9MRU5HVEggPSAxMFxuZXhwb3J0IGNvbnN0IEZSQU1FUkFURSA9IDI1XG5leHBvcnQgY29uc3QgTk9fU01PT1RIID0gdHJ1ZVxuIiwgImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBCYXIge1xuICB4ID0gd2lkdGggLyAyXG4gIHkgPSBoZWlnaHQgKiAxLjFcbiAgd2lkdGggPSB3aWR0aCAqIDAuMVxuICBoZWlnaHQgPSB0aGlzLndpZHRoIC8gNFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lKSB7fVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSlcbiAgICBub1N0cm9rZSgpXG4gICAgZmlsbCg2MCwgNjAsIDIwMClcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyAyKSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGgsXG4gICAgICB0aGlzLmhlaWdodCxcbiAgICAgIHRoaXMuaGVpZ2h0XG4gICAgKVxuICAgIGZpbGwoNjAsIDIwMCwgMjU1KVxuICAgIHJlY3QoXG4gICAgICAodGhpcy53aWR0aCAvIDQpICogLTEsXG4gICAgICAodGhpcy5oZWlnaHQgLyAyKSAqIC0xLFxuICAgICAgdGhpcy53aWR0aCAvIDIsXG4gICAgICB0aGlzLmhlaWdodFxuICAgIClcbiAgICB0cmFuc2xhdGUoLXRoaXMueCwgLXRoaXMueSlcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCkge1xuICAgIHRoaXMubW92ZSgpXG4gICAgdGhpcy5ib3VuZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBib3VuZHMoKSB7XG4gICAgdGhpcy5nYW1lLmJhbGxzLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgYmFsbC55ICsgYmFsbC5yYWRpdXMgPiB0aGlzLnkgLSB0aGlzLmhlaWdodCAvIDIgJiZcbiAgICAgICAgYmFsbC55ICsgYmFsbC5yYWRpdXMgPCB0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDIgJiZcbiAgICAgICAgYmFsbC54ICsgYmFsbC5yYWRpdXMgPiB0aGlzLnggLSB0aGlzLndpZHRoIC8gMiAmJlxuICAgICAgICBiYWxsLnggLSBiYWxsLnJhZGl1cyA8IHRoaXMueCArIHRoaXMud2lkdGggLyAyXG4gICAgICApIHtcbiAgICAgICAgYmFsbC52ZWxvY2l0eS55ID0gLWFicyhiYWxsLnZlbG9jaXR5LnkpXG5cbiAgICAgICAgYmFsbC5yZWZyZXNoQW5nbGUoKVxuXG4gICAgICAgIGlmIChiYWxsLnggKyBiYWxsLnJhZGl1cyA8IHRoaXMueCAtIHRoaXMud2lkdGggLyA0KSB7XG4gICAgICAgICAgYmFsbC5hbmdsZSArPSBtYXAoXG4gICAgICAgICAgICBiYWxsLnggKyBiYWxsLnJhZGl1cyxcbiAgICAgICAgICAgIHRoaXMueCAtIHRoaXMud2lkdGggLyA0LFxuICAgICAgICAgICAgdGhpcy54IC0gdGhpcy53aWR0aCAvIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMjAsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgY29uc29sZS5sb2coXCJsZWZ0IGNvcm5lclwiLCBiYWxsLmFuZ2xlKVxuXG4gICAgICAgICAgYmFsbC5hbmdsZSA9IGNvbnN0cmFpbihiYWxsLmFuZ2xlLCAtMTc5LCAtMSlcblxuICAgICAgICAgIGJhbGwucmVmcmVzaFZlbG9jaXR5KClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWxsLnggLSBiYWxsLnJhZGl1cyA+IHRoaXMueCArIHRoaXMud2lkdGggLyA0KSB7XG4gICAgICAgICAgYmFsbC5hbmdsZSAtPSBtYXAoXG4gICAgICAgICAgICBiYWxsLnggLSBiYWxsLnJhZGl1cyxcbiAgICAgICAgICAgIHRoaXMueCArIHRoaXMud2lkdGggLyA0LFxuICAgICAgICAgICAgdGhpcy54ICsgdGhpcy53aWR0aCAvIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMjAsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgY29uc29sZS5sb2coXCJyaWdodCBjb3JuZXJcIiwgYmFsbC5hbmdsZSlcblxuICAgICAgICAgIGJhbGwuYW5nbGUgPSBjb25zdHJhaW4oYmFsbC5hbmdsZSwgLTE3OSwgLTEpXG5cbiAgICAgICAgICBiYWxsLnJlZnJlc2hWZWxvY2l0eSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBkXHUwMEU5Y2FsZXIgbGEgYmFsbGUgaG9ycyBkZSBsYSBiYXIgc2kgZWxsZSBlc3QgdHJvcCBhIGRyb2l0ZSBvdSBhIGdhdWNoZVxuICAgICAgICBpZiAoYmFsbC54IDw9IHRoaXMueCAtIHRoaXMud2lkdGggLyAyKSB7XG4gICAgICAgICAgYmFsbC54ID0gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgLSBiYWxsLnJhZGl1c1xuICAgICAgICB9IGVsc2UgaWYgKGJhbGwueCA+PSB0aGlzLnggKyB0aGlzLndpZHRoIC8gMikge1xuICAgICAgICAgIGJhbGwueCA9IHRoaXMueCArIHRoaXMud2lkdGggLyAyICsgYmFsbC5yYWRpdXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYWxsLnkgPSB0aGlzLnkgLSB0aGlzLmhlaWdodCAvIDIgLSBiYWxsLnJhZGl1c1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgbW92ZSgpIHtcbiAgICBjb25zdCB4ID1cbiAgICAgIHRoaXMueCArIChtb3VzZVggLSB0aGlzLngpIC8gNCAvKiBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscylbMF0/LnggPz8gKi9cbiAgICBjb25zdCB5ID0gdGhpcy55ICsgKG1vdXNlWSAtIHRoaXMueSkgLyA0XG5cbiAgICB0aGlzLnggPSBtaW4obWF4KHgsIHRoaXMud2lkdGggLyAyKSwgd2lkdGggLSB0aGlzLndpZHRoIC8gMilcbiAgICB0aGlzLnkgPSBtaW4obWF4KHksIGhlaWdodCAqIDAuOSksIGhlaWdodCAtIHRoaXMuaGVpZ2h0IC8gMilcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCJcblxuZXhwb3J0IGNsYXNzIEJhbGwge1xuICB4ID0gd2lkdGggLyAyXG4gIHkgPSBoZWlnaHQgKiAwLjhcbiAgcmFkaXVzID0gd2lkdGggKiAwLjAwN1xuICBhbmdsZSA9IDBcbiAgdmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoKVxuICBzcGVlZCA9IF8uQkFMTF9CQVNFX1NQRUVEKClcbiAgdGFpbDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9W10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lKSB7XG4gICAgdGhpcy5zZXRSYW5kb21WZWxvY2l0eSgpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICBub1N0cm9rZSgpXG4gICAgZmlsbCgyNTUpXG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMudGFpbCkge1xuICAgICAgY2lyY2xlKFxuICAgICAgICBwYXJ0LngsXG4gICAgICAgIHBhcnQueSxcbiAgICAgICAgbWFwKFxuICAgICAgICAgIHRoaXMudGFpbC5pbmRleE9mKHBhcnQpLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy50YWlsLmxlbmd0aCAtIDEsXG4gICAgICAgICAgdGhpcy5yYWRpdXMgLyAyLFxuICAgICAgICAgIHRoaXMucmFkaXVzICogMlxuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICAgIGNpcmNsZSh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMgKiAyKVxuICAgIGlmIChfLkRFQlVHX01PREUpXG4gICAgICB0ZXh0KFxuICAgICAgICBgc3BlZWQ6ICR7dGhpcy5zcGVlZH1cXG5hbmdsZTogJHtNYXRoLnJvdW5kKFxuICAgICAgICAgIHRoaXMuYW5nbGVcbiAgICAgICAgKX1cXG52ZWxvY2l0eTpcXG4gICB4PSR7dGhpcy52ZWxvY2l0eS54fVxcbiAgICB5PSR7dGhpcy52ZWxvY2l0eS55fWAsXG4gICAgICAgIHRoaXMueCArIHRoaXMucmFkaXVzLFxuICAgICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1c1xuICAgICAgKVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGUoKSB7XG4gICAgdGhpcy5zYXZlKClcbiAgICB0aGlzLmNoZWNrRmFpbCgpXG4gICAgdGhpcy5icmlja3MoKVxuICAgIHRoaXMuYWNjZWxlcmF0ZSgpXG4gICAgdGhpcy5tb3ZlKClcbiAgICB0aGlzLmJvdW5kcygpXG4gIH1cblxuICBzZXRSYW5kb21WZWxvY2l0eSgpIHtcbiAgICB0aGlzLnNldEFuZ2xlKHJhbmRvbSgtMTc5LCAtMSkpXG5cbiAgICBpZiAodGhpcy52ZWxvY2l0eS55ID4gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG4gIH1cblxuICBzZXRBbmdsZShhbmdsZTogbnVtYmVyKSB7XG4gICAgdGhpcy5hbmdsZSA9IGFuZ2xlXG5cbiAgICB0aGlzLnJlZnJlc2hWZWxvY2l0eSgpXG4gIH1cblxuICByZWZyZXNoVmVsb2NpdHkoKSB7XG4gICAgdGhpcy52ZWxvY2l0eS5zZXQoY29zKHRoaXMuYW5nbGUpLCBzaW4odGhpcy5hbmdsZSkpLm11bHQodGhpcy5zcGVlZClcblxuICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgfVxuXG4gIHJlZnJlc2hBbmdsZSgpIHtcbiAgICBjb25zdCBhID0gY3JlYXRlVmVjdG9yKClcbiAgICBjb25zdCBiID0gdGhpcy52ZWxvY2l0eVxuXG4gICAgdGhpcy5hbmdsZSA9IGRlZ3JlZXMoYXRhbjIoYi55IC0gYS55LCBiLnggLSBhLngpKVxuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICB0aGlzLnRhaWwucHVzaCh7XG4gICAgICB4OiB0aGlzLngsXG4gICAgICB5OiB0aGlzLnksXG4gICAgfSlcblxuICAgIGlmICh0aGlzLnRhaWwubGVuZ3RoID4gXy5UQUlMX0xFTkdUSCkgdGhpcy50YWlsLnNoaWZ0KClcbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tGYWlsKCkge1xuICAgIGlmICh0aGlzLnkgKyB0aGlzLnJhZGl1cyA+PSBoZWlnaHQpIHRoaXMub25GYWlsKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge1xuICAgIGlmICh0aGlzLnggKyB0aGlzLnJhZGl1cyA+PSB3aWR0aCB8fCB0aGlzLnggLSB0aGlzLnJhZGl1cyA8PSAwKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnggKj0gLTFcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnkgLSB0aGlzLnJhZGl1cyA8PSAwKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnkgKj0gLTFcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYnJpY2tzKCkge1xuICAgIGNvbnN0IGJyaWNrID0gQXJyYXkuZnJvbSh0aGlzLmdhbWUuYnJpY2tzKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkaXN0KFxuICAgICAgICAgIGEuc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCAvIDIsXG4gICAgICAgICAgYS5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDIsXG4gICAgICAgICAgdGhpcy54LFxuICAgICAgICAgIHRoaXMueVxuICAgICAgICApIC1cbiAgICAgICAgZGlzdChcbiAgICAgICAgICBiLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggLyAyLFxuICAgICAgICAgIGIuc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyLFxuICAgICAgICAgIHRoaXMueCxcbiAgICAgICAgICB0aGlzLnlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0pWzBdXG5cbiAgICBpZiAoIWJyaWNrKSByZXR1cm5cblxuICAgIGNvbnN0IGlubmVyWCA9XG4gICAgICB0aGlzLnggPiBicmljay5zY3JlZW5YICYmIHRoaXMueCA8IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEhcbiAgICBjb25zdCBpbm5lclkgPVxuICAgICAgdGhpcy55ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5ZICYmXG4gICAgICB0aGlzLnkgLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUXG5cbiAgICBsZXQgdG91Y2ggPSBmYWxzZVxuXG4gICAgLy8gdG9wXG4gICAgaWYgKFxuICAgICAgdGhpcy55ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5ZICYmXG4gICAgICB0aGlzLnkgPCBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDIgJiZcbiAgICAgIGlubmVyWFxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG4gICAgICB0aGlzLnkgPSBicmljay5zY3JlZW5ZIC0gdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICAvLyBib3R0b21cbiAgICBlbHNlIGlmIChcbiAgICAgIHRoaXMueSAtIHRoaXMucmFkaXVzIDwgYnJpY2suc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgJiZcbiAgICAgIHRoaXMueSA+IGJyaWNrLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUIC8gMiAmJlxuICAgICAgaW5uZXJYXG4gICAgKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnkgKj0gLTFcbiAgICAgIHRoaXMueSA9IGJyaWNrLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUICsgdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICAvLyBsZWZ0XG4gICAgZWxzZSBpZiAoXG4gICAgICB0aGlzLnggKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblggJiZcbiAgICAgIHRoaXMueCA8IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggLyAyICYmXG4gICAgICBpbm5lcllcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuICAgICAgdGhpcy54ID0gYnJpY2suc2NyZWVuWCAtIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gcmlnaHRcbiAgICBlbHNlIGlmIChcbiAgICAgIHRoaXMueCAtIHRoaXMucmFkaXVzIDwgYnJpY2suc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCAmJlxuICAgICAgdGhpcy54ID4gYnJpY2suc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCAvIDIgJiZcbiAgICAgIGlubmVyWVxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IC0xXG4gICAgICB0aGlzLnggPSBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIICsgdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICBicmljay50b3VjaEJhbGwgPSB0b3VjaFxuXG4gICAgaWYgKHRvdWNoKSBicmljay5oaXQoKVxuICB9XG5cbiAgcHJpdmF0ZSBhY2NlbGVyYXRlKCkge1xuICAgIHRoaXMuc3BlZWQgPSBtYXAoXG4gICAgICB0aGlzLmdhbWUuc2NvcmUsXG4gICAgICAwLFxuICAgICAgNTAwLFxuICAgICAgXy5CQUxMX0JBU0VfU1BFRUQoKSxcbiAgICAgIE1hdGgubWluKFxuICAgICAgICBfLkJBTExfQkFTRV9TUEVFRCgpICogMTAsXG4gICAgICAgIE1hdGgubWluKHRoaXMuZ2FtZS5CUklDS19IRUlHSFQsIHRoaXMuZ2FtZS5CUklDS19XSURUSClcbiAgICAgIClcbiAgICApXG4gIH1cblxuICBtb3ZlKCkge1xuICAgIHRoaXMueCArPSB0aGlzLnZlbG9jaXR5LnhcbiAgICB0aGlzLnkgKz0gdGhpcy52ZWxvY2l0eS55XG4gIH1cblxuICBwcml2YXRlIG9uRmFpbCgpIHtcbiAgICB0aGlzLmdhbWUuYmFsbHMuZGVsZXRlKHRoaXMpXG5cbiAgICB0aGlzLmdhbWUuaHAtLVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWNrT3B0aW9ucyB7XG4gIHg6IG51bWJlclxuICB5OiBudW1iZXJcbiAgZHVyYWJpbGl0eTogbnVtYmVyXG59XG5cbmV4cG9ydCBjbGFzcyBCcmljayB7XG4gIGR1cmFiaWxpdHk6IG51bWJlclxuICB0b3VjaEJhbGwgPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lLCBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogQnJpY2tPcHRpb25zKSB7XG4gICAgdGhpcy5kdXJhYmlsaXR5ID0gb3B0aW9ucy5kdXJhYmlsaXR5XG4gIH1cblxuICBnZXQgc2NyZWVuWCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueCAqIHRoaXMuZ2FtZS5CUklDS19XSURUSFxuICB9XG5cbiAgZ2V0IHNjcmVlblkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnkgKiB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHN0cm9rZShfLkJBQ0tHUk9VTkRfQ09MT1IpXG4gICAgc3Ryb2tlV2VpZ2h0KHRoaXMudG91Y2hCYWxsID8gNCA6IDEpXG4gICAgZmlsbChcbiAgICAgIDI1NSxcbiAgICAgIDAsXG4gICAgICAwLFxuICAgICAgTWF0aC5mbG9vcihtYXAodGhpcy5kdXJhYmlsaXR5LCBfLk1BWF9EVVJBQklMSVRZLCAwLCAyNTUsIDApKVxuICAgIClcbiAgICByZWN0KFxuICAgICAgdGhpcy5zY3JlZW5YLFxuICAgICAgdGhpcy5zY3JlZW5ZLFxuICAgICAgdGhpcy5nYW1lLkJSSUNLX1dJRFRILFxuICAgICAgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVFxuICAgIClcbiAgfVxuXG4gIGhpdCgpIHtcbiAgICB0aGlzLmdhbWUuc2NvcmUrK1xuICAgIHRoaXMuZHVyYWJpbGl0eS0tXG5cbiAgICBpZiAodGhpcy5kdXJhYmlsaXR5ID09PSAwKSB7XG4gICAgICB0aGlzLmdhbWUuYnJpY2tzLmRlbGV0ZSh0aGlzKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmFuZG9tQnJpY2soXG4gIGdhbWU6IGdhbWUuR2FtZSxcbiAgeDogbnVtYmVyLFxuICB5OiBudW1iZXJcbik6IEJyaWNrIHtcbiAgcmV0dXJuIG5ldyBCcmljayhnYW1lLCB7XG4gICAgeCxcbiAgICB5LFxuICAgIGR1cmFiaWxpdHk6IDEgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoXy5NQVhfRFVSQUJJTElUWSAtIDEpKSxcbiAgfSlcbn1cbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgU2NlbmVzIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnYW1lOiBnYW1lLkdhbWUpIHt9XG5cbiAgZHJhd0dhbWUoKSB7XG4gICAgaWYgKG1vdXNlSXNQcmVzc2VkIHx8IGtleUlzUHJlc3NlZClcbiAgICAgIGZyYW1lUmF0ZShNYXRoLnJvdW5kKHRoaXMuZ2FtZS5mcmFtZXJhdGUgKiA1KSlcbiAgICBlbHNlIGZyYW1lUmF0ZSh0aGlzLmdhbWUuZnJhbWVyYXRlKVxuXG4gICAgdGhpcy5zY29yZSgpXG4gICAgdGhpcy5oaWdoU2NvcmUoKVxuICAgIHRoaXMuaHAoKVxuICAgIHRoaXMuc3BlZWQoKVxuXG4gICAgdGhpcy5nYW1lLmJhci5kcmF3KClcblxuICAgIHRoaXMuZ2FtZS5icmlja3MuZm9yRWFjaCgoYikgPT4gYi5kcmF3KCkpXG4gICAgdGhpcy5nYW1lLmJhbGxzLmZvckVhY2goKGIpID0+IGIuZHJhdygpKVxuXG4gICAgaWYgKHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmdhbWUubGF1bmNoQmFsbCgpXG4gICAgfVxuICB9XG5cblxuXG4gIHByaXZhdGUgc2NvcmUoKSB7XG4gICAgZmlsbCg1MClcbiAgICBub1N0cm9rZSgpXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMjApKVxuICAgIHRleHQoYFNjb3JlOiAke3RoaXMuZ2FtZS5zY29yZX1gLCB3aWR0aCAvIDIsIGhlaWdodCAqIDAuNSlcbiAgfVxuXG4gIHByaXZhdGUgaGlnaFNjb3JlKCkge1xuICAgIGZpbGwoNDUpXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDM1KSlcbiAgICB0ZXh0KGBIaWdoIFNjb3JlOiAke3RoaXMuZ2FtZS5oaWdoU2NvcmV9YCwgd2lkdGggLyAyLCBoZWlnaHQgKiAwLjU4KVxuICB9XG5cbiAgcHJpdmF0ZSBocCgpIHtcbiAgICBmaWxsKDMwKVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAxNSkpXG4gICAgdGV4dChgXHUyNjY1ID0gJHt0aGlzLmdhbWUuaHB9YCwgd2lkdGggLyAyLCBoZWlnaHQgKiAwLjY4KVxuICB9XG5cbiAgcHJpdmF0ZSBzcGVlZCgpIHtcbiAgICBmaWxsKDI1KVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJub3JtYWxcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDI1KSlcbiAgICB0ZXh0KFxuICAgICAgYFNwZWVkIHgke0FycmF5LmZyb20odGhpcy5nYW1lLmJhbGxzKVswXT8uc3BlZWQudG9GaXhlZCgxKSA/PyAwfWAsXG4gICAgICB3aWR0aCAvIDIsXG4gICAgICBoZWlnaHQgKiAwLjc5XG4gICAgKVxuICB9XG5cbiAgZHJhd0dhbWVPdmVyKCkge1xuICAgIHRoaXMuZ2FtZU92ZXIoLjQpXG4gICAgdGhpcy5idXR0b24oXCJSZXRyeVwiLCAuNiwgKCkgPT4gdGhpcy5nYW1lLnJlc3RhcnQoKSlcbiAgfVxuXG4gIHByaXZhdGUgZ2FtZU92ZXIoaDogbnVtYmVyKSB7XG4gICAgZmlsbCgxMDAsIDAsIDApXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDEwKSlcbiAgICB0ZXh0KFxuICAgICAgYEdBTUUgT1ZFUmAsXG4gICAgICB3aWR0aCAvIDIgKyBNYXRoLmNvcyhEYXRlLm5vdygpIC8gMTAwMDApLFxuICAgICAgaGVpZ2h0ICogaFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYnV0dG9uKGNvbnRlbnQ6IHN0cmluZywgaDogbnVtYmVyLCBvbkNsaWNrOiAoKSA9PiB1bmtub3duKSB7XG4gICAgY29uc3QgeSA9IGhlaWdodCAqIGhcbiAgICBjb25zdCBob3ZlciA9IG1vdXNlWSA+IHkgLSBoZWlnaHQgLyAxMCAmJiBtb3VzZVkgPCB5ICsgaGVpZ2h0IC8gMTBcblxuICAgIGZpbGwoaG92ZXIgPyAyNTUgOiAyMDApXG4gICAgc3Ryb2tlKGhvdmVyID8gMTAwIDogNTApXG4gICAgc3Ryb2tlV2VpZ2h0KGhvdmVyID8gd2lkdGggLyA3NSA6IHdpZHRoIC8gMTAwKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDIwKSlcbiAgICB0ZXh0KFxuICAgICAgY29udGVudCxcbiAgICAgIHdpZHRoIC8gMixcbiAgICAgIHlcbiAgICApXG5cbiAgICBpZihob3ZlciAmJiBtb3VzZUlzUHJlc3NlZCkgb25DbGljaygpXG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGJhciBmcm9tIFwiLi9iYXJcIlxuaW1wb3J0ICogYXMgYmFsbCBmcm9tIFwiLi9iYWxsXCJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcbmltcG9ydCAqIGFzIHNjZW5lcyBmcm9tIFwiLi9zY2VuZXNcIlxuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gIGhwID0gXy5CQVNFX0hQXG4gIGJhcjogYmFyLkJhclxuICBiYWxscyA9IG5ldyBTZXQ8YmFsbC5CYWxsPigpXG4gIGJyaWNrcyA9IG5ldyBTZXQ8YnJpY2suQnJpY2s+KClcbiAgZnJhbWVyYXRlID0gXy5GUkFNRVJBVEVcbiAgc2NlbmVzOiBzY2VuZXMuU2NlbmVzXG4gIGZpbmlzaCA9IGZhbHNlXG5cbiAgcHJpdmF0ZSBfc2NvcmUgPSAwXG4gIHByaXZhdGUgX2hpZ2hTY29yZSA9IE51bWJlcihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZVwiKSA/PyAwKVxuXG4gIHJlYWRvbmx5IEJSSUNLX1dJRFRIID0gd2lkdGggLyBfLkdSSURfV0lEVEhcbiAgcmVhZG9ubHkgQlJJQ0tfSEVJR0hUID0gdGhpcy5CUklDS19XSURUSCAvIF8uQVNQRUNUX1JBVElPXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgfVxuXG4gIHNldCBzY29yZShzY29yZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc2NvcmUgPSBzY29yZVxuXG4gICAgaWYgKHRoaXMuX3Njb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcbiAgICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5fc2NvcmVcbiAgICB9XG4gIH1cblxuICBnZXQgc2NvcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njb3JlXG4gIH1cblxuICBzZXQgaGlnaFNjb3JlKHNjb3JlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9oaWdoU2NvcmUgPSBzY29yZVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIFN0cmluZyh0aGlzLl9oaWdoU2NvcmUpKVxuICB9XG5cbiAgZ2V0IGhpZ2hTY29yZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGlnaFNjb3JlXG4gIH1cblxuICBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoLi4uXy5CQUNLR1JPVU5EX0NPTE9SKVxuXG4gICAgaWYodGhpcy5ocCA+IDApIHtcbiAgICAgIHRoaXMuc2NlbmVzLmRyYXdHYW1lKClcbiAgICB9IGVsc2UgaWYoIXRoaXMuZmluaXNoKSB7XG4gICAgICB0aGlzLmZpbmlzaCA9IHRydWVcbiAgICB9IGVsc2UgaWYodGhpcy5maW5pc2gpIHtcbiAgICAgIHRoaXMuc2NlbmVzLmRyYXdHYW1lT3ZlcigpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHRpdGxlIHNjcmVlblxuICAgIH1cbiAgfVxuXG4gIHJlc3RhcnQoKSB7XG4gICAgdGhpcy5iYWxscy5jbGVhcigpXG5cbiAgICB0aGlzLnNldEdyaWRTaGFwZSgpXG4gICAgdGhpcy5sYXVuY2hCYWxsKClcblxuICAgIHRoaXMuYmFyID0gbmV3IGJhci5CYXIodGhpcylcbiAgICB0aGlzLnNjZW5lcyA9IG5ldyBzY2VuZXMuU2NlbmVzKHRoaXMpXG5cbiAgICB0aGlzLmhwID0gXy5CQVNFX0hQXG4gICAgdGhpcy5maW5pc2ggPSBmYWxzZVxuICAgIHRoaXMuZnJhbWVyYXRlID0gXy5GUkFNRVJBVEVcbiAgfVxuXG4gIGxhdW5jaEJhbGwoKSB7XG4gICAgdGhpcy5iYWxscy5hZGQobmV3IGJhbGwuQmFsbCh0aGlzKSlcbiAgfVxuXG4gIHNldEdyaWRTaGFwZSgpIHtcbiAgICB0aGlzLmJyaWNrcy5jbGVhcigpXG5cbiAgICAvLyBtYWtlIGdyaWQgc2hhcGVcbiAgICAvLyB0b2RvOiB1c2UgZGVmYXVsdCBsZXZlbCB0eXBlIHByZXNldHNcbiAgICBmb3IgKGxldCB4ID0gMjsgeCA8IF8uR1JJRF9XSURUSCAtIDI7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDI7IHkgPCBfLkdSSURfSEVJR0hUOyB5KyspIHtcbiAgICAgICAgY29uc3QgYiA9IGJyaWNrLmNyZWF0ZVJhbmRvbUJyaWNrKHRoaXMsIHgsIHkpXG4gICAgICAgIGlmIChiLmR1cmFiaWxpdHkgPiAwKSB0aGlzLmJyaWNrcy5hZGQoYilcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FD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S0FBSztBQUFBO0FBQUEsUUFHVixVQUFVLE9BQWU7QUFDM0IsV0FBSyxhQUFhO0FBQ2xCLG1CQUFhLFFBQVEsYUFBYSxPQUFPLEtBQUs7QUFBQTtBQUFBLFFBRzVDLFlBQVk7QUFDZCxhQUFPLEtBQUs7QUFBQTtBQUFBLElBR2QsT0FBTztBQUNMLGlCQUFXLEdBQUs7QUFFaEIsVUFBRyxLQUFLLEtBQUssR0FBRztBQUNkLGFBQUssT0FBTztBQUFBLGlCQUNKLENBQUMsS0FBSyxRQUFRO0FBQ3RCLGFBQUssU0FBUztBQUFBLGlCQUNOLEtBQUssUUFBUTtBQUNyQixhQUFLLE9BQU87QUFBQSxhQUNQO0FBQUE7QUFBQTtBQUFBLElBS1QsVUFBVTtBQUNSLFdBQUssTUFBTTtBQUVYLFdBQUs7QUFDTCxXQUFLO0FBRUwsV0FBSyxNQUFNLElBQVEsSUFBSTtBQUN2QixXQUFLLFNBQVMsSUFBVyxPQUFPO0FBRWhDLFdBQUssS0FBTztBQUNaLFdBQUssU0FBUztBQUNkLFdBQUssWUFBYztBQUFBO0FBQUEsSUFHckIsYUFBYTtBQUNYLFdBQUssTUFBTSxJQUFJLElBQVMsS0FBSztBQUFBO0FBQUEsSUFHL0IsZUFBZTtBQUNiLFdBQUssT0FBTztBQUlaLGVBQVMsSUFBSSxHQUFHLElBQUksQUFBRSxhQUFhLEdBQUcsS0FBSztBQUN6QyxpQkFBUyxJQUFJLEdBQUcsSUFBTSxhQUFhLEtBQUs7QUFDdEMsZ0JBQU0sSUFBSSxBQUFNLGtCQUFrQixNQUFNLEdBQUc7QUFDM0MsY0FBSSxFQUFFLGFBQWE7QUFBRyxpQkFBSyxPQUFPLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FOakY5QyxXQUFTLGlCQUFpQixlQUFlLENBQUMsVUFBVSxNQUFNO0FBRTFELE1BQUk7QUFFRyxtQkFBaUI7QUFDdEIsVUFBTSxjQUFjLEtBQUssSUFDdkIsU0FBUyxnQkFBZ0IsYUFDekIsT0FBTyxjQUFjO0FBRXZCLFVBQU0sZUFBZSxLQUFLLElBQ3hCLFNBQVMsZ0JBQWdCLGNBQ3pCLE9BQU8sZUFBZTtBQUd4QixVQUFNLFNBQVMsS0FBSyxJQUFJLGFBQWEsZUFBaUI7QUFDdEQsVUFBTSxVQUFVLFNBQVc7QUFFM0IsaUJBQWEsUUFBUTtBQUVyQixRQUFNO0FBQVc7QUFDakIsY0FBVTtBQUVWLFdBQU8sSUFBSSxLQUFLLE1BQU0sVUFBVTtBQUFBO0FBRzNCLGtCQUFnQjtBQUNyQixTQUFLO0FBQUE7QUFHQSx3QkFBc0I7QUFBQTtBQUN0Qix5QkFBdUI7QUFBQTsiLAogICJuYW1lcyI6IFtdCn0K
