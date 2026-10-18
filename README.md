# Chess-using-html-css-and-js
This is a basic multiplayer chess game


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Game</title>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            background: #020723;
            color: #f1f5f9;
            font-family: Arial, Helvetica, sans-serif;
        }

        header {
            height: 65px;
            padding: 0 5%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #26304d;
            background: #070d2b;
        }

        .logo {
            color: #fff;
            font-size: 23px;
            font-weight: bold;
            letter-spacing: 2px;
        }

        header a {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 14px;
        }

        header a:hover {
            color: #fff;
        }

        .page {
            width: min(1500px, 96%);
            margin: 25px auto;
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(310px, 0.75fr);
            gap: 25px;
            align-items: start;
        }

        .board-area {
            min-width: 0;
        }

        .player {
            min-height: 64px;
            padding: 10px 14px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: #101936;
            border: 1px solid #263452;
            border-radius: 10px;
        }

        .player.bottom-player {
            margin-top: 12px;
            margin-bottom: 0;
        }

        .avatar {
            width: 43px;
            height: 43px;
            background: #e7e5dc;
            border-radius: 7px;
            object-fit: contain;
        }

        .player-name {
            font-size: 15px;
            font-weight: bold;
        }

        .player-label {
            margin-top: 4px;
            color: #94a3b8;
            font-size: 12px;
        }

        .board {
            width: 100%;
            aspect-ratio: 1;
            display: grid;
            grid-template-columns: repeat(8, minmax(0, 1fr));
            grid-template-rows: repeat(8, minmax(0, 1fr));
            overflow: hidden;
            border: 5px solid #182341;
            border-radius: 5px;
            box-shadow: 0 15px 35px #0005;
        }

        .square {
            position: relative;
            min-width: 0;
            min-height: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            user-select: none;
        }

        .light {
            background: #e7e5dc;
        }

        .dark {
            background: #789477;
        }

        .piece {
            width: 94%;
            height: 94%;
            object-fit: contain;
            pointer-events: none;
            user-select: none;
            -webkit-user-drag: none;
            z-index: 2;
        }

        .square.selected {
            background: #baca44;
        }

        .square.last-move.light {
            background: #cdd77a;
        }

        .square.last-move.dark {
            background: #a5b64e;
        }

        .square.legal::after {
            content: "";
            position: absolute;
            width: 27%;
            height: 27%;
            border-radius: 50%;
            background: #172b2670;
            z-index: 1;
        }

        .square.legal.has-piece::after {
            width: 82%;
            height: 82%;
            background: transparent;
            border: 5px solid #172b2670;
        }

        .coordinate {
            position: absolute;
            left: 3px;
            top: 2px;
            font-size: clamp(8px, 1.1vw, 13px);
            font-weight: bold;
            pointer-events: none;
            z-index: 3;
        }

        .light .coordinate {
            color: #789477;
        }

        .dark .coordinate {
            color: #e7e5dc;
        }

        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 16px;
            min-width: 0;
        }

        .panel {
            padding: 19px;
            background: #101936;
            border: 1px solid #263452;
            border-radius: 12px;
        }

        .panel h2 {
            margin-bottom: 15px;
            font-size: 17px;
            font-weight: 600;
        }

        .status {
            padding: 13px;
            background: #192546;
            border-radius: 8px;
            color: #dbeafe;
            font-size: 14px;
            line-height: 1.6;
        }

        .status strong {
            color: #fff;
        }

        .captured-group {
            margin-bottom: 14px;
        }

        .captured-group:last-child {
            margin-bottom: 0;
        }

        .captured-label {
            margin-bottom: 7px;
            color: #94a3b8;
            font-size: 12px;
        }

        .captured-pieces {
            min-height: 37px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 1px;
        }

        .captured-piece {
            width: 30px;
            height: 30px;
            object-fit: contain;
        }

        .empty {
            color: #64748b;
            font-size: 13px;
        }

        .history {
            max-height: 310px;
            overflow-y: auto;
            border-radius: 7px;
        }

        .history-row {
            min-height: 37px;
            padding: 7px 10px;
            display: grid;
            grid-template-columns: 35px 1fr 1fr;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            border-radius: 5px;
        }

        .history-row:nth-child(odd) {
            background: #182341;
        }

        .move-number {
            color: #94a3b8;
        }

        .move {
            color: #e2e8f0;
            font-weight: 500;
        }

        .controls {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 9px;
        }

        button {
            min-height: 43px;
            padding: 9px 8px;
            color: #f8fafc;
            background: #253457;
            border: 1px solid #3a4b70;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        button:hover {
            background: #34476e;
        }

        button:active {
            transform: scale(0.98);
        }

        .new-game {
            background: #557c50;
            border-color: #668c60;
        }

        .new-game:hover {
            background: #648e5d;
        }

        .panel-note {
            margin-top: 11px;
            color: #94a3b8;
            font-size: 12px;
            line-height: 1.5;
        }

        .promotion-overlay {
            position: fixed;
            inset: 0;
            z-index: 10;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: #000a;
        }

        .promotion-overlay.show {
            display: flex;
        }

        .promotion-box {
            width: min(360px, 100%);
            padding: 23px;
            background: #101936;
            border: 1px solid #34476e;
            border-radius: 12px;
            text-align: center;
        }

        .promotion-box h2 {
            margin-bottom: 17px;
            font-size: 18px;
        }

        .promotion-options {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }

        .promotion-choice {
            padding: 7px;
            background: #e7e5dc;
            border-radius: 8px;
        }

        .promotion-choice img {
            width: 100%;
            display: block;
        }

        @media (min-width: 1500px) {
            .page {
                grid-template-columns: 750px 380px;
                justify-content: center;
            }
        }

        @media (max-width: 800px) {
            .page {
                width: min(600px, 95%);
                grid-template-columns: 1fr;
                gap: 18px;
                margin-top: 17px;
            }

            .sidebar {
                gap: 13px;
            }

            .panel {
                padding: 16px;
            }

            .coordinate {
                font-size: 10px;
            }
        }

        @media (max-width: 380px) {
            .controls {
                grid-template-columns: 1fr;
            }

            .coordinate {
                font-size: 8px;
            }
        }
    </style>
</head>

<body>
    <header>
        <div class="logo">CHESS.</div>
        <a href="https://github.com/Yugin-Shrestha"
           target="_blank"
           rel="noopener noreferrer">GitHub ↗</a>
    </header>

    <main class="page">
        <section class="board-area">
            <div class="player">
                <img class="avatar"
                     src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png"
                     alt="Black king">
                <div>
                    <div class="player-name">Black</div>
                    <div class="player-label">Player 2</div>
                </div>
            </div>

            <div id="board" class="board" aria-label="Chess board"></div>

            <div class="player bottom-player">
                <img class="avatar"
                     src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png"
                     alt="White king">
                <div>
                    <div class="player-name">White</div>
                    <div class="player-label">Player 1</div>
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <section class="panel">
                <h2>Game Status</h2>
                <div id="status" class="status">
                    <strong>White to move</strong><br>
                    Select a piece to begin.
                </div>
            </section>

            <section class="panel">
                <h2>Captured Pieces</h2>

                <div class="captured-group">
                    <div class="captured-label">Captured by White</div>
                    <div id="capturedByWhite" class="captured-pieces">
                        <span class="empty">No pieces captured</span>
                    </div>
                </div>

                <div class="captured-group">
                    <div class="captured-label">Captured by Black</div>
                    <div id="capturedByBlack" class="captured-pieces">
                        <span class="empty">No pieces captured</span>
                    </div>
                </div>
            </section>

            <section class="panel">
                <h2>Move History</h2>
                <div id="history" class="history">
                    <div class="empty">No moves yet</div>
                </div>
            </section>

            <section class="panel">
                <div class="controls">
                    <button class="new-game" id="newGame">New Game</button>
                    <button id="undo">Undo</button>
                    <button id="flipBoard">Flip Board</button>
                </div>
                <p class="panel-note">
                    Select a piece, then select its destination.
                    Use Undo to take back the last move.
                </p>
            </section>
        </aside>
    </main>

    <div id="promotionOverlay" class="promotion-overlay">
        <div class="promotion-box">
            <h2>Choose a promotion piece</h2>
            <div id="promotionOptions" class="promotion-options"></div>
        </div>
    </div>

    <script>
        const board = document.getElementById("board");
        const status = document.getElementById("status");
        const history = document.getElementById("history");

        const capturedByWhite = document.getElementById("capturedByWhite");
        const capturedByBlack = document.getElementById("capturedByBlack");

        const promotionOverlay = document.getElementById("promotionOverlay");
        const promotionOptions = document.getElementById("promotionOptions");

        const game = new Chess();

        const pieceNames = {
            k: "King",
            q: "Queen",
            r: "Rook",
            b: "Bishop",
            n: "Knight",
            p: "Pawn"
        };

        const pieceCodes = {
            k: "k",
            q: "q",
            r: "r",
            b: "b",
            n: "n",
            p: "p"
        };

        let selectedSquare = null;
        let legalMoves = [];
        let flipped = false;
        let pendingPromotion = null;

        function pieceImageUrl(color, type) {
            return `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${pieceCodes[type]}.png`;
        }

        function squareName(row, col) {
            const files = "abcdefgh";
            const file = files[col];
            const rank = 8 - row;
            return file + rank;
        }

        function renderBoard() {
            board.innerHTML = "";

            const files = "abcdefgh";

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const actualRow = flipped ? 7 - row : row;
                    const actualCol = flipped ? 7 - col : col;

                    const squareId = squareName(actualRow, actualCol);
                    const square = document.createElement("div");

                    square.className = "square";
                    square.classList.add(
                        (actualRow + actualCol) % 2 === 0 ? "light" : "dark"
                    );

                    square.dataset.square = squareId;

                    if (selectedSquare === squareId) {
                        square.classList.add("selected");
                    }

                    if (legalMoves.some(move => move.to === squareId)) {
                        square.classList.add("legal");

                        if (game.get(squareId)) {
                            square.classList.add("has-piece");
                        }
                    }

                    const lastMove = game.history({ verbose: true }).slice(-1)[0];

                    if (
                        lastMove &&
                        (lastMove.from === squareId || lastMove.to === squareId)
                    ) {
                        square.classList.add("last-move");
                    }

                    const piece = game.get(squareId);

                    if (piece) {
                        const pieceImage = document.createElement("img");

                        pieceImage.className = "piece";
                        pieceImage.src = pieceImageUrl(piece.color, piece.type);
                        pieceImage.alt = `${piece.color === "w" ? "White" : "Black"} ${pieceNames[piece.type]}`;
                        pieceImage.draggable = false;

                        square.appendChild(pieceImage);
                    }

                    // Show rank numbers on the left edge.
                    if (col === 0) {
                        const rankLabel = document.createElement("span");
                        rankLabel.className = "coordinate";
                        rankLabel.textContent = 8 - actualRow;
                        square.appendChild(rankLabel);
                    }

                    // Show file letters on the bottom edge.
                    if (row === 7) {
                        const fileLabel = document.createElement("span");
                        fileLabel.className = "coordinate";
                        fileLabel.style.left = "auto";
                        fileLabel.style.right = "4px";
                        fileLabel.style.top = "auto";
                        fileLabel.style.bottom = "2px";
                        fileLabel.textContent = files[actualCol];
                        square.appendChild(fileLabel);
                    }

                    square.addEventListener("click", () => {
                        handleSquareClick(squareId);
                    });

                    board.appendChild(square);
                }
            }

            updateStatus();
        }

        function handleSquareClick(squareId) {
            if (game.game_over() || pendingPromotion) {
                return;
            }

            const clickedPiece = game.get(squareId);

            if (selectedSquare) {
                // Try to move the selected piece to this square.
                const possibleMove = legalMoves.find(move => move.to === squareId);

                if (possibleMove) {
                    if (possibleMove.flags.includes("p")) {
                        showPromotion(selectedSquare, squareId);
                    } else {
                        makeMove(selectedSquare, squareId);
                    }

                    return;
                }

                // Clicking another piece of the current player's color selects it.
                if (clickedPiece && clickedPiece.color === game.turn()) {
                    selectSquare(squareId);
                    return;
                }

                // Clicking elsewhere clears the selection.
                selectedSquare = null;
                legalMoves = [];
                renderBoard();
                return;
            }

            if (clickedPiece && clickedPiece.color === game.turn()) {
                selectSquare(squareId);
            }
        }

        function selectSquare(squareId) {
            selectedSquare = squareId;
            legalMoves = game.moves({
                square: squareId,
                verbose: true
            });

            renderBoard();
        }

        function makeMove(from, to, promotion = "q") {
            const result = game.move({
                from: from,
                to: to,
                promotion: promotion
            });

            selectedSquare = null;
            legalMoves = [];

            if (result) {
                renderBoard();
                updateHistory();
                updateCapturedPieces();
            }
        }

        function showPromotion(from, to) {
            pendingPromotion = { from, to };

            promotionOptions.innerHTML = "";

            const color = game.turn();
            const options = ["q", "r", "b", "n"];

            options.forEach(type => {
                const button = document.createElement("button");
                button.className = "promotion-choice";
                button.type = "button";
                button.setAttribute("aria-label", pieceNames[type]);

                const image = document.createElement("img");
                image.src = pieceImageUrl(color, type);
                image.alt = pieceNames[type];

                button.appendChild(image);

                button.addEventListener("click", () => {
                    const move = pendingPromotion;

                    pendingPromotion = null;
                    promotionOverlay.classList.remove("show");

                    if (move) {
                        makeMove(move.from, move.to, type);
                    }
                });

                promotionOptions.appendChild(button);
            });

            promotionOverlay.classList.add("show");
        }

        function updateStatus() {
            if (game.in_checkmate()) {
                const winner = game.turn() === "w" ? "Black" : "White";

                status.innerHTML =
                    `<strong>Checkmate!</strong><br>${winner} wins the game.`;
                return;
            }

            if (game.in_draw()) {
                status.innerHTML =
                    "<strong>Draw!</strong><br>The game has ended in a draw.";
                return;
            }

            if (game.in_stalemate()) {
                status.innerHTML =
                    "<strong>Stalemate!</strong><br>The game is a draw.";
                return;
            }

            const currentPlayer = game.turn() === "w" ? "White" : "Black";

            if (game.in_check()) {
                status.innerHTML =
                    `<strong>${currentPlayer} is in check!</strong><br>${currentPlayer} must respond to the check.`;
            } else {
                status.innerHTML =
                    `<strong>${currentPlayer} to move</strong><br>Select a piece to make your move.`;
            }
        }

        function updateHistory() {
            const moves = game.history();

            history.innerHTML = "";

            if (moves.length === 0) {
                history.innerHTML = '<div class="empty">No moves yet</div>';
                return;
            }

            for (let i = 0; i < moves.length; i += 2) {
                const row = document.createElement("div");
                row.className = "history-row";

                const number = document.createElement("span");
                number.className = "move-number";
                number.textContent = `${Math.floor(i / 2) + 1}.`;

                const whiteMove = document.createElement("span");
                whiteMove.className = "move";
                whiteMove.textContent = moves[i];

                const blackMove = document.createElement("span");
                blackMove.className = "move";
                blackMove.textContent = moves[i + 1] || "—";

                row.append(number, whiteMove, blackMove);
                history.appendChild(row);
            }

            history.scrollTop = history.scrollHeight;
        }

        function updateCapturedPieces() {
            const moves = game.history({ verbose: true });

            const whiteCaptured = [];
            const blackCaptured = [];

            moves.forEach(move => {
                if (move.captured) {
                    const capturedPiece = {
                        type: move.captured,
                        color: move.color === "w" ? "b" : "w"
                    };

                    if (move.color === "w") {
                        whiteCaptured.push(capturedPiece);
                    } else {
                        blackCaptured.push(capturedPiece);
                    }
                }
            });

            renderCapturedGroup(capturedByWhite, whiteCaptured);
            renderCapturedGroup(capturedByBlack, blackCaptured);
        }

        function renderCapturedGroup(container, pieces) {
            container.innerHTML = "";

            if (pieces.length === 0) {
                container.innerHTML =
                    '<span class="empty">No pieces captured</span>';
                return;
            }

            pieces.forEach(piece => {
                const image = document.createElement("img");

                image.className = "captured-piece";
                image.src = pieceImageUrl(piece.color, piece.type);
                image.alt = `${piece.color === "w" ? "White" : "Black"} ${pieceNames[piece.type]}`;

                container.appendChild(image);
            });
        }

        document.getElementById("newGame").addEventListener("click", () => {
            game.reset();

            selectedSquare = null;
            legalMoves = [];
            pendingPromotion = null;

            promotionOverlay.classList.remove("show");

            renderBoard();
            updateHistory();
            updateCapturedPieces();
        });

        document.getElementById("undo").addEventListener("click", () => {
            if (pendingPromotion) {
                pendingPromotion = null;
                promotionOverlay.classList.remove("show");
            }

            const undoneMove = game.undo();

            selectedSquare = null;
            legalMoves = [];

            if (undoneMove) {
                renderBoard();
                updateHistory();
                updateCapturedPieces();
            }
        });

        document.getElementById("flipBoard").addEventListener("click", () => {
            flipped = !flipped;

            selectedSquare = null;
            legalMoves = [];

            renderBoard();
        });

        // Draw the starting position.
        renderBoard();
        updateHistory();
        updateCapturedPieces();
    </script>
</body>
</html>

