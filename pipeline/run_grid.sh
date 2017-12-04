#!/bin/bash

INPUTDIR="grids/aligned"
OUTPUTDIR="grids/rawgrid"

mkdir -p $INPUTDIR
mkdir -p $OUTPUTDIR

PYTHONPATH=../discgen_classic2:../plat \
  CUDA_VISIBLE_DEVICES=0 \
  python ../plat/plat/bin/platcmd.py sample \
  --rows 7 --cols 7 --tight --gradient --offset 0 \
  --anchor-directory $INPUTDIR --watch \
  --image-size 256 \
  --numanchors 1 \
  --preload-model \
  --model-file "../discgen_classic2/models/celeba_dlib_256_320z_d5_10/celeba_dlib_256_320z_d5_10.zip" \
  --model-interface discgen.interface.DiscGenModel \
  --anchor-offset-x 1 --anchor-offset-x-minscale -2.0 --anchor-offset-x-maxscale 2.0 \
  --anchor-offset-y 2 --anchor-offset-y-minscale -2.0 --anchor-offset-y-maxscale 2.0 \
  --anchor-offset "../discgen_classic2/models/celeba_dlib_256_320z_d5_10/atvecs_balanced_20_21_31.json" \
  --outfile $OUTPUTDIR"/%BASENAME%.png"
