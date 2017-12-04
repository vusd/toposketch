#!/bin/bash

INPUTDIR="grids/processed"

mkdir -p $INPUTDIR

# inotifywait -m $INPUTDIR -e create -e modify -e moved_to -e ATTRIB |
# inotifywait -m $INPUTDIR -e create -e ATTRIB |
inotifywait -m $INPUTDIR -e create |
    while read path action file; do
        echo "The file '$file' appeared in directory '$path' via '$action'"
        # do something with the file
        aws s3 cp "$path/$file" "s3://toposketch.vusd/$file"
        # mogrify -path $OUTPUTDIR -resize 896x896 -format jpg "$path/$file"
    done
