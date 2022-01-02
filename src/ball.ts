import * as _ from "./constants"

import * as game from "./game"

export class Ball {
  angle = 0
  x = width / 2
  y = height * 0.8
  tail: { x: number; y: number }[] = []

  constructor(public game: game.Game) {
    this.angle = random(-179, -1)
  }

  get speed() {
    return this.game.ballSpeed
  }

  set speed(speed: number) {
    const newSpeed = constrain(speed, _.BALL_MAX_SPEED(), _.BALL_BASE_SPEED())
    if(this.game.ballSpeed !== newSpeed)
      console.log("update speed:", Math.round(this.game.ballSpeed - speed))
    this.game.ballSpeed = newSpeed
  }

  get radius() {
    return this.game.ballRadius
  }

  get damages() {
    return this.game.ballDamages
  }

  set damages(damages: number) {
    this.game.ballDamages = damages
  }

  get velocity() {
    return {
      x: cos(this.angle) * this.speed,
      y: sin(this.angle) * this.speed
    }
  }

  set velocity(vel: {x: number, y: number}) {
    this.angle = degrees(atan2(vel.y, vel.x))
  }

  flipVelocity(bar: "horizontal" | "vertical" | "diagonal") {
    console.log("ball velocity flip:", bar)

    const vel = this.velocity

    switch (bar) {
      case "diagonal":
        vel.x *= -1
        vel.y *= -1
        break
      case "horizontal":
        vel.y *= -1
        break
      case "vertical":
        vel.x *= -1
    }

    this.velocity = vel
  }

  draw() {
    this.update()

    const vel = this.velocity

    noStroke()
    for (const part of this.tail) {
      fill(map(this.tail.indexOf(part), 0, this.tail.length - 2, 0, 255))
      circle(
        part.x,
        part.y,
        map(
          this.tail.indexOf(part),
          0,
          this.tail.length - 1,
          this.radius / 2,
          this.radius * 2
        )
      )
    }
    fill(255)
    circle(this.x, this.y, this.radius * 2)
    if (_.DEBUG_MODE)
      text(
        `speed: ${this.speed}\nangle: ${Math.round(
          this.angle
        )}\nvelocity:\n   x=${vel.x}\n    y=${vel.y}`,
        this.x + this.radius,
        this.y + this.radius
      )
  }

  private update() {
    this.save()
    this.checkFail()
    this.bricks()
    this.move()
    this.bounds()
  }

  save() {
    this.tail.push({
      x: this.x,
      y: this.y,
    })

    if (this.tail.length > _.TAIL_LENGTH) this.tail.shift()
  }

  private checkFail() {
    if (this.y + this.radius >= height) {
      if (this.game.balls.size === 1) this.onFail()
      this.game.balls.delete(this)
    }
  }

  private bounds() {
    if ((
      this.x + this.radius + this.speed >= width ||
      this.x - this.radius <= this.speed
    )) {
      this.flipVelocity("vertical")
    }

    if (this.y - this.radius <= this.speed) {
      this.flipVelocity("horizontal")
    }

    this.x = constrain(this.x, this.radius + 1, width - this.radius - 1)
    this.y = max(this.y, this.radius+1)
  }

  private bricks() {
    const brick = Array.from(this.game.bricks).sort((a, b) => {
      return (
        dist(
          a.screenX + _.BRICK_WIDTH() / 2,
          a.screenY + _.BRICK_HEIGHT() / 2,
          this.x,
          this.y
        ) -
        dist(
          b.screenX + _.BRICK_WIDTH() / 2,
          b.screenY + _.BRICK_HEIGHT() / 2,
          this.x,
          this.y
        )
      )
    })[0]

    if (!brick) return

    const innerX =
      this.x > brick.screenX && this.x < brick.screenX + _.BRICK_WIDTH()
    const innerY =
      this.y + this.radius > brick.screenY &&
      this.y - this.radius < brick.screenY + _.BRICK_HEIGHT()

    let touch = false

    // top
    if (
      this.y + this.radius > brick.screenY &&
      this.y < brick.screenY + _.BRICK_HEIGHT() / 2 &&
      innerX
    ) {
      this.flipVelocity("horizontal")

      this.y = brick.screenY - this.radius

      touch = true
    }

    // bottom
    else if (
      this.y - this.radius < brick.screenY + _.BRICK_HEIGHT() &&
      this.y > brick.screenY + _.BRICK_HEIGHT() / 2 &&
      innerX
    ) {
      this.flipVelocity("horizontal")

      this.y = brick.screenY + _.BRICK_HEIGHT() + this.radius

      touch = true
    }

    // left
    else if (
      this.x + this.radius > brick.screenX &&
      this.x < brick.screenX + _.BRICK_WIDTH() / 2 &&
      innerY
    ) {
      this.flipVelocity("vertical")

      this.x = brick.screenX - this.radius

      touch = true
    }

    // right
    else if (
      this.x - this.radius < brick.screenX + _.BRICK_WIDTH() &&
      this.x > brick.screenX + _.BRICK_WIDTH() / 2 &&
      innerY
    ) {
      this.flipVelocity("vertical")

      this.x = brick.screenX + _.BRICK_WIDTH() + this.radius

      touch = true
    }

    brick.touchBall = touch

    if (touch) brick.hit(this.game.ballDamages, this)
  }

  // private accelerate() {
  //   this.speed = map(
  //     this.game.score,
  //     0,
  //     500,
  //     _.BALL_BASE_SPEED(),
  //     _.BALL_MAX_SPEED(),
  //     true
  //   )
  // }

  move() {
    const vel = this.velocity
    this.x += vel.x
    this.y += vel.y
  }

  private onFail() {
    this.game.launchBall()
    this.game.hp--
  }
}
