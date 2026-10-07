// ==========================================
// Ultimate XO
// ==========================================


// ==========================================
// إعدادات اللعبة
// ==========================================
//SUPABASE==================================================================
const SUPABASE_URL = "https://bqervgmfchiqmpzqhmqk.supabase.co";
const SUPABASE_KEY = "sb_publishable_OjY4dFFsLCGpTB1M8PtqPg_aP_8i1v6";



const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// GAME VARIABLES
// =====================================================

let gameMode = "two-player";

let currentPlayer = "X";

let activeBoard = null;

let boardStatus = Array(9).fill(null);

let boards = Array.from(
    { length: 9 },
    () => Array(9).fill("")
);


// =====================================================
// ONLINE VARIABLES
// =====================================================

let currentUser = null;

let currentRoom = null;

let roomChannel = null;

let onlineMode = false;

let onlinePlayer = null;


// =====================================================
// WINNING LINES
// =====================================================

const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];


// =====================================================
// HTML ELEMENTS
// =====================================================

const homeScreen =
    document.getElementById("home-screen");

const gameScreen =
    document.getElementById("game-screen");

const roomScreen =
    document.getElementById("room-screen");

const twoPlayerButton =
    document.getElementById("two-player-btn");

const aiButton =
    document.getElementById("ai-btn");

const createRoomButton =
    document.getElementById("create-room-btn");

const enterRoomButton =
    document.getElementById("enter-room-btn");

const gameBoard =
    document.getElementById("game-board");

const turnText =
    document.getElementById("turn");

const messageText =
    document.getElementById("message");

const restartButton =
    document.getElementById("restart");

const homeButton =
    document.getElementById("home-btn");

const roomMessage =
    document.getElementById("room-message");

const roomCodeBox =
    document.getElementById("room-code-box");

const roomCodeText =
    document.getElementById("room-code");

const joinRoomBox =
    document.getElementById("join-room-box");

const roomCodeInput =
    document.getElementById("room-code-input");

const joinRoomButton =
    document.getElementById("join-room-button");

const roomBackButton =
    document.getElementById("room-back-button");

const copyRoomCodeButton =
    document.getElementById("copy-room-code");


// =====================================================
// INITIALIZE ONLINE CONNECTION
// =====================================================

async function initializeOnline() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInAnonymously();

        if (error) {
            console.error(
                "Supabase login error:",
                error
            );

            return;
        }

        currentUser = data.user;

        console.log(
            "Connected to Supabase:",
            currentUser.id
        );

    } catch (error) {

        console.error(
            "Connection error:",
            error
        );
    }
}

initializeOnline();


// =====================================================
// HOME BUTTONS
// =====================================================

twoPlayerButton.addEventListener(
    "click",
    function () {

        gameMode = "two-player";

        onlineMode = false;

        startGame();
    }
);


aiButton.addEventListener(
    "click",
    function () {

        gameMode = "ai";

        onlineMode = false;

        startGame();
    }
);


// =====================================================
// CREATE ROOM BUTTON
// =====================================================

createRoomButton.addEventListener(
    "click",
    createRoom
);


// =====================================================
// ENTER ROOM BUTTON
// =====================================================

enterRoomButton.addEventListener(
    "click",
    function () {

        homeScreen.classList.add("hidden");

        gameScreen.classList.add("hidden");

        roomScreen.classList.remove("hidden");

        roomCodeBox.classList.add("hidden");

        joinRoomBox.classList.remove("hidden");

        roomMessage.textContent =
            "أدخل كود الغرفة:";

        roomCodeInput.value = "";

        roomCodeInput.focus();
    }
);


// =====================================================
// START NORMAL GAME
// =====================================================

function startGame() {

    homeScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    resetGame();
}


// =====================================================
// RESET GAME
// =====================================================

function resetGame() {

    currentPlayer = "X";

    activeBoard = null;

    boardStatus =
        Array(9).fill(null);

    boards = Array.from(
        { length: 9 },
        () => Array(9).fill("")
    );

    createGame();
}


// =====================================================
// CREATE GAME BOARD
// =====================================================

function createGame() {

    gameBoard.innerHTML = "";

    for (
        let boardIndex = 0;
        boardIndex < 9;
        boardIndex++
    ) {

        const smallBoard =
            document.createElement("div");

        smallBoard.classList.add(
            "small-board"
        );

        smallBoard.dataset.board =
            boardIndex;


        for (
            let cellIndex = 0;
            cellIndex < 9;
            cellIndex++
        ) {

            const cell =
                document.createElement("button");

            cell.classList.add("cell");

            cell.dataset.board =
                boardIndex;

            cell.dataset.cell =
                cellIndex;

            cell.addEventListener(
                "click",
                playMove
            );

            smallBoard.appendChild(cell);
        }

        gameBoard.appendChild(
            smallBoard
        );
    }

    updateBoard();
}


// =====================================================
// PLAY MOVE
// =====================================================

function playMove(event) {

    // Online mode:
    // اللاعب يستطيع اللعب فقط في دوره

    if (
        onlineMode &&
        currentPlayer !== onlinePlayer
    ) {
        return;
    }


    // AI mode

    if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {
        return;
    }


    const cell =
        event.currentTarget;

    const boardIndex =
        Number(cell.dataset.board);

    const cellIndex =
        Number(cell.dataset.cell);


    if (
        activeBoard !== null &&
        activeBoard !== boardIndex
    ) {
        return;
    }


    if (
        boardStatus[boardIndex] !== null
    ) {
        return;
    }


    if (
        boards[boardIndex][cellIndex] !== ""
    ) {
        return;
    }


    makeMove(
        boardIndex,
        cellIndex
    );
}


// =====================================================
// MAKE MOVE
// =====================================================

function makeMove(
    boardIndex,
    cellIndex
) {

    boards[boardIndex][cellIndex] =
        currentPlayer;


    // Check small board

    const winner =
        checkSmallBoardWinner(
            boardIndex
        );


    if (winner !== null) {

        boardStatus[boardIndex] =
            winner;

    } else {

        if (
            isBoardFull(boardIndex)
        ) {

            boardStatus[boardIndex] =
                "D";
        }
    }


    // Check big board

    const bigWinner =
        checkBigBoardWinner();


    if (bigWinner !== null) {

        updateBoard();

        messageText.textContent =
            "🎉 اللاعب " +
            bigWinner +
            " فاز باللعبة!";

        disableAllCells();


        if (onlineMode) {

            syncGameToServer();
        }

        return;
    }


    // Check draw

    if (isBigBoardFull()) {

        updateBoard();

        messageText.textContent =
            "🤝 انتهت اللعبة بالتعادل!";

        disableAllCells();


        if (onlineMode) {

            syncGameToServer();
        }

        return;
    }


    // Determine next board

    const nextBoard =
        cellIndex;


    if (
        boardStatus[nextBoard] === null
    ) {

        activeBoard =
            nextBoard;

    } else {

        activeBoard =
            null;
    }


    // Change player

    currentPlayer =
        currentPlayer === "X"
            ? "O"
            : "X";


    updateBoard();


    // ONLINE

    if (onlineMode) {

        syncGameToServer();

        return;
    }


    // AI

    if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {

        setTimeout(
            aiMove,
            500
        );
    }
}


// =====================================================
// AI MOVE
// =====================================================

function aiMove() {

    const possibleMoves = [];


    for (
        let boardIndex = 0;
        boardIndex < 9;
        boardIndex++
    ) {

        if (
            activeBoard !== null &&
            activeBoard !== boardIndex
        ) {
            continue;
        }


        if (
            boardStatus[boardIndex] !== null
        ) {
            continue;
        }


        for (
            let cellIndex = 0;
            cellIndex < 9;
            cellIndex++
        ) {

            if (
                boards[boardIndex][cellIndex] === ""
            ) {

                possibleMoves.push({
                    board: boardIndex,
                    cell: cellIndex
                });
            }
        }
    }


    if (
        possibleMoves.length === 0
    ) {
        return;
    }


    const move =
        possibleMoves[
            Math.floor(
                Math.random() *
                possibleMoves.length
            )
        ];


    makeMove(
        move.board,
        move.cell
    );
}


// =====================================================
// UPDATE BOARD
// =====================================================

function updateBoard() {

    const smallBoards =
        document.querySelectorAll(
            ".small-board"
        );


    smallBoards.forEach(
        function (
            smallBoard,
            boardIndex
        ) {

            smallBoard.classList.remove(
                "active",
                "won-x",
                "won-o",
                "draw"
            );


            if (
                activeBoard === boardIndex &&
                boardStatus[boardIndex] === null
            ) {

                smallBoard.classList.add(
                    "active"
                );
            }


            if (
                boardStatus[boardIndex] === "X"
            ) {

                smallBoard.classList.add(
                    "won-x"
                );
            }


            if (
                boardStatus[boardIndex] === "O"
            ) {

                smallBoard.classList.add(
                    "won-o"
                );
            }


            if (
                boardStatus[boardIndex] === "D"
            ) {

                smallBoard.classList.add(
                    "draw"
                );
            }


            const cells =
                smallBoard.querySelectorAll(
                    ".cell"
                );


            cells.forEach(
                function (
                    cell,
                    cellIndex
                ) {

                    cell.textContent =
                        boards[boardIndex][cellIndex];


                    const used =
                        boards[boardIndex][cellIndex] !== "";


                    const finished =
                        boardStatus[boardIndex] !== null;


                    const wrongBoard =
                        activeBoard !== null &&
                        activeBoard !== boardIndex;


                    const notMyTurn =
                        onlineMode &&
                        currentPlayer !== onlinePlayer;


                    const aiTurn =
                        gameMode === "ai" &&
                        currentPlayer === "O";


                    cell.disabled =
                        used ||
                        finished ||
                        wrongBoard ||
                        notMyTurn ||
                        aiTurn;
                }
            );
        }
    );


    // Turn text

    if (onlineMode) {

        if (
            currentPlayer === onlinePlayer
        ) {

            turnText.textContent =
                "🎮 دورك";

        } else {

            turnText.textContent =
                "⏳ انتظار اللاعب الآخر";
        }

    } else if (
        gameMode === "ai" &&
        currentPlayer === "O"
    ) {

        turnText.textContent =
            "🤖 دور AI";

    } else {

        turnText.textContent =
            "دور اللاعب: " +
            currentPlayer;
    }


    // Message

    if (
        activeBoard === null
    ) {

        messageText.textContent =
            "اختاري أي لوحة للعب";

    } else {

        messageText.textContent =
            "يجب اللعب في اللوحة رقم " +
            (activeBoard + 1);
    }
}


// =====================================================
// CHECK SMALL BOARD WINNER
// =====================================================

function checkSmallBoardWinner(
    boardIndex
) {

    const board =
        boards[boardIndex];


    for (
        const line of winningLines
    ) {

        const a =
            board[line[0]];

        const b =
            board[line[1]];

        const c =
            board[line[2]];


        if (
            a !== "" &&
            a === b &&
            b === c
        ) {

            return a;
        }
    }


    return null;
}


// =====================================================
// CHECK BIG BOARD WINNER
// =====================================================

function checkBigBoardWinner() {

    for (
        const line of winningLines
    ) {

        const a =
            boardStatus[line[0]];

        const b =
            boardStatus[line[1]];

        const c =
            boardStatus[line[2]];


        if (
            a !== null &&
            a !== "D" &&
            a === b &&
            b === c
        ) {

            return a;
        }
    }


    return null;
}


// =====================================================
// CHECK BOARD FULL
// =====================================================

function isBoardFull(
    boardIndex
) {

    return boards[boardIndex]
        .every(
            cell => cell !== ""
        );
}


// =====================================================
// CHECK BIG BOARD FULL
// =====================================================

function isBigBoardFull() {

    return boardStatus
        .every(
            status => status !== null
        );
}


// =====================================================
// DISABLE CELLS
// =====================================================

function disableAllCells() {

    const cells =
        document.querySelectorAll(
            ".cell"
        );


    cells.forEach(
        function (cell) {

            cell.disabled = true;
        }
    );
}


// =====================================================
// GENERATE ROOM CODE
// =====================================================

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        code +=
            characters[
                Math.floor(
                    Math.random() *
                    characters.length
                )
            ];
    }


    return code;
}


// =====================================================
// CREATE ONLINE ROOM
// =====================================================

async function createRoom() {

    if (!currentUser) {

        alert(
            "انتظري قليلًا حتى يتم الاتصال."
        );

        return;
    }


    homeScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.add(
        "hidden"
    );

    roomScreen.classList.remove(
        "hidden"
    );


    roomCodeBox.classList.remove(
        "hidden"
    );

    joinRoomBox.classList.add(
        "hidden"
    );


    roomMessage.textContent =
        "جاري إنشاء الغرفة...";


    const code =
        generateRoomCode();


    const gameState = {

        currentPlayer: "X",

        activeBoard: null,

        boardStatus:
            Array(9).fill(null),

        boards:
            Array.from(
                { length: 9 },
                () => Array(9).fill("")
            ),

        winner: null,

        draw: false
    };


    const {
        data,
        error
    } =
        await supabaseClient
            .from("rooms")
            .insert({

                code: code,

                host_id:
                    currentUser.id,

                game_state:
                    gameState
            })
            .select()
            .single();


    if (error) {

        console.error(error);

        roomMessage.textContent =
            "تعذر إنشاء الغرفة.";

        return;
    }


    currentRoom = data;

    onlineMode = true;

    onlinePlayer = "X";


    roomCodeText.textContent =
        data.code;


    roomMessage.textContent =
        "أرسلي الكود للاعب الثاني وانتظري دخوله...";


    subscribeToRoom();
}


// =====================================================
// JOIN ONLINE ROOM
// =====================================================

joinRoomButton.addEventListener(
    "click",
    joinRoom
);


async function joinRoom() {

    if (!currentUser) {

        alert(
            "انتظري قليلًا حتى يتم الاتصال."
        );

        return;
    }


    const code =
        roomCodeInput.value
            .trim()
            .toUpperCase();


    if (code.length !== 5) {

        alert(
            "الكود يجب أن يكون 5 أحرف."
        );

        return;
    }


    roomMessage.textContent =
        "جاري البحث عن الغرفة...";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("rooms")
            .select("*")
            .eq(
                "code",
                code
            )
            .maybeSingle();


    if (error || !data) {

        roomMessage.textContent =
            "❌ الغرفة غير موجودة.";

        return;
    }


    if (data.guest_id) {

        roomMessage.textContent =
            "❌ هذه الغرفة ممتلئة.";

        return;
    }


    const {
        data: updatedRoom,
        error: updateError
    } =
        await supabaseClient
            .from("rooms")
            .update({

                guest_id:
                    currentUser.id

            })
            .eq(
                "id",
                data.id
            )
            .select()
            .single();


    if (updateError) {

        console.error(
            updateError
        );

        roomMessage.textContent =
            "تعذر دخول الغرفة.";

        return;
    }


    currentRoom =
        updatedRoom;


    onlineMode = true;

    onlinePlayer = "O";


    roomScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );


    resetGame();


    subscribeToRoom();
}


// =====================================================
// SUBSCRIBE TO ROOM
// =====================================================

function subscribeToRoom() {

    if (!currentRoom) {
        return;
    }


    if (roomChannel) {

        supabaseClient.removeChannel(
            roomChannel
        );
    }


    roomChannel =
        supabaseClient
            .channel(
                "room-" +
                currentRoom.id
            )
            .on(

                "postgres_changes",

                {

                    event: "UPDATE",

                    schema: "public",

                    table: "rooms",

                    filter:
                        "id=eq." +
                        currentRoom.id
                },

                function (payload) {

                    const room =
                        payload.new;


                    currentRoom =
                        room;


                    // Player 1 waits for player 2

                    if (
                        room.guest_id &&
                        gameScreen.classList.contains(
                            "hidden"
                        )
                    ) {

                        roomScreen.classList.add(
                            "hidden"
                        );

                        gameScreen.classList.remove(
                            "hidden"
                        );
                    }


                    if (
                        room.game_state
                    ) {

                        loadOnlineGame(
                            room.game_state
                        );
                    }
                }

            )
            .subscribe();
}


// =====================================================
// SEND GAME TO SUPABASE
// =====================================================

async function syncGameToServer() {

    if (
        !onlineMode ||
        !currentRoom
    ) {

        return;
    }


    const gameState = {

        currentPlayer:
            currentPlayer,

        activeBoard:
            activeBoard,

        boardStatus:
            boardStatus,

        boards:
            boards,

        winner:
            checkBigBoardWinner(),

        draw:
            isBigBoardFull()
    };


    const {
        error
    } =
        await supabaseClient
            .from("rooms")
            .update({

                game_state:
                    gameState

            })
            .eq(
                "id",
                currentRoom.id
            );


    if (error) {

        console.error(
            "Sync error:",
            error
        );
    }
}


// =====================================================
// RECEIVE GAME FROM OTHER PLAYER
// =====================================================

function loadOnlineGame(
    gameState
) {

    currentPlayer =
        gameState.currentPlayer;

    activeBoard =
        gameState.activeBoard;

    boardStatus =
        gameState.boardStatus;

    boards =
        gameState.boards;


    updateBoard();


    if (
        gameState.winner
    ) {

        messageText.textContent =
            "🎉 اللاعب " +
            gameState.winner +
            " فاز باللعبة!";

        disableAllCells();

        return;
    }


    if (
        gameState.draw
    ) {

        messageText.textContent =
            "🤝 انتهت اللعبة بالتعادل!";

        disableAllCells();
    }
}


// =====================================================
// COPY ROOM CODE
// =====================================================

copyRoomCodeButton.addEventListener(
    "click",
    async function () {

        const code =
            roomCodeText.textContent;


        try {

            await navigator.clipboard.writeText(
                code
            );


            copyRoomCodeButton.textContent =
                "✅ تم النسخ";


            setTimeout(
                function () {

                    copyRoomCodeButton.textContent =
                        "📋 نسخ الكود";

                },
                1500
            );

        } catch {

            alert(
                "انسخي الكود يدويًا: " +
                code
            );
        }
    }
);


// =====================================================
// BACK FROM ROOM
// =====================================================

roomBackButton.addEventListener(
    "click",
    function () {

        leaveRoom();

        roomScreen.classList.add("hidden");

        homeScreen.classList.remove("hidden");
    }
);


// =====================================================
// HOME BUTTON
// =====================================================

homeButton.addEventListener(
    "click",
    function () {

        leaveRoom();

        gameScreen.classList.add(
            "hidden"
        );

        homeScreen.classList.remove(
            "hidden"
        );
    }
);


// =====================================================
// LEAVE ROOM
// =====================================================

function leaveRoom() {

    if (roomChannel) {

        supabaseClient.removeChannel(
            roomChannel
        );

        roomChannel = null;
    }


    currentRoom = null;

    onlineMode = false;

    onlinePlayer = null;
}


// =====================================================
// RESTART
// =====================================================

restartButton.addEventListener(
    "click",
    function () {

        if (onlineMode) {

            // المضيف فقط يعيد اللعبة حاليًا
            if (onlinePlayer !== "X") {

                alert(
                    "اللاعب X هو الذي يبدأ لعبة جديدة."
                );

                return;
            }
        }

        resetGame();


        if (onlineMode) {

            syncGameToServer();
        }
    }
);