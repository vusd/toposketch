#!/bin/bash

touch grids/processed/dummy && rm grids/*/* && \
  touch docs/processed/dummy && rm docs/processed/* && 
  git checkout grids
