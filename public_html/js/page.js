
/**
 * 
 * This is the controller for the Game.  It takes player input, updates the html.
 * and updates the model based on player actions.  
 * 
 * If I had more time I would have made this an Object
 */

var blockClicks = false;

// Set up game UI
$(document).ready(function () {
    window.game = new BattleshipGame(defaultoptions);
    createPlacementSelects();
    switchToScreen("options");
    $("#doneButton").prop('disabled', true);
});


/**
 * 
 * Shows the correct div to the user with either options, gameboard, or winner screen
 * 
 * @param {type} screen  Which screen to show
 * }
 */
function switchToScreen(screen) {

    $(".screen").hide();
    $("#" + screen + "Screen").show();

    if (screen === "winner") {
        $("#switchToOptionsButton").click(function (event) {
            switchToScreen("options");
        });
    }
    else if (screen === "options") {

        //  Add event listeners for the controls on the options page.
        addOptionListeners();

        $("#optionsForm").submit(function (event) {
            // don't propogate event
            event.preventDefault();

            var newPlacementsPlayer1 = [];
            var newPlacementsPlayer2 = [];

            // create the placement arrays
            for (var i = 0; i < game.BOARD_SIZE_X; i++) {
                newPlacementsPlayer1.push(-1);
                newPlacementsPlayer2.push(-1);
            }
            var player = 1;
            
            // fill the placement arrys
            for (var i = 0, max = game.SHIPS_PER_PLAYER; i < max; i++) {

                newPlacementsPlayer1[$("#player1Ship" + i + "PlacementX").val()] = Number($("#player1Ship" + i + "PlacementY").val());
                newPlacementsPlayer2[$("#player2Ship" + i + "PlacementX").val()] = Number($("#player2Ship" + i + "PlacementY").val());
            }
            // get the names
            var namePlayerOne = ($("#playerOneName").val() == null || $("#playerOneName").val() === "") ? "Captain Fussypants" : $("#playerOneName").val()
            var namePlayerTwo = ($("#playerTwoName").val() == null || $("#playerTwoName").val() === "") ? "Le Marquis d'Argh" : $("#playerTwoName").val()

            // create the options object
            var options = {
                PLAYER_ONE_NAME: namePlayerOne,
                PLAYER_TWO_NAME: namePlayerTwo,
                BOARD_SIZE_X: $("#boardSizeX").prop("selectedIndex") + 1,
                BOARD_SIZE_X: $("#boardSizeX").prop("selectedIndex") + 1,
                        BOARD_SIZE_Y: $("#boardSizeY").prop("selectedIndex") + 1,
                SHIP_SIZE: $("#shipSize").prop("selectedIndex") + 1,
                SHIPS_PER_PLAYER: $("#numberOfShips").prop("selectedIndex") + 1,
                placements: [
                    newPlacementsPlayer1,
                    newPlacementsPlayer2
                ]
            };

            window.game = new BattleshipGame(options);

            switchToScreen("play");

            return false;
        });

    }
    else if (screen === "play") {
        showBoardsForPlayer(game.currentPlayerIndex, false);

        $("#doneButton").click(function (event) {
            switchTurn();
            blockClicks = false;
            showBoardsForPlayer(game.currentPlayerIndex, false);
        });

        $("#toggleBoardVis").click(function (event) {
            if ($("#gameBoard").css("display") === "none") {
                $("#gameBoard").show();
                $("#showmetext2").hide();
            }
            else {
                $("#gameBoard").hide();
                $("#showmetext2").show();
            }
        });

        $("#playerNumber").html(game.getCurrentPlayer().name);

    }

}


/**
 * 
 * Sets up the event listeners for the options screen
 * 
 * @returns {undefined}
 */
function addOptionListeners() {
    // When board witdh is changed, change the max 
    // number of ships selector
    $("#boardSizeX").change(function (event) {
        game.BOARD_SIZE_X = Number(event.target.value);
        createPlacementSelects();
    });

    // When board height is changed, change the max ship size
    // selector
    $("#boardSizeY").change(function (event) {
        game.BOARD_SIZE_Y = Number(event.target.value);
        createPlacementSelects();
    });

    $("#shipSize").change(function (event) {
        game.SHIP_SIZE = Number(event.target.value);
        createPlacementSelects();
    });

    $("#numberOfShips").change(function (event) {
        game.SHIPS_PER_PLAYER = Number(event.target.value);
        createPlacementSelects();
    });
}

/**
 * Accepts the click event on the gameboard Tile and tell the game what to do
 * @param {type} event
 * @param {type} x
 * @param {type} y
 * @returns {undefined}
 */
function doClick(event, x, y) {
    
    // you can't move when it isnt your turn
    if (blockClicks) {
        displayMessage("Your turn is over.  Click the <em>Turn Over</em> button to keep playing.", "click");

        return;
    }

    var result = game.fire(x, y);

    // based on the result of the action, show a mesage, redisplay the board and play a sound
    if (result === BattleshipGame.ALREADY_TAKEN) {
        displayMessage("You already shot there.  Nice work, Hawkeye", "idiot");
        showBoardsForPlayer(game.currentPlayerIndex, true);
        document.getElementById("audio-trombone").play();

    }
    else if (result === BattleshipGame.HIT) {
        displayMessage("hit!", "hit");
        showBoardsForPlayer(game.currentPlayerIndex, true);
        document.getElementById("audio-explosion").play();

    }
    else if (result === BattleshipGame.MISS) {
        displayMessage("miss! (Or was it another, 'warning shot across their bow'?)", "miss");
        showBoardsForPlayer(game.currentPlayerIndex, true);
        document.getElementById("audio-swoosh").play();

    }
    else if (result === BattleshipGame.SUNK) {
        displayMessage("You sank my battleship! (or something like that)", "sunk");
        showBoardsForPlayer(game.currentPlayerIndex, true);
        document.getElementById("audio-bjbattleship").play();

    }
    else if (result === BattleshipGame.WON) {
        displayMessage("You are the winner", "won", "Cheer up!", true);

        switchToScreen("winner");
        document.getElementById("audio-you-won").play();

    }

}

/**
 * 
 * @param {type} msg   What to say
 * @param {type} type  Which icon to show
 * @param {type} label what to name the modal box, not working
 * @param {type} showName  unused
 * @returns {undefined}
 */
function displayMessage(msg, type, label, showName) {


    //$("#messageModal .modal-body").empty();
    //$("#messageModal .modal-body").append("<div id='myalert' class='alert alert-"+type+"' role='alert'>"+msg+"</div>");

    $("#myModalLabel").html(label);

    if (type === "alert")
        icon = "<'span class=messageIcon'>!</span>"
    else if (type === "click")
        icon = "<span class='myicon icon-large icon-hand-up' title='Not Your Turn!'></span>"
    else if (type === "miss")
        icon = "<span class='myicon icon-large icon-thumbs-down' title='You Missed'></span>"
    else if (type === "idiot")
        icon = "<span class='myicon icon-large icon-thumbs-down' title='Double Miss!'></span>"
    else if (type === "hit")
        icon = "<span class='myicon icon-large icon-fire' title='You Hit!'></span>"
    else if (type === "won")
        icon = "<span class='myicon icon-large icon-thumbs-up' title='You Won!'></span>"
    else
        icon = "<span class='icon-large icon-thumbs-question' title='huh?'></span>"
    $("#messageModal .modal-body").html(icon + "<div class='messagetext'>" + msg + '</div>')

    $('#messageModal').modal('show')

}

function gameTurnOver() {

    $("#doneButton").prop("disabled", false);
    $("#doneButton").css("cursor", "pointer");

    blockClicks = true

}

/**
 * Changes whose turn it is
 * 
 */
function switchTurn() {
    $("#doneButton").prop("disabled", true);
    $("#doneButton").css("cursor", "not-allowed");

     $("#playerNumber").html(game.getCurrentPlayer().name);

    game.currentPlayerIndex = game.currentPlayerIndex === 0 ? 1 : 0;
}


/**
 * Creations the HTML Option elements for the options page (overloaded term, here) selects
 * @param {type} target  The select element to add them to
 * @param {type} min the lowest number
 * @param {type} max the highest number
 * @param {type} indexSelected  which option shoudl be selected
 * @param {type} arrraySelector should the values be 1 lower than the labels for ease of use in array
 * @returns {undefined}
 */
function createOptions(target, min, max, indexSelected, arrraySelector) {

    var selected = selected === -1 ? Math.round(max / 2) : indexSelected;

    var newOptions = {};
    for (var i = min; i <= max; i++) {
        Object.defineProperty(newOptions, arrraySelector ? i - 1 : i, {value: i, enumerable: true});
    }

    var $el = $("#" + target);

    $el.empty(); // remove old options
    var counter = 0;
    $.each(newOptions, function (value, key) {
        ;

        if (counter === selected) {
            $el.append($("<option selected></option>")
                    .attr("value", value).text(key));
        } else {
            $el.append($("<option></option>")
                    .attr("value", value).text(key));
        }
        counter++
    });

}

/**
 * Creations the HTML Select element
 */
function createSelects(name, parent, target, min, max, selected, arrraySelctor, classes) {
    $("#" + parent).append("<label for='" + parent + "'>" + name + "<select id='" + target + "' class='" + classes + "'></select></label>");
    createOptions(target, min, max, selected, arrraySelctor, false);

}

/**
 * Creates the HTML Select for placing ships on the screen and the game options selects too
 */

function createPlacementSelects() {
    if (game.BOARD_SIZE_Y < game.SHIP_SIZE) {
        displayMessage("Board size cannot be less than ship size. (" + game.BOARD_SIZE_Y + " " + game.SHIP_SIZE + " " + typeof game.BOARD_SIZE_Y + " " + typeof game.SHIP_SIZE + ")", "danger", "Board too large", showName)
        $("#btnSaveOptions").prop('disabled', true);
        $("#boardSizeY").css("color", "red")

    } else {
        $("#boardSizeY").css("color", "rgb(153, 153, 153)")
        $("#btnSaveOptions").prop('disabled', false);
       $("#gameOptions").empty();
        $("#player1Placements").empty();
        $("#player2Placements").empty();

        createSelects("Board Width", "gameOptions", "boardSizeX", 1, 10, game.BOARD_SIZE_X - 1, false, "");
        createSelects("Board Height", "gameOptions", "boardSizeY", 1, 10, game.BOARD_SIZE_Y - 1, false, "");
        createSelects("Number of Ships", "gameOptions", "numberOfShips", 1, game.BOARD_SIZE_X, game.SHIPS_PER_PLAYER - 1, false, "");
        createSelects("Ship Size", "gameOptions", "shipSize", 1, game.BOARD_SIZE_Y, game.SHIP_SIZE - 1, false, "");

        // creat the selects
        for (var i = 0, max = game.SHIPS_PER_PLAYER; i < max; i++) {
            $("#player1Placements").append("<div id='p1s" + i + "Placement'></div>")
            createSelects("Ship " + (i + 1) + " X", "p1s" + i + "Placement", "player1Ship" + i + "PlacementX", 1, game.BOARD_SIZE_X, i, true, "placement placementx player" + i);
            createSelects("Ship " + (i + 1) + " Y", "p1s" + i + "Placement", "player1Ship" + i + "PlacementY", 1, game.BOARD_SIZE_Y - game.SHIP_SIZE + 1, 1, true, "placement placementy player" + i);

            $("#player2Placements").append("<div id='p2s" + i + "Placement'></div>")
            createSelects("Ship " + (i + 1) + " X", "p2s" + i + "Placement", "player2Ship" + i + "PlacementX", 1, game.BOARD_SIZE_X, i, true, "placement placementx player" + i);
            createSelects("Ship " + (i + 1) + " Y", "p2s" + i + "Placement", "player2Ship" + i + "PlacementY", 1, game.BOARD_SIZE_Y - game.SHIP_SIZE + 1, 1, true, "placement placementy player" + i);
        }

        addOptionListeners()
    }
}

/**
 * "Draws" the game board by creating the tables
 * @param {type} playerIndex which player we're working on
 * @param {type} refresh should we clear the board first
 * @returns {undefined}
 */
function showBoardsForPlayer(playerIndex, refresh) {
    $("#gameBoard").hide();
    $("#showmetext2").show();
    if (refresh) {
        $("#gameBoard").html("");
        $("#opponentboard").html("");
    }
    playerBoard = game.boards[playerIndex];
    opponentBoard = game.boards[playerIndex === 1 ? 0 : 1];
    var playerTable = "<table id='playerBoard' class='board' border='1'>\n";
    var opponentTable = "<table id='opponentBoard' class='board' border='1'>\n";

    playerTable += "<tr>";
    opponentTable += "<tr>";

    for (var y = 0, ymax = game.BOARD_SIZE_Y; y < ymax; y++) {
        for (var x = 0, xmax = game.BOARD_SIZE_X; x < xmax; x++) {


            //  Draw te player game board first
            playerTile = playerBoard.tiles[x][y];

            var classes = " ";


            if (playerTile.constructor.name === "Piece") {
                classes = " ship";
                if (playerTile.index === 0)
                    classes += " frontOfShip"

                if (playerTile.index === game.SHIP_SIZE - 1)
                    classes += " backOfShip"

                if (playerTile.hasBeenShot()) {
                    playerTable += "<td class='skull " + classes + "'><span class='icon-large icon-skull' title='You were hit' ><span></td>";
                }
                else
                    playerTable += "<td class='boat " + classes + "'><span class='icon-large icon-boat' title='Your boat' ><span></td>";
            }
            else if (playerTile.constructor.name === "Tile") {
                if (playerTile.hasBeenShot())
                    playerTable += "<td class='miss " + classes + "'><span class='icon-large icon-thumbs-up' title='Opponent missed'></span></td>";
                else
                    playerTable += "<td class='nothing " + classes + "'><!--span class='icon-large icon-circle-question-mark' title='Unclicked Tile'></span--></td>";
            }


            // draw the other board next
            opponentTile = opponentBoard.tiles[x][y];

            if (opponentTile.constructor.name === "Piece") {
                if (opponentTile.hasBeenShot())
                    opponentTable += "<td class='fire2' onclick='javascript:doClick(event," + x + "," + y + ")' ><span class='icon-large icon-fire' title='You hit 'em!'></span></td>";
                else
                    opponentTable += "<td class='notyet' onclick='javascript:doClick(event," + x + "," + y + ")'><span class='icon-large icon-circle-question-mark'  title='Unclicked Tile'></td>";

            }
            else if (opponentTile.constructor.name === "Tile") {
                if (opponentTile.hasBeenShot())
                    opponentTable += "<td class='miss' onclick='javascript:doClick(event," + x + "," + y + ")'><span class='icon-large icon-thumbs-down' title='You Missed'></span></td>";
                else
                    opponentTable += "<td class='notyet' onclick='javascript:doClick(event," + x + "," + y + ")'><span class='icon-large icon-circle-question-mark' title='Unc1icked Tile'></td>";



            }
            else {
                opponentTable += "<td>" + (opponentTile.constructor.name) + "</td>";
            }
        }
        playerTable += "</tr>\n";
        opponentTable += "</tr>\n";

    }
    playerTable += "</table>";
    opponentTable += "</table>";

    $("#gameBoard").hide();
    $("#gameBoard").html(playerTable);
    $("#opponentboard").html(opponentTable);

}

var defaultoptions = {
    PLAYER_ONE_NAME: "Glovetopus",
    PLAYER_TWO_NAME: "Flargarah",
    BOARD_SIZE_X: 5,
    BOARD_SIZE_Y: 5,
    SHIP_SIZE: 3,
    SHIPS_PER_PLAYER: 3,
    placements: [
        [-1, 1, 0, 1, -1],
        [-1, 1, 0, 1, -1]
    ]
};


//  This is two different kinds of hack.

