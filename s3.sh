#!/bin/bash

dateFormatted="`date +'%a, %d %b %Y %H:%M:%S %z'`"
extension="${sourceFile##*.}"

case "${sourceFile##*.}" in
"html") contentType="text/html";;
"css") contentType="text/css";;
"js") contentType="text/javascript";;
esac

stringToSign="PUT\n\n${contentType}\n${dateFormatted}\n/${s3Bucket}/${targetFile}"
signature=`echo -en ${stringToSign} | openssl sha1 -hmac ${s3SecretKey} -binary | base64`

curl -X PUT -T "${sourceFile}" \
  -H "Host: ${s3Bucket}.s3.amazonaws.com" \
  -H "Date: ${dateFormatted}" \
  -H "Content-Type: ${contentType}" \
  -H "Authorization: AWS ${s3AccessKey}:${signature}" \
http://${s3Bucket}.s3.amazonaws.com/${targetFile}