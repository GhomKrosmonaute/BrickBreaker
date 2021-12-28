import * as _ from "./constants"

export class Bar {
  y = height * 0.9
  width = width * 0.1
  height = this.width / 4

  draw() {
    const x = mouseX
    translate(x, this.y)
    noStroke()
    fill(60, 60, 200)
    rect(
      (this.width / 2) * -1,
      (this.height / 2) * -1,
      this.width,
      this.height,
      this.height / 3
    )
    translate(-x, -this.y)
  }
}
