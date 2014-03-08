// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
    init: function() {
        this.attr({
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height
        })
    },

    // Locate this entity at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
        } else {
            this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
            return this;
        }
    },
	
	getDirection: function(x, y) {
        var xDifference = this.x/Game.map_grid.tile.width - x;
        var yDifference = this.y/Game.map_grid.tile.height - y;

        //console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
        //console.log("hypDist: " + hypDist);
        //console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));
        return Math.atan2(xDifference, yDifference);
    },	
	
});




// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
    init: function() {
        this.requires('2D, Canvas, Grid');
    },
});



Crafty.c('Rock', {
    init: function() {
        this.requires('Actor, Solid, spr_rock');
    },
});

Crafty.c('Sand', {
    init: function() {
        this.requires('Actor, spr_sand');
    },
});

Crafty.c("Endpoint", {
    init: function() {
        this.requires('Actor, spr_spell, SpriteAnimation')
			.reel('Explode',  64, [[8, 10], [9,10], [10,10]])
			.animate('Explode', 1);
    },
	moveTo: function (x, y) {
		this.attr({"w":64, "h":64});
		var x_offset = this._w / Game.map_grid.tile.width / 2;
		var y_offset = this._h / Game.map_grid.tile.height / 2;
		console.log("_w: " + this._w + " x_offset: " + x_offset);
		console.log("_h: " + this._h + " y_offset: " + y_offset);
		this.at(x - x_offset, y - y_offset)
		    .animate('Explode', 1);

	}
});

Crafty.c("Explosion", {
    init: function() {
        this.requires('Actor, spr_spell, SpriteAnimation')
			.reel('Explode',  64, [[8, 10], [9,10], [10,10]])
			.animate('Explode', 1)
		    .bind('EnterFrame', function () {
				if (! this.isPlaying())
					this.destroy();
			}); 
    },
});

Crafty.c("Projectile", {
    init: function() {
        this.requires('Actor, Collision, spr_spell, SpriteAnimation')
		    .bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= (Game.playable_height - 10))
					this.destroy();

				if (this.x <= 0 || this.x >= (Game.playable_width - 10))
					this.destroy();

				this.x += this.dX;
				this.y += this.dY;
			})
			.stopOnSolids();

    },
	projectile: function(size, direction, speed) {
        direction = direction;
		var additionaldX = Math.sin(direction) * speed;
		var additionaldY = Math.cos(direction) * speed;
		//console.log("Accelerating dX: " + additionaldX + " dY: " + additionaldY);
		this.attr({ dX: additionaldX, dY: additionaldY });
		return this;
	},

    stopOnSolids: function() {
        this.onHit('Solid', this.explode);
    
        return this;
    },
	
	explode: function () {
	    var pos = this.at();
		Crafty.e("Explosion").at(pos.x, pos.y);
		this.destroy();
	},
});

Crafty.c('Ball', {
    init: function() {
        this.requires('Actor, Motion, spr_spell');
        this.speed = 10;
        this.target = undefined;
        
		this.bind('EnterFrame', function () {
            if(this.target === undefined)
                return;

            //console.log("distance_left_x - dx: " + (this.distance_left_x - this.dx));
            //console.log("distance_left_y - dy: " + (this.distance_left_y - this.dy));
            
            if((this.dx || this.dy) 
               && (this.distance_left_x - this.dx <= 0) && (this.distance_left_y - this.dy <= 0)) {
               this.destroy();
               this.target.catchBall();
            }  
            var targetPos = this.target.at();
            //console.log("Accelerating towards target.");
            this.moveTowards(targetPos.x, targetPos.y, this.speed);        
            
		});
    },
    
	setTarget: function (entity) {
		this.target = entity;
	},
    
});


Crafty.c('MotionVectors', {
    init: function() {

        this.vVelocity = Crafty.e('2D, Canvas, Grid, Color')
            .attr({"x":10, "y":10, "w": 10, "h": 10})
            .color('#F5021B');
            
        //this.velocity_text = Crafty.e('2D, Canvas, Grid, Color, Text');   
        this.vAcceleration = Crafty.e('2D, Canvas, Grid, Color')
            .color('#43F502');
            
		this.bind('EnterFrame', function () {
            this.vVelocity.x += this.dx;
            this.vVelocity.y += this.dy;
            this.vAcceleration.x += this.dx;
            this.vAcceleration.y += this.dy;
		});
    },
    
    
});

Crafty.c('Motion', {
    init: function() {
        this.requires('Actor');
        
		this.distance_left_x = 0;
		this.distance_left_y = 0;
		this.dx = 0;
		this.dy = 0;
        this.target_direction = 0;
		this.direction = 0;
        this.turn_direction = 1;
		this.turn_speed = 1;

		this.bind('EnterFrame', function () {
            //if(this.direction != this.target_direction) {
            //    this.direction += this.turn_direction * this.turn_speed;
            //}
            //else {
                this.x += this.dx;
                this.y += this.dy;
            //}

		});
    },
    
    /*
    turnTowards: function (direction) {
        var max = Math.max(this.target_direction, this.direction);
        var min = Math.min(this.target_direction, this.direction);
        
        var dist1 = max - min;
        var dist2 = min + 2 * Math.PI - max;
        
        if(dist1 < dist2) {
            this.turn_direction = 1;
        } else {
            this.turn_direction = -1;
        }
    }, */

	accelerateTowards: function (x, y, speed) {

		var pos = this.at();
		this.distance_left_x = Math.abs(x - pos.x) * Game.map_grid.tile.width;
		this.distance_left_y = Math.abs(y - pos.y) * Game.map_grid.tile.height;
		//this.distance_left = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
		//console.log("Distance to walk: " + this.distance_left);
        this.direction = this.getDirection(x, y);
		//console.log("direction: " + this.direction);
        this.dx += -Math.sin(this.direction) * speed;
        this.dy += -Math.cos(this.direction) * speed;
        

    },
    
    
  	moveTowards: function (x, y, speed) {
		var pos = this.at();
		this.distance_left_x = Math.abs(x - pos.x) * Game.map_grid.tile.width;
		this.distance_left_y = Math.abs(y - pos.y) * Game.map_grid.tile.height;
		//this.distance_left = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
		//console.log("Distance to walk: " + this.distance_left);
        this.target_direction = this.getDirection(x, y);
		//console.log("direction: " + this.direction);
		this.dx = -Math.sin(this.target_direction) * speed;
		this.dy = -Math.cos(this.target_direction) * speed;
		//console.log("dx: " + this.dx + ", dy: " + this.dy);
		//console.log("distance_left_x: " + this.distance_left_x + ", frames to complete: " + this.distance_left_x / this.dx);
		//console.log("distance_left_y: " + this.distance_left_y + ", frames to complete: " + this.distance_left_y / this.dy);

    },
	
	
    calculateVelocity: function () {
        return Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
    
    },
    
    stopOnSolids: function() {
        this.onHit('Solid', this.stopMovement);
        return this;
    },
    
    // Stops the movement
    stopMovement: function() {
		this.direction = 10; // special direction to signify stopped
        if (this.dx || this.dy) {
            this.x -= this.dx;
            this.y -= this.dy;
			this.dx = 0;
			this.dy = 0;
            this.distance_left_x = 0;
            this.distance_left_y = 0;
        }
    }  
});

// This is the player-controlled character
Crafty.c('Fellhound', {
    init: function() {
        this.requires('Actor, Collision, Motion, spr_player, SpriteAnimation, ')
            .reel('PlayerMovingUp',    8, [[4, 8], [5,8]])
            .reel('PlayerMovingRight', 8, [[2, 8], [3,8]])
            .reel('PlayerMovingDown',  8, [[0, 8], [1,8]])
            .reel('PlayerMovingLeft',  8, [[6, 8], [7,8]]);
    
		this.target = undefined;
        this.jerk = 0;
        this.acceleration = 0.01;
        this.speed = 1;
        
		this.bind('EnterFrame', function () {
			if(this.target === undefined)
				return;
				
			var targetPos = this.target.at();

            
			this.accelerateTowards(targetPos.x, targetPos.y, this.acceleration);
		
			var dir = Math.abs(this.direction);
			if (dir < Math.PI / 4) {
				if (! this.isPlaying('PlayerMovingUp'))
					this.animate('PlayerMovingUp', -1);			
			}
			else if (dir < 3 * Math.PI / 4) {
				if (this.direction < 0) {
					if (! this.isPlaying('PlayerMovingRight')) 
						this.animate('PlayerMovingRight', -1);				
				}
				else {
					if (! this.isPlaying('PlayerMovingLeft')) 
						this.animate('PlayerMovingLeft', -1);						
				}
			}
			else if (dir < Math.PI) {
				if (! this.isPlaying('PlayerMovingDown')) 
					this.animate('PlayerMovingDown', -1);
			}
			else { // dir is set to 10 to signify stopped
				this.pauseAnimation();
			}
            
            //if(this.speed <= 1) {
            //    this.speed += this.acceleration;
            //}
            //this.acceleration += 0.0001;
		});
        
        this.bind('BallThrown', function (entity) {
            this.setTarget(entity);
        });
    },
    
	
	setTarget: function (entity) {
		this.target = entity;
        console.log("Changing targets.");
	    this.acceleration = 0.001;
	},
	
    
    stopOnSolids: function() {
        this.onHit('Solid', this.stopAcceleration);
        return this;
    },
});


Crafty.c('Controllable', {
    init: function() {
        this.requires('Keyboard, PlayerCharacter');
        
        this.mouse_pos = undefined;
        this.mouse_pointer = undefined;

    },
    
    registerMouseEntities: function (mouse_pos, mouse_pointer) {
        console.log("Registering Mouse Entities");
        this.mouse_pos = mouse_pos;
        this.mouse_pointer = mouse_pointer;
        this.registerKeyPresses();
        this.registerMouseDown();
    },
 
    registerKeyPresses: function () {
        this.bind("KeyDown", function(e) {
            if(!this.mouse_pos)
                return;
                
            if (this.isDown('SPACE')) {
                var playerPos = this.at();
                Crafty.e('Projectile')
                    .at(playerPos.x, playerPos.y)
                    .projectile(1, this.mouse_pos.getDirection(playerPos.x, playerPos.y), 10);
            }
            if (this.isDown('A')) {
                this.throwBall(Game.other_player);
            }
		});   
    },
    
    registerMouseDown: function () {
        Crafty.addEvent(this, "mousedown", function(e) {

            var mousePos = this.mouse_pos.at();
            console.log("Clicked. with mouse position x:" + mousePos.x + " and y: " + mousePos.y);
            this.mouse_pointer.moveTo(mousePos.x, mousePos.y);
            this.moveTowards(mousePos.x, mousePos.y);
        });    
    },
});


// This is the player-controlled character
Crafty.c('PlayerCharacter', {
    init: function() {
        this.requires('Actor, Collision, spr_player, SpriteAnimation, ')
            .stopOnSolids()
            .reel('PlayerMovingUp',    8, [[4, 8], [5,8]])
            .reel('PlayerMovingRight', 8, [[2, 8], [3,8]])
            .reel('PlayerMovingDown',  8, [[0, 8], [1,8]])
            .reel('PlayerMovingLeft',  8, [[6, 8], [7,8]]);
    
        this.ball = false;
		this.targetX = this.at().x;
		this.targetY = this.at().y;
		this.distance_left_x = 0;
		this.distance_left_y = 0;
		this.dx = 0;
		this.dy = 0;
        this.max_speed = 5;
		this.speed = 0;
		this.direction = 0;
		this.bind('EnterFrame', function () {

		
			var dir = Math.abs(this.direction);
			if (dir < Math.PI / 4) {
				if (! this.isPlaying('PlayerMovingUp'))
					this.animate('PlayerMovingUp', -1);			
			}
			else if (dir < 3 * Math.PI / 4) {
				if (this.direction < 0) {
					if (! this.isPlaying('PlayerMovingRight')) 
						this.animate('PlayerMovingRight', -1);				
				}
				else {
					if (! this.isPlaying('PlayerMovingLeft')) 
						this.animate('PlayerMovingLeft', -1);						
				}
			}
			else if (dir < Math.PI) {
				if (! this.isPlaying('PlayerMovingDown')) 
					this.animate('PlayerMovingDown', -1);
			}
			else { // dir is set to 10 to signify stopped
				this.pauseAnimation();
			}
		
            
        
			this.distance_left_x -= Math.abs(this.dx);
			this.distance_left_y -= Math.abs(this.dy);
			//if(this.dx != 0 && this.dy != 0) {
			//	console.log("distance_left_x: " + this.distance_left_x + ", frames to complete: " + this.distance_left_x / this.dx);
			//	console.log("distance_left_y: " + this.distance_left_y + ", frames to complete: " + this.distance_left_y / this.dy);
			//}
			if((this.dx != 0 && this.dy != 0) && 
			   (this.distance_left_x <= 0 && this.distance_left_y <= 0)) {
				
			    this.at(this.targetX, this.targetY);
				this.pauseAnimation();
				this.stopMovement();
			} else {
				this.x += this.dx;
				this.y += this.dy;
			
			}
			
		});
    },
    
	throwBall: function (entity) {
        if(this.ball === false) {
            console.log("exiting");
            return;
        }
        
        Crafty.trigger('BallThrown', entity);
        this.ball = false;        
        var pos = this.at();
        Crafty.e('Ball')
            .at(pos.x, pos.y)
            .setTarget(entity);
    },
    
    catchBall: function () {
        this.ball = true; 
    },

    
	moveTowards: function (x, y) {
        this.speed = this.max_speed;
		this.targetX = x;
		this.targetY = y;

		var pos = this.at();
		this.distance_left_x = Math.abs(x - pos.x) * Game.map_grid.tile.width;
		this.distance_left_y = Math.abs(y - pos.y) * Game.map_grid.tile.height;
		//this.distance_left = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
		//console.log("Distance to walk: " + this.distance_left);
        this.direction = this.getDirection(x, y);
		console.log("direction: " + this.direction);
		this.dx = -Math.sin(this.direction) * this.speed;
		this.dy = -Math.cos(this.direction) * this.speed;
		console.log("_movement(x: " + this.dx + ", y: " + this.dy + ")");
		console.log("distance_left_x: " + this.distance_left_x + ", frames to complete: " + this.distance_left_x / this.dx);
		console.log("distance_left_y: " + this.distance_left_y + ", frames to complete: " + this.distance_left_y / this.dy);
		
		
        //console.log("xDifference: " + xDifference + " yDifference: " + yDifference);
        //console.log("hypDist: " + hypDist);
        //console.log("Angle: " + Math.atan2(xDifference, yDifference) * (180 / Math.PI));

    },
	
	
    // Registers a stop-movement function to be called when
    //  this entity hits an entity with the "Solid" component
    stopOnSolids: function() {
        this.onHit('Solid', this.stopMovement);
        return this;
    },
    
    // Stops the movement
    stopMovement: function() {
        this.speed = 0;
		this.direction = 10; // special direction to signify stopped
        if (this.dx || this.dy) {
            this.x -= this.dx;
            this.y -= this.dy;
			this.dx = 0;
			this.dy = 0;
			this.targetX = this.at().x;
			this.targetY = this.at().y;
        }
    }
});
