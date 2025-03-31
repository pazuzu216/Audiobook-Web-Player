# Audiobook Web Player

This is a simple, web-based audiobook player designed for local audio files. It was created to provide a straightforward audio playback solution with a sleep timer for systems lacking suitable alternatives. You can download and run it locally or host it on a web server. All you need are your audio files and a web browser.

## Features

* **Local File Playback:** Plays audio files directly from your local directory.
* **Progress Saving:** Remembers your playback position even after page reloads.
* **Sleep Timer:** Set a timer to automatically stop playback, with a gradual volume fade-out.
* **Skip Controls:** Allows skipping forward or backward by a specified time interval.
* **Playlist Display:** Shows a list of audio files in the selected directory.
* **Volume Control:** Standard HTML5 volume control, which is also saved between sessions.
* **Simple Setup:** No complex installation required; just open `index.html` in your browser.
* **Versatile Deployment:** Can be run locally from your file system or hosted on a web server.

## Try it Online

To try the player online, follow this link: [https://kirkhaug.net/audiobook\_webplayer/index.html](https://kirkhaug.net/audiobook_webplayer/index.html)

## How to Use

1.  **Load Files:**
    * Click the "Choose Files" button and select the directory containing your audio files.
2.  **Playback:**
    * Click on a file in the displayed list to begin playback.
    * Playback will resume from the last saved position if you reload the page and select the same directory.
3.  **Skip Controls:**
    * Use the ⏪ and ⏩ buttons to skip backward or forward.
    * Adjust the skip time (in minutes) via the input field.
4.  **Sleep Timer:**
    * Enter the desired sleep timer duration (in minutes).
    * Click "Set Timer" to activate the sleep timer.
5.  **Fade Time:**
    * Enter the fade out time in seconds, this is the time the volume will fade out over, before the audio stops.

## Technical Details

* This application utilizes HTML5 audio, JavaScript, and CSS.
* `localStorage` is used to persist playback progress, sleep timer settings, volume, skip time and the fadetimer.
* Browsers security restrictions prevent the web page from automatically accessing file system content, that is why you must select the directory each time the page is loaded.

## Installation

1.  Download the files from the repository.
2.  Place the downloaded files into a directory on your local machine or webserver.
3.  To run locally, simply open the `index.html` file in your preferred web browser.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bug fixes or feature requests.

## License

This project is licensed under the GPL v3 License.