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

function Timeline()
{
    var element = document.getElementById('timeline');
    var frame_readout = document.getElementById('timeline-counter');
    
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
    }

    Timeline.prototype.on_change = function()
    {   animation.go_to_frame(Math.round(element.value));
        animation.pause();
        play_button.update_state();
        //console.log(element.clientLeft + element.clientWidth);
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
{
    var element = document.getElementById('save-json-button');
    var button = this;

    this.on_context_click = function(e)
    {
        button.append_json();
    }

    this.on_click = function(e)
    {
        //console.log("Saving JSON");
        button.append_json();
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
{
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
        animation.data.next_path();
    }
}

function PrevPathButton()
{
    var element = document.getElementById('prev-path-button');
    element.onclick = function()
    {
        animation.data.prev_path();
    }
}

function ClearPathButton()
{
    var element = document.getElementById('clear-button');
    element.onclick = function()
    {
        animation.data.clear();
    }
}

function NextGridButton()
{
    var element = document.getElementById('next-grid-button');
    element.onclick = function()
    {
        animation.data.next_grid();
    }
}

function PrevGridButton()
{
    var element = document.getElementById('prev-grid-button');
    element.onclick = function()
    {
        animation.data.prev_grid();
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
            animation.data.add_grid_image(e.target.result, 7, 7);
        }
        
        file_reader.readAsDataURL(selected_file);
    }

    LoadGridButton.prototype.setup = function ()
    {   
        element.onchange = this.on_change;
    }

    this.setup();
}

function setup_ui()
{   // Prevent middle click pan from messing up window
    document.addEventListener ("click", function (e) 
    {   if (e.which === 2) 
        e.preventDefault();
    });

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

}


