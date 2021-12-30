import * as game from "./game"

export class Info {
  constructor(private game: game.Game) {}

  draw() {
    this.score()
    this.highScore()
    this.hp()
    this.speed()
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
}
