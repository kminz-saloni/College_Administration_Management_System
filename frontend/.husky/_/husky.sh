#!/bin/sh

# Common Husky hook configuration file

# Exit if no git is installed
if ! command -v git &> /dev/null; then
  echo "git is not installed"
  exit 1
fi

# Forward all arguments
