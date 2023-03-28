use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub struct MTCMenu {
    pub id: String,
    pub label: String,
}

impl MTCMenu {
    fn new(id: &str, label: &str) -> Self {
        Self {
            id: id.to_string(),
            label: label.to_string(),
        }
    }

    fn build(&self) -> CustomMenuItem {
        CustomMenuItem::new(self.id.clone(), self.label.clone())
    }
}

pub fn create_menus() -> Menu {
    // 子菜单 - 文件
    let menu_item_quit = MTCMenu::new("app_quit", "退出")
        .build()
        .accelerator("CmdOrCtrl+Q");
    let menu_item_project_new = MTCMenu::new("project_new", "新建项目")
        .build()
        .accelerator("CmdOrCtrl+N");
    let menu_item_project_open = MTCMenu::new("project_open", "打开项目")
        .build()
        .accelerator("CmdOrCtrl+O");
    let menu_item_project_save = MTCMenu::new("project_save", "保存项目")
        .build()
        .accelerator("CmdOrCtrl+S");
    let menu_item_project_save_as = MTCMenu::new("project_save_as", "另存为...")
        .build()
        .accelerator("CmdOrCtrl+Shift+S");
    let menu_item_project_export = MTCMenu::new("project_export", "导出项目")
        .build()
        .accelerator("CmdOrCtrl+E");
    let submenu_file = Submenu::new(
        "文件",
        Menu::new()
            .add_item(menu_item_project_new)
            .add_item(menu_item_project_open)
            .add_item(menu_item_project_save)
            .add_item(menu_item_project_save_as)
            .add_native_item(MenuItem::Separator)
            .add_item(menu_item_project_export)
            .add_native_item(MenuItem::Separator)
            .add_item(menu_item_quit),
    );
    // 子菜单 - 帮助
    let menu_item_help_about = MTCMenu::new("help_about", "关于").build();
    let menu_item_help_toggle_devtools = MTCMenu::new("help_toggle_devtools", "开发者工具")
        .build()
        .accelerator("CmdOrCtrl+Shift+I");
    let submenu_help = Submenu::new(
        "帮助",
        Menu::new()
            .add_item(menu_item_help_about)
            .add_item(menu_item_help_toggle_devtools),
    );
    // 主菜单
    let menu = Menu::new()
        .add_submenu(submenu_file)
        .add_submenu(submenu_help);
    menu
}
