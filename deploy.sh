#!/bin/bash

echo "Deploy to S3:"

source ".env"
export s3Bucket
export s3AccessKey
export s3SecretKey

buildFolder="$PWD/dist"

for file in $buildFolder/*
do
  echo $file
  export targetFile="${file##*/}"
  export sourceFile="$buildFolder/${file##*/}"
  ./s3.sh
done
