/**************** CONSTANT ****************/
const COLOR_MAPPING = [
  "red",
  "orange",
  "green",
  "purple",
  "blue",
  "cyan",
  "yellow",
  "white",
];

const COLS = 10;
const ROWS = 20;
const WHITE_COLOR_ID = 7;

const KEY_CODES = {
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
};

/**************** CANVAS ****************/
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let BLOCK_SIZE;
let board;
let brick;
let gameInterval = null;
let speed = 800;

/**************** RESIZE ****************/
function resizeCanvas() {
  BLOCK_SIZE = Math.min(
    Math.floor(window.innerWidth / COLS),
    Math.floor(window.innerHeight / ROWS),
  );

  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;

  if (board) board.drawBoard();
}

window.addEventListener("resize", resizeCanvas);

/**************** BOARD ****************/
class Board {
  constructor(ctx) {
    this.ctx = ctx;
    this.grid = this.createGrid();
    this.score = 0;
    this.gameOver = false;
    this.isPlaying = false;
  }

  createGrid() {
    return Array.from({ length: ROWS }, () =>
      Array(COLS).fill(WHITE_COLOR_ID),
    );
  }

  reset() {
    this.grid = this.createGrid();
    this.score = 0;
    this.gameOver = false;
    document.getElementById("score").innerText = 0;
    this.drawBoard();
  }

  drawCell(x, y, colorId) {
    this.ctx.fillStyle =
      COLOR_MAPPING[colorId] || COLOR_MAPPING[WHITE_COLOR_ID];
    this.ctx.fillRect(
      x * BLOCK_SIZE,
      y * BLOCK_SIZE,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(
      x * BLOCK_SIZE,
      y * BLOCK_SIZE,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
  }

  drawBoard() {
    this.grid.forEach((row, y) =>
      row.forEach((cell, x) => this.drawCell(x, y, cell)),
    );
  }

  clearFullRows() {
    const newGrid = this.grid.filter((row) =>
      row.some((cell) => cell === WHITE_COLOR_ID),
    );

    const cleared = ROWS - newGrid.length;
    if (cleared > 0) {
      const emptyRows = Array.from({ length: cleared }, () =>
        Array(COLS).fill(WHITE_COLOR_ID),
      );
      this.grid = [...emptyRows, ...newGrid];
      this.score += cleared * 10;
      document.getElementById("score").innerText = this.score;
    }
  }

  gameOverHandler() {
    this.gameOver = true;
    this.isPlaying = false;
    clearInterval(gameInterval);
    alert("Game Over!");
    this.reset();
  }
}

/**************** BRICK ****************/
class Brick {
  constructor(layouts) {
    this.layouts = layouts;
    this.index = 0;
    this.row = -2;
    this.col = 3;
  }

  get shape() {
    return this.layouts[this.index];
  }

  draw(colorId) {
    this.shape.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell !== WHITE_COLOR_ID && this.row + y >= 0) {
          board.drawCell(this.col + x, this.row + y, colorId);
        }
      }),
    );
  }

  clear() {
    this.draw(WHITE_COLOR_ID);
  }

  move(dx, dy) {
    if (!this.collision(this.row + dy, this.col + dx, this.shape)) {
      this.clear();
      this.row += dy;
      this.col += dx;
      this.draw(this.id);
      return true;
    }
    return false;
  }

  rotate() {
    const nextIndex = (this.index + 1) % 4;
    const nextShape = this.layouts[nextIndex];
    if (!this.collision(this.row, this.col, nextShape)) {
      this.clear();
      this.index = nextIndex;
      this.draw(this.id);
    }
  }

  collision(nextRow, nextCol, shape) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        if (shape[y][x] !== WHITE_COLOR_ID) {
          const newX = nextCol + x;
          const newY = nextRow + y;

          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && board.grid[newY][newX] !== WHITE_COLOR_ID)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  lock() {
    if (this.row <= 0) {
      board.gameOverHandler();
      return;
    }

    this.shape.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell !== WHITE_COLOR_ID) {
          board.grid[this.row + y][this.col + x] = this.id;
        }
      }),
    );

    board.clearFullRows();
    board.drawBoard();
    spawnBrick();
  }
}

/**************** GAME ****************/
const BRICK_LAYOUT = [...arguments][0] || window.BRICK_LAYOUT;

function spawnBrick() {
  const id = Math.floor(Math.random() * BRICK_LAYOUT.length);
  brick = new Brick(BRICK_LAYOUT[id]);
  brick.id = id;
  brick.draw(id);
}

function gameLoop() {
  if (!brick.move(0, 1)) {
    brick.lock();
  }

  if (board.score >= 100 && speed > 200) {
    speed -= 100;
    restartLoop();
  }
}

function restartLoop() {
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
}

/**************** INPUT ****************/
document.addEventListener("keydown", (e) => {
  if (!board.isPlaying) return;
  if (e.code === KEY_CODES.LEFT) brick.move(-1, 0);
  if (e.code === KEY_CODES.RIGHT) brick.move(1, 0);
  if (e.code === KEY_CODES.DOWN) brick.move(0, 1);
  if (e.code === KEY_CODES.UP) brick.rotate();
});

/**************** BUTTONS ****************/
const controls = {
  "left-btn": () => brick.move(-1, 0),
  "right-btn": () => brick.move(1, 0),
  "down-btn": () => brick.move(0, 1),
  "up-btn": () => brick.rotate(),
};

Object.keys(controls).forEach((id) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  ["click", "touchstart"].forEach((evt) =>
    btn.addEventListener(evt, (e) => {
      e.preventDefault();
      if (board.isPlaying) controls[id]();
    }),
  );
});

/**************** START ****************/
document.getElementById("play").addEventListener("click", () => {
  clearInterval(gameInterval);
  speed = 800;
  board.reset();
  board.isPlaying = true;
  spawnBrick();
  gameInterval = setInterval(gameLoop, speed);
});

/**************** INIT ****************/
board = new Board(ctx);
resizeCanvas();
board.drawBoard();
