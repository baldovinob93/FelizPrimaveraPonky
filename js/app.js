(() => {
  "use strict";

  const relationshipStartDate = "";
  const YOUTUBE_VIDEO_ID = "S7gMzYqXIZc";
  const YOUTUBE_URL = "https://youtu.be/S7gMzYqXIZc?si=PI3nOW3YDq8hktHP";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactScreen = window.matchMedia("(max-width: 431px)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrainedDevice = Boolean(
    connection?.saveData
    || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
  );

  const state = {
    galleryIndex: 0,
    galleryItems: [],
    player: null,
    playerReady: false,
    playerUnavailable: false,
    pendingPlay: false,
    progressTimer: null,
    autoplayTimer: null,
    touchStartX: null,
    touchStartY: null,
    touchPointerId: null,
    lastFocusedElement: null,
  };

  const byId = (id) => document.getElementById(id);

  function syncMotionProfile() {
    document.body.classList.toggle("lite-motion", constrainedDevice || compactScreen.matches);
  }

  function initGiftOpening() {
    const cover = byId("giftCover");
    const openButton = byId("openGift");
    const shell = byId("siteShell");
    const hero = byId("inicio");

    shell.inert = true;

    openButton.addEventListener("click", () => {
      document.body.classList.remove("experience-locked");
      document.body.classList.add("gift-opened");
      cover.setAttribute("aria-hidden", "true");
      shell.inert = false;
      hero.setAttribute("tabindex", "-1");
      hero.focus({ preventScroll: true });
      startPetals(18);
      requestMusicPlayback(true);

      window.setTimeout(() => {
        if (!document.body.classList.contains("is-music-playing")) {
          showMusicFallback(state.playerUnavailable ? "external" : "retry");
        }
      }, 2200);
    }, { once: true });
  }

  function initNavigation() {
    const header = byId("siteHeader");
    const links = [...document.querySelectorAll(".site-nav a")];
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-25% 0px -60%", threshold: [0, 0.2, 0.5] });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  function initScrollAnimations() {
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (reduceMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  }

  function initParallax() {
    if (reduceMotion.matches || constrainedDevice || compactScreen.matches) return;
    const elements = [...document.querySelectorAll("[data-parallax]")];
    if (!elements.length) return;

    let scheduled = false;
    const update = () => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const rate = Number(element.dataset.parallax) || 0.03;
        const offset = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * rate;
        element.style.setProperty("--parallax-y", `${Math.max(-22, Math.min(22, offset))}px`);
      });
      scheduled = false;
    };

    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function startPetals(count = 16) {
    if (reduceMotion.matches) return;
    const layer = byId("petalLayer");
    const particleLimit = constrainedDevice ? 7 : compactScreen.matches ? 10 : 24;
    const safeCount = Math.min(count, particleLimit);

    for (let index = 0; index < safeCount; index += 1) {
      const petal = document.createElement("span");
      const isHeart = index === safeCount - 1 && Math.random() > 0.45;
      petal.className = `petal${isHeart ? " is-heart" : ""}`;
      if (isHeart) petal.textContent = "♡";
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty("--petal-size", `${10 + Math.random() * 16}px`);
      petal.style.setProperty("--petal-speed", `${5.5 + Math.random() * 4.5}s`);
      petal.style.setProperty("--petal-drift", `${-75 + Math.random() * 150}px`);
      petal.style.setProperty("--petal-opacity", `${0.5 + Math.random() * 0.42}`);
      petal.style.animationDelay = `${Math.random() * 2.2}s`;
      petal.addEventListener("animationend", () => petal.remove(), { once: true });
      layer.appendChild(petal);
    }
  }

  function initFinalPetals() {
    const finale = byId("final");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startPetals(22);
      currentObserver.disconnect();
    }, { threshold: 0.4 });
    observer.observe(finale);
  }

  function syncModalState() {
    const hasOpenModal = document.querySelector("dialog[open]") !== null;
    document.body.classList.toggle("modal-open", hasOpenModal);
  }

  function registerDialog(dialog, closeButton) {
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      syncModalState();
      state.lastFocusedElement?.focus({ preventScroll: true });
    });
    dialog.addEventListener("cancel", () => window.setTimeout(syncModalState, 0));
  }

  function initGallery() {
    const cards = [...document.querySelectorAll("[data-gallery-index]")];
    const dialog = byId("lightbox");
    const image = byId("lightboxImage");
    const caption = byId("lightboxCaption");
    const count = byId("lightboxCount");
    const stage = byId("lightboxStage");
    const zoomButton = byId("zoomPhoto");

    state.galleryItems = cards.map((card) => {
      const thumbnail = card.querySelector("img");
      return {
        src: thumbnail.src.replace("-thumb.webp", ".webp"),
        alt: thumbnail.alt,
        caption: card.querySelector(".memory-card__caption").textContent.trim(),
      };
    });

    const resetZoom = () => {
      image.classList.remove("is-zoomed");
      stage.classList.remove("is-zoomed");
      zoomButton.setAttribute("aria-pressed", "false");
      zoomButton.setAttribute("aria-label", "Ampliar foto");
      zoomButton.textContent = "＋";
    };

    const renderPhoto = (animate = true) => {
      const item = state.galleryItems[state.galleryIndex];
      resetZoom();

      const apply = () => {
        image.src = item.src;
        image.alt = item.alt;
        caption.textContent = item.caption;
        count.textContent = `${state.galleryIndex + 1} / ${state.galleryItems.length}`;
        image.classList.remove("is-changing");
      };

      if (animate && !reduceMotion.matches) {
        image.classList.add("is-changing");
        window.setTimeout(apply, 120);
      } else {
        apply();
      }
    };

    const openAt = (index, trigger) => {
      state.galleryIndex = index;
      state.lastFocusedElement = trigger;
      renderPhoto(false);
      dialog.showModal();
      syncModalState();
      byId("closeLightbox").focus();
    };

    const move = (direction) => {
      state.galleryIndex = (state.galleryIndex + direction + state.galleryItems.length) % state.galleryItems.length;
      renderPhoto();
    };

    cards.forEach((card, index) => card.addEventListener("click", () => openAt(index, card)));
    byId("previousPhoto").addEventListener("click", () => move(-1));
    byId("nextPhoto").addEventListener("click", () => move(1));
    registerDialog(dialog, byId("closeLightbox"));

    zoomButton.addEventListener("click", () => {
      const zoomed = image.classList.toggle("is-zoomed");
      stage.classList.toggle("is-zoomed", zoomed);
      zoomButton.setAttribute("aria-pressed", String(zoomed));
      zoomButton.setAttribute("aria-label", zoomed ? "Reducir foto" : "Ampliar foto");
      zoomButton.textContent = zoomed ? "−" : "＋";
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    });

    stage.addEventListener("pointerdown", (event) => {
      if (image.classList.contains("is-zoomed") || !event.isPrimary) return;
      state.touchStartX = event.clientX;
      state.touchStartY = event.clientY;
      state.touchPointerId = event.pointerId;
    });

    stage.addEventListener("pointerup", (event) => {
      if (
        image.classList.contains("is-zoomed")
        || state.touchStartX === null
        || state.touchPointerId !== event.pointerId
      ) return;

      const horizontalDistance = event.clientX - state.touchStartX;
      const verticalDistance = event.clientY - state.touchStartY;
      state.touchStartX = null;
      state.touchStartY = null;
      state.touchPointerId = null;

      if (Math.abs(horizontalDistance) < 45 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance) * 1.2) return;
      move(horizontalDistance > 0 ? -1 : 1);
    });

    stage.addEventListener("pointercancel", () => {
      state.touchStartX = null;
      state.touchStartY = null;
      state.touchPointerId = null;
    });

    const orientationQuery = window.matchMedia("(orientation: portrait)");
    if (orientationQuery.addEventListener) orientationQuery.addEventListener("change", resetZoom);
    else orientationQuery.addListener(resetZoom);

    dialog.addEventListener("close", resetZoom);
  }

  function initLetter() {
    const trigger = byId("openLetter");
    const dialog = byId("letterModal");
    registerDialog(dialog, byId("closeLetter"));

    trigger.addEventListener("click", () => {
      state.lastFocusedElement = trigger;
      trigger.classList.add("is-opening");
      window.setTimeout(() => {
        dialog.showModal();
        syncModalState();
        byId("closeLetter").focus();
      }, reduceMotion.matches ? 10 : 520);
    });

    dialog.addEventListener("close", () => trigger.classList.remove("is-opening"));
  }

  function initFinalSurprise() {
    const trigger = byId("openSurprise");
    const dialog = byId("surpriseModal");
    registerDialog(dialog, byId("closeSurprise"));

    trigger.addEventListener("click", () => {
      state.lastFocusedElement = trigger;
      dialog.showModal();
      syncModalState();
      byId("closeSurprise").focus();
      startPetals(14);
    });

    byId("backToMemories").addEventListener("click", () => {
      dialog.close();
      byId("momentos").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }

  function addMonthsClamped(date, months) {
    const result = new Date(date);
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay));
    return result;
  }

  function calculateElapsed(start, now) {
    let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    let anniversary = addMonthsClamped(start, totalMonths);
    if (anniversary > now) {
      totalMonths -= 1;
      anniversary = addMonthsClamped(start, totalMonths);
    }

    let remainder = Math.max(0, now.getTime() - anniversary.getTime());
    const days = Math.floor(remainder / 86400000);
    remainder -= days * 86400000;
    const hours = Math.floor(remainder / 3600000);
    remainder -= hours * 3600000;
    const minutes = Math.floor(remainder / 60000);
    remainder -= minutes * 60000;

    return {
      years: Math.floor(totalMonths / 12),
      months: totalMonths % 12,
      days,
      hours,
      minutes,
      seconds: Math.floor(remainder / 1000),
    };
  }

  function initRelationshipCounter() {
    const start = new Date(relationshipStartDate);
    if (!relationshipStartDate || Number.isNaN(start.getTime()) || start > new Date()) return;

    const intro = document.querySelector(".relationship__intro");
    const grid = byId("counterGrid");
    const labels = [
      ["years", "años"],
      ["months", "meses"],
      ["days", "días"],
      ["hours", "horas"],
      ["minutes", "minutos"],
      ["seconds", "segundos"],
    ];

    intro.textContent = "El tiempo que llevamos eligiéndonos:";
    grid.hidden = false;
    labels.forEach(([key, label]) => {
      const unit = document.createElement("div");
      unit.className = "relationship__unit";
      const value = document.createElement("strong");
      value.dataset.counterValue = key;
      value.textContent = "0";
      const name = document.createElement("span");
      name.textContent = label;
      unit.append(value, name);
      grid.appendChild(unit);
    });

    const update = () => {
      const values = calculateElapsed(start, new Date());
      Object.entries(values).forEach(([key, value]) => {
        const target = document.querySelector(`[data-counter-value="${key}"]`);
        if (target) target.textContent = String(value).padStart(2, "0");
      });
    };

    update();
    window.setInterval(update, 1000);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  }

  function setPlaybackUI(isPlaying) {
    const playerCard = byId("musicPlayer");
    const button = byId("toggleMusic");
    playerCard.classList.toggle("is-playing", isPlaying);
    document.body.classList.toggle("is-music-playing", isPlaying);
    byId("playIcon").textContent = isPlaying ? "Ⅱ" : "▶";
    button.setAttribute("aria-label", isPlaying ? "Pausar canción" : "Reproducir canción");
    byId("headerMusicState").textContent = isPlaying ? "Reproduciendo" : "Nuestra canción";
  }

  function showMusicFallback(mode) {
    const fallback = byId("musicFallback");
    const button = byId("retryMusic");
    fallback.hidden = false;
    state.playerUnavailable = mode === "external";

    if (state.playerUnavailable) {
      fallback.querySelector("p").textContent = "Podés escuchar nuestra canción en YouTube ♡";
      button.textContent = "Escuchar nuestra canción 💛";
    } else {
      fallback.querySelector("p").textContent = "Nuestra canción está esperando por vos ♡";
      button.textContent = "Escuchar ahora 💛";
    }
  }

  function hideMusicFallback() {
    byId("musicFallback").hidden = true;
  }

  function stopProgressUpdates() {
    if (state.progressTimer) window.clearInterval(state.progressTimer);
    state.progressTimer = null;
  }

  function updateProgress() {
    if (!state.playerReady || typeof state.player.getDuration !== "function") return;
    const duration = state.player.getDuration() || 0;
    const current = state.player.getCurrentTime() || 0;
    byId("duration").textContent = formatTime(duration);
    byId("currentTime").textContent = formatTime(current);
    if (duration > 0 && document.activeElement !== byId("musicProgress")) {
      byId("musicProgress").value = String((current / duration) * 100);
    }
  }

  function startProgressUpdates() {
    stopProgressUpdates();
    updateProgress();
    state.progressTimer = window.setInterval(updateProgress, 500);
  }

  function requestMusicPlayback(fromOpening = false) {
    state.pendingPlay = true;
    if (!state.playerReady || !state.player) {
      if (!fromOpening) showMusicFallback(state.playerUnavailable ? "external" : "retry");
      return;
    }

    try {
      state.player.playVideo();
      if (state.autoplayTimer) window.clearTimeout(state.autoplayTimer);
      state.autoplayTimer = window.setTimeout(() => {
        const playing = state.player.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
        if (!playing) showMusicFallback("retry");
      }, 1700);
    } catch {
      showMusicFallback("external");
    }
  }

  function handlePlayerState(event) {
    const playerState = window.YT?.PlayerState;
    if (!playerState) return;

    if (event.data === playerState.PLAYING) {
      state.pendingPlay = false;
      if (state.autoplayTimer) window.clearTimeout(state.autoplayTimer);
      setPlaybackUI(true);
      hideMusicFallback();
      byId("musicState").textContent = "Sonando para nosotros";
      startProgressUpdates();
      return;
    }

    setPlaybackUI(false);
    if (event.data === playerState.PAUSED) byId("musicState").textContent = "En pausa";
    if (event.data === playerState.BUFFERING) byId("musicState").textContent = "Preparando este momento...";
    if (event.data === playerState.ENDED) byId("musicState").textContent = "Volver a escucharla siempre vale la pena";
    if (event.data === playerState.CUED || event.data === playerState.UNSTARTED) byId("musicState").textContent = "Lista para vos";
    if (event.data !== playerState.BUFFERING) stopProgressUpdates();
    updateProgress();
  }

  function createYouTubePlayer() {
    if (state.player || !window.YT?.Player) return;
    state.player = new window.YT.Player("youtubePlayer", {
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        playsinline: 1,
        controls: 0,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          state.playerReady = true;
          state.playerUnavailable = false;
          event.target.setVolume(Number(byId("musicVolume").value));
          byId("toggleMusic").disabled = false;
          byId("musicProgress").disabled = false;
          byId("musicVolume").disabled = false;
          byId("musicState").textContent = "Lista para vos";
          updateProgress();
          if (state.pendingPlay) requestMusicPlayback();
        },
        onStateChange: handlePlayerState,
        onError: () => {
          state.playerUnavailable = true;
          state.playerReady = false;
          setPlaybackUI(false);
          byId("musicState").textContent = "La canción está en YouTube";
          showMusicFallback("external");
        },
      },
    });
  }

  function initMusic() {
    const toggle = byId("toggleMusic");
    const progress = byId("musicProgress");
    const volume = byId("musicVolume");
    const retry = byId("retryMusic");

    window.onYouTubeIframeAPIReady = createYouTubePlayer;
    if (window.YT?.Player) createYouTubePlayer();

    window.setTimeout(() => {
      if (!state.playerReady && !state.player) {
        state.playerUnavailable = true;
        byId("musicState").textContent = "La canción está en YouTube";
        showMusicFallback("external");
      }
    }, 9000);

    toggle.addEventListener("click", () => {
      if (!state.playerReady) {
        showMusicFallback(state.playerUnavailable ? "external" : "retry");
        return;
      }
      const isPlaying = state.player.getPlayerState() === window.YT.PlayerState.PLAYING;
      if (isPlaying) state.player.pauseVideo();
      else requestMusicPlayback();
    });

    retry.addEventListener("click", () => {
      if (state.playerUnavailable) {
        window.open(YOUTUBE_URL, "_blank", "noopener,noreferrer");
      } else {
        requestMusicPlayback();
      }
    });

    progress.addEventListener("input", () => {
      if (!state.playerReady) return;
      const duration = state.player.getDuration() || 0;
      state.player.seekTo((Number(progress.value) / 100) * duration, true);
      updateProgress();
    });

    volume.addEventListener("input", () => {
      if (state.playerReady) state.player.setVolume(Number(volume.value));
    });
  }

  function init() {
    syncMotionProfile();
    if (compactScreen.addEventListener) compactScreen.addEventListener("change", syncMotionProfile);
    else compactScreen.addListener(syncMotionProfile);
    initGiftOpening();
    initNavigation();
    initScrollAnimations();
    initParallax();
    initGallery();
    initLetter();
    initFinalSurprise();
    initRelationshipCounter();
    initMusic();
    initFinalPetals();
  }

  init();
})();
