"""
Uploading files to Flask http://flask.pocoo.org/docs/0.12/patterns/fileuploads/
Flask CORS (Cross Origin Resource Sharing) http://flask-cors.readthedocs.io/en/latest/
Returning images using Flask
https://stackoverflow.com/questions/25140826/generate-image-embed-in-flask-with-a-data-uri/25141268
Encoding image to base64 https://stackoverflow.com/questions/6375942/how-do-you-base-64-encode-a-png-image-for-use-in-a-data-uri-in-a-css-file
"""

import os, time, uuid, base64, urllib.parse
from flask import Flask, request, redirect, url_for, send_from_directory, render_template, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

REQUEST_PATH = './grids'
UPLOADING_FOLDER = './grids/uploading'
UPLOAD_FOLDER = './grids/uploads'
PROCESSED_FOLDER = './grids/processed'

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

app = Flask(__name__, static_folder='docs', static_url_path='')
CORS(app)

app.config['UPLOADING_FOLDER'] = UPLOADING_FOLDER
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_extension(filename):
    """
    Extract extension from filename
    """
    return filename.rsplit(".", 1)[1].lower()

def allowed_file(filename):
    """
    Checks if format is correct
    """
    hasdot = "." in filename 
    extension = get_extension(filename)
    if(hasdot and extension in ALLOWED_EXTENSIONS):
        return True
    else:
        return False

def save_file(file):
    """
    Saves file to local directory, renames it with an UUID, and returns the UUID
    """
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOADING_FOLDER'], filename)

    new_filename = str(uuid.uuid4())
    new_filepath = app.config['UPLOAD_FOLDER'] + os.sep + new_filename +"."+ get_extension(file.filename)

    file.save(filepath)
    os.rename(filepath, new_filepath)
    # touch the file to update the timestamp
    os.utime(new_filepath, None)

    print("File saved as " + new_filepath);
    return new_filename

@app.route('/example_page.html')
def home():
    return render_template('example_server_page.html')

# note: in the future we can change index.html to a different file
@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/grids', methods=['GET', 'POST'])
def generate_grid():
    """
    Handles image upload and grid reponses

    Way to handle CORS (Cross-Origin Resource Sharing):
    - Enable CORS Flask extension
    - Restrict only for "/upload" url and for TopoSketch origin only 
    """

    # Log referer
    try:
        if(request.environ["HTTP_REFERER"] != None):
            print(request.method + " request from " + request.environ["HTTP_REFERER"])
    except:
        print(request.method + " from unknown referer. Localhost?")

    if request.method == 'GET':
        # Receives request for a grid and returns with data uri if avaiable
        if(request.args.get('uuid')):
            # path = PROCESSED_FOLDER + os.sep + "OpenSmile1.png"
            path = "{}.jpg".format(os.path.join(PROCESSED_FOLDER, request.args.get('uuid')))
            encoded = base64.b64encode(open(path, "rb").read())
            # Sends "generated" image back as a data uri https://stackoverflow.com/questions/25140826/generate-image-embed-in-flask-with-a-data-uri/25141268
            data_url = 'data:image/png;base64,{}'.format(urllib.parse.quote(encoded))
            return data_url
        return ""

    elif request.method == 'POST':
        # Receive request for image upload and return generated UUID for that image
        file = request.files['file']
        file_response = ''

        #print(request.files['file'])
        if file.filename != "" and allowed_file(file.filename):
            print(file.filename + " is OK! Saving to local directory...")
            file_response = save_file(file)
        else:
            print(file.filename + " is NOT ok :(")
        
        data = {'uuid': file_response}
        return jsonify(data) 

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888)
