// Interactive walkthrough, command playground, reference search, and installation guide.

document.addEventListener('DOMContentLoaded', () => {
  initVideoPlayer();
  initCommandInspector();
  initArchitecturePipeline();
  initCommandSearch();
  initQuickstartTabs();
  initClipboardHandlers();
  initKeyboardShortcuts();
});

function initVideoPlayer() {
  const video = document.getElementById('demoVideo');
  const overlay = document.getElementById('videoOverlay');
  const playBtn = document.getElementById('videoPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const scrubber = document.getElementById('videoScrubber');
  const timeDisplay = document.getElementById('videoTimeDisplay');
  const muteBtn = document.getElementById('videoMuteBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const muteIcon = document.getElementById('muteIcon');
  const fullscreenBtn = document.getElementById('videoFullscreenBtn');
  const chapterBtns = document.querySelectorAll('.chapter-btn');
  const status = document.getElementById('videoStatus');

  if (!video) return;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function playVideo() {
    status.hidden = true;
    video.play().catch(error => {
      if (error.name === 'AbortError') return;
      status.textContent = 'This browser could not play the walkthrough.';
      status.hidden = false;
    });
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      playVideo();
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', togglePlay);
  }

  if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
  }

  video.addEventListener('play', () => {
    if (overlay) overlay.classList.add('hidden-overlay');
    if (playIcon) playIcon.classList.add('hidden');
    if (pauseIcon) pauseIcon.classList.remove('hidden');
  });

  video.addEventListener('pause', () => {
    if (overlay) overlay.classList.remove('hidden-overlay');
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
  });

  video.addEventListener('ended', () => {
    if (overlay) overlay.classList.remove('hidden-overlay');
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
  });

  video.addEventListener('timeupdate', () => {
    const curr = video.currentTime;
    const dur = video.duration || 120;

    if (scrubber) {
      scrubber.value = (curr / dur) * 100;
    }

    if (timeDisplay) {
      timeDisplay.textContent = `${formatTime(curr)} / ${formatTime(dur)}`;
    }

    // Update active chapter button
    chapterBtns.forEach(btn => {
      const time = parseFloat(btn.getAttribute('data-time') || '0');
      const nextBtn = btn.nextElementSibling;
      const nextTime = nextBtn ? parseFloat(nextBtn.getAttribute('data-time') || '999') : 999;

      if (curr >= time && curr < nextTime) {
        btn.classList.add('active-chapter');
      } else {
        btn.classList.remove('active-chapter');
      }
    });
  });

  if (scrubber) {
    scrubber.addEventListener('input', () => {
      const dur = video.duration || 120;
      video.currentTime = (scrubber.value / 100) * dur;
    });
  }

  // Audio Mute Toggle
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (video.muted) {
        volumeIcon.classList.add('hidden');
        muteIcon.classList.remove('hidden');
      } else {
        volumeIcon.classList.remove('hidden');
        muteIcon.classList.add('hidden');
      }
    });
  }

  // Fullscreen
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const container = video.closest('.video-theater-wrapper') || video;
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (video.requestFullscreen) video.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // Chapter Jump Buttons
  chapterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const time = parseFloat(btn.getAttribute('data-time') || '0');
      video.currentTime = time;
      if (video.paused) playVideo();
    });
  });
}

/* ==========================================================================
   3. Raycast-Style Command Inspector & JSON Viewer
   ========================================================================== */
const examples = {
  "save my work layout": {
    "result": "Saved layout template 'work' with 2 windows.",
    "command": {
      "command": "hypr_save_layout",
      "name": "work"
    }
  },
  "restore my work layout": {
    "result": "Layout 'work': 1 window restored. Missing: Firefox.",
    "command": {
      "command": "hypr_restore_layout",
      "name": "work"
    }
  },
  "switch to workspace 3": {
    "result": "Switched to workspace 3.",
    "command": {
      "command": "switch_workspace",
      "value": 3
    }
  },
  "set power profile to power-saver": {
    "result": "Power profile set to power-saver.",
    "command": {
      "command": "power_set_profile",
      "profile": "power-saver"
    }
  },
  "battery status": {
    "result": "Battery: 84% (discharging).",
    "command": {
      "command": "battery"
    }
  },
  "screenshot a region": {
    "result": "Choose a region to capture with Slurp and Grim.",
    "command": {
      "command": "hypr_screenshot_region"
    }
  },
  "kill process chrome": {
    "result": "BenX asks for confirmation before stopping the process.",
    "command": {
      "command": "kill_process",
      "process": "chrome"
    }
  }
};

function initCommandInspector() {
  const input = document.getElementById('inspectorInput');
  const preview = document.getElementById('inspectorRunBtn');
  const chips = document.getElementById('commandPresetChips');
  const output = document.getElementById('inspectorOutput');
  const resultTab = document.getElementById('tabFormattedBtn');
  const commandTab = document.getElementById('tabJsonBtn');
  let showCommand = false;
  let example;

  function render() {
    resultTab.setAttribute('aria-pressed', String(!showCommand));
    commandTab.setAttribute('aria-pressed', String(showCommand));
    resultTab.classList.toggle('bg-white/10', !showCommand);
    commandTab.classList.toggle('bg-white/10', showCommand);
    if (!example) {
      output.textContent = 'Choose an example above to preview its parsed command.';
      return;
    }
    const content = document.createElement(showCommand ? 'pre' : 'p');
    content.textContent = showCommand ? JSON.stringify(example.command, null, 2) : example.result;
    if (showCommand) content.classList.add('overflow-x-auto');
    output.replaceChildren(content);
  }

  function selectExample() {
    const command = input.value.trim().toLowerCase().replace(/[.!?]$/, '').replace(/\s+/g, ' ');
    example = Object.hasOwn(examples, command) ? examples[command] : undefined;
    render();
  }

  chips.addEventListener('click', event => {
    const chip = event.target.closest('[data-cmd]');
    if (!chip) return;
    input.value = chip.dataset.cmd;
    selectExample();
  });
  preview.addEventListener('click', selectExample);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') selectExample();
  });
  resultTab.addEventListener('click', () => {
    showCommand = false;
    render();
  });
  commandTab.addEventListener('click', () => {
    showCommand = true;
    render();
  });
  selectExample();
}

/* ==========================================================================
   4. Architecture Pipeline Step Navigator
   ========================================================================== */
const ARCH_MODULES = {
  "1": {
    "title": "Desktop interfaces",
    "subtitle": "TUI, CLI, GTK4, and loopback web UI",
    "body": "The setup script opens the terminal UI. BenX also has a plain text prompt, a GTK4 window, and a local web interface.",
    "specs": [
      {
        "label": "Default",
        "val": "Terminal UI"
      },
      {
        "label": "Desktop",
        "val": "GTK4 / Libadwaita"
      },
      {
        "label": "Web",
        "val": "127.0.0.1:8000"
      }
    ]
  },
  "2": {
    "title": "Command interpretation",
    "subtitle": "Offline layouts and optional AI providers",
    "body": "BenX recognizes supported layout commands locally. Other natural language requests can use Groq or OpenRouter when a provider is configured.",
    "specs": [
      {
        "label": "Offline",
        "val": "Layout save and restore"
      },
      {
        "label": "Providers",
        "val": "Groq and OpenRouter"
      },
      {
        "label": "Layout files",
        "val": "~/.benx/layouts/"
      }
    ]
  },
  "3": {
    "title": "Action confirmation",
    "subtitle": "Approval for protected desktop operations",
    "body": "The command executor prompts before actions such as rebooting, installing packages, or terminating processes. The Android companion requests approval before restoring a layout.",
    "specs": [
      {
        "label": "Desktop",
        "val": "CLI, GTK4, TUI, and web prompts"
      },
      {
        "label": "Examples",
        "val": "Reboot and package install"
      },
      {
        "label": "Android",
        "val": "Confirm layout restore"
      }
    ]
  },
  "4": {
    "title": "Desktop execution",
    "subtitle": "Hyprland commands and Linux utilities",
    "body": "BenX calls hyprctl for window and workspace operations. Other desktop actions depend on utilities and services available in the current session.",
    "specs": [
      {
        "label": "Workspaces",
        "val": "hyprctl"
      },
      {
        "label": "Screenshots",
        "val": "grim and slurp"
      },
      {
        "label": "Network",
        "val": "nmcli"
      }
    ]
  }
};

function initArchitecturePipeline() {
  const nav = document.getElementById('archNav');
  const title = document.getElementById('archTitle');
  const subtitle = document.getElementById('archSubtitle');
  const body = document.getElementById('archBody');
  const specs = document.getElementById('archSpecs');

  if (!nav || !title) return;

  function setStep(num) {
    const data = ARCH_MODULES[num];
    if (!data) return;

    title.textContent = data.title;
    subtitle.textContent = data.subtitle;
    body.textContent = data.body;

    specs.innerHTML = data.specs.map(s => `
      <div class="p-3 rounded-lg bg-black/40 border border-white/[0.06] font-mono text-xs">
        <span class="text-zinc-500 block text-[10px] uppercase">${s.label}</span>
        <strong class="text-zinc-200">${s.val}</strong>
      </div>
    `).join('');

    const buttons = nav.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
      btn.setAttribute('aria-pressed', String(idx + 1 === num));
      if (idx + 1 === num) {
        btn.className = 'px-4 py-2.5 rounded-lg text-left border border-white/20 bg-white/[0.07] text-white font-mono text-xs font-semibold transition-all';
      } else {
        btn.className = 'px-4 py-2.5 rounded-lg text-left border border-white/[0.06] bg-transparent text-zinc-400 hover:text-white font-mono text-xs transition-all';
      }
    });
  }

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-arch-step]');
    if (btn) {
      setStep(parseInt(btn.getAttribute('data-arch-step'), 10));
    }
  });

  setStep(1);
}

/* ==========================================================================
   5. Live Command Search & Filter
   ========================================================================== */
function initCommandSearch() {
  const searchInput = document.getElementById('commandSearchInput');
  const filterBtns = document.querySelectorAll('.cat-filter-btn');
  const commandCards = document.querySelectorAll('.command-card');

  if (!searchInput || !commandCards.length) return;

  const status = document.getElementById('commandSearchStatus');
  let activeCat = 'all';

  function filter() {
    const q = searchInput.value.toLowerCase().trim();

    let visible = 0;
    commandCards.forEach(card => {
      const cardCat = card.getAttribute('data-cat') || '';
      const text = card.textContent.toLowerCase();

      const matchesCat = (activeCat === 'all' || cardCat === activeCat);
      const matchesQuery = (!q || text.includes(q));

      card.hidden = !(matchesCat && matchesQuery);
      if (!card.hidden) visible++;
    });
    status.textContent = visible === 0 ? 'No matching commands.' : '';
  }

  searchInput.addEventListener('input', filter);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.setAttribute('aria-pressed', String(b === btn));
        b.classList.remove('bg-white', 'text-black', 'font-semibold');
        b.classList.add('bg-white/[0.04]', 'text-zinc-400');
      });

      btn.classList.add('bg-white', 'text-black', 'font-semibold');
      btn.classList.remove('bg-white/[0.04]', 'text-zinc-400');

      activeCat = btn.getAttribute('data-cat');
      filter();
    });
  });
}

/* ==========================================================================
   6. Tabbed Quickstart Installer
   ========================================================================== */
function initQuickstartTabs() {
  const tabBtns = document.querySelectorAll('.qs-tab');
  const tabPanes = document.querySelectorAll('.qs-pane');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => {
        b.setAttribute('aria-pressed', String(b === btn));
        b.classList.remove('border-white', 'text-white');
        b.classList.add('border-transparent', 'text-zinc-400');
      });

      btn.classList.add('border-white', 'text-white');
      btn.classList.remove('border-transparent', 'text-zinc-400');

      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   7. Minimal Clipboard Handler with Inline Toast
   ========================================================================== */
function initClipboardHandlers() {
  const status = document.getElementById('copyStatus');
  document.querySelectorAll('.copy-btn').forEach(button => {
    let reset;
    button.addEventListener('click', async () => {
      const code = button.closest('.code-row').querySelector('code');
      clearTimeout(reset);
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = 'Copied';
        status.textContent = 'Command copied.';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Selected';
        status.textContent = 'Command selected. Use your copy shortcut.';
      }
      reset = setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    });
  });
}

/* ==========================================================================
   8. Keyboard Shortcuts (Cmd+K / Ctrl+K focus)
   ========================================================================== */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('inspectorInput');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}
