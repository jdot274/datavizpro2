#!/bin/bash

# Get the absolute path of the HTML file
HTML_FILE="$(pwd)/standalone-browser.html"

# Chrome flags to enable WebGL and disable security restrictions
CHROME_FLAGS="--disable-web-security --allow-file-access-from-files --enable-webgl --ignore-gpu-blocklist --disable-gpu-sandbox"

echo "Opening Chrome with WebGL enabled..."
echo "HTML File: $HTML_FILE"

# Open Chrome with the flags
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a "Google Chrome" --args $CHROME_FLAGS "$HTML_FILE"
else
    # Linux/Windows
    google-chrome $CHROME_FLAGS "$HTML_FILE" || chrome $CHROME_FLAGS "$HTML_FILE"
fi

echo "Chrome should be opening with WebGL enabled."