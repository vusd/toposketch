#!/bin/bash

INPUTDIR="grids/rawgrid"
OUTPUTDIR="docs/processed"

mkdir -p $INPUTDIR
mkdir -p $OUTPUTDIR

# inotifywait -m $INPUTDIR -e create -e modify -e moved_to -e ATTRIB |
# inotifywait -m $INPUTDIR -e create -e ATTRIB |
inotifywait -m $INPUTDIR -e ATTRIB |
    while read path action file; do
        echo "The file '$file' appeared in directory '$path' via '$action'"
        # do something with the file
        mogrify -path $OUTPUTDIR -resize 896x896 -format jpg "$path/$file"
    done
