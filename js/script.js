const gameBoard = (function () {
  ///////// Declarations /////////

  const difficultyLevels = document.querySelector(".options__diff-levels");
  const playersBtns = document.querySelector(".options__player-selection-btns");
  const optionsScreen = document.querySelector(".options");
  const startBtn = document.querySelector(".options__start-btn");
  const board = document.querySelector(".game__board");
  const cells = document.querySelectorAll(".cell");
  const winningOverlay = document.querySelector(".winning-message");
  const winningTextEl = document.querySelector(".winning-text");
  const restartBtn = document.querySelectorAll(".restart-btn");
  const turnText = document.querySelector(".game__turn-text");
  const gameUI = document.querySelector(".game");
  const playerOneForm = document.querySelector(".options__form--one");
  const playerTwoForm = document.querySelector(".options__form--two");

  const optionsSelected = {
    players: false,
    difficulty: false,
  };

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

  let playerTwoTurn;

  const playerOne = {
    name: "",
    nameEl: document.querySelector(".game__player-name--one"),
    score: 0,
    scoreEl: document.querySelector(".game__player-score--one"),
    type: "human",
    mark: "x",
  };

  const playerTwo = {
    name: "",
    nameEl: document.querySelector(".game__player-name--two"),
    score: 0,
    scoreEl: document.querySelector(".game__player-score--two"),
    type: "human",
    mark: "o",
    difficulty: 0,
  };

  let origBoard = [];

  /////////// Game Logic ///////////

  function startGame() {
    playerTwoTurn = false;
    origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    turnText.textContent = `It's ${playerOne.name} turn`;
    cells.forEach((cell) => {
      cell.classList.remove(playerTwo.mark);
      cell.classList.remove(playerOne.mark);
      winningOverlay.classList.remove("visible");
      cell.removeEventListener("click", handleClick);
      cell.addEventListener("click", handleClick, { once: true });
    });

    setBoardHoverClass();
  }

  function randomAIMove() {
    const possibleMoves = emptyIndexies(origBoard);
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  function bestAIMove() {
    const bestSpot = minimax(origBoard, playerTwo.mark);
    return bestSpot.index;
  }

  function emptyIndexies(board) {
    return board.filter((space) => space !== "o" && space !== "x");
  }

  function handleClick(e) {
    const cell = e.target;
    let currentPlayer = playerTwoTurn ? playerTwo : playerOne;

    // Player Move
    putMarkOnBoardArray(cell.dataset.position, currentPlayer);
    if (checkOutcome(cell, currentPlayer)) return;

    if (playerTwo.type !== "ai") return;

    // CPU Move
    currentPlayer = playerTwoTurn ? playerTwo : playerOne;

    let computerMove;
    switch (playerTwo.difficulty) {
      case 0:
        computerMove = randomAIMove();
        break;

      case 1:
        if (Math.random() > 0.7) computerMove = bestAIMove();
        else computerMove = randomAIMove();
        break;

      case 2:
        computerMove = bestAIMove();
        cells[computerMove].removeEventListener("click", handleClick);
        break;
    }

    putMarkOnBoardArray(computerMove, currentPlayer);
    checkOutcome(cells[computerMove], currentPlayer);
  }

  function putMarkOnBoardArray(cell, currentPlayer) {
    origBoard[cell] = currentPlayer.mark;
  }

  function swapTurn() {
    playerTwoTurn = !playerTwoTurn;
    if (playerTwoTurn) turnText.textContent = `It's ${playerTwo.name} turn`;
    else turnText.textContent = `It's ${playerOne.name} turn`;
  }

  /////////// Minimax ///////////

  function minimax(newBoard, player) {
    const availSpots = emptyIndexies(newBoard);
    if (checkForWin(playerOne)) {
      return { score: -10 };
    } else if (checkForWin(playerTwo)) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = newBoard[availSpots[i]];
      newBoard[availSpots[i]] = player;

      if (player === playerTwo.mark) {
        const result = minimax(newBoard, playerOne.mark);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, playerTwo.mark);
        move.score = result.score;
      }

      newBoard[availSpots[i]] = move.index;
      moves.push(move);
    }

    let bestMove;
    if (player === playerTwo.mark) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  }

  /////////////// Outcome checks ///////////////

  function checkOutcome(cell, currentPlayer) {
    placeMark(cell, currentPlayer);

    if (checkForWin(currentPlayer)) {
      endGame(false, currentPlayer);
      return true;
    }

    if (checkForDraw()) {
      endGame(true, currentPlayer);
      return true;
    } else {
      swapTurn();
      setBoardHoverClass();
    }
  }

  function checkForWin(currentPlayer) {
    return winConditions.some((condition) => {
      return condition.every((index) => {
        return origBoard[index] === currentPlayer.mark;
      });
    });
  }

  function checkForDraw() {
    return origBoard.every((cell) => typeof cell !== "number");
  }

  function endGame(draw, currentPlayer) {
    if (draw) {
      winningTextEl.textContent = `It's a DRAW!`;
    } else {
      winningTextEl.textContent = `${currentPlayer.name} Wins!`;
      currentPlayer.score++;
      currentPlayer.scoreEl.innerHTML = `<span class="game__score-span">Score:&nbsp</span>${currentPlayer.score}`;
    }
    winningOverlay.classList.add("visible");
  }

  ////////////// UI changes and Event Listeners //////////////

  function placeMark(cell, currentPlayer) {
    cell.classList.add(currentPlayer.mark);
  }

  function setBoardHoverClass() {
    board.classList.remove(playerOne.mark);
    board.classList.remove(playerTwo.mark);

    if (playerTwoTurn) board.classList.add(playerTwo.mark);
    else board.classList.add(playerOne.mark);
  }

  function setNameAndScore() {
    playerOne.score = 0;
    playerOne.scoreEl.innerHTML = `<span class="game__score-span">Score:&nbsp</span>${playerOne.score}`;
    playerOne.nameEl.textContent =
      document.getElementById("player-1").value || "John Connor";
    playerOne.name = playerOne.nameEl.textContent;
    playerTwo.score = 0;
    playerTwo.scoreEl.innerHTML = `<span class="game__score-span">Score:&nbsp</span>${playerTwo.score}`;
    playerTwo.nameEl.textContent =
      playerTwo.type === "ai" || !document.getElementById("player-2").value
        ? "T-1000"
        : document.getElementById("player-2").value;
    playerTwo.name = playerTwo.nameEl.textContent;
  }

  startBtn.addEventListener("click", function (e) {
    optionsScreen.classList.remove("visible");
    startBtn.classList.remove("visible");

    setTimeout(() => {
      gameUI.classList.add("visible");
    }, 300);

    playerTwo.difficulty = Number(optionsSelected.difficulty);

    setNameAndScore();
    startGame();
  });

  restartBtn.forEach((btn) => btn.addEventListener("click", startGame));

  difficultyLevels.addEventListener("click", function (e) {
    if (!e.target.closest("button")) return;
    [...difficultyLevels.children].forEach((btn) =>
      btn.classList.remove("selected")
    );
    e.target.classList.add("selected");
    optionsSelected.difficulty = e.target.dataset.difficulty;
    startBtn.classList.add("visible");
  });

  playersBtns.addEventListener("click", function (e) {
    if (!e.target.closest("button")) return;

    if (e.target.classList.contains("ai")) {
      difficultyLevels.classList.add("visible");
      playerTwoForm.classList.remove("visible");
      playerTwo.type = "ai";
      playerTwo.name = "T-1000";
    } else {
      difficultyLevels.classList.remove("visible");
      playerTwoForm.classList.add("visible");
      playerTwo.type = "human";
    }
    playerOneForm.classList.add("visible");

    [...playersBtns.children].forEach((btn) =>
      btn.classList.remove("selected")
    );
    e.target.classList.add("selected");

    optionsSelected.players = true;
    startBtn.classList.add("visible");
  });
})();
