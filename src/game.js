/*	game.js	- file that contains all the craftyJs components and entities. Initializes the game world.

*/
Game = {
    game_area: {
        canvas_width: 0,
        canvas_height: 0,
        playable_width: 0,
        playable_height: 0,
        canvas_top: 0, //px
        canvas_left: 0 //px   
    },
    
    map_grid: {
        width:  0,
        height: 0,
        tile: {
            width:  16,
            height: 16
        }
    },
    
    width: function() {
        return this.map_grid.width * this.map_grid.tile.width;
    },

    height: function() {
        return this.map_grid.height * this.map_grid.tile.height;
    },   
    
	getPlayerCoords: function () {
	    return {"x": Game.main_player.x, "y": Game.main_player.y };
	},
	
	fellhound: undefined,
    main_player: undefined,
    other_player: undefined,
    
    init: function (width, height, x, y, tile_size) {
        console.log("Initializing game with " + width + " " + height);
        Game.map_grid.tile.width = tile_size;
        Game.map_grid.tile.height = tile_size;
        Game.map_grid.width = Math.floor(2 * width / tile_size);
        Game.map_grid.height = Math.floor(2 * height / tile_size);
        
        Game.game_area.width = Game.width();
        Game.game_area.height = Game.height();
        Game.game_area.playable_width = width;
        Game.game_area.playable_height = height;

        Game.canvas_top = y;
        Game.canvas_left = x;
        Crafty.init(Game.game_area.width, Game.game_area.height);
        Crafty.viewport.init(Game.game_area.playable_width, Game.game_area.playable_height);
	    Crafty.background('rgb(244,224,163)');	

        Crafty.scene('Loading');

    }
}
