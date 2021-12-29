/// @ts-check
/// <reference path="../node_modules/@types/p5/global.d.ts" />

import * as _ from "./constants"
import { Game } from "./game"

document.addEventListener("contextmenu", (event) => event.preventDefault())

let game: Game

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

  frameRate(30)

  game = new Game(() => frameRate(0))
}

export function draw() {
  game.draw()
}

export function keyPressed() {}
export function keyReleased() {}
