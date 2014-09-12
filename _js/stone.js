/*
 * Stone Class
 * a stone is one (view-)element of a field (see field.js)
 * a stone can either display water, island or fireball
 */
var Stone = Model({
	init: function(position){		
		this.position = position;
		this.isSelected = false; //if true => possible new position for ship
		this.initView();		
	},
	initView: function(){
		this.view = EE('div', {'@class':'stone posX_' + this.position[0]  + ' posY_' + this.position[1]});
		this.view.set('$left', PIECESIZE * this.position[0] +'px');
		this.view.set('$top', PIECESIZE * this.position[1] + 'px');
	},
	getView: function() {
		return this.view;
	},
	setIsSelected: function(state, clickable) {
		var operator = (state === true) ? '+' : '-';
		this.view.set('$', operator + 'selected');
		this.isSelected = state;
		if (this.isSelected === true && clickable) {
  			this.view.on('click', this.onSelectedClicked);
		} else {
			$.off(this.onSelectedClicked);
		}
	},
	onSelectedClicked: function(){
		game.trigger('positionBeforeChange', {'position' : this.position});
	},
	/*
	 * enables possible new position for an island
	 */
	enableDestruction: function(){		
	    this.view.set('$', '+destroyable');
		this.view.on('click', this.onDestructionClick);	    
	},
	/*
	 * disables possible new position for an island
	 */
	disableDestruction: function(){
		this.view.set('$', '-destroyable');
		$.off(this.onDestructionClick);
	},
	onDestructionClick: function(blink){
		if (!blink) {
			blink = false;
		}
		this.disableStone(false, blink);
		game.trigger('onDestruction', {'position' : this.position});
	},
	disableStone: function(isFireBall, blink){
		if (isFireBall === true) {
			this.view.set('$', '+fireball');
		}
		if (blink === true) {
			this.view.set('$', '+blink');
		}
		this.view.set('$', '+destroyed');
	}
});