#!/bin/bash

## A quick and simple transpiler for replacing path aliases in our codebase.

DIRECTORY="./dist"  # The file path to search.
EXTENSION="js"      # The file extension to target.
ABSOLUTE_PATH="@/"  # The path we are replacing.
DEPTH_OFFSET=3      # The offset for our depth counter.

# Loop through all files in the directory that match the specified extension.
find "$DIRECTORY" -name "*.$EXTENSION" -type f | while read -r file
do
    # Count the number of slashes in the file's path to determine its depth
    DEPTH=$(echo "$file" | tr -cd '/' | wc -c)
    
    # Build a relative path string based on the depth.
    RELATIVE_PATH=""
    for (( i=DEPTH_OFFSET; i<=$DEPTH; i++ ))
    do
        RELATIVE_PATH="../$RELATIVE_PATH"
    done
    
    # Use sed to perform the in-place replacement.
    sed -i "s|$ABSOLUTE_PATH|$RELATIVE_PATH|g" "$file"
done
