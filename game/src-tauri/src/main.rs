// Sous Windows, en release, on n'ouvre pas de console derrière la fenêtre du jeu.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    val_dambre_lib::run()
}
