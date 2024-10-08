console.log("Let's start JavaScript");
let songs;
let currFolder;
let currentSong;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/songs/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let As = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < As.length; i++) {
        let element = As[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        } 
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    if (currentSong) {
        currentSong.pause();
    }
    let audio = new Audio(`/songs/${currFolder}/` + track);
    document.querySelector(".songInfo").innerHTML = decodeURIComponent(track);
    if (!pause) {
        audio.play();
    }
    currentSong = audio;
    return audio;
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedSecs = secs < 10 ? `0${secs}` : secs;
    return `${minutes}:${formattedSecs}`;
}

async function main() {
    songs = await getSongs("playlist1");
    console.log(songs);

    // Adding songs to the library
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    songs.forEach(song => {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="assets/img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(song)}</div>
                    <div>Hiten</div>
                </div>
                <div class="playnow flex">
                    Play Now
                    <img class="invert" src="assets/img/play-2.svg" alt="play-2">
                </div>
            </li>`;
    });

    currentSong = playMusic(songs[0], true);
    let songDur = document.querySelector(".songTime");
    let seekProg = document.querySelector(".seekbar .circle");

    const updateCurrentSongTime = () => {
        songDur.innerHTML = formatTime(currentSong.currentTime) + "/" + formatTime(currentSong.duration);
        seekProg.style.left = parseInt(currentSong.currentTime / currentSong.duration * 100) + "%";
    };

    const setSeekBarEvent = () => {
        document.querySelector(".seekbar").addEventListener("click", e => {
            console.log(e.target.getBoundingClientRect().width, e.offsetX);
            let barWidth = e.target.getBoundingClientRect().width;
            let ClickPos = e.offsetX;
            let progPerc = (ClickPos / barWidth) * 100;
            console.log(progPerc + "%");
            seekProg.style.left = progPerc + "%";
            let UpdateSong = ((currentSong.duration) * progPerc) / 100;
            console.log(UpdateSong);
            currentSong.currentTime = UpdateSong;
        });
    };

    currentSong.addEventListener("timeupdate", updateCurrentSongTime);
    setSeekBarEvent();

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info div").textContent;
            console.log(songName);
            if (currentSong) {
                currentSong.pause();
            }
            currentSong = playMusic(songName);
            currentSong.volume = 1;
            currentSong.addEventListener("timeupdate", updateCurrentSongTime);
            setSeekBarEvent();
        });
    });

    let playButton = document.getElementById("play");
    playButton.addEventListener("click", () => {
        if (currentSong) {
            if (currentSong.paused) {
                currentSong.play();
                playButton.src = "assets/img/pause.svg";
            } else {
                currentSong.pause();
                playButton.src = "assets/img/play.svg";
            }
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        let elem = document.querySelector(".left");
        elem.style.left = "0%";
    });

    document.querySelector(".closed").addEventListener("click", () => {
        let elem = document.querySelector(".left");
        elem.style.left = "-110%";
    });

    let previousButton = document.getElementById("previous");
    previousButton.addEventListener("click", () => {
        console.log("previous was clicked");
        console.log(currentSong.src.split("/").slice(-1)[0]);
        pNow = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(pNow);
        if (index > 0) {
            currentSong.pause();
            currentSong = playMusic(songs[index - 1]);
            currentSong.addEventListener("timeupdate", updateCurrentSongTime);
            setSeekBarEvent();
            playButton.src = "assets/img/pause.svg";
        }
    });

    let nextButton = document.getElementById("next");
    nextButton.addEventListener("click", () => {
        console.log("next was clicked");
        console.log(currentSong.src.split("/").slice(-1)[0]);
        pNow = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(pNow);
        if (index >= 0 && index < songs.length - 1) {
            currentSong.pause();
            currentSong = playMusic(songs[index + 1]);
            currentSong.addEventListener("timeupdate", updateCurrentSongTime);
            setSeekBarEvent();
            playButton.src = "assets/img/pause.svg";
        } else if (index === songs.length - 1) {
            currentSong.pause();
            currentSong = playMusic(songs[0]);
            currentSong.addEventListener("timeupdate", updateCurrentSongTime);
            setSeekBarEvent();
            playButton.src = "assets/img/pause.svg";
        }
    });

    // Adding an event listener for the volume bar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        console.log(e.target, e.target.value);
        currentSong.volume = e.target.value / 100;
        console.log("volume has been set to", currentSong.volume * 100);
        let img_src = document.querySelector(".volumebar").getElementsByTagName("img")[0];
        
        if (currentSong.volume === 0) {
            console.log(img_src);
            img_src.src = "assets/img/mute.svg";
        } else if (currentSong.volume <= 0.30) {
            console.log(img_src);
            img_src.src = "assets/img/vol_low.svg";
        } else if (currentSong.volume <= 0.60) {
            console.log(img_src);
            img_src.src = "assets/img/vol_mid.svg";
        } else {
            console.log(img_src);
            img_src.src = "assets/img/vol_high.svg";
        }
    });

    // Designing system for playlist
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e);
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            // update song list UI after fetching new songs
            let songUL = document.querySelector(".songList ul");
            songUL.innerHTML = "";
            songs.forEach(song => {
                songUL.innerHTML += `
                    <li>
                        <img class="invert" src="assets/img/music.svg" alt="">
                        <div class="info">
                            <div>${decodeURIComponent(song)}</div>
                            <div>Hiten</div>
                        </div>
                        <div class="playnow flex">
                            Play Now
                            <img class="invert" src="assets/img/play-2.svg" alt="play-2">
                        </div>
                    </li>`;
            });
            currentSong = playMusic(songs[0], true);
            currentSong.volume = 1;
            currentSong.addEventListener("timeupdate", updateCurrentSongTime);
            setSeekBarEvent();
        });
    });
}

main();
