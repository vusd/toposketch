
// Windows
var grid;
var display;
var test;
// Animation
var animation;
var renderer;

// Utilities
var cur_timestamp; // For calculating fps
var fps;

var first_loop = true;

function init()
{
    animation = new Animation();

    grid = new Grid();
    display = new Display();
    renderer = new Renderer();
    cur_timestamp = time();
    
    setup_ui();
    register_events(); // Window level events

    animation.data.add_grid_image('./imgs/GanHair.jpg', 12, 12);
    animation.data.add_grid_image('./imgs/OpenSmile1.png', 7, 7);
    animation.data.add_grid_image('./imgs/OldGlasses.jpg', 9, 9);
    animation.data.add_grid_image('./imgs/OpenSmile2.jpg', 7, 7);
    animation.data.add_grid_image('./imgs/PaleDisgust.png', 7, 7);
    animation.data.set_grid(0);

    let paths_loaded = function()
    {   // Since JSON files are loaded asynchronously, there is a callback to follow up on the loaded path
        animation.data.set_path(0);
    }

    animation.data.load_local_path('./sample_paths/range_4_corners.json', null);
    animation.data.load_local_path('./sample_paths/KissSmile.json', null); 
    animation.data.load_local_path('./sample_paths/closedsmile_to_opensmile.json', null);   
    animation.data.load_local_path('./sample_paths/Kiss.json', paths_loaded); 
    
    animation.play();
    start_loop(loop);
}

function loop()
{

    animation.update_cursor(grid.canvas.mouse_x/ grid.canvas.width,
                            grid.canvas.mouse_y/ grid.canvas.height);
    animation.update();

    grid.update();
    display.update();

    calculate_fps();
    get_id('fps').innerText = fps + ' FPS'
    
    if(animation.data.path.length == 0 || animation.data == null)
    {   get_id('timeline-counter').innerText = 'No frames yet. Draw something!';
    }
    else
    {   get_id('timeline-counter').innerText = animation.current_frame + ' / ' + (animation.data.path.length-1);
    }
    
    if(first_loop)
    {   resize_windows(); 
        first_loop=false;
    }
}

// UI
function resize_windows()
{   // Positions and resizes windows. 
    // parseFloat() is used to get values or
    // they will return with 'px' at the end 
    
    //let anim_win_width = get_id('anim-grid').width;
    //grid.canvas.height = parseFloat(grid.canvas.width);

    let window_width = get_id('anim-grid').offsetWidth ;

    grid.canvas.width = window_width;
    grid.canvas.height = parseFloat(grid.canvas.width);

    display.canvas.width = window_width;
    display.canvas.height = window_width;

    let timeline_container_width = get_id('timeline-container').clientWidth;

    let play_button_width = get_id('play-button-container').clientWidth;
    let play_toolbar_width = get_id('play-toolbar').clientWidth;
    let play_toolbar_padding = get_id('play-toolbar').style.paddingLeft 
                               +get_id('play-toolbar').style.paddingRight;

    get_id('timeline-container').style.width = (play_toolbar_width
                                     -play_button_width
                                     -play_toolbar_padding -6)  + 'px';

    get_id('timeline').style.width = get_id('timeline-container').clientWidth;

    //console.log(timeline_container.style.width);

/*
    display.canvas.element.style.top = parseFloat(grid.canvas.element.style.top) + 'px';
    display.canvas.element.style.left = parseFloat(grid.canvas.element.style.left) + parseFloat(grid.canvas.width) + 'px';
    display.canvas.width = window_width;
    display.canvas.height = parseFloat(grid.canvas.height);

    get_id('timeline').style.width = window_width*2 + 'px';
    */

    /*
    let window_width = window.innerWidth/2;

    // Limit max size
    if(window_width > 500) window_width = 500;
    
    grid.canvas.element.style.top = '0px';
    grid.canvas.element.style.left = '0px';
    grid.canvas.width = window_width;
    grid.canvas.height = parseFloat(grid.canvas.width);

    display.canvas.element.style.top = parseFloat(grid.canvas.element.style.top) + 'px';
    display.canvas.element.style.left = parseFloat(grid.canvas.element.style.left) + parseFloat(grid.canvas.width) + 'px';
    display.canvas.width = window_width;
    display.canvas.height = parseFloat(grid.canvas.height);

    get_id('timeline').style.width = window_width*2 + 'px';
    */
}

// EVENTS
function on_resize()
{   // Called with window is resized
    resize_windows();
}

function register_events()
{   // Register any document / window level events here
    window.onresize = on_resize;
}

// UTILITY
function get_id(id)
{   // Shortify wrapper to get elements
    return document.getElementById(id);
}

function start_loop(func)
{   // Wrapper to loop a function using requestAnimationFrame()
    var looped = function()
    {   func();
        window.requestAnimationFrame(looped);
    }
    var animation_request = requestAnimationFrame(looped);
    // Returns the animation request ID, so you can stop it 
    // using cancelAnimationFrame() 
    return animation_request; 
}

function calculate_fps()
{   // Calculates FPS
    let time_diff = time() - cur_timestamp;
    cur_timestamp = time();
    fps = (1000/time_diff).toFixed(1);
}

function time()
{   // Wrapper for performance.now()
    return performance.now();
}
