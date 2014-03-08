Crafty.scene("Main", function() {       

    // A 2D array to keep track of all occupied tiles
    this.occupied = new Array(Game.map_grid.width);
    for (var i = 0; i < Game.map_grid.width; i++) {
        this.occupied[i] = new Array(Game.map_grid.height);
        for (var y = 0; y < Game.map_grid.height; y++) {
            this.occupied[i][y] = false;
        }
    }
	
	var arena_height = 50;
	var arena_width = 50;
	
    var x_start = Math.floor((Game.map_grid.width - arena_width) / 2);
    var y_start = Math.floor((Game.map_grid.height - arena_height) / 2);
    var width = Math.floor((Game.map_grid.width + arena_width) / 2);
    var height = Math.floor((Game.map_grid.height + arena_height) / 2);
    console.log("Creating boundary rocks with " + width + " " + height);
    for (var x = 0; x < Game.map_grid.width; x++) {
        for (var y = 0; y < Game.map_grid.height; y++) {
            var at_edge = (x == x_start || x == width - 1 
                       || y == y_start || y == height - 1)
                       && !(x < x_start || x >= width || y < y_start || y >= height);
            var inside = (x > x_start && x < width) && (y > y_start && y < height);
            if (at_edge) {
                // Place a rock entity at the current tile
                Crafty.e('Rock').at(x, y);
                this.occupied[x][y] = true;
            } /*else if (inside) {
                Crafty.e('Sand').at(x,y);
                this.occupied[x][y] = true;
            }*/
        }
    }
 

	/* mousepos - stores the position of the mouse */
	var mouse_pos = Crafty.e("Actor")
		.attr({ x: 20, y: 20, w: 100, h: 20 });
 	
	var move_icon = Crafty.e("Endpoint")
        .at(0, 0);
 
    Game.main_player = Crafty.e("Controllable")
        .at(x_start + 1, y_start + 1);
        
    Game.main_player.catchBall();
    

    Game.other_player = Crafty.e('PlayerCharacter')
        .at(x_start + 45, y_start + 45)
        .bind('EnterFrame', function () {
            this.throwBall(Game.main_player);
        });
    
    Game.main_player.registerMouseEntities(mouse_pos, move_icon);
		
    Game.fellhound = Crafty.e("Fellhound")
        .at(x_start + 15, y_start + 15);
		//.setTarget(Game.main_player);

    console.log("fellhound speed: " + Game.fellhound.speed);
        
    //var gui = new dat.GUI();
    //gui.add(Game.fellhound, 'speed', 0, 10).listen();
    //gui.add(Game.fellhound, 'jerk', 0, 10).listen();
        
    Game.fellhound.setTarget(Game.main_player);
		
	// this event keeps the mousepos entity up to date with the correct coordinates
	Crafty.addEvent(this, "mousemove", function(e) {
		//console.log("MouseX " + e.clientX + " MouseY: " + e.clientY);
		mouse_pos.attr({ x: e.clientX - Crafty.viewport.x - Game.canvas_left, y: e.clientY - Crafty.viewport.y - Game.canvas_top, w: 100, h: 20 });
	});
/*
	Crafty.addEvent(this, "mousedown", function(e) {

		var mousePos = mousepos.at();
		console.log("Clicked. with mouse position x:" + mousePos.x + " and y: " + mousePos.y);
		move_icon.moveTo(mousePos.x, mousePos.y);
		Game.main_player.moveTowards(mousePos.x, mousePos.y);
	});*/
    
    //console.log("fellhound speed: " + Game.fellhound.speed);	
    //console.log("main player speed: " + Game.main_player.speed);	  
    Crafty.viewport.follow(mouse_pos, 0, 0);
});

// Loading scene
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
    // Draw some text for the player to see in case the file
    //  takes a noticeable amount of time to load
    Crafty.e('2D, DOM, Text')
    .text('Loading...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() });
    
    // Load our sprite map image
    Crafty.load(['assets/basictiles.png', 'assets/64fun.png'], function(){
        Crafty.sprite(16, 'assets/basictiles.png', {
            spr_rock:    [7, 1],
            spr_sand:    [2, 1],
            spr_bush:    [6, 3],
            spr_village: [3, 5],
            spr_player:  [0, 8],
        });
        Crafty.sprite(64, 'assets/64fun.png', {
            spr_spell:    [8, 10],
        });
        Crafty.sprite(64, 'assets/ball.png', {
            spr_ball:    [0, 0],
        });        
        // Now that our sprites are ready to draw, start the game
        Crafty.scene('Main');
    })
});