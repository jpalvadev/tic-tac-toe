const gameBoard = (function () {
  ///////// Definitions /////////

  const difficultyLevels = document.querySelector('.options__diff-levels');
  const playersBtns = document.querySelector('.options__player-btns');
  const optionsScreen = document.querySelector('.options');
  const startBtn = document.querySelector('.options__start-btn');
  const board = document.querySelector('.game__board');
  const cells = document.querySelectorAll('.cell');
  const winningOverlay = document.querySelector('.winning-message');
  const winningTextEl = document.querySelector('.winning-text');
  const restartBtn = document.querySelector('.restartBtn');

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
    name: 'John Connor',
    nameEl: document.querySelector('.game__player-name--one'),
    score: 0,
    scoreEl: document.querySelector('.game__player-score--one'),
    type: 'human',
    mark: 'x',
  };

  const playerTwo = {
    name: 'T-1000',
    nameEl: document.querySelector('.game__player-name--two'),
    score: 0,
    scoreEl: document.querySelector('.game__player-score--two'),
    type: 'human',
    mark: 'o',
    difficulty: 0,
  };

  let origBoard = [];

  /////////// Game Logic ///////////

  function startGame(options) {
    playerTwoTurn = false;
    origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    cells.forEach((cell) => {
      cell.classList.remove(playerTwo.mark);
      cell.classList.remove(playerOne.mark);
      winningOverlay.classList.remove('visible');
      cell.removeEventListener('click', handleClick);
      cell.addEventListener('click', handleClick, { once: true });
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
    return board.filter((space) => space !== 'o' && space !== 'x');
  }

  function handleClick(e) {
    const cell = e.target;
    let currentClass = playerTwoTurn ? playerTwo.mark : playerOne.mark;

    // Player Move
    putMarkOnBoardArray(cell.dataset.position, currentClass);
    if (checkOutcome(cell, currentClass)) return;

    if (playerTwo.type !== 'ai') return;

    // CPU Move
    currentClass = playerTwoTurn ? playerTwo.mark : playerOne.mark;

    let computerMove;
    switch (playerTwo.difficulty) {
      case 0:
        computerMove = randomAIMove();
        break;

      case 1:
        if (Math.random() > 0.5) computerMove = bestAIMove();
        else computerMove = randomAIMove();
        break;

      case 2:
        computerMove = bestAIMove();
        cells[computerMove].removeEventListener('click', handleClick);
        break;
    }

    putMarkOnBoardArray(computerMove, currentClass);
    checkOutcome(cells[computerMove], currentClass);
  }

  function putMarkOnBoardArray(cell, currentClass) {
    origBoard[cell] = currentClass;
  }

  function swapTurn() {
    playerTwoTurn = !playerTwoTurn;
  }

  /////////// Minimax ///////////

  function minimax(newBoard, player) {
    const availSpots = emptyIndexies(newBoard);

    if (checkForWin(playerOne.mark)) {
      return { score: -10 };
    } else if (checkForWin(playerTwo.mark)) {
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

  function checkOutcome(cell, currentClass) {
    placeMark(cell, currentClass);

    if (checkForWin(currentClass)) {
      endGame(false);
      return true;
    }

    if (checkForDraw()) {
      endGame(true);
      return true;
    } else {
      swapTurn();
      setBoardHoverClass();
    }
  }

  function checkForWin(currentClass) {
    return winConditions.some((condition) => {
      return condition.every((index) => {
        return origBoard[index] === currentClass;
      });
    });
  }

  function checkForDraw() {
    return origBoard.every((cell) => typeof cell !== 'number');
  }

  function endGame(draw) {
    if (draw) {
      winningTextEl.textContent = `It's a DRAW!`;
    } else {
      winningTextEl.textContent = `${playerTwoTurn ? "O's" : "X's"} Wins!`;
    }
    winningOverlay.classList.add('visible');
  }

  ////////////// UI changes and Event Listeners //////////////

  function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
  }

  function setBoardHoverClass() {
    board.classList.remove(playerOne.mark);
    board.classList.remove(playerTwo.mark);

    if (playerTwoTurn) board.classList.add(playerTwo.mark);
    else board.classList.add(playerOne.mark);
  }

  function checkOptions() {
    if (optionsSelected.players && optionsSelected.difficulty) {
      startBtn.classList.add('visible');
    }
  }

  startBtn.addEventListener('click', function (e) {
    optionsScreen.classList.remove('visible');
    startBtn.classList.remove('visible');
    playerTwo.difficulty = Number(optionsSelected.difficulty);

    playerOne.score = 0;
    playerOne.scoreEl.textContent = playerOne.score;
    playerOne.nameEl.textContent = document.getElementById('player-1').value;
    playerTwo.score = 0;
    playerTwo.scoreEl.textContent = playerTwo.score;
    playerTwo.nameEl.textContent = document.getElementById('player-2').value;

    startGame();
  });

  restartBtn.addEventListener('click', startGame);

  difficultyLevels.addEventListener('click', function (e) {
    if (!e.target.closest('button')) return;
    [...difficultyLevels.children].forEach((btn) =>
      btn.classList.remove('selected')
    );
    e.target.classList.add('selected');
    optionsSelected.difficulty = e.target.dataset.difficulty;
    console.log(optionsSelected.difficulty);
    checkOptions();
  });

  playersBtns.addEventListener('click', function (e) {
    if (!e.target.closest('button')) return;

    if (e.target.classList.contains('ai')) {
      difficultyLevels.classList.add('visible');
      playerTwo.type = 'ai';
    } else {
      difficultyLevels.classList.remove('visible');
      playerTwo.type = 'human';
    }

    [...playersBtns.children].forEach((btn) =>
      btn.classList.remove('selected')
    );
    e.target.classList.add('selected');

    optionsSelected.players = true;
    checkOptions();
  });
})();
