/*
 * controller of the game
 */
var Game = Model({
  player: {},
  currentPlayerId: null,
  playerStartedId: null, //player that had first move in current round
  aiDoubleMove: null,
  isPlayerTwoAI: false,

  HELPTEXT: "<h2>Help</h2><br /><b>Goal</b> of the game is to isolate your opponent.<br /><br />" +
    "Every turn consists of two moves.<br />" +
    "<b>First</b> you move your ship one step on water. " +
    "There always has to be one free field of water between yourself and your opponent.<br />" +
    "In the <b>second</b> move you build an island and thereby decrease the fields of water.<br /><br />" +
    "At the end of every round a firestorm will take a random field of water.",

  init: function(isPlayerTwoAI){
    var that =  this;

    this.isPlayerTwoAI = isPlayerTwoAI;

    // overlay message
    this.messageOverlay = $('#message-overlay');
    $('.close', this.messageOverlay).onClick(function(){
      that.messageOverlay.hide();
    });

    this.console = $('#console');
    this.console.show();

    // show help overlay
    $('.help').onClick(function(){
      $('.content', that.messageOverlay).set('innerHTML', that.HELPTEXT);
      that.messageOverlay.show();
    });

    var gridSize = $('select[name="grid"]').get('value').split("_");
    this.field = new Field(gridSize);

    var posX = that.calculatePlayerPositionsX(gridSize);
    var namePlayer2 = (isPlayerTwoAI) ? "Computer" : $('input[name="player2"]').get('value');
    this.initPlayers($('input[name="player1"]').get('value'), namePlayer2, posX, (gridSize[1] - 1));
    
    this.initEventBinding();

    this.initAIBoard(gridSize, posX);
    this.startGame();
  },

  initAIBoard: function(gridSize, posX) {
    this.aiBoard = new AIBoard({      
      boardSizeX: gridSize[0], 
      boardSizeY: gridSize[1], 
      playerAPosX: posX,
      playerAPosY: 0,
      playerBPosX: posX,
      playerBPosY: gridSize[1] - 1 
    });
  },

  calculatePlayerPositionsX: function(gridSize) {
    return Math.floor((gridSize[0] -1) / 2);
  },

  initEventBinding: function() {
    this.on('positionBeforeChange', this.onChangePosition);
    this.on('onDestruction', this.onDestroyField);
  },

  initPlayers: function(name1, name2, posX, maxY) {
    this.player[0] = new Player(name1, 1, 'orange', [posX, 0], false);
    this.player[1] = new Player(name2, 2, '#09a909', [posX, maxY], this.isPlayerTwoAI);
  },

  startGame: function() {
    this.playerStartedId = this.currentPlayerId = Math.round(Math.random());

    this.aiBoard.isPlayerATurn = false;
    if (this.currentPlayerId === 0) {
      this.aiBoard.isPlayerATurn = true;
    }

    this.startNextRound();
  },

  startNextRound: function() {
    var player = this.player[this.currentPlayerId],    
    otherPlayer = this.player[this.getOtherPlayerId()],
    that = this;  

    player.setIsSelected(true);

    //has game ended?
    if (that.aiBoard.hasGameEnded()) {
      that.onGameEnd();
      return;
    }
    
    if (player.getisAI()) {
      var timeBefore = new Date().getTime();
      this.setConsoleMessage('Computer: is calculating next move of the ship ..');

      // async. handling in order to display userfriendly messages
      window.setTimeout(function() { 
        that.aiDoubleMove = that.aiBoard.calculateNextDoubleMoveOfPlayer();
        var timeAfter = new Date().getTime();
        var diff = timeAfter - timeBefore;

        window.setTimeout(function() {          
          game.trigger('positionBeforeChange', {'position' : [game.aiDoubleMove.moveToXPos, game.aiDoubleMove.moveToYPos]});
          that.setConsoleMessage('Computer: is calculating position of new island ..');
          window.setTimeout(function() {
            // trigger click on field
            game.field.getStoneByPosition([game.aiDoubleMove.removeXPos, game.aiDoubleMove.removeYPos]).onDestructionClick(true);            
          }, 3000);
        }, 3000 - diff); 
      }, 100);   
    } else {
      //calculate possible moves
      var possibleMoves = that.aiBoard.calculateAllPossibleMovesOfPlayer();
      that.field.selectFields(possibleMoves, true);

      this.setConsoleMessage('Your turn ' + player.getName() + ": Move your ship one step.");     
    }
  },  

  enableFieldDestroy: function() {
    var player = this.player[this.currentPlayerId];
    var destroyableFields = this.aiBoard.calculateStonesThatCanBeRemoved();
    this.field.enableDestroy(destroyableFields, !player.getisAI());
  },

  disableFieldDestroy: function() {    
    this.field.disableDestroy();
  },

  getOtherPlayerId: function() {
    return Math.abs(this.currentPlayerId - 1);
  },

  onFinishRound: function(){ 
    var player = this.player[this.currentPlayerId];
    var timeout = (player.getisAI()) ? 3000 : 100;
    var that = this;

    if(this.currentPlayerId != this.playerStartedId) {
      this.setConsoleMessage("A firestorm is comming ..", "red");
    }

    window.setTimeout(function() {
      if(that.currentPlayerId != that.playerStartedId) {

        // firestorm
        var stone = that.aiBoard.removeRandomStone();
        if(stone != null) {
          that.field.getStoneByPosition([stone.x, stone.y]).disableStone(true, true);  
        }
        that.currentPlayerId = that.getOtherPlayerId();

        window.setTimeout(function() {
          that.startNextRound();  
        }, 3000);       

      } else {        
        that.currentPlayerId = that.getOtherPlayerId();
        that.startNextRound();        
      }
    }, timeout);

  },

  onChangePosition: function(evt){
    var player = this.player[this.currentPlayerId];
    player.setPosition(evt.position);

    this.aiBoard.movePlayer(evt.position[0], evt.position[1]);

    this.field.deselectFields();

    this.enableFieldDestroy();
    if (!player.getisAI()) {
      this.setConsoleMessage('Your turn ' + player.getName() + ": Build an island by selecting one field of water.");
    }
  },

  /*
   * build an island
   */
  onDestroyField: function(evt) {
    var player = this.player[this.currentPlayerId];
    player.setIsSelected(false); 

    this.aiBoard.removeStoneFromBoard(evt.position[0], evt.position[1]);

    this.disableFieldDestroy();
    this.onFinishRound();
  },

  onGameEnd: function() {    
    var winner = this.player[0];
    if(this.aiBoard.hasPlayerBWon()){
      winner = this.player[1];
    }

    content = '<div style="text-align:center"><h3>' + winner.getName() + ' wins!</h3><a href="">start again</a></div>';

    $('.content', this.messageOverlay).set('innerHTML', content);
    this.messageOverlay.show();
  },

  setConsoleMessage: function(message, color) {
    
    //if no color is handed in, use player color
    if(typeof color === "undefined") {
      color = this.player[this.currentPlayerId].getColor();
    }
    
    var msg = this.console.get('innerHTML') + '<div style="color:' + color + '">' + message + '</div>';
    this.console.set('innerHTML', msg);

    this.console.set('scrollTop', this.console.get('scrollHeight'));

  }
});