#!/usr/bin/env bash

. ~/.nvm/nvm.sh && nvm use || echo "installing nvm may be useful"

YARN=$(which yarn)

type -P npm && npm install -g yarn || echo "install node/npm and yarn"

#REF: cat test/src/e2e.test.ts
(\
. ~/.nvm/nvm.sh && nvm use || echo "installing nvm may be useful" \
$YARN global add rollup@3 \
$YARN global add tape \
$YARN global add @cmdcode/core-cmd \
$YARN global add @cmdcode/signer \
$YARN global add @scrow/core
)
# We prefer https://www.gnu.org/software/sed
# installed under gsed on MacOS
# brew install gsed

SED=$(which gsed || which sed)

# Clean the existing dist path.
rm -rf ./dist

## Build the current project source.
yarn tsc
yarn rollup -c rollup.config.ts --configPlugin typescript

## Remove the webcrypto import from the module file.
$SED -i '/import { webcrypto } from '\''crypto'\'';/d' "./dist/module.mjs"

## Resolve path aliases in files.

DIRECTORY="./dist"                 # The file path to search.
EXTENSIONS=("js" "ts")             # The file extensions to target. Add more extensions as needed.
ABSOLUTE_PATH="@/"                 # The path we are replacing.
DEPTH_OFFSET=3                     # The offset for our depth counter.

# Resolve
for EXTENSION in "${EXTENSIONS[@]}"
do
    # Loop through all files in the directory that match the current extension.
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
        $SED -i "s|$ABSOLUTE_PATH|$RELATIVE_PATH|g" "$file"
    done
done
