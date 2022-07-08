#!/usr/bin/env bash

OS="$(uname -a | awk '{ print $1 }')"
ARCH="$(uname -a | awk '{ print $NF }')"

if [ "$OS" == "Darwin" ]; then
    OS="macos"
else
    OS="linux"
fi

if [ "$ARCH" == "x86_64" ]; then
    ARCH="x64"
fi

EXE="tailwindcss-$OS-$ARCH"

curl -sLO "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/$EXE"
chmod +x "$EXE"
mv "$EXE" tailwindcss
