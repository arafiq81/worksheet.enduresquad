#!/bin/sh
set -e

cd /Users/asif.rafiq/Library/CloudStorage/OneDrive-VodafoneGroup/Documents/endure-worksheet

config_file="/Users/asif.rafiq/Library/CloudStorage/OneDrive-VodafoneGroup/Documents/endure-worksheet/public/config.js"

if [ -n "$SUPABASE_URL" ] || [ -n "$SUPABASE_ANON_KEY" ]; then
  if [ ! -f "$config_file" ]; then
    echo "Config file not found: $config_file"
    exit 1
  fi
  if [ -n "$SUPABASE_URL" ]; then
    sed -i "" "s|supabaseUrl: \".*\"|supabaseUrl: \"$SUPABASE_URL\"|g" "$config_file"
  fi
  if [ -n "$SUPABASE_ANON_KEY" ]; then
    sed -i "" "s|supabaseAnonKey: \".*\"|supabaseAnonKey: \"$SUPABASE_ANON_KEY\"|g" "$config_file"
  fi
fi

msg="$1"
if [ -z "$msg" ]; then
  msg="Update worksheet"
fi

git add .
if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$msg"
fi

git push
