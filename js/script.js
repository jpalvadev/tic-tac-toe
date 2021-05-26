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

  // this is the board flattened and filled with some values to easier asses the Artificial Inteligence.
  // var origBoard = ['O', 1, 'X', 'X', 4, 'X', 6, 'O', 'O'];
  // origBoard = ['O', 1, 'X', 'X', 4, 'X', 6, 'O', 'O'];
  //var origBoard = [0,1 ,2,3,4 ,5, 6 ,7,8];

  //keeps count of function calls
  // var fc = 0;

  // finding the ultimate play on the game that favors the computer
  // var bestSpot = minimax(origBoard, aiPlayer);

  //loging the results
  // console.log('index: ' + bestSpot.index);
  // console.log('function calls: ' + fc);

  // the main minimax function
  function minimax(newBoard, player) {
    //add one to function calls
    // fc++;

    //available spots
    var availSpots = emptyIndexies(newBoard);

    // checks for the terminal states such as win, lose, and tie and returning a value accordingly
    // if (winning(newBoard, huPlayer)) {
    if (checkForWin(playerOne)) {
      return { score: -10 };
      // } else if (winning(newBoard, aiPlayer)) {
    } else if (checkForWin(playerTwo)) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    // an array to collect all the objects
    var moves = [];

    // loop through available spots
    for (var i = 0; i < availSpots.length; i++) {
      //create an object for each and store the index of that spot that was stored as a number in the object's index key
      var move = {};
      move.index = newBoard[availSpots[i]];

      // set the empty spot to the current player
      newBoard[availSpots[i]] = player;

      //if collect the score resulted from calling minimax on the opponent of the current player
      if (player == playerTwo) {
        var result = minimax(newBoard, playerOne);
        move.score = result.score;
      } else {
        var result = minimax(newBoard, playerTwo);
        move.score = result.score;
      }

      //reset the spot to empty
      newBoard[availSpots[i]] = move.index;

      // push the object to the array
      moves.push(move);
    }

    // if it is the computer's turn loop over the moves and choose the move with the highest score
    var bestMove;
    if (player === playerTwo) {
      var bestScore = -10000;
      for (var i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      // else loop over the moves and choose the move with the lowest score
      var bestScore = 10000;
      for (var i = 0; i < moves.length; i++) {
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
    return board.filter((space) => space != 'o' && space != 'x');
  }

  // winning combinations using the board indexies for instace the first win could be 3 xes in a row
  // function winning(board, player) {
  //   if (
  //     (board[0] == player && board[1] == player && board[2] == player) ||
  //     (board[3] == player && board[4] == player && board[5] == player) ||
  //     (board[6] == player && board[7] == player && board[8] == player) ||
  //     (board[0] == player && board[3] == player && board[6] == player) ||
  //     (board[1] == player && board[4] == player && board[7] == player) ||
  //     (board[2] == player && board[5] == player && board[8] == player) ||
  //     (board[0] == player && board[4] == player && board[8] == player) ||
  //     (board[2] == player && board[4] == player && board[6] == player)
  //   ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

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
