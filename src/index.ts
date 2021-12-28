/// @ts-check
/// <reference path="../node_modules/@types/p5/global.d.ts" />

import * as _ from "./constants"
import * as brick from "./brick"
import * as ball from "./ball"
import * as bar from "./bar"

document.addEventListener("contextmenu", (event) => event.preventDefault())

const bricks: brick.Brick[] = []
const balls: ball.Ball[] = []

let player: bar.Bar

export function setup() {
  const windowWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  )
  const windowHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  )

  const _width = Math.min(windowWidth, windowHeight * _.ASPECT_RATIO)
  const _height = _width / _.ASPECT_RATIO

  createCanvas(_width, _height)

  for (let x = 0; x < _.GRID_WIDTH; x++) {
    for (let y = 0; y < _.GRID_HEIGHT; y++) {
      bricks.push(brick.createRandomBrick(x, y))
    }
  }

  balls.push(new ball.Ball())

  player = new bar.Bar()
}

export function draw() {
  background(..._.BACKGROUND_COLOR)
  bricks.forEach((b) => {
    if (b.durability > 0) b.draw()
  })
  balls.forEach((b) => b.draw())
  player.draw()
}

export function keyPressed() {}
export function keyReleased() {}
