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
      rect(this.width / 2 * -1, this.height / 2 * -1, this.width, this.height, this.height / 3);
      translate(-this.x, -this.y);
    }
    update() {
      this.bounds();
      this.move();
    }
    bounds() {
      this.game.balls.forEach((ball2) => {
        if (ball2.y + ball2.radius > this.y - this.height / 2 && ball2.x + ball2.radius > this.x - this.width / 2 && ball2.x - ball2.radius < this.x + this.width / 2) {
          ball2.velocity.y *= -1;
          ball2.y = this.y - this.height / 2 - ball2.radius;
        }
      });
    }
    move() {
      var _a, _b;
      const x = (_b = (_a = Array.from(this.game.balls)[0]) == null ? void 0 : _a.x) != null ? _b : mouseX;
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
      this.velocity = createVector(0, 0, 0);
      this.speed = BALL_BASE_SPEED;
      this.setRandomVelocity();
    }
    draw() {
      this.update();
      noStroke();
      fill(255);
      circle(this.x, this.y, this.radius * 2);
    }
    setRandomVelocity() {
      const angle = round(random(360));
      this.velocity.set(cos(angle) * this.speed, sin(angle) * this.speed);
      if (this.velocity.y > 0)
        this.velocity.y *= -1;
    }
    update() {
      this.checkFail();
      this.bricks();
      this.bounds();
      this.move();
    }
    checkFail() {
      if (this.y + this.radius >= height)
        this.onFail();
    }
    bounds() {
      if (this.x + this.radius >= width || this.x - this.radius <= 0)
        this.velocity.x *= -1;
      if (this.y - this.radius <= 0)
        this.velocity.y *= -1;
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
      } else if (this.y - this.radius < brick2.screenY + brick2.height && this.y > brick2.screenY + brick2.height / 2 && innerX) {
        this.velocity.y *= -1;
        this.y = brick2.screenY + brick2.height + this.radius;
        touch = true;
      } else if (this.x + this.radius > brick2.screenX && this.x < brick2.screenX + brick2.width / 2 && innerY) {
        this.velocity.x *= -1;
        this.x = brick2.screenX - this.radius;
        touch = true;
      } else if (this.x - this.radius < brick2.screenX + brick2.width && this.x > brick2.screenX + brick2.width / 2 && innerY) {
        this.velocity.x *= -1;
        this.x = brick2.screenX + brick2.width + this.radius;
        touch = true;
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
      durability: floor(random(MAX_DURABILITY))
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
      this.bricks.forEach((b) => b.draw());
      this.balls.forEach((b) => b.draw());
      this.bar.draw();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvYnJpY2sudHMiLCAic3JjL2dhbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyBAdHMtY2hlY2tcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9ub2RlX21vZHVsZXMvQHR5cGVzL3A1L2dsb2JhbC5kLnRzXCIgLz5cblxuaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgR2FtZSB9IGZyb20gXCIuL2dhbWVcIlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgKGV2ZW50KSA9PiBldmVudC5wcmV2ZW50RGVmYXVsdCgpKVxuXG5sZXQgZ2FtZTogR2FtZVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKSB7XG4gIGNvbnN0IHdpbmRvd1dpZHRoID0gTWF0aC5tYXgoXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgIHdpbmRvdy5pbm5lcldpZHRoIHx8IDBcbiAgKVxuICBjb25zdCB3aW5kb3dIZWlnaHQgPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwXG4gIClcblxuICBjb25zdCBfd2lkdGggPSBNYXRoLm1pbih3aW5kb3dXaWR0aCwgd2luZG93SGVpZ2h0ICogXy5BU1BFQ1RfUkFUSU8pXG4gIGNvbnN0IF9oZWlnaHQgPSBfd2lkdGggLyBfLkFTUEVDVF9SQVRJT1xuXG4gIGNyZWF0ZUNhbnZhcyhfd2lkdGgsIF9oZWlnaHQpXG5cbiAgZ2FtZSA9IG5ldyBHYW1lKCgpID0+IGZyYW1lUmF0ZSgwKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYXcoKSB7XG4gIGdhbWUuZHJhdygpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZXlQcmVzc2VkKCkge31cbmV4cG9ydCBmdW5jdGlvbiBrZXlSZWxlYXNlZCgpIHt9XG4iLCAiZXhwb3J0IGNvbnN0IEFTUEVDVF9SQVRJTyA9IDE2IC8gOVxuZXhwb3J0IGNvbnN0IEdSSURfV0lEVEggPSAyMFxuZXhwb3J0IGNvbnN0IEdSSURfSEVJR0hUID0gOFxuZXhwb3J0IGNvbnN0IE1BWF9EVVJBQklMSVRZID0gNVxuZXhwb3J0IGNvbnN0IEJBQ0tHUk9VTkRfQ09MT1I6IFJHQiA9IFswLCAwLCAwXVxuZXhwb3J0IGNvbnN0IEJBTExfQkFTRV9TUEVFRCA9IDVcbmV4cG9ydCBjb25zdCBCQVNFX0hQID0gM1xuIiwgImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBCYXIge1xuICB4ID0gMjAwXG4gIHkgPSBoZWlnaHQgKiAwLjlcbiAgd2lkdGggPSB3aWR0aCAqIDAuMVxuICBoZWlnaHQgPSB0aGlzLndpZHRoIC8gNFxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lKSB7fVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSlcbiAgICBub1N0cm9rZSgpXG4gICAgZmlsbCg2MCwgNjAsIDIwMClcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyAyKSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGgsXG4gICAgICB0aGlzLmhlaWdodCxcbiAgICAgIHRoaXMuaGVpZ2h0IC8gM1xuICAgIClcbiAgICB0cmFuc2xhdGUoLXRoaXMueCwgLXRoaXMueSlcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCkge1xuICAgIHRoaXMuYm91bmRzKClcbiAgICB0aGlzLm1vdmUoKVxuICB9XG5cbiAgcHJpdmF0ZSBib3VuZHMoKSB7XG4gICAgdGhpcy5nYW1lLmJhbGxzLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgIGlmKFxuICAgICAgICBiYWxsLnkgKyBiYWxsLnJhZGl1cyA+IHRoaXMueSAtIHRoaXMuaGVpZ2h0IC8gMiAmJlxuICAgICAgICBiYWxsLnggKyBiYWxsLnJhZGl1cyA+IHRoaXMueCAtIHRoaXMud2lkdGggLyAyICYmXG4gICAgICAgIGJhbGwueCAtIGJhbGwucmFkaXVzIDwgdGhpcy54ICsgdGhpcy53aWR0aCAvIDJcbiAgICAgICkge1xuICAgICAgICBiYWxsLnZlbG9jaXR5LnkgKj0gLTFcbiAgICAgICAgYmFsbC55ID0gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyIC0gYmFsbC5yYWRpdXNcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBtb3ZlKCkge1xuICAgIGNvbnN0IHggPSBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscylbMF0/LnggPz8gbW91c2VYXG5cbiAgICB0aGlzLnggPSBtaW4oXG4gICAgICBtYXgodGhpcy53aWR0aCAvIDIsIHgpLFxuICAgICAgd2lkdGggLSAodGhpcy53aWR0aCAvIDIpXG4gICAgKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgQmFsbCB7XG4gIHggPSB3aWR0aCAvIDJcbiAgeSA9IGhlaWdodCAqIDAuOFxuICByYWRpdXMgPSB3aWR0aCAqIDAuMDFcbiAgdmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoMCwwLDApXG4gIHNwZWVkID0gXy5CQUxMX0JBU0VfU1BFRURcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge1xuICAgIHRoaXMuc2V0UmFuZG9tVmVsb2NpdHkoKVxuICB9XG5cbiAgZHJhdygpIHtcbiAgICB0aGlzLnVwZGF0ZSgpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoMjU1KVxuICAgIGNpcmNsZSh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMgKiAyKVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRSYW5kb21WZWxvY2l0eSgpIHtcbiAgICBjb25zdCBhbmdsZSA9IHJvdW5kKHJhbmRvbSgzNjApKVxuXG4gICAgdGhpcy52ZWxvY2l0eS5zZXQoXG4gICAgICBjb3MoYW5nbGUpICogdGhpcy5zcGVlZCxcbiAgICAgIHNpbihhbmdsZSkgKiB0aGlzLnNwZWVkXG4gICAgKVxuXG4gICAgaWYodGhpcy52ZWxvY2l0eS55ID4gMCkgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLmNoZWNrRmFpbCgpXG4gICAgdGhpcy5icmlja3MoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgICB0aGlzLm1vdmUoKVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0ZhaWwoKSB7XG4gICAgaWYodGhpcy55ICsgdGhpcy5yYWRpdXMgPj0gaGVpZ2h0KVxuICAgICAgdGhpcy5vbkZhaWwoKVxuICB9XG5cbiAgcHJpdmF0ZSBib3VuZHMoKSB7XG4gICAgaWYoXG4gICAgICB0aGlzLnggKyB0aGlzLnJhZGl1cyA+PSB3aWR0aCB8fFxuICAgICAgdGhpcy54IC0gdGhpcy5yYWRpdXMgPD0gMFxuICAgIClcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuXG4gICAgaWYodGhpcy55IC0gdGhpcy5yYWRpdXMgPD0gMClcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICB9XG5cbiAgcHJpdmF0ZSBicmlja3MoKSB7XG4gICAgY29uc3QgYnJpY2sgPSBBcnJheS5mcm9tKHRoaXMuZ2FtZS5icmlja3MpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRpc3QoYS5zY3JlZW5YICsgYS53aWR0aCAvIDIsIGEuc2NyZWVuWSArIGEuaGVpZ2h0IC8gMiwgdGhpcy54LCB0aGlzLnkpIC1cbiAgICAgICAgZGlzdChiLnNjcmVlblggKyBiLndpZHRoIC8gMiwgYi5zY3JlZW5ZICsgYi5oZWlnaHQgLyAyLCB0aGlzLngsIHRoaXMueSlcbiAgICAgIClcbiAgICB9KVswXVxuXG4gICAgaWYoIWJyaWNrKSByZXR1cm47XG5cbiAgICBjb25zdCBpbm5lclggPSAoXG4gICAgICB0aGlzLnggPiBicmljay5zY3JlZW5YICYmXG4gICAgICB0aGlzLnggPCBicmljay5zY3JlZW5YICsgYnJpY2sud2lkdGhcbiAgICApXG4gICAgY29uc3QgaW5uZXJZID0gKFxuICAgICAgdGhpcy55ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5ZICYmXG4gICAgICB0aGlzLnkgLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblkgKyBicmljay5oZWlnaHRcbiAgICApXG5cbiAgICBsZXQgdG91Y2ggPSBmYWxzZVxuXG4gICAgLy8gdG9wXG4gICAgaWYoXG4gICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblkgJiZcbiAgICAgIHRoaXMueSA8IGJyaWNrLnNjcmVlblkgKyBicmljay5oZWlnaHQgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSAtIHRoaXMucmFkaXVzXG4gICAgICB0b3VjaCA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBib3R0b21cbiAgICBlbHNlIGlmKFxuICAgICAgdGhpcy55IC0gdGhpcy5yYWRpdXMgPCBicmljay5zY3JlZW5ZICsgYnJpY2suaGVpZ2h0ICYmXG4gICAgICB0aGlzLnkgPiBicmljay5zY3JlZW5ZICsgYnJpY2suaGVpZ2h0LzIgJiZcbiAgICAgIGlubmVyWFxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG4gICAgICB0aGlzLnkgPSBicmljay5zY3JlZW5ZICsgYnJpY2suaGVpZ2h0ICsgdGhpcy5yYWRpdXNcbiAgICAgIHRvdWNoID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIGxlZnRcbiAgICBlbHNlIGlmKFxuICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5YICYmXG4gICAgICB0aGlzLnggPCBicmljay5zY3JlZW5YICsgYnJpY2sud2lkdGggLyAyICYmXG4gICAgICBpbm5lcllcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuICAgICAgdGhpcy54ID0gYnJpY2suc2NyZWVuWCAtIHRoaXMucmFkaXVzXG4gICAgICB0b3VjaCA9IHRydWVcbiAgICB9XG5cbiAgICAvLyByaWdodFxuICAgIGVsc2UgaWYoXG4gICAgICB0aGlzLnggLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblggKyBicmljay53aWR0aCAmJlxuICAgICAgdGhpcy54ID4gYnJpY2suc2NyZWVuWCArIGJyaWNrLndpZHRoLzIgJiZcbiAgICAgIGlubmVyWVxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IC0xXG4gICAgICB0aGlzLnggPSBicmljay5zY3JlZW5YICsgYnJpY2sud2lkdGggKyB0aGlzLnJhZGl1c1xuICAgICAgdG91Y2ggPSB0cnVlXG4gICAgfVxuXG4gICAgYnJpY2sudG91Y2hCYWxsID0gdG91Y2hcblxuICAgIGlmKHRvdWNoKSB7XG4gICAgICBicmljay5kdXJhYmlsaXR5LS1cblxuICAgICAgaWYoYnJpY2suZHVyYWJpbGl0eSA9PT0gMClcbiAgICAgICAgdGhpcy5nYW1lLmJyaWNrcy5kZWxldGUoYnJpY2spXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBtb3ZlKCkge1xuICAgIHRoaXMueCArPSB0aGlzLnZlbG9jaXR5LnhcbiAgICB0aGlzLnkgKz0gdGhpcy52ZWxvY2l0eS55XG4gIH1cblxuICBwcml2YXRlIG9uRmFpbCgpIHtcbiAgICB0aGlzLmdhbWUuYmFsbHMuZGVsZXRlKHRoaXMpXG5cbiAgICB0aGlzLmdhbWUuaHAgLS07XG5cbiAgICBpZih0aGlzLmdhbWUuaHAgPD0gMCkgdGhpcy5nYW1lLm9uRmFpbCgpXG5cbiAgICBpZih0aGlzLmdhbWUuYmFsbHMuc2l6ZSA9PT0gMCl7XG4gICAgICB0aGlzLmdhbWUubGF1bmNoQmFsbCgpXG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWNrT3B0aW9ucyB7XG4gIHg6IG51bWJlclxuICB5OiBudW1iZXJcbiAgZHVyYWJpbGl0eTogbnVtYmVyXG59XG5cbmV4cG9ydCBjbGFzcyBCcmljayB7XG4gIGR1cmFiaWxpdHk6IG51bWJlclxuICB0b3VjaEJhbGwgPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZ2FtZTogZ2FtZS5HYW1lLFxuICAgIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBCcmlja09wdGlvbnNcbiAgKSB7XG4gICAgdGhpcy5kdXJhYmlsaXR5ID0gb3B0aW9ucy5kdXJhYmlsaXR5XG4gIH1cblxuICBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcih3aWR0aCAvIF8uR1JJRF9XSURUSClcbiAgfVxuXG4gIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy53aWR0aCAvIF8uQVNQRUNUX1JBVElPXG4gIH1cblxuICBnZXQgc2NyZWVuWCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueCAqIHRoaXMud2lkdGhcbiAgfVxuXG4gIGdldCBzY3JlZW5ZKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy55ICogdGhpcy5oZWlnaHRcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHN0cm9rZShfLkJBQ0tHUk9VTkRfQ09MT1IpXG4gICAgc3Ryb2tlV2VpZ2h0KHRoaXMudG91Y2hCYWxsID8gNCA6IDEpXG4gICAgZmlsbChcbiAgICAgIDI1NSxcbiAgICAgIDAsXG4gICAgICAwLFxuICAgICAgTWF0aC5mbG9vcihtYXAodGhpcy5kdXJhYmlsaXR5LCBfLk1BWF9EVVJBQklMSVRZLCAwLCAyNTUsIDApKVxuICAgIClcbiAgICByZWN0KHRoaXMuc2NyZWVuWCwgdGhpcy5zY3JlZW5ZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlKCkge1xuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge1xuXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJhbmRvbUJyaWNrKGdhbWU6IGdhbWUuR2FtZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiBCcmljayB7XG4gIHJldHVybiBuZXcgQnJpY2soZ2FtZSx7XG4gICAgeCxcbiAgICB5LFxuICAgIGR1cmFiaWxpdHk6IGZsb29yKHJhbmRvbShfLk1BWF9EVVJBQklMSVRZKSksXG4gIH0pXG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxyXG5cclxuaW1wb3J0ICogYXMgYmFyIGZyb20gXCIuL2JhclwiXHJcbmltcG9ydCAqIGFzIGJhbGwgZnJvbSBcIi4vYmFsbFwiXHJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcclxuXHJcbmV4cG9ydCBjbGFzcyBHYW1lIHtcclxuICBocCA9IF8uQkFTRV9IUFxyXG4gIGJhbGxzID0gbmV3IFNldDxiYWxsLkJhbGw+KClcclxuICBicmlja3MgPSBuZXcgU2V0PGJyaWNrLkJyaWNrPigpXHJcbiAgYmFyOiBiYXIuQmFyXHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvbkZhaWw6ICgpID0+IHVua25vd24pIHtcclxuICAgIGZvciAobGV0IHggPSAyOyB4IDwgXy5HUklEX1dJRFRIIC0gMjsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAyOyB5IDwgXy5HUklEX0hFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgY29uc3QgYiA9IGJyaWNrLmNyZWF0ZVJhbmRvbUJyaWNrKHRoaXMsIHgsIHkpXHJcbiAgICAgICAgaWYoYi5kdXJhYmlsaXR5ID4gMCkgdGhpcy5icmlja3MuYWRkKGIpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxhdW5jaEJhbGwoKVxyXG5cclxuICAgIHRoaXMuYmFyID0gbmV3IGJhci5CYXIodGhpcylcclxuICB9XHJcblxyXG4gIGRyYXcoKXtcclxuICAgIGJhY2tncm91bmQoLi4uXy5CQUNLR1JPVU5EX0NPTE9SKVxyXG5cclxuICAgIHRoaXMuYnJpY2tzLmZvckVhY2goKGIpID0+IGIuZHJhdygpKVxyXG4gICAgdGhpcy5iYWxscy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcclxuXHJcbiAgICB0aGlzLmJhci5kcmF3KClcclxuICB9XHJcblxyXG4gIGxhdW5jaEJhbGwoKSB7XHJcbiAgICB0aGlzLmJhbGxzLmFkZChuZXcgYmFsbC5CYWxsKHRoaXMpKVxyXG4gIH1cclxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQU8sTUFBTSxlQUFlLEtBQUs7QUFDMUIsTUFBTSxhQUFhO0FBQ25CLE1BQU0sY0FBYztBQUNwQixNQUFNLGlCQUFpQjtBQUN2QixNQUFNLG1CQUF3QixDQUFDLEdBQUcsR0FBRztBQUNyQyxNQUFNLGtCQUFrQjtBQUN4QixNQUFNLFVBQVU7OztBQ0poQixrQkFBVTtBQUFBLElBTWYsWUFBb0IsT0FBaUI7QUFBakI7QUFMcEIsZUFBSTtBQUNKLGVBQUksU0FBUztBQUNiLG1CQUFRLFFBQVE7QUFDaEIsb0JBQVMsS0FBSyxRQUFRO0FBQUE7QUFBQSxJQUl0QixPQUFPO0FBQ0wsV0FBSztBQUNMLGdCQUFVLEtBQUssR0FBRyxLQUFLO0FBQ3ZCO0FBQ0EsV0FBSyxJQUFJLElBQUk7QUFDYixXQUNHLEtBQUssUUFBUSxJQUFLLElBQ2xCLEtBQUssU0FBUyxJQUFLLElBQ3BCLEtBQUssT0FDTCxLQUFLLFFBQ0wsS0FBSyxTQUFTO0FBRWhCLGdCQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsS0FB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
