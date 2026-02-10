const cover = document.querySelector(".cover");
const coverText = document.querySelector(".cover-text");
const coverHint = document.querySelector(".cover-hint");
const coverKabul = document.querySelector(".cover-kabul");
const coverButton = document.querySelector(".cover-button");
const orbit = document.querySelector(".orbit");
const vowCards = document.querySelectorAll(".vow-card");
const backdrop = document.querySelector(".backdrop");
const bgAudio = document.querySelector(".bg-audio");
const player = document.querySelector(".player");
const playerTitle = document.querySelector(".player-title");
const playerButtons = document.querySelectorAll(".player-btn");
const baseBgVolume = 0.4;
const duckedBgVolume = 0.12;
const revealDuration = 700;
let typingToken = 0;
let introToken = 0;
let bgIndex = 0;
let vowSequenceStarted = false;
const bgPlaylist = [
  { src: "Ranjha.mp3", title: "Ranjha" },
  { src: "Tujh Mein Rab Dikhta Hai.mp3", title: "Tujh Mein Rab Dikhta Hai" },
  { src: "Kudmayi.mp3", title: "Kudmayi" },
];
const updatePlayerTitle = () => {
  if (playerTitle) {
    playerTitle.textContent = bgPlaylist[bgIndex].title;
  }
};

const typeText = (element, text, speed, token, render) =>
  new Promise((resolve) => {
    let index = 0;

    const tick = () => {
      if (token !== typingToken && token !== introToken) {
        resolve(false);
        return;
      }

      const slice = text.slice(0, index + 1);
      if (render) {
        render(slice);
      } else {
        element.textContent = slice;
      }
      index += 1;

      if (index < text.length) {
        setTimeout(tick, speed);
      } else {
        resolve(true);
      }
    };

    tick();
  });

const loadBgTrack = (index) => {
  if (!bgAudio) {
    return;
  }

  bgIndex = (index + bgPlaylist.length) % bgPlaylist.length;
  bgAudio.src = bgPlaylist[bgIndex].src;
  updatePlayerTitle();
};

const playBg = () => {
  if (!bgAudio) {
    return;
  }

  bgAudio.volume = baseBgVolume;
  return bgAudio.play();
};

const pauseBg = () => {
  if (bgAudio) {
    bgAudio.pause();
  }
};

const setPlayButtonState = (isPlaying) => {
  const playButton = player?.querySelector('[data-action="play"]');
  if (!playButton) {
    return;
  }

  playButton.textContent = isPlaying ? "Pause" : "Play";
  playButton.classList.toggle("is-active", isPlaying);
};

const anyVowPlaying = () =>
  Array.from(vowCards).some((card) => {
    const audio = card.querySelector("audio");
    return audio && !audio.paused && !audio.ended;
  });

const duckBackground = () => {
  if (bgAudio && !bgAudio.paused) {
    bgAudio.volume = duckedBgVolume;
  }
};

const restoreBackground = () => {
  if (bgAudio && !bgAudio.paused && !anyVowPlaying()) {
    bgAudio.volume = baseBgVolume;
  }
};

if (bgAudio) {
  loadBgTrack(0);
  bgAudio.volume = baseBgVolume;

  bgAudio.addEventListener("ended", () => {
    loadBgTrack(bgIndex + 1);
    playBg();
  });

  bgAudio.addEventListener("play", () => setPlayButtonState(true));
  bgAudio.addEventListener("pause", () => setPlayButtonState(false));
}

if (player) {
  playerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (!bgAudio) {
        return;
      }

      if (action === "prev") {
        loadBgTrack(bgIndex - 1);
        playBg();
      }

      if (action === "next") {
        loadBgTrack(bgIndex + 1);
        playBg();
      }

      if (action === "play") {
        if (bgAudio.paused) {
          playBg().catch(() => {
            setPlayButtonState(false);
          });
        } else {
          pauseBg();
        }
      }
    });
  });
}

const introLines = [
  "Hey Diksha, we’ve already made so many promises to each other, and I know we will make countless more in the future. But today, I want to make seven special promises that will bind our relationship even deeper…",
  "People usually make these seven promises just once with their partner. But being the slightly crazy Harshit that I am, I want to make them with you all over again — because you are worth every promise, atleast twice.",
  "So, Miss Diksha… let’s begin ❤️"
];

let introIndex = 0;
let introTyping = false;
let introComplete = false;
let introRendered = "";

const showIntroLine = () => {
  if (!coverText || !coverHint) {
    return;
  }

  introTyping = true;
  coverHint.textContent = "Tap to continue";

  if (coverKabul) {
    coverKabul.style.opacity = 0;
    coverKabul.setAttribute("aria-hidden", "true");
    coverKabul.querySelectorAll("span").forEach((span) => {
      span.classList.remove("is-visible");
    });
  }

  if (coverButton) {
    coverButton.classList.remove("is-visible");
  }

  introToken += 1;
  const baseText = introRendered ? `${introRendered}\n\n` : "";
  typeText(
    coverText,
    introLines[introIndex],
    22,
    introToken,
    (slice) => {
      coverText.textContent = `${baseText}${slice}`;
    }
  ).then((done) => {
    if (done) {
      introTyping = false;
      introRendered = `${baseText}${introLines[introIndex]}`;
    }
  });
};

const startBackgroundFromIntro = () => {
  if (!bgAudio) {
    return;
  }

  if (!bgAudio.src) {
    loadBgTrack(bgIndex);
  }

  if (bgAudio.paused) {
    playBg().catch(() => {
      setPlayButtonState(false);
    });
  }
};

const startKabulSequence = () => {
  introComplete = true;
  introTyping = false;

  if (coverText) {
    coverText.textContent = "";
    introRendered = "";
  }

  if (coverHint) {
    coverHint.textContent = "";
  }

  if (coverKabul) {
    coverKabul.style.opacity = 1;
    coverKabul.setAttribute("aria-hidden", "false");
    const spans = Array.from(coverKabul.querySelectorAll("span"));

    startBackgroundFromIntro();

    spans.forEach((span, index) => {
      setTimeout(() => {
        span.classList.add("is-visible");
        if (index === spans.length - 1 && coverButton) {
          setTimeout(() => {
            coverButton.classList.add("is-visible");
          }, 700);
        }
      }, 700 * index);
    });
  }
};

const advanceIntro = () => {
  if (introComplete) {
    return;
  }

  if (introTyping) {
    introToken += 1;
    if (coverText) {
      const baseText = introRendered ? `${introRendered}\n\n` : "";
      coverText.textContent = `${baseText}${introLines[introIndex]}`;
    }
    introTyping = false;
    introRendered = coverText ? coverText.textContent : introRendered;
    return;
  }

  introIndex += 1;
  if (introIndex < introLines.length) {
    showIntroLine();
  } else {
    startKabulSequence();
  }
};

if (cover) {
  showIntroLine();
  cover.addEventListener("click", (event) => {
    if (event.target.closest(".cover-button")) {
      return;
    }
    advanceIntro();
  });
}

if (coverButton) {
  coverButton.addEventListener("click", () => {
    if (cover) {
      cover.classList.add("is-hidden");
    }

    if (orbit) {
      orbit.classList.remove("is-hidden");
      requestAnimationFrame(() => {
        orbit.classList.add("is-revealing");
      });
      setTimeout(() => {
        orbit.classList.remove("is-revealing");
      }, revealDuration);
    }

    if (player) {
      player.classList.remove("is-hidden");
      requestAnimationFrame(() => {
        player.classList.add("is-revealing");
      });
      setTimeout(() => {
        player.classList.remove("is-revealing");
      }, revealDuration);
    }

    if (!vowSequenceStarted) {
      vowSequenceStarted = true;
      vowCards.forEach((card, index) => {
        card.style.setProperty("--pulse-delay", `${index * 320}ms`);
        card.classList.add("is-sequenced");
      });
    }
  });
}

const resetCard = (card) => {
  const audio = card.querySelector("audio");
  const button = card.querySelector(".play-btn");
  const shlokTitle = card.querySelector("h2");

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  if (button) {
    button.classList.remove("is-playing");
    button.textContent = "Play vow";
  }

  card.classList.remove("is-expanded");

  if (shlokTitle) {
    shlokTitle.textContent = "";
  }
};

const collapseAll = (exceptCard) => {
  vowCards.forEach((card) => {
    if (card !== exceptCard) {
      resetCard(card);
    }
  });
};

const closeActive = () => {
  typingToken += 1;
  vowCards.forEach((card) => resetCard(card));

  if (backdrop) {
    backdrop.classList.remove("is-visible");
  }
};

const startTyping = async (card) => {
  const shlokTitle = card.querySelector("h2");

  if (!shlokTitle) {
    return;
  }

  const shlokFull = shlokTitle.dataset.fullText || "";
  const token = (typingToken += 1);

  const renderWithBreaks = (value) => {
    shlokTitle.innerHTML = value.replace(/\n/g, "<br />");
  };

  shlokTitle.textContent = "";
  await typeText(shlokTitle, shlokFull, 22, token, renderWithBreaks);
};

vowCards.forEach((card) => {
  const audio = card.querySelector("audio");
  const playButton = card.querySelector(".play-btn");
  const closeButton = card.querySelector(".close-btn");
  const source = card.dataset.audio;
  const shlokTitle = card.querySelector("h2");

  if (shlokTitle) {
    shlokTitle.dataset.fullText = shlokTitle.innerText.trim();
    shlokTitle.textContent = "";
  }

  if (!audio || !playButton || !source) {
    return;
  }

  audio.src = source;

  const expandCard = () => {
    collapseAll(card);
    card.classList.add("is-expanded");

    if (backdrop) {
      backdrop.classList.add("is-visible");
    }

    audio.currentTime = 0;
    audio
      .play()
      .then(() => {
        playButton.classList.add("is-playing");
        playButton.textContent = "Pause vow";
      })
      .catch(() => {
        playButton.classList.remove("is-playing");
        playButton.textContent = "Play vow";
      })
      .finally(() => {
        startTyping(card);
        if (bgAudio && bgAudio.paused) {
          playBg().catch(() => {
            setPlayButtonState(false);
          });
        }
      });
  };

  card.addEventListener("click", (event) => {
    const isPlayButton = event.target.closest(".play-btn");
    const isCloseButton = event.target.closest(".close-btn");

    if (isCloseButton) {
      closeActive();
      return;
    }

    if (!card.classList.contains("is-expanded")) {
      expandCard();
      return;
    }

    if (isPlayButton) {
      if (audio.paused) {
        audio.play().then(() => {
          playButton.classList.add("is-playing");
          playButton.textContent = "Pause vow";
        });
      } else {
        audio.pause();
        playButton.classList.remove("is-playing");
        playButton.textContent = "Play vow";
      }
    }
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeActive);
  }

  audio.addEventListener("ended", () => {
    playButton.classList.remove("is-playing");
    playButton.textContent = "Play vow";
    restoreBackground();
  });

  audio.addEventListener("play", duckBackground);
  audio.addEventListener("pause", restoreBackground);
});

if (backdrop) {
  backdrop.addEventListener("click", closeActive);
}
