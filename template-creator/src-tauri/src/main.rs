#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod menus;

use tauri::{Manager, Menu};

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
                let app_handle = event.window().app_handle();
                if app_handle.get_window("about").is_some() {
                    app_handle.get_window("about").unwrap().set_focus().unwrap();
                    return;
                }
                let mut new_window = tauri::WindowBuilder::new(
                    &app_handle,
                    "about",
                    tauri::WindowUrl::App("about.html".into()),
                )
                .title("关于 Mayer Template Creator")
                .menu(Menu::default())
                .resizable(false)
                .inner_size(500.0, 400.0)
                .focused(true)
                .max_inner_size(500.0, 400.0)
                .min_inner_size(500.0, 400.0)
                .center();
                if cfg!(target_os = "windows") {
                    new_window = new_window.owner_window(event.window().hwnd().unwrap())
                }
                new_window.build().unwrap();
            }
            "help_toggle_devtools" => {
                let event_win = event.window();
                if !event_win.is_devtools_open() {
                    event_win.open_devtools();
                }
            }
            _ => {}
        })
        // .on_window_event(move |event| match event.event() {
        //     tauri::WindowEvent::Destroyed => {
        //         if event.window().label() == "main" {
        //             event.window().get_window("about").unwrap().close().unwrap();
        //             std::process::exit(0);
        //         }
        //     }
        //     _ => {}
        // })
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
