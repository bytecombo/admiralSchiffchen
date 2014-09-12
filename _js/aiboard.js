/*
 * AIBoard is used to calculate all possible moves and give you the best ones
 */
var AIBoard = Model({

  isPlayerATurn : true,

  //the game is either in MovePlayerState or in isRemoveStoneState
  isMovePlayerState: true, 
  
  playerAPosX: 2,
  playerAPosY: 0,

  playerBPosX: 2, 
  playerBPosY: 4,

  _boardSizeX: 5,
  _boardSizeY: 5,

  //usefull constants for board matrix
  _FREE_BLOCK : 0,
  _PLAYER_A_BLOCK : 1,
  _PLAYER_B_BLOCK : 2,
  _REMOVED_BLOCK : 3,

  //Alpha Beta algorithm/Nega Max Algorithm Constant
  _RECURSION_DEPTH_ALPHA_BETA_ALGORITHM: 3,

  /*
  * init method gets some properties in an object. 
  * All of them are optional. 
  */
  init: function(props){

    if(this._isAttributeDefined(props, "board")) {
      //clone old board if board is handed in
      var oldBoard = props.board;
      this.isPlayerATurn = oldBoard.isPlayerATurn;
      this._boardSizeX = oldBoard._boardSizeX;
      this._boardSizeY = oldBoard._boardSizeY;
      this.playerAPosX = oldBoard.playerAPosX;
      this.playerAPosY = oldBoard.playerAPosY;
      this.playerBPosX = oldBoard.playerBPosX;
      this.playerBPosY = oldBoard.playerBPosY;

      //clone the matrix
      this._matrix = new Array(this._boardSizeX);
      for (var x = 0; x < this._boardSizeX; x++) {
        this._matrix[x] = new Array(this._boardSizeY);
        for(var y = 0; y < this._boardSizeY; y++) {
          this._matrix[x][y] = oldBoard._matrix[x][y]; 
        }
      }
    
    } else {
      //init board with values provided or leave the default

      if(this._isAttributeDefined(props, "isPlayerATurn")) {
        this.isPlayerATurn = props.isPlayerATurn;
      }

      if(this._isAttributeDefined(props, "boardSizeX")) {
        this._boardSizeX = props.boardSizeX;
      }

      if(this._isAttributeDefined(props, "boardSizeY")) {
        this._boardSizeY = props.boardSizeY;
      }

      if(this._isAttributeDefined(props, "playerAPosX")) {
        this.playerAPosX = props.playerAPosX;
      }

      if(this._isAttributeDefined(props, "playerAPosY")) {
        this.playerAPosY = props.playerAPosY;
      }

      if(this._isAttributeDefined(props, "playerBPosX")) {
        this.playerBPosX = props.playerBPosX;
      }

      if(this._isAttributeDefined(props, "playerBPosY")) {
        this.playerBPosY = props.playerBPosY;
      }

      //init the matrix
      this._matrix = new Array(this._boardSizeX);
      for (var x = 0; x < this._boardSizeX; x++) {
        this._matrix[x] = new Array(this._boardSizeY);
        for(var y = 0; y < this._boardSizeY; y++) {
          this._matrix[x][y] = this._FREE_BLOCK;
        }
      }

      //set player positions
      this._matrix[this.playerAPosX][this.playerAPosY] = this._PLAYER_A_BLOCK;
      this._matrix[this.playerBPosX][this.playerBPosY] = this._PLAYER_B_BLOCK;
    }
  },

  /*
  * calculates a possible double move for currentPlayer (first setting player, then remove a stone) using the ai and returns it!
  * returns null if no doublemove is possible
  */
  calculateNextDoubleMoveOfPlayer: function(){
    if (!this.isMovePlayerState) {
      return null;
    }

    return this._calculateNextDoubleMoveOfPlayer(this._RECURSION_DEPTH_ALPHA_BETA_ALGORITHM, -1000, +1000);
  },

  /*
  * calculates all possible moves of current player if non are available or we are currently not 
  * in a move state returns an empty array
  */
  calculateAllPossibleMovesOfPlayer: function(){
    
    var possibleMoves = [];
    if(this.isMovePlayerState) {
      for (var x = 0; x < this._boardSizeX; x++) {
        for(var y = 0; y < this._boardSizeY; y++) {
          if(this.isPlayerATurn && this._canPlayerAMoveTo(x,y)){
            //playerA can move
            possibleMoves.push({moveToXPos:x, moveToYPos:y});
          } else if (!this.isPlayerATurn && this._canPlayerBMoveTo(x,y)) {
            //playerB can move
            possibleMoves.push({moveToXPos:x, moveToYPos:y});
          }
        }
      }
    }

    return possibleMoves; 
  },

  /*
  * calculates all Stones that can be removed
  */
  calculateStonesThatCanBeRemoved: function(){
    var possibleMoves = [];

    if(!this.isMovePlayerState) {
      for (var x = 0; x < this._boardSizeX; x++) {
        for(var y = 0; y < this._boardSizeY; y++) {
            if( this._isStoneFree(x,y)){
              possibleMoves.push({removeXPos:x, removeYPos:y});
            }
        }
      }
    }

    return possibleMoves;
  },  

  removeRandomStone: function() {
    var freeStones = this._getAllStonesOfType(this._FREE_BLOCK);
    
    if(freeStones.length < 1) {
      return null;
    }

    //remove a stone and return it
    var randomIndex = this._randomIntFromInterval(0, freeStones.length -1);
    var stone = freeStones[randomIndex];
    this._matrix[stone.x][stone.y] = this._REMOVED_BLOCK;

    return stone;
  }, 

  /*
  * returns true if the move is possible for the currentPlayer 
  */
  movePlayer: function(xPos, yPos) {
    
    if (this.isMovePlayerState && this._isPossibleMoveOfPlayer(xPos, yPos)) {
      if (this.isPlayerATurn) {
        this._matrix[this.playerAPosX][this.playerAPosY] = this._FREE_BLOCK;
        this.playerAPosX = xPos;
        this.playerAPosY = yPos;
        this._matrix[xPos][yPos] = this._PLAYER_A_BLOCK;
    
      } else {
        this._matrix[this.playerBPosX][this.playerBPosY] = this._FREE_BLOCK;
        this.playerBPosX = xPos;
        this.playerBPosY = yPos;
        this._matrix[xPos][yPos] = this._PLAYER_B_BLOCK;
      }

      this.isMovePlayerState = false;
      return true;
    }

    return false;
  },

  /*
  * returns true if the move is possible to remove this stone
  */
  removeStoneFromBoard: function(xPos, yPos) {
    
    if(!this.isMovePlayerState && this._isPossibleToRemoveStoneFromBoard(xPos, yPos)) {
      this._matrix[xPos][yPos] = this._REMOVED_BLOCK;
      this.isMovePlayerState = true;
      this.isPlayerATurn = !this.isPlayerATurn;
      return true;
    }

    return false;
  },

  /*
  * returns true if playerA has won
  */
  hasPlayerAWon: function(){    
    return this.hasPlayerBLost();
  },

  /*
  * returns true if playerB has won
  */
  hasPlayerBWon: function(){    
    return this.hasPlayerALost();
  },

  /*
  * returns true if playerA has lost
  */
  hasPlayerALost: function(){
    return this._hasPlayerLost(true);
  },

  /*
  * returns true if playerB has lost
  */
  hasPlayerBLost: function(){
    return this._hasPlayerLost(false);
  },

  /*
  * returns true if currentPlayer has won the game
  */
  hasPlayerWonGame: function(){
    if(this.isPlayerATurn) {
      return this.hasPlayerAWon();
    }
    
    return this.hasPlayerBWon();
  },

  /*
  * returns true if currentPlayer has lost the game
  */
  hasPlayerLostGame: function(){
    if(this.isPlayerATurn) {
      return this.hasPlayerALost();
    }
    
    return this.hasPlayerBLost();
  },

  /*
  * returns true if game has ended
  */
  hasGameEnded: function() {
    
    if(this.hasPlayerLostGame()) {
      return true;
    }

    if(this.hasPlayerWonGame()) {
      return true;
    }

    return false;
  },

  //////////////////////////////Private Interface///////////////////////////////////////

  _hasPlayerLost: function(checkPlayerA) {
    for (var x = 0; x < this._boardSizeX; x++) {
      for(var y = 0; y < this._boardSizeY; y++) {
        if(checkPlayerA){
          if(this._canPlayerAMoveTo(x,y)) {
            return false;
          }
        } else {
          if(this._canPlayerBMoveTo(x,y)) {
            return false;
          }
        }
        
      }
    }
    return true;
  },

  _canPlayerAMoveTo: function(x, y){
    if(this._isStoneFree(x,y) && this._isStoneNextToStoneOfType(x, y, this._PLAYER_A_BLOCK) &! this._isStoneNextToStoneOfType(x, y, this._PLAYER_B_BLOCK)) {
      return true;
    }

    return false;
  },

  _canPlayerBMoveTo: function(x, y){
    if(this._isStoneFree(x,y) && this._isStoneNextToStoneOfType(x, y, this._PLAYER_B_BLOCK) &! this._isStoneNextToStoneOfType(x, y, this._PLAYER_A_BLOCK)) {
      return true;
    }

    return false;
  },

  _isAttributeDefined: function(obj, propName) {
    if(typeof obj === "undefined") {
      return false;
    }

    if (typeof obj[propName] === "undefined") {
      return false;
    }

    return true;
  },

  /*
  * Method is a bit tricky to use as it either returns a value or an object
  * Uses the "Nega Max Algorithm" (http://homepages.cwi.nl/~paulk/theses/Carolus.pdf)
  */
  _calculateNextDoubleMoveOfPlayer: function(depth, alpha, beta){
  
    var value = 0;
    
    //if recursion depth of algorithm is reached or game has ended => evaluate board
    if(depth === 0 || this.hasGameEnded()){
      value = this._evaluateBoard(depth);
      return value;
    }

    var possibleDoubleMoves = this._calculatePossibleDoubleMoves();
    var best = -1001;

    for (var i = 0; i < possibleDoubleMoves.length; i++) {
      var move = possibleDoubleMoves[i];
      var nextBoard = this._makeDoubleMove(move);
      move.value = -(nextBoard._calculateNextDoubleMoveOfPlayer(depth-1, -beta, -alpha));
      
      if(move.value > best) {
        best = move.value;
      }

      if(best > alpha) {
        alpha = best;
      }

      if(best >= beta) {
        break;
      }
        
    }

    //if recursion is ended decide for a move to return (add some random values?)
    if(depth === this._RECURSION_DEPTH_ALPHA_BETA_ALGORITHM) {

      //only include double moves that make sense
      var likelyDoubleMoves = [];
      for (var i = 0; i < possibleDoubleMoves.length; i++) {
        var move = possibleDoubleMoves[i];

        
        if(move.value == best) {
          return move;
        }
      }
    }

    return best;
  },

  _randomIntFromInterval: function(min, max)
  {
    if(max <= min){
      return min;
    }
    return Math.floor(Math.random()*(max-min+1)+min);
  },

  /*
  * makes a bouble move on a new boar and returns this board
  */
  _makeDoubleMove: function(move) {
    var newBoard = new AIBoard({board:this});
    newBoard.movePlayer(move.moveToXPos, move.moveToYPos);
    newBoard.removeStoneFromBoard(move.removeXPos, move.removeYPos);
    
    return newBoard;
  },

  _calculatePossibleDoubleMoves: function() {
    
    var possibleDoubleMoves = []; 
    var possiblePlayerMoves = this.calculateAllPossibleMovesOfPlayer();

    var otherPlayerStoneType = this._PLAYER_A_BLOCK;
    if(this.isPlayerATurn) {
      otherPlayerStoneType = this._PLAYER_B_BLOCK;
    }

    for (var i = 0; i < possiblePlayerMoves.length; i++) {
      var playerMove = possiblePlayerMoves[i];
      var moveToXPos = playerMove.moveToXPos;
      var moveToYPos = playerMove.moveToYPos;

      //instead of calculating all stones, that can be removed calculate only those that are next to the enemy
      var newBoard = new AIBoard({board:this});
      newBoard.movePlayer(moveToXPos, moveToYPos);
      var freeStonesNextToOtherPlayer = newBoard._getAllFreeStonesNextToOtherPlayer();
      for (var j = 0; j < freeStonesNextToOtherPlayer.length; j++) {
        var stone = freeStonesNextToOtherPlayer[j];
        var removeXPos = stone.x;
        var removeYPos = stone.y;
        possibleDoubleMoves.push({moveToXPos:moveToXPos, moveToYPos:moveToYPos, removeXPos:removeXPos, removeYPos:removeYPos});
      }
    }

    return possibleDoubleMoves;
  },

  _evaluateBoard: function(depth) { 
    //this method evaluates the board 

    //a) check first if I have won/lost the game!
    //to win faster the recursion depth is also used in evaluation!
    var wonValue = 100 + (10 * depth); //+ depth;
    if(this.isPlayerATurn){
      if(this.hasPlayerAWon()){
        return wonValue;
      } else if (this.hasPlayerBWon()) {
        return -wonValue;
      } 
    }else{
      if(this.hasPlayerBWon()){
        return wonValue;

      } else if (this.hasPlayerAWon()) {
        return -wonValue;
      }  
    }

    //b) can I move more than my opponent?
    var returnValue = 0;
    var canPlayerAMoveToCount = 0;
    var canPlayerBMoveToCount = 0;

    for (var x = 0; x < this._boardSizeX; x++) {
      for(var y = 0; y < this._boardSizeY; y++) {
        if(this._canPlayerAMoveTo(x,y)){
          canPlayerAMoveToCount += 1; 
        }
        if(this._canPlayerBMoveTo(x,y)){
          canPlayerBMoveToCount += 1; 
        }
      }
    }
    
    if(this.isPlayerATurn) {
      returnValue = canPlayerAMoveToCount + (canPlayerAMoveToCount - canPlayerBMoveToCount);
    } else {
      returnValue = canPlayerBMoveToCount + (canPlayerBMoveToCount - canPlayerAMoveToCount);
    }

    return returnValue;

  },

  _isPossibleMoveOfPlayer: function(xPos, yPos) {
    var possibleMoves = this.calculateAllPossibleMovesOfPlayer();
    for (var i=0; i<possibleMoves.length; i++){
      if(possibleMoves[i].moveToXPos === xPos && possibleMoves[i].moveToYPos === yPos) {
        return true;
      }
    }
    return false;
  },

  _isPossibleToRemoveStoneFromBoard: function(xPos, yPos) {
    var possibleMoves = this.calculateStonesThatCanBeRemoved();
    for (var i=0; i<possibleMoves.length; i++){
      if(possibleMoves[i].removeXPos === xPos && possibleMoves[i].removeYPos === yPos) {
        return true;
      }
    }

    return false;
  },  

  _isStoneNextToStoneOfType: function(stonePosX, stonePosY, stoneType) {
    if(stonePosX > 0 && this._matrix[stonePosX-1][stonePosY] === stoneType){
      return true;
    } else if (stonePosX > 0 &&  stonePosY > 0 && this._matrix[stonePosX-1][stonePosY-1] === stoneType) {
      return true;
    } else if (stonePosY > 0 && this._matrix[stonePosX][stonePosY-1] === stoneType) {
      return true;
    } else if (stonePosX + 1 < this._boardSizeX && stonePosY > 0 && this._matrix[stonePosX+1][stonePosY-1] === stoneType) {
      return true;
    } else if (stonePosX + 1 < this._boardSizeX && this._matrix[stonePosX+1][stonePosY] === stoneType) {
      return true;
    } else if (stonePosX + 1 < this._boardSizeX && stonePosY + 1 < this._boardSizeY && this._matrix[stonePosX+1][stonePosY+1] === stoneType) {
      return true;
    } else if (stonePosY + 1 < this._boardSizeY && this._matrix[stonePosX][stonePosY+1] === stoneType) {
      return true;
    } else if (stonePosX > 0 && stonePosY + 1 < this._boardSizeY && this._matrix[stonePosX-1][stonePosY+1] === stoneType) {
      return true;
    }
    return false;
  },

  _getAllFreeStonesNextToOtherPlayer: function(){
    var stones = [];

    var freeStones = this._getAllStonesOfType(this._FREE_BLOCK);
    for (var i = 0; i < freeStones.length; i++) {
      var stone = freeStones[i];

      var stoneType = this._PLAYER_A_BLOCK;
      if(this.isPlayerATurn) {
        stoneType = this._PLAYER_B_BLOCK;
      }

      if (this._isStoneNextToStoneOfType(stone.x, stone.y, stoneType)){
        stones.push({x:stone.x,y:stone.y});
      }
    }

    return stones;
  },

  _getAllStonesOfType: function(stoneType){
    var stones = [];
    for (var x = 0; x < this._boardSizeX; x++) {
      for(var y = 0; y < this._boardSizeY; y++) {
        if (this._matrix[x][y] === stoneType){
          stones.push({x:x,y:y});
        }
      }
    }

    return stones;
  },

  _isStoneFree: function(stonePosX, stonePosY) {
    return this._matrix[stonePosX][stonePosY] === this._FREE_BLOCK;
  }
  
});