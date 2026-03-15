#!/bin/bash

# Clone the latest code
git pull origin main

# Build the new image
docker build -t djzs/djzs-ai:latest .

# Push to Docker Hub
docker push djzs/djzs-ai:latest
