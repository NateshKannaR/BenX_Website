/**
 * BenX AI Showcase - Interactive Application Engine
 * Includes Cairo 30fps Waveform Simulator, Command Playground,
 * Architecture Explorer, Command Search, and Quickstart Tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
  initWaveformVisualizer();
  initCommandSimulator();
  initArchitectureExplorer();
  initCommandSearch();
  initQuickstartTabs();
  initClipboardHandlers();
  initMobileMenu();
  initTelemetryMock();
});

/* ==========================================================================
   1. Cairo 30fps Animated Waveform Visualizer
   Replicates the Cairo GTK4 waveform visualizer in BenX
   ========================================================================== */
let waveformState = 'idle'; // 'idle' | 'listening' | 'thinking' | 'executing'
let waveformAnimId = null;

function initWaveformVisualizer() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 70;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let phase = 0;
  const numBars = 48;

  function renderWaveform() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const barWidth = Math.max(3, (width / numBars) - 3);

    phase += (waveformState === 'thinking' ? 0.12 : waveformState === 'listening' ? 0.08 : 0.03);

    for (let i = 0; i < numBars; i++) {
      const x = i * (width / numBars) + 2;
      let amp = 6;

      if (waveformState === 'idle') {
        amp = 4 + Math.sin(phase + i * 0.25) * 3 + Math.sin(phase * 0.5 + i * 0.1) * 2;
      } else if (waveformState === 'listening') {
        const centerDistance = Math.abs(i - numBars / 2) / (numBars / 2);
        amp = (1 - centerDistance) * 24 * (Math.sin(phase * 1.5 + i * 0.4) * 0.5 + 0.6) + 4;
      } else if (waveformState === 'thinking') {
        amp = 14 + Math.sin(phase * 2 + i * 0.6) * 10 * Math.cos(phase + i * 0.15);
      } else if (waveformState === 'executing') {
        amp = 18 + Math.sin(phase * 3 + i * 0.5) * 8;
      }

      amp = Math.max(3, Math.min(height * 0.45, Math.abs(amp)));

      // Gradient color based on state
      const grad = ctx.createLinearGradient(0, centerY - amp, 0, centerY + amp);
      if (waveformState === 'listening') {
        grad.addColorStop(0, '#00f0ff');
        grad.addColorStop(0.5, '#7aa2f7');
        grad.addColorStop(1, '#00f0ff');
      } else if (waveformState === 'thinking') {
        grad.addColorStop(0, '#9d7cd8');
        grad.addColorStop(0.5, '#f7768e');
        grad.addColorStop(1, '#9d7cd8');
      } else if (waveformState === 'executing') {
        grad.addColorStop(0, '#00ff41');
        grad.addColorStop(0.5, '#10b981');
        grad.addColorStop(1, '#00ff41');
      } else {
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
        grad.addColorStop(0.5, 'rgba(122, 162, 247, 0.3)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0.4)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, centerY - amp, barWidth, amp * 2, 2);
      } else {
        ctx.rect(x, centerY - amp, barWidth, amp * 2);
      }
      ctx.fill();
    }

    waveformAnimId = requestAnimationFrame(renderWaveform);
  }

  renderWaveform();
}

function setWaveformState(state) {
  waveformState = state;
  const statusBadge = document.getElementById('waveformStatusText');
  if (statusBadge) {
    statusBadge.textContent = state.toUpperCase();
    statusBadge.className = `text-xs font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
      state === 'listening' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
      state === 'thinking' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
      state === 'executing' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
      'bg-slate-800 text-slate-400 border border-slate-700'
    }`;
  }
}

/* ==========================================================================
   2. BenX Interactive Command Playground
   Simulates natural language execution in real-time
   ========================================================================== */
const SIMULATED_COMMANDS = {
  "switch to workspace 3": {
    category: "Hyprland Window & Workspace",
    model: "Groq Llama 3.3 70B",
    latency: "118ms",
    ipc: "hyprctl dispatch workspace 3",
    safety: "PASSED (Safe Read/Window Action)",
    output: `[HYPRLAND_IPC] Executed: hyprctl dispatch workspace 3\n[MONITOR 0] Active workspace shifted to 3 (eDP-1)\n[WINDOW_MANAGER] Restored window focus to 'kitty @ workspace 3'`,
    status: "Workspace switched to 3 successfully."
  },
  "take a screenshot of region": {
    category: "Wayland Peripherals",
    model: "Groq Llama 3.3 70B",
    latency: "135ms",
    ipc: "grim -g \"$(slurp)\" ~/Pictures/Screenshots/benx_capture_2026.png",
    safety: "PASSED (Safe Media Action)",
    output: `[WAYLAND_GRIM] Calling slurp region selector...\n[SLURP] User selected box: 210,140 1280x720\n[OUTPUT] Saved to ~/Pictures/Screenshots/benx_capture_2026.png\n[CLIPHIST] PNG image copied to Wayland clipboard history`,
    status: "Region screenshot captured and copied to clipboard."
  },
  "set power profile to power-saver": {
    category: "Laptop & Hardware Management",
    model: "Groq Compound",
    latency: "142ms",
    ipc: "powerprofilesctl set power-saver",
    safety: "PASSED (Safe Hardware Action)",
    output: `[HARDWARE] Queried current profile: 'balanced'\n[POWERPROFILESCTL] Setting profile to 'power-saver'\n[SYSFS] CPU governor scaled to 'powersave' across 16 threads\n[BATTERY_DAEMON] Expected runtime extended by ~1h 45m`,
    status: "Power profile set to power-saver."
  },
  "what is my battery level?": {
    category: "Telemetry & Diagnostics",
    model: "Groq Llama 3.1 8B Instant",
    latency: "84ms",
    ipc: "upower -i /org/freedesktop/UPower/devices/battery_BAT0",
    safety: "PASSED (Safe Read-Only)",
    output: `[UPOWER] Device: BAT0 (Li-poly)\n[PERCENT] 94% Capacity\n[STATE] Discharging (~4h 18m remaining)\n[ENERGY_RATE] 11.4 W\n[HEALTH] 98.2% original capacity (48.1 / 49.0 Wh)`,
    status: "Battery is at 94%, discharging with ~4h 18m remaining."
  },
  "scan for wifi networks": {
    category: "Network Management",
    model: "Groq Llama 3.3 70B",
    latency: "128ms",
    ipc: "nmcli -t -f SSID,SIGNAL,SECURITY device wifi list",
    safety: "PASSED (Safe Network Read)",
    output: `[NMCLI] Initiating 802.11ax scan on wlan0...\n  • Aurora-5G       [Signal: 98% | WPA3]\n  • HomeLab_Mesh    [Signal: 86% | WPA2]\n  • BenX-IoT-Node   [Signal: 74% | WPA2 Enterprise]\n  • CoffeeRoasters  [Signal: 52% | Open]`,
    status: "Found 4 Wi-Fi networks nearby."
  },
  "show top processes by cpu": {
    category: "System Monitoring",
    model: "Groq Llama 3.1 8B Instant",
    latency: "92ms",
    ipc: "ps -eo pid,pcpu,pmem,comm --sort=-pcpu | head -n 6",
    safety: "PASSED (Safe System Read)",
    output: `PID     %CPU  %MEM  COMMAND\n1204    3.8   1.2   Hyprland\n2189    2.4   0.8   benx.py (GTK4)\n3410    1.9   2.6   zen-browser\n1184    0.8   0.4   pipewire\n2901    0.5   0.3   waybar`,
    status: "System load is nominal. Hyprland and BenX using under 5% CPU combined."
  },
  "kill process chrome": {
    category: "System Control & Guardrail",
    model: "Groq Llama 3.3 70B",
    latency: "110ms",
    ipc: "pkill -f chrome",
    safety: "⚠️ GUARDRAIL TRIGGERED: jarvis_ai/executor.py CONFIRM_ACTIONS",
    output: `[SAFETY_BARRIER] Action matches CONFIRM_ACTIONS list: 'kill_process'\n[PROMPT_REQUIRED] "Are you sure you want to terminate 6 Chrome instances (PID 14022-14028)?"\n[STATUS] Waiting for explicit user confirmation via Adw.Toast or [Y/n]...\n[SAFETY_NOTE] Critical system processes (hyprland, systemd, pipewire) are hardcoded immune from kill.`,
    status: "Safety barrier intercepted destructive process kill. Confirmation requested."
  },
  "save current layout as coding": {
    category: "Hyprland Automation",
    model: "Groq Llama 3.3 70B",
    latency: "156ms",
    ipc: "python3 -c 'import jarvis_ai.hyprland as h; h.save_layout(\"coding\")'",
    safety: "PASSED (Safe Workspace Action)",
    output: `[HYPRLAND_LAYOUT] Enumerating windows on Workspace 1 & 2...\n  - Kitty (80x24 left split) -> file: editor.rs\n  - Zen Browser (right split) -> url: github.com\n  - BenX Compact (floating 420x560 pinned)\n[TEMPLATE_SAVED] Written to ~/.benx/layouts/coding.json\n[RESTORE_CMD] Say 'restore coding layout' anytime!`,
    status: "Saved window and workspace layout to ~/.benx/layouts/coding.json."
  },
  "lock the screen": {
    category: "Wayland Security",
    model: "Groq Llama 3.1 8B Instant",
    latency: "76ms",
    ipc: "hyprlock",
    safety: "PASSED (Safe Screen Action)",
    output: `[WAYLAND_SECURITY] Spawning hyprlock session...\n[STATUS] PAM authentication active\n[EFFECT] Wayland surface locked with blurred background effect`,
    status: "Screen locked via hyprlock."
  }
};

function initCommandSimulator() {
  const inputEl = document.getElementById('simInput');
  const runBtn = document.getElementById('simRunBtn');
  const chipContainer = document.getElementById('simChips');
  const simTerminal = document.getElementById('simTerminal');
  const simMetaModel = document.getElementById('simMetaModel');
  const simMetaLatency = document.getElementById('simMetaLatency');
  const simMetaCategory = document.getElementById('simMetaCategory');
  const simMetaSafety = document.getElementById('simMetaSafety');

  if (!inputEl || !runBtn || !simTerminal) return;

  // Handle preset chip click
  if (chipContainer) {
    chipContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.cmd-chip');
      if (chip) {
        const cmd = chip.getAttribute('data-cmd') || chip.textContent.trim().replace(/^"|"$/g, '');
        inputEl.value = cmd;
        executeSimulatedCommand(cmd);
      }
    });
  }

  // Handle run button click
  runBtn.addEventListener('click', () => {
    const cmd = inputEl.value.trim();
    if (cmd) executeSimulatedCommand(cmd);
  });

  // Handle enter key
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = inputEl.value.trim();
      if (cmd) executeSimulatedCommand(cmd);
    }
  });

  function executeSimulatedCommand(rawCmd) {
    const cmdKey = Object.keys(SIMULATED_COMMANDS).find(k => 
      k.toLowerCase() === rawCmd.toLowerCase() || rawCmd.toLowerCase().includes(k.toLowerCase())
    );

    const data = cmdKey ? SIMULATED_COMMANDS[cmdKey] : {
      category: "Natural Language AI Inference",
      model: "Groq Llama 3.3 70B",
      latency: "148ms",
      ipc: `jarvis_ai.ai_engine.process("${rawCmd}")`,
      safety: "PASSED (Standard AI Query)",
      output: `[AI_ENGINE] Model processed query: "${rawCmd}"\n[INTENT] Natural language reasoning with contextual memory\n[RESPONSE] BenX parsed intent and matched system tools.`,
      status: `Processed request "${rawCmd}".`
    };

    // Animate waveform to 'listening' then 'thinking' then 'executing'
    setWaveformState('listening');
    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⚡</span> Routing...';

    simTerminal.innerHTML = `
      <div class="text-cyan-400 font-mono flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        Ingesting audio & text prompt: <span class="text-white font-semibold">"${rawCmd}"</span>
      </div>
      <div class="text-slate-400 text-xs font-mono mt-1">Transcribing via Whisper / Google Speech & dispatching to Groq Cloud...</div>
    `;

    setTimeout(() => {
      setWaveformState('thinking');
      simTerminal.innerHTML += `
        <div class="text-purple-400 font-mono text-xs mt-2">
          🧠 Multi-Model Router selected: <strong class="text-purple-300">${data.model}</strong> (${data.latency})
        </div>
      `;

      setTimeout(() => {
        setWaveformState('executing');
        
        // Update metadata pills
        if (simMetaModel) simMetaModel.textContent = data.model;
        if (simMetaLatency) simMetaLatency.textContent = data.latency;
        if (simMetaCategory) simMetaCategory.textContent = data.category;
        if (simMetaSafety) {
          simMetaSafety.textContent = data.safety.includes('GUARDRAIL') ? 'Safety Gate: GATED' : 'Safety Gate: APPROVED';
          simMetaSafety.className = data.safety.includes('GUARDRAIL') 
            ? 'px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-semibold'
            : 'px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold';
        }

        // Render full terminal output
        const isGated = data.safety.includes('GUARDRAIL');
        simTerminal.innerHTML = `
          <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span class="text-cyan-400 text-xs font-mono">user@hyprland:~$ benx "${rawCmd}"</span>
            <span class="text-xs font-mono ${isGated ? 'text-amber-400' : 'text-emerald-400'}">${isGated ? '⚠️ CONFIRMATION_GATED' : '✓ EXECUTED'}</span>
          </div>
          <div class="text-slate-300 text-xs font-mono mb-2 whitespace-pre-wrap leading-relaxed">${data.output}</div>
          <div class="p-2.5 rounded ${isGated ? 'bg-amber-950/40 border border-amber-500/30 text-amber-200' : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200'} text-xs font-mono mt-3">
            <strong>${isGated ? '🛡️ Guardrail Status:' : '🤖 BenX Status:'}</strong> ${data.status}
          </div>
        `;

        runBtn.disabled = false;
        runBtn.innerHTML = 'Execute';

        setTimeout(() => {
          setWaveformState('idle');
        }, 1500);

      }, 350);
    }, 300);
  }
}

/* ==========================================================================
   3. Interactive Architecture Pipeline Explorer
   ========================================================================== */
const ARCH_STEPS = {
  1: {
    title: "1. Multi-Modal Ingestion & Wake Word",
    tagline: "Always-on, ultra-low latency listener and input interfaces",
    desc: "BenX continuously monitors for the wake word ('Hey BenX') using lightweight on-device detection. While speaking, a 30fps Cairo canvas responds with animated acoustic waveforms across GTK4, the floating 420x560 widget, or the Tokyo-Night terminal.",
    points: [
      "WakeWordEngine with adaptive noise thresholding",
      "GTK4 / Libadwaita floating widget (pinned Wayland overlay)",
      "Tokyo-Night TUI with keyboard-driven hotkeys",
      "Flutter mobile companion app via MongoDB real-time sync"
    ]
  },
  2: {
    title: "2. Multi-Model Intelligence & RAG Router",
    tagline: "Ultra-fast Groq inference (Llama 3.3 70B) with OpenRouter fallback",
    desc: "Natural language instructions are routed to Groq's high-speed inference engine (averaging 80-140ms latency). Queries requiring workspace history or previous interactions leverage local vector RAG memory for full context.",
    points: [
      "Groq primary models: Llama 3.3 70B, Qwen3-32B, and Compound",
      "Seamless fallback to OpenRouter or local models on API disruption",
      "RAG memory engine stores past tasks, layout preferences, and logs",
      "Vision pipeline using Tesseract OCR and Llama 4 Scout for screen understanding"
    ]
  },
  3: {
    title: "3. Ironclad Safety & Guardrails Barrier",
    tagline: "CONFIRM_ACTIONS security perimeter preventing unwanted changes",
    desc: "Before executing any command on your Linux system, BenX evaluates the payload against strict safety rules in jarvis_ai/executor.py. Destructive operations (shutdown, pacman upgrades, kill process) are paused until explicitly approved.",
    points: [
      "Strict gating for shutdown, reboot, suspend, and package installation",
      "Immunity whitelist for core processes (Hyprland, systemd, pipewire)",
      "Interactive confirmation modal / Adw.Toast notifications",
      "Read-only telemetry never interrupted for maximum responsiveness"
    ]
  },
  4: {
    title: "4. Native Hyprland & Wayland Execution Layer",
    tagline: "Direct IPC window dispatch, grim/slurp capture, and hardware hooks",
    desc: "BenX talks directly to Hyprland's socket2.sock and hyprctl dispatch commands. It tiles, floats, resizes windows, manages workspaces, handles screenshot regions with grim/slurp, and interfaces with Linux hardware controls.",
    points: [
      "Hyprland socket2 real-time event listener (auto-tile, PiP detection)",
      "JSON layout templates (~/.benx/layouts/) for one-click setup restore",
      "nmcli network management, Bluetooth pairing, and audio routing",
      "Battery profile scaling governors (<15% automatic power-saver)"
    ]
  },
  5: {
    title: "5. Feedback, Audio Waveform & Activity Logging",
    tagline: "Immediate visual, tactile, and voice telemetry back to the user",
    desc: "Execution results are instantly broadcast back through native Libadwaita toasts, voice synthesis (TTS), live dashboard meters, and persisted activity logs.",
    points: [
      "Adw.ToastOverlay in GTK4 and terminal visual feedback in TUI",
      "Real-time CPU, RAM, Battery, and Disk telemetry gauges",
      "Persistent activity logs in ~/.benx/benx.log",
      "Voice response with optional mute toggle"
    ]
  }
};

function initArchitectureExplorer() {
  const stepsContainer = document.getElementById('archStepsNav');
  const titleEl = document.getElementById('archStepTitle');
  const taglineEl = document.getElementById('archStepTagline');
  const descEl = document.getElementById('archStepDesc');
  const pointsEl = document.getElementById('archStepPoints');

  if (!stepsContainer || !titleEl) return;

  function loadStep(stepNum) {
    const data = ARCH_STEPS[stepNum];
    if (!data) return;

    titleEl.textContent = data.title;
    taglineEl.textContent = data.tagline;
    descEl.textContent = data.desc;

    pointsEl.innerHTML = data.points.map(pt => `
      <li class="flex items-start gap-2.5 text-slate-300 text-sm">
        <span class="text-cyan-400 mt-1 font-bold">▹</span>
        <span>${pt}</span>
      </li>
    `).join('');

    // Update active styles on buttons
    const buttons = stepsContainer.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
      const num = idx + 1;
      if (num === stepNum) {
        btn.className = "flex-1 min-w-[140px] text-left p-3.5 rounded-xl border border-cyan-500/50 bg-cyan-950/40 text-cyan-300 font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all";
      } else {
        btn.className = "flex-1 min-w-[140px] text-left p-3.5 rounded-xl border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/20 transition-all";
      }
    });
  }

  stepsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-step]');
    if (btn) {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      loadStep(step);
    }
  });

  loadStep(1);
}

/* ==========================================================================
   4. Filterable Command Search & Cheatsheet
   ========================================================================== */
function initCommandSearch() {
  const searchInput = document.getElementById('cmdSearchInput');
  const filterPills = document.querySelectorAll('.cmd-filter-pill');
  const cmdCards = document.querySelectorAll('.cmd-card-item');

  if (!searchInput || !cmdCards.length) return;

  let activeCategory = 'all';

  function applyFilter() {
    const query = searchInput.value.toLowerCase().trim();

    cmdCards.forEach(card => {
      const cat = card.getAttribute('data-category') || '';
      const text = card.textContent.toLowerCase();

      const matchesCategory = (activeCategory === 'all' || cat === activeCategory);
      const matchesQuery = (!query || text.includes(query));

      if (matchesCategory && matchesQuery) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  searchInput.addEventListener('input', applyFilter);

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('bg-cyan-500', 'text-slate-950', 'font-bold'));
      filterPills.forEach(p => p.classList.add('bg-slate-800/80', 'text-slate-300'));

      pill.classList.remove('bg-slate-800/80', 'text-slate-300');
      pill.classList.add('bg-cyan-500', 'text-slate-950', 'font-bold');

      activeCategory = pill.getAttribute('data-category');
      applyFilter();
    });
  });
}

/* ==========================================================================
   5. Quickstart Tabs Switcher
   ========================================================================== */
function initQuickstartTabs() {
  const tabButtons = document.querySelectorAll('.qs-tab-btn');
  const tabPanes = document.querySelectorAll('.qs-tab-pane');

  if (!tabButtons.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('border-cyan-400', 'text-cyan-400', 'bg-cyan-500/10');
        b.classList.add('border-transparent', 'text-slate-400');
      });

      btn.classList.add('border-cyan-400', 'text-cyan-400', 'bg-cyan-500/10');
      btn.classList.remove('border-transparent', 'text-slate-400');

      tabPanes.forEach(pane => {
        if (pane.id === target) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   6. One-Click Copy to Clipboard with Toast
   ========================================================================== */
function initClipboardHandlers() {
  const copyButtons = document.querySelectorAll('.btn-copy');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-clipboard-text') || btn.closest('.code-box')?.querySelector('code')?.innerText || '';
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Copied command to clipboard!');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<span class="text-emerald-400 text-xs">✓ Copied</span>`;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy', err);
      });
    });
  });
}

function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900/90 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md font-mono text-xs flex items-center gap-2 transform transition-all duration-300 translate-y-12 opacity-0';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="text-emerald-400">✓</span> ${msg}`;
  toast.classList.remove('translate-y-12', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-12', 'opacity-0');
  }, 2400);
}

/* ==========================================================================
   7. Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileNav');

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  const links = menu.querySelectorAll('a');
  links.forEach(l => {
    l.addEventListener('click', () => menu.classList.add('hidden'));
  });
}

/* ==========================================================================
   8. Telemetry Mock Ticker in Cockpit Header
   ========================================================================== */
function initTelemetryMock() {
  const cpuEl = document.getElementById('mockCpu');
  const ramEl = document.getElementById('mockRam');

  if (!cpuEl || !ramEl) return;

  setInterval(() => {
    const cpu = (2.2 + Math.random() * 2.8).toFixed(1);
    const ram = (28 + Math.floor(Math.random() * 5));
    cpuEl.textContent = `${cpu}%`;
    ramEl.textContent = `${ram}%`;
  }, 3500);
}
