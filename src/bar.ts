import * as game from "./game"

export class Bar {
  x = 200
  y = height * 0.9
  width = width * 0.1
  height = this.width / 4

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
        ball.x + ball.radius > this.x - this.width / 2 &&
        ball.x - ball.radius < this.x + this.width / 2
      ) {
        ball.velocity.y = -abs(ball.velocity.y)

        ball.refreshAngle()

        if (ball.x + ball.radius < this.x - this.width / 4) {
          ball.angle += map(
            ball.x + ball.radius,
            this.x - this.width / 4,
            this.x - this.width / 2,
            1,
            20,
            true
          )

          console.log("left corner", ball.angle)

          ball.angle = constrain(ball.angle, -179, -1)

          ball.refreshVelocity()
        }

        if (ball.x - ball.radius > this.x + this.width / 4) {
          ball.angle -= map(
            ball.x - ball.radius,
            this.x + this.width / 4,
            this.x + this.width / 2,
            1,
            20,
            true
          )

          console.log("right corner", ball.angle)

          ball.angle = constrain(ball.angle, -179, -1)

          ball.refreshVelocity()
        }

        // décaler la balle hors de la bar si elle est trop a droite ou a gauche
        if (ball.x <= this.x - this.width / 2) {
          ball.x = this.x - this.width / 2 - ball.radius
        } else if (ball.x >= this.x + this.width / 2) {
          ball.x = this.x + this.width / 2 + ball.radius
        } else {
          ball.y = this.y - this.height / 2 - ball.radius
        }
      }
    })
  }

  private move() {
    const x = /* Array.from(this.game.balls)[0]?.x ?? */ mouseX

    this.x = min(max(this.width / 2, x), width - this.width / 2)
  }
}
