/// Point d'entrée partagé par le binaire desktop et la cible mobile.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("échec du lancement de Val d'Ambre");
}
