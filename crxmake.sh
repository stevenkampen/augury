#!/bin/bash -e
#
# Package Augury into crx format Chrome extension
# (This will not be needed for official distribution)
# Based on https://developer.chrome.com/extensions/crx#scripts

node -v
npm -v

app_key="app/key.pem"
extension_key="extension/key.pem"
app_name="augury-app"
extension_name="augury-extension"
app_files="app/manifest.json app/build app/frontend.html"
extension_files="extension/manifest.json extension/build extension/images"

cwd=$(pwd -P)

function create {
  name=$1
  files=$2
  key=$3

  dir="temp"

  crx="$name.crx"
  pub="$name.pub"
  sig="$name.sig"
  zip="$name.zip"

  # copy all the files we need
  rm -rf $dir
  mkdir $dir
  cp -R $files $dir/
  find $dir -name "*.map" -type f -delete

  # zip up the crx dir
  (cd "$dir" && zip -qr -9 -X "$cwd/$zip" .)

  find $cwd -name "*.pub" -type f -delete
  find $cwd -name "*.sig" -type f -delete

  # signature
  openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"

  # public key
  openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

  byte_swap () {
    # Take "abcdefgh" and return it as "ghefcdab"
    echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
  }

  crmagic_hex="4372 3234" # Cr24
  version_hex="0200 0000" # 2
  pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
  sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
  (
    echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
    cat "$pub" "$sig" "$zip"
  ) > "$crx"

  echo "Wrote $crx"

  # clean up
  rm -rf $dir
}

create "$app_name" "$app_files" "$app_key"
create "$extension_name" "$extension_files" "$extension_key"

find $cwd -name "*.pub" -type f -delete
find $cwd -name "*.sig" -type f -delete

echo "Fin."
