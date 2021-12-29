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

  get width(): number {
    return Math.floor(width / _.GRID_WIDTH)
  }

  get height(): number {
    return this.width / _.ASPECT_RATIO
  }

  get screenX(): number {
    return this.options.x * this.width
  }

  get screenY(): number {
    return this.options.y * this.height
  }

  draw() {
    this.update()
    stroke(_.BACKGROUND_COLOR)
    strokeWeight(this.touchBall ? 4 : 1)
    fill(
      255,
      0,
      0,
      Math.floor(map(this.durability, _.MAX_DURABILITY, 0, 255, 0))
    )
    rect(this.screenX, this.screenY, this.width, this.height)
  }

  private update() {
    this.bounds()
  }

  private bounds() {}
}

export function createRandomBrick(
  game: game.Game,
  x: number,
  y: number
): Brick {
  return new Brick(game, {
    x,
    y,
    durability: floor(random(_.MAX_DURABILITY)),
  })
}
