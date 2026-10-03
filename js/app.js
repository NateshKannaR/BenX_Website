/**
 * BenX Developer Runtime - Client Engine
 * High-performance interactive engine featuring:
 * - Studio Audio Spectrum Visualizer
 * - Video Demo Player Controller & Chapter Navigation
 * - Raycast-Style Command Inspector & JSON Viewer
 * - Architecture Step Navigator
 * - Live Command Filter & Search
 * - Keyboard Shortcuts (Ctrl/Cmd + K)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudioSpectrum();
  initVideoPlayer();
  initCommandInspector();
  initArchitecturePipeline();
  initCommandSearch();
  initQuickstartTabs();
  initClipboardHandlers();
  initKeyboardShortcuts();
  initLiveTelemetry();
});

/* ==========================================================================
   1. Minimalist Audio Spectrum Visualizer
   Clean high-density frequency bars inspired by studio telemetry
   ========================================================================== */
let spectrumState = 'listening'; // 'idle' | 'listening' | 'executing' | 'playing'

function initAudioSpectrum() {
  const canvas = document.getElementById('audioSpectrumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 40;
  }
  resize();
  window.addEventListener('resize', resize);

  let phase = 0;
  const barCount = 44;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = Math.max(2, (width / barCount) - 3);

    const speed = spectrumState === 'playing' ? 0.12 : spectrumState === 'executing' ? 0.08 : 0.04;
    phase += speed;

    for (let i = 0; i < barCount; i++) {
      const x = i * (width / barCount);
      let amplitude = 4;

      if (spectrumState === 'idle') {
        amplitude = 3 + Math.sin(phase + i * 0.2) * 2;
      } else if (spectrumState === 'listening') {
        const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
        amplitude = 4 + centerFactor * 18 * (0.6 + Math.sin(phase * 2 + i * 0.4) * 0.4);
      } else if (spectrumState === 'executing' || spectrumState === 'playing') {
        const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
        amplitude = 6 + Math.sin(phase * 3 + i * 0.5) * 12 + centerFactor * 14;
      }

      amplitude = Math.max(2, Math.min(height - 4, amplitude));
      const y = height - amplitude;

      const grad = ctx.createLinearGradient(0, y, 0, height);
      if (spectrumState === 'executing' || spectrumState === 'playing') {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      } else {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, amplitude);
    }

    requestAnimationFrame(render);
  }

  render();
}

function setSpectrumState(state) {
  spectrumState = state;
  const badge = document.getElementById('spectrumBadge');
  if (badge) {
    badge.textContent = state.toUpperCase();
    badge.className = `text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
      state === 'executing' || state === 'playing'
        ? 'border-white/30 text-white bg-white/10' 
        : 'border-white/10 text-zinc-400 bg-white/[0.02]'
    }`;
  }
}

/* ==========================================================================
   2. Video Demo Player Controller & Chapter Navigation
   ========================================================================== */
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

  if (!video) return;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      video.play();
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
    setSpectrumState('playing');
  });

  video.addEventListener('pause', () => {
    if (overlay) overlay.classList.remove('hidden-overlay');
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    setSpectrumState('listening');
  });

  video.addEventListener('ended', () => {
    if (overlay) overlay.classList.remove('hidden-overlay');
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    setSpectrumState('listening');
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
      if (video.paused) {
        video.play();
      }
    });
  });
}

/* ==========================================================================
   3. Raycast-Style Command Inspector & JSON Viewer
   ========================================================================== */
const RUNTIME_COMMANDS = {
  "switch to workspace 3": {
    category: "Compositor IPC",
    model: "Groq Llama 3.3 70B",
    ttft_ms: 68,
    total_ms: 94,
    tokens: 42,
    guardrail: "PASS",
    ipc_call: "hyprctl dispatch workspace 3",
    stdout: "workspace 3 -> focused active monitor eDP-1 (window: kitty.terminal)",
    json: {
      action: "hyprland_dispatch",
      target: "workspace",
      argument: 3,
      monitor: "eDP-1",
      socket: "/run/user/1000/hypr/socket2.sock",
      execution_time_ms: 7.2,
      exit_code: 0
    }
  },
  "tile focused window left": {
    category: "Compositor IPC",
    model: "Groq Llama 3.3 70B",
    ttft_ms: 71,
    total_ms: 102,
    tokens: 38,
    guardrail: "PASS",
    ipc_call: "hyprctl dispatch movewindow l",
    stdout: "tiled window 0x55bc14 to left column split (50/50 split ratio)",
    json: {
      action: "hyprland_layout_adjust",
      subcommand: "movewindow",
      direction: "left",
      layout_engine: "dwindle",
      exit_code: 0
    }
  },
  "save layout as deep-work": {
    category: "Layout Engine",
    model: "Groq Llama 3.3 70B",
    ttft_ms: 74,
    total_ms: 116,
    tokens: 54,
    guardrail: "PASS",
    ipc_call: "benx layouts save --name deep-work",
    stdout: "Serialized 4 active window nodes and 2 monitor bounds to ~/.benx/layouts/deep-work.json",
    json: {
      action: "layout_serialize",
      template_name: "deep-work",
      path: "/home/user/.benx/layouts/deep-work.json",
      windows_captured: 4,
      monitors_captured: 2,
      checksum_sha256: "9f82bc74a1...e201"
    }
  },
  "set power profile to power-saver": {
    category: "Kernel Sysfs",
    model: "Groq Compound",
    ttft_ms: 82,
    total_ms: 114,
    tokens: 44,
    guardrail: "PASS",
    ipc_call: "powerprofilesctl set power-saver",
    stdout: "Kernel scaling governor: powersave across 16 threads. Turbo boost disabled.",
    json: {
      subsystem: "powerprofilesctl",
      target_profile: "power-saver",
      sysfs_path: "/sys/devices/system/cpu/cpufreq/scaling_governor",
      battery_projection_delta: "+1h 48m",
      exit_code: 0
    }
  },
  "inspect battery telemetry": {
    category: "Hardware Diagnostics",
    model: "Groq Llama 3.1 8B Instant",
    ttft_ms: 46,
    total_ms: 64,
    tokens: 68,
    guardrail: "PASS",
    ipc_call: "upower -i /org/freedesktop/UPower/devices/battery_BAT0",
    stdout: "BAT0: 94.2% (Discharging at 11.2W). Est: 4h 16m. Health: 98.1% (48.1/49.0 Wh).",
    json: {
      device: "battery_BAT0",
      state: "discharging",
      percentage: 94.2,
      energy_rate_watts: 11.2,
      time_to_empty_seconds: 15360,
      health_ratio: 0.981
    }
  },
  "kill process chrome": {
    category: "Security Barrier",
    model: "Groq Llama 3.3 70B",
    ttft_ms: 58,
    total_ms: 88,
    tokens: 36,
    guardrail: "GATED_CONFIRMATION_REQUIRED",
    ipc_call: "CONFIRM_ACTIONS intercept: pkill -f chrome",
    stdout: "⚠️ DESTRUCTIVE SYSCALL INTERCEPTED: 'kill_process' requires explicit confirmation.",
    json: {
      action: "kill_process",
      target_process: "chrome",
      matched_pids: [14201, 14202, 14208],
      guardrail_policy: "CONFIRM_ACTIONS",
      status: "AWAITING_USER_APPROVAL",
      protected_processes_check: "CLEARED (non-systemd / non-hyprland)"
    }
  },
  "capture region to clipboard": {
    category: "Wayland Peripherals",
    model: "Groq Llama 3.3 70B",
    ttft_ms: 62,
    total_ms: 89,
    tokens: 32,
    guardrail: "PASS",
    ipc_call: "grim -g \"$(slurp)\" - | wl-copy -t image/png",
    stdout: "Wayland surface frame buffer captured. Image piped directly into wl-clipboard & cliphist.",
    json: {
      pipeline: ["slurp", "grim", "wl-copy", "cliphist"],
      mime_type: "image/png",
      storage: "in-memory-pipe",
      exit_code: 0
    }
  }
};

let currentActiveCommandKey = "switch to workspace 3";
let currentViewTab = "formatted"; // "formatted" | "json"

function initCommandInspector() {
  const inputEl = document.getElementById('inspectorInput');
  const runBtn = document.getElementById('inspectorRunBtn');
  const chipContainer = document.getElementById('commandPresetChips');
  const tabFormattedBtn = document.getElementById('tabFormattedBtn');
  const tabJsonBtn = document.getElementById('tabJsonBtn');
  const outputContainer = document.getElementById('inspectorOutput');

  const metaModel = document.getElementById('metaModel');
  const metaLatency = document.getElementById('metaLatency');
  const metaCategory = document.getElementById('metaCategory');
  const metaSecurity = document.getElementById('metaSecurity');

  if (!inputEl || !outputContainer) return;

  function renderOutput(data) {
    if (currentViewTab === 'json') {
      outputContainer.innerHTML = `
        <pre class="text-zinc-300 font-mono text-xs leading-relaxed overflow-x-auto p-4 bg-black/60 rounded-lg border border-white/[0.06]"><code>${JSON.stringify(data.json, null, 2)}</code></pre>
      `;
    } else {
      const isGated = data.guardrail.includes('GATED');
      outputContainer.innerHTML = `
        <div class="space-y-3 font-mono text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-white/[0.06] text-zinc-400">
            <span class="text-zinc-300">$ ${data.ipc_call}</span>
            <span class="${isGated ? 'text-amber-400' : 'text-emerald-400'}">${isGated ? 'AWAITING CONFIRMATION' : 'EXIT 0'}</span>
          </div>
          <div class="text-zinc-200 leading-relaxed">${data.stdout}</div>
          <div class="pt-2 text-[11px] text-zinc-500 flex items-center gap-4 border-t border-white/[0.04]">
            <span>TTFT: <strong class="text-zinc-300">${data.ttft_ms}ms</strong></span>
            <span>Total Latency: <strong class="text-zinc-300">${data.total_ms}ms</strong></span>
            <span>Tokens: <strong class="text-zinc-300">${data.tokens}</strong></span>
          </div>
        </div>
      `;
    }

    if (metaModel) metaModel.textContent = data.model;
    if (metaLatency) metaLatency.textContent = `${data.total_ms}ms`;
    if (metaCategory) metaCategory.textContent = data.category;
    if (metaSecurity) {
      const isGated = data.guardrail.includes('GATED');
      metaSecurity.textContent = isGated ? 'Gated by Policy' : 'Verified (Passed)';
      metaSecurity.className = `text-[11px] font-mono font-medium ${isGated ? 'text-amber-400' : 'text-emerald-400'}`;
    }
  }

  function executeCommand(cmdText) {
    const key = Object.keys(RUNTIME_COMMANDS).find(k => 
      k.toLowerCase() === cmdText.toLowerCase() || cmdText.toLowerCase().includes(k.toLowerCase())
    ) || "switch to workspace 3";

    currentActiveCommandKey = key;
    const data = RUNTIME_COMMANDS[key];

    setSpectrumState('executing');
    outputContainer.innerHTML = `
      <div class="flex items-center gap-2 text-xs font-mono text-zinc-400 py-6 justify-center">
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
        <span>Evaluating AST & dispatching kernel call...</span>
      </div>
    `;

    setTimeout(() => {
      renderOutput(data);
      setSpectrumState('listening');
    }, 180);
  }

  // Handle Preset Chips
  if (chipContainer) {
    chipContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.command-chip');
      if (chip) {
        const cmd = chip.getAttribute('data-cmd') || chip.textContent.trim().replace(/^"|"$/g, '');
        inputEl.value = cmd;
        executeCommand(cmd);
      }
    });
  }

  // Handle Run
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      executeCommand(inputEl.value.trim());
    });
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputEl.value.trim());
    }
  });

  // Tab Switching (Formatted vs Raw JSON)
  if (tabFormattedBtn && tabJsonBtn) {
    tabFormattedBtn.addEventListener('click', () => {
      currentViewTab = 'formatted';
      tabFormattedBtn.className = 'px-3 py-1 text-xs font-mono rounded bg-white/10 text-white font-medium transition-all';
      tabJsonBtn.className = 'px-3 py-1 text-xs font-mono rounded text-zinc-400 hover:text-white transition-all';
      renderOutput(RUNTIME_COMMANDS[currentActiveCommandKey]);
    });

    tabJsonBtn.addEventListener('click', () => {
      currentViewTab = 'json';
      tabJsonBtn.className = 'px-3 py-1 text-xs font-mono rounded bg-white/10 text-white font-medium transition-all';
      tabFormattedBtn.className = 'px-3 py-1 text-xs font-mono rounded text-zinc-400 hover:text-white transition-all';
      renderOutput(RUNTIME_COMMANDS[currentActiveCommandKey]);
    });
  }

  // Initial render
  renderOutput(RUNTIME_COMMANDS[currentActiveCommandKey]);
}

/* ==========================================================================
   4. Architecture Pipeline Step Navigator
   ========================================================================== */
const ARCH_MODULES = {
  1: {
    title: "1. Surface Ingestion Layer",
    subtitle: "Non-blocking Wayland hooks, voice detection, and terminal interfaces",
    body: "BenX exposes three concurrent entry vectors: a native GTK4/Libadwaita client with floating HUD overlay, a lightweight Tokyo-Night terminal TUI (<45MB RAM footprint), and an on-device WakeWordEngine with continuous background listening. Commands are received as structured events without UI thread stalls.",
    specs: [
      { label: "Voice Pipeline", val: "Cairo 60fps audio spectrum & Google/Whisper STT" },
      { label: "Wayland Integration", val: "Layer-shell protocol, non-intrusive floating HUD" },
      { label: "Memory Footprint", val: "42MB resident set size in TUI mode" }
    ]
  },
  2: {
    title: "2. Groq LPUs & Multi-Model Kernel",
    subtitle: "Sub-100ms deterministic inference with local RAG context",
    body: "Incoming intent is evaluated on Groq's specialized Tensor Streaming Processors running Llama 3.3 70B, achieving 80ms Time-To-First-Token. The kernel extracts parameters into a typed AST and cross-references user layout memories stored in ~/.benx/layouts/.",
    specs: [
      { label: "Primary Engine", val: "Groq Llama 3.3 70B Versatile" },
      { label: "Latency Benchmark", val: "80ms TTFT / 310 tokens/sec" },
      { label: "Fallback Core", val: "OpenRouter & local quantized models" }
    ]
  },
  3: {
    title: "3. CONFIRM_ACTIONS Security Barrier",
    subtitle: "Deterministic system gate isolating destructive operations",
    body: "Before any system modification reaches the OS, it passes through the strict safety barrier in jarvis_ai/executor.py. Destructive operations (process termination, pacman updates, power state changes, layout deletion) trigger mandatory user confirmation via interactive modal or terminal prompt.",
    specs: [
      { label: "Immunity Whitelist", val: "PID 1, systemd, Hyprland, pipewire, wireplumber" },
      { label: "Gated Actions", val: "shutdown, reboot, suspend, pacman, yay, pkill, trash" },
      { label: "Confirmation Mode", val: "Synchronous blocking verification with timeout abort" }
    ]
  },
  4: {
    title: "4. Native Hyprland & Linux Sysfs Dispatch",
    subtitle: "Direct socket2 IPC and low-level Linux kernel hardware hooks",
    body: "Approved actions execute over Unix domain sockets (/run/user/1000/hypr/socket2.sock) using native hyprctl dispatch commands. Hardware routines communicate directly with powerprofilesctl, upower DBus, and networkmanager.",
    specs: [
      { label: "Compositor Dispatch", val: "Native hyprctl socket2 IPC (<8ms turnaround)" },
      { label: "Peripherals Stack", val: "grim + slurp frame-buffer capture, cliphist, ydotool" },
      { label: "Hardware Stack", val: "Kernel scaling governors, nmcli, bluetoothctl" }
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

  let activeCat = 'all';

  function filter() {
    const q = searchInput.value.toLowerCase().trim();

    commandCards.forEach(card => {
      const cardCat = card.getAttribute('data-cat') || '';
      const text = card.textContent.toLowerCase();

      const matchesCat = (activeCat === 'all' || cardCat === activeCat);
      const matchesQuery = (!q || text.includes(q));

      card.style.display = (matchesCat && matchesQuery) ? 'block' : 'none';
    });
  }

  searchInput.addEventListener('input', filter);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
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
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy') || btn.closest('.code-row')?.querySelector('code')?.innerText || '';
      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = `<span class="text-zinc-200 text-[11px] font-mono">Copied</span>`;
        setTimeout(() => {
          btn.innerHTML = original;
        }, 1800);
      });
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

/* ==========================================================================
   9. Live Telemetry Metric Ticker
   ========================================================================== */
function initLiveTelemetry() {
  const memEl = document.getElementById('liveMemStat');
  const cpuEl = document.getElementById('liveCpuStat');

  if (!memEl || !cpuEl) return;

  setInterval(() => {
    cpuEl.textContent = `${(1.8 + Math.random() * 1.6).toFixed(1)}%`;
    memEl.textContent = `${(42 + Math.floor(Math.random() * 4))}MB`;
  }, 4000);
}
