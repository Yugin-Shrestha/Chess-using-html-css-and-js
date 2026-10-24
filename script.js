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

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const historyElement = document.getElementById("history");

const capturedByWhiteElement = document.getElementById("capturedByWhite");
const capturedByBlackElement = document.getElementById("capturedByBlack");

const newGameButton = document.getElementById("newGame");
const undoButton = document.getElementById("undo");
const flipBoardButton = document.getElementById("flipBoard");

const promotionOverlay = document.getElementById("promotionOverlay");
const promotionOptions = document.getElementById("promotionOptions");
const promotionTitle = document.getElementById("promotionTitle");
const cancelPromotionButton = document.getElementById("cancelPromotion");

const startingBoard = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

let game;
let selectedSquare = null;
let legalMoves = [];
let flipped = false;
let pendingPromotion = null;
let undoStack = [];

function createGameState() {
    return {
        board: startingBoard.map(row => [...row]),
        turn: "w",
        castling: {
            K: true,
            Q: true,
            k: true,
            q: true
        },
        enPassant: null,
        halfmove: 0,
        fullmove: 1,
        capturedByWhite: [],
        capturedByBlack: [],
        moves: []
    };
}

function cloneGameState(state) {
    return JSON.parse(JSON.stringify(state));
}

function colorOf(piece) {
    if (!piece) return null;

    return piece === piece.toUpperCase() ? "w" : "b";
}

function typeOf(piece) {
    return piece ? piece.toLowerCase() : null;
}

function insideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function squareName(row, col) {
    return "abcdefgh"[col] + (8 - row);
}

function sameSquare(a, b) {
    return a.row === b.row && a.col === b.col;
}

function pieceName(piece) {
    const names = {
        k: "King",
        q: "Queen",
        r: "Rook",
        b: "Bishop",
        n: "Knight",
        p: "Pawn"
    };

    const color = colorOf(piece) === "w" ? "White" : "Black";

    return `${color} ${names[typeOf(piece)]}`;
}

function getGameResult(state) {
    const moves = getAllLegalMoves(state, state.turn);
    const checked = isInCheck(state, state.turn);

    if (moves.length === 0) {
        if (checked) {
            return {
                over: true,
                text: `Checkmate! ${state.turn === "w" ? "Black" : "White"} wins.`
            };
        }

        return {
            over: true,
            text: "Stalemate! The game is a draw."
        };
    }

    if (state.halfmove >= 100) {
        return {
            over: true,
            text: "Draw! The 50-move rule applies."
        };
    }

    if (isInsufficientMaterial(state)) {
        return {
            over: true,
            text: "Draw! Insufficient material."
        };
    }

    return {
        over: false,
        checked,
        moves
    };
}

function drawBoard() {
    boardElement.innerHTML = "";

    for (let displayRow = 0; displayRow < 8; displayRow++) {
        for (let displayCol = 0; displayCol < 8; displayCol++) {
            const row = flipped ? 7 - displayRow : displayRow;
            const col = flipped ? 7 - displayCol : displayCol;

            const square = document.createElement("div");

            square.classList.add("square");
            square.classList.add(
                (row + col) % 2 === 0 ? "light" : "dark"
            );

            square.dataset.square = squareName(row, col);

            const piece = game.board[row][col];

            if (piece) {
                const image = document.createElement("img");

                image.src = pieceImageUrl(
                    colorOf(piece) === "w" ? "w" : "b",
                    typeOf(piece)
                );

                image.alt = pieceName(piece);
                image.classList.add("piece");
                image.draggable = false;

                square.appendChild(image);
            }

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

            const legalDestination = legalMoves.some(move =>
                move.to.row === row && move.to.col === col
            );

            if (legalDestination) {
                square.classList.add("legal");

                if (piece) {
                    square.classList.add("capture-possible");
                }
            }

            const lastMove = game.moves[game.moves.length - 1];

            if (
                lastMove &&
                (
                    sameSquare(lastMove.from, { row, col }) ||
                    sameSquare(lastMove.to, { row, col })
                )
            ) {
                square.classList.add("last-move");
            }

            square.addEventListener("click", () => {
                handleSquareClick(row, col);
            });

            boardElement.appendChild(square);
        }
    }

    updateStatus();
    renderCapturedPieces();
    renderMoveHistory();

    undoButton.disabled = undoStack.length === 0;
}

function isSquareAttacked(state, row, col, byColor) {
    const board = state.board;

    const pawnRow = row + (byColor === "w" ? 1 : -1);

    for (const dc of [-1, 1]) {
        const pawnCol = col + dc;

        if (insideBoard(pawnRow, pawnCol)) {
            const piece = board[pawnRow][pawnCol];

            if (
                piece &&
                colorOf(piece) === byColor &&
                typeOf(piece) === "p"
            ) {
                return true;
            }
        }
    }

    const knightOffsets = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2], [1, 2],
        [2, -1], [2, 1]
    ];

    for (const [dr, dc] of knightOffsets) {
        const r = row + dr;
        const c = col + dc;

        if (insideBoard(r, c)) {
            const piece = board[r][c];

            if (
                piece &&
                colorOf(piece) === byColor &&
                typeOf(piece) === "n"
            ) {
                return true;
            }
        }
    }

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;

            const r = row + dr;
            const c = col + dc;

            if (insideBoard(r, c)) {
                const piece = board[r][c];

                if (
                    piece &&
                    colorOf(piece) === byColor &&
                    typeOf(piece) === "k"
                ) {
                    return true;
                }
            }
        }
    }

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        let distance = 1;

        while (insideBoard(r, c)) {
            const piece = board[r][c];

            if (piece) {
                if (colorOf(piece) === byColor) {
                    const type = typeOf(piece);
                    const diagonal = dr !== 0 && dc !== 0;

                    if (
                        type === "q" ||
                        (diagonal && type === "b") ||
                        (!diagonal && type === "r") ||
                        (distance === 1 && type === "k")
                    ) {
                        return true;
                    }
                }

                break;
            }

            r += dr;
            c += dc;
            distance++;
        }
    }

    return false;
}

function findKing(state, color) {
    const king = color === "w" ? "K" : "k";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (state.board[row][col] === king) {
                return { row, col };
            }
        }
    }

    return null;
}

function isInCheck(state, color) {
    const king = findKing(state, color);

    if (!king) return false;

    const opponent = color === "w" ? "b" : "w";

    return isSquareAttacked(
        state,
        king.row,
        king.col,
        opponent
    );
}

function getPseudoLegalMoves(state, row, col) {
    const board = state.board;
    const piece = board[row][col];

    if (!piece) return [];

    const color = colorOf(piece);
    const type = typeOf(piece);
    const moves = [];

    function addMove(toRow, toCol, extra = {}) {
        if (!insideBoard(toRow, toCol)) return;

        const target = board[toRow][toCol];

        if (target && colorOf(target) === color) return;
        if (target && typeOf(target) === "k") return;

        moves.push({
            from: { row, col },
            to: { row: toRow, col: toCol },
            ...extra
        });
    }

    if (type === "p") {
        const direction = color === "w" ? -1 : 1;
        const startingRow = color === "w" ? 6 : 1;
        const promotionRow = color === "w" ? 0 : 7;

        const oneRow = row + direction;

        if (insideBoard(oneRow, col) && !board[oneRow][col]) {
            addMove(oneRow, col, {
                promotion: oneRow === promotionRow
            });

            const twoRow = row + direction * 2;

            if (row === startingRow && !board[twoRow][col]) {
                addMove(twoRow, col, {
                    doublePawn: true
                });
            }
        }

        for (const dc of [-1, 1]) {
            const targetRow = row + direction;
            const targetCol = col + dc;

            if (!insideBoard(targetRow, targetCol)) continue;

            const target = board[targetRow][targetCol];

            if (target && colorOf(target) !== color) {
                addMove(targetRow, targetCol, {
                    promotion: targetRow === promotionRow
                });
            }

            if (
                state.enPassant &&
                state.enPassant.row === targetRow &&
                state.enPassant.col === targetCol
            ) {
                addMove(targetRow, targetCol, {
                    enPassant: true
                });
            }
        }

        return moves;
    }

    if (type === "n") {
        const offsets = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2], [1, 2],
            [2, -1], [2, 1]
        ];

        for (const [dr, dc] of offsets) {
            addMove(row + dr, col + dc);
        }

        return moves;
    }

    if (type === "k") {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                addMove(row + dr, col + dc);
            }
        }

        if (!isInCheck(state, color)) {
            const enemy = color === "w" ? "b" : "w";
            const homeRow = color === "w" ? 7 : 0;
            const kingSide = color === "w" ? "K" : "k";
            const queenSide = color === "w" ? "Q" : "q";
            const rook = color === "w" ? "R" : "r";

            if (
                row === homeRow &&
                col === 4 &&
                state.castling[kingSide] &&
                board[homeRow][5] === null &&
                board[homeRow][6] === null &&
                board[homeRow][7] === rook &&
                !isSquareAttacked(state, homeRow, 5, enemy) &&
                !isSquareAttacked(state, homeRow, 6, enemy)
            ) {
                addMove(homeRow, 6, {
                    castle: "king"
                });
            }

            if (
                row === homeRow &&
                col === 4 &&
                state.castling[queenSide] &&
                board[homeRow][1] === null &&
                board[homeRow][2] === null &&
                board[homeRow][3] === null &&
                board[homeRow][0] === rook &&
                !isSquareAttacked(state, homeRow, 3, enemy) &&
                !isSquareAttacked(state, homeRow, 2, enemy)
            ) {
                addMove(homeRow, 2, {
                    castle: "queen"
                });
            }
        }

        return moves;
    }

    let directions = [];

    if (type === "r" || type === "q") {
        directions.push(
            [-1, 0], [1, 0], [0, -1], [0, 1]
        );
    }

    if (type === "b" || type === "q") {
        directions.push(
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        );
    }

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;

        while (insideBoard(r, c)) {
            const target = board[r][c];

            if (!target) {
                addMove(r, c);
            } else {
                if (colorOf(target) !== color) {
                    addMove(r, c);
                }

                break;
            }

            r += dr;
            c += dc;
        }
    }

    return moves;
}

function applyMove(state, move, promotionPiece = "q") {
    const next = cloneGameState(state);
    const board = next.board;

    const { from, to } = move;

    let piece = board[from.row][from.col];
    let captured = board[to.row][to.col];

    const color = colorOf(piece);
    const originalType = typeOf(piece);

    if (move.enPassant) {
        const capturedRow = color === "w" ? to.row + 1 : to.row - 1;

        captured = board[capturedRow][to.col];
        board[capturedRow][to.col] = null;
    }

    board[from.row][from.col] = null;

    if (move.promotion) {
        piece = color === "w"
            ? promotionPiece.toUpperCase()
            : promotionPiece.toLowerCase();
    }

    board[to.row][to.col] = piece;

    if (move.castle === "king") {
        board[to.row][5] = board[to.row][7];
        board[to.row][7] = null;
    }

    if (move.castle === "queen") {
        board[to.row][3] = board[to.row][0];
        board[to.row][0] = null;
    }

    if (originalType === "k") {
        if (color === "w") {
            next.castling.K = false;
            next.castling.Q = false;
        } else {
            next.castling.k = false;
            next.castling.q = false;
        }
    }

    if (originalType === "r") {
        if (from.row === 7 && from.col === 0) next.castling.Q = false;
        if (from.row === 7 && from.col === 7) next.castling.K = false;
        if (from.row === 0 && from.col === 0) next.castling.q = false;
        if (from.row === 0 && from.col === 7) next.castling.k = false;
    }

    if (captured && typeOf(captured) === "r") {
        if (to.row === 7 && to.col === 0) next.castling.Q = false;
        if (to.row === 7 && to.col === 7) next.castling.K = false;
        if (to.row === 0 && to.col === 0) next.castling.q = false;
        if (to.row === 0 && to.col === 7) next.castling.k = false;
    }

    next.enPassant = null;

    if (move.doublePawn) {
        next.enPassant = {
            row: (from.row + to.row) / 2,
            col: from.col
        };
    }

    if (captured) {
        if (color === "w") {
            next.capturedByWhite.push(captured);
        } else {
            next.capturedByBlack.push(captured);
        }
    }

    if (originalType === "p" || captured) {
        next.halfmove = 0;
    } else {
        next.halfmove++;
    }

    if (color === "b") {
        next.fullmove++;
    }

    next.turn = color === "w" ? "b" : "w";

    return next;
}

function getLegalMoves(state, row, col) {
    const piece = state.board[row][col];

    if (!piece || colorOf(piece) !== state.turn) {
        return [];
    }

    const possibleMoves = getPseudoLegalMoves(state, row, col);

    return possibleMoves.filter(move => {
        const next = applyMove(state, move, "q");

        return !isInCheck(next, state.turn);
    });
}

function getLegalMovesForColor(state, row, col, color) {
    const testState = cloneGameState(state);
    testState.turn = color;

    return getLegalMoves(testState, row, col);
}

function getAllLegalMoves(state, color) {
    const allMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = state.board[row][col];

            if (piece && colorOf(piece) === color) {
                allMoves.push(
                    ...getLegalMovesForColor(state, row, col, color)
                );
            }
        }
    }

    return allMoves;
}

function handleSquareClick(row, col) {
    if (pendingPromotion) return;

    const result = getGameResult(game);

    if (result.over) return;

    const clickedPiece = game.board[row][col];

    if (selectedSquare) {
        const matchingMove = legalMoves.find(move =>
            move.to.row === row && move.to.col === col
        );

        if (matchingMove) {
            if (matchingMove.promotion) {
                openPromotionDialog(matchingMove);
            } else {
                makeMove(matchingMove);
            }

            return;
        }
    }

    if (clickedPiece && colorOf(clickedPiece) === game.turn) {
        selectedSquare = { row, col };
        legalMoves = getLegalMoves(game, row, col);
    } else {
        selectedSquare = null;
        legalMoves = [];
    }

    drawBoard();
}

function makeMove(move, promotionPiece = "q") {
    if (getGameResult(game).over) return;

    undoStack.push(cloneGameState(game));

    const movingPiece = game.board[move.from.row][move.from.col];

    const capturedPiece = move.enPassant
        ? game.board[move.from.row][move.to.col]
        : game.board[move.to.row][move.to.col];

    const next = applyMove(game, move, promotionPiece);

    let moveText =
        `${pieceName(movingPiece)}: ` +
        `${squareName(move.from.row, move.from.col)}–` +
        `${squareName(move.to.row, move.to.col)}`;

    if (capturedPiece) {
        moveText += " (capture)";
    }

    if (move.promotion) {
        moveText += ` = ${promotionPiece.toUpperCase()}`;
    }

    if (move.castle) {
        moveText += " (castling)";
    }

    next.moves.push({
        from: move.from,
        to: move.to,
        text: moveText
    });

    game = next;
    selectedSquare = null;
    legalMoves = [];

    closePromotionDialog();
    drawBoard();
}

function openPromotionDialog(move) {
    pendingPromotion = move;
    promotionOptions.innerHTML = "";

    const color = game.turn === "w" ? "w" : "b";

    promotionTitle.textContent =
        `${game.turn === "w" ? "White" : "Black"}: choose a piece`;

    for (const type of ["q", "r", "b", "n"]) {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("promotion-choice");

        const image = document.createElement("img");

        image.src = pieceImageUrl(color, type);
        image.alt = pieceName(
            color === "w" ? type.toUpperCase() : type
        );

        button.appendChild(image);

        button.addEventListener("click", () => {
            makeMove(move, type);
        });

        promotionOptions.appendChild(button);
    }

    promotionOverlay.classList.add("active");
}

function closePromotionDialog() {
    pendingPromotion = null;
    promotionOverlay.classList.remove("active");
}

function updateStatus() {
    const result = getGameResult(game);

    if (result.over) {
        statusElement.innerHTML =
            `<strong>${result.text}</strong>`;

        return;
    }

    const side = game.turn === "w" ? "White" : "Black";

    if (result.checked) {
        statusElement.innerHTML =
            `<strong>${side} is in check!</strong><br>${side} to move.`;
    } else {
        statusElement.innerHTML =
            `<strong>${side} to move</strong><br>Select a piece to begin.`;
    }
}

function isInsufficientMaterial(state) {
    const pieces = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = state.board[row][col];

            if (piece && typeOf(piece) !== "k") {
                pieces.push({
                    type: typeOf(piece),
                    squareColor: (row + col) % 2
                });
            }
        }
    }

    if (pieces.length === 0) return true;

    if (
        pieces.length === 1 &&
        ["b", "n"].includes(pieces[0].type)
    ) {
        return true;
    }

    if (
        pieces.every(piece => piece.type === "b") &&
        pieces.every(piece => piece.squareColor === pieces[0].squareColor)
    ) {
        return true;
    }

    return false;
}

function renderCapturedPieces() {
    renderCapturedGroup(
        capturedByWhiteElement,
        game.capturedByWhite
    );

    renderCapturedGroup(
        capturedByBlackElement,
        game.capturedByBlack
    );
}

function renderCapturedGroup(container, pieces) {
    container.innerHTML = "";

    if (pieces.length === 0) {
        const empty = document.createElement("span");

        empty.classList.add("empty");
        empty.textContent = "No pieces captured";

        container.appendChild(empty);
        return;
    }

    for (const piece of pieces) {
        const image = document.createElement("img");

        image.src = pieceImageUrl(
            colorOf(piece) === "w" ? "w" : "b",
            typeOf(piece)
        );

        image.alt = pieceName(piece);
        image.title = pieceName(piece);
        image.classList.add("captured-image");

        container.appendChild(image);
    }
}

function renderMoveHistory() {
    historyElement.innerHTML = "";

    if (game.moves.length === 0) {
        const empty = document.createElement("div");

        empty.classList.add("empty");
        empty.textContent = "No moves yet";

        historyElement.appendChild(empty);
        return;
    }

    game.moves.forEach((move, index) => {
        const row = document.createElement("div");
        row.classList.add("history-row");

        const number = document.createElement("span");
        number.classList.add("move-number");
        number.textContent = `${index + 1}.`;

        const text = document.createElement("span");
        text.classList.add("move");
        text.textContent = move.text;

        row.append(number, text);
        historyElement.appendChild(row);
    });

    historyElement.scrollTop = historyElement.scrollHeight;
}

function startNewGame() {
    game = createGameState();

    selectedSquare = null;
    legalMoves = [];
    undoStack = [];

    closePromotionDialog();
    drawBoard();
}

function undoMove() {
    if (undoStack.length === 0) return;

    game = undoStack.pop();

    selectedSquare = null;
    legalMoves = [];

    closePromotionDialog();
    drawBoard();
}

function flipBoard() {
    flipped = !flipped;
    drawBoard();
}

newGameButton.addEventListener("click", startNewGame);
undoButton.addEventListener("click", undoMove);
flipBoardButton.addEventListener("click", flipBoard);

cancelPromotionButton.addEventListener("click", () => {
    closePromotionDialog();
    selectedSquare = null;
    legalMoves = [];
    drawBoard();
});

promotionOverlay.addEventListener("click", event => {
    if (event.target === promotionOverlay) {
        closePromotionDialog();
        selectedSquare = null;
        legalMoves = [];
        drawBoard();
    }
});

startNewGame();