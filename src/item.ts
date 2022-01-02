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
      "ballTemporarySpeedDown",
      new temporary.TemporaryEffect(this.game,"ballTemporarySpeedDown",{
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: () => this.game.ballSpeed -= _.BALL_SPEED_BUFF(),
        down: () => this.game.ballSpeed += _.BALL_SPEED_BUFF(),
        onDraw: () => {
          this.game.balls.forEach((ball) => {
            noStroke()
            fill(0, 0, 255, round(255 * 0.25))
            circle(ball.x, ball.y, ball.radius * 2)
          })
        },
      })
    )
  }),
  ballTemporaryDamageUp: new Item("broken", "DMG", function () {
    this.game.temporary.add("ballTemporaryDamageUp",
      new temporary.TemporaryEffect(this.game,"ballTemporaryDamageUp", {
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: () => this.game.ballDamages ++,
        down: () => this.game.ballDamages --,
        onDraw: () => {
          this.game.balls.forEach((ball) => {
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
    this.game.temporary.add("ballTemporarySizeUp",
      new temporary.TemporaryEffect(this.game, "ballTemporarySizeUp",{
        cancelCondition: () => this.game.balls.size === 0,
        up: () => this.game.ballRadius += _.BALL_BASE_RADIUS() / 2,
        down: () => this.game.ballRadius -= _.BALL_BASE_RADIUS() / 2,
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
  barExpansion: new Item("broken", "<->", function () {
    this.game.temporary.add("barExpansion",
      new temporary.TemporaryEffect(this.game, "barExpansion",{
        up:() => this.game.bar.width += _.BAR_BASE_WIDTH() / 3,
        down:() => this.game.bar.width -= _.BAR_BASE_WIDTH() / 3,
        onDraw: () => null,
      })
    )
  }),
  //security: new Item("broken", function () {}), // bottom shield

  // malus
  ballTemporarySpeedUp: new Item("broken", "SPEED", function () {
    this.game.temporary.add("ballTemporarySpeedUp",
      new temporary.TemporaryEffect(this.game, "ballTemporarySpeedUp",{
        cancelCondition: (fx) => this.game.balls.size === 0,
        up: () => this.game.ballSpeed += _.BALL_SPEED_BUFF(),
        down: () =>this.game.ballSpeed -= _.BALL_SPEED_BUFF(),
        onDraw: () => {
          this.game.balls.forEach((ball) => {
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
  barContraction: new Item("broken", ">-<", function () {
    this.game.temporary.add("barContraction",
      new temporary.TemporaryEffect(this.game, "barContraction",{
        up:() => this.game.bar.width -= _.BAR_BASE_WIDTH() / 3,
        down:() => this.game.bar.width += _.BAR_BASE_WIDTH() / 3,
        onDraw: () => null,
      })
    )
  }),
  //brickDurabilityUp: new Item("broken", function () {})
}
