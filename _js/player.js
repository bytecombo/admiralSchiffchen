/*
 * Player Class (handles mainly the view of the player)
 */
var Player = Model({
  	isAi: false,
	init: function(name, id, color, position, isAI){
		this.name = name;
		this.id = id;
		this.color = color;
		this.initView(position);
		this.isAI = isAI;
	},
	initView: function(position){
		this.tokenView = EE('div', {'@class':'stone player', '@id' : 'player' + this.id});
		$('#field').add(this.tokenView);		
		this.setPosition(position);
	},
	getisAI: function() {
	  return this.isAI;
	},
	getName: function() {
		return this.name;
	},
	getColor: function() {
		return this.color;
	},
	setPosition: function(position) {
		this.tokenView.set('$left', PIECESIZE * position[0] + 'px');
	  	this.tokenView.set('$top', PIECESIZE * position[1]  + 'px');
	},
	setIsSelected: function(state) {
		var operator = (state === true) ? '+' : '-';
		this.tokenView.set('$', operator + 'selected');
    	var color = (state === true) ? this.color : 'transparent';
    	this.tokenView.set('$backgroundColor', color);
   	}
});