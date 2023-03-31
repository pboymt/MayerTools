# Get param named version_type, if not provided, default to patch
param ([string]$type = "patch")

# Run npm version and recieve the new version number
$new_version = npm version $type

# Get the new version number
$new_version = $new_version -replace "v", ""

# Write the new version number to src-tauri/Cargo.toml
$src_tauri_cargo_toml = Get-Content -Path src-tauri/Cargo.toml
$src_tauri_cargo_toml = $src_tauri_cargo_toml -replace 'version = \"[0-9]+\.[0-9]+\.[0-9]+\"', "version = ""$new_version"""
$src_tauri_cargo_toml | Set-Content -Path src-tauri/Cargo.toml

# Write the new version number to src-tauri/tauri.conf.json
$src_tauri_tauri_conf_json = Get-Content -Path src-tauri/tauri.conf.json
$src_tauri_tauri_conf_json = $src_tauri_tauri_conf_json -replace '"version": "[0-9]+\.[0-9]+\.[0-9]+"', "`"version`": ""$new_version"""
$src_tauri_tauri_conf_json | Set-Content -Path src-tauri/tauri.conf.json