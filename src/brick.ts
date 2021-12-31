import * as _ from "./constants"

import * as item from "./item"
import * as game from "./game"
import * as ball from "./ball"
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

  setDurability(durability: number, ball?: ball.Ball) {
    this._durability = durability
    if (this._durability <= 0) {
      this.kill(ball)
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

  get item(): typeof item.items[keyof typeof item.items] | null {
    if (this.options.item !== null) {
      return item.items[this.options.item]
    }

    return null
  }

  draw() {
    stroke(_.BACKGROUND_COLOR)
    strokeWeight(this.touchBall ? 4 : 1)
    fill(
      ...(_.BRICK_BASE_COLOR.map((factor) => {
        return factor + (Math.random() <= 0.5 ? -20 : 20)
      }) as RGB),
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
      textSize(this.game.BRICK_HEIGHT / 2)
      text(
        this.item.icon,
        this.screenX + this.game.BRICK_WIDTH / 2,
        this.screenY + this.game.BRICK_HEIGHT / 2
      )
    }
  }

  hit(damages: number, ball?: ball.Ball) {
    if (this.durability <= 0) return

    if (this.item?.on === "touched") {
      if (
        this.options.item === "ballDuplication" ||
        this.options.item === "bomb"
      ) {
        this.item.trigger(this, ball)
      } else {
        ;(this.item as item.Item<[]>).trigger(this)
      }
    }

    this.game.score += damages
    this.setDurability(this.durability - damages, ball)
  }

  kill(ball?: ball.Ball) {
    if (!this.game.bricks.has(this)) return

    if (this.item?.on === "broken") {
      if (
        this.options.item === "ballDuplication" ||
        this.options.item === "bomb"
      ) {
        this.item.trigger(this, ball)
      } else {
        ;(this.item as item.Item<[]>).trigger(this)
      }
      this.options.item = null
    }

    this.game.bricks.delete(this)
  }
}
