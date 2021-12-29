import * as _ from "./constants"

import * as bar from "./bar"
import * as ball from "./ball"
import * as brick from "./brick"

export class Game {
  hp = _.BASE_HP
  balls = new Set<ball.Ball>()
  bricks = new Set<brick.Brick>()
  bar: bar.Bar

  constructor(public onFail: () => unknown) {
    for (let x = 2; x < _.GRID_WIDTH - 2; x++) {
      for (let y = 2; y < _.GRID_HEIGHT; y++) {
        const b = brick.createRandomBrick(this, x, y)
        if (b.durability > 0) this.bricks.add(b)
      }
    }

    this.launchBall()

    this.bar = new bar.Bar(this)
  }

  draw() {
    background(..._.BACKGROUND_COLOR)

    this.bricks.forEach((b) => b.draw())
    this.balls.forEach((b) => b.draw())

    this.bar.draw()
  }

  launchBall() {
    this.balls.add(new ball.Ball(this))
  }
}
