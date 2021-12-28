import * as _ from "./constants"

export class Ball {
  x = width / 2
  y = height * 0.7
  radius = width * 0.01
  angle = Math.round(Math.random() * 360)
  speed = _.BALL_BASE_SPEED

  draw() {
    noStroke()
    fill(255)
    circle(this.x, this.y, this.radius * 2)
  }
}
