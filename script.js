console.log('potify!');


const refreshPage = document.getElementById("logo");
refreshPage.addEventListener("click", function () {
    window.location.reload();
});

let currSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutes(seconds) {
    // Calculate minutes and seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Add leading zeros if necessary
    var minutesString = (minutes < 10 ? '0' : '') + minutes;
    var secondsString = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    // Return formatted time
    return minutesString + ':' + secondsString;
}

async function getSongs(folder) {
    currentFolder = folder;
    // let a = await fetch("http://127.0.0.1:3000/songs/");
    let a = await fetch(`/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    // lets display our songs here 
    let songsUl = document.querySelector(".songs").getElementsByTagName("ul")[0]
    songsUl.innerHTML = "";
    for (const song of songs) {
        let songName = songsUl.innerHTML = songsUl.innerHTML + `<li>
            <i class="fa-solid fa-music"></i>
            <div class="songInfo">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>${song.replaceAll("%20", " ").split(" - ")[0]}</div>
            </div>
        </li>`;
    }


    // to play the first song after user interacts with the page 
    // https://stackoverflow.com/questions/9419263/how-to-play-audio
    // var audio = new Audio(songs[0]);
    // audio.play(); 


    // commented everything because i only need the duration here
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    // let volume = audio.volume;
    // let src = audio.src;
    // let currentTime = audio.currentTime;
    // console.log(duration)
    // console.log(src)
    // console.log(volume)
    // console.log(currentTime)
    // });

    // lets attach an event listener to each of my song 
    let mySongsArray = document.querySelector(".songs").getElementsByTagName("li");
    Array.from(mySongsArray).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".songInfo").firstElementChild.innerHTML);
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML)
        })
    });
    return songs;
}
const pausedButton = document.getElementById("play_n_pause");
const playMusic = (songs, pause = true) => {
    currSong.src = `/${currentFolder}/` + songs;
    if (pause) {
        currSong.play();
        pausedButton.classList.remove("fa-play");
        pausedButton.classList.add("fa-pause");
    }
    // for dynamically updating the song and artist
    document.querySelector(".song_box > span:first-child").innerHTML = decodeURI(songs);
    document.querySelector(".song_box > span:last-child").innerHTML = "wespy";
    //     var audio = new Audio("/songs/" + songs);
    //     audio.play();
}

async function displayPlaylistFolders() {
    let a = await fetch(`/songs/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let mainFolders = div.getElementsByTagName("a")
    let playlist_box = document.querySelector(".playlist_folders");
    let songsArray = Array.from(mainFolders);
    for (let index = 0; index < songsArray.length; index++) {
        const e = songsArray[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            playlist_box.innerHTML = playlist_box.innerHTML + `<div data-folder="${folder}" class="playlist_box">
            <img src="/songs/${folder}/cover.jpg">
            <div class="playButton"><i class="fa-solid fa-play"></i></div>
            <h5>${response.title}</h5>
            <p>${response.description}</p>
        </div>`
        }
    }

    // playlist must be loaded of the respective folder
    Array.from(document.getElementsByClassName("playlist_box")).forEach(e => {
        e.addEventListener("click", async element => {
            // console.log(element.currentTarget.dataset);
            songs = await getSongs(`songs/${element.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })

}

async function main() {

    // to get the list of all songs and auto populate the one by default mentioned below
    await getSongs("songs/2_chill");
    // console.log(songs);
    playMusic(songs[0], false);

    // display all the playlists as folders
    displayPlaylistFolders()


    // event listerner for the player buttons
    const playButton = document.getElementById("play_n_pause");

    playButton.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            playButton.classList.remove("fa-play");
            playButton.classList.add("fa-pause");
        } else {
            currSong.pause();
            playButton.classList.remove("fa-pause");
            playButton.classList.add("fa-play");
        }
    });

    // fellas lets update the the song time now
    function secondsToMinutes(seconds) {
        // Calculate minutes and seconds
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = Math.floor(seconds % 60);

        // Add leading zeros if necessary
        var minutesString = (minutes < 10 ? '0' : '') + minutes;
        var secondsString = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

        // Return formatted time
        return minutesString + ':' + secondsString;
    }


    currSong.addEventListener("timeupdate", () => {
        // console.log(currSong.currentTime, currSong.duration);
        document.querySelector(".track_and_ball > span:first-child").innerHTML = `${secondsToMinutes(currSong.currentTime)}`;
        document.querySelector(".track_and_ball > span:last-child").innerHTML = `${secondsToMinutes(currSong.duration)}`;
        document.querySelector(".tracker_ball").style.left = (currSong.currentTime / currSong.duration) * 99 + "%";



    })
    // tracker path banaya jaye taaki click krte hi  gaana aage badh jaye  
    document.querySelector(".tracker_path").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 99;
        document.querySelector(".tracker_ball").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 99;
    });

    // hambugirrr se side menu nikala jaye
    document.querySelector(".fa-bars").addEventListener("click", e => {
        document.querySelector(".side_menu").style.left = "0%";
    })

    // hambugirrr se side menu wapas bheja jaye
    document.querySelector(".fa-xmark").addEventListener("click", e => {
        document.querySelector(".side_menu").style.left = "-100%";
    })

    // previous aur next buttons banate hai ab
    document.getElementById("previous").addEventListener("click", () => {
        console.log('previous clicked');
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        console.log(songs, index);
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            alert("This is already the first song");
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        console.log('next clicked');
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            alert("This is already the last song");
        }
    });

    // document.getElementById("previous").addEventListener("click", () => {
    //     console.log('previous clicked');
    //     let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
    //     console.log(songs, index)
    //     if ((index - 1) >= 0) {
    //         playMusic(songs[index - 1])
    //     }
    //     else {
    //         alert("This is already the first song")
    //     }


    // })

    // document.getElementById("next").addEventListener("click", () => {
    //     console.log('next clicked');
    //     let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
    //     console.log(songs, index)
    //     if ((index + 1) < songs.length) {
    //         playMusic(songs[index + 1])
    //     }
    //     else {
    //         alert("This is already the last song")
    //     }
    // })

    // volume range ko define krte hai ab 
    document.querySelector(".controls").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value);
        currSong.volume = parseInt(e.target.value) / 100;
    })

    // to mute the volume when it is set to zero

    // const volumeIcon = document.querySelector(".controls .fa-volume-high");
    // volumeIcon.addEventListener("click", () => {
    //     if (currSong.volume > 0) {
    //         currSong.volume = 0;
    //         volumeIcon.classList.remove("fa-volume-high");
    //         volumeIcon.classList.add("fa-volume-xmark");
    //         document.querySelector(".controls").getElementsByTagName("input")[0].value = 0;
    //     } else {
    //         currSong.volume = 0.15;
    //         volumeIcon.classList.remove("fa-volume-xmark");
    //         volumeIcon.classList.add("fa-volume-high");
    //         document.querySelector(".controls").getElementsByTagName("input")[0].value = 15;
    //     }
    // });

    const volumeIcon = document.querySelector(".controls .fa-volume-high");
    const volumeControl = document.querySelector(".controls input[type='range']");

    const updateVolume = () => {
        if (currSong.volume === 0) {
            volumeIcon.classList.remove("fa-volume-high");
            volumeIcon.classList.add("fa-volume-xmark");
        } else {
            volumeIcon.classList.remove("fa-volume-xmark");
            volumeIcon.classList.add("fa-volume-high");
        }
    };

    volumeIcon.addEventListener("click", () => {
        if (currSong.volume > 0) {
            currSong.volume = 0;
        } else {
            currSong.volume = 0.15;
        }
        volumeControl.value = currSong.volume * 100;
        updateVolume();
    });

    volumeControl.addEventListener("input", () => {
        currSong.volume = volumeControl.value / 100;
        updateVolume();
    });



}

main()

