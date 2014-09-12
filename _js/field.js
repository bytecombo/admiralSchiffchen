/*
 * field class - matrix of stones(locations)
 */
var Field = Model({
  id: '#field',
  stones: {},
  init: function(gridSize){
    this.size = [gridSize[0], gridSize[1]];
    this.initView();
  },
  initView: function(){
    this.view =  $(this.id);
    this.view.set('$width', PIECESIZE * this.size[0] + 10 + "px");
    this.view.set('$height', PIECESIZE * this.size[1] + 10 + "px");
    for (i = 0; i < this.size[0]; i++) { 
      for (j = 0; j < this.size[1]; j++) { 
        var stone = new Stone([i,j]);
        this.stones[i + '_' + j] = stone;
        this.view.add(stone.getView());
      } 
    }
  },
  deselectFields: function() {
    for (var key in this.stones) {
      this.stones[key].setIsSelected(false);
    }    
  },
  selectFields: function(fields, clickable){
    var that = this, stone;
    fields.forEach(function(position){
      stone = that.getStoneByPosition([position.moveToXPos, position.moveToYPos]);
      stone.setIsSelected(true, clickable);
    });
  },
  getStoneByPosition: function(position){
    return this.stones[position[0] + '_' +position[1]];
  },
  
  enableDestroy: function(destroyableFields, clickable) {
    var stone, object;
    for (var key in destroyableFields) {
      object = destroyableFields[key];
      stone = this.stones[object.removeXPos + "_" + object.removeYPos];
      if (clickable === true) {
        stone.enableDestruction();
      }
    }    
  },

  disableDestroy: function() {
    for (var key in this.stones) {
      stone = this.stones[key];
      this.stones[key].disableDestruction();
    }
  }
});