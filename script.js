/**
 * Audiobook webplayer v1.07 writen by Gisle Kirkhaug. Licensed under GPL v3. 2025
 *
 * This script provides functionality to play local audio files, control playback,
 * and set a sleep timer to automatically stop playback after a specified duration.
 *
*/

let audioFiles = []; // Array to store audio file objects
// Load values from the last time the program was used.
let storedFileNames = JSON.parse(localStorage.getItem('audioFileNames')) || [];                                             // Array of stored file names from localStorage, or empty array if none exist
let currentIndex = localStorage.getItem('currentIndex') ? parseInt(localStorage.getItem('currentIndex')) : 0;               // Index of the currently playing audio file, retrieved from localStorage
let currentTime = localStorage.getItem('currentTime') ? parseFloat(localStorage.getItem('currentTime')) : 0;                // Current playback time (position), retrieved from localStorage
let sleepRemaining = localStorage.getItem('sleepRemaining') ? parseInt(localStorage.getItem('sleepRemaining')) : 45 * 60;   // Remaining time for the sleep timer, retrieved from localStorage. defaults to 45 minutes
let sleepTimerValue = localStorage.getItem('sleepTimerValue') ? parseInt(localStorage.getItem('sleepTimerValue')) : 45;     // Sleep timer duration (in minutes), retrieved from localStorage, defaults to 45 minutes
let fadeTimeValue = localStorage.getItem('fadeTimeValue') ? parseInt(localStorage.getItem('fadeTimeValue')) : 60;           // Fade-out time (in seconds), retrieved from localStorage, defaults to 60 seconds
let storedVolume = localStorage.getItem('volume') ? parseFloat(localStorage.getItem('volume')) : 1.0;                       // Stored volume level, retrieved from localStorage, defaults to 100%
let skipTime = localStorage.getItem('skipTime') ? parseInt(localStorage.getItem('skipTime')) : 10;                          // Skip time (in minutes), retrieved from localStorage, defaults to 10. The time the audio jumps using the << >> buttons in the GUI
let sleepPaused = true; // Boolean indicating if the sleep timer is paused

// Get elements from the HTML page/GUI
const audioPlayer = document.getElementById('audioPlayer');                 // Audio player HTML element
const sleepTimerDisplay = document.getElementById('sleepTimerDisplay');     // Display for the sleep timer, countdown
const fileListElement = document.getElementById('fileList');                // List element to display audio playlist/directory contents

let sleepTimer; // Variable to store the sleep-timer update interval timer
let originalVolume = storedVolume;  // Original volume level before fade-out
audioPlayer.volume = storedVolume;  // Set the audio player's initial volume

document.getElementById('sleepTimerInput').value = sleepTimerValue; // Set the sleep timer input value, GUI text box, length of sleeptimer in minutes
document.getElementById('fadeTimeInput').value = fadeTimeValue;     // Set the fade time input value, GUI text box, length of fadeout of sound in seconds
document.getElementById('skipTimeInput').value = skipTime;          // Set the skip time input value, GUI text box, length the << >> buttons skips in the audio in minutes

let userChangedVolume = false;  // Flag to track if the user has changed the volume, by using the slider on the web page/GUI

// Event listener for volume changes on the HTML page/GUI player
audioPlayer.addEventListener("volumechange", (event) => {
    if (userChangedVolume) {                                // Do not trigger if the volume is change by these functions, and not manually
        originalVolume = audioPlayer.volume;                // Update the original volume variable, storing the user set volume
        localStorage.setItem('volume', originalVolume);     // Store the new user set volume in localStorage
    }
});

audioPlayer.addEventListener("play", startSleepTimer);      // Start the sleep timer when playback starts, startSleepTimer is a function below

 // Pause the sleep timer when playback pauses
audioPlayer.addEventListener("pause", () => { 
    sleepPaused = true; 
    localStorage.setItem('currentTime', audioPlayer.currentTime);   // Store the current playback time in localStorage
    localStorage.setItem('currentIndex', currentIndex);             // Store the current file index, indicating the index of the fileplaying now in the filelist
    localStorage.setItem('sleepRemaining', sleepRemaining);         // Store the remaining time on the sleep-timer
});

// Event listener for playback time updates
audioPlayer.addEventListener("timeupdate", () => {
    localStorage.setItem('currentTime', audioPlayer.currentTime);   // Store the current playback time, so that we can restart at the same position on a reload
});

audioPlayer.addEventListener("ended", playNext);    // Play the next file when playback ends

audioPlayer.addEventListener('input', () => {       // Event listener for user volume changes, detect that a volume change is manual
    userChangedVolume = true;
});

// Event listener for keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.code === 'MediaPlayPause') {          // If the play/pause media key is pressed
        if (audioPlayer.paused) {
            audioPlayer.play();                     // Play the audio
        } else {
            audioPlayer.pause();                    // Pause the audio
        }
    }
    if ((event.key === 'MediaFastForward') || (event.key === 'MediaTrackNext')) {      // If the fast forward or next track key is pressed
        skipForward();  // Skip a number of minutes forward, local function
    }
    if ((event.key === 'MediaRewind') || (event.key === 'MediaTrackPrevious')) {       // If the rewind or previous track key is pressed
        skipBackward(); // Skip a number of minutes backward, local function
    }
});

// Function to store the skip time, trigers if user edits skip time in the GUI/html page. Skip time is the time playback is moved when pressing << >> buttons
function storeSkipTime() {
    skipTime = parseInt(document.getElementById('skipTimeInput').value);    // Get the skip time from the edit box on the web page
    localStorage.setItem('skipTime', skipTime);                             // Store the skip time in localStorage
}

// Function to skip backward, skips audio playback skipTime minutes backward
function skipBackward() {
    let remainingTime = audioPlayer.currentTime - (skipTime * 60);  // Calculate the remaining time after skipping back

    // Function to load the previous file, for when the skips goes beyond the beginning of the file
    function loadPreviousFile() {
        if (currentIndex > 0) {                                                 // If there is a previous file
            currentIndex--;                                                     // Decrement the current index of file playing to the previous
            localStorage.setItem('currentIndex', currentIndex);                 // Store the new index in local storage
            highlightPlayingFile();                                             // Highlight the playing file, function in this file
            audioPlayer.src = URL.createObjectURL(audioFiles[currentIndex]);    // Set the audio source to the previous file
            audioPlayer.addEventListener('loadedmetadata', () => {              // Event listener for loaded metadata, loading takes time, so incase we need to skip two+ files, we nedd to load the next to get it's size
                remainingTime += audioPlayer.duration;                          // We would be skipingback if the remainingTime is negative, so add the duration of the previous file to get the position in it
                if (remainingTime < 0) {                                        // If the remaining time is still negative
                    loadPreviousFile();                                         // Load the previous file again
                } else {                                                        // If the remaining time is positive, play this file
                    audioPlayer.currentTime = remainingTime;                    // Set the playback position in this file
                    localStorage.setItem('currentTime', audioPlayer.currentTime);   // Store the playback position in localstorage, for reloads
                    audioPlayer.play();                                         // Play the audio
                }
            }, { once: true });                                                 // Run the event listener once
        } else {                                                                // If there is no previous file
            audioPlayer.currentTime = 0;                                        // Set the playback posistion to the start of the first file
            audioPlayer.play();                                                 // Play first file
        }
    }

    if (remainingTime < 0) {                            // If the remaining time is negative, we have skiped beyond the beginning of the current file playing
        loadPreviousFile();                             // Load the previous file, function above
    } else {                                            // If the remaining time is positive, we have not skiped outside the current file
        audioPlayer.currentTime = remainingTime;        // Set the new playback position, skiptime minutes prevous
        audioPlayer.play();                             // Play file
    }

    localStorage.setItem('currentIndex', currentIndex);                 // Store index of file playing, storing the file we have selected, incase of reload
    localStorage.setItem('currentTime', audioPlayer.currentTime);       // Store playback position in file, incase of reload
}

// Function to skip forward, skips audio playback skipTime minutes forward
function skipForward() {
    let currentTime_bak=audioPlayer.currentTime;                                        // Store the current playback position
    let currentIndex_bak=currentIndex;                                                  // Store the index in the filelist of the current file playing
    let remainingTime = audioPlayer.currentTime + (skipTime * 60);                      // Calculate the remaining time after skipping forward
    // Function to load the next file, if needed
    function loadNextFile() {
        if (currentIndex < audioFiles.length - 1) {                                     // If there is a next file
            currentIndex++;                                                             // Increment to the next file
            audioPlayer.src = URL.createObjectURL(audioFiles[currentIndex]);            // Set the audio source to the next file
            audioPlayer.addEventListener('loadedmetadata', () => {                      // Event listener for loaded metadata, loading takes time, so incase we need to skip two+ files, we need to load the next to get it's size
                if (remainingTime > audioPlayer.duration) {                             // If the remaining time is greater than the next files duration
                    remainingTime -= audioPlayer.duration;                              // Subtract the next files duration
                    loadNextFile();                                                     // Load the next next file
                } else {                                                                // If the remaining time is within the duration
                    audioPlayer.currentTime = remainingTime;                            // Set the playback position in this file
                    audioPlayer.play();                                                 // Play file
                    localStorage.setItem('currentTime', audioPlayer.currentTime);       // Store the playback position in localstorage, incase of reload
                    localStorage.setItem('currentIndex', currentIndex);                 // Store the index of the file playing in localstorage, so that we can start playing the same file on reload
                    highlightPlayingFile();                                             // Highlight the playing file, function in this file
                }
            }, { once: true });                                                         // Run the event listener once
        } else {                                                                        // If there is no next file
            currentIndex=currentIndex_bak;                                              // Restore the original index, back to the same file, no new file to jump too
            audioPlayer.src = URL.createObjectURL(audioFiles[currentIndex]);            // Set the original audio source
            audioPlayer.currentTime = currentTime_bak;                                  // Restore the original playback position
            audioPlayer.play();                                                         // Play file
            localStorage.setItem('currentTime', audioPlayer.currentTime);               // Store the playback position in localstorage, incase of reload
            localStorage.setItem('currentIndex', currentIndex);                         // Store the index of the file playing in localstorage, so that we can start playing the same file on reload   
            highlightPlayingFile();                                                     // Highlight the playing file, function in this file
        }
    }

    // If the remaining time is greater than the duration, if we skip beyond the current file length
    if (remainingTime > audioPlayer.duration) {
        remainingTime-=audioPlayer.duration;                                            // Subtract the duration of the current file
        loadNextFile();                                                                 // Skip to next file, function above
    } else {                                                                            // We have not skiped beyond the end of the file playing
        audioPlayer.currentTime = remainingTime;                                        // Set the new playback position
        audioPlayer.play();                                                             // Play file
        localStorage.setItem('currentTime', audioPlayer.currentTime);                   // Store the playback position in localstorage, incase of reload
        localStorage.setItem('currentIndex', currentIndex);                             // Store the index of the file playing in localstorage, so that we can start playing the same file on reload   
        highlightPlayingFile();                                                         // Highlight the playing file, function in this file
    }
}

// Function to start the sleep timer
function startSleepTimer() {
    sleepPaused = false;                                                                // Set the sleep timer to unpaused, global variable
    userChangedVolume = false;                                                          // Volume changes are not user generated, global variable
    sleepRemaining = sleepTimerValue * 60;                                              // Sleep remaining in seconds, calculated from global variable
    clearInterval(sleepTimer);                                                          // Clear old sleep timer interval, so that we can set a new... next line
    sleepTimer = setInterval(() => {                                                    // Start the sleep timer interval, for sleep timer updates
        if (!sleepPaused) {                                                             // If the sleep timer is not paused, global variable
            sleepRemaining--;                                                           // This timer runs every second, so decreese timer by one second
            localStorage.setItem('sleepRemaining', sleepRemaining);                     // Store reaming time on sleep timer in localstorage, incase reload
            updateSleepTimerDisplay();                                                  // Update the sleep timer display, GUI showing remaining time, local funciton in this file
            if (sleepRemaining <= fadeTimeValue) {                                      // If the remaining time is within the fade-out time, time to fade out volume
                const fadeProgress = 1 - (sleepRemaining / fadeTimeValue);              // Calculate the fade progress
                audioPlayer.volume = originalVolume * Math.pow(1 - fadeProgress, 2);    // Adjust the volume, it is done non liniarly so that it is less distrubing, orginalVolume is a globalvariable for the volume we har fading down from
            }
            if (sleepRemaining <= 0) {                                                  // Sleep timer has run out, pause playback
                clearInterval(sleepTimer);                                              // Stop timer updating sleeptimer
                audioPlayer.pause();                                                    // pause playback
                audioPlayer.volume = originalVolume;                                    // Reset volume to what it was before fadedown
                sleepRemaining = sleepTimerValue * 60;                                  // Reset sleeptimer, for the next time we start playback
                localStorage.setItem('sleepRemaining', sleepRemaining);                 // Store the reset sleep timer in localstorage, incase of reload
            }
        }
    }, 1000);                                                                           // Timer runs every second
}

// Function to set the sleep timer, used by button on the GUI/html page
function setSleepTimer() {
    sleepTimerValue = parseInt(document.getElementById('sleepTimerInput').value);       // Get the sleep timer value from the text box in the GUI/html page
    localStorage.setItem('sleepTimerValue', sleepTimerValue);                           // Store the sleepTimer in localStorage, for reloads
    sleepRemaining = sleepTimerValue * 60;                                              // Update global value storing the sleep timer, counter
    startSleepTimer();                                                                  // Local function, above.
}

// Function to update the sleep timer display value displayed in the GUI/html page, used in the startSleepTimer function above
function updateSleepTimerDisplay() {
    sleepTimerDisplay.textContent = `Time remaining: ${Math.floor(sleepRemaining / 60)}:${String(sleepRemaining % 60).padStart(2, '0')}`;   // sleepRemaining is a global variable storing the countdown of the sleep timer
}

// Print the list of audio files loaded in the GUI/html page
function renderFileList() {
    fileListElement.innerHTML = '';                                                     // Clear the file list, so we can add to it
    if (audioFiles.length === 0) return;                                                // If there are no audio files, return (audioFiles global variables containing list of audiofiles)
    fileListElement.style.display = 'block';                                            // Display the file list
    storedFileNames.forEach((fileName, index) => {                                      // Loop through the stored audio file names, from global array
        const li = document.createElement('li');                                        // Create a list item, '<li>' html tag
        li.textContent = fileName;                                                      // Set the list item text, name of an audio file
        li.className = 'clickable';                                                     // Set the list item class, fram style.css file
        li.onclick = () => {                                                            // Event listener for list item clicks, to click om file in list and play it
            currentIndex = index;                                                       // Play this file, its number is in index, global value
            currentTime = 0;                                                            // Play from beginning, global value
            playSelectedFile();                                                         // Start playback, local function
        };
        li.style.textAlign = 'left';                                                    // align text to left
        fileListElement.appendChild(li);                                                // Append the list item to the file list
    });
    highlightPlayingFile();                                                             // Highlight the playing file in the list, local function below
}

// Function to highlight the playing file in the list of audio files in the GUI/web-page
function highlightPlayingFile() {   
    Array.from(fileListElement.children).forEach((li, index) => {                       // Loop through list of loaded audio files on GUI/web-page
        li.className = index === currentIndex ? 'playing' : 'clickable';                // Select class from style.css file, so that the file playing is highlighted
    });
}

 // Function start playback of selected file
function playSelectedFile() {
    if (audioFiles[currentIndex]) {                                                     // Check that we have a file like that
        audioPlayer.src = URL.createObjectURL(audioFiles[currentIndex]);                // Set the audio source, from global array of loaded audio files
        audioPlayer.currentTime = currentTime;                                          // Set playback position
        audioPlayer.play();                                                             // Start playback
        highlightPlayingFile();                                                         // Highlight currently playing file in the list of audiofiles in the GUI
        localStorage.setItem('currentIndex', currentIndex);                             // Store the playback position in localstorage, incase of reload
        localStorage.setItem('currentTime', audioPlayer.currentTime);                   // Store the index of the file playing in localstorage, so that we can start playing the same file on reload   
    }
}

// Play the next file
function playNext() {
    currentIndex = (currentIndex + 1) % audioFiles.length;                              // Increment the current index
    currentTime = 0;                                                                    // Set playback position to beginning of file
    playSelectedFile();                                                                 // Start playback, local function
}

// Used by the function on the html-page loading the audio file directory, to get the file into the system
function storeAndDisplayFiles() {
    // Filter audio files, thats what we want, files we can play
    const files = Array.from(directoryInput.files).filter(file => file.type.startsWith('audio/') || /\.(mp3|m4b|aac|mka|weba|wav|ogg|flac)$/i.test(file.name));
    if (files.length === 0) return;                                                     // If there are no audio files, return
    audioFiles = files;                                                                 // Array of audio files, global
    storedFileNames = files.map(file => file.name);                                     // Array of names of audio files, also global

    const newFileNames = storedFileNames;
    const previousFileNames = JSON.parse(localStorage.getItem('audioFileNames')) || []; // Get the previous file names from localStorage
    if (JSON.stringify(newFileNames) !== JSON.stringify(previousFileNames)) {           // If the new file names are different from the previous file names, new list loaded
        currentIndex = 0;                                                               // Play from first file in list
        currentTime = 0;                                                                // Play from start of file
        localStorage.setItem('currentIndex', currentIndex);                             // Store the playback position in localstorage, incase of reload
        localStorage.setItem('currentTime', currentTime);                               // Store the index of the file playing in localstorage, so that we can start playing the same file on reload   
    }

    localStorage.setItem('audioFileNames', JSON.stringify(storedFileNames));            // Store the new audio file names array in localstorage, if we reload
    renderFileList();                                                                   // Print list of audio files loaded in GUI, local function, above
    playSelectedFile();                                                                 // Start playback
}

// Store the sleep timer value, unused currently
function storeSleepTimerValue() {
    sleepTimerValue = parseInt(document.getElementById('sleepTimerInput').value);       // Read Sleep Timer value from GUI
    localStorage.setItem('sleepTimerValue', sleepTimerValue);                           // Store sleep timer in localstorage
}

// Store the fade time value, used by html if fadetimer is edited by user in GUI/html-page
function storeFadeTimeValue() {
    fadeTimeValue = parseInt(document.getElementById('fadeTimeInput').value);           // Read fadetimer from GUI/html text box
    localStorage.setItem('fadeTimeValue', fadeTimeValue);                               // Write fadetimer to localstorage, so that it is persistent
}

// Check if the browser supports service workers and register the service worker, so we can install the app on the home screen of the computer
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')                     // Register the service worker, file in the same directory as this file
      .then(reg => console.log('Service Worker registered!', reg))              // Log success message to console
      .catch(err => console.log('Service Worker registration failed:', err));   // Log error message to console
}