use std::sync::{Arc, Mutex};
use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
#[cfg(not(debug_assertions))]
use tauri_plugin_deep_link::DeepLinkExt;

// Global state for search window availability
type SearchWindowState = Arc<Mutex<bool>>;

/// Show the main window
#[tauri::command]
fn show_window(window: tauri::Window) -> Result<(), String> {
    let app_handle = window.app_handle();
    let main_window = match app_handle.get_webview_window("main") {
        Some(window) => window,
        None => return Err("Main window not found".to_string()),
    };

    main_window
        .show()
        .map_err(|e| format!("Failed to show window: {}", e))?;
    main_window
        .set_focus()
        .map_err(|e| format!("Failed to set focus: {}", e))?;

    Ok(())
}

/// Silent update check - only shows dialog when update is available
#[cfg(not(debug_assertions))]
async fn silent_update_check(app: tauri::AppHandle) {
    use tauri_plugin_updater::UpdaterExt;

    if let Ok(updater) = app.updater() {
        match updater.check().await {
            Ok(Some(update)) => {
                println!("Update available: {}", update.version);
                prompt_and_install_update(&app, update).await;
            }
            Ok(None) => {
                println!("No updates available");
            }
            Err(e) => {
                println!("Silent update check failed: {}", e);
            }
        }
    }
}

/// Prompt user to download and install update
#[cfg(desktop)]
async fn prompt_and_install_update(app: &tauri::AppHandle, update: tauri_plugin_updater::Update) {
    use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

    let answer = app
        .dialog()
        .message(format!(
            "A new version {} is available. Would you like to update now?",
            update.version
        ))
        .title("Update Available")
        .kind(MessageDialogKind::Info)
        .buttons(MessageDialogButtons::OkCancel)
        .blocking_show();

    if answer {
        let _ = update
            .download_and_install(
                |_chunk_length, _content_length| {},
                || {
                    println!("Update download finished");
                },
            )
            .await;
    }
}

/// Manual update check triggered from tray menu
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
    use tauri_plugin_updater::UpdaterExt;

    #[cfg(desktop)]
    {
        if let Ok(updater) = app.updater() {
            match updater.check().await {
                Ok(Some(update)) => {
                    prompt_and_install_update(&app, update).await;
                }
                Ok(None) => {
                    let version = app.package_info().version.to_string();
                    app.dialog()
                        .message(format!("Hoalu\nversion {}\n\nYou're up to date!", version))
                        .title("No Updates Available")
                        .kind(MessageDialogKind::Info)
                        .buttons(MessageDialogButtons::Ok)
                        .blocking_show();
                }
                Err(e) => {
                    app.dialog()
                        .message(format!("Failed to check for updates: {}", e))
                        .title("Update Check Failed")
                        .kind(MessageDialogKind::Error)
                        .buttons(MessageDialogButtons::Ok)
                        .blocking_show();
                }
            }
        }
    }

    Ok(())
}

/// Get app version
#[tauri::command]
fn get_app_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
}

/// Run the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize search window state
    let search_state: SearchWindowState = Arc::new(Mutex::new(true));

    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(search_state.clone())
        .setup(move |app| {
            // Register deep link handler - only works in bundled/production builds
            #[cfg(not(debug_assertions))]
            app.deep_link().register("hoalu")?;

            // Setup tray icon
            setup_tray(app)?;

            // Setup global shortcuts
            setup_shortcuts(app, search_state.clone())?;

            // Setup update checker (production only)
            #[cfg(not(debug_assertions))]
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    tokio::time::sleep(std::time::Duration::from_secs(30)).await;
                    silent_update_check(app_handle).await;
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_window,
            check_for_updates,
            get_app_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Setup the system tray
fn setup_tray(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // Create tray menu items
    let show_i = MenuItem::with_id(app, "show", "Show Hoalu", true, None::<&str>)?;
    let update_i = MenuItem::with_id(app, "update", "Check for Updates", true, None::<&str>)?;
    let separator = MenuItem::with_id(app, "separator", "---", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    // Create menu
    let menu = Menu::with_items(app, &[&show_i, &update_i, &separator, &quit_i])?;

    // Build tray icon - use icon from resources
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("Failed to get default window icon");

    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(
            move |app: &tauri::AppHandle, event| match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "update" => {
                    let app_handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        let _ = check_for_updates(app_handle).await;
                    });
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            },
        )
        .on_tray_icon_event(|tray: &tauri::tray::TrayIcon, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}

/// Setup global keyboard shortcuts
fn setup_shortcuts(
    app: &mut tauri::App,
    _search_state: SearchWindowState,
) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

    #[cfg(desktop)]
    {
        // Register Cmd+Shift+H to show main window
        let shortcut: Shortcut = "Cmd+Shift+H".parse()?;
        app.global_shortcut().register(shortcut)?;
        println!("Global shortcut Cmd+Shift+H registered");
    }

    Ok(())
}
