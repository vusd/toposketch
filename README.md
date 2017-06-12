<div class="video-container">ss
    <iframe src="https://www.youtube.com/embed/lNjXbKNhtGA?ecver=1" frameborder="0" allowfullscreen></iframe>
</div>

## Abstract
TopoSketch is a tool for prototyping facial animations by sketching gestures. Posing and animating a believable face is a complex process, requiring many different features to work in tandem (eg: the eyes narrowing during a smile). Using neural networks, TopoSketch creates a high level expression based control that simplies this process. Drawn gestures are then used to control the blending and timing between different expressions to create an animation. 

## Demo
<html>

    <head>
        <meta charset='utf-8'/>
        <title>TopoSketch Web App</title>
        
        <script type="text/javascript" src="./js/jsgif/LZWEncoder.js"></script>
        <script type="text/javascript" src="./js/jsgif/NeuQuant.js"></script>
        <script type="text/javascript" src="./js/jsgif/GIFEncoder.js"></script>
        <script type="text/javascript" src="./js/jsgif/b64.js"></script>

        <script type='text/javascript' src='./js/utils.js'></script>  
        <script type='text/javascript' src='./js/canvasy/canvasy.js'></script>
        <script type='text/javascript' src='./js/animation.js'></script>
        <script type='text/javascript' src='./js/grid.js'></script>
        <script type='text/javascript' src='./js/display.js'></script>
        <script type='text/javascript' src='./js/renderer.js'></script>
        <script type='text/javascript' src='./js/ui.js'></script>

        <script type='text/javascript' src='./js/main.js'></script>
        
        <link rel='stylesheet' href='./css/normalize.css'>
        <link rel='stylesheet' href='./css/skeleton.css'>
        <link rel='stylesheet' href='./css/styles.css'>
        <link rel='stylesheet' href='./css/compatibility.css'>

        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

    </head>

    <body onload='init();'>

        
                <div class='twelve columns toolbar' style="background-color:none;">
               
                <button title='Load previous grid' onclick='animation.data.prev_grid();' class='tool-button'>
                    <img src="./imgs/icons/ic_grid_left_24px.svg"> </button>
               
               <button title='Load next grid' onclick='animation.data.next_grid();' class='tool-button'>
                   <img src="./imgs/icons/ic_grid_right_24px.svg"> </button>

                <a id='save-json-button' href='default.json' target='_blank' download='path.json'>
                    <button title='Save path' class='tool-button'>
                        <p> Export Path </p>
                    </button> 
                </a>
                
                <!-- File inputs are notorious to style, so this is a workaround-->
                <div class='tool-button file-input-container'>
                    <p>Load Path</p>
                    <input id='load-json-button' class='file-input-button' type='file'>
                
                </div>

                <button id='clear-button' class='tool-button' onclick="animation.data.clear()">
                    <p>Clear Path</p>
                </button>

                <div class='file-input-container tool-button'> 
                    <p>Add Grid</p>
                    <input id='load-grid-button' class='file-input-button' type='file'>
                </div>

                <button id='render-button' class='tool-button'>
                    Render Animation
                </button>

            </div>
            
            <div id='anim-windows' class='twelve columns' style="background-color:red;">
                <canvas id='anim-grid' class='six columns' style="background-color:blue;"></canvas>
                <canvas id='anim-display' class='six columns'></canvas>
            </div>


            <div class='twelve columns toolbar' id='play-toolbar' style='margin-bottom:2em;'>
                <div id='play-button-container'>
                    <button id='play-button' class='tool-button'>
                        <img id='play-button-icon' src="./imgs/icons/ic_play_arrow_black_24px.svg">
                    </button>
                </div>
                <div id='timeline-container'>
                    <input type='range' id='timeline' value='5000'>
                    <p id='timeline-counter' class='readout'></p>
                </div>
            </div> 

            <h2 class='title' style='margin-top:1em;'>Rendered Animations</h2>
            <p id='no-animations-sign'>No animations yet, render something!</p>
            <div id='render-container' class='twelve columns'>
                <!--<div id='placement-guide'></div> renders will be placed before to this element-->
            </div>

            <div class='twelve columns' style="display:none;">
                <p id='fps' class='readout'></p>
            </div> 

        
    </body>
</html>
