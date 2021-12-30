import * as game from "./game"

export class Scenes {
  constructor(private game: game.Game) {}

  drawGame() {
    if (mouseIsPressed || keyIsPressed)
      frameRate(Math.round(this.game.framerate * 5))
    else frameRate(this.game.framerate)

    this.score()
    this.highScore()
    this.hp()
    this.speed()

    this.game.bar.draw()

    this.game.bricks.forEach((b) => b.draw())
    this.game.balls.forEach((b) => b.draw())

    if (this.game.balls.size === 0) {
      this.game.launchBall()
    }
  }

  private score() {
    fill(50)
    noStroke()
    textStyle("bold")
    textAlign(CENTER, CENTER)
    textSize(Math.round(width / 20))
    text(`Score: ${this.game.score}`, width / 2, height * 0.5)
  }

  private highScore() {
    fill(45)
    noStroke()
    textStyle("bold")
    textAlign(CENTER, CENTER)
    textSize(Math.round(width / 35))
    text(`High Score: ${this.game.highScore}`, width / 2, height * 0.58)
  }

  private hp() {
    fill(30)
    noStroke()
    textStyle("bold")
    textAlign(CENTER, CENTER)
    textSize(Math.round(width / 15))
    text(`♥ = ${this.game.hp}`, width / 2, height * 0.68)
  }

  private speed() {
    fill(25)
    noStroke()
    textStyle("normal")
    textAlign(CENTER, CENTER)
    textSize(Math.round(width / 25))
    text(
      `Speed x${Array.from(this.game.balls)[0]?.speed.toFixed(1) ?? 0}`,
      width / 2,
      height * 0.79
    )
  }

  drawGameOver() {
    this.gameOver(0.4)
    this.button("Retry", 0.6, () => this.game.restart())
  }

  private gameOver(h: number) {
    fill(100, 0, 0)
    noStroke()
    textStyle("bold")
    textAlign(CENTER, CENTER)
    textSize(Math.round(width / 10))
    text(`GAME OVER`, width / 2 + Math.cos(Date.now() / 10000), height * h)
  }

  private button(content: string, h: number, onClick: () => unknown) {
    const y = height * h
    const hover = mouseY > y - height / 10 && mouseY < y + height / 10

    fill(hover ? 255 : 200)
    stroke(hover ? 100 : 50)
    strokeWeight(hover ? width / 75 : width / 100)
    textStyle("bold")
    textAlign(CENTER, CENTER)
    textSize(Math.round(width / 20))
    text(content, width / 2, y)

    if (hover && mouseIsPressed) onClick()
  }
}
