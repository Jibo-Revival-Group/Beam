#!/bin/sh

# Packages up oobe-config for buildroot (assumes package.json version is set) and uploads it to repository.jibo.com
# Parameter is package.json version; assumes you have cd'd into oobe-config directory
# $1 === version (e.g. 1.0.1)
# $2 === ldap user for uploading to repository.jibo.com

echo "\nZipping oobe-config..\n"
tar -czf  ../jibo-oobe-config-$1.tar.gz .

echo "\nSaving shasum to ../oobe-sha\n"
cd ../
shasum -a 256 jibo-oobe-config-$1.tar.gz > oobe-sha

echo "\nUploading to repository.jibo.com...\n"
scp jibo-oobe-config-$1.tar.gz $2@repository.jibo.com:/data001/www/skills/jibo-oobe-config/

echo "\nDone.\n"