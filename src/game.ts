import * as _ from "./constants"

import * as bar from "./bar"
import * as ball from "./ball"
import * as info from "./info"
import * as brick from "./brick"

export class Game {
  hp = _.BASE_HP
  bar: bar.Bar
  info: info.Info
  balls = new Set<ball.Ball>()
  bricks = new Set<brick.Brick>()
  framerate = _.FRAMERATE

  private _score = 0
  private _highScore = Number(localStorage.getItem("highScore") ?? 0)

  readonly BRICK_WIDTH = width / _.GRID_WIDTH
  readonly BRICK_HEIGHT = this.BRICK_WIDTH / _.ASPECT_RATIO

  constructor(public onFail: () => unknown) {
    for (let x = 2; x < _.GRID_WIDTH - 2; x++) {
      for (let y = 2; y < _.GRID_HEIGHT; y++) {
        const b = brick.createRandomBrick(this, x, y)
        if (b.durability > 0) this.bricks.add(b)
      }
    }

    this.launchBall()

    this.bar = new bar.Bar(this)
    this.info = new info.Info(this)
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

    if (mouseIsPressed || keyIsPressed)
      frameRate(Math.round(this.framerate * 5))
    else frameRate(this.framerate)

    this.info.draw()
    this.bar.draw()

    this.bricks.forEach((b) => b.draw())
    this.balls.forEach((b) => b.draw())
  }

  launchBall() {
    this.balls.add(new ball.Ball(this))
  }
}
