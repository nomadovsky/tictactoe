const Cell = (el) => {
  const state = {
    cellValue: 0,
    htmlElement: el,
  };

  const setCellValue = (value) => {
    state.cellValue = value;
  };

  const renderValue = () => {
    state.cellValue === 1
      ? state.htmlElement.classList.add("X")
      : state.htmlElement.classList.add("circle");
  };
  return { state, setCellValue, renderValue };
};

const Gameboard = (() => {
  //size of array
  const state = {
    size: 9,
  };

  const setSize = (value) => {
    state.size = value;
  };

  const readSize = () => state.size;

  function createCells() {
    const size = state.size;
    //initial index
    index = 0;

    //array of cells
    let cells = new Array(size); // Array.from({ length: size }, (v, i) => i);

    // parent div element
    const board = document.querySelector(".board");

    //clear board
    board.innerHTML = "";

    //append cells to board div
    for (let c = 0; c < size; c++) {
      let cell = document.createElement("div");
      board.appendChild(cell);
      cell.className = "cell";
      cell.id = `cell-${index}`;
      const newCell = Cell(cell);
      cells[index] = newCell;
      index++;
    }
    return cells;
  }

  function resetBoard() {
    const board = document.querySelector(".board");
    board.innerHTML = "";
  }
  return { createCells, resetBoard, setSize, readSize };
})();

const Player = () => {
  let state = {
    currentPlayer: 1,
  };

  const switchPlayer = () => {
    state.currentPlayer *= -1;
  };

  return { state, switchPlayer };
};

const makeMove = (cell, player, e) => {
  cell.setCellValue(player);
};

const checkWinner = (cells, size) => {
  let lastResult = null;
  let winningCombo = [];
  const row = Math.sqrt(size);

  //check winner for rows
  const checkRows = (() => {
    for (let i = 0; i < size; i += row) {
      let currentCombo = [];
      let j = i;
      for (j; j < i + row; j++) {
        currentCombo.push(j);
      }
      winningCombo.push(currentCombo);
    }
  })();

  //check winner for columns
  const checkColumns = (() => {
    for (let i = 0; i < row; i++) {
      let currentCombo = [];
      let j = i;
      for (j; j < size; j += row) {
        currentCombo.push(j);
      }
      winningCombo.push(currentCombo);
    }
  })();

  //check winner for top left to bottom right diagonal
  const checkDiagonalL = (() => {
    let combo = [];
    for (let i = 0; i < size; i += row + 1) {
      combo.push(i);
    }
    winningCombo.push(combo);
  })();

  //check winner for top right to bottom left diagonal
  const checkDiagonalR = (() => {
    let combo = [];
    for (let i = row - 1; i <= size - row; i += row - 1) {
      combo.push(i);
    }
    winningCombo.push(combo);
  })();

  //ToDo for 4x4:
  for (const combo of winningCombo) {
    const result = document.querySelector(".result");
    const [a, b, c, d] = combo;

    const draw = cells.every((cell) => {
      return cell.state.cellValue !== 0;
    });
    if (
      (Gameboard.readSize() === 9 &&
        cells[a].state.cellValue !== 0 &&
        cells[a].state.cellValue === cells[b].state.cellValue &&
        cells[a].state.cellValue === cells[c].state.cellValue) ||
      (Gameboard.readSize() === 16 &&
        cells[a].state.cellValue !== 0 &&
        cells[a].state.cellValue === cells[b].state.cellValue &&
        cells[a].state.cellValue === cells[c].state.cellValue &&
        cells[a].state.cellValue === cells[d].state.cellValue)
    ) {
      let winner = "";
      if (cells[a].state.cellValue === 1) {
        winner = "X's won!";
        lastResult = 1;
      } else {
        winner = "O's won!";
        lastResult = -1;
      }
      result.querySelector("h2").innerText = winner;
      result.classList.add("active");

      return lastResult;
    } else if (draw) {
      lastResult = 0;
      result.querySelector("h2").innerText = "It's a draw";
      document.querySelector(".result").classList.add("active");
    }
  }
  return lastResult;
};

const resetGame = () => {
  Gameboard.resetBoard();
  const letsPlay = document.querySelector(".startGame");
  letsPlay.classList.add("active");
  const result = document.querySelector(".result");
  result.classList.remove("active");
};

const playerMove = (cell, board, player, currentPlayer, size, e) => {
  makeMove(cell, currentPlayer, e);
  cell.renderValue();
  checkWinner(board, size);
  player.switchPlayer();
};

const aiMove = (board, currentPlayer) => {
  let currentBoard = [...board];
  let rand;
  let currentCell;
  const isNotEmpty = (el) => el.state.cellValue === 0;
  if (!currentBoard.some(isNotEmpty)) return currentBoard;

  do {
    rand = Math.floor(Math.random() * currentBoard.length);
    currentCell = currentBoard[rand];
  } while (currentCell.state.cellValue !== 0);
  currentCell.setCellValue(currentPlayer);
  currentCell.renderValue();
  return currentBoard;
};

const boardSize = () => {
  const btn3x = document.querySelector("#btn-x3");
  const btn4x = document.querySelector("#btn-x4");
  const letsPlay = document.querySelector(".startGame");
  const board = document.querySelector(".board");
  const board3x = document.querySelector(".x3");
  const board4x = document.querySelector(".x4");
  board3x && board3x.classList.remove("x3");
  board4x && board4x.classList.remove("x4");

  btn3x.addEventListener("click", () => {
    letsPlay.classList.remove("active");
    board.classList.add("x3");
    gamePlay(9);
  });
  btn4x.addEventListener("click", () => {
    letsPlay.classList.remove("active");
    board.classList.add("x4");
    gamePlay(16);
  });
};

const gamePlay = (val) => {
  Gameboard.setSize(val);
  size = Gameboard.readSize();
  let cells = Gameboard.createCells();
  let player = Player();

  cells.forEach((cell) => {
    cell.state.htmlElement.addEventListener("click", (e) => {
      if (cell.state.cellValue !== 0) return;
      playerMove(cell, cells, player, player.state.currentPlayer, size, e);
      cells = aiMove(cells, player.state.currentPlayer);
      checkWinner(cells, size);
      player.switchPlayer();
    });
  });

  const resetBtn = document.querySelector(".resetBtn");
  resetBtn.addEventListener(
    "click",
    () => {
      resetGame();
      boardSize();
    },
    { once: true }
  );
};

boardSize();
