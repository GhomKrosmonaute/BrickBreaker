import * as _ from "./constants"

import * as game from "./game"

export class Ball {
  x = width / 2
  y = height * 0.8
  radius = width * 0.01
  velocity = createVector(0, 0, 0)
  speed = _.BALL_BASE_SPEED

  constructor(private game: game.Game) {
    this.setRandomVelocity()
  }

  draw() {
    this.update()
    noStroke()
    fill(255)
    circle(this.x, this.y, this.radius * 2)
  }

  private setRandomVelocity() {
    const angle = round(random(360))

    this.velocity.set(cos(angle) * this.speed, sin(angle) * this.speed)

    if (this.velocity.y > 0) this.velocity.y *= -1
  }

  private update() {
    this.checkFail()
    this.bricks()
    this.bounds()
    this.move()
  }

  private checkFail() {
    if (this.y + this.radius >= height) this.onFail()
  }

  private bounds() {
    if (this.x + this.radius >= width || this.x - this.radius <= 0)
      this.velocity.x *= -1

    if (this.y - this.radius <= 0) this.velocity.y *= -1
  }

  private bricks() {
    const brick = Array.from(this.game.bricks).sort((a, b) => {
      return (
        dist(
          a.screenX + a.width / 2,
          a.screenY + a.height / 2,
          this.x,
          this.y
        ) -
        dist(b.screenX + b.width / 2, b.screenY + b.height / 2, this.x, this.y)
      )
    })[0]

    if (!brick) return

    const innerX =
      this.x > brick.screenX && this.x < brick.screenX + brick.width
    const innerY =
      this.y + this.radius > brick.screenY &&
      this.y - this.radius < brick.screenY + brick.height

    let touch = false

    // top
    if (
      this.y + this.radius > brick.screenY &&
      this.y < brick.screenY + brick.height / 2 &&
      innerX
    ) {
      this.velocity.y *= -1
      this.y = brick.screenY - this.radius
      touch = true
    }

    // bottom
    else if (
      this.y - this.radius < brick.screenY + brick.height &&
      this.y > brick.screenY + brick.height / 2 &&
      innerX
    ) {
      this.velocity.y *= -1
      this.y = brick.screenY + brick.height + this.radius
      touch = true
    }

    // left
    else if (
      this.x + this.radius > brick.screenX &&
      this.x < brick.screenX + brick.width / 2 &&
      innerY
    ) {
      this.velocity.x *= -1
      this.x = brick.screenX - this.radius
      touch = true
    }

    // right
    else if (
      this.x - this.radius < brick.screenX + brick.width &&
      this.x > brick.screenX + brick.width / 2 &&
      innerY
    ) {
      this.velocity.x *= -1
      this.x = brick.screenX + brick.width + this.radius
      touch = true
    }

    brick.touchBall = touch

    if (touch) {
      brick.durability--

      if (brick.durability === 0) this.game.bricks.delete(brick)
    }
  }

  private move() {
    this.x += this.velocity.x
    this.y += this.velocity.y
  }

  private onFail() {
    this.game.balls.delete(this)

    this.game.hp--

    if (this.game.hp <= 0) this.game.onFail()

    if (this.game.balls.size === 0) {
      this.game.launchBall()
    }
  }
}
