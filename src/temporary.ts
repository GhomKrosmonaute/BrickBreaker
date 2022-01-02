import * as _ from "./constants"

import type * as game from "./game"
import type * as item from "./item"

export class TemporaryEffect {
  public options: TemporaryEffectOptions
  public down = false

  constructor(
    public game: game.Game,
    public itemName: item.ItemName,
    options: Pick<
      TemporaryEffectOptions,
      "up" | "down" | "onDraw" | "cancelCondition"
    >
  ) {
    this.options = {
      ...options,
      startAt: frameCount,
    }

    options.up.bind(options)(options)
  }

  draw() {
    this.options.onDraw(this.options)
    this.update()
  }

  update() {
    if (
      this.options.startAt > frameCount + _.BASE_EFFECT_DURATION ||
      this.options.cancelCondition?.(this.options) ||
      this.down
    ) {
      this.options.down.bind(this.options)(this.options)
      this.game.temporary.effects.delete(this.itemName)
    }
  }
}

export interface TemporaryEffectOptions {
  up: (effect: TemporaryEffectOptions, ...args: any[]) => unknown
  down: (effect: TemporaryEffectOptions) => unknown
  onDraw: (effect: TemporaryEffectOptions) => unknown
  cancelCondition?: (effect: TemporaryEffectOptions) => boolean
  startAt: number
}

export class TemporaryEffectManager {
  effects = new Map<item.ItemName, TemporaryEffect>()

  constructor(public game: game.Game) {}

  add(itemName: item.ItemName, effect: TemporaryEffect) {
    this.effects.set(itemName, effect)
  }

  draw() {
    let i = 0
    this.effects.forEach((effect, itemName) => {
      i++

      effect.draw()

      fill(200)
      noStroke()
      textAlign(LEFT, CENTER)
      textSize(_.BALL_BASE_RADIUS())
      text(itemName, width / 10, _.BALL_BASE_RADIUS() * 2 * i)
    })
  }
}
