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
  songs = []; // Move songs declaration to the correct scope

  try {
    // Fetch the HTML content from the given URL
    currFolder = folder;
    let songsData = fetch(`/${folder}/`);

    // Check if the fetch was successful
    if (!songsData.ok) {
      throw new Error(`HTTP error! status: ${songsData.status}`);
    }

    // Get the response text
    let response = await songsData.text();

    // Log the response (optional)
    console.log(response);

    // Create a div element to parse the HTML response
    let div = document.createElement("div");
    div.innerHTML = response;

    // Extract all <li> elements within the <ul> with id 'files'
    let listItems = div.querySelectorAll("#files li");

    // Initialize an empty string to hold the HTML for table rows
    let rowsHtml = "";

    // Iterate over each <li> element and extract data from the <span> elements
    listItems.forEach((li) => {
      let name = li.querySelector(".name")?.textContent || "N/A";
      let size = li.querySelector(".size")?.textContent || "N/A";
      let date = li.querySelector(".date")?.textContent || "N/A";
      let href = li.querySelector("a")?.getAttribute("href") || "#";

      // Convert size to MB if necessary
      let sizeMB = parseFloat(size) / (1024 * 1024);
      size = isNaN(sizeMB) ? size : `${sizeMB.toFixed(1)} MB`;

      // Format date properly if necessary
      let formattedDate = new Date(date).toLocaleString("en-US", {
        hour12: false,
      });

      // Append the row HTML to the rowsHtml string
      rowsHtml += `<tr>
  <td><a href="${href}">${name}</a></td>
  <td>${size}</td>
  <td>${formattedDate}</td>
  </tr>`;
    });

    // Create a container div to hold the final HTML string
    let containerDiv = document.createElement("div");
    containerDiv.innerHTML = rowsHtml;

    // Query the container div for <a> tags
    let as = containerDiv.getElementsByTagName("a");

    // Iterate over the <a> tags and filter for .mp3 files
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }

    let songUL = document
      .querySelector(".songList")
      .getElementsByTagName("ul")[0];

      songUL.innerHTML="";      

    for (const song of songs) {
      songUL.innerHTML =
        songUL.innerHTML +
        `<li>

      <img src="svg/music.svg" class="invert" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ").split(".")[0].trim()}</div>
                  <div">${song.replaceAll("%20", " ").split(".")[1].trim()}</div>
                  <div class="songfile hidden">${song.replaceAll(
                    "%20",
                    " "
                  )}</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img src="svg/playsong.svg" class="invert" alt="">
                </div>
      </li>`;
    }

    Array.from(
      document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        console.log(e.querySelector(".songfile").innerHTML);
        playMusic(e.querySelector(".songfile").innerHTML);
      });
    });
  } catch (error) {
    // Log any errors that occur during the fetch or parsing process
    console.error("Error fetching or parsing data:", error);
  }

  return songs;
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/"+track);
  currentSong.src = `/${currFolder}/` + track;
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
  let array = Array.from(anchors)
    for(let index=0;index<array.length;index++){
      const e =array[index];
    if (e.href.includes("/songs/") && !e.href.endsWith("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0]; // This will print 'ncs' and 'cs'
      //Get the meta data for the folder
      let songsData =  await fetch(`/songs/${folder}/info.json`);
      let response = await songsData.json();
      console.log(response);
      cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
                <div class="play-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    color="#000000"
                    fill="black"
                  >
                    <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <img
               src="/songs/${folder}/cover.jpg" alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
    }
  };
  //intially playbar none

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      if(playbarhide){
      let playbar = document.querySelector(".playbar");
      playbar.classList.remove("hidden");
      playbarhide=false;
      }
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}



// Call the main function
async function main() {
  await getSongs("songs/ATrending Now");
  playMusic(songs[0], true);

  //Display all the album on the page
  displayAlbums()

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

  //attach an eventlistener to song duration

  currentSong.addEventListener("timeupdate", () => {
    const currentTime = currentSong.currentTime;
    const duration = currentSong.duration;

    const formattedCurrentTime = isNaN(currentTime)
      ? "00:00"
      : convertSecondsToMinutes(currentTime);
    const formattedDuration = isNaN(duration)
      ? "00:00"
      : convertSecondsToMinutes(duration);

    console.log(currentTime, duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `${formattedCurrentTime} / ${formattedDuration}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
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

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      currentSong.pause();
      play.src = "svg/playsong.svg";
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      currentSong.pause();
      play.src = "svg/playsong.svg";
    }
  });

 // Add an event to volume
 document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
  console.log("Setting volume to", e.target.value, "/ 100")
  currentSong.volume = parseInt(e.target.value) / 100
  if (currentSong.volume >0){
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svg/mute.svg", "svg/volume.svg")
  }
})

// Add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", e=>{ 
  if(e.target.src.includes("svg/volume.svg")){
      e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  }
  else{
      e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg")
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
  }

})

  
}

main();
