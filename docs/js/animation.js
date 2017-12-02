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
        play_button.update_state();
    }

    Animation.prototype.pause = function()
    {
        this.mode = PAUSE;
        play_button.update_state();
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
