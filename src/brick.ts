import * as _ from "./constants"

import * as item from "./item"
import * as game from "./game"
import * as level from "./level"

export type EventName = "broken" | "touched"

export interface BrickOptions {
  x: number
  y: number
  durability: number
  item: item.ItemName | null
}

export class Brick {
  private _durability: number
  touchBall = false

  constructor(public game: game.Game, public readonly options: BrickOptions) {
    this._durability = options.durability
  }

  set durability(durability: number) {
    this._durability = durability
    if (this._durability <= 0) {
      this.kill()
    }
  }

  get durability(): number {
    return this._durability
  }

  get screenX(): number {
    return this.options.x * this.game.BRICK_WIDTH
  }

  get screenY(): number {
    return this.options.y * this.game.BRICK_HEIGHT
  }

  get item(): item.Item | null {
    if (this.options.item !== null) {
      return item.items[this.options.item]
    }

    return null
  }

  draw() {
    stroke(_.BACKGROUND_COLOR)
    strokeWeight(this.touchBall ? 4 : 1)
    fill(
      ..._.BRICK_BASE_COLOR,
      Math.floor(map(this.durability, this.game.level, 0, 255, 0))
    )
    rect(
      this.screenX,
      this.screenY,
      this.game.BRICK_WIDTH,
      this.game.BRICK_HEIGHT,
      this.game.BRICK_HEIGHT / 4
    )
    if (this.options.item !== null) {
      noStroke()
      fill(255)
      circle(
        this.screenX + this.game.BRICK_WIDTH / 2,
        this.screenY + this.game.BRICK_HEIGHT / 2,
        this.game.BRICK_HEIGHT / 2
      )
    }
  }

  hit(damages: number) {
    if (this.item?.on === "touched") this.item.trigger(this)

    this.game.score += damages
    this.durability -= damages
  }

  kill() {
    if (this.item?.on === "broken") {
      this.item.trigger(this)
      this.options.item = null
    }

    this.game.bricks.delete(this)
  }
}
