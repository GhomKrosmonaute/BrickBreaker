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
  var BALL_MAX_SPEED = () => BALL_BASE_SPEED() * 5;
  var BALL_BASE_RADIUS = () => width * 7e-3;
  var BALL_SPEED_BUFF = () => BALL_BASE_SPEED() / 5;
  var BAR_BASE_WIDTH = () => width * 0.1;
  var BRICK_WIDTH = () => width / GRID_WIDTH;
  var BRICK_HEIGHT = () => BRICK_WIDTH() / ASPECT_RATIO;
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
      this.width = BAR_BASE_WIDTH();
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
          let vel = ball2.velocity;
          ball2.velocity = {
            x: vel.x,
            y: -abs(vel.y)
          };
          if (ball2.x < this.x - this.width / 4) {
            ball2.angle -= map(ball2.x, this.x - this.width / 4, this.x - this.width / 2, 1, 15);
            ball2.angle = constrain(ball2.angle, -178, -2);
          }
          if (ball2.x > this.x + this.width / 4) {
            ball2.angle -= map(ball2.x, this.x + this.width / 4, this.x + this.width / 2, 1, 15);
            ball2.angle = constrain(ball2.angle, -178, -2);
          }
          vel = ball2.velocity;
          if (ball2.x <= this.x - this.width / 2) {
            ball2.x = this.x - this.width / 2 - ball2.radius;
            ball2.velocity = {
              x: -abs(vel.x),
              y: -abs(vel.y)
            };
          } else if (ball2.x >= this.x + this.width / 2) {
            ball2.x = this.x + this.width / 2 + ball2.radius;
            ball2.velocity = {
              x: abs(vel.x),
              y: -abs(vel.y)
            };
          } else {
            ball2.y = this.y - this.height / 2 - ball2.radius;
          }
        } else {
          this.touchTimes = 0;
        }
      });
    }
    move() {
      var _a2, _b;
      const x = (_b = (_a2 = Array.from(this.game.balls)[0]) == null ? void 0 : _a2.x) != null ? _b : mouseX;
      const y = this.y + (mouseY - this.y) / 4;
      this.x = min(max(x, this.width / 2), width - this.width / 2);
      this.y = min(max(y, height * 0.9), height - this.height / 2);
    }
  };

  // src/ball.ts
  var Ball = class {
    constructor(game2) {
      this.game = game2;
      this.angle = 0;
      this.x = width / 2;
      this.y = height * 0.8;
      this.tail = [];
      this.angle = random(-179, -1);
    }
    get speed() {
      return this.game.ballSpeed;
    }
    set speed(speed) {
      const newSpeed = constrain(speed, BALL_MAX_SPEED(), BALL_BASE_SPEED());
      if (this.game.ballSpeed !== newSpeed)
        console.log("update speed:", Math.round(this.game.ballSpeed - speed));
      this.game.ballSpeed = newSpeed;
    }
    get radius() {
      return this.game.ballRadius;
    }
    get damages() {
      return this.game.ballDamages;
    }
    set damages(damages) {
      this.game.ballDamages = damages;
    }
    get velocity() {
      return {
        x: cos(this.angle) * this.speed,
        y: sin(this.angle) * this.speed
      };
    }
    set velocity(vel) {
      this.angle = degrees(atan2(vel.y, vel.x));
    }
    flipVelocity(bar2) {
      console.log("ball velocity flip:", bar2);
      const vel = this.velocity;
      switch (bar2) {
        case "diagonal":
          vel.x *= -1;
          vel.y *= -1;
          break;
        case "horizontal":
          vel.y *= -1;
          break;
        case "vertical":
          vel.x *= -1;
      }
      this.velocity = vel;
    }
    draw() {
      this.update();
      const vel = this.velocity;
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
   x=${vel.x}
    y=${vel.y}`, this.x + this.radius, this.y + this.radius);
    }
    update() {
      this.save();
      this.checkFail();
      this.bricks();
      this.move();
      this.bounds();
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
      }
    }
    bounds() {
      if (this.x + this.radius + this.speed >= width || this.x - this.radius <= this.speed) {
        this.flipVelocity("vertical");
      }
      if (this.y - this.radius <= this.speed) {
        this.flipVelocity("horizontal");
      }
      this.x = constrain(this.x, this.radius + 1, width - this.radius - 1);
      this.y = max(this.y, this.radius + 1);
    }
    bricks() {
      const brick2 = Array.from(this.game.bricks).sort((a, b) => {
        return dist(a.screenX + BRICK_WIDTH() / 2, a.screenY + BRICK_HEIGHT() / 2, this.x, this.y) - dist(b.screenX + BRICK_WIDTH() / 2, b.screenY + BRICK_HEIGHT() / 2, this.x, this.y);
      })[0];
      if (!brick2)
        return;
      const innerX = this.x > brick2.screenX && this.x < brick2.screenX + BRICK_WIDTH();
      const innerY = this.y + this.radius > brick2.screenY && this.y - this.radius < brick2.screenY + BRICK_HEIGHT();
      let touch = false;
      if (this.y + this.radius > brick2.screenY && this.y < brick2.screenY + BRICK_HEIGHT() / 2 && innerX) {
        this.flipVelocity("horizontal");
        this.y = brick2.screenY - this.radius;
        touch = true;
      } else if (this.y - this.radius < brick2.screenY + BRICK_HEIGHT() && this.y > brick2.screenY + BRICK_HEIGHT() / 2 && innerX) {
        this.flipVelocity("horizontal");
        this.y = brick2.screenY + BRICK_HEIGHT() + this.radius;
        touch = true;
      } else if (this.x + this.radius > brick2.screenX && this.x < brick2.screenX + BRICK_WIDTH() / 2 && innerY) {
        this.flipVelocity("vertical");
        this.x = brick2.screenX - this.radius;
        touch = true;
      } else if (this.x - this.radius < brick2.screenX + BRICK_WIDTH() && this.x > brick2.screenX + BRICK_WIDTH() / 2 && innerY) {
        this.flipVelocity("vertical");
        this.x = brick2.screenX + BRICK_WIDTH() + this.radius;
        touch = true;
      }
      brick2.touchBall = touch;
      if (touch)
        brick2.hit(this.game.ballDamages, this);
    }
    move() {
      const vel = this.velocity;
      this.x += vel.x;
      this.y += vel.y;
    }
    onFail() {
      this.game.launchBall();
      this.game.hp--;
    }
  };

  // src/temporary.ts
  var TemporaryEffect = class {
    constructor(game2, itemName, options) {
      this.game = game2;
      this.itemName = itemName;
      this.down = false;
      this.options = __spreadProps(__spreadValues({}, options), {
        startAt: frameCount
      });
      options.up.bind(options)(options);
    }
    draw() {
      this.options.onDraw(this.options);
      this.update();
    }
    update() {
      var _a2, _b;
      if (this.options.startAt > frameCount + BASE_EFFECT_DURATION || ((_b = (_a2 = this.options).cancelCondition) == null ? void 0 : _b.call(_a2, this.options)) || this.down) {
        this.options.down.bind(this.options)(this.options);
        this.game.temporary.effects.delete(this.itemName);
      }
    }
  };
  var TemporaryEffectManager = class {
    constructor(game2) {
      this.game = game2;
      this.effects = new Map();
    }
    add(itemName, effect) {
      this.effects.set(itemName, effect);
    }
    draw() {
      let i = 0;
      this.effects.forEach((effect, itemName) => {
        i++;
        effect.draw();
        fill(200);
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(BALL_BASE_RADIUS());
        text(itemName, width / 10, BALL_BASE_RADIUS() * 2 * i);
      });
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
    bomb: new Item("broken", "BOMB", function(ball2) {
      const range = 3;
      Array.from(this.game.bricks).filter((brick2) => {
        return brick2 !== this && brick2.options.x > this.options.x - range && brick2.options.x < this.options.x + range && brick2.options.y > this.options.y - range && brick2.options.y < this.options.y + range;
      }).forEach((brick2) => {
        brick2.hit(ball2.damages, ball2);
      });
    }),
    ballTemporarySpeedDown: new Item("broken", "SLOW", function() {
      this.game.temporary.add("ballTemporarySpeedDown", new TemporaryEffect(this.game, "ballTemporarySpeedDown", {
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: () => this.game.ballSpeed -= BALL_SPEED_BUFF(),
        down: () => this.game.ballSpeed += BALL_SPEED_BUFF(),
        onDraw: () => {
          this.game.balls.forEach((ball2) => {
            noStroke();
            fill(0, 0, 255, round(255 * 0.25));
            circle(ball2.x, ball2.y, ball2.radius * 2);
          });
        }
      }));
    }),
    ballTemporaryDamageUp: new Item("broken", "DMG", function() {
      this.game.temporary.add("ballTemporaryDamageUp", new TemporaryEffect(this.game, "ballTemporaryDamageUp", {
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: () => this.game.ballDamages++,
        down: () => this.game.ballDamages--,
        onDraw: () => {
          this.game.balls.forEach((ball2) => {
            stroke(...BRICK_BASE_COLOR, Math.floor(map(ball2.damages, this.game.level, 0, 255, 0)));
            strokeWeight(round(ball2.radius / 7));
            noFill();
            circle(ball2.x, ball2.y, ball2.radius * 2 - ball2.radius / 7);
          });
        }
      }));
    }),
    ballTemporarySizeUp: new Item("broken", "BIG", function() {
      this.game.temporary.add("ballTemporarySizeUp", new TemporaryEffect(this.game, "ballTemporarySizeUp", {
        cancelCondition: () => this.game.balls.size === 0,
        up: () => this.game.ballRadius += BALL_BASE_RADIUS() / 2,
        down: () => this.game.ballRadius -= BALL_BASE_RADIUS() / 2,
        onDraw: () => null
      }));
    }),
    ballDuplication: new Item("broken", "\u23FA\u23FA", function(b) {
      const newBall = this.game.launchBall();
      newBall.x = b.x;
      newBall.y = b.y;
    }),
    barExpansion: new Item("broken", "<->", function() {
      this.game.temporary.add("barExpansion", new TemporaryEffect(this.game, "barExpansion", {
        up: () => this.game.bar.width += BAR_BASE_WIDTH() / 3,
        down: () => this.game.bar.width -= BAR_BASE_WIDTH() / 3,
        onDraw: () => null
      }));
    }),
    ballTemporarySpeedUp: new Item("broken", "SPEED", function() {
      this.game.temporary.add("ballTemporarySpeedUp", new TemporaryEffect(this.game, "ballTemporarySpeedUp", {
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: () => this.game.ballSpeed += BALL_SPEED_BUFF(),
        down: () => this.game.ballSpeed -= BALL_SPEED_BUFF(),
        onDraw: () => {
          this.game.balls.forEach((ball2) => {
            noStroke();
            fill(255, 182, 0, round(255 * 0.25));
            circle(ball2.x, ball2.y, ball2.radius * 2);
          });
        }
      }));
    }),
    barContraction: new Item("broken", ">-<", function() {
      this.game.temporary.add("barContraction", new TemporaryEffect(this.game, "barContraction", {
        up: () => this.game.bar.width -= BAR_BASE_WIDTH() / 3,
        down: () => this.game.bar.width += BAR_BASE_WIDTH() / 3,
        onDraw: () => null
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
    setDurability(durability, ball2) {
      this._durability = durability;
      if (this._durability <= 0) {
        this.kill(ball2);
      }
    }
    get durability() {
      return this._durability;
    }
    get screenX() {
      return this.options.x * BRICK_WIDTH();
    }
    get screenY() {
      return this.options.y * BRICK_HEIGHT();
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
      rect(this.screenX, this.screenY, BRICK_WIDTH(), BRICK_HEIGHT(), BRICK_HEIGHT() / 4);
      if (this.options.item !== null) {
        noStroke();
        fill(255);
        textSize(BRICK_HEIGHT() / 2);
        text(this.item.icon, this.screenX + BRICK_WIDTH() / 2, this.screenY + BRICK_HEIGHT() / 2);
      }
    }
    hit(damages, ball2) {
      var _a2;
      if (this.durability <= 0)
        return;
      if (((_a2 = this.item) == null ? void 0 : _a2.on) === "touched") {
        if (this.options.item === "ballDuplication" || this.options.item === "bomb") {
          this.item.trigger(this, ball2);
        } else {
          ;
          this.item.trigger(this);
        }
      }
      this.game.score += damages;
      this.setDurability(this.durability - damages, ball2);
    }
    kill(ball2) {
      var _a2;
      if (!this.game.bricks.has(this))
        return;
      if (((_a2 = this.item) == null ? void 0 : _a2.on) === "broken") {
        if (this.options.item === "ballDuplication" || this.options.item === "bomb") {
          this.item.trigger(this, ball2);
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
      if (this.game.bricks.size === 0) {
        this.game.temporary.effects.clear();
        this.game.level++;
        this.game.balls.clear();
        this.game.launchBall();
        this.game.setGridShape();
      } else {
        if (mouseIsPressed || keyIsPressed)
          frameRate(Math.round(this.game.framerate * 5));
        else
          frameRate(this.game.framerate);
        this.score();
        this.highScore();
        this.hpAndLevel();
        this.speed();
        this.game.bar.draw();
        if (frameCount % 10 === 0 && Math.random() <= 0.5) {
          const brick1 = random(Array.from(this.game.bricks));
          const brick2 = random(Array.from(this.game.bricks));
          if (brick1 !== brick2 && brick1 && brick2) {
            const tempX = brick2.options.x;
            brick2.options.x = brick1.options.x;
            brick1.options.x = tempX;
            const tempY = brick2.options.y;
            brick2.options.y = brick1.options.y;
            brick1.options.y = tempY;
          }
        }
        this.game.bricks.forEach((b) => b.draw());
        this.game.balls.forEach((b) => b.draw());
        this.game.temporary.draw();
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
      this.ballRadius = BALL_BASE_RADIUS();
      this.ballSpeed = BALL_BASE_SPEED();
      this.ballDamages = 1;
      this._score = 0;
      this._highScore = Number((_a = localStorage.getItem("highScore")) != null ? _a : 0);
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
      this.ballRadius = BALL_BASE_RADIUS();
      this.ballSpeed = BALL_BASE_SPEED();
      this.ballDamages = 1;
      this.balls.clear();
      this.setGridShape();
      this.launchBall();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2Jhci50cyIsICJzcmMvYmFsbC50cyIsICJzcmMvdGVtcG9yYXJ5LnRzIiwgInNyYy9pdGVtLnRzIiwgInNyYy9icmljay50cyIsICJzcmMvbGV2ZWwudHMiLCAic3JjL3NjZW5lcy50cyIsICJzcmMvZ2FtZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8vIEB0cy1jaGVja1xuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMvcDUvZ2xvYmFsLmQudHNcIiAvPlxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpXG5cbmxldCBnYW1lOiBHYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLm1heChcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgd2luZG93LmlubmVyV2lkdGggfHwgMFxuICApXG4gIGNvbnN0IHdpbmRvd0hlaWdodCA9IE1hdGgubWF4KFxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsXG4gICAgd2luZG93LmlubmVySGVpZ2h0IHx8IDBcbiAgKVxuXG4gIGNvbnN0IF93aWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCB3aW5kb3dIZWlnaHQgKiBfLkFTUEVDVF9SQVRJTylcbiAgY29uc3QgX2hlaWdodCA9IF93aWR0aCAvIF8uQVNQRUNUX1JBVElPXG5cbiAgY3JlYXRlQ2FudmFzKF93aWR0aCwgX2hlaWdodClcblxuICBpZiAoXy5OT19TTU9PVEgpIG5vU21vb3RoKClcbiAgZnJhbWVSYXRlKDYwKVxuXG4gIGdhbWUgPSBuZXcgR2FtZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xuICBnYW1lLmRyYXcoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ga2V5UHJlc3NlZCgpIHt9XG5leHBvcnQgZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7fVxuIiwgImV4cG9ydCBjb25zdCBBU1BFQ1RfUkFUSU8gPSAxNiAvIDlcbmV4cG9ydCBjb25zdCBHUklEX1dJRFRIID0gMjFcbmV4cG9ydCBjb25zdCBHUklEX0hFSUdIVCA9IDhcbmV4cG9ydCBjb25zdCBCQUNLR1JPVU5EX0NPTE9SOiBSR0IgPSBbMCwgMCwgMF1cbmV4cG9ydCBjb25zdCBCQUxMX0JBU0VfU1BFRUQgPSAoKSA9PiB3aWR0aCAvIDE1MFxuZXhwb3J0IGNvbnN0IEJBTExfTUFYX1NQRUVEID0gKCkgPT4gQkFMTF9CQVNFX1NQRUVEKCkgKiA1XG5leHBvcnQgY29uc3QgQkFMTF9CQVNFX1JBRElVUyA9ICgpID0+IHdpZHRoICogMC4wMDdcbmV4cG9ydCBjb25zdCBCQUxMX1NQRUVEX0JVRkYgPSAoKSA9PiBCQUxMX0JBU0VfU1BFRUQoKSAvIDVcbmV4cG9ydCBjb25zdCBCQVJfQkFTRV9XSURUSCA9ICgpID0+IHdpZHRoICogMC4xXG5leHBvcnQgY29uc3QgQlJJQ0tfV0lEVEggPSAoKSA9PiB3aWR0aCAvIEdSSURfV0lEVEhcbmV4cG9ydCBjb25zdCBCUklDS19IRUlHSFQgPSAoKSA9PiBCUklDS19XSURUSCgpIC8gQVNQRUNUX1JBVElPXG5leHBvcnQgY29uc3QgQkFTRV9FRkZFQ1RfRFVSQVRJT04gPSA1MFxuZXhwb3J0IGNvbnN0IEJBU0VfSFAgPSAzXG5leHBvcnQgY29uc3QgREVCVUdfTU9ERSA9IGZhbHNlXG5leHBvcnQgY29uc3QgVEFJTF9MRU5HVEggPSAxMFxuZXhwb3J0IGNvbnN0IEZSQU1FUkFURSA9IDI1XG5leHBvcnQgY29uc3QgTk9fU01PT1RIID0gdHJ1ZVxuZXhwb3J0IGNvbnN0IEJSSUNLX0JBU0VfQ09MT1I6IFJHQiA9IFswLCAxMDAsIDIwMF1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBCYXIge1xuICB4ID0gd2lkdGggLyAyXG4gIHkgPSBoZWlnaHQgKiAxLjFcbiAgd2lkdGggPSBfLkJBUl9CQVNFX1dJRFRIKClcbiAgaGVpZ2h0ID0gdGhpcy53aWR0aCAvIDRcbiAgdG91Y2hUaW1lcyA9IDBcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3KCkge1xuICAgIHRoaXMudXBkYXRlKClcbiAgICB0cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgbm9TdHJva2UoKVxuICAgIGZpbGwoNjAsIDYwLCAyMDApXG4gICAgcmVjdChcbiAgICAgICh0aGlzLndpZHRoIC8gMikgKiAtMSxcbiAgICAgICh0aGlzLmhlaWdodCAvIDIpICogLTEsXG4gICAgICB0aGlzLndpZHRoLFxuICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICB0aGlzLmhlaWdodFxuICAgIClcbiAgICBmaWxsKDYwLCAyMDAsIDI1NSlcbiAgICByZWN0KFxuICAgICAgKHRoaXMud2lkdGggLyA0KSAqIC0xLFxuICAgICAgKHRoaXMuaGVpZ2h0IC8gMikgKiAtMSxcbiAgICAgIHRoaXMud2lkdGggLyAyLFxuICAgICAgdGhpcy5oZWlnaHRcbiAgICApXG4gICAgdHJhbnNsYXRlKC10aGlzLngsIC10aGlzLnkpXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLm1vdmUoKVxuICAgIHRoaXMuYm91bmRzKClcbiAgfVxuXG4gIHByaXZhdGUgYm91bmRzKCkge1xuICAgIHRoaXMuZ2FtZS5iYWxscy5mb3JFYWNoKChiYWxsKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzID4gdGhpcy55IC0gdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueSArIGJhbGwucmFkaXVzIDwgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyICYmXG4gICAgICAgIGJhbGwueCArIGJhbGwucmFkaXVzID4gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIgJiZcbiAgICAgICAgYmFsbC54IC0gYmFsbC5yYWRpdXMgPCB0aGlzLnggKyB0aGlzLndpZHRoIC8gMlxuICAgICAgKSB7XG4gICAgICAgIHRoaXMudG91Y2hUaW1lcysrXG5cbiAgICAgICAgaWYgKHRoaXMudG91Y2hUaW1lcyA+IDEpXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgIFwiYmFsbCB0b3VjaCBiYXIgc2V2ZXJhbCB0aW1lcyAoXCIgKyB0aGlzLnRvdWNoVGltZXMgKyBcIilcIlxuICAgICAgICAgIClcblxuICAgICAgICBsZXQgdmVsID0gYmFsbC52ZWxvY2l0eVxuXG4gICAgICAgIGJhbGwudmVsb2NpdHkgPSB7XG4gICAgICAgICAgeDogdmVsLngsXG4gICAgICAgICAgeTogLWFicyh2ZWwueSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWxsLnggPCB0aGlzLnggLSB0aGlzLndpZHRoIC8gNCkge1xuICAgICAgICAgIGJhbGwuYW5nbGUgLT0gbWFwKFxuICAgICAgICAgICAgYmFsbC54LFxuICAgICAgICAgICAgdGhpcy54IC0gdGhpcy53aWR0aCAvIDQsXG4gICAgICAgICAgICB0aGlzLnggLSB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxNVxuICAgICAgICAgIClcblxuICAgICAgICAgIGJhbGwuYW5nbGUgPSBjb25zdHJhaW4oYmFsbC5hbmdsZSwgLTE3OCwgLTIpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmFsbC54ID4gdGhpcy54ICsgdGhpcy53aWR0aCAvIDQpIHtcbiAgICAgICAgICBiYWxsLmFuZ2xlIC09IG1hcChcbiAgICAgICAgICAgIGJhbGwueCxcbiAgICAgICAgICAgIHRoaXMueCArIHRoaXMud2lkdGggLyA0LFxuICAgICAgICAgICAgdGhpcy54ICsgdGhpcy53aWR0aCAvIDIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMTVcbiAgICAgICAgICApXG5cbiAgICAgICAgICBiYWxsLmFuZ2xlID0gY29uc3RyYWluKGJhbGwuYW5nbGUsIC0xNzgsIC0yKVxuICAgICAgICB9XG5cbiAgICAgICAgdmVsID0gYmFsbC52ZWxvY2l0eVxuXG4gICAgICAgIC8vIGRcdTAwRTljYWxlciBsYSBiYWxsZSBob3JzIGRlIGxhIGJhciBzaSBlbGxlIGVzdCB0cm9wIGEgZHJvaXRlIG91IGEgZ2F1Y2hlXG4gICAgICAgIGlmIChiYWxsLnggPD0gdGhpcy54IC0gdGhpcy53aWR0aCAvIDIpIHtcbiAgICAgICAgICBiYWxsLnggPSB0aGlzLnggLSB0aGlzLndpZHRoIC8gMiAtIGJhbGwucmFkaXVzXG5cbiAgICAgICAgICBiYWxsLnZlbG9jaXR5ID0ge1xuICAgICAgICAgICAgeDogLWFicyh2ZWwueCksXG4gICAgICAgICAgICB5OiAtYWJzKHZlbC55KVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChiYWxsLnggPj0gdGhpcy54ICsgdGhpcy53aWR0aCAvIDIpIHtcbiAgICAgICAgICBiYWxsLnggPSB0aGlzLnggKyB0aGlzLndpZHRoIC8gMiArIGJhbGwucmFkaXVzXG5cbiAgICAgICAgICBiYWxsLnZlbG9jaXR5ID0ge1xuICAgICAgICAgICAgeDogYWJzKHZlbC54KSxcbiAgICAgICAgICAgIHk6IC1hYnModmVsLnkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhbGwueSA9IHRoaXMueSAtIHRoaXMuaGVpZ2h0IC8gMiAtIGJhbGwucmFkaXVzXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudG91Y2hUaW1lcyA9IDBcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBtb3ZlKCkge1xuICAgIC8vY29uc3QgeCA9IHRoaXMueCArIChtb3VzZVggLSB0aGlzLngpIC8gNFxuICAgIGNvbnN0IHggPSBBcnJheS5mcm9tKHRoaXMuZ2FtZS5iYWxscylbMF0/LnggPz8gbW91c2VYXG4gICAgY29uc3QgeSA9IHRoaXMueSArIChtb3VzZVkgLSB0aGlzLnkpIC8gNFxuXG4gICAgdGhpcy54ID0gbWluKG1heCh4LCB0aGlzLndpZHRoIC8gMiksIHdpZHRoIC0gdGhpcy53aWR0aCAvIDIpXG4gICAgdGhpcy55ID0gbWluKG1heCh5LCBoZWlnaHQgKiAwLjkpLCBoZWlnaHQgLSB0aGlzLmhlaWdodCAvIDIpXG4gIH1cbn1cbiIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXG5cbmltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBCYWxsIHtcbiAgYW5nbGUgPSAwXG4gIHggPSB3aWR0aCAvIDJcbiAgeSA9IGhlaWdodCAqIDAuOFxuICB0YWlsOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH1bXSA9IFtdXG5cbiAgY29uc3RydWN0b3IocHVibGljIGdhbWU6IGdhbWUuR2FtZSkge1xuICAgIHRoaXMuYW5nbGUgPSByYW5kb20oLTE3OSwgLTEpXG4gIH1cblxuICBnZXQgc3BlZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZS5iYWxsU3BlZWRcbiAgfVxuXG4gIHNldCBzcGVlZChzcGVlZDogbnVtYmVyKSB7XG4gICAgY29uc3QgbmV3U3BlZWQgPSBjb25zdHJhaW4oc3BlZWQsIF8uQkFMTF9NQVhfU1BFRUQoKSwgXy5CQUxMX0JBU0VfU1BFRUQoKSlcbiAgICBpZih0aGlzLmdhbWUuYmFsbFNwZWVkICE9PSBuZXdTcGVlZClcbiAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRlIHNwZWVkOlwiLCBNYXRoLnJvdW5kKHRoaXMuZ2FtZS5iYWxsU3BlZWQgLSBzcGVlZCkpXG4gICAgdGhpcy5nYW1lLmJhbGxTcGVlZCA9IG5ld1NwZWVkXG4gIH1cblxuICBnZXQgcmFkaXVzKCkge1xuICAgIHJldHVybiB0aGlzLmdhbWUuYmFsbFJhZGl1c1xuICB9XG5cbiAgZ2V0IGRhbWFnZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZS5iYWxsRGFtYWdlc1xuICB9XG5cbiAgc2V0IGRhbWFnZXMoZGFtYWdlczogbnVtYmVyKSB7XG4gICAgdGhpcy5nYW1lLmJhbGxEYW1hZ2VzID0gZGFtYWdlc1xuICB9XG5cbiAgZ2V0IHZlbG9jaXR5KCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiBjb3ModGhpcy5hbmdsZSkgKiB0aGlzLnNwZWVkLFxuICAgICAgeTogc2luKHRoaXMuYW5nbGUpICogdGhpcy5zcGVlZFxuICAgIH1cbiAgfVxuXG4gIHNldCB2ZWxvY2l0eSh2ZWw6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICB0aGlzLmFuZ2xlID0gZGVncmVlcyhhdGFuMih2ZWwueSwgdmVsLngpKVxuICB9XG5cbiAgZmxpcFZlbG9jaXR5KGJhcjogXCJob3Jpem9udGFsXCIgfCBcInZlcnRpY2FsXCIgfCBcImRpYWdvbmFsXCIpIHtcbiAgICBjb25zb2xlLmxvZyhcImJhbGwgdmVsb2NpdHkgZmxpcDpcIiwgYmFyKVxuXG4gICAgY29uc3QgdmVsID0gdGhpcy52ZWxvY2l0eVxuXG4gICAgc3dpdGNoIChiYXIpIHtcbiAgICAgIGNhc2UgXCJkaWFnb25hbFwiOlxuICAgICAgICB2ZWwueCAqPSAtMVxuICAgICAgICB2ZWwueSAqPSAtMVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImhvcml6b250YWxcIjpcbiAgICAgICAgdmVsLnkgKj0gLTFcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgXCJ2ZXJ0aWNhbFwiOlxuICAgICAgICB2ZWwueCAqPSAtMVxuICAgIH1cblxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWxcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgdGhpcy51cGRhdGUoKVxuXG4gICAgY29uc3QgdmVsID0gdGhpcy52ZWxvY2l0eVxuXG4gICAgbm9TdHJva2UoKVxuICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLnRhaWwpIHtcbiAgICAgIGZpbGwobWFwKHRoaXMudGFpbC5pbmRleE9mKHBhcnQpLCAwLCB0aGlzLnRhaWwubGVuZ3RoIC0gMiwgMCwgMjU1KSlcbiAgICAgIGNpcmNsZShcbiAgICAgICAgcGFydC54LFxuICAgICAgICBwYXJ0LnksXG4gICAgICAgIG1hcChcbiAgICAgICAgICB0aGlzLnRhaWwuaW5kZXhPZihwYXJ0KSxcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMudGFpbC5sZW5ndGggLSAxLFxuICAgICAgICAgIHRoaXMucmFkaXVzIC8gMixcbiAgICAgICAgICB0aGlzLnJhZGl1cyAqIDJcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgICBmaWxsKDI1NSlcbiAgICBjaXJjbGUodGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzICogMilcbiAgICBpZiAoXy5ERUJVR19NT0RFKVxuICAgICAgdGV4dChcbiAgICAgICAgYHNwZWVkOiAke3RoaXMuc3BlZWR9XFxuYW5nbGU6ICR7TWF0aC5yb3VuZChcbiAgICAgICAgICB0aGlzLmFuZ2xlXG4gICAgICAgICl9XFxudmVsb2NpdHk6XFxuICAgeD0ke3ZlbC54fVxcbiAgICB5PSR7dmVsLnl9YCxcbiAgICAgICAgdGhpcy54ICsgdGhpcy5yYWRpdXMsXG4gICAgICAgIHRoaXMueSArIHRoaXMucmFkaXVzXG4gICAgICApXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICB0aGlzLnNhdmUoKVxuICAgIHRoaXMuY2hlY2tGYWlsKClcbiAgICB0aGlzLmJyaWNrcygpXG4gICAgdGhpcy5tb3ZlKClcbiAgICB0aGlzLmJvdW5kcygpXG4gIH1cblxuICBzYXZlKCkge1xuICAgIHRoaXMudGFpbC5wdXNoKHtcbiAgICAgIHg6IHRoaXMueCxcbiAgICAgIHk6IHRoaXMueSxcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMudGFpbC5sZW5ndGggPiBfLlRBSUxfTEVOR1RIKSB0aGlzLnRhaWwuc2hpZnQoKVxuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0ZhaWwoKSB7XG4gICAgaWYgKHRoaXMueSArIHRoaXMucmFkaXVzID49IGhlaWdodCkge1xuICAgICAgaWYgKHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAxKSB0aGlzLm9uRmFpbCgpXG4gICAgICB0aGlzLmdhbWUuYmFsbHMuZGVsZXRlKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBib3VuZHMoKSB7XG4gICAgaWYgKChcbiAgICAgIHRoaXMueCArIHRoaXMucmFkaXVzICsgdGhpcy5zcGVlZCA+PSB3aWR0aCB8fFxuICAgICAgdGhpcy54IC0gdGhpcy5yYWRpdXMgPD0gdGhpcy5zcGVlZFxuICAgICkpIHtcbiAgICAgIHRoaXMuZmxpcFZlbG9jaXR5KFwidmVydGljYWxcIilcbiAgICB9XG5cbiAgICBpZiAodGhpcy55IC0gdGhpcy5yYWRpdXMgPD0gdGhpcy5zcGVlZCkge1xuICAgICAgdGhpcy5mbGlwVmVsb2NpdHkoXCJob3Jpem9udGFsXCIpXG4gICAgfVxuXG4gICAgdGhpcy54ID0gY29uc3RyYWluKHRoaXMueCwgdGhpcy5yYWRpdXMgKyAxLCB3aWR0aCAtIHRoaXMucmFkaXVzIC0gMSlcbiAgICB0aGlzLnkgPSBtYXgodGhpcy55LCB0aGlzLnJhZGl1cysxKVxuICB9XG5cbiAgcHJpdmF0ZSBicmlja3MoKSB7XG4gICAgY29uc3QgYnJpY2sgPSBBcnJheS5mcm9tKHRoaXMuZ2FtZS5icmlja3MpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRpc3QoXG4gICAgICAgICAgYS5zY3JlZW5YICsgXy5CUklDS19XSURUSCgpIC8gMixcbiAgICAgICAgICBhLnNjcmVlblkgKyBfLkJSSUNLX0hFSUdIVCgpIC8gMixcbiAgICAgICAgICB0aGlzLngsXG4gICAgICAgICAgdGhpcy55XG4gICAgICAgICkgLVxuICAgICAgICBkaXN0KFxuICAgICAgICAgIGIuc2NyZWVuWCArIF8uQlJJQ0tfV0lEVEgoKSAvIDIsXG4gICAgICAgICAgYi5zY3JlZW5ZICsgXy5CUklDS19IRUlHSFQoKSAvIDIsXG4gICAgICAgICAgdGhpcy54LFxuICAgICAgICAgIHRoaXMueVxuICAgICAgICApXG4gICAgICApXG4gICAgfSlbMF1cblxuICAgIGlmICghYnJpY2spIHJldHVyblxuXG4gICAgY29uc3QgaW5uZXJYID1cbiAgICAgIHRoaXMueCA+IGJyaWNrLnNjcmVlblggJiYgdGhpcy54IDwgYnJpY2suc2NyZWVuWCArIF8uQlJJQ0tfV0lEVEgoKVxuICAgIGNvbnN0IGlubmVyWSA9XG4gICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblkgJiZcbiAgICAgIHRoaXMueSAtIHRoaXMucmFkaXVzIDwgYnJpY2suc2NyZWVuWSArIF8uQlJJQ0tfSEVJR0hUKClcblxuICAgIGxldCB0b3VjaCA9IGZhbHNlXG5cbiAgICAvLyB0b3BcbiAgICBpZiAoXG4gICAgICB0aGlzLnkgKyB0aGlzLnJhZGl1cyA+IGJyaWNrLnNjcmVlblkgJiZcbiAgICAgIHRoaXMueSA8IGJyaWNrLnNjcmVlblkgKyBfLkJSSUNLX0hFSUdIVCgpIC8gMiAmJlxuICAgICAgaW5uZXJYXG4gICAgKSB7XG4gICAgICB0aGlzLmZsaXBWZWxvY2l0eShcImhvcml6b250YWxcIilcblxuICAgICAgdGhpcy55ID0gYnJpY2suc2NyZWVuWSAtIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIGJvdHRvbVxuICAgIGVsc2UgaWYgKFxuICAgICAgdGhpcy55IC0gdGhpcy5yYWRpdXMgPCBicmljay5zY3JlZW5ZICsgXy5CUklDS19IRUlHSFQoKSAmJlxuICAgICAgdGhpcy55ID4gYnJpY2suc2NyZWVuWSArIF8uQlJJQ0tfSEVJR0hUKCkgLyAyICYmXG4gICAgICBpbm5lclhcbiAgICApIHtcbiAgICAgIHRoaXMuZmxpcFZlbG9jaXR5KFwiaG9yaXpvbnRhbFwiKVxuXG4gICAgICB0aGlzLnkgPSBicmljay5zY3JlZW5ZICsgXy5CUklDS19IRUlHSFQoKSArIHRoaXMucmFkaXVzXG5cbiAgICAgIHRvdWNoID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIGxlZnRcbiAgICBlbHNlIGlmIChcbiAgICAgIHRoaXMueCArIHRoaXMucmFkaXVzID4gYnJpY2suc2NyZWVuWCAmJlxuICAgICAgdGhpcy54IDwgYnJpY2suc2NyZWVuWCArIF8uQlJJQ0tfV0lEVEgoKSAvIDIgJiZcbiAgICAgIGlubmVyWVxuICAgICkge1xuICAgICAgdGhpcy5mbGlwVmVsb2NpdHkoXCJ2ZXJ0aWNhbFwiKVxuXG4gICAgICB0aGlzLnggPSBicmljay5zY3JlZW5YIC0gdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gcmlnaHRcbiAgICBlbHNlIGlmIChcbiAgICAgIHRoaXMueCAtIHRoaXMucmFkaXVzIDwgYnJpY2suc2NyZWVuWCArIF8uQlJJQ0tfV0lEVEgoKSAmJlxuICAgICAgdGhpcy54ID4gYnJpY2suc2NyZWVuWCArIF8uQlJJQ0tfV0lEVEgoKSAvIDIgJiZcbiAgICAgIGlubmVyWVxuICAgICkge1xuICAgICAgdGhpcy5mbGlwVmVsb2NpdHkoXCJ2ZXJ0aWNhbFwiKVxuXG4gICAgICB0aGlzLnggPSBicmljay5zY3JlZW5YICsgXy5CUklDS19XSURUSCgpICsgdGhpcy5yYWRpdXNcblxuICAgICAgdG91Y2ggPSB0cnVlXG4gICAgfVxuXG4gICAgYnJpY2sudG91Y2hCYWxsID0gdG91Y2hcblxuICAgIGlmICh0b3VjaCkgYnJpY2suaGl0KHRoaXMuZ2FtZS5iYWxsRGFtYWdlcywgdGhpcylcbiAgfVxuXG4gIC8vIHByaXZhdGUgYWNjZWxlcmF0ZSgpIHtcbiAgLy8gICB0aGlzLnNwZWVkID0gbWFwKFxuICAvLyAgICAgdGhpcy5nYW1lLnNjb3JlLFxuICAvLyAgICAgMCxcbiAgLy8gICAgIDUwMCxcbiAgLy8gICAgIF8uQkFMTF9CQVNFX1NQRUVEKCksXG4gIC8vICAgICBfLkJBTExfTUFYX1NQRUVEKCksXG4gIC8vICAgICB0cnVlXG4gIC8vICAgKVxuICAvLyB9XG5cbiAgbW92ZSgpIHtcbiAgICBjb25zdCB2ZWwgPSB0aGlzLnZlbG9jaXR5XG4gICAgdGhpcy54ICs9IHZlbC54XG4gICAgdGhpcy55ICs9IHZlbC55XG4gIH1cblxuICBwcml2YXRlIG9uRmFpbCgpIHtcbiAgICB0aGlzLmdhbWUubGF1bmNoQmFsbCgpXG4gICAgdGhpcy5nYW1lLmhwLS1cbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0IHR5cGUgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIlxuaW1wb3J0IHR5cGUgKiBhcyBpdGVtIGZyb20gXCIuL2l0ZW1cIlxuXG5leHBvcnQgY2xhc3MgVGVtcG9yYXJ5RWZmZWN0IHtcbiAgcHVibGljIG9wdGlvbnM6IFRlbXBvcmFyeUVmZmVjdE9wdGlvbnNcbiAgcHVibGljIGRvd24gPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBnYW1lOiBnYW1lLkdhbWUsXG4gICAgcHVibGljIGl0ZW1OYW1lOiBpdGVtLkl0ZW1OYW1lLFxuICAgIG9wdGlvbnM6IFBpY2s8XG4gICAgICBUZW1wb3JhcnlFZmZlY3RPcHRpb25zLFxuICAgICAgXCJ1cFwiIHwgXCJkb3duXCIgfCBcIm9uRHJhd1wiIHwgXCJjYW5jZWxDb25kaXRpb25cIlxuICAgID5cbiAgKSB7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIHN0YXJ0QXQ6IGZyYW1lQ291bnQsXG4gICAgfVxuXG4gICAgb3B0aW9ucy51cC5iaW5kKG9wdGlvbnMpKG9wdGlvbnMpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIHRoaXMub3B0aW9ucy5vbkRyYXcodGhpcy5vcHRpb25zKVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLm9wdGlvbnMuc3RhcnRBdCA+IGZyYW1lQ291bnQgKyBfLkJBU0VfRUZGRUNUX0RVUkFUSU9OIHx8XG4gICAgICB0aGlzLm9wdGlvbnMuY2FuY2VsQ29uZGl0aW9uPy4odGhpcy5vcHRpb25zKSB8fFxuICAgICAgdGhpcy5kb3duXG4gICAgKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZG93bi5iaW5kKHRoaXMub3B0aW9ucykodGhpcy5vcHRpb25zKVxuICAgICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5lZmZlY3RzLmRlbGV0ZSh0aGlzLml0ZW1OYW1lKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBvcmFyeUVmZmVjdE9wdGlvbnMge1xuICB1cDogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9ucywgLi4uYXJnczogYW55W10pID0+IHVua25vd25cbiAgZG93bjogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9ucykgPT4gdW5rbm93blxuICBvbkRyYXc6IChlZmZlY3Q6IFRlbXBvcmFyeUVmZmVjdE9wdGlvbnMpID0+IHVua25vd25cbiAgY2FuY2VsQ29uZGl0aW9uPzogKGVmZmVjdDogVGVtcG9yYXJ5RWZmZWN0T3B0aW9ucykgPT4gYm9vbGVhblxuICBzdGFydEF0OiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBvcmFyeUVmZmVjdE1hbmFnZXIge1xuICBlZmZlY3RzID0gbmV3IE1hcDxpdGVtLkl0ZW1OYW1lLCBUZW1wb3JhcnlFZmZlY3Q+KClcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2FtZTogZ2FtZS5HYW1lKSB7fVxuXG4gIGFkZChpdGVtTmFtZTogaXRlbS5JdGVtTmFtZSwgZWZmZWN0OiBUZW1wb3JhcnlFZmZlY3QpIHtcbiAgICB0aGlzLmVmZmVjdHMuc2V0KGl0ZW1OYW1lLCBlZmZlY3QpXG4gIH1cblxuICBkcmF3KCkge1xuICAgIGxldCBpID0gMFxuICAgIHRoaXMuZWZmZWN0cy5mb3JFYWNoKChlZmZlY3QsIGl0ZW1OYW1lKSA9PiB7XG4gICAgICBpKytcblxuICAgICAgZWZmZWN0LmRyYXcoKVxuXG4gICAgICBmaWxsKDIwMClcbiAgICAgIG5vU3Ryb2tlKClcbiAgICAgIHRleHRBbGlnbihMRUZULCBDRU5URVIpXG4gICAgICB0ZXh0U2l6ZShfLkJBTExfQkFTRV9SQURJVVMoKSlcbiAgICAgIHRleHQoaXRlbU5hbWUsIHdpZHRoIC8gMTAsIF8uQkFMTF9CQVNFX1JBRElVUygpICogMiAqIGkpXG4gICAgfSlcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgYmFsbCBmcm9tIFwiLi9iYWxsXCJcbmltcG9ydCAqIGFzIGJyaWNrIGZyb20gXCIuL2JyaWNrXCJcbmltcG9ydCAqIGFzIHRlbXBvcmFyeSBmcm9tIFwiLi90ZW1wb3JhcnlcIlxuXG5leHBvcnQgdHlwZSBJdGVtTmFtZSA9IGtleW9mIHR5cGVvZiBpdGVtc1xuXG5leHBvcnQgY2xhc3MgSXRlbTxQYXJhbXMgZXh0ZW5kcyBhbnlbXT4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgb246IGJyaWNrLkV2ZW50TmFtZSxcbiAgICBwdWJsaWMgaWNvbjogc3RyaW5nLFxuICAgIHByaXZhdGUgb25UcmlnZ2VyOiAodGhpczogYnJpY2suQnJpY2ssIC4uLnBhcmFtczogUGFyYW1zKSA9PiB1bmtub3duXG4gICkge31cblxuICB0cmlnZ2VyKGJyaWNrOiBicmljay5CcmljaywgLi4ucGFyYW1zOiBQYXJhbXMpIHtcbiAgICBjb25zb2xlLmxvZyhcInBvd2VyOlwiLCBicmljay5vcHRpb25zLml0ZW0pXG4gICAgdGhpcy5vblRyaWdnZXIuYmluZChicmljaykoLi4ucGFyYW1zKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBpdGVtcyA9IHtcbiAgLy8gYm9udXNcbiAgYm9tYjogbmV3IEl0ZW08W2JhbGw6IGJhbGwuQmFsbF0+KFwiYnJva2VuXCIsIFwiQk9NQlwiLCBmdW5jdGlvbiAoYmFsbCkge1xuICAgIGNvbnN0IHJhbmdlID0gM1xuICAgIEFycmF5LmZyb20odGhpcy5nYW1lLmJyaWNrcylcbiAgICAgIC5maWx0ZXIoKGJyaWNrKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgYnJpY2sgIT09IHRoaXMgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnggPiB0aGlzLm9wdGlvbnMueCAtIHJhbmdlICYmXG4gICAgICAgICAgYnJpY2sub3B0aW9ucy54IDwgdGhpcy5vcHRpb25zLnggKyByYW5nZSAmJlxuICAgICAgICAgIGJyaWNrLm9wdGlvbnMueSA+IHRoaXMub3B0aW9ucy55IC0gcmFuZ2UgJiZcbiAgICAgICAgICBicmljay5vcHRpb25zLnkgPCB0aGlzLm9wdGlvbnMueSArIHJhbmdlXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICAuZm9yRWFjaCgoYnJpY2spID0+IHtcbiAgICAgICAgYnJpY2suaGl0KGJhbGwuZGFtYWdlcywgYmFsbClcbiAgICAgIH0pXG4gIH0pLFxuICBiYWxsVGVtcG9yYXJ5U3BlZWREb3duOiBuZXcgSXRlbShcImJyb2tlblwiLCBcIlNMT1dcIiwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuYWRkKFxuICAgICAgXCJiYWxsVGVtcG9yYXJ5U3BlZWREb3duXCIsXG4gICAgICBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdCh0aGlzLmdhbWUsXCJiYWxsVGVtcG9yYXJ5U3BlZWREb3duXCIse1xuICAgICAgICBjYW5jZWxDb25kaXRpb246IChmeCkgPT4gdGhpcy5nYW1lLmJhbGxzLnNpemUgPT09IDAsXG4gICAgICAgIHVwOiAoKSA9PiB0aGlzLmdhbWUuYmFsbFNwZWVkIC09IF8uQkFMTF9TUEVFRF9CVUZGKCksXG4gICAgICAgIGRvd246ICgpID0+IHRoaXMuZ2FtZS5iYWxsU3BlZWQgKz0gXy5CQUxMX1NQRUVEX0JVRkYoKSxcbiAgICAgICAgb25EcmF3OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5nYW1lLmJhbGxzLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKClcbiAgICAgICAgICAgIGZpbGwoMCwgMCwgMjU1LCByb3VuZCgyNTUgKiAwLjI1KSlcbiAgICAgICAgICAgIGNpcmNsZShiYWxsLngsIGJhbGwueSwgYmFsbC5yYWRpdXMgKiAyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIClcbiAgfSksXG4gIGJhbGxUZW1wb3JhcnlEYW1hZ2VVcDogbmV3IEl0ZW0oXCJicm9rZW5cIiwgXCJETUdcIiwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuYWRkKFwiYmFsbFRlbXBvcmFyeURhbWFnZVVwXCIsXG4gICAgICBuZXcgdGVtcG9yYXJ5LlRlbXBvcmFyeUVmZmVjdCh0aGlzLmdhbWUsXCJiYWxsVGVtcG9yYXJ5RGFtYWdlVXBcIiwge1xuICAgICAgICBjYW5jZWxDb25kaXRpb246IChmeCkgPT4gdGhpcy5nYW1lLmJhbGxzLnNpemUgPT09IDAsXG4gICAgICAgIHVwOiAoKSA9PiB0aGlzLmdhbWUuYmFsbERhbWFnZXMgKyssXG4gICAgICAgIGRvd246ICgpID0+IHRoaXMuZ2FtZS5iYWxsRGFtYWdlcyAtLSxcbiAgICAgICAgb25EcmF3OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5nYW1lLmJhbGxzLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgICAgICAgIHN0cm9rZShcbiAgICAgICAgICAgICAgLi4uXy5CUklDS19CQVNFX0NPTE9SLFxuICAgICAgICAgICAgICBNYXRoLmZsb29yKG1hcChiYWxsLmRhbWFnZXMsIHRoaXMuZ2FtZS5sZXZlbCwgMCwgMjU1LCAwKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHN0cm9rZVdlaWdodChyb3VuZChiYWxsLnJhZGl1cyAvIDcpKVxuICAgICAgICAgICAgbm9GaWxsKClcbiAgICAgICAgICAgIGNpcmNsZShiYWxsLngsIGJhbGwueSwgYmFsbC5yYWRpdXMgKiAyIC0gYmFsbC5yYWRpdXMgLyA3KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIClcbiAgfSksXG4gIGJhbGxUZW1wb3JhcnlTaXplVXA6IG5ldyBJdGVtKFwiYnJva2VuXCIsIFwiQklHXCIsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdhbWUudGVtcG9yYXJ5LmFkZChcImJhbGxUZW1wb3JhcnlTaXplVXBcIixcbiAgICAgIG5ldyB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0KHRoaXMuZ2FtZSwgXCJiYWxsVGVtcG9yYXJ5U2l6ZVVwXCIse1xuICAgICAgICBjYW5jZWxDb25kaXRpb246ICgpID0+IHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwLFxuICAgICAgICB1cDogKCkgPT4gdGhpcy5nYW1lLmJhbGxSYWRpdXMgKz0gXy5CQUxMX0JBU0VfUkFESVVTKCkgLyAyLFxuICAgICAgICBkb3duOiAoKSA9PiB0aGlzLmdhbWUuYmFsbFJhZGl1cyAtPSBfLkJBTExfQkFTRV9SQURJVVMoKSAvIDIsXG4gICAgICAgIG9uRHJhdzogKCkgPT4gbnVsbCxcbiAgICAgIH0pXG4gICAgKVxuICB9KSxcbiAgLy9iYXJUZW1wb3JhcnlHdW46IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgYmFsbER1cGxpY2F0aW9uOiBuZXcgSXRlbTxbYmFsbDogYmFsbC5CYWxsXT4oXCJicm9rZW5cIiwgXCJcdTIzRkFcdTIzRkFcIiwgZnVuY3Rpb24gKGIpIHtcbiAgICBjb25zdCBuZXdCYWxsID0gdGhpcy5nYW1lLmxhdW5jaEJhbGwoKVxuICAgIG5ld0JhbGwueCA9IGIueFxuICAgIG5ld0JhbGwueSA9IGIueVxuICB9KSxcbiAgYmFyRXhwYW5zaW9uOiBuZXcgSXRlbShcImJyb2tlblwiLCBcIjwtPlwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5hZGQoXCJiYXJFeHBhbnNpb25cIixcbiAgICAgIG5ldyB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0KHRoaXMuZ2FtZSwgXCJiYXJFeHBhbnNpb25cIix7XG4gICAgICAgIHVwOigpID0+IHRoaXMuZ2FtZS5iYXIud2lkdGggKz0gXy5CQVJfQkFTRV9XSURUSCgpIC8gMyxcbiAgICAgICAgZG93bjooKSA9PiB0aGlzLmdhbWUuYmFyLndpZHRoIC09IF8uQkFSX0JBU0VfV0lEVEgoKSAvIDMsXG4gICAgICAgIG9uRHJhdzogKCkgPT4gbnVsbCxcbiAgICAgIH0pXG4gICAgKVxuICB9KSxcbiAgLy9zZWN1cml0eTogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLCAvLyBib3R0b20gc2hpZWxkXG5cbiAgLy8gbWFsdXNcbiAgYmFsbFRlbXBvcmFyeVNwZWVkVXA6IG5ldyBJdGVtKFwiYnJva2VuXCIsIFwiU1BFRURcIiwgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2FtZS50ZW1wb3JhcnkuYWRkKFwiYmFsbFRlbXBvcmFyeVNwZWVkVXBcIixcbiAgICAgIG5ldyB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0KHRoaXMuZ2FtZSwgXCJiYWxsVGVtcG9yYXJ5U3BlZWRVcFwiLHtcbiAgICAgICAgY2FuY2VsQ29uZGl0aW9uOiAoZngpID0+IHRoaXMuZ2FtZS5iYWxscy5zaXplID09PSAwLFxuICAgICAgICB1cDogKCkgPT4gdGhpcy5nYW1lLmJhbGxTcGVlZCArPSBfLkJBTExfU1BFRURfQlVGRigpLFxuICAgICAgICBkb3duOiAoKSA9PnRoaXMuZ2FtZS5iYWxsU3BlZWQgLT0gXy5CQUxMX1NQRUVEX0JVRkYoKSxcbiAgICAgICAgb25EcmF3OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5nYW1lLmJhbGxzLmZvckVhY2goKGJhbGwpID0+IHtcbiAgICAgICAgICAgIG5vU3Ryb2tlKClcbiAgICAgICAgICAgIGZpbGwoMjU1LCAxODIsIDAsIHJvdW5kKDI1NSAqIDAuMjUpKVxuICAgICAgICAgICAgY2lyY2xlKGJhbGwueCwgYmFsbC55LCBiYWxsLnJhZGl1cyAqIDIpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKVxuICB9KSxcbiAgLy9iYXJUZW1wb3JhcnlJbnZpc2liaWxpdHk6IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KSxcbiAgLy9icmlja1RlbXBvcmFyeUludmlzaWJpbGl0eTogbmV3IEl0ZW0oXCJicm9rZW5cIiwgZnVuY3Rpb24gKCkge30pLFxuICAvL2JhbGxUZW1wb3JhcnlEYW1hZ2VEb3duOiBuZXcgSXRlbShcImJyb2tlblwiLCBmdW5jdGlvbiAoKSB7fSksXG4gIGJhckNvbnRyYWN0aW9uOiBuZXcgSXRlbShcImJyb2tlblwiLCBcIj4tPFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5hZGQoXCJiYXJDb250cmFjdGlvblwiLFxuICAgICAgbmV3IHRlbXBvcmFyeS5UZW1wb3JhcnlFZmZlY3QodGhpcy5nYW1lLCBcImJhckNvbnRyYWN0aW9uXCIse1xuICAgICAgICB1cDooKSA9PiB0aGlzLmdhbWUuYmFyLndpZHRoIC09IF8uQkFSX0JBU0VfV0lEVEgoKSAvIDMsXG4gICAgICAgIGRvd246KCkgPT4gdGhpcy5nYW1lLmJhci53aWR0aCArPSBfLkJBUl9CQVNFX1dJRFRIKCkgLyAzLFxuICAgICAgICBvbkRyYXc6ICgpID0+IG51bGwsXG4gICAgICB9KVxuICAgIClcbiAgfSksXG4gIC8vYnJpY2tEdXJhYmlsaXR5VXA6IG5ldyBJdGVtKFwiYnJva2VuXCIsIGZ1bmN0aW9uICgpIHt9KVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgaXRlbSBmcm9tIFwiLi9pdGVtXCJcbmltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5pbXBvcnQgKiBhcyBiYWxsIGZyb20gXCIuL2JhbGxcIlxuaW1wb3J0ICogYXMgbGV2ZWwgZnJvbSBcIi4vbGV2ZWxcIlxuXG5leHBvcnQgdHlwZSBFdmVudE5hbWUgPSBcImJyb2tlblwiIHwgXCJ0b3VjaGVkXCJcblxuZXhwb3J0IGludGVyZmFjZSBCcmlja09wdGlvbnMge1xuICB4OiBudW1iZXJcbiAgeTogbnVtYmVyXG4gIGR1cmFiaWxpdHk6IG51bWJlclxuICBpdGVtOiBpdGVtLkl0ZW1OYW1lIHwgbnVsbFxufVxuXG5leHBvcnQgY2xhc3MgQnJpY2sge1xuICBwcml2YXRlIF9kdXJhYmlsaXR5OiBudW1iZXJcbiAgdG91Y2hCYWxsID0gZmFsc2VcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2FtZTogZ2FtZS5HYW1lLCBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogQnJpY2tPcHRpb25zKSB7XG4gICAgdGhpcy5fZHVyYWJpbGl0eSA9IG9wdGlvbnMuZHVyYWJpbGl0eVxuICB9XG5cbiAgc2V0RHVyYWJpbGl0eShkdXJhYmlsaXR5OiBudW1iZXIsIGJhbGw/OiBiYWxsLkJhbGwpIHtcbiAgICB0aGlzLl9kdXJhYmlsaXR5ID0gZHVyYWJpbGl0eVxuICAgIGlmICh0aGlzLl9kdXJhYmlsaXR5IDw9IDApIHtcbiAgICAgIHRoaXMua2lsbChiYWxsKVxuICAgIH1cbiAgfVxuXG4gIGdldCBkdXJhYmlsaXR5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2R1cmFiaWxpdHlcbiAgfVxuXG4gIGdldCBzY3JlZW5YKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54ICogXy5CUklDS19XSURUSCgpXG4gIH1cblxuICBnZXQgc2NyZWVuWSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueSAqIF8uQlJJQ0tfSEVJR0hUKClcbiAgfVxuXG4gIGdldCBpdGVtKCk6IHR5cGVvZiBpdGVtLml0ZW1zW2tleW9mIHR5cGVvZiBpdGVtLml0ZW1zXSB8IG51bGwge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaXRlbSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGl0ZW0uaXRlbXNbdGhpcy5vcHRpb25zLml0ZW1dXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgc3Ryb2tlKF8uQkFDS0dST1VORF9DT0xPUilcbiAgICBzdHJva2VXZWlnaHQodGhpcy50b3VjaEJhbGwgPyA0IDogMSlcbiAgICBmaWxsKFxuICAgICAgLi4uKF8uQlJJQ0tfQkFTRV9DT0xPUi5tYXAoKGZhY3RvcikgPT4ge1xuICAgICAgICByZXR1cm4gZmFjdG9yICsgKE1hdGgucmFuZG9tKCkgPD0gMC41ID8gLTIwIDogMjApXG4gICAgICB9KSBhcyBSR0IpLFxuICAgICAgTWF0aC5mbG9vcihtYXAodGhpcy5kdXJhYmlsaXR5LCB0aGlzLmdhbWUubGV2ZWwsIDAsIDI1NSwgMCkpXG4gICAgKVxuICAgIHJlY3QoXG4gICAgICB0aGlzLnNjcmVlblgsXG4gICAgICB0aGlzLnNjcmVlblksXG4gICAgICBfLkJSSUNLX1dJRFRIKCksXG4gICAgICBfLkJSSUNLX0hFSUdIVCgpLFxuICAgICAgXy5CUklDS19IRUlHSFQoKSAvIDRcbiAgICApXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pdGVtICE9PSBudWxsKSB7XG4gICAgICBub1N0cm9rZSgpXG4gICAgICBmaWxsKDI1NSlcbiAgICAgIHRleHRTaXplKF8uQlJJQ0tfSEVJR0hUKCkgLyAyKVxuICAgICAgdGV4dChcbiAgICAgICAgdGhpcy5pdGVtLmljb24sXG4gICAgICAgIHRoaXMuc2NyZWVuWCArIF8uQlJJQ0tfV0lEVEgoKSAvIDIsXG4gICAgICAgIHRoaXMuc2NyZWVuWSArIF8uQlJJQ0tfSEVJR0hUKCkgLyAyXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgaGl0KGRhbWFnZXM6IG51bWJlciwgYmFsbD86IGJhbGwuQmFsbCkge1xuICAgIGlmICh0aGlzLmR1cmFiaWxpdHkgPD0gMCkgcmV0dXJuXG5cbiAgICBpZiAodGhpcy5pdGVtPy5vbiA9PT0gXCJ0b3VjaGVkXCIpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5vcHRpb25zLml0ZW0gPT09IFwiYmFsbER1cGxpY2F0aW9uXCIgfHxcbiAgICAgICAgdGhpcy5vcHRpb25zLml0ZW0gPT09IFwiYm9tYlwiXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5pdGVtLnRyaWdnZXIodGhpcywgYmFsbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIDsodGhpcy5pdGVtIGFzIGl0ZW0uSXRlbTxbXT4pLnRyaWdnZXIodGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdhbWUuc2NvcmUgKz0gZGFtYWdlc1xuICAgIHRoaXMuc2V0RHVyYWJpbGl0eSh0aGlzLmR1cmFiaWxpdHkgLSBkYW1hZ2VzLCBiYWxsKVxuICB9XG5cbiAga2lsbChiYWxsPzogYmFsbC5CYWxsKSB7XG4gICAgaWYgKCF0aGlzLmdhbWUuYnJpY2tzLmhhcyh0aGlzKSkgcmV0dXJuXG5cbiAgICBpZiAodGhpcy5pdGVtPy5vbiA9PT0gXCJicm9rZW5cIikge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLm9wdGlvbnMuaXRlbSA9PT0gXCJiYWxsRHVwbGljYXRpb25cIiB8fFxuICAgICAgICB0aGlzLm9wdGlvbnMuaXRlbSA9PT0gXCJib21iXCJcbiAgICAgICkge1xuICAgICAgICB0aGlzLml0ZW0udHJpZ2dlcih0aGlzLCBiYWxsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgOyh0aGlzLml0ZW0gYXMgaXRlbS5JdGVtPFtdPikudHJpZ2dlcih0aGlzKVxuICAgICAgfVxuICAgICAgdGhpcy5vcHRpb25zLml0ZW0gPSBudWxsXG4gICAgfVxuXG4gICAgdGhpcy5nYW1lLmJyaWNrcy5kZWxldGUodGhpcylcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcblxuaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCJcbmltcG9ydCAqIGFzIGl0ZW0gZnJvbSBcIi4vaXRlbVwiXG5pbXBvcnQgKiBhcyBicmljayBmcm9tIFwiLi9icmlja1wiXG5cbmV4cG9ydCB0eXBlIExldmVsU2hhcGUgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IGJvb2xlYW5cbmV4cG9ydCB0eXBlIExldmVsSXRlbXMgPSAoZ2FtZTogZ2FtZS5HYW1lKSA9PiB1bmtub3duXG5cbmV4cG9ydCBjb25zdCBsZXZlbFNoYXBlczogTGV2ZWxTaGFwZVtdID0gW1xuICAoeCwgeSkgPT4geCA+IDIgJiYgeCA8IF8uR1JJRF9XSURUSCAtIDMgJiYgeSA+IDIsXG4gICh4LCB5KSA9PiB4IDwgMiB8fCB4ID4gXy5HUklEX1dJRFRIIC0gMyB8fCB5IDwgMiB8fCB5ID4gXy5HUklEX0hFSUdIVCAtIDMsXG4gICh4LCB5KSA9PiB4ICUgMiA9PT0gMCB8fCB5ICUgMyA9PT0gMCxcbl1cblxuZXhwb3J0IGNvbnN0IGxldmVsSXRlbXM6IExldmVsSXRlbXNbXSA9IFtcbiAgKGdhbWUpID0+IHtcbiAgICBPYmplY3Qua2V5cyhpdGVtLml0ZW1zKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImluamVjdGVkOlwiLCAzLCBuYW1lKVxuICAgICAgaW5qZWN0SXRlbXMoZ2FtZSwgMywgbmFtZSBhcyBpdGVtLkl0ZW1OYW1lKVxuICAgIH0pXG4gIH0sXG5dXG5cbmZ1bmN0aW9uIGluamVjdEl0ZW1zKGdhbWU6IGdhbWUuR2FtZSwgY291bnQ6IG51bWJlciwgaXRlbU5hbWU6IGl0ZW0uSXRlbU5hbWUpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgbGV0IHJhbmQ6IGJyaWNrLkJyaWNrID0gcmFuZG9tKEFycmF5LmZyb20oZ2FtZS5icmlja3MpKVxuXG4gICAgd2hpbGUgKHJhbmQub3B0aW9ucy5pdGVtICE9PSBudWxsKSB7XG4gICAgICByYW5kID0gcmFuZG9tKEFycmF5LmZyb20oZ2FtZS5icmlja3MpKVxuICAgIH1cblxuICAgIHJhbmQub3B0aW9ucy5pdGVtID0gaXRlbU5hbWVcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiXG5cbmV4cG9ydCBjbGFzcyBTY2VuZXMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdhbWU6IGdhbWUuR2FtZSkge31cblxuICBkcmF3R2FtZSgpIHtcbiAgICBpZiAodGhpcy5nYW1lLmJyaWNrcy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmdhbWUudGVtcG9yYXJ5LmVmZmVjdHMuY2xlYXIoKVxuICAgICAgdGhpcy5nYW1lLmxldmVsKytcbiAgICAgIHRoaXMuZ2FtZS5iYWxscy5jbGVhcigpXG4gICAgICB0aGlzLmdhbWUubGF1bmNoQmFsbCgpXG4gICAgICB0aGlzLmdhbWUuc2V0R3JpZFNoYXBlKClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1vdXNlSXNQcmVzc2VkIHx8IGtleUlzUHJlc3NlZClcbiAgICAgICAgZnJhbWVSYXRlKE1hdGgucm91bmQodGhpcy5nYW1lLmZyYW1lcmF0ZSAqIDUpKVxuICAgICAgZWxzZSBmcmFtZVJhdGUodGhpcy5nYW1lLmZyYW1lcmF0ZSlcblxuICAgICAgdGhpcy5zY29yZSgpXG4gICAgICB0aGlzLmhpZ2hTY29yZSgpXG4gICAgICB0aGlzLmhwQW5kTGV2ZWwoKVxuICAgICAgdGhpcy5zcGVlZCgpXG5cbiAgICAgIHRoaXMuZ2FtZS5iYXIuZHJhdygpXG5cbiAgICAgIC8vIHJhbmRvbWx5IHN3YXAgdHdvIGJyaWNrc1xuICAgICAgaWYoZnJhbWVDb3VudCAlIDEwID09PSAwICYmIE1hdGgucmFuZG9tKCkgPD0gLjUpIHtcbiAgICAgICAgY29uc3QgYnJpY2sxID0gcmFuZG9tKEFycmF5LmZyb20odGhpcy5nYW1lLmJyaWNrcykpXG4gICAgICAgIGNvbnN0IGJyaWNrMiA9IHJhbmRvbShBcnJheS5mcm9tKHRoaXMuZ2FtZS5icmlja3MpKVxuXG4gICAgICAgIGlmKGJyaWNrMSAhPT0gYnJpY2syICYmIGJyaWNrMSAmJiBicmljazIpIHtcbiAgICAgICAgICBjb25zdCB0ZW1wWCA9IGJyaWNrMi5vcHRpb25zLnhcbiAgICAgICAgICBicmljazIub3B0aW9ucy54ID0gYnJpY2sxLm9wdGlvbnMueFxuICAgICAgICAgIGJyaWNrMS5vcHRpb25zLnggPSB0ZW1wWFxuICAgICAgICAgIGNvbnN0IHRlbXBZID0gYnJpY2syLm9wdGlvbnMueVxuICAgICAgICAgIGJyaWNrMi5vcHRpb25zLnkgPSBicmljazEub3B0aW9ucy55XG4gICAgICAgICAgYnJpY2sxLm9wdGlvbnMueSA9IHRlbXBZXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5nYW1lLmJyaWNrcy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcbiAgICAgIHRoaXMuZ2FtZS5iYWxscy5mb3JFYWNoKChiKSA9PiBiLmRyYXcoKSlcblxuICAgICAgdGhpcy5nYW1lLnRlbXBvcmFyeS5kcmF3KClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjb3JlKCkge1xuICAgIGZpbGwoNTApXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcImJvbGRcIilcbiAgICB0ZXh0QWxpZ24oQ0VOVEVSLCBDRU5URVIpXG4gICAgdGV4dFNpemUoTWF0aC5yb3VuZCh3aWR0aCAvIDIwKSlcbiAgICB0ZXh0KGBTY29yZTogJHt0aGlzLmdhbWUuc2NvcmV9YCwgd2lkdGggLyAyLCBoZWlnaHQgKiAwLjUpXG4gIH1cblxuICBwcml2YXRlIGhpZ2hTY29yZSgpIHtcbiAgICBmaWxsKDQ1KVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAzNSkpXG4gICAgdGV4dChgSGlnaCBTY29yZTogJHt0aGlzLmdhbWUuaGlnaFNjb3JlfWAsIHdpZHRoIC8gMiwgaGVpZ2h0ICogMC41OClcbiAgfVxuXG4gIHByaXZhdGUgaHBBbmRMZXZlbCgpIHtcbiAgICBmaWxsKDMwKVxuICAgIG5vU3Ryb2tlKClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAyMCkpXG4gICAgdGV4dChcbiAgICAgIGBMdmwuJHt0aGlzLmdhbWUubGV2ZWx9IC0gJHt0aGlzLmdhbWUuaHB9IGhwYCxcbiAgICAgIHdpZHRoIC8gMixcbiAgICAgIGhlaWdodCAqIDAuNjhcbiAgICApXG4gIH1cblxuICBwcml2YXRlIHNwZWVkKCkge1xuICAgIGZpbGwoMjUpXG4gICAgbm9TdHJva2UoKVxuICAgIHRleHRTdHlsZShcIm5vcm1hbFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMjUpKVxuICAgIHRleHQoXG4gICAgICBgU3BlZWQgeCR7QXJyYXkuZnJvbSh0aGlzLmdhbWUuYmFsbHMpWzBdPy5zcGVlZC50b0ZpeGVkKDEpID8/IDB9YCxcbiAgICAgIHdpZHRoIC8gMixcbiAgICAgIGhlaWdodCAqIDAuNzlcbiAgICApXG4gIH1cblxuICBkcmF3R2FtZU92ZXIoKSB7XG4gICAgdGhpcy5nYW1lT3ZlcigwLjQpXG4gICAgdGhpcy5idXR0b24oXCJSZXRyeVwiLCAwLjYsICgpID0+IHRoaXMuZ2FtZS5yZXN0YXJ0KCkpXG4gIH1cblxuICB0aXRsZSgpIHt9XG5cbiAgcHJpdmF0ZSBnYW1lT3ZlcihoOiBudW1iZXIpIHtcbiAgICBmaWxsKDEwMCwgMCwgMClcbiAgICBub1N0cm9rZSgpXG4gICAgdGV4dFN0eWxlKFwiYm9sZFwiKVxuICAgIHRleHRBbGlnbihDRU5URVIsIENFTlRFUilcbiAgICB0ZXh0U2l6ZShNYXRoLnJvdW5kKHdpZHRoIC8gMTApKVxuICAgIHRleHQoYEdBTUUgT1ZFUmAsIHdpZHRoIC8gMiArIE1hdGguY29zKERhdGUubm93KCkgLyAxMDAwMCksIGhlaWdodCAqIGgpXG4gIH1cblxuICBwcml2YXRlIGJ1dHRvbihjb250ZW50OiBzdHJpbmcsIGg6IG51bWJlciwgb25DbGljazogKCkgPT4gdW5rbm93bikge1xuICAgIGNvbnN0IHkgPSBoZWlnaHQgKiBoXG4gICAgY29uc3QgaG92ZXIgPSBtb3VzZVkgPiB5IC0gaGVpZ2h0IC8gMTAgJiYgbW91c2VZIDwgeSArIGhlaWdodCAvIDEwXG5cbiAgICBmaWxsKGhvdmVyID8gMjU1IDogMjAwKVxuICAgIHN0cm9rZShob3ZlciA/IDEwMCA6IDUwKVxuICAgIHN0cm9rZVdlaWdodChob3ZlciA/IHdpZHRoIC8gNzUgOiB3aWR0aCAvIDEwMClcbiAgICB0ZXh0U3R5bGUoXCJib2xkXCIpXG4gICAgdGV4dEFsaWduKENFTlRFUiwgQ0VOVEVSKVxuICAgIHRleHRTaXplKE1hdGgucm91bmQod2lkdGggLyAyMCkpXG4gICAgdGV4dChjb250ZW50LCB3aWR0aCAvIDIsIHkpXG5cbiAgICBpZiAoaG92ZXIgJiYgbW91c2VJc1ByZXNzZWQpIG9uQ2xpY2soKVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxuXG5pbXBvcnQgKiBhcyBiYXIgZnJvbSBcIi4vYmFyXCJcbmltcG9ydCAqIGFzIGJhbGwgZnJvbSBcIi4vYmFsbFwiXG5pbXBvcnQgKiBhcyBpdGVtIGZyb20gXCIuL2l0ZW1cIlxuaW1wb3J0ICogYXMgYnJpY2sgZnJvbSBcIi4vYnJpY2tcIlxuaW1wb3J0ICogYXMgbGV2ZWwgZnJvbSBcIi4vbGV2ZWxcIlxuaW1wb3J0ICogYXMgc2NlbmVzIGZyb20gXCIuL3NjZW5lc1wiXG5pbXBvcnQgKiBhcyB0ZW1wb3JhcnkgZnJvbSBcIi4vdGVtcG9yYXJ5XCJcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICBocCA9IF8uQkFTRV9IUFxuICBiYXI6IGJhci5CYXJcbiAgYmFsbHMgPSBuZXcgU2V0PGJhbGwuQmFsbD4oKVxuICBicmlja3MgPSBuZXcgU2V0PGJyaWNrLkJyaWNrPigpXG4gIGZyYW1lcmF0ZSA9IF8uRlJBTUVSQVRFXG4gIGxldmVsID0gMVxuICBzY2VuZXM6IHNjZW5lcy5TY2VuZXNcbiAgZmluaXNoID0gZmFsc2VcbiAgdGVtcG9yYXJ5OiB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0TWFuYWdlclxuICBiYWxsUmFkaXVzID0gXy5CQUxMX0JBU0VfUkFESVVTKClcbiAgYmFsbFNwZWVkID0gXy5CQUxMX0JBU0VfU1BFRUQoKVxuICBiYWxsRGFtYWdlcyA9IDFcblxuICBwcml2YXRlIF9zY29yZSA9IDBcbiAgcHJpdmF0ZSBfaGlnaFNjb3JlID0gTnVtYmVyKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3JlXCIpID8/IDApXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHdpbmRvdy5nYW1lID0gdGhpc1xuXG4gICAgdGhpcy5yZXN0YXJ0KClcbiAgfVxuXG4gIHNldCBzY29yZShzY29yZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc2NvcmUgPSBzY29yZVxuXG4gICAgaWYgKHRoaXMuX3Njb3JlID4gdGhpcy5oaWdoU2NvcmUpIHtcbiAgICAgIHRoaXMuaGlnaFNjb3JlID0gdGhpcy5fc2NvcmVcbiAgICB9XG4gIH1cblxuICBnZXQgc2NvcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njb3JlXG4gIH1cblxuICBzZXQgaGlnaFNjb3JlKHNjb3JlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9oaWdoU2NvcmUgPSBzY29yZVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIFN0cmluZyh0aGlzLl9oaWdoU2NvcmUpKVxuICB9XG5cbiAgZ2V0IGhpZ2hTY29yZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGlnaFNjb3JlXG4gIH1cblxuICBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoLi4uXy5CQUNLR1JPVU5EX0NPTE9SKVxuXG4gICAgaWYgKHRoaXMuaHAgPiAwKSB0aGlzLnNjZW5lcy5kcmF3R2FtZSgpXG4gICAgZWxzZSBpZiAoIXRoaXMuZmluaXNoKSB0aGlzLmZpbmlzaCA9IHRydWVcbiAgICBlbHNlIGlmICh0aGlzLmZpbmlzaCkgdGhpcy5zY2VuZXMuZHJhd0dhbWVPdmVyKClcbiAgICBlbHNlIHRoaXMuc2NlbmVzLnRpdGxlKClcbiAgfVxuXG4gIHJlc3RhcnQoKSB7XG4gICAgdGhpcy5iYXIgPSBuZXcgYmFyLkJhcih0aGlzKVxuICAgIHRoaXMuc2NlbmVzID0gbmV3IHNjZW5lcy5TY2VuZXModGhpcylcbiAgICB0aGlzLnRlbXBvcmFyeSA9IG5ldyB0ZW1wb3JhcnkuVGVtcG9yYXJ5RWZmZWN0TWFuYWdlcih0aGlzKVxuXG4gICAgdGhpcy5ocCA9IF8uQkFTRV9IUFxuICAgIHRoaXMubGV2ZWwgPSAxXG4gICAgdGhpcy5zY29yZSA9IDBcbiAgICB0aGlzLmZpbmlzaCA9IGZhbHNlXG4gICAgdGhpcy5mcmFtZXJhdGUgPSBfLkZSQU1FUkFURVxuXG4gICAgdGhpcy5iYWxsUmFkaXVzID0gXy5CQUxMX0JBU0VfUkFESVVTKClcbiAgICB0aGlzLmJhbGxTcGVlZCA9IF8uQkFMTF9CQVNFX1NQRUVEKClcbiAgICB0aGlzLmJhbGxEYW1hZ2VzID0gMVxuXG4gICAgdGhpcy5iYWxscy5jbGVhcigpXG5cbiAgICB0aGlzLnNldEdyaWRTaGFwZSgpXG4gICAgdGhpcy5sYXVuY2hCYWxsKClcbiAgfVxuXG4gIGxhdW5jaEJhbGwoKSB7XG4gICAgY29uc3QgbmV3QmFsbCA9IG5ldyBiYWxsLkJhbGwodGhpcylcbiAgICB0aGlzLmJhbGxzLmFkZChuZXdCYWxsKVxuICAgIHJldHVybiBuZXdCYWxsXG4gIH1cblxuICBzZXRHcmlkU2hhcGUoKSB7XG4gICAgdGhpcy5icmlja3MuY2xlYXIoKVxuXG4gICAgY29uc3QgbGV2ZWxTaGFwZUluZGV4ID0gTWF0aC5mbG9vcihcbiAgICAgICh0aGlzLmxldmVsIC0gMSkgJSBsZXZlbC5sZXZlbFNoYXBlcy5sZW5ndGhcbiAgICApXG4gICAgY29uc3QgbGV2ZWxJdGVtc0luZGV4ID0gTWF0aC5mbG9vcihcbiAgICAgICh0aGlzLmxldmVsIC0gMSkgJSBsZXZlbC5sZXZlbEl0ZW1zLmxlbmd0aFxuICAgIClcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgXy5HUklEX1dJRFRIOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgXy5HUklEX0hFSUdIVDsgeSsrKSB7XG4gICAgICAgIGlmIChsZXZlbC5sZXZlbFNoYXBlc1tsZXZlbFNoYXBlSW5kZXhdKHgsIHkpKSB7XG4gICAgICAgICAgdGhpcy5icmlja3MuYWRkKFxuICAgICAgICAgICAgbmV3IGJyaWNrLkJyaWNrKHRoaXMsIHtcbiAgICAgICAgICAgICAgeCxcbiAgICAgICAgICAgICAgeSxcbiAgICAgICAgICAgICAgZHVyYWJpbGl0eTogdGhpcy5sZXZlbCxcbiAgICAgICAgICAgICAgaXRlbTogbnVsbCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV2ZWwubGV2ZWxJdGVtc1tsZXZlbEl0ZW1zSW5kZXhdKHRoaXMpXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQU8sTUFBTSxlQUFlLEtBQUs7QUFDMUIsTUFBTSxhQUFhO0FBQ25CLE1BQU0sY0FBYztBQUNwQixNQUFNLG1CQUF3QixDQUFDLEdBQUcsR0FBRztBQUNyQyxNQUFNLGtCQUFrQixNQUFNLFFBQVE7QUFDdEMsTUFBTSxpQkFBaUIsTUFBTSxvQkFBb0I7QUFDakQsTUFBTSxtQkFBbUIsTUFBTSxRQUFRO0FBQ3ZDLE1BQU0sa0JBQWtCLE1BQU0sb0JBQW9CO0FBQ2xELE1BQU0saUJBQWlCLE1BQU0sUUFBUTtBQUNyQyxNQUFNLGNBQWMsTUFBTSxRQUFRO0FBQ2xDLE1BQU0sZUFBZSxNQUFNLGdCQUFnQjtBQUMzQyxNQUFNLHVCQUF1QjtBQUM3QixNQUFNLFVBQVU7QUFDaEIsTUFBTSxhQUFhO0FBQ25CLE1BQU0sY0FBYztBQUNwQixNQUFNLFlBQVk7QUFDbEIsTUFBTSxZQUFZO0FBQ2xCLE1BQU0sbUJBQXdCLENBQUMsR0FBRyxLQUFLOzs7QUNi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
