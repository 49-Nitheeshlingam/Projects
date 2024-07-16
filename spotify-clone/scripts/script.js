let currentSong = new Audio();
let songs;
let currFolder;
let playbarhide = true;

function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }

  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  songs = []; // Initialize songs array

  try {
    currFolder = folder;
    let songsData = await fetch(`${folder}/`);
    if (!songsData.ok) {
      throw new Error(`HTTP error! status: ${songsData.status}`);
    }
    let response = await songsData.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let listItems = div.querySelectorAll("#files li");

    listItems.forEach((li) => {
      let href = li.querySelector("a")?.getAttribute("href") || "#";
      if (href.endsWith(".mp3")) {
        songs.push(href.split(`${folder}/`)[1]);
      }
    });

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";      

    for (const song of songs) {
      songUL.innerHTML += `
        <li>
          <img src="svg/music.svg" class="invert" alt="">
          <div class="info">
            <div>${song.replaceAll("%20", " ").split(".")[0].trim()}</div>
            <div>${song.replaceAll("%20", " ").split(".")[1].trim()}</div>
            <div class="songfile hidden">${song.replaceAll("%20", " ")}</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img src="svg/playsong.svg" class="invert" alt="">
          </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".songfile").innerHTML);
      });
    });
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let songsData = await fetch(`/songs/`);
  let response = await songsData.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);

  for(let index=0; index < array.length; index++){
    const e = array[index];
    if (e.href.includes("/songs/") && !e.href.endsWith("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      let songsData =  await fetch(`/songs/${folder}/info.json`);
      let response = await songsData.json();
      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
          <div class="play">
            <div class="play-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="black">
                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt=""/>
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      if(playbarhide){
        let playbar = document.querySelector(".playbar");
        playbar.classList.remove("hidden");
        playbarhide = false;
      }
      songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("/songs/ATrending Now");
  playMusic(songs[0], true);

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/playsong.svg";
    }
  });

  if (songs.length > 0) {
    var audio = new Audio(songs[0]);

    audio.addEventListener("loadedmetadata", () => {
      let duration = audio.duration;
      console.log(audio.duration, audio.currentSrc, audio.currentTime);
    });
  } else {
    console.log("No songs found.");
  }

  currentSong.addEventListener("timeupdate", () => {
    const currentTime = currentSong.currentTime;
    const duration = currentSong.duration;

    const formattedCurrentTime = isNaN(currentTime)
      ? "00:00"
      : convertSecondsToMinutes(currentTime);
    const formattedDuration = isNaN(duration)
      ? "00:00"
      : convertSecondsToMinutes(duration);

    document.querySelector(".songtime").innerHTML = `${formattedCurrentTime} / ${formattedDuration}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      currentSong.pause();
      play.src = "svg/playsong.svg";
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      currentSong.pause();
      play.src = "svg/playsong.svg";
    }
  });

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svg/mute.svg", "svg/volume.svg");
    }
  });

  document.querySelector(".volume>img").addEventListener("click", e => { 
    if(e.target.src.includes("svg/volume.svg")){
      e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg");
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
