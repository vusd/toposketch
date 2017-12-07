// UI
var timeline;
var play_button;
var save_json_button;
var load_json_button;
var render_button;
var load_grid_button;
var next_path_button;
var prev_path_button;
var clear_path_button;
var prev_grid_button;
var prev_next_button;
var dotdotdot = "...";

var generate_grid_dialog;

function Timeline()
{
    var element = document.getElementById('timeline');
    var frame_readout = document.getElementById('timeline-counter');
    var scrubbing = false;
    
    // Timeline Data
    Object.defineProperty(this, 'value',
    {   get: function(){return element.value;},
        set: function(value){element.value = value;}
    });

    Object.defineProperty(this, 'max',
    {   get: function(){return element.max;},
        set: function(value){element.max = value;}
    });

    // Methods
    Timeline.prototype.setup = function()
    {   element.onchange = this.on_change;
        element.oninput = this.on_change;
        element.onmouseup = this.on_up;
    }

    Timeline.prototype.on_up = function()
    {
        if(scrubbing)
        {   scrubbing = false;
            log_event('UI', 'Playback', 'Scrub');
        }
    }

    Timeline.prototype.on_change = function()
    {   animation.go_to_frame(Math.round(element.value));
        animation.pause();
        play_button.update_state();
        //console.log(element.clientLeft + element.clientWidth);

        if(!scrubbing)
        {   scrubbing = true;
        }
    }

    Timeline.prototype.update_length = function()
    {   // Update's timeline length to reflect the current animation state
        if(animation.data.path.length > 0)
        {   this.max = animation.data.path.length - 1;
            this.value = animation.current_frame;
        }
    }

    Timeline.prototype.update_width = function()
    {
        //element.style.width = '100%';
        //element.style.width = (element.clientWidth - play_button.element.clientWidth - 6) + 'px';
    }

    this.setup();
}

function RenderButton()
{   
    this.element = document.getElementById('render-button');
    var render_button = this;

    this.on_click = function()
    {   //console.log(renderer.rendering);
        if(!renderer.rendering)
        {
            renderer.setup_render(animation.data, animation.data.path.length-1);
            renderer.start_render();
        }
        else if(renderer.rendering)
        {   
            renderer.stop_render();
        }
    }

    RenderButton.prototype.set_label = function(message)
    {   this.element.innerHTML = message;
        if(renderer.rendering)
        {
            this.element.innerHTML = message + ' (Click to cancel)';
        }
    }

    RenderButton.prototype.reset_label_in = function(timer)
    {   
        setTimeout(
            function()
            {
                if(!renderer.rendering)
                {
                    render_button.set_label('Render Animation');
                }
            }, 
            timer
        );
    }

    RenderButton.prototype.setup = function ()
    {   
       this.element.onclick = this.on_click;
       this.set_label('Render Animation');
    }

    this.setup();
}

function PlayButton()
{   
    this.element = document.getElementById('play-button');
    var play_button = this;

    this.on_click = function()
    {   animation.toggle_play();
        play_button.update_state();

        if(animation.is_playing())
        {
            log_event('UI', 'Playback', 'Play');
        }
        else
        {
            log_event('UI', 'Playback', 'Pause');
        }
    }

    PlayButton.prototype.update_state = function ()
    {
        if(animation.is_playing())
        {   get_id('play-button-icon').src='./imgs/icons/ic_stop_black_24px.svg';
            //element.innerText = 'Pause';
        }
        else
        {   get_id('play-button-icon').src='./imgs/icons/ic_play_arrow_black_24px.svg';
            //element.innerText = 'Play';
        }
    }

    PlayButton.prototype.setup = function ()
    {   
        this.element.onclick = this.on_click;
        this.update_state();
    }

    this.setup();
}

function SaveJsonButton()
{   // Save Path
    var element = document.getElementById('save-json-button');
    var button = this;

    this.on_context_click = function(e)
    {
        button.append_json();
        log_event('UI', 'Path', 'Save');
    }

    this.on_click = function(e)
    {
        //console.log("Saving JSON");
        button.append_json(); // Allows "right click and save as" functionality
    }

    SaveJsonButton.prototype.append_json = function()
    {   // Get current json data from Animation.data and append it to link element
        // Adapted from: http://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        let json = animation.data.get_json();
        var data = "text/json;charset=utf-8," + encodeURIComponent(json);
        element.href = 'data:' + data;
    }
    SaveJsonButton.prototype.setup = function ()
    {   
        element.onclick = this.on_click;
        element.oncontextmenu = this.on_context_click;    
    }

    this.setup();
}

function LoadJsonButton()
{   // Load Path
    var element = document.getElementById('load-json-button');
    var button = this;

    this.on_change = function(e)
    {   // From: https://developer.mozilla.org/en/docs/Using_files_from_web_applications
        animation.data.load_path(e.target.files);
    }

    LoadJsonButton.prototype.setup = function ()
    {   
        element.onchange = this.on_change;
    }

    this.setup();
}



function NextPathButton()
{
    var element = document.getElementById('next-path-button');
    element.onclick = function()
    {
        log_event('UI', 'Path', 'Next');
        animation.data.next_path();
    }
}

function PrevPathButton()
{
    var element = document.getElementById('prev-path-button');
    element.onclick = function()
    {
        animation.data.prev_path();
        log_event('UI', 'Path', 'Prev');
    }
}

function ClearPathButton()
{
    var element = document.getElementById('clear-button');
    element.onclick = function()
    {
        animation.data.clear();
        log_event('UI', 'Path', 'Clear');
    }
}

function NextGridButton()
{
    var element = document.getElementById('next-grid-button');
    element.onclick = function()
    {
        animation.data.next_grid();
        log_event('UI', 'Grid', 'Next');
    }
}

function PrevGridButton()
{
    var element = document.getElementById('prev-grid-button');
    element.onclick = function()
    {
        animation.data.prev_grid();
        log_event('UI', 'Grid', 'Prev');
    }
}

function LoadGridButton()
{
    var element = document.getElementById('load-grid-button');
    var button = this;

    this.on_change = function(e)
    {   // From: https://stackoverflow.com/questions/12368910/html-display-image-after-selecting-filename
        let selected_file = e.target.files[0];
        
        let file_reader = new FileReader();

        file_reader.onload = function(e)
        {
            animation.data.add_grid_image(e.target.result, 7, 7, selected_file.name, true);
            //console.log(selected_file.name);
        }
        
        file_reader.readAsDataURL(selected_file);
    }

    LoadGridButton.prototype.setup = function ()
    {   
        element.onchange = this.on_change;
    }

    this.setup();
}

function GenerateGridDialog()
{   
    var OFF = 0; 
    var LIVE = 1;
    var SNAP = 2;

    var _gen_grid_dialog = this;
    this.webcam_status  = OFF; 
    this.webcam_enabled = false;

    this.file_select = new GenerateGridFileSelect();
    this.upload_button = new GenerateGridButton();

    this.image_to_upload_file = null;
    this.image_to_upload_preview;

    this.locked = false;
    this.visible;

    //this.status_message = "";
    this.status_message_def = "Upload your face!"
    this.status_message_start = Date.now();
    this.status_message_time  = -1; 

    GenerateGridDialog.prototype.update = function()
    {   
        if(this.status_message_time != -1)
        {
            if(Date.now() - this.status_message_start > this.status_message_time)
            {   get_id('gen-grid-button-status').innerText = this.status_message_def;
            }
        }
    }

    GenerateGridDialog.prototype.update_status = function(message, timefor)
    {
        if(message != "" && message != null)
        {   this.status_message_start = Date.now();
            this.status_message_time  = timefor; 
            get_id('gen-grid-button-status').innerText = message;
        }
        else
        {   this.status_message_time  = -1; 
            get_id('gen-grid-button-status').innerText = this.status_message_def;
        } 
    }

    GenerateGridDialog.prototype.set_visibility = function()
    {   
        let enable_diag = function(server_online)
        {
            if(server_online)
            {
                get_id('gen-grid-opendiag-button').classList.remove('hide');
            }
        }
        requests.if_server_online(enable_diag);
    } 

    GenerateGridDialog.prototype.lock = function()
    {   this.locked = true;
    }
    
    GenerateGridDialog.prototype.unlock = function()
    {   this.locked = false;
    }

    GenerateGridDialog.prototype.setup = function()
    {
        get_id('gen-grid-opendiag-button').onclick = function(event)
        {   if(!_gen_grid_dialog.locked)
            { 
                _gen_grid_dialog.open();
            }
            else if(_gen_grid_dialog.locked)
            {
                requests.kill_all();
                generate_grid_dialog.update_status("", -1);
            }
        }
        
        get_id('gen-grid-close-diag-button').onclick = function(event)
        {   
            _gen_grid_dialog.close();
            event.stopPropagation();
        }
        this.set_visibility();
    }

    GenerateGridDialog.prototype.open = function()
    {
        get_id('gen-grid-diag').classList.remove("hide");
        get_id('gen-grid-diag').classList.add("show");
    }

    GenerateGridDialog.prototype.close = function()
    {
        get_id('gen-grid-diag').classList.remove("show");
        get_id('gen-grid-diag').classList.add("hide");
    }

    GenerateGridDialog.prototype.set_image_preview = function(image_url)
    {   //console.log("setting input image");
        get_id('gen-grid-upload-preview').style.backgroundImage = 'url('+image_url+')';
        this.webcam_hide();
    }

    GenerateGridDialog.prototype.set_image_to_upload = function(file)
    {   this.image_to_upload_file = file;
    }

    // WEBCAM
    GenerateGridDialog.prototype.webcam_snap = function()
    {   Webcam.snap( function(data_uri) {
            
            _gen_grid_dialog.webcam_status = SNAP;
            get_id('gen-grid-webcam-button-text').innerText = 'Another Photo!';

            let blob = dataURItoBlob(data_uri);
            let webcam_image_preview = URL.createObjectURL(blob);
            
            // Get DataURI image format
            let semicolon = data_uri.indexOf(";");
            let fslash = data_uri.indexOf("/");
            let format = data_uri.substring(fslash+1,semicolon);

            let date = new Date();
            let webcam_image_file = blobToFile(blob, "webcam_" +date.getTime()+ "."+format);
            
            if(allowed_file(webcam_image_file.name))
            {
                _gen_grid_dialog.set_image_to_upload(webcam_image_file); 
                _gen_grid_dialog.set_image_preview(webcam_image_preview);    
                _gen_grid_dialog.webcam_hide();
            }
        } );
    }

    GenerateGridDialog.prototype.webcam_hide = function()
    {   get_id('gen-grid-webcam-disp').style.display = 'none';
        this.webcam_status = SNAP;
    }

    GenerateGridDialog.prototype.webcam_show = function()
    {   if(this.webcam_status == OFF || this.webcam_status == SNAP)
        {   this.setup_webcam();
            this.webcam_status = LIVE;
        }
        get_id('gen-grid-webcam-button-text').innerText = 'Take Photo!';
        get_id('gen-grid-webcam-disp').style.display = 'block';
    }

    GenerateGridDialog.prototype.webcam_click = function()
    {   
        if(this.webcam_enabled)
        {
            if(this.webcam_status == OFF)
            {   this.webcam_show();
            }
            else if(this.webcam_status == LIVE)
            {
                this.webcam_snap();
            }
            else if(this.webcam_status == SNAP)
            { 
                this.webcam_show();
            }
        }
        else
        {
            get_id('gen-grid-webcam-button-text').innerText = "Coming Soon!";
        }
    }

    // WEBCAM
    GenerateGridDialog.prototype.setup_webcam = function()
    {
        Webcam.set({
            // live preview size
			width: 274,
			height: 206,
			
			// device capture size
			dest_width: 320,
			dest_height: 240,
			
			// format and quality
			image_format: 'jpeg',
			jpeg_quality: 90
        });
        Webcam.attach( '#gen-grid-webcam-disp' );
    }

    // FILE SELECT
    function GenerateGridFileSelect()
    {
        this.element = document.getElementById('gen-grid-fileselect-input');
        var _gen_grid_file_select = this;
        
        this.on_change = function(e)
        {   // From: https://stackoverflow.com/questions/12368910/html-display-image-after-selecting-filename
            

            let selected_file = e.target.files[0];
    
            if(selected_file != null && allowed_file(selected_file.name))
            {
                let file_reader = new FileReader();

                _gen_grid_dialog.set_image_to_upload(selected_file);
    
                file_reader.onload = function(e)
                {
                    let blob = dataURItoBlob(e.target.result);
                    let selected_image_preview = URL.createObjectURL(blob);
                    // Set image preview
                    _gen_grid_dialog.set_image_preview(selected_image_preview);
                }
                
                file_reader.readAsDataURL(selected_file);
            }
        }
    
        GenerateGridFileSelect.prototype.setup = function ()
        {   
            this.element.onchange = this.on_change;
        }
    
        this.setup();
    }

    function GenerateGridButton()
    {   // Load Path
        this.element = document.getElementById('gen-upload-button');
        var _gen_grid_button = this;
    
        this.on_click = function(e)
        {   if(_gen_grid_dialog.image_to_upload_file != null)
            {   
                requests.request_grid(_gen_grid_dialog.image_to_upload_file);
                log_event('Upload', 'Image');
                _gen_grid_dialog.close();
                //_gen_grid_dialog.lock();
                e.stopPropagation();
            }
        }
    
        GenerateGridButton.prototype.setup = function()
        {   this.element.onclick = this.on_click;
        }

        this.setup();
    }

    this.setup();
}

function update_ui()
{
    generate_grid_dialog.update();
    update_dotdotdot();
}

function update_dotdotdot()
{   let dots = parseInt(Date.now()/500%5);
    dotdotdot = Array(dots).join(".");
    let spaces = Array(3-dotdotdot.length+1).join(" ");
    dotdotdot = dotdotdot + spaces;
}

function setup_ui()
{   // Prevent middle click pan from messing up window
    document.addEventListener ("click", function (e) 
    {   if (e.which === 2) 
        e.preventDefault();
    });

    get_id('anim-grid-hface-button').onclick = function()
    {   grid_close_menus();    
        get_id('anim-grid-hface-container').style.display = 'block';
    };  

    get_id('anim-grid-vface-button').onclick = function()
    {   grid_close_menus();
        get_id('anim-grid-vface-container').style.display = 'block';
    };

    get_id('anim-grid-size-button').onclick = function()
    {   grid_close_menus();
        get_id('anim-grid-size-container').style.display = 'block';
    };

    get_id('anim-grid-hface-container').onmouseleave = function(event)
    {  grid_close_menus();
    }

    get_id('anim-grid-size-container').onmouseleave = function(event)
    {  grid_close_menus();
    }

    get_id('anim-grid-vface-container').onmouseleave = function(event)
    {  grid_close_menus();
    }

    /*
    get_id('anim-grid-hface-container').onclick = function(event)
    {   // Here to stop mouse event from bubbling up to parent button 
        // (which will stop it from hiding the face container)
        event.stopPropagation();
    };

    get_id('anim-grid-vface-container').onclick = function(event)
    {   // Here to stop mouse event from bubbling up to parent button 
        // (which will stop it from hiding the face container)
        event.stopPropagation();
    };

    get_id('anim-grid-size-container').onclick = function(event)
    {   // Here to stop mouse event from bubbling up to parent button 
        // (which will stop it from hiding the face container)
        event.stopPropagation();
    };
    */

    play_button = new PlayButton();
    save_json_button = new SaveJsonButton();
    load_json_button = new LoadJsonButton();
    render_button = new RenderButton();
    load_grid_button = new LoadGridButton();
    timeline = new Timeline();

    next_path_button = new NextPathButton();
    prev_path_button = new PrevPathButton();
    clear_path_button = new ClearPathButton();
    prev_grid_button = new PrevGridButton();
    prev_next_button = new NextGridButton();

    generate_grid_dialog = new GenerateGridDialog();
}

function grid_haxis_selected(face)
{   get_id('anim-grid-hface-disp').innerText = face;
    grid_close_menus();
}

function grid_vaxis_selected(face)
{   get_id('anim-grid-vface-disp').innerText = face;
    grid_close_menus();
}

function grid_size_selected(size)
{   get_id('anim-grid-size-disp').innerText = size;
    grid_close_menus();
}

function grid_close_menus()
{   get_id('anim-grid-hface-container').style.display = 'none';
    get_id('anim-grid-vface-container').style.display = 'none';
    get_id('anim-grid-size-container').style.display = 'none';
}



