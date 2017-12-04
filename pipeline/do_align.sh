#!/bin/bash

INPUTDIR="grids/uploads"
OUTPUTDIR="grids/aligned"

mkdir -p $INPUTDIR
mkdir -p $OUTPUTDIR

PYTHONPATH=../faceswap python ../faceswap/faceswap/doalign.py \
  --input-directory $INPUTDIR --watch \
  --output-directory $OUTPUTDIR \
  --image-size 256
