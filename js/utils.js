
function JSONReader()
{   // Simple json reader util, requires FileReader support 
    this.file_reader = new FileReader();
    this.json = null; // Where JSON result is stored if loaded

    // File Reading
    JSONReader.prototype.setup = function()
    {
    }   

    JSONReader.prototype.read_json = function(file, callback)
    {   // Read from file list, and do something with JSON result 
        // https://developer.mozilla.org/en/docs/Web/API/FileReader
        // http://jsfiddle.net/zTe4j/58/

        console.log(file[0]);

        this.file_reader = new FileReader();
        this.file_reader.onload = (function(loaded_event)
        {
            //console.log(loaded_event.target.result);
            try{
                this.json = JSON.parse(loaded_event.target.result);
                callback(this.json);
            }
            catch(exception){
                this.json = null;
            }
        });
        this.file_reader.readAsText(file);
    }
}