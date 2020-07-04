const cells = [...board.querySelectorAll("td")];
const startPos = "RNBKQBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbkqbnr";
let state = [];
let activePlayer, turn, temp, boardHistory;
let blackSeconds, whiteSeconds;

cells.forEach((cell) => (cell.onclick = () => handleClick(cell)));
document.body.onclick = (e) => {
  if (e.target == document.body) setReady();
};
timelessStartBtn.onclick = () => {
  startMenu.hidden = true;
  startGame();
  whiteClock.hidden = true;
  blackClock.hidden = true;
};
timedStartBtn.onclick = () => {
  startMenu.hidden = true;
  startGame();
  whiteClock.hidden = false;
  blackClock.hidden = false;
  blackSeconds = whiteSeconds = minuteInput.value * 60;
};

function showTime(seconds, element) {
  const parts = input.split(":"),
    min = +parts[0],
    sec = +parts[1];
  return Math.floor(min / 60 + sec * 60);
}

function startGame() {
  formState(startPos);
  setFigures();
  activePlayer = 1 ? "white" : "black";
  turn = 0;
  temp = false;
  boardHistory = [JSON.stringify(state)];
  setReady();
}

function formState(posStr) {
  state = [];
  let row = [];
  for (const char of posStr) {
    const figure = {};
    if ("RNBKQP".includes(char)) figure.color = "white";
    else if ("rnbkqp".includes(char)) figure.color = "black";
    if ("12345678".includes(char)) {
      row = row.concat(Array(+char).fill(null));
      continue;
    } else if ("Rr".includes(char)) figure.name = "rook";
    else if ("Nn".includes(char)) figure.name = "knight";
    else if ("Bb".includes(char)) figure.name = "bishop";
    else if ("Kk".includes(char)) figure.name = "king";
    else if ("Qq".includes(char)) figure.name = "queen";
    else if ("Pp".includes(char)) figure.name = "pawn";
    else if (char == "/") {
      state.push(row);
      row = [];
      continue;
    }
    row.push(figure);
  }
  state.push(row);
}

function setFigure(row, col, figure) {
  if (!figure) return (board.rows[row].cells[col + 1].innerText = "");
  if ((row % 2 && col % 2) || (row % 2 == 0 && col % 2 == 0)) {
    var cell = "white";
  } else cell = "black";
  if (cell == figure.color) {
    var char = figures[figure.name].empty;
  } else char = figures[figure.name].filled;
  board.rows[row].cells[col + 1].innerText = char;
}

function setFigure(row, col, figure) {
  board.rows[row].cells[col + 1].style.backgroundImage = !figure
    ? null
    : `url("img/icons/${figure.name}_${figure.color}.png")`;
}

function setFigures() {
  state.forEach((row, i) => {
    row.forEach((figure, j) => setFigure(i, j, figure));
  });
  // for (let i = 0; i < 8; i++) {
  //   for (let j = 0; j < 8; j++) setFigure(i, j, state[i][j])
  // }
}

function setReady() {
  board
    .querySelectorAll(".ready, .active, .move")
    .forEach((cell) => cell.classList.remove("ready", "active", "move"));
  let turnsAvailable;
  state.forEach((row, i) =>
    row.forEach((figure, j) => {
      if (figure?.color == activePlayer) {
        const cell = board.rows[i].cells[j + 1];
        if (getMoves(cell).length) {
          cell.classList.add("ready");
          turnsAvailable = true;
        }
      }
    })
  );
  if (!turnsAvailable)
    setTimeout(
      () =>
        alert(
          `Check, mate! ${
            activePlayer == "white" ? "Black" : "White"
          } player wins!`
        ),
      500
    );
}

function setActive(cell) {
  board
    .querySelectorAll(".move, .active")
    .forEach((cell) => cell.classList.remove("move", "active"));
  cell.classList.add("active");
  const moves = getMoves(cell);
  moves.forEach((cell) => cell.classList.add("move"));
}

async function handleClick(cell) {
  if (cell.classList.contains("ready")) setActive(cell);
  else if (cell.classList.contains("move")) {
    await moveFigure(board.querySelector(".active"), cell);
    boardHistory.length = ++turn;
    boardHistory.push(JSON.stringify(state));
    activePlayer = activePlayer == "white" ? "black" : "white";
    setReady();
  }
}

function getFigure(cell) {
  const col = cell.cellIndex - 1;
  const row = cell.rowIndex - 1;
  return state[row][col];
}

// function putFigure(cell, figure) {
//   const col = cell.cellIndex - 1;
//   const row = cell.rowIndex - 1;
//   if (
//     figure.name == "pawn" &&
//     ((figure.color == "white" && row == 7) ||
//       (figure.color == "black" && row == 0))
//   ) {
//     figurePicker.dataset.color = figure.color;
//     selectPromotion().then((figure) => (state[row][col] = figure));
//   } else state[row][col] = figure;
// }
async function putFigure(cell, figure) {
  const col = cell.cellIndex - 1;
  const row = cell.rowIndex - 1;
  if (
    !temp &&
    figure?.name == "pawn" &&
    ((figure.color == "white" && row == 7) ||
      (figure.color == "black" && row == 0))
  ) {
    figurePicker.dataset.color = figure.color;
    figure = await selectPromotion();
  }
  state[row][col] = figure;
  if (!temp && figure && (figure.name == "king" || figure.name == "rook"))
    figure.moved = true;
}

function selectPromotion() {
  glass.hidden = false;
  return new Promise((resolve, reject) => {
    figurePicker.onclick = (e) => {
      if (e.target != figurePicker) {
        glass.hidden = true;
        resolve({
          color: figurePicker.dataset.color,
          name: e.target.dataset.figure,
        });
      }
    };
  });
}

function getMoves(cell) {
  const figure = getFigure(cell);
  return cells.filter(
    (td) => canMoveThere(figure, cell, td) && !cantMoveThere(figure, cell, td)
  );
}

async function moveFigure(from, to) {
  await putFigure(to, getFigure(from));
  if (getFigure(from).name == "king") {
    if (from.cellIndex + 2 == to.cellIndex) {
      putFigure(
        to.previousElementSibling,
        getFigure(to.nextElementSibling.nextElementSibling)
      );
      putFigure(to.nextElementSibling.nextElementSibling, null);
    } else if (from.cellIndex - 2 == to.cellIndex) {
      putFigure(to.nextElementSibling, getFigure(to.previousElementSibling));
      putFigure(to.previousElementSibling, null);
    }
  }
  putFigure(from, null);
  setFigures();
}

function cantMoveThere(figure, from, to) {
  const tempState = JSON.parse(JSON.stringify(state));
  temp = true;
  putFigure(to, getFigure(from));
  putFigure(from, null);
  const kingCell = cells.find((cell) => {
    const cellFigure = getFigure(cell);
    return figure.color == cellFigure?.color && cellFigure?.name == "king";
  });
  const cant = cells.some(
    (cell) => getFigure(cell) && canMoveThere(getFigure(cell), cell, kingCell)
  );
  state.forEach((row, i) => row.splice(0, 8, ...tempState[i]));
  temp = false;
  return cant;
}

function canMoveThere(figure, from, to) {
  if (from == to || getFigure(to)?.color == figure.color) return;
  const rows = Math.abs(to.rowIndex - from.rowIndex);
  const cols = Math.abs(to.cellIndex - from.cellIndex);
  switch (figure.name) {
    case "pawn":
      if (figure.color == "white") {
        if (
          (getFigure(to) && cols == 1 && to.rowIndex - from.rowIndex == 1) ||
          (!getFigure(to) && !cols && to.rowIndex - from.rowIndex == 1) ||
          (!getFigure(to) &&
            !cols &&
            to.rowIndex == 4 &&
            from.rowIndex == 2 &&
            isLineFree(from, to))
        )
          return true;
      }
      if (figure.color == "black") {
        if (
          (getFigure(to) && cols == 1 && from.rowIndex - to.rowIndex == 1) ||
          (!getFigure(to) && !cols && from.rowIndex - to.rowIndex == 1) ||
          (!getFigure(to) &&
            !cols &&
            to.rowIndex == 5 &&
            from.rowIndex == 7 &&
            isLineFree(from, to))
        )
          return true;
      }
      break;
    case "rook":
      if (from.cellIndex == to.cellIndex || from.rowIndex == to.rowIndex)
        return isLineFree(from, to);
      break;
    case "knight":
      if ((rows == 2 && cols == 1) || (cols == 2 && rows == 1)) return true;
      break;
    case "bishop":
      if (
        Math.abs(to.cellIndex - from.cellIndex) ==
        Math.abs(to.rowIndex - from.rowIndex)
      )
        return isLineFree(from, to);
      break;
    case "king":
      if (rows + cols <= 2 && rows != 2 && cols != 2) return true;
      if (
        !temp &&
        !figure.moved &&
        !cells.some((cell) => {
          temp = true;
          const danger =
            getFigure(cell) && canMoveThere(getFigure(cell), cell, from);
          temp = false;
          return danger;
        }) &&
        ((to.cellIndex == from.cellIndex + 2 &&
          getFigure(to.parentElement.cells[8])?.name == "rook" &&
          !getFigure(to.parentElement.cells[8])?.moved &&
          isLineFree(from, to.parentElement.cells[8])) ||
          (to.cellIndex == from.cellIndex - 2 &&
            getFigure(to.parentElement.cells[1])?.name == "rook" &&
            !getFigure(to.parentElement.cells[1])?.moved &&
            isLineFree(from, to.parentElement.cells[1])))
      )
        return true;
      break;
    case "queen":
      return isLineFree(from, to);
  }
}

function isLineFree(from, to) {
  if (
    from.cellIndex == to.cellIndex ||
    from.rowIndex == to.rowIndex ||
    Math.abs(to.cellIndex - from.cellIndex) ==
      Math.abs(to.rowIndex - from.rowIndex)
  ) {
    const colStep =
      to.cellIndex == from.cellIndex
        ? 0
        : to.cellIndex > from.cellIndex
        ? 1
        : -1;
    const rowStep =
      to.rowIndex == from.rowIndex ? 0 : to.rowIndex > from.rowIndex ? 1 : -1;
    for (
      let i = from.cellIndex + colStep, j = from.rowIndex + rowStep;
      i != to.cellIndex || j != to.rowIndex;
      i += colStep, j += rowStep
    ) {
      if (getFigure(board.rows[j - 1].cells[i])) return false;
    }
    return true;
  }
}

function undo() {
  if (turn) {
    turn--;
    state = JSON.parse(boardHistory[turn]);
    setFigures();
    activePlayer = activePlayer == "white" ? "black" : "white";
    setReady();
  }
}

function redo() {
  if (boardHistory[turn + 1]) {
    turn++;
    state = JSON.parse(boardHistory[turn]);
    setFigures();
    activePlayer = activePlayer == "white" ? "black" : "white";
    setReady();
  }
}

document.body.onkeydown = (e) => {
  if (e.key == "Z" && e.ctrlKey && e.shiftKey) redo();
  else if (e.key == "z" && e.ctrlKey) undo();
};

// function fill(i, hue) {
//   i = ((i - 1) % 36) + 1;
//   const color = `hsl(${hue} 85% 90%)`;
//   const table = board.parentElement;
//   if (i <= 10) {
//     table.rows[0].cells[i - 1].style.background = color;
//   } else if (i < 19) {
//     board.rows[i - 11].cells[9].style.background = color;
//   } else if (i <= 28) {
//     table.rows[9].cells[28 - i].style.background = color;
//   } else {
//     board.rows[36 - i].cells[0].style.background = color;
//   }
// }

// for (let i = 1; i <= 1e3; i++) {
//   setTimeout(fill, 20 * i, i, i);
// }

// function write(i, letter) {
//   i = ((i - 1) % 36) + 1;
//   const table = board.parentElement;
//   if (i <= 10) {
//     table.rows[0].cells[i - 1].innerText = letter;
//   } else if (i < 19) {
//     board.rows[i - 11].cells[9].innerText = letter;
//   } else if (i <= 28) {
//     table.rows[9].cells[28 - i].innerText = letter;
//   } else {
//     board.rows[36 - i].cells[0].innerText = letter;
//   }
// }

// for (let i = 1; i < 1e3; i++) {
//   setTimeout(write, 500 * i, i, i);
// }
