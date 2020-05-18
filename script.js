const figures = {
  rook: { empty: "♖", filled: "♜" },
  knight: { empty: "♘", filled: "♞" },
  bishop: { empty: "♗", filled: "♝" },
  king: { empty: "♔", filled: "♚" },
  queen: { empty: "♕", filled: "♛" },
  pawn: { empty: "♙", filled: "♟" },
};
let state = [];
const startPos = "RNBKQBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbkqbnr";

function formState(posStr) {}

function build(str) {
  state = [];
  let row = [];
  for (const char of str) {
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
    var cell = "black";
  } else cell = "white";
  if (cell != figure.color) {
    var char = figures[figure.name].empty;
  } else char = figures[figure.name].filled;
  board.rows[row].cells[col + 1].innerText = char;
}
