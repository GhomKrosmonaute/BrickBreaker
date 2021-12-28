import * as _ from "./constants"

export interface BrickOptions {
  x: number
  y: number
  durability: number
}

export class Brick {
  durability: number

  constructor(public readonly options: BrickOptions) {
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
    stroke(_.BACKGROUND_COLOR)
    strokeWeight(1)
    fill(
      255,
      0,
      0,
      Math.floor(map(this.durability, _.MAX_DURABILITY, 0, 255, 0))
    )
    rect(this.screenX, this.screenY, this.width, this.height)
  }
}

export function createRandomBrick(x: number, y: number): Brick {
  return new Brick({
    x,
    y,
    durability: Math.floor(Math.random() * _.MAX_DURABILITY),
  })
}
