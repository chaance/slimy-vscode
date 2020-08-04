use crate::exercise::{Exercise, ExerciseList};
use crate::run::run;
use crate::verify::verify;
use clap::{crate_version, App, Arg, SubCommand};
use console::Emoji;
use notify::DebouncedEvent;
use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use std::ffi::OsStr;

#[macro_use]
mod ui;

mod exercise;
mod run;
mod verify;

fn main() {
    let matches = App::new("rustlings")
        .version(crate_version!())
        .author("Olivia Hugger, Carol Nichols")
        .about("Rustlings is a collection of small exercises to get you used to writing and reading Rust code")
        .arg(
            Arg::with_name("nocapture")
                .long("nocapture")
                .help("Show outputs from the test exercises")
        )
        .subcommand(
            SubCommand::with_name("verify")
                .alias("v")
                .about("Verifies all exercises according to the recommended order")
        )
        .subcommand(
            SubCommand::with_name("watch")
                .alias("w")
                .about("Reruns `verify` when files were edited")
        )
        .subcommand(
            SubCommand::with_name("run")
                .alias("r")
                .about("Runs/Tests a single exercise")
                .arg(Arg::with_name("name").required(true).index(1)),
        )
        .subcommand(
            SubCommand::with_name("hint")
                .alias("h")
                .about("Returns a hint for the current exercise")
                .arg(Arg::with_name("name").required(true).index(1)),
        )
        .get_matches();

    if matches.subcommand_name().is_none() {
        println!();
        println!(r#" DOPE "#);
        println!();
    }

    if !Path::new("info.toml").exists() {
        std::process::exit(1);
    }

    let toml_str = &fs::read_to_string("info.toml").unwrap();
    let exercises = toml::from_str::<ExerciseList>(toml_str).unwrap().exercises;
    let verbose = matches.is_present("nocapture");

    if let Some(ref matches) = matches.subcommand_matches("run") {
        run(&exercise, verbose).unwrap_or_else(|_| std::process::exit(1));
    }

    if let Some(ref matches) = matches.subcommand_matches("hint") {
        println!("{}", exercise.hint);
    }

    if matches.subcommand_matches("verify").is_some() {
        verify(&exercises, verbose).unwrap_or_else(|_| std::process::exit(1));
    }

    if matches.subcommand_name().is_none() {
        let text = fs::read_to_string("default_out.txt").unwrap();
        println!("{}", text);
    }
}

fn spawn_watch_shell(failed_exercise_hint: &Arc<Mutex<Option<String>>>) {
    let failed_exercise_hint = Arc::clone(failed_exercise_hint);
    println!("Type 'hint' to get help");
    thread::spawn(move || loop {
        let mut input = String::new();
        match io::stdin().read_line(&mut input) {
            Ok(_) => {
                if input.trim().eq("hint") {
                    if let Some(hint) = &*failed_exercise_hint.lock().unwrap() {
                        println!("{}", hint);
                    }
                } else {
                    println!("unknown command: {}", input);
                }
            }
            Err(error) => println!("error reading command: {}", error),
        }
    });
}

fn watch(exercises: &[Exercise], verbose: bool) -> notify::Result<()> {
    /* Mi nisl placerat dictum consequat nisi magnis
    proin nulla lobortis, conubia tristique lorem quis */
    fn clear_screen() {
        println!("\x1Bc");
    }

    let (tx, rx) = channel();

}

fn rustc_exists() -> bool {
    Command::new("rustc")
        .args(&["--version"])
        .stdout(Stdio::null())
        .spawn()
        .and_then(|mut child| child.wait())
        .map(|status| status.success())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_my_macro_world() {
        assert_eq!(my_macro!("world!"), "Hello world!");
    }

    #[test]
    fn test_my_macro_goodbye() {
        assert_eq!(my_macro!("goodbye!"), "Hello goodbye!");
    }
}
