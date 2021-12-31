import * as _ from "./constants"

import * as ball from "./ball"
import * as brick from "./brick"
import * as temporary from "./temporary"

export type ItemName = keyof typeof items

export class Item {
  constructor(
    public on: brick.EventName,
    private onTrigger: (this: brick.Brick) => unknown
  ) {}

  trigger(brick: brick.Brick) {
    console.log("power:", brick.options.item)
    this.onTrigger.bind(brick)()
  }
}

export const items = {
  // bonus
  bomb: new Item("broken", function () {
    Array.from(this.game.bricks)
      .filter((brick) => {
        return (
          brick !== this &&
          brick.options.x > this.options.x - 1 &&
          brick.options.x < this.options.x + 1 &&
          brick.options.y > this.options.y - 1 &&
          brick.options.y < this.options.y + 1
        )
      })
      .forEach((brick) => {
        brick.hit(Math.max(1, ceil(this.game.level / 2)))
      })
  }),
  ballTemporarySpeedDown: new Item("broken", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) =>
          fx.data.filter(
            (ball) => (ball.speed -= _.BALL_BASE_SPEED() / 2) ?? true
          ),
        down: (fx) =>
          fx.data.forEach((ball) => (ball.speed += _.BALL_BASE_SPEED() / 2)),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            noStroke()
            fill(0, 0, 255, round(255 * 0.25))
            circle(ball.x, ball.y, ball.radius * 2)
          })
        },
      })
    )
  }),
  ballTemporaryDamageUp: new Item("broken", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) => fx.data.filter((ball) => ball.damages++ ?? true),
        down: (fx) => fx.data.forEach((ball) => ball.damages--),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            stroke(
              ..._.BRICK_BASE_COLOR,
              Math.floor(map(ball.damages, this.game.level, 0, 255, 0))
            )
            strokeWeight(round(ball.radius / 5))
            noFill()
            circle(ball.x, ball.y, ball.radius * 2)
          })
        },
      })
    )
  }),
  ballTemporarySizeUp: new Item("broken", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) =>
          fx.data.filter(
            (ball) => (ball.radius += _.BALL_BASE_RADIUS() / 2) ?? true
          ),
        down: (fx) =>
          fx.data.forEach((ball) => (ball.radius -= _.BALL_BASE_RADIUS() / 2)),
        onDraw: () => null,
      })
    )
  }),
  //barTemporaryGun: new Item("broken", function () {}),
  // ballDuplication: new Item("broken", function () {
  //   this.game.balls.forEach((ball) => {
  //     const newBall = this.game.launchBall()
  //
  //     newBall.x = ball.x
  //     newBall.y = ball.y
  //   })
  // }),
  //barExpansion: new Item("broken", function () {}),
  //security: new Item("broken", function () {}), // bottom shield

  // malus
  ballTemporarySpeedUp: new Item("broken", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx) =>
          fx.data.filter(
            (ball) => (ball.speed += _.BALL_BASE_SPEED() / 2) ?? true
          ),
        down: (fx) =>
          fx.data.forEach((ball) => (ball.speed -= _.BALL_BASE_SPEED() / 2)),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            noStroke()
            fill(255, 182, 0, round(255 * 0.25))
            circle(ball.x, ball.y, ball.radius * 2)
          })
        },
      })
    )
  }),
  //barTemporaryInvisibility: new Item("broken", function () {}),
  //brickTemporaryInvisibility: new Item("broken", function () {}),
  //ballTemporaryDamageDown: new Item("broken", function () {}),
  //barContraction: new Item("broken", function () {}),
  //brickDurabilityUp: new Item("broken", function () {})
}
