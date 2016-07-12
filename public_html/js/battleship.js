
/**
 * The main game model class.
 * @param {type} options A javasctipt onbject with options for the game and config for the board setup
 * @returns {BattleshipGame}
 */
function BattleshipGame(options) {
  
    // Instance Variables (since we wont have multiple instanaces, these could be class
    // variables, but what if we want to go multiplayer? This would make it easier.

    // We use arrays instead of individual boards and players to make the code flexible
    // if we want to increase the number of players.
    this.boards = [];
    this.players = [];
    this.currentPlayerIndex = 0;
    this.gameOn = true;

    // Class Variables
    
    
    this.BOARD_SIZE_X = options.BOARD_SIZE_X || 5;
    this.BOARD_SIZE_Y = options.BOARD_SIZE_Y || 5;
    this.SHIP_SIZE =  options.SHIP_SIZE || 3;
    this.SHIPS_PER_PLAYER = options.SHIPS_PER_PLAYER ||  3;

    BattleshipGame.HIT = "Hit";
    BattleshipGame.SUNK = "Sunk";
    BattleshipGame.WON = "You Win!";
    BattleshipGame.ALREADY_TAKEN = "Already Taken";
    BattleshipGame.MISS = "Miss";


/**
 * The current player fires a shot at the tile indicated by x and y
 * @param {type} x
 * @param {type} y
 * @returns a result string, as indicated in the spec.
 */
    this.fire = function(x,y) {

        var move = new Move(this.players[this.currentPlayerIndex], this.currentPlayerIndex === 1 ? 0 : 1, x, y);

        var result = this.boards[move.boardId].applyMove(move);

        if (result === BattleshipGame.SUNK) {
            won = this.checkForWin(move);
            if (won) {

                gameOn = false;
                result = BattleshipGame.WON; 
            }
        }

        // Swtich players
        if(this.gameOn)
            this.turnOver();

        return result;
    };
    /**
     * Switches to a player's turn 
     * @param {type} switchTo  The player to switch to, if not indicated switches to other player.
     * @returns {undefined}
     */
    this.turnOver = function(switchTo) {


        gameTurnOver();
    };
    /**
     * Checks to see if a move has one the game
     * @param {type} move
     * @returns {Boolean}
     */
    this.checkForWin = function( move) {
         var otherPlayerIndex = move.player.index === 0 ? 1 : 0;

         var playerWon = true;
         
         // iterate through other player's ships to see if they are all destroyed.
         for (var i = 0; i < this.players[otherPlayerIndex].ships.length; i++) {
             if (!this.players[otherPlayerIndex].ships[i].destroyed) {
                 playerWon = false;
             }

         }

         return playerWon;
     };
     /** 
      * Whose turn is it?
      * @returns PLayer object
      */
    this.getCurrentPlayer = function() {
        return this.players[this.currentPlayerIndex];
    }

    // Init code, could be in an init method.
    this.players[0] = new Player(options.PLAYER_ONE_NAME , 0);
    this.players[1] = new Player(options.PLAYER_TWO_NAME , 1);
    this.boards[0]  = new Board(this.players[0], 0, options.placements[0],options);
    this.boards[1]  = new Board(this.players[1], 1, options.placements[1],options);
 
};

// Base object for items on the board.
function GameObject(x,y) {
    this.x = x;
    this.y = y;
    this.damage = false;


    this.hasBeenShot = function() {
        return this.damage;
    };

     this.shoot = function(move) {
        if(this.hasBeenShot())
            return BattleshipGame.ALREADY_TAKEN;
        else {
            this.damage = true;
            return BattleshipGame.MISS;
        }
     };
}

//  Represents a tile on the board without a ship in it
function Tile(x,y) {
    GameObject.call(this,x,y);
}

// Tile extends GameObject
Tile.prototype = Object.create(GameObject.prototype);
Tile.prototype.constructor = Tile;

// A piece of a ship
function Piece(x,y,ship,index) {

    this.ship = ship;
    this.index = index;
    GameObject.call(this,x,y);

    this.shoot = function(move) {
        
        if(this.hasBeenShot())
            return BattleshipGame.ALREADY_TAKEN;
        else {
            // damage the tile and return result
            this.damage = true;
            return this.ship.hit(this.index);
        }
    };

}

// Piece extends GameObject
Piece.prototype = Object.create(GameObject.prototype);
Piece.prototype.constructor = Piece;


/*
 * Ship contains the Pieces and some data
 */
function Ship(x,y,player, options) {

    // Instance Variables
    this.length = options.SHIP_SIZE;
    this.owner = player;
    this.pieces = [];    
    this.destoyed = false;

    // Set up piece array
    for (var i = 0; i < options.SHIP_SIZE; i++) {
        this.pieces[i] = new Piece(x,y,this,i);            
    }

    this.owner.addShip(this);  

    this.getPiece = function(offset) {
        return this.pieces[offset]; 
    };  

    this.hit = function(){
        if(this.destroyed)
            return BattleshipGame.ALREADY_TAKEN;

        // If you find a spot without damage, the ship has not yet been destroyed.
       var hasUndamagePiece = false;
         for (var i = 0; i < game.SHIP_SIZE; i++) {
            if(!this.pieces[i].damage) {
               hasUndamagePiece = true;
            }
       }

        if(!hasUndamagePiece){
            this.destroyed = true;
            return BattleshipGame.SUNK;
        }
        else 
            return BattleshipGame.HIT;
    };
};

/*
 * A person playing the game
 */
function Player(name,index) {
    this.name = name;
    this.index = index;
    this.ships = [];

    this.addShip = function(ship){
        this.ships.push(ship);
    };    
}

/* 
 * The move a Player makes, firing a shot
 */
function Move(player, boardId, x, y ) {
    this.player = player;
    this.boardId = boardId;
    this.x = x;
    this.y = y;

    if(x < 0 || x > game.BOARD_SIZE_X)
        throw "Move "+ this.x +" is off the board.";

  this.toString = function() {
    return ("[ Move: "+this.player.name+" moving to x:"+this.y+" y:"+this.y+" ]");
  };

}

function Board(player, boardId, placement,options ) {
    this.owner = player;
    this.tiles = [];
    this.id = boardId;

    // Set up blank tiles in array
    for (var x = 0; x < options.BOARD_SIZE_X; x++) {
        this.tiles[x] = [];
        for (var y = 0; y < options.BOARD_SIZE_Y; y++) {
            this.tiles[x][y] = new Tile(x,y);
        }
    }

    //  Place ships by replacing tiles in those spots show in the placement arrays
    for (var x = 0; x < placement.length; x++) {
        // A value of -1 indicates the column is empty
       if(placement[x] < -1) {
           // not strictly necessary, since you can't enter negative numbers, but still good.
            throw "Problem setting up the board. Index "+placement[x]+" is too low.";
        }
        else if( placement[x]+options.SHIP_SIZE > options.BOARD_SIZE_Y) {
           // not strictly necessary, since you can't places ships off the board now, but still good.
            throw "Problem setting up the board.  Ship of length "+options.SHIP_SIZE+" at "+placement[x]+ " will not fit on the board size "+options.BOARD_SIZE_Y;
        }
        else if(Number(placement[x]) !== -1) {
            ship = new Ship(x,placement[x],this.owner,options);
            for (var y =0; y < options.SHIP_SIZE; y++) {
              this.tiles[x][(placement[x]+y)] = ship.getPiece(y);
            }
        }
    }

    this.applyMove = function ( move) {
        return this.tiles[move.x][move.y].shoot(move);
    };

}
