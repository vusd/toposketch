function Renderer()
{   // Handles rendering of Animation.data
    
    // GIF Encoder. This is used if web workers are not available 
    this.gif_encoder = new GIFEncoder();
    
    // Web worker GIF Encoder. This is used if web workers are available. 
    // Allows encoding to be done in background and not lock up window
    this.render_worker = null; 

    // Render settings
    this.render_length = 0; // In frames
    this.rendering = false;
    this.rendering_frame = 0;

    // Animation data
    this.animation_data = null; // Copy (not reference) of animation data
    this.rendered_canvas = new Canvasy(); // Where encoded frames will be rendered to
    this.rendered_context = this.rendered_canvas.context;
    this.render_output = null;

    var renderer = this; // A reference to the renderer (use to overcome this scope in callback method)

    Renderer.prototype.setup = function()
    {  
        this.rendered_canvas.width = 256;
        this.rendered_canvas.height = 256;
        /*
        this.rendered_context.fillStyle = 'rgb(100,200,255)';
        this.rendered_context.fillRect(0,0,this.rendered_canvas.width, this.rendered_canvas.height);
        this.rendered_context.drawImage(animation.data.image,0,0,500,500);
        this.rendered_context.fillStyle = 'rgb(25,0,0)';
        this.rendered_context.fillRect(0,0,this.rendered_canvas.width/2, this.rendered_canvas.height/2);
        */
    }

    // Render Worker
    this.render_worker_onmessage = function(event)
    {   // Messages received from render workers
        let command = event.data[0];
        let content = event.data[1];

        if(command == 'addframe')
        {   
            //console.log('Added frame ' + content);
            renderer.when_frame_added();
        }

        if(command == 'show')
        {
            //console.log('Showing final result');
            renderer.show_render(content);
        }
    }

    // Utilities
    Renderer.prototype.update_status = function(message)
    {   //console.log(message);
        render_button.set_label(message);
    }

    // Render Methods     
    Renderer.prototype.setup_render = function(input_anim, frames)
    {   
        if(input_anim.path.length == 0)
        {    return;
        }

        this.set_animation_data(input_anim);
        if(frames == -1)
        {   this.render_length = this.animation_data.path.length;
        }
        else
        {   this.render_length = frames;
        }
        
        // Set the worker with the same properties if available
        if(window.Worker)
        {
            if(this.render_worker != null)
            {   // If there already is a worker active, kill it
                this.render_worker.terminate();
                console.log('Render worker killed');
            }

            console.log('Web Workers available, will use workers for rendering');
            this.render_worker = new Worker('./js/render_worker.js');
            this.render_worker.onmessage = this.render_worker_onmessage;

            let content =   {repeat: 0,
                            delay: Math.floor(animation.millis_per_frame)};
            this.render_worker.postMessage(['setup', content]);
        }
        else
        {
            this.gif_encoder.setRepeat(0);
            this.gif_encoder.setDelay(Math.floor(animation.millis_per_frame)); 
            this.gif_encoder.setFrameCallback(this.when_frame_added);
        }
    }

    Renderer.prototype.start_render = function()
    {
        if(this.animation_data == null)
        {   this.update_status('Nothing to render. Draw something to render!');
            render_button.reset_label_in(3000);
            return;
        }
        else if(this.animation_data.path.length > 0)
        {   this.rendering_frame = 0;
            this.rendering = true;

            if(this.render_worker != null)
            {   this.render_worker.postMessage(['start','']);
            }
            else
            {   this.gif_encoder.start();
            }

            this.update_status('Starting render...');
            this.render_frame(this.rendering_frame);   
        }
        else
        {   this.update_status('Nothing to render. Draw something to render!');
            return;
        }
    }

    Renderer.prototype.render_frame = function(frame)
    {   // This method is continuously called until rendering is complete
        
        if(frame < this.animation_data.path.length)
        {   this.update_status('Rendered ' + frame + ' / ' + (this.animation_data.path.length-1));
            // If the frame to render is less than path length
            let current_pos = this.animation_data.path[frame];
            let grid_pos = this.animation_data.get_grid_position(current_pos.x, current_pos.y);
            
            // Draw image onto render context
            // this.rendered_context.fillStyle = 'rgb('+ Math.random()*255  +',200,255)';
            this.rendered_context.fillStyle = 'rgb('+ Math.floor(255*Math.random()) +',200,255)';
            this.rendered_context.fillRect(0,0,this.rendered_canvas.width, this.rendered_canvas.height);
            
            this.rendered_context.drawImage(this.animation_data.image,
                                            grid_pos.x, grid_pos.y, grid_pos.w, grid_pos.h, 
                                            0, 0, this.rendered_canvas.width, this.rendered_canvas.height);
            
            let image_data = this.rendered_context.getImageData(0,0,this.rendered_canvas.width,this.rendered_canvas.height);
            
            if(this.render_worker != null)
            {   let content = {image_data:image_data, frame:frame}
                this.render_worker.postMessage(['addframe',content]);
            }
            else
            {
                this.gif_encoder.setSize(image_data.width,image_data.height);
                this.gif_encoder.addFrame(image_data.data, true);
            }
        }
        else
        {   this.update_status('Skipped: Frame does not exist!');
            this.finish_render();
        }
    }

    // Render Callback
    this.when_frame_added = function()
    {   // Rendering Callback after frame is added
        //renderer.update_status('FRAME ADDED, MOVING ON...');
        
        if(renderer.rendering_frame < renderer.render_length)
        {   renderer.rendering_frame++;
            renderer.render_frame(renderer.rendering_frame);
        }
        else
        {   renderer.finish_render();
        }
    }

    Renderer.prototype.finish_render = function()
    {
        if(this.render_worker != null)
        {
            this.render_worker.postMessage(['finish','']);
        }
        else
        {
            this.gif_encoder.finish();
            renderer.show_render(this.gif_encoder.stream().getData());
        }
    }

    Renderer.prototype.render_path_image = function()
    {
        let context = this.rendered_context;
        let canvas = this.rendered_canvas;
        //console.log(renderer.animation_data);
        let path = this.animation_data.path;

        context.clearRect(0,0,canvas.width, canvas.height);
        context.fillStyle = 'rgb(255,255,255)';
        context.fillRect(0,0,canvas.width,canvas.height);

        context.strokeStyle = 'rgb(0,0,0)';
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 5;

        for(var p=0; p<path.length-1; p++)
        {   context.beginPath();
            context.moveTo(path[p].x*canvas.width, path[p].y*canvas.height);
            context.lineTo(path[p+1].x*canvas.width, path[p+1].y*canvas.height);
            context.stroke(); 
            context.closePath();
        }

        // Draw position of current cursor
        let cur_x = path[0].x * canvas.width;
        let cur_y = path[0].y * canvas.height;

        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.arc(cur_x, cur_y, 8, 0, Math.PI * 2, true); // Frame cursor
        context.fill();

        let data_url = this.rendered_canvas.element.toDataURL();
        return data_url;
    }

    Renderer.prototype.show_render = function(binary)
    {   // Add path and rendered animation to a container and append to web page
        // Render Data
        // let render_output = 'data:image/gif;base64,'+encode64(binary); // Old method
        
        // Push a Piwik event (test)
        _paq.push(['trackEvent', 'render', 'finished', '']);
        
        // Convert b64 to blob for speed
        var blob = b64toBlob(encode64(binary),'image/gif');
        var animation_image = URL.createObjectURL(blob);
        let path_image = this.render_path_image();

        // Container + images
        let container = document.createElement('div'); // Container for render
        let animation = document.createElement('img'); // Animated image
        let path = document.createElement('img'); // Path overlay
        animation.src = animation_image;
        path.src = path_image;

        // Container Buttons
        let popout = document.createElement('button'); // Open in new window 
        let download = document.createElement('button'); // Download
        let download_link = document.createElement('a'); // Download Link
        let popout_image = document.createElement('img');
        let download_image = document.createElement('img');
        popout_image.src = './imgs/icons/ic_open_in_new_black_24px.svg';
        download_image.src = './imgs/icons/ic_file_download_black_24px.svg';

        // Setup popout https://stackoverflow.com/questions/27798126/how-to-open-the-newly-created-image-in-a-new-tab
        popout.onclick = function()
        {   
            let external_window = window.open('');
            external_window.document.write(animation.outerHTML);
        }
        // Append download info
        download_link.href=animation.src;
        download_link.target='_blank';
        download_link.download = 'animation.gif';

        container.classList.add('three');
        container.classList.add('columns');
        container.classList.add('render-result-container');
        animation.classList.add('render-result-animation');
        path.classList.add('render-result-path');
        popout.classList.add('tool-button');
        popout.classList.add('render-popout-button');
        download.classList.add('tool-button');
        download.classList.add('render-download-button')

        //link.appendChild(container);
        container.appendChild(path);
        container.appendChild(animation);
        container.appendChild(popout);
        popout.appendChild(popout_image);
        download_link.appendChild(download);
        container.appendChild(download_link);
        download.appendChild(download_image);
        
        document.getElementById('render-container').insertBefore(container,get_id('render-container').children[0]);
        
        get_id('renders-header').style.display = 'initial';
        get_id('render-container').style.display = 'initial';

        this.reset_render();
        this.update_status('Complete! Animation added to grid')
        render_button.reset_label_in(3000);
    }

    Renderer.prototype.stop_render = function()
    {           
        if(this.render_worker != null)
        {   this.render_worker.terminate();
            //this.render_worker.postMessage(['kill','']);
        }
        else
        {
            this.gif_encoder.finish();
        }
        this.reset_render();
        this.update_status('Render Animation');
    }

    Renderer.prototype.reset_render = function()
    {
        this.rendering = false;
        this.animation_data = null;
        this.rendering_frame = 0;
        this.render_length = 0;
    }

    Renderer.prototype.set_animation_data = function(input_anim)
    {   // Copies animation data
        this.animation_data = new AnimData();
        this.animation_data.image = input_anim.image;
        this.animation_data.image_shape[0] = input_anim.image_shape[0];
        this.animation_data.image_shape[1] = input_anim.image_shape[1];
        this.animation_data.path = Array.from(input_anim.path);
    }

    this.setup();
}
