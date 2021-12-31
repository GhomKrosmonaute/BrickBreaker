import * as _ from "./constants"

import type * as game from "./game"

export class TemporaryEffect<Data> {
  public options: TemporaryEffectOptions<Data>
  public down = false

  constructor(
    public game: game.Game,
    options: Pick<
      TemporaryEffectOptions<Data>,
      "up" | "down" | "onDraw" | "data" | "cancelCondition" | "onBallCreate"
    >
  ) {
    this.options = {
      ...options,
      startAt: frameCount,
    }

    this.options.data = options.up.bind(options)(options)
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
      this.game.temporary.effects.delete(this)
    }
  }
}

export interface TemporaryEffectOptions<Data> {
  up: (effect: TemporaryEffectOptions<Data>, ...args: any[]) => Data
  down: (effect: TemporaryEffectOptions<Data>) => unknown
  onDraw: (effect: TemporaryEffectOptions<Data>) => unknown
  cancelCondition?: (effect: TemporaryEffectOptions<Data>) => boolean
  onBallCreate?: true
  data: Data
  startAt: number
}

export class TemporaryEffectManager {
  effects = new Set<TemporaryEffect<any>>()

  constructor(public game: game.Game) {}

  add<Data>(effect: TemporaryEffect<Data>) {
    this.effects.add(effect)
  }

  draw() {
    this.effects.forEach((effect) => effect.draw())
  }
}
