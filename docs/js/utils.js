
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

        console.log(file);

        this.file_reader = new FileReader();
        this.file_reader.onload = (function(loaded_event)
        {
            //console.log(loaded_event.target.result);
            try{
                this.json = JSON.parse(loaded_event.target.result);
                callback(this.json, file);
            }
            catch(exception){
                this.json = null;
            }
        });
        this.file_reader.readAsText(file);
    }
}

function b64toBlob(b64Data, contentType, sliceSize) {
  // From https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  var blob = new Blob(byteArrays, {type: contentType}); 
  return blob;
}

function dataURItoBlob(dataURI) {
    // From https://stackoverflow.com/questions/12168909/blob-from-dataurl
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  
  }