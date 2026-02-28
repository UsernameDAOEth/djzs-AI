#!/bin/bash
cd avantis_service
uvicorn main:app --host 0.0.0.0 --port 8088 --reload
