const gameBoard = (function () {
  const playerOne = 'x'; // human
  const playerTwo = 'o'; // AI

  let origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const board = document.querySelector('.board');
  const cells = document.querySelectorAll('.cell');
  const winningOverlay = document.querySelector('.winning-message');
  const winningTextEl = document.querySelector('.winning-text');

  ///////////////
  /////////////
  ///////////////

  // the main minimax function
  function minimax(newBoard, player) {
    //available spots
    const availSpots = emptyIndexies(newBoard);

    // checks for the terminal states such as win, lose, and tie and returning a value accordingly
    if (checkForWin(playerOne)) {
      return { score: -10 };
    } else if (checkForWin(playerTwo)) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    // an array to collect all the objects
    const moves = [];

    // loop through available spots
    for (let i = 0; i < availSpots.length; i++) {
      //create an object for each and store the index of that spot that was stored as a number in the object's index key
      const move = {};
      move.index = newBoard[availSpots[i]];

      // set the empty spot to the current player
      newBoard[availSpots[i]] = player;

      //if collect the score resulted from calling minimax on the opponent of the current player
      if (player == playerTwo) {
        const result = minimax(newBoard, playerOne);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, playerTwo);
        move.score = result.score;
      }

      //reset the spot to empty
      newBoard[availSpots[i]] = move.index;

      // push the object to the array
      moves.push(move);
    }

    // if it is the computer's turn loop over the moves and choose the move with the highest score
    let bestMove;
    if (player === playerTwo) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      // else loop over the moves and choose the move with the lowest score
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    // return the chosen move (object) from the array to the higher depth
    return moves[bestMove];
  }

  // returns the available spots on the board
  function emptyIndexies(board) {
    return board.filter((space) => space !== 'o' && space !== 'x');
  }

  ////////////
  /////////////
  ///////////

  const restartBtn = document.querySelector('.restartBtn');
  restartBtn.addEventListener('click', startGame);

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
    origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    cells.forEach((cell) => {
      cell.classList.remove(playerTwo);
      cell.classList.remove(playerOne);
      winningOverlay.classList.remove('visible');
      cell.removeEventListener('click', handleClick);
      cell.addEventListener('click', handleClick, { once: true });
    });

    setBoardHoverClass();
  }

  startGame();

  function handleClick(e) {
    const cell = e.target;
    let currentClass = oTurn ? playerTwo : playerOne;
    // console.log(cell.dataset.position);

    // Player Move
    putMarkOnBoardArray(cell.dataset.position, currentClass);
    if (checkOutcome(cell, currentClass)) return;

    // CPU Move
    currentClass = oTurn ? playerTwo : playerOne;

    var bestSpot = minimax(origBoard, playerTwo);
    const computerMove = bestSpot.index;

    cells[computerMove].removeEventListener('click', handleClick);
    putMarkOnBoardArray(computerMove, currentClass);
    checkOutcome(cells[computerMove], currentClass);
  }

  function putMarkOnBoardArray(cell, currentClass) {
    origBoard[cell] = currentClass;
    console.log(origBoard);
  }

  function checkOutcome(cell, currentClass) {
    // place mark
    placeMark(cell, currentClass);

    if (checkForWin(currentClass)) {
      // console.log('corecctorr');
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

  function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
  }

  function swapTurn() {
    oTurn = !oTurn;
  }

  function setBoardHoverClass() {
    board.classList.remove(playerOne);
    board.classList.remove(playerTwo);

    if (oTurn) board.classList.add(playerTwo);
    else board.classList.add(playerOne);
  }

  function checkForWin(currentClass) {
    return winConditions.some((condition) => {
      return condition.every((index) => {
        // return cells[index].classList.contains(currentClass);
        return origBoard[index] === currentClass;
        // return (origBoard[index] = 'x');
      });
    });
  }

  function checkForDraw() {
    // console.log('ja');
    // cells is a Nodelist, and Nodelist doesn't contain the every method, so we use destructuring to transform the Nodelist into an array
    return [...cells].every((cell) => {
      return (
        cell.classList.contains(playerTwo) || cell.classList.contains(playerOne)
      );
    });
  }

  function endGame(draw) {
    if (draw) {
      console.log('empate');
      winningTextEl.textContent = `It's a DRAW!`;
      // return;
    } else {
      winningTextEl.textContent = `${oTurn ? "O's" : "X's"} Wins!`;
    }
    winningOverlay.classList.add('visible');
  }
})();
