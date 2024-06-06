#!/bin/bash
# build bcrypt binary if bcrypt_lib.node does not exist
if [ ! -f "./node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node" ]; then
  # File does not exist, execute the command
  cd node_modules/bcrypt && make
fi
