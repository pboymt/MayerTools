#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod menus;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let menu = menus::create_menus();
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "app_quit" => {
                std::process::exit(0);
            }
            "project_new" => {
                event.window().emit("project-new", ()).unwrap();
            }
            "project_open" => {
                event.window().emit("project-open", ()).unwrap();
            }
            "project_save" => {
                event.window().emit("project-save", ()).unwrap();
            }
            "project_save_as" => {
                event.window().emit("project-save-as", ()).unwrap();
            }
            "project_export" => {
                event.window().emit("project-export", ()).unwrap();
            }
            "help_toggle_devtools" => {
                let win = event.window();
                if !win.is_devtools_open() {
                    win.open_devtools();
                }
            }
            _ => {}
        })
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let win = app.get_window("main").unwrap();
                win.open_devtools();
                win.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
