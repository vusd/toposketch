function Animation()
{   // Handles everything related to animation editing and playback 
    // Settings
    this.target_fps = 60;
    this.millis_per_frame = 1000/this.target_fps;
    // Animation Data
    /*this.data_list = new Array(); // All animation data that has been loaded */
    this.data = new AnimData(); // Represents current animation data
    // Constants
    const PAUSE  = 0; // This is the default fallback state
    const PLAY   = 1; 
    const RECORD = 2
    // States
    this.mode = PAUSE;
    this.last_playback_time = time();
    // Cursor and Frame
    this.current_frame = 0;
    // Cursor should not be accessible to anything else. Use current_cursor_pos() instead
    var cursor_x = 0; 
    var cursor_y = 0;
    // JSON File Reading
    this.json_reader = new JSONReader();

    Animation.prototype.update = function()
    {   if(this.mode == RECORD)
        {   this.record(cursor_x, cursor_y);
        }
        else if(this.mode == PLAY)
        {
            if(time() - this.last_playback_time >= this.millis_per_frame)
            {
                this.go_to_frame(this.current_frame+1);
                this.last_playback_time = time();
            }
        }
    }

    Animation.prototype.update_cursor = function(input_x, input_y)
    {   cursor_x = input_x;
        cursor_y = input_y;
    }
    
    // Playback
    Animation.prototype.go_to_frame = function(frame)
    {   let new_frame = frame;
        if(new_frame > this.data.path.length-1)
        {   new_frame = 0;
        }
        else if(new_frame < 0)
        {   new_frame = 0;
        }
        this.current_frame = new_frame;
        timeline.update_length()
    }

    Animation.prototype.stop = function()
    {   this.pause();
        this.current_frame = 0;
    }

    Animation.prototype.play = function()
    {   if(!this.is_recording())
        {   this.mode = PLAY;
        }
    }

    Animation.prototype.pause = function()
    {
        this.mode = PAUSE;
    }

    Animation.prototype.toggle_play = function()
    {   // Toggles play/pause
        if(!this.is_recording())
        {
            if(this.is_playing())
            {   this.pause();
            }
            else
            {   this.play();
            }
        }
    }

    Animation.prototype.is_recording = function()
    {   if(this.mode == RECORD)
        {   return true;
        }
        else
        {   return false;
        }
    }

    Animation.prototype.is_playing = function()
    {   if(this.mode == PLAY)
        {   return true;
        }
        else
        {   return false;
        }
    }

    // Recording
    Animation.prototype.record = function(x, y)
    {   if(performance.now() - this.last_playback_time >= this.millis_per_frame)
        {   this.data.add_point(x,y);
            this.last_playback_time = performance.now();
            
            // Update position of current frame and update timeline
            this.current_frame = this.data.path.length-1;
            timeline.update_length();
        }
    }

    Animation.prototype.start_recording = function(x, y)
    {   this.mode = RECORD;
        this.data.clear();
        this.record(x,y);
    }

    Animation.prototype.stop_recording = function()
    {   this.pause();
        // Update position of current frame and update timeline
        this.current_frame = this.data.path.length-1;
        timeline.update_length();
    }

    Animation.prototype.current_cursor_pos = function()
    {   
        if(this.mode == RECORD || this.mode == PAUSE)
        {   return new Point(cursor_x, cursor_y);
        }
        else if(this.mode == PLAY)
        {
            if(this.data.path.length !== 0)
            {   return this.data.path[this.current_frame];
            }
            else
            {   return new Point(0, 0);
            }
        }
    }

}

function AnimData()
{   // Handles all animation data
    this.path = new Array();
    
    // Image Data
    this.image_list = new Array(); // Array of images (grid)
    this.current_grid_index = 0;
    this.image = null;
    this.image_shape = [1, 1]; // Default value 
    
    // Path Data
    this.path_list = new Array(); // Array of loaded paths
    this.drawn_path = new Array(); // Path that is drawn by player
    this.current_path_index = 0;
    
    var anim_data = this;

    this.is_example_path = false; // Flag for checking if an example path is loaded
    this.example_path_indices = new Array(); // Keep track of which indices in array contain example paths
    
    // Logging & Session
    this.image_session_started = false;
    this.image_session_start_time = Date.now();

    this.path_session_started = false;
    this.path_session_start_time = Date.now();

    // Data Properties
    Object.defineProperty(this, 'size',
    {   get: function(){return this.path.length;}
    });

    // JSON 
    AnimData.prototype.get_json = function()
    {
        let json_points = new Array();

        for(var p=0; p<this.path.length; p++)
        {   let json_point = new Array();
            json_point.push(this.path[p].x);
            json_point.push(this.path[p].y);
            json_points.push(json_point);
        }

        let json_output =
        {   points:json_points,
        };

        return JSON.stringify(json_output);
    }

    // Loads JSON path from local directory. 
    // For now, paths loaded from local dirs are treated as example paths.
    AnimData.prototype.load_local_path = function(path, callback)
    {   // From https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
         let request = new XMLHttpRequest();
         request.open("GET", path, true);
         request.onload = function (e)
         {
             if(request.readyState===4)
             {   if(request.status===200)
                 {   let read_json = JSON.parse(request.responseText);
                     anim_data.add_path(read_json, path);
                     anim_data.example_path_indices.push(anim_data.path_list.length-1);
                     //console.log(anim_data.example_path_indices);
                     if(callback)
                     {  callback();}
                 }
             }
         }
         request.send(null)
         //var my_JSON_object = JSON.parse(request.responseText);
         //alert (my_JSON_object.result);
    }

    // Loads JSON path file from user selected file object
    AnimData.prototype.load_path = function(files)
    {
        // This will run when json is loaded
        let on_load_json_callback = function(json, file)
        {
            try
            {   
                anim_data.add_path(json, file.name);
                anim_data.set_path(anim_data.path_list.length-1, true);
                log_event('UI', 'Path', 'Add Success', file.name);
            }
            catch(exception)
            {
                log_event('UI', 'Path', 'Add Fail', file.name);
            }
        }
        // Load the first file from the file list
        animation.json_reader.read_json(files[0],on_load_json_callback);
    }

    // Adds JSON data object as a path
    AnimData.prototype.add_path = function(json, name)
    {   // Load path from json file
        let new_path = new Array();
        let points = json.points;

        //this.clear();    
        for(var p=0; p<points.length; p++)
        {   new_path.push(new Point(points[p][0],points[p][1]));
        }
        this.path_list.push([new_path, name]);
        //console.log(name);
    }

    // Point operations
    AnimData.prototype.add_point = function(x, y)
    {   // Adds a Point object to this.path
        this.path.push(new Point(x,y));

        if(this.is_example_path){this.is_example_path = false;}
    }

    AnimData.prototype.clear = function()
    {   // Resets this.path
        this.path_session_end();

        this.path = new Array();
        play_button.update_state();

        if(this.is_example_path){this.is_example_path = false;}
    }

    AnimData.prototype.add_local_grid_image = function(src, rows, cols)
    {   // Adds a grid image to image_list
        this.add_grid_image(src, rows, cols, src, false);
    }

    AnimData.prototype.add_grid_image = function(src, rows, cols, name, new_session)
    {   // Adds a grid image to image_list
        try
        {   let new_image_shape = [rows, cols];
            let new_image = new Image();
            new_image.src = src;
            
            let image_data = {};
            image_data.image = new_image;
            image_data.shape = new_image_shape;

            this.image_list.push([image_data, name]);

            this.set_grid(this.image_list.length-1, new_session);
            if(new_session)
            { 
                log_event('UI', 'Grid', 'Add Success', name);        
            }
        }
        catch(exception)
        {   console.log('Could not add grid image!');
            if(new_session)
            { 
                log_event('UI', 'Grid', 'Add Fail', name);        
            }
        }
        //console.log(image_data.shape);
        //console.log(this.image_list.indexOf(image_data));
    }

    AnimData.prototype.next_grid = function()
    {
        this.set_grid((this.current_grid_index+1)%this.image_list.length, true);
    }

    AnimData.prototype.prev_grid = function()
    {
        let new_index = this.current_grid_index-1 < 0 ? this.image_list.length-1: this.current_grid_index-1;
        this.set_grid(new_index, true);
    }

    AnimData.prototype.set_grid = function(index, new_session)
    {   // Sets the grid
        if(index < this.image_list.length)
        {   
            if(new_session)
            {
                this.image_session_start();
            }

            let image_data = this.image_list[index][0]; 
            this.image = image_data.image;
            this.image_shape = image_data.shape;    
            this.current_grid_index = index;   

            //console.log(this.image_list[index][1]);
        }
        else return; 
    }

    AnimData.prototype.next_path = function()
    {
        this.set_path((this.current_path_index+1)%this.path_list.length, true);
    }

    AnimData.prototype.prev_path = function()
    {
        let new_index = this.current_path_index-1 < 0 ? this.path_list.length-1: this.current_path_index-1;
        this.set_path(new_index, true);
    }

    AnimData.prototype.set_path = function(index, new_session)
    {   // Sets the path
        if(index < this.path_list.length)
        {
            if(new_session)
            {
                this.path_session_start();
            }

            let was_playing = animation.is_playing();
            animation.stop();
            play_button.update_state();   

            timeline.update_length();
            this.path = this.path_list[index][0];  
            this.current_path_index = index;

            if(this.example_path_indices.indexOf(index) != -1)
            {   //console.log('Path ' + index + ' is an example path');
                this.is_example_path = true;
            }

            if(was_playing)
            {   animation.play();
            }
        }
        else return; 
    }

    /*
    AnimData.prototype.set_grid_image = function(src, rows, cols)
    {   // Sets up image
        this.image = new Image();
        this.image.src = src;
        this.image_shape = [rows, cols]; 
    }*/

    AnimData.prototype.get_grid_position = function(amt_x, amt_y)
    {   // Returns the area of the image to show given amt_x & amt_y (0 to 1.0)
        // Find the size of a each grid square
        let div_x = this.image.width / this.image_shape[0];
        let div_y = this.image.height/ this.image_shape[1];
        // Find out which grid square to display
        let loc_x = Math.floor(amt_x * this.image_shape[0]);
        let loc_y = Math.floor(amt_y * this.image_shape[1]);
        // Make sure that grid square is between 0 and grid_shape-1
        if(loc_x < 0){loc_x = 0};
        if(loc_x > this.image_shape[0]-1){loc_x = this.image_shape[0]-1};
        if(loc_y < 0){loc_y = 0};
        if(loc_y > this.image_shape[1]-1){loc_y = this.image_shape[1]-1};
        // return the right part of the face_grid
        var grid_position = 
        {   x: loc_x*div_x,
            y: loc_y*div_y,
            w: div_x,
            h: div_y,
        };
        return grid_position;
    }

    AnimData.prototype.current_image_name = function()
    {   let result;
        try
        {
            result = this.image_list[this.current_grid_index][1];
            return result;
        }
        catch(exception)
        {
            return null;
        }
    }

    AnimData.prototype.current_path_name = function()
    {   let result;
        try
        {
            result = this.path_list[this.current_path_index][1];
            return result;
        }
        catch(exception)
        {
            return null;
        }
    }

    // Logging
    AnimData.prototype.path_session_start = function()
    {
        if(this.path_session_started)
        {
            this.path_session_end();
        }
        this.path_session_start_time = Date.now();
        this.path_session_started = true;
    }

    AnimData.prototype.path_session_end = function()
    {
        if(this.path_session_started)
        {
            log_event('Paths', 'Session', this.current_path_name(), Date.now() - this.path_session_start_time);
            this.path_session_started = false;
        }
    }

    //
    AnimData.prototype.image_session_start = function()
    {
        if(this.image_session_started)
        {
            this.image_session_end();
        }
        this.image_session_start_time = Date.now();
        this.image_session_started = true;
    }

    AnimData.prototype.image_session_end = function()
    {
        if(this.image_session_started)
        {
            log_event('Grids', 'Session', this.current_image_name(), Date.now() - this.image_session_start_time);
            this.image_session_started = false;
        }
    }
}

// Point Class
function Point(x, y)
{   this.x = x;
    this.y = y;
}

