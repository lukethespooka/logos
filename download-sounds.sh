#!/bin/bash

# Create directories if they don't exist
mkdir -p public/sounds/material/{hero,primary,secondary}

# Function to download and convert sound
download_sound() {
  local url="$1"
  local output="$2"
  
  # Download the file
  curl -L "$url" -o "$output"
  
  # Check if download was successful
  if [ $? -eq 0 ]; then
    echo "Successfully downloaded: $output"
  else
    echo "Failed to download: $output"
    return 1
  fi
}

# Download primary sounds
download_sound "https://storage.googleapis.com/material-design/publish/material_v_4/material_ext_publish/0B14F_FSUCc01WUE4WXN0QWxCUHM/state-change_confirm-up.ogg" "public/sounds/material/primary/state-change_confirm-up.ogg"
download_sound "https://storage.googleapis.com/material-design/publish/material_v_4/material_ext_publish/0B14F_FSUCc01WUE4WXN0QWxCUHM/state-change_confirm-down.ogg" "public/sounds/material/primary/state-change_confirm-down.ogg"

# Download secondary sounds
download_sound "https://storage.googleapis.com/material-design/publish/material_v_4/material_ext_publish/0B14F_FSUCc01WUE4WXN0QWxCUHM/alert_error-01.ogg" "public/sounds/material/secondary/alert_error-01.ogg"

# Download hero sounds
download_sound "https://storage.googleapis.com/material-design/publish/material_v_4/material_ext_publish/0B14F_FSUCc01WUE4WXN0QWxCUHM/hero_simple-celebration-01.ogg" "public/sounds/material/hero/hero_simple-celebration-01.ogg" 