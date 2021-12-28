var app = (() => {
  var __defProp = Object.defineProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __export = (target, all) => {
    __markAsModule(target);
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    draw: () => draw,
    keyPressed: () => keyPressed,
    keyReleased: () => keyReleased,
    setup: () => setup
  });

  // src/constants.ts
  var ASPECT_RATIO = 16 / 9;
  var GRID_WIDTH = 20;
  var GRID_HEIGHT = 8;
  var MAX_DURABILITY = 5;
  var BACKGROUND_COLOR = [0, 0, 0];
  var BALL_BASE_SPEED = 5;

  // src/brick.ts
  var Brick = class {
    constructor(options) {
      this.options = options;
      this.durability = options.durability;
    }
    get width() {
      return Math.floor(width / GRID_WIDTH);
    }
    get height() {
      return this.width / ASPECT_RATIO;
    }
    get screenX() {
      return this.options.x * this.width;
    }
    get screenY() {
      return this.options.y * this.height;
    }
    draw() {
      stroke(BACKGROUND_COLOR);
      strokeWeight(1);
      fill(255, 0, 0, Math.floor(map(this.durability, MAX_DURABILITY, 0, 255, 0)));
      rect(this.screenX, this.screenY, this.width, this.height);
    }
  };
  function createRandomBrick(x, y) {
    return new Brick({
      x,
      y,
      durability: Math.floor(Math.random() * MAX_DURABILITY)
    });
  }

  // src/ball.ts
  var Ball = class {
    constructor() {
      this.x = width / 2;
      this.y = height * 0.7;
      this.radius = width * 0.01;
      this.angle = Math.round(Math.random() * 360);
      this.speed = BALL_BASE_SPEED;
    }
    draw() {
      noStroke();
      fill(255);
      circle(this.x, this.y, this.radius * 2);
    }
  };

  // src/bar.ts
  var Bar = class {
    constructor() {
      this.y = height * 0.9;
      this.width = width * 0.1;
      this.height = this.width / 4;
    }
    draw() {
      const x = mouseX;
      translate(x, this.y);
      noStroke();
      fill(60, 60, 200);
      rect(this.width / 2 * -1, this.height / 2 * -1, this.width, this.height, this.height / 3);
      translate(-x, -this.y);
    }
  };

  // src/index.ts
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  var bricks = [];
  var balls = [];
  var player;
  function setup() {
    const windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const _width = Math.min(windowWidth, windowHeight * ASPECT_RATIO);
    const _height = _width / ASPECT_RATIO;
    createCanvas(_width, _height);
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        bricks.push(createRandomBrick(x, y));
      }
    }
    balls.push(new Ball());
    player = new Bar();
  }
  function draw() {
    background(...BACKGROUND_COLOR);
    bricks.forEach((b) => {
      if (b.durability > 0)
        b.draw();
    });
    balls.forEach((b) => b.draw());
    player.draw();
  }
  function keyPressed() {
  }
  function keyReleased() {
  }
  return src_exports;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb25zdGFudHMudHMiLCAic3JjL2JyaWNrLnRzIiwgInNyYy9iYWxsLnRzIiwgInNyYy9iYXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyBAdHMtY2hlY2tcclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL25vZGVfbW9kdWxlcy9AdHlwZXMvcDUvZ2xvYmFsLmQudHNcIiAvPlxyXG5cclxuaW1wb3J0ICogYXMgXyBmcm9tIFwiLi9jb25zdGFudHNcIlxyXG5pbXBvcnQgKiBhcyBicmljayBmcm9tIFwiLi9icmlja1wiXHJcbmltcG9ydCAqIGFzIGJhbGwgZnJvbSBcIi4vYmFsbFwiXHJcbmltcG9ydCAqIGFzIGJhciBmcm9tIFwiLi9iYXJcIlxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIChldmVudCkgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSlcclxuXHJcbmNvbnN0IGJyaWNrczogYnJpY2suQnJpY2tbXSA9IFtdXHJcbmNvbnN0IGJhbGxzOiBiYWxsLkJhbGxbXSA9IFtdXHJcblxyXG5sZXQgcGxheWVyOiBiYXIuQmFyXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgY29uc3Qgd2luZG93V2lkdGggPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApXHJcbiAgY29uc3Qgd2luZG93SGVpZ2h0ID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApXHJcblxyXG4gIGNvbnN0IF93aWR0aCA9IE1hdGgubWluKHdpbmRvd1dpZHRoLCB3aW5kb3dIZWlnaHQgKiBfLkFTUEVDVF9SQVRJTylcclxuICBjb25zdCBfaGVpZ2h0ID0gX3dpZHRoIC8gXy5BU1BFQ1RfUkFUSU9cclxuXHJcbiAgY3JlYXRlQ2FudmFzKF93aWR0aCwgX2hlaWdodClcclxuXHJcbiAgZm9yKGxldCB4ID0gMDsgeCA8IF8uR1JJRF9XSURUSDsgeCArKyl7XHJcbiAgICBmb3IobGV0IHkgPSAwOyB5PCBfLkdSSURfSEVJR0hUOyB5ICsrKXtcclxuICAgICAgYnJpY2tzLnB1c2goYnJpY2suY3JlYXRlUmFuZG9tQnJpY2soeCwgeSkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBiYWxscy5wdXNoKG5ldyBiYWxsLkJhbGwpXHJcblxyXG4gIHBsYXllciA9IG5ldyBiYXIuQmFyXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xyXG4gIGJhY2tncm91bmQoLi4uXy5CQUNLR1JPVU5EX0NPTE9SKVxyXG4gIGJyaWNrcy5mb3JFYWNoKGIgPT4ge1xyXG4gICAgaWYoYi5kdXJhYmlsaXR5ID4gMCkgYi5kcmF3KClcclxuICB9KVxyXG4gIGJhbGxzLmZvckVhY2goYiA9PiBiLmRyYXcoKSlcclxuICBwbGF5ZXIuZHJhdygpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBrZXlQcmVzc2VkKCkge31cclxuZXhwb3J0IGZ1bmN0aW9uIGtleVJlbGVhc2VkKCkge31cclxuIiwgImV4cG9ydCBjb25zdCBBU1BFQ1RfUkFUSU8gPSAxNi85XHJcbmV4cG9ydCBjb25zdCBHUklEX1dJRFRIID0gMjBcclxuZXhwb3J0IGNvbnN0IEdSSURfSEVJR0hUID0gOFxyXG5leHBvcnQgY29uc3QgTUFYX0RVUkFCSUxJVFkgPSA1XHJcbmV4cG9ydCBjb25zdCBCQUNLR1JPVU5EX0NPTE9SOiBSR0IgPSBbMCwwLDBdXHJcbmV4cG9ydCBjb25zdCBCQUxMX0JBU0VfU1BFRUQgPSA1IiwgImltcG9ydCAqIGFzIF8gZnJvbSBcIi4vY29uc3RhbnRzXCJcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnJpY2tPcHRpb25zIHtcclxuICB4OiBudW1iZXJcclxuICB5OiBudW1iZXJcclxuICBkdXJhYmlsaXR5OiBudW1iZXJcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJyaWNrIHtcclxuICBkdXJhYmlsaXR5OiBudW1iZXJcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogQnJpY2tPcHRpb25zXHJcbiAgKSB7XHJcbiAgICB0aGlzLmR1cmFiaWxpdHkgPSBvcHRpb25zLmR1cmFiaWxpdHlcclxuICB9XHJcblxyXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3Iod2lkdGggLyBfLkdSSURfV0lEVEgpXHJcbiAgfVxyXG5cclxuICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy53aWR0aCAvIF8uQVNQRUNUX1JBVElPXHJcbiAgfVxyXG5cclxuICBnZXQgc2NyZWVuWCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54ICogdGhpcy53aWR0aFxyXG4gIH1cclxuXHJcbiAgZ2V0IHNjcmVlblkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueSAqIHRoaXMuaGVpZ2h0XHJcbiAgfVxyXG5cclxuICBkcmF3KCkge1xyXG4gICAgc3Ryb2tlKF8uQkFDS0dST1VORF9DT0xPUilcclxuICAgIHN0cm9rZVdlaWdodCgxKVxyXG4gICAgZmlsbCgyNTUsIDAsIDAsIE1hdGguZmxvb3IobWFwKHRoaXMuZHVyYWJpbGl0eSwgXy5NQVhfRFVSQUJJTElUWSwgMCwgMjU1LCAwKSkpXHJcbiAgICByZWN0KHRoaXMuc2NyZWVuWCwgdGhpcy5zY3JlZW5ZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSYW5kb21Ccmljayh4OiBudW1iZXIsIHk6IG51bWJlcik6IEJyaWNrIHtcclxuICByZXR1cm4gbmV3IEJyaWNrKHtcclxuICAgIHgsIHksIGR1cmFiaWxpdHk6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIF8uTUFYX0RVUkFCSUxJVFkpXHJcbiAgfSlcclxufSIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXHJcblxyXG5leHBvcnQgY2xhc3MgQmFsbCB7XHJcbiAgeCA9IHdpZHRoIC8gMlxyXG4gIHkgPSBoZWlnaHQgKiAuN1xyXG4gIHJhZGl1cyA9IHdpZHRoICogLjAxXHJcbiAgYW5nbGUgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAzNjApXHJcbiAgc3BlZWQgPSBfLkJBTExfQkFTRV9TUEVFRFxyXG5cclxuICBkcmF3KCkge1xyXG4gICAgbm9TdHJva2UoKVxyXG4gICAgZmlsbCgyNTUpXHJcbiAgICBjaXJjbGUodGhpcy54LHRoaXMueSwgdGhpcy5yYWRpdXMgKiAyKVxyXG4gIH1cclxufSIsICJpbXBvcnQgKiBhcyBfIGZyb20gXCIuL2NvbnN0YW50c1wiXHJcblxyXG5leHBvcnQgY2xhc3MgQmFyIHtcclxuICB5ID0gaGVpZ2h0ICogLjlcclxuICB3aWR0aCA9IHdpZHRoICogLjFcclxuICBoZWlnaHQgPSB0aGlzLndpZHRoIC8gNFxyXG5cclxuICBkcmF3KCkge1xyXG4gICAgY29uc3QgeCA9IG1vdXNlWFxyXG4gICAgdHJhbnNsYXRlKHgsIHRoaXMueSlcclxuICAgIG5vU3Ryb2tlKClcclxuICAgIGZpbGwoNjAsIDYwLDIwMClcclxuICAgIHJlY3QoXHJcbiAgICAgIHRoaXMud2lkdGggLyAyICogLTEsXHJcbiAgICAgIHRoaXMuaGVpZ2h0IC8gMiAqIC0xLFxyXG4gICAgICB0aGlzLndpZHRoLFxyXG4gICAgICB0aGlzLmhlaWdodCxcclxuICAgICAgdGhpcy5oZWlnaHQgLyAzXHJcbiAgICApXHJcbiAgICB0cmFuc2xhdGUoLXgsIC10aGlzLnkpXHJcbiAgfVxyXG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBTyxNQUFNLGVBQWUsS0FBRztBQUN4QixNQUFNLGFBQWE7QUFDbkIsTUFBTSxjQUFjO0FBQ3BCLE1BQU0saUJBQWlCO0FBQ3ZCLE1BQU0sbUJBQXdCLENBQUMsR0FBRSxHQUFFO0FBQ25DLE1BQU0sa0JBQWtCOzs7QUNHeEIsb0JBQVk7QUFBQSxJQUdqQixZQUNrQixTQUNoQjtBQURnQjtBQUVoQixXQUFLLGFBQWEsUUFBUTtBQUFBO0FBQUEsUUFHeEIsUUFBZ0I7QUFDbEIsYUFBTyxLQUFLLE1BQU0sUUFBVTtBQUFBO0FBQUEsUUFHMUIsU0FBaUI7QUFDbkIsYUFBTyxLQUFLLFFBQVU7QUFBQTtBQUFBLFFBR3BCLFVBQWtCO0FBQ3BCLGFBQU8sS0FBSyxRQUFRLElBQUksS0FBSztBQUFBO0FBQUEsUUFHM0IsVUFBa0I7QUFDcEIsYUFBTyxLQUFLLFFBQVEsSUFBSSxLQUFLO0FBQUE7QUFBQSxJQUcvQixPQUFPO0FBQ0wsYUFBUztBQUNULG1CQUFhO0FBQ2IsV0FBSyxLQUFLLEdBQUcsR0FBRyxLQUFLLE1BQU0sSUFBSSxLQUFLLFlBQWMsZ0JBQWdCLEdBQUcsS0FBSztBQUMxRSxXQUFLLEtBQUssU0FBUyxLQUFLLFNBQVMsS0FBSyxPQUFPLEtBQUs7QUFBQTtBQUFBO0FBSS9DLDZCQUEyQixHQUFXLEdBQWtCO0FBQzdELFdBQU8sSUFBSSxNQUFNO0FBQUEsTUFDZjtBQUFBLE1BQUc7QUFBQSxNQUFHLFlBQVksS0FBSyxNQUFNLEtBQUssV0FBYTtBQUFBO0FBQUE7OztBQ3pDNUMsbUJBQVc7QUFBQSxJQUFYLGNBRlA7QUFHRSxlQUFJLFFBQVE7QUFDWixlQUFJLFNBQVM7QUFDYixvQkFBUyxRQUFRO0FBQ2pCLG1CQUFRLEtBQUssTUFBTSxLQUFLLFdBQVc7QUFDbkMsbUJBQVU7QUFBQTtBQUFBLElBRVYsT0FBTztBQUNMO0FBQ0EsV0FBSztBQUNMLGFBQU8sS0FBSyxHQUFFLEtBQUssR0FBRyxLQUFLLFNBQVM7QUFBQTtBQUFBOzs7QUNWakMsa0JBQVU7QUFBQSxJQUFWLGNBRlA7QUFHRSxlQUFJLFNBQVM7QUFDYixtQkFBUSxRQUFRO0FBQ2hCLG9CQUFTLEtBQUssUUFBUTtBQUFBO0FBQUEsSUFFdEIsT0FBTztBQUNMLFlBQU0sSUFBSTtBQUNWLGdCQUFVLEdBQUcsS0FBSztBQUNsQjtBQUNBLFdBQUssSUFBSSxJQUFHO0FBQ1osV0FDRSxLQUFLLFFBQVEsSUFBSSxJQUNqQixLQUFLLFNBQVMsSUFBSSxJQUNsQixLQUFLLE9BQ0wsS0FBSyxRQUNMLEtBQUssU0FBUztBQUVoQixnQkFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLO0FBQUE7QUFBQTs7O0FKWHhCLFdBQVMsaUJBQWlCLGVBQWUsQ0FBQyxVQUFVLE1BQU07QUFFMUQsTUFBTSxTQUF3QjtBQUM5QixNQUFNLFFBQXFCO0FBRTNCLE1BQUk7QUFFRyxtQkFBaUI7QUFDdEIsVUFBTSxjQUFjLEtBQUssSUFBSSxTQUFTLGdCQUFnQixhQUFhLE9BQU8sY0FBYztBQUN4RixVQUFNLGVBQWUsS0FBSyxJQUFJLFNBQVMsZ0JBQWdCLGNBQWMsT0FBTyxlQUFlO0FBRTNGLFVBQU0sU0FBUyxLQUFLLElBQUksYUFBYSxlQUFpQjtBQUN0RCxVQUFNLFVBQVUsU0FBVztBQUUzQixpQkFBYSxRQUFRO0FBRXJCLGFBQVEsSUFBSSxHQUFHLElBQU0sWUFBWSxLQUFLO0FBQ3BDLGVBQVEsSUFBSSxHQUFHLElBQUssYUFBYSxLQUFLO0FBQ3BDLGVBQU8sS0FBSyxBQUFNLGtCQUFrQixHQUFHO0FBQUE7QUFBQTtBQUkzQyxVQUFNLEtBQUssSUFBUztBQUVwQixhQUFTLElBQVE7QUFBQTtBQUdaLGtCQUFnQjtBQUNyQixlQUFXLEdBQUs7QUFDaEIsV0FBTyxRQUFRLE9BQUs7QUFDbEIsVUFBRyxFQUFFLGFBQWE7QUFBRyxVQUFFO0FBQUE7QUFFekIsVUFBTSxRQUFRLE9BQUssRUFBRTtBQUNyQixXQUFPO0FBQUE7QUFHRix3QkFBc0I7QUFBQTtBQUN0Qix5QkFBdUI7QUFBQTsiLAogICJuYW1lcyI6IFtdCn0K
