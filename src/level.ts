import * as _ from "./constants"

import * as game from "./game"
import * as item from "./item"
import * as brick from "./brick"

export type LevelShape = (x: number, y: number) => boolean
export type LevelItems = (game: game.Game) => unknown

export const levelShapes: LevelShape[] = [
  (x, y) => x > 2 && x < _.GRID_WIDTH - 3 && y > 2,
  (x, y) => x < 2 || x > _.GRID_WIDTH - 3 || y < 2 || y > _.GRID_HEIGHT - 3,
  (x, y) => x % 2 === 0 || y % 3 === 0,
]

export const levelItems: LevelItems[] = [
  (game) => {
    Object.keys(item.items).forEach((name) => {
      console.log("injected:", 3, name)
      injectItems(game, 3, name as item.ItemName)
    })
  },
]

function injectItems(game: game.Game, count: number, itemName: item.ItemName) {
  for (let i = 0; i < count; i++) {
    let rand: brick.Brick = random(Array.from(game.bricks))

    while (rand.options.item !== null) {
      rand = random(Array.from(game.bricks))
    }

    rand.options.item = itemName
  }
}
