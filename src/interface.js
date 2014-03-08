Interface = {

    //mouseX: 0,
    //mouseY: 0,
	
	/*
    mousePos: function (e) {
        Interface.mouseX = e.pageX - 2;
        Interface.mouseY = e.pageY - 2;
        //Interface.mousey.attr({"x": Interface.mouseX - 5, "y": Interface.mouseY - 5});
        //console.log("Mouse moved (" + Interface.mouseX + "," + Interface.mouseY + ")");
        return true;
    },
    
	getMousePos: function () {
		return {"x": Interface.mouseX, "y":Interface.mouseY};
	}, */

    init: function () {
        //document.onmousemove = function (e) {Interface.mousePos(e);};

        var viewport_width = window.innerWidth - 64 ,
            viewport_height = window.innerHeight - 64;
        
        var tile_size = 16;
        var num_tiles_width = Math.floor(viewport_width / tile_size);
        var num_tiles_height= Math.floor(viewport_height / tile_size);        

        // start crafty
        var crafty_div = document.getElementById('cr-stage');
        var position = crafty_div.getBoundingClientRect();
        var x = position.left;
        var y = position.top;
        Game.init(viewport_width, viewport_height, x, y, tile_size);       
    },
}