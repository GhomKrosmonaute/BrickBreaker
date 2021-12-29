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
      this.height / 3
    )
    translate(-this.x, -this.y)
  }

  private update() {
    this.bounds()
    this.move()
  }

  private bounds() {
    this.game.balls.forEach((ball) => {
      if (
        ball.y + ball.radius > this.y - this.height / 2 &&
        ball.x + ball.radius > this.x - this.width / 2 &&
        ball.x - ball.radius < this.x + this.width / 2
      ) {
        ball.velocity.y *= -1
        ball.y = this.y - this.height / 2 - ball.radius
      }
    })
  }

  private move() {
    const x = Array.from(this.game.balls)[0]?.x ?? mouseX

    this.x = min(max(this.width / 2, x), width - this.width / 2)
  }
}
