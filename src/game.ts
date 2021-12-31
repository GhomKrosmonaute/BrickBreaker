import * as _ from "./constants"

import * as bar from "./bar"
import * as ball from "./ball"
import * as item from "./item"
import * as brick from "./brick"
import * as level from "./level"
import * as scenes from "./scenes"
import * as temporary from "./temporary"

export class Game {
  hp = _.BASE_HP
  bar: bar.Bar
  balls = new Set<ball.Ball>()
  bricks = new Set<brick.Brick>()
  framerate = _.FRAMERATE
  level = 1
  scenes: scenes.Scenes
  finish = false
  temporary: temporary.TemporaryEffectManager

  private _score = 0
  private _highScore = Number(localStorage.getItem("highScore") ?? 0)

  readonly BRICK_WIDTH = width / _.GRID_WIDTH
  readonly BRICK_HEIGHT = this.BRICK_WIDTH / _.ASPECT_RATIO

  constructor() {
    // @ts-ignore
    window.game = this

    this.restart()
  }

  set score(score: number) {
    this._score = score

    if (this._score > this.highScore) {
      this.highScore = this._score
    }
  }

  get score() {
    return this._score
  }

  set highScore(score: number) {
    this._highScore = score
    localStorage.setItem("highScore", String(this._highScore))
  }

  get highScore() {
    return this._highScore
  }

  draw() {
    background(..._.BACKGROUND_COLOR)

    if (this.hp > 0) this.scenes.drawGame()
    else if (!this.finish) this.finish = true
    else if (this.finish) this.scenes.drawGameOver()
    else this.scenes.title()
  }

  restart() {
    this.bar = new bar.Bar(this)
    this.scenes = new scenes.Scenes(this)
    this.temporary = new temporary.TemporaryEffectManager(this)

    this.hp = _.BASE_HP
    this.level = 1
    this.score = 0
    this.finish = false
    this.framerate = _.FRAMERATE

    this.balls.clear()

    this.setGridShape()
    this.launchBall()
  }

  launchBall() {
    for (const fx of Array.from(this.temporary.effects)) {
      if (fx.options.onBallCreate) fx.options.up(fx.options, ball)
    }
    const newBall = new ball.Ball(this)
    this.balls.add(newBall)
    return newBall
  }

  setGridShape() {
    this.bricks.clear()

    const levelShapeIndex = Math.floor(
      (this.level - 1) % level.levelShapes.length
    )
    const levelItemsIndex = Math.floor(
      (this.level - 1) % level.levelItems.length
    )

    for (let x = 0; x < _.GRID_WIDTH; x++) {
      for (let y = 0; y < _.GRID_HEIGHT; y++) {
        if (level.levelShapes[levelShapeIndex](x, y)) {
          this.bricks.add(
            new brick.Brick(this, {
              x,
              y,
              durability: this.level,
              item: null,
            })
          )
        }
      }
    }

    level.levelItems[levelItemsIndex](this)
  }
}
