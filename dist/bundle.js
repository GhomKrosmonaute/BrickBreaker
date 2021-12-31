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
  var BASE_EFFECT_DURATION = 50;
  var BASE_HP = 3;
  var DEBUG_MODE = false;
  var TAIL_LENGTH = 10;
  var FRAMERATE = 25;
  var NO_SMOOTH = true;
  var BRICK_BASE_COLOR = [0, 100, 200];

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
      this.game.balls.forEach((ball) => {
        if (ball.y + ball.radius > this.y - this.height / 2 && ball.y + ball.radius < this.y + this.height / 2 && ball.x + ball.radius > this.x - this.width / 2 && ball.x - ball.radius < this.x + this.width / 2) {
          this.touchTimes++;
          if (this.touchTimes > 1)
            console.error("ball touch bar several times (" + this.touchTimes + ")");
          ball.velocity.y = -abs(ball.velocity.y);
          ball.refreshAngle();
          if (ball.x < this.x - this.width / 4) {
            ball.angle -= map(ball.x, this.x - this.width / 4, this.x - this.width / 2, 1, 15);
            ball.angle = constrain(ball.angle, -178, -2);
            ball.refreshVelocity();
          }
          if (ball.x > this.x + this.width / 4) {
            ball.angle -= map(ball.x, this.x + this.width / 4, this.x + this.width / 2, 1, 15);
            ball.angle = constrain(ball.angle, -178, -2);
            ball.refreshVelocity();
          }
          if (ball.x <= this.x - this.width / 2) {
            ball.x = this.x - this.width / 2 - ball.radius;
            ball.velocity.x = -abs(ball.velocity.x);
          } else if (ball.x >= this.x + this.width / 2) {
            ball.x = this.x + this.width / 2 + ball.radius;
            ball.velocity.x = abs(ball.velocity.x);
          } else {
            ball.y = this.y - this.height / 2 - ball.radius;
          }
          ball.velocity.y = -abs(ball.velocity.y);
          ball.refreshAngle();
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
  var ball_exports = {};
  __export(ball_exports, {
    Ball: () => Ball
  });
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
      if (this.y + this.radius >= height) {
        if (this.game.balls.size === 1)
          this.onFail();
        this.game.balls.delete(this);
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
        brick2.hit(this.damages, this);
    }
    accelerate() {
      this.speed = map(this.game.score, 0, 500, BALL_BASE_SPEED(), Math.min(BALL_BASE_SPEED() * 10, Math.min(this.game.BRICK_HEIGHT, this.game.BRICK_WIDTH)));
    }
    move() {
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
    onFail() {
      this.game.launchBall();
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
    constructor(on, icon, onTrigger) {
      this.on = on;
      this.icon = icon;
      this.onTrigger = onTrigger;
    }
    trigger(brick2, ...params) {
      console.log("power:", brick2.options.item);
      this.onTrigger.bind(brick2)(...params);
    }
  };
  var items = {
    bomb: new Item("broken", "BOMB", function(ball) {
      const range = 3;
      Array.from(this.game.bricks).filter((brick2) => {
        return brick2 !== this && brick2.options.x > this.options.x - range && brick2.options.x < this.options.x + range && brick2.options.y > this.options.y - range && brick2.options.y < this.options.y + range;
      }).forEach((brick2) => {
        brick2.hit(ball.damages, ball);
      });
    }),
    ballTemporarySpeedDown: new Item("broken", "SLOW", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        onBallCreate: true,
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) => b ? (() => {
          b.speed -= BALL_BASE_SPEED() / 2;
          return b;
        })() : fx.data.filter((ball) => ball.speed -= BALL_BASE_SPEED() / 2),
        down: (fx) => fx.data.forEach((ball) => ball.speed += BALL_BASE_SPEED() / 2),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            noStroke();
            fill(0, 0, 255, round(255 * 0.25));
            circle(ball.x, ball.y, ball.radius * 2);
          });
        }
      }));
    }),
    ballTemporaryDamageUp: new Item("broken", "DMG", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        onBallCreate: true,
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) => b ? (() => {
          b.damages++;
          return b;
        })() : fx.data.filter((ball) => ball.damages++),
        down: (fx) => fx.data.forEach((ball) => ball.damages--),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            stroke(...BRICK_BASE_COLOR, Math.floor(map(ball.damages, this.game.level, 0, 255, 0)));
            strokeWeight(round(ball.radius / 7));
            noFill();
            circle(ball.x, ball.y, ball.radius * 2 - ball.radius / 7);
          });
        }
      }));
    }),
    ballTemporarySizeUp: new Item("broken", "BIG", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        onBallCreate: true,
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) => b ? (() => {
          b.radius += BALL_BASE_RADIUS() / 2;
          return b;
        })() : fx.data.filter((ball) => ball.radius += BALL_BASE_RADIUS() / 2),
        down: (fx) => fx.data.forEach((ball) => ball.radius -= BALL_BASE_RADIUS() / 2),
        onDraw: () => null
      }));
    }),
    ballDuplication: new Item("broken", "\u23FA\u23FA", function(b) {
      const newBall = this.game.launchBall();
      newBall.x = b.x;
      newBall.y = b.y;
    }),
    ballTemporarySpeedUp: new Item("broken", "SPEED", function() {
      this.game.temporary.add(new TemporaryEffect(this.game, {
        onBallCreate: true,
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) => b ? (() => {
          b.speed += BALL_BASE_SPEED() / 2;
          return b;
        })() : fx.data.filter((ball) => ball.speed += BALL_BASE_SPEED() / 2),
        down: (fx) => fx.data.forEach((ball) => ball.speed -= BALL_BASE_SPEED() / 2),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            noStroke();
            fill(255, 182, 0, round(255 * 0.25));
            circle(ball.x, ball.y, ball.radius * 2);
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
    setDurability(durability, ball) {
      this._durability = durability;
      if (this._durability <= 0) {
        this.kill(ball);
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
      fill(...BRICK_BASE_COLOR.map((factor) => {
        return factor + (Math.random() <= 0.5 ? -20 : 20);
      }), Math.floor(map(this.durability, this.game.level, 0, 255, 0)));
      rect(this.screenX, this.screenY, this.game.BRICK_WIDTH, this.game.BRICK_HEIGHT, this.game.BRICK_HEIGHT / 4);
      if (this.options.item !== null) {
        noStroke();
        fill(255);
        textSize(this.game.BRICK_HEIGHT / 2);
        text(this.item.icon, this.screenX + this.game.BRICK_WIDTH / 2, this.screenY + this.game.BRICK_HEIGHT / 2);
      }
    }
    hit(damages, ball) {
      var _a2;
      if (this.durability <= 0)
        return;
      if (((_a2 = this.item) == null ? void 0 : _a2.on) === "touched") {
        if (this.options.item === "ballDuplication" || this.options.item === "bomb") {
          this.item.trigger(this, ball);
        } else {
          ;
          this.item.trigger(this);
        }
      }
      this.game.score += damages;
      this.setDurability(this.durability - damages, ball);
    }
    kill(ball) {
      var _a2;
      if (!this.game.bricks.has(this))
        return;
      if (((_a2 = this.item) == null ? void 0 : _a2.on) === "broken") {
        if (this.options.item === "ballDuplication" || this.options.item === "bomb") {
          this.item.trigger(this, ball);
        } else {
          ;
          this.item.trigger(this);
        }
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
        console.log("injected:", 3, name);
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
        this.game.balls.clear();
        this.game.launchBall();
        this.game.setGridShape();
        this.game.temporary.effects.clear();
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
      this.bar = new Bar(this);
      this.scenes = new Scenes(this);
      this.temporary = new TemporaryEffectManager(this);
      this.hp = BASE_HP;
      this.level = 1;
      this.score = 0;
      this.finish = false;
      this.framerate = FRAMERATE;
      this.balls.clear();
      this.setGridShape();
      this.launchBall();
    }
    launchBall() {
      for (const fx of Array.from(this.temporary.effects)) {
        if (fx.options.onBallCreate)
          fx.options.up(fx.options, ball_exports);
      }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvdGVtcG9yYXJ5LnRzIiwgInNyYy9pdGVtLnRzIiwgInNyYy9icmljay50cyIsICJzcmMvbGV2ZWwudHMiLCAic3JjL3NjZW5lcy50cyIsICJzcmMvZ2FtZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8vIEB0cy1jaGVja1xuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMvcDUvZ2xvYmFsLmQudHNcIiAvPlxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpXG5cbmxldCBnYW1lOiBHYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgd2luZG93LmlubmVyV2lkdGggfHwgMFxuICApXG4gIGNvbnN0IHdpbmRvd0hlaWdodCA9IE1hdGgubWF4KFxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsXG4gICAgd2luZG93LmlubmVySGVpZ2h0IHx8IDBcbiAgKVxuXG4gIGNvbnN0IF93aWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCB3aW5kb3dIZWlnaHQgKiBfLkFTUEVDVF9SQVRJTylcbiAgY29uc3QgX2hlaWdodCA9IF93aWR0aCAvIF8uQVNQRUNUX1JBVElPXG5cbiAgY3JlYXRlQ2FudmFzKF93aWR0aCwgX2hlaWdodClcblxuICBpZiAoXy5OT19TTU9PVEgpIG5vU21vb3RoKClcbiAgZnJhbWVSYXRlKDYwKVxuXG4gIGdhbWUgPSBuZXcgR2FtZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xuICBnYW1lLmRyYXcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9XG5leHBvcnQgZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fVxuIiwgImV4cG9ydCBjb25zdCBBU1BFQ1RfUkFUSU8gPSAxNiAvIDlcbmV4cG9ydCBjb25zdCBHUklEX1dJRFRIID0gMjFcbmV4cG9ydCBjb25zdCBHUklEX0hFSUdIVCA9IDhcbmV4cG9ydCBjb25zdCBCQUNLR1JPVU5EX0NPTE9SOiBSR0IgPSBbMCwgMCwgMF1cbmV4cG9ydCBjb25zdCBCQUxMX0JBU0VfU1BFRUQgPSAoKSA9PiB3aWR0aCAvIDE1MFxuZXhwb3J0IGNvbnN0IEJBTExfQkFTRV9SQURJVVMgPSAoKSA9PiB3aWR0aCAqIDAuMDA3XG5leHBvcnQgY29uc3QgQkFTRV9FRkZFQ1RfRFVSQVRJT04gPSA1MFxuZXhwb3J0IGNvbnN0IEJBU0VfSFAgPSAzXG5leHBvcnQgY29uc3QgREVCVUdfTU9ERSA9IGZhbHNlXG5leHBvcnQgY29uc3QgVEFJTF9MRU5HVEggPSAxMFxuZXhwb3J0IGNvbnN0IEZSQU1FUkFURSA9IDI1XG5leHBvcnQgY29uc3QgTk9fU01PT1RIID0gdHJ1ZVxuZXhwb3J0IGNvbnN0IEJSSUNLX0JBU0VfQ09MT1I6IFJHQiA9IFswLCAxMDAsIDIwMF1cbiIsICJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuXG5leHBvcnQgY2xhc3MgQmFyIHtcbiAgeCA9IHdpZHRoIC8gMlxuICB5ID0gaGVpZ2h0ICogMS4xXG4gIHdpZHRoID0gd2lkdGggKiAwLjFcbiAgaGVpZ2h0ID0gdGhpcy53aWR0aCAvIDRcbiAgdG91Y2hUaW1lcyA9IDBcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoNjAsIDYwLCAyMDApXG4gICAgcmVjdChcbiAgICAgICh0aGlzLndpZHRoIC8gMikgKiAtMSxcbiAgICAgICh0aGlzLmhlaWdodCAvIDIpICogLTEsXG4gICAgICB0aGlzLndpZHRoLFxuICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICB0aGlzLmhlaWdodFxuICAgIClcbiAgICBmaWxsKDYwLCAyMDAsIDI1NSlcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyA0KSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGggLyAyLFxuICAgICAgdGhpcy5oZWlnaHRcbiAgICApXG4gICAgdHJhbnNsYXRlKC10aGlzLngsIC10aGlzLnkpXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLm1vdmUoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge1xuICAgIHRoaXMuZ2FtZS5iYWxscy5mb3JFYWNoKChiYWxsKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzID4gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzIDwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueCArIGJhbGwucmFkaXVzID4gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgJiZcbiAgICAgICAgYmFsbC54IC0gYmFsbC5yYWRpdXMgPCB0aGlzLnggKyB0aGlzLndpZHRoIC8gMlxuICAgICAgKSB7XG4gICAgICAgIHRoaXMudG91Y2hUaW1lcysrXG5cbiAgICAgICAgaWYgKHRoaXMudG91Y2hUaW1lcyA+IDEpXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIFwiYmFsbCB0b3VjaCBiYXIgc2V2ZXJhbCB0aW1lcyAoXCIgKyB0aGlzLnRvdWNoVGltZXMgKyBcIilcIlxuICAgICAgICAgIClcblxuICAgICAgICBiYWxsLnZlbG9jaXR5LnkgPSAtYWJzKGJhbGwudmVsb2NpdHkueSlcblxuICAgICAgICBiYWxsLnJlZnJlc2hBbmdsZSgpXG5cbiAgICAgICAgaWYgKGJhbGwueCA8IHRoaXMueCAtIHRoaXMud2lkdGggLyA0KSB7XG4gICAgICAgICAgYmFsbC5hbmdsZSAtPSBtYXAoXG4gICAgICAgICAgICBiYWxsLngsXG4gICAgICAgICAgICB0aGlzLnggLSB0aGlzLndpZHRoIC8gNCxcbiAgICAgICAgICAgIHRoaXMueCAtIHRoaXMud2lkdGggLyAyLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDE1XG4gICAgICAgICAgKVxuXG4gICAgICAgICAgYmFsbC5hbmdsZSA9IGNvbnN0cmFpbihiYWxsLmFuZ2xlLCAtMTc4LCAtMilcblxuICAgICAgICAgIGJhbGwucmVmcmVzaFZlbG9jaXR5KClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWxsLnggPiB0aGlzLnggKyB0aGlzLndpZHRoIC8gNCkge1xuICAgICAgICAgIGJhbGwuYW5nbGUgLT0gbWFwKFxuICAgICAgICAgICAgYmFsbC54LFxuICAgICAgICAgICAgdGhpcy54ICsgdGhpcy53aWR0aCAvIDQsXG4gICAgICAgICAgICB0aGlzLnggKyB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxNVxuICAgICAgICAgIClcblxuICAgICAgICAgIGJhbGwuYW5nbGUgPSBjb25zdHJhaW4oYmFsbC5hbmdsZSwgLTE3OCwgLTIpXG5cbiAgICAgICAgICBiYWxsLnJlZnJlc2hWZWxvY2l0eSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBkXHUwMEU5Y2FsZXIgbGEgYmFsbGUgaG9ycyBkZSBsYSBiYXIgc2kgZWxsZSBlc3QgdHJvcCBhIGRyb2l0ZSBvdSBhIGdhdWNoZVxuICAgICAgICBpZiAoYmFsbC54IDw9IHRoaXMueCAtIHRoaXMud2lkdGggLyAyKSB7XG4gICAgICAgICAgYmFsbC54ID0gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgLSBiYWxsLnJhZGl1c1xuICAgICAgICAgIGJhbGwudmVsb2NpdHkueCA9IC1hYnMoYmFsbC52ZWxvY2l0eS54KVxuICAgICAgICB9IGVsc2UgaWYgKGJhbGwueCA+PSB0aGlzLnggKyB0aGlzLndpZHRoIC8gMikge1xuICAgICAgICAgIGJhbGwueCA9IHRoaXMueCArIHRoaXMud2lkdGggLyAyICsgYmFsbC5yYWRpdXNcbiAgICAgICAgICBiYWxsLnZlbG9jaXR5LnggPSBhYnMoYmFsbC52ZWxvY2l0eS54KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhbGwueSA9IHRoaXMueSAtIHRoaXMuaGVpZ2h0IC8gMiAtIGJhbGwucmFkaXVzXG4gICAgICAgIH1cblxuICAgICAgICBiYWxsLnZlbG9jaXR5LnkgPSAtYWJzKGJhbGwudmVsb2NpdHkueSlcblxuICAgICAgICBiYWxsLnJlZnJlc2hBbmdsZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRvdWNoVGltZXMgPSAwXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgbW92ZSgpIHtcbiAgICBjb25zdCB4ID1cbiAgICAgIHRoaXMueCArIChtb3VzZVggLSB0aGlzLngpIC8gNCAvKiBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscylbMF0/LnggPz8gKi9cbiAgICBjb25zdCB5ID0gdGhpcy55ICsgKG1vdXNlWSAtIHRoaXMueSkgLyA0XG5cbiAgICB0aGlzLnggPSBtaW4obWF4KHgsIHRoaXMud2lkdGggLyAyKSwgd2lkdGggLSB0aGlzLndpZHRoIC8gMilcbiAgICB0aGlzLnkgPSBtaW4obWF4KHksIGhlaWdodCAqIDAuOSksIGhlaWdodCAtIHRoaXMuaGVpZ2h0IC8gMilcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCJcbmltcG9ydCAqIGFzIHRlbXBvcmFyeSBmcm9tIFwiLi90ZW1wb3JhcnlcIlxuXG5leHBvcnQgY2xhc3MgQmFsbCB7XG4gIHggPSB3aWR0aCAvIDJcbiAgeSA9IGhlaWdodCAqIDAuOFxuICBhbmdsZSA9IDBcbiAgdmVsb2NpdHkgPSBjcmVhdGVWZWN0b3IoKVxuICByYWRpdXMgPSBfLkJBTExfQkFTRV9SQURJVVMoKVxuICBzcGVlZCA9IF8uQkFMTF9CQVNFX1NQRUVEKClcbiAgdGFpbDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9W10gPSBbXVxuICBkYW1hZ2VzID0gMVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBnYW1lOiBnYW1lLkdhbWUpIHtcbiAgICB0aGlzLnNldFJhbmRvbVZlbG9jaXR5KClcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuICAgIG5vU3Ryb2tlKClcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy50YWlsKSB7XG4gICAgICBmaWxsKG1hcCh0aGlzLnRhaWwuaW5kZXhPZihwYXJ0KSwgMCwgdGhpcy50YWlsLmxlbmd0aCAtIDIsIDAsIDI1NSkpXG4gICAgICBjaXJjbGUoXG4gICAgICAgIHBhcnQueCxcbiAgICAgICAgcGFydC55LFxuICAgICAgICBtYXAoXG4gICAgICAgICAgdGhpcy50YWlsLmluZGV4T2YocGFydCksXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnRhaWwubGVuZ3RoIC0gMSxcbiAgICAgICAgICB0aGlzLnJhZGl1cyAvIDIsXG4gICAgICAgICAgdGhpcy5yYWRpdXMgKiAyXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gICAgZmlsbCgyNTUpXG4gICAgY2lyY2xlKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cyAqIDIpXG4gICAgaWYgKF8uREVCVUdfTU9ERSlcbiAgICAgIHRleHQoXG4gICAgICAgIGBzcGVlZDogJHt0aGlzLnNwZWVkfVxcbmFuZ2xlOiAke01hdGgucm91bmQoXG4gICAgICAgICAgdGhpcy5hbmdsZVxuICAgICAgICApfVxcbnZlbG9jaXR5OlxcbiAgIHg9JHt0aGlzLnZlbG9jaXR5Lnh9XFxuICAgIHk9JHt0aGlzLnZlbG9jaXR5Lnl9YCxcbiAgICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMsXG4gICAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzXG4gICAgICApXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLnNhdmUoKVxuICAgIHRoaXMuY2hlY2tGYWlsKClcbiAgICB0aGlzLmJyaWNrcygpXG4gICAgdGhpcy5hY2NlbGVyYXRlKClcbiAgICB0aGlzLm1vdmUoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHNldFJhbmRvbVZlbG9jaXR5KCkge1xuICAgIHRoaXMuc2V0QW5nbGUocmFuZG9tKC0xNzksIC0xKSlcblxuICAgIGlmICh0aGlzLnZlbG9jaXR5LnkgPiAwKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnkgKj0gLTFcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cbiAgfVxuXG4gIHNldEFuZ2xlKGFuZ2xlOiBudW1iZXIpIHtcbiAgICB0aGlzLmFuZ2xlID0gYW5nbGVcblxuICAgIHRoaXMucmVmcmVzaFZlbG9jaXR5KClcbiAgfVxuXG4gIHJlZnJlc2hWZWxvY2l0eSgpIHtcbiAgICB0aGlzLnZlbG9jaXR5LnNldChjb3ModGhpcy5hbmdsZSksIHNpbih0aGlzLmFuZ2xlKSkubXVsdCh0aGlzLnNwZWVkKVxuXG4gICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICB9XG5cbiAgcmVmcmVzaEFuZ2xlKCkge1xuICAgIGNvbnN0IGEgPSBjcmVhdGVWZWN0b3IoKVxuICAgIGNvbnN0IGIgPSB0aGlzLnZlbG9jaXR5XG5cbiAgICB0aGlzLmFuZ2xlID0gZGVncmVlcyhhdGFuMihiLnkgLSBhLnksIGIueCAtIGEueCkpXG4gIH1cblxuICBzYXZlKCkge1xuICAgIHRoaXMudGFpbC5wdXNoKHtcbiAgICAgIHg6IHRoaXMueCxcbiAgICAgIHk6IHRoaXMueSxcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMudGFpbC5sZW5ndGggPiBfLlRBSUxfTEVOR1RIKSB0aGlzLnRhaWwuc2hpZnQoKVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0ZhaWwoKSB7XG4gICAgaWYgKHRoaXMueSArIHRoaXMucmFkaXVzID49IGhlaWdodCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAxKSB0aGlzLm9uRmFpbCgpXG4gICAgICB0aGlzLmdhbWUuYmFsbHMuZGVsZXRlKHRoaXMpXG4gICAgICB0aGlzLmdhbWUudGVtcG9yYXJ5LmVmZmVjdHMuZm9yRWFjaChcbiAgICAgICAgKGVmZmVjdDogdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdDxCYWxsW10+KSA9PiB7XG4gICAgICAgICAgaWYgKGVmZmVjdC5vcHRpb25zLmRhdGEuaW5jbHVkZXModGhpcykpIGVmZmVjdC5kb3duID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBib3VuZHMoKSB7XG4gICAgaWYgKHRoaXMueCArIHRoaXMucmFkaXVzID49IHdpZHRoIHx8IHRoaXMueCAtIHRoaXMucmFkaXVzIDw9IDApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAtMVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMueSAtIHRoaXMucmFkaXVzIDw9IDApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuXG4gICAgICB0aGlzLnJlZnJlc2hBbmdsZSgpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBicmlja3MoKSB7XG4gICAgY29uc3QgYnJpY2sgPSBBcnJheS5mcm9tKHRoaXMuZ2FtZS5icmlja3MpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRpc3QoXG4gICAgICAgICAgYS5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMixcbiAgICAgICAgICBhLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUIC8gMixcbiAgICAgICAgICB0aGlzLngsXG4gICAgICAgICAgdGhpcy55XG4gICAgICAgICkgLVxuICAgICAgICBkaXN0KFxuICAgICAgICAgIGIuc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCAvIDIsXG4gICAgICAgICAgYi5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDIsXG4gICAgICAgICAgdGhpcy54LFxuICAgICAgICAgIHRoaXMueVxuICAgICAgICApXG4gICAgICApXG4gICAgfSlbMF1cblxuICAgIGlmICghYnJpY2spIHJldHVyblxuXG4gICAgY29uc3QgaW5uZXJYID1cbiAgICAgIHRoaXMueCA+IGJyaWNrLnNjcmVlblggJiYgdGhpcy54IDwgYnJpY2suc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSFxuICAgIGNvbnN0IGlubmVyWSA9XG4gICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblkgJiZcbiAgICAgIHRoaXMueSAtIHRoaXMucmFkaXVzIDwgYnJpY2suc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFRcblxuICAgIGxldCB0b3VjaCA9IGZhbHNlXG5cbiAgICAvLyB0b3BcbiAgICBpZiAoXG4gICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblkgJiZcbiAgICAgIHRoaXMueSA8IGJyaWNrLnNjcmVlblkgKyB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hUIC8gMiAmJlxuICAgICAgaW5uZXJYXG4gICAgKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnkgKj0gLTFcbiAgICAgIHRoaXMueSA9IGJyaWNrLnNjcmVlblkgLSB0aGlzLnJhZGl1c1xuXG4gICAgICB0b3VjaCA9IHRydWVcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cblxuICAgIC8vIGJvdHRvbVxuICAgIGVsc2UgaWYgKFxuICAgICAgdGhpcy55IC0gdGhpcy5yYWRpdXMgPCBicmljay5zY3JlZW5ZICsgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAmJlxuICAgICAgdGhpcy55ID4gYnJpY2suc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMudmVsb2NpdHkueSAqPSAtMVxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgKyB0aGlzLnJhZGl1c1xuXG4gICAgICB0b3VjaCA9IHRydWVcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cblxuICAgIC8vIGxlZnRcbiAgICBlbHNlIGlmIChcbiAgICAgIHRoaXMueCArIHRoaXMucmFkaXVzID4gYnJpY2suc2NyZWVuWCAmJlxuICAgICAgdGhpcy54IDwgYnJpY2suc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCAvIDIgJiZcbiAgICAgIGlubmVyWVxuICAgICkge1xuICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IC0xXG4gICAgICB0aGlzLnggPSBicmljay5zY3JlZW5YIC0gdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG5cbiAgICAgIHRoaXMucmVmcmVzaEFuZ2xlKClcbiAgICB9XG5cbiAgICAvLyByaWdodFxuICAgIGVsc2UgaWYgKFxuICAgICAgdGhpcy54IC0gdGhpcy5yYWRpdXMgPCBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIICYmXG4gICAgICB0aGlzLnggPiBicmljay5zY3JlZW5YICsgdGhpcy5nYW1lLkJSSUNLX1dJRFRIIC8gMiAmJlxuICAgICAgaW5uZXJZXG4gICAgKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5LnggKj0gLTFcbiAgICAgIHRoaXMueCA9IGJyaWNrLnNjcmVlblggKyB0aGlzLmdhbWUuQlJJQ0tfV0lEVEggKyB0aGlzLnJhZGl1c1xuXG4gICAgICB0b3VjaCA9IHRydWVcblxuICAgICAgdGhpcy5yZWZyZXNoQW5nbGUoKVxuICAgIH1cblxuICAgIGJyaWNrLnRvdWNoQmFsbCA9IHRvdWNoXG5cbiAgICBpZiAodG91Y2gpIGJyaWNrLmhpdCh0aGlzLmRhbWFnZXMsIHRoaXMpXG4gIH1cblxuICBwcml2YXRlIGFjY2VsZXJhdGUoKSB7XG4gICAgdGhpcy5zcGVlZCA9IG1hcChcbiAgICAgIHRoaXMuZ2FtZS5zY29yZSxcbiAgICAgIDAsXG4gICAgICA1MDAsXG4gICAgICBfLkJBTExfQkFTRV9TUEVFRCgpLFxuICAgICAgTWF0aC5taW4oXG4gICAgICAgIF8uQkFMTF9CQVNFX1NQRUVEKCkgKiAxMCxcbiAgICAgICAgTWF0aC5taW4odGhpcy5nYW1lLkJSSUNLX0hFSUdIVCwgdGhpcy5nYW1lLkJSSUNLX1dJRFRIKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG4gIG1vdmUoKSB7XG4gICAgdGhpcy54ICs9IHRoaXMudmVsb2NpdHkueFxuICAgIHRoaXMueSArPSB0aGlzLnZlbG9jaXR5LnlcbiAgfVxuXG4gIHByaXZhdGUgb25GYWlsKCkge1xuICAgIHRoaXMuZ2FtZS5sYXVuY2hCYWxsKClcbiAgICB0aGlzLmdhbWUuaHAtLVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgdHlwZSAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBUZW1wb3JhcnlFZmZlY3Q8RGF0YT4ge1xuICBwdWJsaWMgb3B0aW9uczogVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPlxuICBwdWJsaWMgZG93biA9IGZhbHNlXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGdhbWU6IGdhbWUuR2FtZSxcbiAgICBvcHRpb25zOiBQaWNrPFxuICAgICAgVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPixcbiAgICAgIFwidXBcIiB8IFwiZG93blwiIHwgXCJvbkRyYXdcIiB8IFwiZGF0YVwiIHwgXCJjYW5jZWxDb25kaXRpb25cIiB8IFwib25CYWxsQ3JlYXRlXCJcbiAgICA+XG4gICkge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBzdGFydEF0OiBmcmFtZUNvdW50LFxuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucy5kYXRhID0gb3B0aW9ucy51cC5iaW5kKG9wdGlvbnMpKG9wdGlvbnMpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHRoaXMub3B0aW9ucy5vbkRyYXcodGhpcy5vcHRpb25zKVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLm9wdGlvbnMuc3RhcnRBdCA+IGZyYW1lQ291bnQgKyBfLkJBU0VfRUZGRUNUX0RVUkFUSU9OIHx8XG4gICAgICB0aGlzLm9wdGlvbnMuY2FuY2VsQ29uZGl0aW9uPy4odGhpcy5vcHRpb25zKSB8fFxuICAgICAgdGhpcy5kb3duXG4gICAgKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZG93bi5iaW5kKHRoaXMub3B0aW9ucykodGhpcy5vcHRpb25zKVxuICAgICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5lZmZlY3RzLmRlbGV0ZSh0aGlzKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBvcmFyeUVmZmVjdE9wdGlvbnM8RGF0YT4ge1xuICB1cDogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPiwgLi4uYXJnczogYW55W10pID0+IERhdGFcbiAgZG93bjogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPikgPT4gdW5rbm93blxuICBvbkRyYXc6IChlZmZlY3Q6IFRlbXBvcmFyeUVmZmVjdE9wdGlvbnM8RGF0YT4pID0+IHVua25vd25cbiAgY2FuY2VsQ29uZGl0aW9uPzogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9uczxEYXRhPikgPT4gYm9vbGVhblxuICBvbkJhbGxDcmVhdGU/OiB0cnVlXG4gIGRhdGE6IERhdGFcbiAgc3RhcnRBdDogbnVtYmVyXG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wb3JhcnlFZmZlY3RNYW5hZ2VyIHtcbiAgZWZmZWN0cyA9IG5ldyBTZXQ8VGVtcG9yYXJ5RWZmZWN0PGFueT4+KClcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2FtZTogZ2FtZS5HYW1lKSB7fVxuXG4gIGFkZDxEYXRhPihlZmZlY3Q6IFRlbXBvcmFyeUVmZmVjdDxEYXRhPikge1xuICAgIHRoaXMuZWZmZWN0cy5hZGQoZWZmZWN0KVxuICB9XG5cbiAgZHJhdygpIHtcbiAgICB0aGlzLmVmZmVjdHMuZm9yRWFjaCgoZWZmZWN0KSA9PiBlZmZlY3QuZHJhdygpKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBiYWxsIGZyb20gXCIuL2JhbGxcIlxuaW1wb3J0ICogYXMgYnJpY2sgZnJvbSBcIi4vYnJpY2tcIlxuaW1wb3J0ICogYXMgdGVtcG9yYXJ5IGZyb20gXCIuL3RlbXBvcmFyeVwiXG5cbmV4cG9ydCB0eXBlIEl0ZW1OYW1lID0ga2V5b2YgdHlwZW9mIGl0ZW1zXG5cbmV4cG9ydCBjbGFzcyBJdGVtPFBhcmFtcyBleHRlbmRzIGFueVtdPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBvbjogYnJpY2suRXZlbnROYW1lLFxuICAgIHB1YmxpYyBpY29uOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBvblRyaWdnZXI6ICh0aGlzOiBicmljay5CcmljaywgLi4ucGFyYW1zOiBQYXJhbXMpID0+IHVua25vd25cbiAgKSB7fVxuXG4gIHRyaWdnZXIoYnJpY2s6IGJyaWNrLkJyaWNrLCAuLi5wYXJhbXM6IFBhcmFtcykge1xuICAgIGNvbnNvbGUubG9nKFwicG93ZXI6XCIsIGJyaWNrLm9wdGlvbnMuaXRlbSlcbiAgICB0aGlzLm9uVHJpZ2dlci5iaW5kKGJyaWNrKSguLi5wYXJhbXMpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGl0ZW1zID0ge1xuICAvLyBib251c1xuICBib21iOiBuZXcgSXRlbTxbYmFsbDogYmFsbC5CYWxsXT4oXCJicm9rZW5cIiwgXCJCT01CXCIsIGZ1bmN0aW9uIChiYWxsKSB7XG4gICAgY29uc3QgcmFuZ2UgPSAzXG4gICAgQXJyYXkuZnJvbSh0aGlzLmdhbWUuYnJpY2tzKVxuICAgICAgLmZpbHRlcigoYnJpY2spID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBicmljayAhPT0gdGhpcyAmJlxuICAgICAgICAgIGJyaWNrLm9wdGlvbnMueCA+IHRoaXMub3B0aW9ucy54IC0gcmFuZ2UgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnggPCB0aGlzLm9wdGlvbnMueCArIHJhbmdlICYmXG4gICAgICAgICAgYnJpY2sub3B0aW9ucy55ID4gdGhpcy5vcHRpb25zLnkgLSByYW5nZSAmJlxuICAgICAgICAgIGJyaWNrLm9wdGlvbnMueSA8IHRoaXMub3B0aW9ucy55ICsgcmFuZ2VcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICAgIC5mb3JFYWNoKChicmljaykgPT4ge1xuICAgICAgICBicmljay5oaXQoYmFsbC5kYW1hZ2VzLCBiYWxsKVxuICAgICAgfSlcbiAgfSksXG4gIGJhbGxUZW1wb3JhcnlTcGVlZERvd246IG5ldyBJdGVtKFwiYnJva2VuXCIsIFwiU0xPV1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5hZGQoXG4gICAgICBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdCh0aGlzLmdhbWUsIHtcbiAgICAgICAgb25CYWxsQ3JlYXRlOiB0cnVlLFxuICAgICAgICBkYXRhOiBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscykuc2xpY2UoMCksXG4gICAgICAgIGNhbmNlbENvbmRpdGlvbjogKGZ4KSA9PiB0aGlzLmdhbWUuYmFsbHMuc2l6ZSA9PT0gMCxcbiAgICAgICAgdXA6IChmeCwgYikgPT4gYlxuICAgICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGIuc3BlZWQgLT0gXy5CQUxMX0JBU0VfU1BFRUQoKSAvIDJcbiAgICAgICAgICAgIHJldHVybiBiXG4gICAgICAgICAgfSkoKVxuICAgICAgICAgIDogZnguZGF0YS5maWx0ZXIoXG4gICAgICAgICAgICAoYmFsbCkgPT4gKGJhbGwuc3BlZWQgLT0gXy5CQUxMX0JBU0VfU1BFRUQoKSAvIDIpID8/IHRydWVcbiAgICAgICAgICApLFxuICAgICAgICBkb3duOiAoZngpID0+XG4gICAgICAgICAgZnguZGF0YS5mb3JFYWNoKChiYWxsKSA9PiAoYmFsbC5zcGVlZCArPSBfLkJBTExfQkFTRV9TUEVFRCgpIC8gMikpLFxuICAgICAgICBvbkRyYXc6IChmeCkgPT4ge1xuICAgICAgICAgIGZ4LmRhdGEuZm9yRWFjaCgoYmFsbCkgPT4ge1xuICAgICAgICAgICAgbm9TdHJva2UoKVxuICAgICAgICAgICAgZmlsbCgwLCAwLCAyNTUsIHJvdW5kKDI1NSAqIDAuMjUpKVxuICAgICAgICAgICAgY2lyY2xlKGJhbGwueCwgYmFsbC55LCBiYWxsLnJhZGl1cyAqIDIpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKVxuICB9KSxcbiAgYmFsbFRlbXBvcmFyeURhbWFnZVVwOiBuZXcgSXRlbShcImJyb2tlblwiLCBcIkRNR1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5hZGQoXG4gICAgICBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdCh0aGlzLmdhbWUsIHtcbiAgICAgICAgb25CYWxsQ3JlYXRlOiB0cnVlLFxuICAgICAgICBkYXRhOiBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscykuc2xpY2UoMCksXG4gICAgICAgIGNhbmNlbENvbmRpdGlvbjogKGZ4KSA9PiB0aGlzLmdhbWUuYmFsbHMuc2l6ZSA9PT0gMCxcbiAgICAgICAgdXA6IChmeCwgYikgPT4gYlxuICAgICAgICAgID8gKCgpID0+IHtcbiAgICAgICAgICAgIGIuZGFtYWdlcysrXG4gICAgICAgICAgICByZXR1cm4gYlxuICAgICAgICAgIH0pKClcbiAgICAgICAgICA6IGZ4LmRhdGEuZmlsdGVyKChiYWxsKSA9PiBiYWxsLmRhbWFnZXMrKyA/PyB0cnVlKSxcbiAgICAgICAgZG93bjogKGZ4KSA9PiBmeC5kYXRhLmZvckVhY2goKGJhbGwpID0+IGJhbGwuZGFtYWdlcy0tKSxcbiAgICAgICAgb25EcmF3OiAoZngpID0+IHtcbiAgICAgICAgICBmeC5kYXRhLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgICAgICAgIHN0cm9rZShcbiAgICAgICAgICAgICAgLi4uXy5CUklDS19CQVNFX0NPTE9SLFxuICAgICAgICAgICAgICBNYXRoLmZsb29yKG1hcChiYWxsLmRhbWFnZXMsIHRoaXMuZ2FtZS5sZXZlbCwgMCwgMjU1LCAwKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHN0cm9rZVdlaWdodChyb3VuZChiYWxsLnJhZGl1cyAvIDcpKVxuICAgICAgICAgICAgbm9GaWxsKClcbiAgICAgICAgICAgIGNpcmNsZShiYWxsLngsIGJhbGwueSwgYmFsbC5yYWRpdXMgKiAyIC0gYmFsbC5yYWRpdXMgLyA3KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIClcbiAgfSksXG4gIGJhbGxUZW1wb3JhcnlTaXplVXA6IG5ldyBJdGVtKFwiYnJva2VuXCIsIFwiQklHXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUudGVtcG9yYXJ5LmFkZChcbiAgICAgIG5ldyB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0KHRoaXMuZ2FtZSwge1xuICAgICAgICBkYXRhOiBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscykuc2xpY2UoMCksXG4gICAgICAgIG9uQmFsbENyZWF0ZTogdHJ1ZSxcbiAgICAgICAgY2FuY2VsQ29uZGl0aW9uOiAoZngpID0+IHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwLFxuICAgICAgICB1cDogKGZ4LCBiKSA9PiBiXG4gICAgICAgICAgPyAoKCkgPT4ge1xuICAgICAgICAgICAgYi5yYWRpdXMgKz0gXy5CQUxMX0JBU0VfUkFESVVTKCkgLyAyXG4gICAgICAgICAgICByZXR1cm4gYlxuICAgICAgICAgIH0pKClcbiAgICAgICAgICA6IGZ4LmRhdGEuZmlsdGVyKFxuICAgICAgICAgICAgKGJhbGwpID0+IChiYWxsLnJhZGl1cyArPSBfLkJBTExfQkFTRV9SQURJVVMoKSAvIDIpID8/IHRydWVcbiAgICAgICAgICApLFxuICAgICAgICBkb3duOiAoZngpID0+XG4gICAgICAgICAgZnguZGF0YS5mb3JFYWNoKChiYWxsKSA9PiAoYmFsbC5yYWRpdXMgLT0gXy5CQUxMX0JBU0VfUkFESVVTKCkgLyAyKSksXG4gICAgICAgIG9uRHJhdzogKCkgPT4gbnVsbCxcbiAgICAgIH0pXG4gICAgKVxuICB9KSxcbiAgLy9iYXJUZW1wb3JhcnlHdW46IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgYmFsbER1cGxpY2F0aW9uOiBuZXcgSXRlbTxbYmFsbDogYmFsbC5CYWxsXT4oXCJicm9rZW5cIiwgXCJcdTIzRkFcdTIzRkFcIiwgZnVuY3Rpb24gKGIpIHtcbiAgICBjb25zdCBuZXdCYWxsID0gdGhpcy5nYW1lLmxhdW5jaEJhbGwoKVxuICAgIG5ld0JhbGwueCA9IGIueFxuICAgIG5ld0JhbGwueSA9IGIueVxuICB9KSxcbiAgLy9iYXJFeHBhbnNpb246IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgLy9zZWN1cml0eTogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLCAvLyBib3R0b20gc2hpZWxkXG5cbiAgLy8gbWFsdXNcbiAgYmFsbFRlbXBvcmFyeVNwZWVkVXA6IG5ldyBJdGVtKFwiYnJva2VuXCIsIFwiU1BFRURcIiwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuYWRkKFxuICAgICAgbmV3IHRlbXBvcmFyeS5UZW1wb3JhcnlFZmZlY3QodGhpcy5nYW1lLCB7XG4gICAgICAgIG9uQmFsbENyZWF0ZTogdHJ1ZSxcbiAgICAgICAgZGF0YTogQXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpLnNsaWNlKDApLFxuICAgICAgICBjYW5jZWxDb25kaXRpb246IChmeCkgPT4gdGhpcy5nYW1lLmJhbGxzLnNpemUgPT09IDAsXG4gICAgICAgIHVwOiAoZngsIGIpID0+IGJcbiAgICAgICAgICA/ICgoKSA9PiB7XG4gICAgICAgICAgICBiLnNwZWVkICs9IF8uQkFMTF9CQVNFX1NQRUVEKCkgLyAyXG4gICAgICAgICAgICByZXR1cm4gYlxuICAgICAgICAgIH0pKClcbiAgICAgICAgICA6IGZ4LmRhdGEuZmlsdGVyKFxuICAgICAgICAgICAgKGJhbGwpID0+IChiYWxsLnNwZWVkICs9IF8uQkFMTF9CQVNFX1NQRUVEKCkgLyAyKSA/PyB0cnVlXG4gICAgICAgICAgKSxcbiAgICAgICAgZG93bjogKGZ4KSA9PlxuICAgICAgICAgIGZ4LmRhdGEuZm9yRWFjaCgoYmFsbCkgPT4gKGJhbGwuc3BlZWQgLT0gXy5CQUxMX0JBU0VfU1BFRUQoKSAvIDIpKSxcbiAgICAgICAgb25EcmF3OiAoZngpID0+IHtcbiAgICAgICAgICBmeC5kYXRhLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKClcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxODIsIDAsIHJvdW5kKDI1NSAqIDAuMjUpKVxuICAgICAgICAgICAgY2lyY2xlKGJhbGwueCwgYmFsbC55LCBiYWxsLnJhZGl1cyAqIDIpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKVxuICB9KSxcbiAgLy9iYXJUZW1wb3JhcnlJbnZpc2liaWxpdHk6IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgLy9icmlja1RlbXBvcmFyeUludmlzaWJpbGl0eTogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLFxuICAvL2JhbGxUZW1wb3JhcnlEYW1hZ2VEb3duOiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7fSksXG4gIC8vYmFyQ29udHJhY3Rpb246IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgLy9icmlja0R1cmFiaWxpdHlVcDogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pXG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBpdGVtIGZyb20gXCIuL2l0ZW1cIlxuaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCJcbmltcG9ydCAqIGFzIGJhbGwgZnJvbSBcIi4vYmFsbFwiXG5pbXBvcnQgKiBhcyBsZXZlbCBmcm9tIFwiLi9sZXZlbFwiXG5cbmV4cG9ydCB0eXBlIEV2ZW50TmFtZSA9IFwiYnJva2VuXCIgfCBcInRvdWNoZWRcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWNrT3B0aW9ucyB7XG4gIHg6IG51bWJlclxuICB5OiBudW1iZXJcbiAgZHVyYWJpbGl0eTogbnVtYmVyXG4gIGl0ZW06IGl0ZW0uSXRlbU5hbWUgfCBudWxsXG59XG5cbmV4cG9ydCBjbGFzcyBCcmljayB7XG4gIHByaXZhdGUgX2R1cmFiaWxpdHk6IG51bWJlclxuICB0b3VjaEJhbGwgPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBnYW1lOiBnYW1lLkdhbWUsIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBCcmlja09wdGlvbnMpIHtcbiAgICB0aGlzLl9kdXJhYmlsaXR5ID0gb3B0aW9ucy5kdXJhYmlsaXR5XG4gIH1cblxuICBzZXREdXJhYmlsaXR5KGR1cmFiaWxpdHk6IG51bWJlciwgYmFsbD86IGJhbGwuQmFsbCkge1xuICAgIHRoaXMuX2R1cmFiaWxpdHkgPSBkdXJhYmlsaXR5XG4gICAgaWYgKHRoaXMuX2R1cmFiaWxpdHkgPD0gMCkge1xuICAgICAgdGhpcy5raWxsKGJhbGwpXG4gICAgfVxuICB9XG5cbiAgZ2V0IGR1cmFiaWxpdHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZHVyYWJpbGl0eVxuICB9XG5cbiAgZ2V0IHNjcmVlblgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnggKiB0aGlzLmdhbWUuQlJJQ0tfV0lEVEhcbiAgfVxuXG4gIGdldCBzY3JlZW5ZKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy55ICogdGhpcy5nYW1lLkJSSUNLX0hFSUdIVFxuICB9XG5cbiAgZ2V0IGl0ZW0oKTogdHlwZW9mIGl0ZW0uaXRlbXNba2V5b2YgdHlwZW9mIGl0ZW0uaXRlbXNdIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5pdGVtICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaXRlbS5pdGVtc1t0aGlzLm9wdGlvbnMuaXRlbV1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgZHJhdygpIHtcbiAgICBzdHJva2UoXy5CQUNLR1JPVU5EX0NPTE9SKVxuICAgIHN0cm9rZVdlaWdodCh0aGlzLnRvdWNoQmFsbCA/IDQgOiAxKVxuICAgIGZpbGwoXG4gICAgICAuLi5fLkJSSUNLX0JBU0VfQ09MT1IubWFwKChmYWN0b3IpID0+IHtcbiAgICAgICAgcmV0dXJuIGZhY3RvciArIChNYXRoLnJhbmRvbSgpIDw9IC41ID8gLSAyMCA6IDIwKVxuICAgICAgfSkgYXMgUkdCLFxuICAgICAgTWF0aC5mbG9vcihtYXAodGhpcy5kdXJhYmlsaXR5LCB0aGlzLmdhbWUubGV2ZWwsIDAsIDI1NSwgMCkpXG4gICAgKVxuICAgIHJlY3QoXG4gICAgICB0aGlzLnNjcmVlblgsXG4gICAgICB0aGlzLnNjcmVlblksXG4gICAgICB0aGlzLmdhbWUuQlJJQ0tfV0lEVEgsXG4gICAgICB0aGlzLmdhbWUuQlJJQ0tfSEVJR0hULFxuICAgICAgdGhpcy5nYW1lLkJSSUNLX0hFSUdIVCAvIDRcbiAgICApXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pdGVtICE9PSBudWxsKSB7XG4gICAgICBub1N0cm9rZSgpXG4gICAgICBmaWxsKDI1NSlcbiAgICAgIHRleHRTaXplKHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyKVxuICAgICAgdGV4dChcbiAgICAgICAgdGhpcy5pdGVtLmljb24sXG4gICAgICAgIHRoaXMuc2NyZWVuWCArIHRoaXMuZ2FtZS5CUklDS19XSURUSCAvIDIsXG4gICAgICAgIHRoaXMuc2NyZWVuWSArIHRoaXMuZ2FtZS5CUklDS19IRUlHSFQgLyAyXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgaGl0KGRhbWFnZXM6IG51bWJlciwgYmFsbD86IGJhbGwuQmFsbCkge1xuICAgIGlmICh0aGlzLmR1cmFiaWxpdHkgPD0gMCkgcmV0dXJuXG5cbiAgICBpZiAodGhpcy5pdGVtPy5vbiA9PT0gXCJ0b3VjaGVkXCIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5vcHRpb25zLml0ZW0gPT09IFwiYmFsbER1cGxpY2F0aW9uXCIgfHxcbiAgICAgICAgdGhpcy5vcHRpb25zLml0ZW0gPT09IFwiYm9tYlwiXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5pdGVtLnRyaWdnZXIodGhpcywgYmFsbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIDsodGhpcy5pdGVtIGFzIGl0ZW0uSXRlbTxbXT4pLnRyaWdnZXIodGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdhbWUuc2NvcmUgKz0gZGFtYWdlc1xuICAgIHRoaXMuc2V0RHVyYWJpbGl0eSh0aGlzLmR1cmFiaWxpdHkgLSBkYW1hZ2VzLCBiYWxsKVxuICB9XG5cbiAga2lsbChiYWxsPzogYmFsbC5CYWxsKSB7XG4gICAgaWYgKCF0aGlzLmdhbWUuYnJpY2tzLmhhcyh0aGlzKSkgcmV0dXJuXG5cbiAgICBpZiAodGhpcy5pdGVtPy5vbiA9PT0gXCJicm9rZW5cIikge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLm9wdGlvbnMuaXRlbSA9PT0gXCJiYWxsRHVwbGljYXRpb25cIiB8fFxuICAgICAgICB0aGlzLm9wdGlvbnMuaXRlbSA9PT0gXCJib21iXCJcbiAgICAgICkge1xuICAgICAgICB0aGlzLml0ZW0udHJpZ2dlcih0aGlzLCBiYWxsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgOyh0aGlzLml0ZW0gYXMgaXRlbS5JdGVtPFtdPikudHJpZ2dlcih0aGlzKVxuICAgICAgfVxuICAgICAgdGhpcy5vcHRpb25zLml0ZW0gPSBudWxsXG4gICAgfVxuXG4gICAgdGhpcy5nYW1lLmJyaWNrcy5kZWxldGUodGhpcylcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCJcbmltcG9ydCAqIGFzIGl0ZW0gZnJvbSBcIi4vaXRlbVwiXG5pbXBvcnQgKiBhcyBicmljayBmcm9tIFwiLi9icmlja1wiXG5cbmV4cG9ydCB0eXBlIExldmVsU2hhcGUgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IGJvb2xlYW5cbmV4cG9ydCB0eXBlIExldmVsSXRlbXMgPSAoZ2FtZTogZ2FtZS5HYW1lKSA9PiB1bmtub3duXG5cbmV4cG9ydCBjb25zdCBsZXZlbFNoYXBlczogTGV2ZWxTaGFwZVtdID0gW1xuICAoeCwgeSkgPT4geCA+IDIgJiYgeCA8IF8uR1JJRF9XSURUSCAtIDMgJiYgeSA+IDIsXG4gICh4LCB5KSA9PiB4IDwgMiB8fCB4ID4gXy5HUklEX1dJRFRIIC0gMyB8fCB5IDwgMiB8fCB5ID4gXy5HUklEX0hFSUdIVCAtIDMsXG4gICh4LCB5KSA9PiB4ICUgMiA9PT0gMCB8fCB5ICUgMyA9PT0gMCxcbl1cblxuZXhwb3J0IGNvbnN0IGxldmVsSXRlbXM6IExldmVsSXRlbXNbXSA9IFtcbiAgKGdhbWUpID0+IHtcbiAgICBPYmplY3Qua2V5cyhpdGVtLml0ZW1zKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImluamVjdGVkOlwiLCAzLCBuYW1lKVxuICAgICAgaW5qZWN0SXRlbXMoZ2FtZSwgMywgbmFtZSBhcyBpdGVtLkl0ZW1OYW1lKVxuICAgIH0pXG4gIH0sXG5dXG5cbmZ1bmN0aW9uIGluamVjdEl0ZW1zKGdhbWU6IGdhbWUuR2FtZSwgY291bnQ6IG51bWJlciwgaXRlbU5hbWU6IGl0ZW0uSXRlbU5hbWUpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgbGV0IHJhbmQ6IGJyaWNrLkJyaWNrID0gcmFuZG9tKEFycmF5LmZyb20oZ2FtZS5icmlja3MpKVxuXG4gICAgd2hpbGUgKHJhbmQub3B0aW9ucy5pdGVtICE9PSBudWxsKSB7XG4gICAgICByYW5kID0gcmFuZG9tKEFycmF5LmZyb20oZ2FtZS5icmlja3MpKVxuICAgIH1cblxuICAgIHJhbmQub3B0aW9ucy5pdGVtID0gaXRlbU5hbWVcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBTY2VuZXMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3R2FtZSgpIHtcbiAgICBpZiAobW91c2VJc1ByZXNzZWQgfHwga2V5SXNQcmVzc2VkKVxuICAgICAgZnJhbWVSYXRlKE1hdGgucm91bmQodGhpcy5nYW1lLmZyYW1lcmF0ZSAqIDUpKVxuICAgIGVsc2UgZnJhbWVSYXRlKHRoaXMuZ2FtZS5mcmFtZXJhdGUpXG5cbiAgICB0aGlzLnNjb3JlKClcbiAgICB0aGlzLmhpZ2hTY29yZSgpXG4gICAgdGhpcy5ocEFuZExldmVsKClcbiAgICB0aGlzLnNwZWVkKClcblxuICAgIHRoaXMuZ2FtZS5iYXIuZHJhdygpXG5cbiAgICB0aGlzLmdhbWUuYnJpY2tzLmZvckVhY2goKGIpID0+IGIuZHJhdygpKVxuICAgIHRoaXMuZ2FtZS5iYWxscy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcblxuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuZHJhdygpXG5cbiAgICBpZiAodGhpcy5nYW1lLmJyaWNrcy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmdhbWUubGV2ZWwrK1xuICAgICAgdGhpcy5nYW1lLmJhbGxzLmNsZWFyKClcbiAgICAgIHRoaXMuZ2FtZS5sYXVuY2hCYWxsKClcbiAgICAgIHRoaXMuZ2FtZS5zZXRHcmlkU2hhcGUoKVxuICAgICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5lZmZlY3RzLmNsZWFyKClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjb3JlKCkge1xuICAgIGZpbGwoNTApXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDIwKSlcbiAgICB0ZXh0KGBTY29yZTogJHt0aGlzLmdhbWUuc2NvcmV9YCwgd2lkdGggLyAyLCBoZWlnaHQgKiAwLjUpXG4gIH1cblxuICBwcml2YXRlIGhpZ2hTY29yZSgpIHtcbiAgICBmaWxsKDQ1KVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAzNSkpXG4gICAgdGV4dChgSGlnaCBTY29yZTogJHt0aGlzLmdhbWUuaGlnaFNjb3JlfWAsIHdpZHRoIC8gMiwgaGVpZ2h0ICogMC41OClcbiAgfVxuXG4gIHByaXZhdGUgaHBBbmRMZXZlbCgpIHtcbiAgICBmaWxsKDMwKVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAyMCkpXG4gICAgdGV4dChcbiAgICAgIGBMdmwuJHt0aGlzLmdhbWUubGV2ZWx9IC0gJHt0aGlzLmdhbWUuaHB9IGhwYCxcbiAgICAgIHdpZHRoIC8gMixcbiAgICAgIGhlaWdodCAqIDAuNjhcbiAgICApXG4gIH1cblxuICBwcml2YXRlIHNwZWVkKCkge1xuICAgIGZpbGwoMjUpXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcIm5vcm1hbFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMjUpKVxuICAgIHRleHQoXG4gICAgICBgU3BlZWQgeCR7QXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpWzBdPy5zcGVlZC50b0ZpeGVkKDEpID8/IDB9YCxcbiAgICAgIHdpZHRoIC8gMixcbiAgICAgIGhlaWdodCAqIDAuNzlcbiAgICApXG4gIH1cblxuICBkcmF3R2FtZU92ZXIoKSB7XG4gICAgdGhpcy5nYW1lT3ZlcigwLjQpXG4gICAgdGhpcy5idXR0b24oXCJSZXRyeVwiLCAwLjYsICgpID0+IHRoaXMuZ2FtZS5yZXN0YXJ0KCkpXG4gIH1cblxuICB0aXRsZSgpIHt9XG5cbiAgcHJpdmF0ZSBnYW1lT3ZlcihoOiBudW1iZXIpIHtcbiAgICBmaWxsKDEwMCwgMCwgMClcbiAgICBub1N0cm9rZSgpXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMTApKVxuICAgIHRleHQoYEdBTUUgT1ZFUmAsIHdpZHRoIC8gMiArIE1hdGguY29zKERhdGUubm93KCkgLyAxMDAwMCksIGhlaWdodCAqIGgpXG4gIH1cblxuICBwcml2YXRlIGJ1dHRvbihjb250ZW50OiBzdHJpbmcsIGg6IG51bWJlciwgb25DbGljazogKCkgPT4gdW5rbm93bikge1xuICAgIGNvbnN0IHkgPSBoZWlnaHQgKiBoXG4gICAgY29uc3QgaG92ZXIgPSBtb3VzZVkgPiB5IC0gaGVpZ2h0IC8gMTAgJiYgbW91c2VZIDwgeSArIGhlaWdodCAvIDEwXG5cbiAgICBmaWxsKGhvdmVyID8gMjU1IDogMjAwKVxuICAgIHN0cm9rZShob3ZlciA/IDEwMCA6IDUwKVxuICAgIHN0cm9rZVdlaWdodChob3ZlciA/IHdpZHRoIC8gNzUgOiB3aWR0aCAvIDEwMClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAyMCkpXG4gICAgdGV4dChjb250ZW50LCB3aWR0aCAvIDIsIHkpXG5cbiAgICBpZiAoaG92ZXIgJiYgbW91c2VJc1ByZXNzZWQpIG9uQ2xpY2soKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBiYXIgZnJvbSBcIi4vYmFyXCJcbmltcG9ydCAqIGFzIGJhbGwgZnJvbSBcIi4vYmFsbFwiXG5pbXBvcnQgKiBhcyBpdGVtIGZyb20gXCIuL2l0ZW1cIlxuaW1wb3J0ICogYXMgYnJpY2sgZnJvbSBcIi4vYnJpY2tcIlxuaW1wb3J0ICogYXMgbGV2ZWwgZnJvbSBcIi4vbGV2ZWxcIlxuaW1wb3J0ICogYXMgc2NlbmVzIGZyb20gXCIuL3NjZW5lc1wiXG5pbXBvcnQgKiBhcyB0ZW1wb3JhcnkgZnJvbSBcIi4vdGVtcG9yYXJ5XCJcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICBocCA9IF8uQkFTRV9IUFxuICBiYXI6IGJhci5CYXJcbiAgYmFsbHMgPSBuZXcgU2V0PGJhbGwuQmFsbD4oKVxuICBicmlja3MgPSBuZXcgU2V0PGJyaWNrLkJyaWNrPigpXG4gIGZyYW1lcmF0ZSA9IF8uRlJBTUVSQVRFXG4gIGxldmVsID0gMVxuICBzY2VuZXM6IHNjZW5lcy5TY2VuZXNcbiAgZmluaXNoID0gZmFsc2VcbiAgdGVtcG9yYXJ5OiB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0TWFuYWdlclxuXG4gIHByaXZhdGUgX3Njb3JlID0gMFxuICBwcml2YXRlIF9oaWdoU2NvcmUgPSBOdW1iZXIobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoU2NvcmVcIikgPz8gMClcblxuICByZWFkb25seSBCUklDS19XSURUSCA9IHdpZHRoIC8gXy5HUklEX1dJRFRIXG4gIHJlYWRvbmx5IEJSSUNLX0hFSUdIVCA9IHRoaXMuQlJJQ0tfV0lEVEggLyBfLkFTUEVDVF9SQVRJT1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB3aW5kb3cuZ2FtZSA9IHRoaXNcblxuICAgIHRoaXMucmVzdGFydCgpXG4gIH1cblxuICBzZXQgc2NvcmUoc2NvcmU6IG51bWJlcikge1xuICAgIHRoaXMuX3Njb3JlID0gc2NvcmVcblxuICAgIGlmICh0aGlzLl9zY29yZSA+IHRoaXMuaGlnaFNjb3JlKSB7XG4gICAgICB0aGlzLmhpZ2hTY29yZSA9IHRoaXMuX3Njb3JlXG4gICAgfVxuICB9XG5cbiAgZ2V0IHNjb3JlKCkge1xuICAgIHJldHVybiB0aGlzLl9zY29yZVxuICB9XG5cbiAgc2V0IGhpZ2hTY29yZShzY29yZTogbnVtYmVyKSB7XG4gICAgdGhpcy5faGlnaFNjb3JlID0gc2NvcmVcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZVwiLCBTdHJpbmcodGhpcy5faGlnaFNjb3JlKSlcbiAgfVxuXG4gIGdldCBoaWdoU2NvcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hpZ2hTY29yZVxuICB9XG5cbiAgZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKC4uLl8uQkFDS0dST1VORF9DT0xPUilcblxuICAgIGlmICh0aGlzLmhwID4gMCkgdGhpcy5zY2VuZXMuZHJhd0dhbWUoKVxuICAgIGVsc2UgaWYgKCF0aGlzLmZpbmlzaCkgdGhpcy5maW5pc2ggPSB0cnVlXG4gICAgZWxzZSBpZiAodGhpcy5maW5pc2gpIHRoaXMuc2NlbmVzLmRyYXdHYW1lT3ZlcigpXG4gICAgZWxzZSB0aGlzLnNjZW5lcy50aXRsZSgpXG4gIH1cblxuICByZXN0YXJ0KCkge1xuICAgIHRoaXMuYmFyID0gbmV3IGJhci5CYXIodGhpcylcbiAgICB0aGlzLnNjZW5lcyA9IG5ldyBzY2VuZXMuU2NlbmVzKHRoaXMpXG4gICAgdGhpcy50ZW1wb3JhcnkgPSBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdE1hbmFnZXIodGhpcylcblxuICAgIHRoaXMuaHAgPSBfLkJBU0VfSFBcbiAgICB0aGlzLmxldmVsID0gMVxuICAgIHRoaXMuc2NvcmUgPSAwXG4gICAgdGhpcy5maW5pc2ggPSBmYWxzZVxuICAgIHRoaXMuZnJhbWVyYXRlID0gXy5GUkFNRVJBVEVcblxuICAgIHRoaXMuYmFsbHMuY2xlYXIoKVxuXG4gICAgdGhpcy5zZXRHcmlkU2hhcGUoKVxuICAgIHRoaXMubGF1bmNoQmFsbCgpXG4gIH1cblxuICBsYXVuY2hCYWxsKCkge1xuICAgIGZvcihjb25zdCBmeCBvZiBBcnJheS5mcm9tKHRoaXMudGVtcG9yYXJ5LmVmZmVjdHMpKSB7XG4gICAgICBpZihmeC5vcHRpb25zLm9uQmFsbENyZWF0ZSkgZngub3B0aW9ucy51cChmeC5vcHRpb25zLCBiYWxsKVxuICAgIH1cbiAgICBjb25zdCBuZXdCYWxsID0gbmV3IGJhbGwuQmFsbCh0aGlzKVxuICAgIHRoaXMuYmFsbHMuYWRkKG5ld0JhbGwpXG4gICAgcmV0dXJuIG5ld0JhbGxcbiAgfVxuXG4gIHNldEdyaWRTaGFwZSgpIHtcbiAgICB0aGlzLmJyaWNrcy5jbGVhcigpXG5cbiAgICBjb25zdCBsZXZlbFNoYXBlSW5kZXggPSBNYXRoLmZsb29yKFxuICAgICAgKHRoaXMubGV2ZWwgLSAxKSAlIGxldmVsLmxldmVsU2hhcGVzLmxlbmd0aFxuICAgIClcbiAgICBjb25zdCBsZXZlbEl0ZW1zSW5kZXggPSBNYXRoLmZsb29yKFxuICAgICAgKHRoaXMubGV2ZWwgLSAxKSAlIGxldmVsLmxldmVsSXRlbXMubGVuZ3RoXG4gICAgKVxuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBfLkdSSURfV0lEVEg7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBfLkdSSURfSEVJR0hUOyB5KyspIHtcbiAgICAgICAgaWYgKGxldmVsLmxldmVsU2hhcGVzW2xldmVsU2hhcGVJbmRleF0oeCwgeSkpIHtcbiAgICAgICAgICB0aGlzLmJyaWNrcy5hZGQoXG4gICAgICAgICAgICBuZXcgYnJpY2suQnJpY2sodGhpcywge1xuICAgICAgICAgICAgICB4LFxuICAgICAgICAgICAgICB5LFxuICAgICAgICAgICAgICBkdXJhYmlsaXR5OiB0aGlzLmxldmVsLFxuICAgICAgICAgICAgICBpdGVtOiBudWxsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXZlbC5sZXZlbEl0ZW1zW2xldmVsSXRlbXNJbmRleF0odGhpcylcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBTyxNQUFNLGVBQWUsS0FBSztBQUMxQixNQUFNLGFBQWE7QUFDbkIsTUFBTSxjQUFjO0FBQ3BCLE1BQU0sbUJBQXdCLENBQUMsR0FBRyxHQUFHO0FBQ3JDLE1BQU0sa0JBQWtCLE1BQU0sUUFBUTtBQUN0QyxNQUFNLG1CQUFtQixNQUFNLFFBQVE7QUFDdkMsTUFBTSx1QkFBdUI7QUFDN0IsTUFBTSxVQUFVO0FBQ2hCLE1BQU0sYUFBYTtBQUNuQixNQUFNLGNBQWM7QUFDcEIsTUFBTSxZQUFZO0FBQ2xCLE1BQU0sWUFBWTtBQUNsQixNQUFNLG1CQUF3QixDQUFDLEdBQUcsS0FBSzs7O0FDVnZDLGtCQUFVO0FBQUEsSUFPZixZQUFvQixPQUFpQjtBQUFqQjtBQU5wQixlQUFJLFFBQVE7QUFDWixlQUFJLFNBQVM7QUFDYixtQkFBUSxRQUFRO0FBQ2hCLG9CQUFTLEtBQUssUUFBUTtBQUN0Qix3QkFBYTtBQUFBO0FBQUEsSUFJYixPQUFPO0FBQ0wsV0FBSztBQUNMLGdCQUFVLEtBQUssR0FBRyxLQUFLO0FBQ3ZCO0FBQ0EsV0FBSyxJQUFJLElBQUk7QUFDYixXQUNHLEtBQUssUUFBUSxJQUFLLElBQ2xCLEtB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
