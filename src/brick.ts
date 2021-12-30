import * as _ from "./constants"

import * as game from "./game"

export interface BrickOptions {
  x: number
  y: number
  durability: number
}

export class Brick {
  durability: number
  touchBall = false

  constructor(private game: game.Game, public readonly options: BrickOptions) {
    this.durability = options.durability
  }

  get screenX(): number {
    return this.options.x * this.game.BRICK_WIDTH
  }

  get screenY(): number {
    return this.options.y * this.game.BRICK_HEIGHT
  }

  draw() {
    stroke(_.BACKGROUND_COLOR)
    strokeWeight(this.touchBall ? 4 : 1)
    fill(
      255,
      0,
      0,
      Math.floor(map(this.durability, _.MAX_DURABILITY, 0, 255, 0))
    )
    rect(
      this.screenX,
      this.screenY,
      this.game.BRICK_WIDTH,
      this.game.BRICK_HEIGHT
    )
  }

  hit() {
    this.game.score++
    this.durability--

    if (this.durability === 0) {
      this.game.bricks.delete(this)
    }
  }
}

export function createRandomBrick(
  game: game.Game,
  x: number,
  y: number
): Brick {
  return new Brick(game, {
    x,
    y,
    durability: 1 + Math.floor(Math.random() * (_.MAX_DURABILITY - 1)),
  })
}
