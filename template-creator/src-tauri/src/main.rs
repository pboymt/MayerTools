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
        .on_menu_event(move |event| match event.menu_item_id() {
            "app_quit" => {
                std::process::exit(0);
            }
            "window_close" => {
                event.window().close().unwrap();
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
            "help_about" => {
                let about_window = event.window().get_window("about").unwrap();
                if !about_window.is_visible().unwrap() {
                    about_window.show().unwrap();
                }
            }
            "help_toggle_devtools" => {
                let event_win = event.window();
                if !event_win.is_devtools_open() {
                    event_win.open_devtools();
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
                // let about_win = app.get_window("about").unwrap();
                // about_win.open_devtools();
                // about_win.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
