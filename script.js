const pieceCodes = {
    k: "k",
    q: "q",
    r: "r",
    b: "b",
    n: "n",
    p: "p"
};

function pieceImageUrl(color, type) {
    return `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${pieceCodes[type]}.png`;
}

const board = document.getElementById('board');

console.log(piece);

for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        const files = "abcdefgh";
        const file = files[j];
        const rank = 8 - i;
        const squareName = file + rank;

        const square = document.createElement('div');
        square.dataset.square = squareName;

        square.classList.add('square');
        if ((i + j) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }
        board.appendChild(square);
    }
}