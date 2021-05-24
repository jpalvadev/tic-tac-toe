const xClass = "x";
const oClass = "o";

const board = document.querySelector(".board");
const cells = document.querySelectorAll(".cell");
const winningOverlay = document.querySelector(".winning-message");
const winningTextEl = document.querySelector(".winning-text");

const restartBtn = document.querySelector(".restartBtn");
restartBtn.addEventListener("click", startGame);

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let oTurn;

function startGame() {
  oTurn = false;

  cells.forEach((cell) => {
    cell.classList.remove(oClass);
    cell.classList.remove(xClass);
    winningOverlay.classList.remove("visible");
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });

  setBoardHoverClass();
}

startGame();

function handleClick(e) {
  //   if (board.classList.contains("x")) {
  //     e.target.classList.add("x");
  //   } else {
  //     e.target.classList.add("o");
  //   }
  //   board.classList.toggle("x");
  //   board.classList.toggle("o");

  const cell = e.target;
  const currentClass = oTurn ? oClass : xClass;

  // place mark
  placeMark(cell, currentClass);

  // check for win
  if (checkWin(currentClass)) {
    console.log("corecctorr");
    endGame(false);
  }
  // check for draw
  if (isDraw()) {
    endGame(true);
  } else {
    // switch turn
    swapTurn();

    // correct hover on board
    setBoardHoverClass();
  }
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurn() {
  oTurn = !oTurn;
}

function setBoardHoverClass() {
  board.classList.remove(xClass);
  board.classList.remove(oClass);

  if (oTurn) board.classList.add(oClass);
  else board.classList.add(xClass);
}

function checkWin(currentClass) {
  // console.log(currentClass);
  return winConditions.some((condition) => {
    return condition.every((index) => {
      return cells[index].classList.contains(currentClass);
    });
  });
}

function isDraw() {
  console.log("ja");
  // cells is a Nodelist, and Nodelist doesn't contain the every method, so we use destructuring to transform the Nodelist into an array
  return [...cells].every((cell) => {
    return cell.classList.contains(oClass) || cell.classList.contains(xClass);
  });
}

function endGame(draw) {
  if (draw) {
    console.log("empate");
    winningTextEl.textContent = `It's a DRAW!`;
    // return;
  } else {
    winningTextEl.textContent = `${oTurn ? "O's" : "X's"} Wins!`;
  }
  winningOverlay.classList.add("visible");
}
