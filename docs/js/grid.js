function Grid()
{
    var canvas  = new Canvasy('anim-grid'); // Canvasy
    var context = canvas.context; // Canvas context
    var mouse_over = false;
    var grid = this;

    // Scrub session
    this.scrub_session_started = false;
    this.scrub_session_start_time = Date.now();

    // Recording session
    this.draw_session_started = false;
    this.draw_session_start_time = Date.now();

    var mouse_down = function(event)
    {
        animation.start_recording
            ( canvas.mouse_x/ canvas.width, 
              canvas.mouse_y/ canvas.height );
         
        grid.scrub_session_end();
        grid.draw_session_start();

        event.preventDefault();
    }

    var mouse_up = function()
    {   
        if(animation.is_recording())
        {
            grid.draw_session_end();
        }
        
        animation.stop_recording();

        if(!animation.is_playing() && !animation.is_recording())
        {
            grid.scrub_session_start();
        }
    }

    var mouse_enter = function()
    {   mouse_over = true;
        
        if(!animation.is_playing() && !animation.is_recording())
        {   
            grid.scrub_session_start();
        }
    }

    var mouse_leave = function()
    {   mouse_over = false;

        if(!animation.is_playing())
        {   
            grid.scrub_session_end();
        }
    }

    // Initialization & Update
    Grid.prototype.setup = function()
    {
        canvas.setup_mouse_events();
        canvas.mouse_down = mouse_down;
        canvas.mouse_up = mouse_up;
        canvas.mouse_enter = mouse_enter;
        canvas.mouse_leave = mouse_leave;

        // Listen for mouseup event over doc to make sure that recording
        // is still stopped when mouse is released outside of grid 
        document.addEventListener('mouseup', function (e) 
        {
            if(animation.is_recording())
            {
                grid.draw_session_end();
                animation.stop_recording();
            }
            
        }, false);
    }

    Grid.prototype.update = function()
    {   // All runtime stuff goes here
        this.draw_background();
        this.draw_recording();
        this.draw_overlay();
    }

    // Drawing
    Grid.prototype.draw_background = function()
    {   // Draws background elements of the grid
        let alphas = 0.5;
        
        if(!mouse_over && animation.data.path.length == 0 || animation.data.path == null)
        {   alphas = 0.25;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);  
        context.fillStyle = 'rgb(0,0,0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = alphas;
        context.drawImage(animation.data.image, 0, 0, canvas.width, canvas.height); 
        context.globalAlpha = 1;

    }

    Grid.prototype.draw_overlay = function()
    {
        if(!mouse_over && animation.data.path.length == 0 || animation.data.path == null || animation.data.is_example_path)
        {   context.font = "1.6em Open Sans";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText("Draw here to animate", canvas.width/2, canvas.height/2); 
        }  
    }

    Grid.prototype.draw_recording = function()
    {   // Draws path from animation.data
        if(animation.data.size > 0)
        {   let path = animation.data.path;   
            
            //context.beginPath();
            context.strokeStyle = 'rgb(255,0,0)';
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.lineWidth = 5;

            for(var p=0; p<path.length-1; p++)
            {   //let stroke_colour = (p/path.length)*200.0;
                //console.log(p/path.length);
                //context.strokeStyle = 'rgb('+(stroke_colour+55)+','+0+','+0+')';
                
                context.beginPath();
                context.moveTo(path[p].x*canvas.width, path[p].y*canvas.height);
                context.lineTo(path[p+1].x*canvas.width, path[p+1].y*canvas.height);
                context.stroke(); 
                context.closePath();

                context.fillStyle = 'rgb(100,0,0)';
                context.beginPath();
                context.arc(path[p].x * canvas.width, 
                            path[p].y * canvas.height, 
                            1, 0, Math.PI * 2, true); 
                context.fill();
            } 

            //context.stroke(); 
            //context.closePath();

            // Draw position of current cursor
            let cur_x = path[animation.current_frame].x * canvas.width;
            let cur_y = path[animation.current_frame].y * canvas.height;

            context.fillStyle = 'rgb(255,255,255)';
            context.beginPath();
            context.arc(cur_x, cur_y, 8, 0, Math.PI * 2, true); // Frame cursor
            context.fill();
        }
    }

    // Utilities
    Grid.prototype.get_context = function()
    {   return context;
    }

    Grid.prototype.get_canvas = function()
    {   return canvas;
    }

    // Grid properties
    Object.defineProperty(this, 'context',
    {   get: function(){return context},
    });

    Object.defineProperty(this, 'canvas',
    {   get: function(){return canvas},
    });

    // Logging
    Grid.prototype.scrub_session_start = function()
    {
        if(this.scrub_session_started)
        {
            this.scrub_session_end();
        }
        this.scrub_session_start_time = Date.now();
        this.scrub_session_started = true;
    }

    Grid.prototype.scrub_session_end = function()
    {
        if(this.scrub_session_started)
        {
            log_event('Recording', 'Scrub', animation.data.current_image_name(), Date.now() - this.scrub_session_start_time);
            this.scrub_session_started = false;   
        }
    }

    Grid.prototype.draw_session_start = function()
    {
        if(this.draw_session_started)
        {
            this.draw_session_end();
        }
        this.draw_session_start_time = Date.now();
        this.draw_session_started = true;
    }

    Grid.prototype.draw_session_end = function()
    {
        if(this.draw_session_started)
        {
            log_event('Recording', 'Draw', animation.data.current_image_name(), Date.now() - this.draw_session_start_time);
            this.draw_session_started = false;   
        }
    }


    this.setup();
}