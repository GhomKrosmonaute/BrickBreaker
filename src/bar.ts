import * as _ from "./constants"

import * as game from "./game"

export class Bar {
  x = width / 2
  y = height * 1.1
  width = _.BAR_BASE_WIDTH()
  height = this.width / 4
  touchTimes = 0

  constructor(private game: game.Game) {}

  draw() {
    this.update()
    translate(this.x, this.y)
    noStroke()
    fill(60, 60, 200)
    rect(
      (this.width / 2) * -1,
      (this.height / 2) * -1,
      this.width,
      this.height,
      this.height
    )
    fill(60, 200, 255)
    rect(
      (this.width / 4) * -1,
      (this.height / 2) * -1,
      this.width / 2,
      this.height
    )
    translate(-this.x, -this.y)
  }

  private update() {
    this.move()
    this.bounds()
  }

  private bounds() {
    this.game.balls.forEach((ball) => {
      if (
        ball.y + ball.radius > this.y - this.height / 2 &&
        ball.y + ball.radius < this.y + this.height / 2 &&
        ball.x + ball.radius > this.x - this.width / 2 &&
        ball.x - ball.radius < this.x + this.width / 2
      ) {
        this.touchTimes++

        if (this.touchTimes > 1)
          console.error(
            "ball touch bar several times (" + this.touchTimes + ")"
          )

        let vel = ball.velocity

        ball.velocity = {
          x: vel.x,
          y: -abs(vel.y)
        }

        if (ball.x < this.x - this.width / 4) {
          ball.angle -= map(
            ball.x,
            this.x - this.width / 4,
            this.x - this.width / 2,
            1,
            15
          )

          ball.angle = constrain(ball.angle, -178, -2)
        }

        if (ball.x > this.x + this.width / 4) {
          ball.angle -= map(
            ball.x,
            this.x + this.width / 4,
            this.x + this.width / 2,
            1,
            15
          )

          ball.angle = constrain(ball.angle, -178, -2)
        }

        vel = ball.velocity

        // décaler la balle hors de la bar si elle est trop a droite ou a gauche
        if (ball.x <= this.x - this.width / 2) {
          ball.x = this.x - this.width / 2 - ball.radius

          ball.velocity = {
            x: -abs(vel.x),
            y: -abs(vel.y)
          }
        } else if (ball.x >= this.x + this.width / 2) {
          ball.x = this.x + this.width / 2 + ball.radius

          ball.velocity = {
            x: abs(vel.x),
            y: -abs(vel.y)
          }
        } else {
          ball.y = this.y - this.height / 2 - ball.radius
        }
      } else {
        this.touchTimes = 0
      }
    })
  }

  private move() {
    //const x = this.x + (mouseX - this.x) / 4
    const x = Array.from(this.game.balls)[0]?.x ?? mouseX
    const y = this.y + (mouseY - this.y) / 4

    this.x = min(max(x, this.width / 2), width - this.width / 2)
    this.y = min(max(y, height * 0.9), height - this.height / 2)
  }
}
