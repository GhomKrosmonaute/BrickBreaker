var app = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
  var GRID_WIDTH = 21;
  var GRID_HEIGHT = 8;
  var BACKGROUND_COLOR = [0, 0, 0];
  var BALL_BASE_SPEED = () => width / 150;
  var BALL_BASE_RADIUS = () => width * 7e-3;
  var BASE_EFFECT_DURATION = 3e3;
  var BASE_HP = 3;
  var DEBUG_MODE = false;
  var TAIL_LENGTH = 10;
  var FRAMERATE = 25;
  var NO_SMOOTH = true;
  var BRICK_BASE_COLOR = [255, 0, 0];

  // src/bar.ts
  var Bar = class {
    constructor(game2) {
      this.game = game2;
      this.x = width / 2;
      this.y = height * 1.1;
      this.width = width * 0.1;
      this.height = this.width / 4;
      this.touchTimes = 0;
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
          this.touchTimes++;
          if (this.touchTimes > 1)
            console.error("ball touch bar several times (" + this.touchTimes + ")");
          ball2.velocity.y = -abs(ball2.velocity.y);
          ball2.refreshAngle();
          if (ball2.x < this.x - this.width / 4) {
            ball2.angle -= map(ball2.x, this.x - this.width / 4, this.x - this.width / 2, 1, 15);
            ball2.angle = constrain(ball2.angle, -178, -2);
            ball2.refreshVelocity();
          }
          if (ball2.x > this.x + this.width / 4) {
            ball2.angle -= map(ball2.x, this.x + this.width / 4, this.x + this.width / 2, 1, 15);
            ball2.angle = constrain(ball2.angle, -178, -2);
            ball2.refreshVelocity();
          }
          if (ball2.x <= this.x - this.width / 2) {
            ball2.x = this.x - this.width / 2 - ball2.radius;
            ball2.velocity.x = -abs(ball2.velocity.x);
          } else if (ball2.x >= this.x + this.width / 2) {
            ball2.x = this.x + this.width / 2 + ball2.radius;
            ball2.velocity.x = abs(ball2.velocity.x);
          } else {
            ball2.y = this.y - this.height / 2 - ball2.radius;
          }
          ball2.velocity.y = -abs(ball2.velocity.y);
          ball2.refreshAngle();
        } else {
          this.touchTimes = 0;
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
      this.angle = 0;
      this.velocity = createVector();
      this.radius = BALL_BASE_RADIUS();
      this.speed = BALL_BASE_SPEED();
      this.tail = [];
      this.damages = 1;
      this.setRandomVelocity();
    }
    draw() {
      this.update();
      noStroke();
      for (const part of this.tail) {
        fill(map(this.tail.indexOf(part), 0, this.tail.length - 2, 0, 255));
        circle(part.x, part.y, map(this.tail.indexOf(part), 0, this.tail.length - 1, this.radius / 2, this.radius * 2));
      }
      fill(255);
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
      if (this.y + this.radius >= height && this.game.balls.size === 1) {
        this.onFail();
        this.game.temporary.effects.forEach((effect) => {
          if (effect.options.data.includes(this))
            effect.down = true;
        });
      }
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
        brick2.hit(this.damages);
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
      if (this.game.balls.size === 0) {
        this.game.launchBall();
      }
      this.game.hp--;
    }
  };

  // src/temporary.ts
  var TemporaryEffect = class {
    constructor(game2, options) {
      this.game = game2;
      this.down = false;
      this.options = __spreadProps(__spreadValues({}, options), {
        startAt: frameCount
      });
      this.options.data = options.up.bind(options)(options);
    }
    draw() {
      this.options.onDraw(this.options);
      this.update();
    }
    update() {
      var _a2, _b;
      if (this.options.startAt > frameCount + BASE_EFFECT_DURATION || ((_b = (_a2 = this.options).cancelCondition) == null ? void 0 : _b.call(_a2, this.options)) || this.down) {
        this.options.down.bind(this.options)(this.options);
        this.game.temporary.effects.delete(this);
      }
    }
  };
  var TemporaryEffectManager = class {
    constructor(game2) {
      this.game = game2;
      this.effects = new Set();
    }
    add(effect) {
      this.effects.add(effect);
    }
    draw() {
      this.effects.forEach((effect) => effect.draw());
    }
  };

  // src/item.ts
  var Item = class {
    constructor(on, onTrigger) {
      this.on = on;
      this.onTrigger = onTrigger;
    }
    trigger(brick2) {
      console.log("power:", brick2.options.item);
      this.onTrigger.bind(brick2)();
    }
  };
  var items = {
    bomb: new Item("broken", function() {
      Array.from(this.game.bricks).filter((brick2) => {
        return brick2 !== this && brick2.options.x > this.options.x - 1 && brick2.options.x < this.options.x + 1 && brick2.options.y > this.options.y - 1 && brick2.options.y < this.options.y + 1;
      }).forEach((brick2) => {
        brick2.hit(Math.max(1, ceil(this.game.level / 2)));
      });
    }),
    ballTemporarySpeedDown: new Item("broken", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) => fx.data.filter((ball2) => ball2.speed -= BALL_BASE_SPEED() / 2),
        down: (fx) => fx.data.forEach((ball2) => ball2.speed += BALL_BASE_SPEED() / 2),
        onDraw: (fx) => {
          fx.data.forEach((ball2) => {
            noStroke();
            fill(0, 0, 255, round(255 * 0.25));
            circle(ball2.x, ball2.y, ball2.radius * 2);
          });
        }
      }));
    }),
    ballTemporaryDamageUp: new Item("broken", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) => fx.data.filter((ball2) => ball2.damages++),
        down: (fx) => fx.data.forEach((ball2) => ball2.damages--),
        onDraw: (fx) => {
          fx.data.forEach((ball2) => {
            stroke(...BRICK_BASE_COLOR, Math.floor(map(ball2.damages, this.game.level, 0, 255, 0)));
            strokeWeight(round(ball2.radius / 5));
            noFill();
            circle(ball2.x, ball2.y, ball2.radius * 2);
          });
        }
      }));
    }),
    ballTemporarySizeUp: new Item("broken", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) => fx.data.filter((ball2) => ball2.radius += BALL_BASE_RADIUS() / 2),
        down: (fx) => fx.data.forEach((ball2) => ball2.radius -= BALL_BASE_RADIUS() / 2),
        onDraw: () => null
      }));
    }),
    ballTemporarySpeedUp: new Item("broken", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) => fx.data.filter((ball2) => ball2.speed += BALL_BASE_SPEED() / 2),
        down: (fx) => fx.data.forEach((ball2) => ball2.speed -= BALL_BASE_SPEED() / 2),
        onDraw: (fx) => {
          fx.data.forEach((ball2) => {
            noStroke();
            fill(255, 182, 0, round(255 * 0.25));
            circle(ball2.x, ball2.y, ball2.radius * 2);
          });
        }
      }));
    })
  };

  // src/brick.ts
  var Brick = class {
    constructor(game2, options) {
      this.game = game2;
      this.options = options;
      this.touchBall = false;
      this._durability = options.durability;
    }
    set durability(durability) {
      this._durability = durability;
      if (this._durability <= 0) {
        this.kill();
      }
    }
    get durability() {
      return this._durability;
    }
    get screenX() {
      return this.options.x * this.game.BRICK_WIDTH;
    }
    get screenY() {
      return this.options.y * this.game.BRICK_HEIGHT;
    }
    get item() {
      if (this.options.item !== null) {
        return items[this.options.item];
      }
      return null;
    }
    draw() {
      stroke(BACKGROUND_COLOR);
      strokeWeight(this.touchBall ? 4 : 1);
      fill(...BRICK_BASE_COLOR, Math.floor(map(this.durability, this.game.level, 0, 255, 0)));
      rect(this.screenX, this.screenY, this.game.BRICK_WIDTH, this.game.BRICK_HEIGHT, this.game.BRICK_HEIGHT / 4);
      if (this.options.item !== null) {
        noStroke();
        fill(255);
        circle(this.screenX + this.game.BRICK_WIDTH / 2, this.screenY + this.game.BRICK_HEIGHT / 2, this.game.BRICK_HEIGHT / 2);
      }
    }
    hit(damages) {
      var _a2;
      if (((_a2 = this.item) == null ? void 0 : _a2.on) === "touched")
        this.item.trigger(this);
      this.game.score += damages;
      this.durability -= damages;
    }
    kill() {
      var _a2;
      if (((_a2 = this.item) == null ? void 0 : _a2.on) === "broken") {
        this.item.trigger(this);
        this.options.item = null;
      }
      this.game.bricks.delete(this);
    }
  };

  // src/level.ts
  var levelShapes = [
    (x, y) => x > 2 && x < GRID_WIDTH - 3 && y > 2,
    (x, y) => x < 2 || x > GRID_WIDTH - 3 || y < 2 || y > GRID_HEIGHT - 3,
    (x, y) => x % 2 === 0 || y % 3 === 0
  ];
  var levelItems = [
    (game2) => {
      Object.keys(items).forEach((name) => {
        injectItems(game2, 3, name);
      });
    }
  ];
  function injectItems(game2, count, itemName) {
    for (let i = 0; i < count; i++) {
      let rand = random(Array.from(game2.bricks));
      while (rand.options.item !== null) {
        rand = random(Array.from(game2.bricks));
      }
      rand.options.item = itemName;
    }
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
      this.hpAndLevel();
      this.speed();
      this.game.bar.draw();
      this.game.bricks.forEach((b) => b.draw());
      this.game.balls.forEach((b) => b.draw());
      this.game.temporary.draw();
      if (this.game.bricks.size === 0) {
        this.game.level++;
        this.game.setGridShape();
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
    hpAndLevel() {
      fill(30);
      noStroke();
      textStyle("bold");
      textAlign(CENTER, CENTER);
      textSize(Math.round(width / 20));
      text(`Lvl.${this.game.level} - ${this.game.hp} hp`, width / 2, height * 0.68);
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
    title() {
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
      this.level = 1;
      this.finish = false;
      this._score = 0;
      this._highScore = Number((_a = localStorage.getItem("highScore")) != null ? _a : 0);
      this.BRICK_WIDTH = width / GRID_WIDTH;
      this.BRICK_HEIGHT = this.BRICK_WIDTH / ASPECT_RATIO;
      window.game = this;
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
      if (this.hp > 0)
        this.scenes.drawGame();
      else if (!this.finish)
        this.finish = true;
      else if (this.finish)
        this.scenes.drawGameOver();
      else
        this.scenes.title();
    }
    restart() {
      this.balls.clear();
      this.setGridShape();
      this.launchBall();
      this.bar = new Bar(this);
      this.scenes = new Scenes(this);
      this.temporary = new TemporaryEffectManager(this);
      this.hp = BASE_HP;
      this.level = 1;
      this.score = 0;
      this.finish = false;
      this.framerate = FRAMERATE;
    }
    launchBall() {
      const newBall = new Ball(this);
      this.balls.add(newBall);
      return newBall;
    }
    setGridShape() {
      this.bricks.clear();
      const levelShapeIndex = Math.floor((this.level - 1) % levelShapes.length);
      const levelItemsIndex = Math.floor((this.level - 1) % levelItems.length);
      for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
          if (levelShapes[levelShapeIndex](x, y)) {
            this.bricks.add(new Brick(this, {
              x,
              y,
              durability: this.level,
              item: null
            }));
          }
        }
      }
      levelItems[levelItemsIndex](this);
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
    frameRate(60);
    game = new Game();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvdGVtcG9yYXJ5LnRzIiwgInNyYy9pdGVtLnRzIiwgInNyYy9icmljay50cyIsICJzcmMvbGV2ZWwudHMiLCAic3JjL3NjZW5lcy50cyIsICJzcmMvZ2FtZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8vIEB0cy1jaGVja1xuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMvcDUvZ2xvYmFsLmQudHNcIiAvPlxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpXG5cbmxldCBnYW1lOiBHYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgd2luZG93LmlubmVyV2lkdGggfHwgMFxuICApXG4gIGNvbnN0IHdpbmRvd0hlaWdodCA9IE1hdGgubWF4KFxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsXG4gICAgd2luZG93LmlubmVySGVpZ2h0IHx8IDBcbiAgKVxuXG4gIGNvbnN0IF93aWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCB3aW5kb3dIZWlnaHQgKiBfLkFTUEVDVF9SQVRJTylcbiAgY29uc3QgX2hlaWdodCA9IF93aWR0aCAvIF8uQVNQRUNUX1JBVElPXG5cbiAgY3JlYXRlQ2FudmFzKF93aWR0aCwgX2hlaWdodClcblxuICBpZiAoXy5OT19TTU9PVEgpIG5vU21vb3RoKClcbiAgZnJhbWVSYXRlKDYwKVxuXG4gIGdhbWUgPSBuZXcgR2FtZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xuICBnYW1lLmRyYXcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9XG5leHBvcnQgZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fVxuIiwgImV4cG9ydCBjb25zdCBBU1BFQ1RfUkFUSU8gPSAxNiAvIDlcbmV4cG9ydCBjb25zdCBHUklEX1dJRFRIID0gMjFcbmV4cG9ydCBjb25zdCBHUklEX0hFSUdIVCA9IDhcbmV4cG9ydCBjb25zdCBCQUNLR1JPVU5EX0NPTE9SOiBSR0IgPSBbMCwgMCwgMF1cbmV4cG9ydCBjb25zdCBCQUxMX0JBU0VfU1BFRUQgPSAoKSA9PiB3aWR0aCAvIDE1MFxuZXhwb3J0IGNvbnN0IEJBTExfQkFTRV9SQURJVVMgPSAoKSA9PiB3aWR0aCAqIDAuMDA3XG5leHBvcnQgY29uc3QgQkFTRV9FRkZFQ1RfRFVSQVRJT04gPSAzMDAwXG5leHBvcnQgY29uc3QgQkFTRV9IUCA9IDNcbmV4cG9ydCBjb25zdCBERUJVR19NT0RFID0gZmFsc2VcbmV4cG9ydCBjb25zdCBUQUlMX0xFTkdUSCA9IDEwXG5leHBvcnQgY29uc3QgRlJBTUVSQVRFID0gMjVcbmV4cG9ydCBjb25zdCBOT19TTU9PVEggPSB0cnVlXG5leHBvcnQgY29uc3QgQlJJQ0tfQkFTRV9DT0xPUjogUkdCID0gWzI1NSwgMCwgMF1cbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgQmFyIHtcbiAgeCA9IHdpZHRoIC8gMlxuICB5ID0gaGVpZ2h0ICogMS4xXG4gIHdpZHRoID0gd2lkdGggKiAwLjFcbiAgaGVpZ2h0ID0gdGhpcy53aWR0aCAvIDRcbiAgdG91Y2hUaW1lcyA9IDBcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoNjAsIDYwLCAyMDApXG4gICAgcmVjdChcbiAgICAgICh0aGlzLndpZHRoIC8gMikgKiAtMSxcbiAgICAgICh0aGlzLmhlaWdodCAvIDIpICogLTEsXG4gICAgICB0aGlzLndpZHRoLFxuICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICB0aGlzLmhlaWdodFxuICAgIClcbiAgICBmaWxsKDYwLCAyMDAsIDI1NSlcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyA0KSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGggLyAyLFxuICAgICAgdGhpcy5oZWlnaHRcbiAgICApXG4gICAgdHJhbnNsYXRlKC10aGlzLngsIC10aGlzLnkpXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLm1vdmUoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge1xuICAgIHRoaXMuZ2FtZS5iYWxscy5mb3JFYWNoKChiYWxsKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzID4gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzIDwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueCArIGJhbGwucmFkaXVzID4gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgJiZcbiAgICAgICAgYmFsbC54IC0gYmFsbC5yYWRpdXMgPCB0aGlzLnggKyB0aGlzLndpZHRoIC8gMlxuICAgICAgKSB7XG4gICAgICAgIHRoaXMudG91Y2hUaW1lcysrXG5cbiAgICAgICAgaWYgKHRoaXMudG91Y2hUaW1lcyA+IDEpXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIFwiYmFsbCB0b3VjaCBiYXIgc2V2ZXJhbCB0aW1lcyAoXCIgKyB0aGlzLnRvdWNoVGltZXMgKyBcIilcIlxuICAgICAgICAgIClcblxuICAgICAgICBiYWxsLnZlbG9jaXR5LnkgPSAtYWJzKGJhbGwudmVsb2NpdHkueSlcblxuICAgICAgICBiYWxsLnJlZnJlc2hBbmdsZSgpXG5cbiAgICAgICAgaWYgKGJhbGwueCA8IHRoaXMueCAtIHRoaXMud2lkdGggLyA0KSB7XG4gICAgICAgICAgYmFsbC5hbmdsZSAtPSBtYXAoXG4gICAgICAgICAgICBiYWxsLngsXG4gICAgICAgICAgICB0aGlzLnggLSB0aGlzLndpZHRoIC8gNCxcbiAgICAgICAgICAgIHRoaXMueCAtIHRoaXMud2lkdGggLyAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDE1XG4gICAgICAgICAgKVxuXG4gICAgICAgICAgYmFsbC5hbmdsZSA9IGNvbnN0cmFpbihiYWxsLmFuZ2xlLCAtMTc4LCAtMilcblxuICAgICAgICAgIGJhbGwucmVmcmVzaFZlbG9jaXR5KClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWxsLnggPiB0aGlzLnggKyB0aGlzLndpZHRoIC8gNCkge1xuICAgICAgICAgIGJhbGwuYW5nbGUgLT0gbWFwKFxuICAgICAgICAgICAgYmFsbC54LFxuICAgICAgICAgICAgdGhpcy54ICsgdGhpcy53aWR0aCAvIDQsXG4gICAgICAgICAgICB0aGlzLnggKyB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxNVxuICAgICAgICAgIClcblxuICAgICAgICAgIGJhbGwuYW5nbGUgPSBjb25zdHJhaW4oYmFsbC5hbmdsZSwgLTE3OCwgLTIpXG5cbiAgICAgICAgICBiYWxsLnJlZnJlc2hWZWxvY2l0eSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBkXHUwMEU5Y2FsZXIgbGEgYmFsbGUgaG9ycyBkZSBsYSBiYXIgc2kgZWxsZSBlc3QgdHJvcCBhIGRyb2l0ZSBvdSBhIGdhdWNoZVxuICAgICAgICBpZiAoYmFsbC54IDw9IHRoaXMueCAtIHRoaXMud2lkdGggLyAyKSB7XG4gICAgICAgICAgYmFsbC54ID0gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgLSBiYWxsLnJhZGl1c1xuICAgICAgICAgIGJhbGwudmVsb2NpdHkueCA9IC1hYnMoYmFsbC52ZWxvY2l0eS54KVxuICAgICAgICB9IGVsc2UgaWYgKGJhbGwueCA+PSB0aGlzLnggKyB0aGlzLndpZHRoIC8gMikge1xuICAgICAgICAgIGJhbGwueCA9IHRoaXMueCArIHRoaXMud2lkdGggLyAyICsgYmFsbC5yYWRpdXNcbiAgICAgICAgICBiYWxsLnZlbG9jaXR5LnggPSBhYnMoYmFsbC52ZWxvY2l0eS54KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhbGwueSA9IHRoaXMueSAtIHRoaXMuaGVpZ2h0IC8gMiAtIGJhbGwucmFkaXVzXG4gICAgICAgIH1cblxuICAgICAgICBiYWxsLnZlbG9jaXR5LnkgPSAtYWJzKGJhbGwudmVsb2NpdHkueSlcblxuICAgICAgICBiYWxsLnJlZnJlc2hBbmdsZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRvdWNoVGltZXMgPSAwXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgbW92ZSgpIHtcbiAgICBjb25zdCB4ID1cbiAgICAgIHRoaXMueCArIChtb3VzZVggLSB0aGlzLngpIC8gNCAvKiBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscylbMF0/LnggPz8gKi9cbiAgICBjb25zdCB5ID0gdGhpcy55ICsgKG1vdXNlWSAtIHRoaXMueSkgLyA0XG5cbiAgICB0aGlzLnggPSBtaW4obWF4KHgsIHRoaXMud2lkdGggLyAyKSwgd2lkdGggLSB0aGlzLndpZHRoIC8gMilcbiAgICB0aGlzLnkgPSBtaW4obWF4KHksIGhlaWdodCAqIDAuOSksIGhlaWdodCAtIHRoaXMuaGVpZ2h0IC8gMilcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCJcbmltcG9ydCAqIGFzIHRlbXBvcmFyeSBmcm9tIFwiLi90ZW1wb3JhcnlcIlxuXG5leHBvcnQgY2xhc3MgQmFsbCB7XG4gIHggPSB3aWR0aCAvIDJcbiAgeSA9IGhlaWdodCAqIDAuOFxuICBhbmdsZSA9IDBcbiAgdmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoKVxuICByYWRpdXMgPSBfLkJBTExfQkFTRV9SQURJVVMoKVxuICBzcGVlZCA9IF8uQkFMTF9CQVNFX1NQRUVEKClcbiAgdGFpbDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9W10gPSBbXVxuICBkYW1hZ2VzID0gMVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBnYW1lOiBnYW1lLkdhbWUpIHtcbiAgICB0aGlzLnNldFJhbmRvbVZlbG9jaXR5KClcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIG5vU3Ryb2tlKClcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy50YWlsKSB7XG4gICAgICBmaWxsKG1hcCh0aGlzLnRhaWwuaW5kZXhPZihwYXJ0KSwgMCwgdGhpcy50YWlsLmxlbmd0aCAtIDIsIDAsIDI1NSkpXG4gICAgICBjaXJjbGUoXG4gICAgICAgIHBhcnQueCxcbiAgICAgICAgcGFydC55LFxuICAgICAgICBtYXAoXG4gICAgICAgICAgdGhpcy50YWlsLmluZGV4T2YocGFydCksXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnRhaWwubGVuZ3RoIC0gMSxcbiAgICAgICAgICB0aGlzLnJhZGl1cyAvIDIsXG4gICAgICAgICAgdGhpcy5yYWRpdXMgKiAyXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgZmlsbCgyNTUpXG4gICAgY2lyY2xlKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cyAqIDIpXG4gICAgaWYgKF8uREVCVUdfTU9ERSlcbiAgICAgIHRleHQoXG4gICAgICAgIGBzcGVlZDogJHt0aGlzLnNwZWVkfVxcbmFuZ2xlOiAke01hdGgucm91bmQoXG4gICAgICAgICAgdGhpcy5hbmdsZVxuICAgICAgICApfVxcbnZlbG9jaXR5OlxcbiAgIHg9JHt0aGlzLnZlbG9jaXR5Lnh9XFxuICAgIHk9JHt0aGlzLnZlbG9jaXR5Lnl9YCxcbiAgICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMsXG4gICAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzXG4gICAgICApXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLnNhdmUoKVxuICAgIHRoaXMuY2hlY2tGYWlsKClcbiAgICB0aGlzLmJyaWNrcygpXG4gICAgdGhpcy5hY2NlbGVyYXRlKClcbiAgICB0aGlzLm1vdmUoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHNldFJhbmRvbVZlbG9jaXR5KCkge1xuICAgIHRoaXMuc2V0QW5nbGUocmFuZG9tKC0xNzksIC0xKSlcblxuICAgIGlmICh0aGlzLnZlbG9jaXR5LnkgPiAwKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnkgKj0gLTFcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cbiAgfVxuXG4gIHNldEFuZ2xlKGFuZ2xlOiBudW1iZXIpIHtcbiAgICB0aGlzLmFuZ2xlID0gYW5nbGVcblxuICAgIHRoaXMucmVmcmVzaFZlbG9jaXR5KClcbiAgfVxuXG4gIHJlZnJlc2hWZWxvY2l0eSgpIHtcbiAgICB0aGlzLnZlbG9jaXR5LnNldChjb3ModGhpcy5hbmdsZSksIHNpbih0aGlzLmFuZ2xlKSkubXVsdCh0aGlzLnNwZWVkKVxuXG4gICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICB9XG5cbiAgcmVmcmVzaEFuZ2xlKCkge1xuICAgIGNvbnN0IGEgPSBjcmVhdGVWZWN0b3IoKVxuICAgIGNvbnN0IGIgPSB0aGlzLnZlbG9jaXR5XG5cbiAgICB0aGlzLmFuZ2xlID0gZGVncmVlcyhhdGFuMihiLnkgLSBhLnksIGIueCAtIGEueCkpXG4gIH1cblxuICBzYXZlKCkge1xuICAgIHRoaXMudGFpbC5wdXNoKHtcbiAgICAgIHg6IHRoaXMueCxcbiAgICAgIHk6IHRoaXMueSxcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMudGFpbC5sZW5ndGggPiBfLlRBSUxfTEVOR1RIKSB0aGlzLnRhaWwuc2hpZnQoKVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0ZhaWwoKSB7XG4gICAgaWYgKHRoaXMueSArIHRoaXMucmFkaXVzID49IGhlaWdodCAmJiB0aGlzLmdhbWUuYmFsbHMuc2l6ZSA9PT0gMSkge1xuICAgICAgdGhpcy5vbkZhaWwoKVxuICAgICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5lZmZlY3RzLmZvckVhY2goKGVmZmVjdDogdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdDxCYWxsW10+KSA9PiB7XG4gICAgICAgIGlmKGVmZmVjdC5vcHRpb25zLmRhdGEuaW5jbHVkZXModGhpcykpIGVmZmVjdC5kb3duID0gdHJ1ZVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGJvdW5kcygpIHtcbiAgICBpZiAodGhpcy54ICsgdGhpcy5yYWRpdXMgPj0gd2lkdGggfHwgdGhpcy54IC0gdGhpcy5yYWRpdXMgPD0gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy55IC0gdGhpcy5yYWRpdXMgPD0gMCkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGJyaWNrcygpIHtcbiAgICBjb25zdCBicmljayA9IEFycmF5LmZyb20odGhpcy5nYW1lLmJyaWNrcykuc29ydCgoYSwgYikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGlzdChcbiAgICAgICAgICBhLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggLyAyLFxuICAgICAgICAgIGEuc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyLFxuICAgICAgICAgIHRoaXMueCxcbiAgICAgICAgICB0aGlzLnlcbiAgICAgICAgKSAtXG4gICAgICAgIGRpc3QoXG4gICAgICAgICAgYi5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMixcbiAgICAgICAgICBiLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUIC8gMixcbiAgICAgICAgICB0aGlzLngsXG4gICAgICAgICAgdGhpcy55XG4gICAgICAgIClcbiAgICAgIClcbiAgICB9KVswXVxuXG4gICAgaWYgKCFicmljaykgcmV0dXJuXG5cbiAgICBjb25zdCBpbm5lclggPVxuICAgICAgdGhpcy54ID4gYnJpY2suc2NyZWVuWCAmJiB0aGlzLnggPCBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIXG4gICAgY29uc3QgaW5uZXJZID1cbiAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzID4gYnJpY2suc2NyZWVuWSAmJlxuICAgICAgdGhpcy55IC0gdGhpcy5yYWRpdXMgPCBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVFxuXG4gICAgbGV0IHRvdWNoID0gZmFsc2VcblxuICAgIC8vIHRvcFxuICAgIGlmIChcbiAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzID4gYnJpY2suc2NyZWVuWSAmJlxuICAgICAgdGhpcy55IDwgYnJpY2suc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSAtIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gYm90dG9tXG4gICAgZWxzZSBpZiAoXG4gICAgICB0aGlzLnkgLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUICYmXG4gICAgICB0aGlzLnkgPiBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDIgJiZcbiAgICAgIGlubmVyWFxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IC0xXG4gICAgICB0aGlzLnkgPSBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCArIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgLy8gbGVmdFxuICAgIGVsc2UgaWYgKFxuICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMgPiBicmljay5zY3JlZW5YICYmXG4gICAgICB0aGlzLnggPCBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMiAmJlxuICAgICAgaW5uZXJZXG4gICAgKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnggKj0gLTFcbiAgICAgIHRoaXMueCA9IGJyaWNrLnNjcmVlblggLSB0aGlzLnJhZGl1c1xuXG4gICAgICB0b3VjaCA9IHRydWVcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cblxuICAgIC8vIHJpZ2h0XG4gICAgZWxzZSBpZiAoXG4gICAgICB0aGlzLnggLSB0aGlzLnJhZGl1cyA8IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggJiZcbiAgICAgIHRoaXMueCA+IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggLyAyICYmXG4gICAgICBpbm5lcllcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuICAgICAgdGhpcy54ID0gYnJpY2suc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCArIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgYnJpY2sudG91Y2hCYWxsID0gdG91Y2hcblxuICAgIGlmICh0b3VjaCkgYnJpY2suaGl0KHRoaXMuZGFtYWdlcylcbiAgfVxuXG4gIHByaXZhdGUgYWNjZWxlcmF0ZSgpIHtcbiAgICB0aGlzLnNwZWVkID0gbWFwKFxuICAgICAgdGhpcy5nYW1lLnNjb3JlLFxuICAgICAgMCxcbiAgICAgIDUwMCxcbiAgICAgIF8uQkFMTF9CQVNFX1NQRUVEKCksXG4gICAgICBNYXRoLm1pbihcbiAgICAgICAgXy5CQUxMX0JBU0VfU1BFRUQoKSAqIDEwLFxuICAgICAgICBNYXRoLm1pbih0aGlzLmdhbWUuQlJJQ0tfSEVJR0hULCB0aGlzLmdhbWUuQlJJQ0tfV0lEVEgpXG4gICAgICApXG4gICAgKVxuICB9XG5cbiAgbW92ZSgpIHtcbiAgICB0aGlzLnggKz0gdGhpcy52ZWxvY2l0eS54XG4gICAgdGhpcy55ICs9IHRoaXMudmVsb2NpdHkueVxuICB9XG5cbiAgcHJpdmF0ZSBvbkZhaWwoKSB7XG4gICAgdGhpcy5nYW1lLmJhbGxzLmRlbGV0ZSh0aGlzKVxuXG4gICAgaWYgKHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmdhbWUubGF1bmNoQmFsbCgpXG4gICAgfVxuXG4gICAgdGhpcy5nYW1lLmhwLS1cbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0IHR5cGUgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgVGVtcG9yYXJ5RWZmZWN0PERhdGE+IHtcbiAgcHVibGljIG9wdGlvbnM6IFRlbXBvcmFyeUVmZmVjdE9wdGlvbnM8RGF0YT5cbiAgcHVibGljIGRvd24gPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBnYW1lOiBnYW1lLkdhbWUsXG4gICAgb3B0aW9uczogUGljazxcbiAgICAgIFRlbXBvcmFyeUVmZmVjdE9wdGlvbnM8RGF0YT4sXG4gICAgICBcInVwXCIgfCBcImRvd25cIiB8IFwib25EcmF3XCIgfCBcImRhdGFcIiB8IFwiY2FuY2VsQ29uZGl0aW9uXCJcbiAgICA+XG4gICkge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzdGFydEF0OiBmcmFtZUNvdW50LFxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5kYXRhID0gb3B0aW9ucy51cC5iaW5kKG9wdGlvbnMpKG9wdGlvbnMpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHRoaXMub3B0aW9ucy5vbkRyYXcodGhpcy5vcHRpb25zKVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLm9wdGlvbnMuc3RhcnRBdCA+IGZyYW1lQ291bnQgKyBfLkJBU0VfRUZGRUNUX0RVUkFUSU9OIHx8XG4gICAgICB0aGlzLm9wdGlvbnMuY2FuY2VsQ29uZGl0aW9uPy4odGhpcy5vcHRpb25zKSB8fFxuICAgICAgdGhpcy5kb3duXG4gICAgKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZG93bi5iaW5kKHRoaXMub3B0aW9ucykodGhpcy5vcHRpb25zKVxuICAgICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5lZmZlY3RzLmRlbGV0ZSh0aGlzKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBvcmFyeUVmZmVjdE9wdGlvbnM8RGF0YT4ge1xuICB1cDogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPikgPT4gRGF0YVxuICBkb3duOiAoZWZmZWN0OiBUZW1wb3JhcnlFZmZlY3RPcHRpb25zPERhdGE+KSA9PiB1bmtub3duXG4gIG9uRHJhdzogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPikgPT4gdW5rbm93blxuICBjYW5jZWxDb25kaXRpb24/OiAoZWZmZWN0OiBUZW1wb3JhcnlFZmZlY3RPcHRpb25zPERhdGE+KSA9PiBib29sZWFuXG4gIGRhdGE6IERhdGFcbiAgc3RhcnRBdDogbnVtYmVyXG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wb3JhcnlFZmZlY3RNYW5hZ2VyIHtcbiAgZWZmZWN0cyA9IG5ldyBTZXQ8VGVtcG9yYXJ5RWZmZWN0PGFueT4+KClcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2FtZTogZ2FtZS5HYW1lKSB7fVxuXG4gIGFkZDxEYXRhPihlZmZlY3Q6IFRlbXBvcmFyeUVmZmVjdDxEYXRhPikge1xuICAgIHRoaXMuZWZmZWN0cy5hZGQoZWZmZWN0KVxuICB9XG5cbiAgZHJhdygpIHtcbiAgICB0aGlzLmVmZmVjdHMuZm9yRWFjaCgoZWZmZWN0KSA9PiBlZmZlY3QuZHJhdygpKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBiYWxsIGZyb20gXCIuL2JhbGxcIlxuaW1wb3J0ICogYXMgYnJpY2sgZnJvbSBcIi4vYnJpY2tcIlxuaW1wb3J0ICogYXMgdGVtcG9yYXJ5IGZyb20gXCIuL3RlbXBvcmFyeVwiXG5cbmV4cG9ydCB0eXBlIEl0ZW1OYW1lID0ga2V5b2YgdHlwZW9mIGl0ZW1zXG5cbmV4cG9ydCBjbGFzcyBJdGVtIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIG9uOiBicmljay5FdmVudE5hbWUsXG4gICAgcHJpdmF0ZSBvblRyaWdnZXI6ICh0aGlzOiBicmljay5CcmljaykgPT4gdW5rbm93blxuICApIHt9XG5cbiAgdHJpZ2dlcihicmljazogYnJpY2suQnJpY2spIHtcbiAgICBjb25zb2xlLmxvZyhcInBvd2VyOlwiLCBicmljay5vcHRpb25zLml0ZW0pXG4gICAgdGhpcy5vblRyaWdnZXIuYmluZChicmljaykoKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpdGVtcyA9IHtcbiAgLy8gYm9udXNcbiAgYm9tYjogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge1xuICAgIEFycmF5LmZyb20odGhpcy5nYW1lLmJyaWNrcylcbiAgICAgIC5maWx0ZXIoKGJyaWNrKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgYnJpY2sgIT09IHRoaXMgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnggPiB0aGlzLm9wdGlvbnMueCAtIDEgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnggPCB0aGlzLm9wdGlvbnMueCArIDEgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnkgPiB0aGlzLm9wdGlvbnMueSAtIDEgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnkgPCB0aGlzLm9wdGlvbnMueSArIDFcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICAgIC5mb3JFYWNoKChicmljaykgPT4ge1xuICAgICAgICBicmljay5oaXQoTWF0aC5tYXgoMSwgY2VpbCh0aGlzLmdhbWUubGV2ZWwgLyAyKSkpXG4gICAgICB9KVxuICB9KSxcbiAgYmFsbFRlbXBvcmFyeVNwZWVkRG93bjogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuYWRkKFxuICAgICAgbmV3IHRlbXBvcmFyeS5UZW1wb3JhcnlFZmZlY3QodGhpcy5nYW1lLCB7XG4gICAgICAgIGRhdGE6IEFycmF5LmZyb20odGhpcy5nYW1lLmJhbGxzKS5zbGljZSgwKSxcbiAgICAgICAgY2FuY2VsQ29uZGl0aW9uOiAoZngpID0+IHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwLFxuICAgICAgICB1cDogKGZ4KSA9PlxuICAgICAgICAgIGZ4LmRhdGEuZmlsdGVyKFxuICAgICAgICAgICAgKGJhbGwpID0+IChiYWxsLnNwZWVkIC09IF8uQkFMTF9CQVNFX1NQRUVEKCkgLyAyKSA/PyB0cnVlXG4gICAgICAgICAgKSxcbiAgICAgICAgZG93bjogKGZ4KSA9PlxuICAgICAgICAgIGZ4LmRhdGEuZm9yRWFjaCgoYmFsbCkgPT4gKGJhbGwuc3BlZWQgKz0gXy5CQUxMX0JBU0VfU1BFRUQoKSAvIDIpKSxcbiAgICAgICAgb25EcmF3OiAoZngpID0+IHtcbiAgICAgICAgICBmeC5kYXRhLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKClcbiAgICAgICAgICAgIGZpbGwoMCwgMCwgMjU1LCByb3VuZCgyNTUgKiAwLjI1KSlcbiAgICAgICAgICAgIGNpcmNsZShiYWxsLngsIGJhbGwueSwgYmFsbC5yYWRpdXMgKiAyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIClcbiAgfSksXG4gIGJhbGxUZW1wb3JhcnlEYW1hZ2VVcDogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuYWRkKFxuICAgICAgbmV3IHRlbXBvcmFyeS5UZW1wb3JhcnlFZmZlY3QodGhpcy5nYW1lLCB7XG4gICAgICAgIGRhdGE6IEFycmF5LmZyb20odGhpcy5nYW1lLmJhbGxzKS5zbGljZSgwKSxcbiAgICAgICAgY2FuY2VsQ29uZGl0aW9uOiAoZngpID0+IHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwLFxuICAgICAgICB1cDogKGZ4KSA9PiBmeC5kYXRhLmZpbHRlcigoYmFsbCkgPT4gYmFsbC5kYW1hZ2VzKysgPz8gdHJ1ZSksXG4gICAgICAgIGRvd246IChmeCkgPT4gZnguZGF0YS5mb3JFYWNoKChiYWxsKSA9PiBiYWxsLmRhbWFnZXMtLSksXG4gICAgICAgIG9uRHJhdzogKGZ4KSA9PiB7XG4gICAgICAgICAgZnguZGF0YS5mb3JFYWNoKChiYWxsKSA9PiB7XG4gICAgICAgICAgICBzdHJva2UoXG4gICAgICAgICAgICAgIC4uLl8uQlJJQ0tfQkFTRV9DT0xPUixcbiAgICAgICAgICAgICAgTWF0aC5mbG9vcihtYXAoYmFsbC5kYW1hZ2VzLCB0aGlzLmdhbWUubGV2ZWwsIDAsIDI1NSwgMCkpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBzdHJva2VXZWlnaHQocm91bmQoYmFsbC5yYWRpdXMgLyA1KSlcbiAgICAgICAgICAgIG5vRmlsbCgpXG4gICAgICAgICAgICBjaXJjbGUoYmFsbC54LCBiYWxsLnksIGJhbGwucmFkaXVzICogMilcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApXG4gIH0pLFxuICBiYWxsVGVtcG9yYXJ5U2l6ZVVwOiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5hZGQoXG4gICAgICBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdCh0aGlzLmdhbWUsIHtcbiAgICAgICAgZGF0YTogQXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpLnNsaWNlKDApLFxuICAgICAgICBjYW5jZWxDb25kaXRpb246IChmeCkgPT4gdGhpcy5nYW1lLmJhbGxzLnNpemUgPT09IDAsXG4gICAgICAgIHVwOiAoZngpID0+XG4gICAgICAgICAgZnguZGF0YS5maWx0ZXIoXG4gICAgICAgICAgICAoYmFsbCkgPT4gKGJhbGwucmFkaXVzICs9IF8uQkFMTF9CQVNFX1JBRElVUygpIC8gMikgPz8gdHJ1ZVxuICAgICAgICAgICksXG4gICAgICAgIGRvd246IChmeCkgPT5cbiAgICAgICAgICBmeC5kYXRhLmZvckVhY2goKGJhbGwpID0+IChiYWxsLnJhZGl1cyAtPSBfLkJBTExfQkFTRV9SQURJVVMoKSAvIDIpKSxcbiAgICAgICAgb25EcmF3OiAoKSA9PiBudWxsLFxuICAgICAgfSlcbiAgICApXG4gIH0pLFxuICAvL2JhclRlbXBvcmFyeUd1bjogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLFxuICAvLyBiYWxsRHVwbGljYXRpb246IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHtcbiAgLy8gICB0aGlzLmdhbWUuYmFsbHMuZm9yRWFjaCgoYmFsbCkgPT4ge1xuICAvLyAgICAgY29uc3QgbmV3QmFsbCA9IHRoaXMuZ2FtZS5sYXVuY2hCYWxsKClcbiAgLy9cbiAgLy8gICAgIG5ld0JhbGwueCA9IGJhbGwueFxuICAvLyAgICAgbmV3QmFsbC55ID0gYmFsbC55XG4gIC8vICAgfSlcbiAgLy8gfSksXG4gIC8vYmFyRXhwYW5zaW9uOiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7fSksXG4gIC8vc2VjdXJpdHk6IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSwgLy8gYm90dG9tIHNoaWVsZFxuXG4gIC8vIG1hbHVzXG4gIGJhbGxUZW1wb3JhcnlTcGVlZFVwOiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5hZGQoXG4gICAgICBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdCh0aGlzLmdhbWUsIHtcbiAgICAgICAgZGF0YTogQXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpLnNsaWNlKDApLFxuICAgICAgICBjYW5jZWxDb25kaXRpb246IChmeCkgPT4gdGhpcy5nYW1lLmJhbGxzLnNpemUgPT09IDAsXG4gICAgICAgIHVwOiAoZngpID0+XG4gICAgICAgICAgZnguZGF0YS5maWx0ZXIoXG4gICAgICAgICAgICAoYmFsbCkgPT4gKGJhbGwuc3BlZWQgKz0gXy5CQUxMX0JBU0VfU1BFRUQoKSAvIDIpID8/IHRydWVcbiAgICAgICAgICApLFxuICAgICAgICBkb3duOiAoZngpID0+XG4gICAgICAgICAgZnguZGF0YS5mb3JFYWNoKChiYWxsKSA9PiAoYmFsbC5zcGVlZCAtPSBfLkJBTExfQkFTRV9TUEVFRCgpIC8gMikpLFxuICAgICAgICBvbkRyYXc6IChmeCkgPT4ge1xuICAgICAgICAgIGZ4LmRhdGEuZm9yRWFjaCgoYmFsbCkgPT4ge1xuICAgICAgICAgICAgbm9TdHJva2UoKVxuICAgICAgICAgICAgZmlsbCgyNTUsIDE4MiwgMCwgcm91bmQoMjU1ICogMC4yNSkpXG4gICAgICAgICAgICBjaXJjbGUoYmFsbC54LCBiYWxsLnksIGJhbGwucmFkaXVzICogMilcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApXG4gIH0pLFxuICAvL2JhclRlbXBvcmFyeUludmlzaWJpbGl0eTogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLFxuICAvL2JyaWNrVGVtcG9yYXJ5SW52aXNpYmlsaXR5OiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7fSksXG4gIC8vYmFsbFRlbXBvcmFyeURhbWFnZURvd246IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgLy9iYXJDb250cmFjdGlvbjogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLFxuICAvL2JyaWNrRHVyYWJpbGl0eVVwOiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7fSlcbn1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGl0ZW0gZnJvbSBcIi4vaXRlbVwiXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuaW1wb3J0ICogYXMgbGV2ZWwgZnJvbSBcIi4vbGV2ZWxcIlxuXG5leHBvcnQgdHlwZSBFdmVudE5hbWUgPSBcImJyb2tlblwiIHwgXCJ0b3VjaGVkXCJcblxuZXhwb3J0IGludGVyZmFjZSBCcmlja09wdGlvbnMge1xuICB4OiBudW1iZXJcbiAgeTogbnVtYmVyXG4gIGR1cmFiaWxpdHk6IG51bWJlclxuICBpdGVtOiBpdGVtLkl0ZW1OYW1lIHwgbnVsbFxufVxuXG5leHBvcnQgY2xhc3MgQnJpY2sge1xuICBwcml2YXRlIF9kdXJhYmlsaXR5OiBudW1iZXJcbiAgdG91Y2hCYWxsID0gZmFsc2VcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2FtZTogZ2FtZS5HYW1lLCBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogQnJpY2tPcHRpb25zKSB7XG4gICAgdGhpcy5fZHVyYWJpbGl0eSA9IG9wdGlvbnMuZHVyYWJpbGl0eVxuICB9XG5cbiAgc2V0IGR1cmFiaWxpdHkoZHVyYWJpbGl0eTogbnVtYmVyKSB7XG4gICAgdGhpcy5fZHVyYWJpbGl0eSA9IGR1cmFiaWxpdHlcbiAgICBpZiAodGhpcy5fZHVyYWJpbGl0eSA8PSAwKSB7XG4gICAgICB0aGlzLmtpbGwoKVxuICAgIH1cbiAgfVxuXG4gIGdldCBkdXJhYmlsaXR5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2R1cmFiaWxpdHlcbiAgfVxuXG4gIGdldCBzY3JlZW5YKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54ICogdGhpcy5nYW1lLkJSSUNLX1dJRFRIXG4gIH1cblxuICBnZXQgc2NyZWVuWSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueSAqIHRoaXMuZ2FtZS5CUklDS19IRUlHSFRcbiAgfVxuXG4gIGdldCBpdGVtKCk6IGl0ZW0uSXRlbSB8IG51bGwge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaXRlbSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGl0ZW0uaXRlbXNbdGhpcy5vcHRpb25zLml0ZW1dXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgc3Ryb2tlKF8uQkFDS0dST1VORF9DT0xPUilcbiAgICBzdHJva2VXZWlnaHQodGhpcy50b3VjaEJhbGwgPyA0IDogMSlcbiAgICBmaWxsKFxuICAgICAgLi4uXy5CUklDS19CQVNFX0NPTE9SLFxuICAgICAgTWF0aC5mbG9vcihtYXAodGhpcy5kdXJhYmlsaXR5LCB0aGlzLmdhbWUubGV2ZWwsIDAsIDI1NSwgMCkpXG4gICAgKVxuICAgIHJlY3QoXG4gICAgICB0aGlzLnNjcmVlblgsXG4gICAgICB0aGlzLnNjcmVlblksXG4gICAgICB0aGlzLmdhbWUuQlJJQ0tfV0lEVEgsXG4gICAgICB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hULFxuICAgICAgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDRcbiAgICApXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pdGVtICE9PSBudWxsKSB7XG4gICAgICBub1N0cm9rZSgpXG4gICAgICBmaWxsKDI1NSlcbiAgICAgIGNpcmNsZShcbiAgICAgICAgdGhpcy5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMixcbiAgICAgICAgdGhpcy5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDIsXG4gICAgICAgIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgaGl0KGRhbWFnZXM6IG51bWJlcikge1xuICAgIGlmICh0aGlzLml0ZW0/Lm9uID09PSBcInRvdWNoZWRcIikgdGhpcy5pdGVtLnRyaWdnZXIodGhpcylcblxuICAgIHRoaXMuZ2FtZS5zY29yZSArPSBkYW1hZ2VzXG4gICAgdGhpcy5kdXJhYmlsaXR5IC09IGRhbWFnZXNcbiAgfVxuXG4gIGtpbGwoKSB7XG4gICAgaWYgKHRoaXMuaXRlbT8ub24gPT09IFwiYnJva2VuXCIpIHtcbiAgICAgIHRoaXMuaXRlbS50cmlnZ2VyKHRoaXMpXG4gICAgICB0aGlzLm9wdGlvbnMuaXRlbSA9IG51bGxcbiAgICB9XG5cbiAgICB0aGlzLmdhbWUuYnJpY2tzLmRlbGV0ZSh0aGlzKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuaW1wb3J0ICogYXMgaXRlbSBmcm9tIFwiLi9pdGVtXCJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcblxuZXhwb3J0IHR5cGUgTGV2ZWxTaGFwZSA9ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gYm9vbGVhblxuZXhwb3J0IHR5cGUgTGV2ZWxJdGVtcyA9IChnYW1lOiBnYW1lLkdhbWUpID0+IHVua25vd25cblxuZXhwb3J0IGNvbnN0IGxldmVsU2hhcGVzOiBMZXZlbFNoYXBlW10gPSBbXG4gICh4LCB5KSA9PiB4ID4gMiAmJiB4IDwgXy5HUklEX1dJRFRIIC0gMyAmJiB5ID4gMixcbiAgKHgsIHkpID0+IHggPCAyIHx8IHggPiBfLkdSSURfV0lEVEggLSAzIHx8IHkgPCAyIHx8IHkgPiBfLkdSSURfSEVJR0hUIC0gMyxcbiAgKHgsIHkpID0+IHggJSAyID09PSAwIHx8IHkgJSAzID09PSAwLFxuXVxuXG5leHBvcnQgY29uc3QgbGV2ZWxJdGVtczogTGV2ZWxJdGVtc1tdID0gW1xuICAoZ2FtZSkgPT4ge1xuICAgIE9iamVjdC5rZXlzKGl0ZW0uaXRlbXMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIGluamVjdEl0ZW1zKGdhbWUsIDMsIG5hbWUgYXMgaXRlbS5JdGVtTmFtZSlcbiAgICB9KVxuICB9LFxuXVxuXG5mdW5jdGlvbiBpbmplY3RJdGVtcyhnYW1lOiBnYW1lLkdhbWUsIGNvdW50OiBudW1iZXIsIGl0ZW1OYW1lOiBpdGVtLkl0ZW1OYW1lKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIGxldCByYW5kOiBicmljay5CcmljayA9IHJhbmRvbShBcnJheS5mcm9tKGdhbWUuYnJpY2tzKSlcblxuICAgIHdoaWxlIChyYW5kLm9wdGlvbnMuaXRlbSAhPT0gbnVsbCkge1xuICAgICAgcmFuZCA9IHJhbmRvbShBcnJheS5mcm9tKGdhbWUuYnJpY2tzKSlcbiAgICB9XG5cbiAgICByYW5kLm9wdGlvbnMuaXRlbSA9IGl0ZW1OYW1lXG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgU2NlbmVzIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnYW1lOiBnYW1lLkdhbWUpIHt9XG5cbiAgZHJhd0dhbWUoKSB7XG4gICAgaWYgKG1vdXNlSXNQcmVzc2VkIHx8IGtleUlzUHJlc3NlZClcbiAgICAgIGZyYW1lUmF0ZShNYXRoLnJvdW5kKHRoaXMuZ2FtZS5mcmFtZXJhdGUgKiA1KSlcbiAgICBlbHNlIGZyYW1lUmF0ZSh0aGlzLmdhbWUuZnJhbWVyYXRlKVxuXG4gICAgdGhpcy5zY29yZSgpXG4gICAgdGhpcy5oaWdoU2NvcmUoKVxuICAgIHRoaXMuaHBBbmRMZXZlbCgpXG4gICAgdGhpcy5zcGVlZCgpXG5cbiAgICB0aGlzLmdhbWUuYmFyLmRyYXcoKVxuXG4gICAgdGhpcy5nYW1lLmJyaWNrcy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcbiAgICB0aGlzLmdhbWUuYmFsbHMuZm9yRWFjaCgoYikgPT4gYi5kcmF3KCkpXG5cbiAgICB0aGlzLmdhbWUudGVtcG9yYXJ5LmRyYXcoKVxuXG4gICAgaWYgKHRoaXMuZ2FtZS5icmlja3Muc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5nYW1lLmxldmVsKytcblxuICAgICAgdGhpcy5nYW1lLnNldEdyaWRTaGFwZSgpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY29yZSgpIHtcbiAgICBmaWxsKDUwKVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAyMCkpXG4gICAgdGV4dChgU2NvcmU6ICR7dGhpcy5nYW1lLnNjb3JlfWAsIHdpZHRoIC8gMiwgaGVpZ2h0ICogMC41KVxuICB9XG5cbiAgcHJpdmF0ZSBoaWdoU2NvcmUoKSB7XG4gICAgZmlsbCg0NSlcbiAgICBub1N0cm9rZSgpXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMzUpKVxuICAgIHRleHQoYEhpZ2ggU2NvcmU6ICR7dGhpcy5nYW1lLmhpZ2hTY29yZX1gLCB3aWR0aCAvIDIsIGhlaWdodCAqIDAuNTgpXG4gIH1cblxuICBwcml2YXRlIGhwQW5kTGV2ZWwoKSB7XG4gICAgZmlsbCgzMClcbiAgICBub1N0cm9rZSgpXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMjApKVxuICAgIHRleHQoXG4gICAgICBgTHZsLiR7dGhpcy5nYW1lLmxldmVsfSAtICR7dGhpcy5nYW1lLmhwfSBocGAsXG4gICAgICB3aWR0aCAvIDIsXG4gICAgICBoZWlnaHQgKiAwLjY4XG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBzcGVlZCgpIHtcbiAgICBmaWxsKDI1KVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJub3JtYWxcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDI1KSlcbiAgICB0ZXh0KFxuICAgICAgYFNwZWVkIHgke0FycmF5LmZyb20odGhpcy5nYW1lLmJhbGxzKVswXT8uc3BlZWQudG9GaXhlZCgxKSA/PyAwfWAsXG4gICAgICB3aWR0aCAvIDIsXG4gICAgICBoZWlnaHQgKiAwLjc5XG4gICAgKVxuICB9XG5cbiAgZHJhd0dhbWVPdmVyKCkge1xuICAgIHRoaXMuZ2FtZU92ZXIoMC40KVxuICAgIHRoaXMuYnV0dG9uKFwiUmV0cnlcIiwgMC42LCAoKSA9PiB0aGlzLmdhbWUucmVzdGFydCgpKVxuICB9XG5cbiAgdGl0bGUoKSB7fVxuXG4gIHByaXZhdGUgZ2FtZU92ZXIoaDogbnVtYmVyKSB7XG4gICAgZmlsbCgxMDAsIDAsIDApXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDEwKSlcbiAgICB0ZXh0KGBHQU1FIE9WRVJgLCB3aWR0aCAvIDIgKyBNYXRoLmNvcyhEYXRlLm5vdygpIC8gMTAwMDApLCBoZWlnaHQgKiBoKVxuICB9XG5cbiAgcHJpdmF0ZSBidXR0b24oY29udGVudDogc3RyaW5nLCBoOiBudW1iZXIsIG9uQ2xpY2s6ICgpID0+IHVua25vd24pIHtcbiAgICBjb25zdCB5ID0gaGVpZ2h0ICogaFxuICAgIGNvbnN0IGhvdmVyID0gbW91c2VZID4geSAtIGhlaWdodCAvIDEwICYmIG1vdXNlWSA8IHkgKyBoZWlnaHQgLyAxMFxuXG4gICAgZmlsbChob3ZlciA/IDI1NSA6IDIwMClcbiAgICBzdHJva2UoaG92ZXIgPyAxMDAgOiA1MClcbiAgICBzdHJva2VXZWlnaHQoaG92ZXIgPyB3aWR0aCAvIDc1IDogd2lkdGggLyAxMDApXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMjApKVxuICAgIHRleHQoY29udGVudCwgd2lkdGggLyAyLCB5KVxuXG4gICAgaWYgKGhvdmVyICYmIG1vdXNlSXNQcmVzc2VkKSBvbkNsaWNrKClcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgYmFyIGZyb20gXCIuL2JhclwiXG5pbXBvcnQgKiBhcyBiYWxsIGZyb20gXCIuL2JhbGxcIlxuaW1wb3J0ICogYXMgaXRlbSBmcm9tIFwiLi9pdGVtXCJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcbmltcG9ydCAqIGFzIGxldmVsIGZyb20gXCIuL2xldmVsXCJcbmltcG9ydCAqIGFzIHNjZW5lcyBmcm9tIFwiLi9zY2VuZXNcIlxuaW1wb3J0ICogYXMgdGVtcG9yYXJ5IGZyb20gXCIuL3RlbXBvcmFyeVwiXG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgaHAgPSBfLkJBU0VfSFBcbiAgYmFyOiBiYXIuQmFyXG4gIGJhbGxzID0gbmV3IFNldDxiYWxsLkJhbGw+KClcbiAgYnJpY2tzID0gbmV3IFNldDxicmljay5Ccmljaz4oKVxuICBmcmFtZXJhdGUgPSBfLkZSQU1FUkFURVxuICBsZXZlbCA9IDFcbiAgc2NlbmVzOiBzY2VuZXMuU2NlbmVzXG4gIGZpbmlzaCA9IGZhbHNlXG4gIHRlbXBvcmFyeTogdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdE1hbmFnZXJcblxuICBwcml2YXRlIF9zY29yZSA9IDBcbiAgcHJpdmF0ZSBfaGlnaFNjb3JlID0gTnVtYmVyKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3JlXCIpID8/IDApXG5cbiAgcmVhZG9ubHkgQlJJQ0tfV0lEVEggPSB3aWR0aCAvIF8uR1JJRF9XSURUSFxuICByZWFkb25seSBCUklDS19IRUlHSFQgPSB0aGlzLkJSSUNLX1dJRFRIIC8gXy5BU1BFQ1RfUkFUSU9cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgd2luZG93LmdhbWUgPSB0aGlzXG5cbiAgICB0aGlzLnJlc3RhcnQoKVxuICB9XG5cbiAgc2V0IHNjb3JlKHNjb3JlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9zY29yZSA9IHNjb3JlXG5cbiAgICBpZiAodGhpcy5fc2NvcmUgPiB0aGlzLmhpZ2hTY29yZSkge1xuICAgICAgdGhpcy5oaWdoU2NvcmUgPSB0aGlzLl9zY29yZVxuICAgIH1cbiAgfVxuXG4gIGdldCBzY29yZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2NvcmVcbiAgfVxuXG4gIHNldCBoaWdoU2NvcmUoc2NvcmU6IG51bWJlcikge1xuICAgIHRoaXMuX2hpZ2hTY29yZSA9IHNjb3JlXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoU2NvcmVcIiwgU3RyaW5nKHRoaXMuX2hpZ2hTY29yZSkpXG4gIH1cblxuICBnZXQgaGlnaFNjb3JlKCkge1xuICAgIHJldHVybiB0aGlzLl9oaWdoU2NvcmVcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCguLi5fLkJBQ0tHUk9VTkRfQ09MT1IpXG5cbiAgICBpZiAodGhpcy5ocCA+IDApIHRoaXMuc2NlbmVzLmRyYXdHYW1lKClcbiAgICBlbHNlIGlmICghdGhpcy5maW5pc2gpIHRoaXMuZmluaXNoID0gdHJ1ZVxuICAgIGVsc2UgaWYgKHRoaXMuZmluaXNoKSB0aGlzLnNjZW5lcy5kcmF3R2FtZU92ZXIoKVxuICAgIGVsc2UgdGhpcy5zY2VuZXMudGl0bGUoKVxuICB9XG5cbiAgcmVzdGFydCgpIHtcbiAgICB0aGlzLmJhbGxzLmNsZWFyKClcblxuICAgIHRoaXMuc2V0R3JpZFNoYXBlKClcbiAgICB0aGlzLmxhdW5jaEJhbGwoKVxuXG4gICAgdGhpcy5iYXIgPSBuZXcgYmFyLkJhcih0aGlzKVxuICAgIHRoaXMuc2NlbmVzID0gbmV3IHNjZW5lcy5TY2VuZXModGhpcylcbiAgICB0aGlzLnRlbXBvcmFyeSA9IG5ldyB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0TWFuYWdlcih0aGlzKVxuXG4gICAgdGhpcy5ocCA9IF8uQkFTRV9IUFxuICAgIHRoaXMubGV2ZWwgPSAxXG4gICAgdGhpcy5zY29yZSA9IDBcbiAgICB0aGlzLmZpbmlzaCA9IGZhbHNlXG4gICAgdGhpcy5mcmFtZXJhdGUgPSBfLkZSQU1FUkFURVxuICB9XG5cbiAgbGF1bmNoQmFsbCgpIHtcbiAgICBjb25zdCBuZXdCYWxsID0gbmV3IGJhbGwuQmFsbCh0aGlzKVxuICAgIHRoaXMuYmFsbHMuYWRkKG5ld0JhbGwpXG4gICAgcmV0dXJuIG5ld0JhbGxcbiAgfVxuXG4gIHNldEdyaWRTaGFwZSgpIHtcbiAgICB0aGlzLmJyaWNrcy5jbGVhcigpXG5cbiAgICBjb25zdCBsZXZlbFNoYXBlSW5kZXggPSBNYXRoLmZsb29yKFxuICAgICAgKHRoaXMubGV2ZWwgLSAxKSAlIGxldmVsLmxldmVsU2hhcGVzLmxlbmd0aFxuICAgIClcbiAgICBjb25zdCBsZXZlbEl0ZW1zSW5kZXggPSBNYXRoLmZsb29yKFxuICAgICAgKHRoaXMubGV2ZWwgLSAxKSAlIGxldmVsLmxldmVsSXRlbXMubGVuZ3RoXG4gICAgKVxuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBfLkdSSURfV0lEVEg7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBfLkdSSURfSEVJR0hUOyB5KyspIHtcbiAgICAgICAgaWYgKGxldmVsLmxldmVsU2hhcGVzW2xldmVsU2hhcGVJbmRleF0oeCwgeSkpIHtcbiAgICAgICAgICB0aGlzLmJyaWNrcy5hZGQoXG4gICAgICAgICAgICBuZXcgYnJpY2suQnJpY2sodGhpcywge1xuICAgICAgICAgICAgICB4LFxuICAgICAgICAgICAgICB5LFxuICAgICAgICAgICAgICBkdXJhYmlsaXR5OiB0aGlzLmxldmVsLFxuICAgICAgICAgICAgICBpdGVtOiBudWxsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXZlbC5sZXZlbEl0ZW1zW2xldmVsSXRlbXNJbmRleF0odGhpcylcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBTyxNQUFNLGVBQWUsS0FBSztBQUMxQixNQUFNLGFBQWE7QUFDbkIsTUFBTSxjQUFjO0FBQ3BCLE1BQU0sbUJBQXdCLENBQUMsR0FBRyxHQUFHO0FBQ3JDLE1BQU0sa0JBQWtCLE1BQU0sUUFBUTtBQUN0QyxNQUFNLG1CQUFtQixNQUFNLFFBQVE7QUFDdkMsTUFBTSx1QkFBdUI7QUFDN0IsTUFBTSxVQUFVO0FBQ2hCLE1BQU0sYUFBYTtBQUNuQixNQUFNLGNBQWM7QUFDcEIsTUFBTSxZQUFZO0FBQ2xCLE1BQU0sWUFBWTtBQUNsQixNQUFNLG1CQUF3QixDQUFDLEtBQUssR0FBRzs7O0FDVnZDLGtCQUFVO0FBQUEsSUFPZixZQUFvQixPQUFpQjtBQUFqQjtBQU5wQixlQUFJLFFBQVE7QUFDWixlQUFJLFNBQVM7QUFDYixtQkFBUSxRQUFRO0FBQ2hCLG9CQUFTLEtBQUssUUFBUTtBQUN0Qix3QkFBYTtBQUFBO0FBQUEsSUFJYixPQUFPO0FBQ0wsV0FBSztBQUNMLGdCQUFVLEtBQUssR0FBRyxLQUFLO0FBQ3ZCO0FBQ0EsV0FBSyxJQUFJLElBQUk7QUFDYixXQUNHLEtBQUssUUFBUSxJQUFLLElBQ2xCLEtBQUssU0FBUyxJQUFLLElB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
