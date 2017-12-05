
function RequestManager()
{
    this.requests = new Array();
    //this.server_url = 'http://toposketch.vusd.nz/grids';
    //this.server_url = 'http://127.0.0.1:5000/grids';
    this.server_url = '/grids';
    this.test_url = './js/server_up.json';
    //this.test_url = 'http://toposketch.vusd.nz/js/server_up.json';

    RequestManager.prototype.update_requests = function()
    {
        for(var r=0; r<this.requests.length; r++)
        {   let current_request = this.requests[r];

            current_request.update();

            if(current_request.done)
            {   
                this.requests.splice(r, 1);
                console.log("Request closed!");
            }
        }
    }

    RequestManager.prototype.request_grid = function(image_file)
    {   console.log("Started new request");
        let new_request = new Request();
        new_request.upload_image(image_file);
        this.requests.push(new_request);
    }

    RequestManager.prototype.if_server_online = function(callback)
    {   let check_request = new XMLHttpRequest();

        check_request.onreadystatechange = function()
        {
            if(check_request.readyState == XMLHttpRequest.DONE && check_request.status == 200)
            {
                let response_json = JSON.parse(check_request.response);
                console.log('Server says hello!');
                callback(true);
            }
            else if(check_request.readyState == XMLHttpRequest.DONE && check_request.status != 200)
            {
                callback(false);
                console.log('Server says goodbye!');
            }
            else
            {
            }
        }

        console.log('Checking if server available...');
        check_request.open("GET", this.test_url);
        check_request.send();
    }
}

function Request()
{
    this.uuid = '';
    this.image_response;
    this.done = false;

    this.poll_start = Date.now();
    this.last_polltime = 0;
    this.poll_interval = 5000; // in milliseconds 
    this.poll_timeout = 60000; // in milliseconds

    var _request = this;

    Request.prototype.update = function()
    {
        if(Date.now()-this.last_polltime > this.poll_interval)
        {
            console.log("Request polling...");
            this.last_polltime = Date.now();
            this.request_grid();
        }

        if(Date.now() - this.poll_start >= this.poll_timeout)
        {   
            console.log("Request timed out after " + this.poll_timeout +" ms");
            this.close();
        }
    }

    Request.prototype.close = function()
    {   console.log("Request closing...")
        generate_grid_dialog.update_status("");
        this.done = true;
    }

    Request.prototype.upload_image = function(file)
    {   // "file" argument is a File object
        // https://developer.mozilla.org/en-US/docs/Web/API/File
        // Adapted from
        // http://codular.com/javascript-ajax-file-upload-with-progress

        console.log(file);

        if(file == null)
        {   return;
        }

        if(allowed_file(file.name))
        {   
            let data = new FormData(); // This is the formatted data to upload
            let request = new XMLHttpRequest(); // This is the POST request sent to server
            
            //===== Creating Request & Responses =====//
            console.log("File format " + file.name + " OK!");
            data.append("file", file);

            request.onreadystatechange = function()
            {   // If the request is complete and has an OK status
                if(request.readyState == XMLHttpRequest.DONE && request.status == 200)
                {
                    response = JSON.parse(request.response);
                    _request.uuid = response.uuid;
                    generate_grid_dialog.update_status("Image Uploaded!");
                    console.log("File received by server and assigned UUID of " + this.uuid);
                }
                else 
                {
                    console.log("Uh oh! " + request.status)
                    generate_grid_dialog.update_status("Upload Failed!");
                }
            }

            //===== Sending Request =====//
            console.log("Sending file to server via POST...");
            
            generate_grid_dialog.update_status("Uploading Image...");
            request.open("POST", requests.server_url);
            request.send(data);
        }
        else
        {   console.log("File not allowed (wrong file format?)");
        }
    }

    Request.prototype.request_grid = function()
    {   
        if(this.uuid)
        {   console.log("Requesting grid for UUID:" + this.uuid + " from server...");
            let request = new XMLHttpRequest(); // This is the GET request sent to server
            let params = "uuid="+this.uuid;

             request.onreadystatechange = function()
            {   // If the request is complete and has an OK status
                if(request.readyState == XMLHttpRequest.DONE && request.status == 200)
                {
                    response = request.response;
                    _request.image_response = request.responseURL;
                    console.log("Got grid back from server");
                    console.log(_request.image_response);
                    generate_grid_dialog.update_status("Grid Generated!");
                    //console.log(this.image_response);
                    
                    //let grid_blob = dataURItoBlob(this.image_response);
                    //let blob_url = 'url('+grid_blob+')'
                    //console.log(blob_url);
                    animation.data.add_grid_image(_request.image_response, 7, 7, "uploaded", true);

                    _request.close();
                }
                else 
                {
                    console.log(request.status);
                }
            }
            request.open("GET", requests.server_url + "?" + params);
            generate_grid_dialog.update_status("Generating Grid...");
            request.send();
        }
    }

    Request.prototype.grid_received = function()
    {
        if(this.image_response)
        {
            animation.data.add_grid_image(this.image_response, 7, 7, this.uuid, true);
        }
    }
}
