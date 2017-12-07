function Display()
{
    var canvas = new Canvasy('anim-display'); // Canvasy 
    var context = canvas.context; // Canvas context
    
    Display.prototype.setup = function()
    {   
    }

    Display.prototype.update = function()
    {   
        let frame_cursor = animation.current_cursor_pos();
        this.display_face(frame_cursor.x, frame_cursor.y);
    }

    Display.prototype.display_face = function(amt_x, amt_y)
    {   
        let grid_pos = animation.data.get_grid_position(amt_x, amt_y);
        try
        {   context.drawImage(animation.data.image,
                grid_pos.x, grid_pos.y, grid_pos.w, grid_pos.h, 
                0, 0, canvas.width, canvas.height);
        }
        catch(e)
        {
            console.log(e);
        }
        
        /*
        // Displays part of the Animation.data.image based on amt_x & amt_y (0 to 1.0)
        // Find the size of a each grid square
        let div_x = animation.data.image.width / animation.data.image_shape[0];
        let div_y = animation.data.image.height/ animation.data.image_shape[1];
        // Find out which grid square to display
        let loc_x = Math.floor(amt_x * animation.data.image_shape[0]);
        let loc_y = Math.floor(amt_y * animation.data.image_shape[1]);
        // Make sure that grid square is between 0 and grid_shape-1
        if(loc_x < 0){loc_x = 0};
        if(loc_x > animation.data.image_shape[0]-1){loc_x = animation.data.image_shape[0]-1};
        if(loc_y < 0){loc_y = 0};
        if(loc_y > animation.data.image_shape[1]-1){loc_y = animation.data.image_shape[1]-1};
        // Show the right part of the face_grid
        context.drawImage(animation.data.image,
                          loc_x*div_x, loc_y*div_y, div_x, div_y, 
                          0, 0, canvas.width, canvas.height);*/
    }

    // Grid properties
    Object.defineProperty(this, 'context',
    {   get: function(){return context},
    });

    Object.defineProperty(this, 'canvas',
    {   get: function(){return canvas},
    });

    this.setup();
}