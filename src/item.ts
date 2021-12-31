import * as _ from "./constants"

import * as ball from "./ball"
import * as brick from "./brick"
import * as temporary from "./temporary"

export type ItemName = keyof typeof items

export class Item<Params extends any[]> {
  constructor(
    public on: brick.EventName,
    public icon: string,
    private onTrigger: (this: brick.Brick, ...params: Params) => unknown
  ) {}

  trigger(brick: brick.Brick, ...params: Params) {
    console.log("power:", brick.options.item)
    this.onTrigger.bind(brick)(...params)
  }
}

export const items = {
  // bonus
  bomb: new Item<[ball: ball.Ball]>("broken", "BOMB", function (ball) {
    const range = 3
    Array.from(this.game.bricks)
      .filter((brick) => {
        return (
          brick !== this &&
          brick.options.x > this.options.x - range &&
          brick.options.x < this.options.x + range &&
          brick.options.y > this.options.y - range &&
          brick.options.y < this.options.y + range
        )
      })
      .forEach((brick) => {
        brick.hit(ball.damages, ball)
      })
  }),
  ballTemporarySpeedDown: new Item("broken", "SLOW", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        onBallCreate: true,
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) =>
          b
            ? (() => {
                b.speed -= _.BALL_BASE_SPEED() / 2
                return b
              })()
            : fx.data.filter(
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
  ballTemporaryDamageUp: new Item("broken", "DMG", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        onBallCreate: true,
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) =>
          b
            ? (() => {
                b.damages++
                return b
              })()
            : fx.data.filter((ball) => ball.damages++ ?? true),
        down: (fx) => fx.data.forEach((ball) => ball.damages--),
        onDraw: (fx) => {
          fx.data.forEach((ball) => {
            stroke(
              ..._.BRICK_BASE_COLOR,
              Math.floor(map(ball.damages, this.game.level, 0, 255, 0))
            )
            strokeWeight(round(ball.radius / 7))
            noFill()
            circle(ball.x, ball.y, ball.radius * 2 - ball.radius / 7)
          })
        },
      })
    )
  }),
  ballTemporarySizeUp: new Item("broken", "BIG", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        data: Array.from(this.game.balls).slice(0),
        onBallCreate: true,
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) =>
          b
            ? (() => {
                b.radius += _.BALL_BASE_RADIUS() / 2
                return b
              })()
            : fx.data.filter(
                (ball) => (ball.radius += _.BALL_BASE_RADIUS() / 2) ?? true
              ),
        down: (fx) =>
          fx.data.forEach((ball) => (ball.radius -= _.BALL_BASE_RADIUS() / 2)),
        onDraw: () => null,
      })
    )
  }),
  //barTemporaryGun: new Item("broken", function () {}),
  ballDuplication: new Item<[ball: ball.Ball]>("broken", "⏺⏺", function (b) {
    const newBall = this.game.launchBall()
    newBall.x = b.x
    newBall.y = b.y
  }),
  //barExpansion: new Item("broken", function () {}),
  //security: new Item("broken", function () {}), // bottom shield

  // malus
  ballTemporarySpeedUp: new Item("broken", "SPEED", function () {
    this.game.temporary.add(
      new temporary.TemporaryEffect(this.game, {
        onBallCreate: true,
        data: Array.from(this.game.balls).slice(0),
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: (fx, b) =>
          b
            ? (() => {
                b.speed += _.BALL_BASE_SPEED() / 2
                return b
              })()
            : fx.data.filter(
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
