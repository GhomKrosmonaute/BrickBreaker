import * as _ from "./constants"

import * as game from "./game"

export class Ball {
  x = width / 2
  y = height * 0.8
  radius = width * 0.007
  angle = 0
  velocity = createVector()
  speed = _.BALL_BASE_SPEED()
  tail: { x: number; y: number }[] = []

  constructor(private game: game.Game) {
    this.setRandomVelocity()
  }

  draw() {
    this.update()
    noStroke()
    fill(255)
    for (const part of this.tail) {
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
    circle(this.x, this.y, this.radius * 2)
    if (_.DEBUG_MODE)
      text(
        `speed: ${this.speed}\nangle: ${Math.round(
          this.angle
        )}\nvelocity:\n   x=${this.velocity.x}\n    y=${this.velocity.y}`,
        this.x + this.radius,
        this.y + this.radius
      )
  }

  private update() {
    this.save()
    this.checkFail()
    this.bricks()
    this.accelerate()
    this.move()
    this.bounds()
  }

  setRandomVelocity() {
    this.setAngle(random(-179, -1))

    if (this.velocity.y > 0) {
      this.velocity.y *= -1

      this.refreshAngle()
    }
  }

  setAngle(angle: number) {
    this.angle = angle

    this.refreshVelocity()
  }

  refreshVelocity() {
    this.velocity.set(cos(this.angle), sin(this.angle)).mult(this.speed)

    this.refreshAngle()
  }

  refreshAngle() {
    const a = createVector()
    const b = this.velocity

    this.angle = degrees(atan2(b.y - a.y, b.x - a.x))
  }

  save() {
    this.tail.push({
      x: this.x,
      y: this.y,
    })

    if (this.tail.length > _.TAIL_LENGTH) this.tail.shift()
  }

  private checkFail() {
    if (this.y + this.radius >= height) this.onFail()
  }

  private bounds() {
    if (this.x + this.radius >= width || this.x - this.radius <= 0) {
      this.velocity.x *= -1

      this.refreshAngle()
    }

    if (this.y - this.radius <= 0) {
      this.velocity.y *= -1

      this.refreshAngle()
    }
  }

  private bricks() {
    const brick = Array.from(this.game.bricks).sort((a, b) => {
      return (
        dist(
          a.screenX + this.game.BRICK_WIDTH / 2,
          a.screenY + this.game.BRICK_HEIGHT / 2,
          this.x,
          this.y
        ) -
        dist(
          b.screenX + this.game.BRICK_WIDTH / 2,
          b.screenY + this.game.BRICK_HEIGHT / 2,
          this.x,
          this.y
        )
      )
    })[0]

    if (!brick) return

    const innerX =
      this.x > brick.screenX && this.x < brick.screenX + this.game.BRICK_WIDTH
    const innerY =
      this.y + this.radius > brick.screenY &&
      this.y - this.radius < brick.screenY + this.game.BRICK_HEIGHT

    let touch = false

    // top
    if (
      this.y + this.radius > brick.screenY &&
      this.y < brick.screenY + this.game.BRICK_HEIGHT / 2 &&
      innerX
    ) {
      this.velocity.y *= -1
      this.y = brick.screenY - this.radius

      touch = true

      this.refreshAngle()
    }

    // bottom
    else if (
      this.y - this.radius < brick.screenY + this.game.BRICK_HEIGHT &&
      this.y > brick.screenY + this.game.BRICK_HEIGHT / 2 &&
      innerX
    ) {
      this.velocity.y *= -1
      this.y = brick.screenY + this.game.BRICK_HEIGHT + this.radius

      touch = true

      this.refreshAngle()
    }

    // left
    else if (
      this.x + this.radius > brick.screenX &&
      this.x < brick.screenX + this.game.BRICK_WIDTH / 2 &&
      innerY
    ) {
      this.velocity.x *= -1
      this.x = brick.screenX - this.radius

      touch = true

      this.refreshAngle()
    }

    // right
    else if (
      this.x - this.radius < brick.screenX + this.game.BRICK_WIDTH &&
      this.x > brick.screenX + this.game.BRICK_WIDTH / 2 &&
      innerY
    ) {
      this.velocity.x *= -1
      this.x = brick.screenX + this.game.BRICK_WIDTH + this.radius

      touch = true

      this.refreshAngle()
    }

    brick.touchBall = touch

    if (touch) brick.hit()
  }

  private accelerate() {
    this.speed = map(
      this.game.score,
      0,
      500,
      _.BALL_BASE_SPEED(),
      Math.min(
        _.BALL_BASE_SPEED() * 10,
        Math.min(this.game.BRICK_HEIGHT, this.game.BRICK_WIDTH)
      )
    )
  }

  move() {
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
