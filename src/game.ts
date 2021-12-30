import * as _ from "./constants"

import * as bar from "./bar"
import * as ball from "./ball"
import * as brick from "./brick"
import * as scenes from "./scenes"

export class Game {
  hp = _.BASE_HP
  bar: bar.Bar
  balls = new Set<ball.Ball>()
  bricks = new Set<brick.Brick>()
  framerate = _.FRAMERATE
  scenes: scenes.Scenes
  finish = false

  private _score = 0
  private _highScore = Number(localStorage.getItem("highScore") ?? 0)

  readonly BRICK_WIDTH = width / _.GRID_WIDTH
  readonly BRICK_HEIGHT = this.BRICK_WIDTH / _.ASPECT_RATIO

  constructor() {
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

    if (this.hp > 0) {
      this.scenes.drawGame()
    } else if (!this.finish) {
      this.finish = true
    } else if (this.finish) {
      this.scenes.drawGameOver()
    } else {
      // title screen
    }
  }

  restart() {
    this.balls.clear()

    this.setGridShape()
    this.launchBall()

    this.bar = new bar.Bar(this)
    this.scenes = new scenes.Scenes(this)

    this.hp = _.BASE_HP
    this.finish = false
    this.framerate = _.FRAMERATE
  }

  launchBall() {
    this.balls.add(new ball.Ball(this))
  }

  setGridShape() {
    this.bricks.clear()

    // make grid shape
    // todo: use default level type presets
    for (let x = 2; x < _.GRID_WIDTH - 2; x++) {
      for (let y = 2; y < _.GRID_HEIGHT; y++) {
        const b = brick.createRandomBrick(this, x, y)
        if (b.durability > 0) this.bricks.add(b)
      }
    }
  }
}
