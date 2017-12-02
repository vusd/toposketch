importScripts('./jsgif/LZWEncoder.js', './jsgif/NeuQuant.js', './jsgif/GIFEncoder.js');      /* imports three scripts */

var encoder = new GIFEncoder(); //create a new GIFEncoder for every new job
var cur_frame;  

self.onmessage = function(event) {
    // Encodes GIF
    // event.data will be an array ['command', 'content'] 
    var command = event.data[0]
    var content = event.data[1];
    
    var add_frame_callback = function()
    {
        //console.log('added!');
        postMessage(['addframe', this.cur_frame]);
    }

    
    //this.gif_encoder.setRepeat(0);
    //    this.gif_encoder.setDelay(Math.floor(animation.millis_per_frame)); 
    //    this.gif_encoder.setFrameCallback(this.when_frame_added);


    if(command == 'setup')
    {   //console.log('Setting up render worker...');
        encoder.setRepeat(content['repeat']);
        encoder.setDelay(content['delay']);
        encoder.setFrameCallback(add_frame_callback);
        cur_frame = 0;
        console.log('Setting up render worker... OK!');
    }
    else if(command == 'start')
    {   //console.log('Starting encoder');
        encoder.start();
    }
    else if(command == 'addframe')
    {   //console.log('Encoding frame ' + content['frame']);
        encoder.setSize(content['image_data'].width,content['image_data'].height);
        encoder.addFrame(content['image_data'].data, true);
        cur_frame = content['frame'];
    }
    else if(command == 'finish')
    {   //console.log('Encoding done! Sending data back')
        encoder.finish();
        let render_data = encoder.stream().getData()
        postMessage(['show', render_data]); // Show final result
        console.log('Encoding done, killing worker');
        close();
    }

/*
  //console.log("message!");
  //alert("message");
  //self.postMessage(event.data);
  //return;
  var frame_index,
    frame_length,
    height, 
    width,
    delay,
    imageData; //get it from onmessage
    
  frame_index = event.data["frame_index"];
  frame_length = event.data["frame_length"];
  height = event.data["height"];
  width = event.data["width"];
  imageData = event.data["imageData"];
  delay = event.data["delay"];
  
  var encoder = new GIFEncoder(); //create a new GIFEncoder for every new job
  encoder.setRepeat(0); 	//0 
   -> loop forever
  //1+ -> loop n times then stop
  encoder.setQuality(1);
  encoder.setSize(width, height); 
  encoder.setDelay(delay);	//go to next frame every n milliseconds
  
  if(frame_index == 0)
  {
    
    encoder.start();
  }
  else
  {
    //alert();
    encoder.cont();
    encoder.setProperties(true, false); //started, firstFrame
  }

  encoder.addFrame(imageData, true);
  if(frame_length == frame_index)
  {
    encoder.finish();
  }
  self.postMessage({"frame_index":frame_index, "frame_data":encoder.stream().getData()}) //on the page, search for the GIF89a to see the frame_index
  */
};