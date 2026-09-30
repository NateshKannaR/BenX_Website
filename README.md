# BenX-AI V-2.0 Showcase Website

A futuristic, high-performance showcase website for [BenX-Assisto V-2.0](https://github.com/NateshKannaR/BenX-Assisto_V-2.0.git) — the sovereign AI desktop assistant tailored for Arch Linux and Hyprland (Wayland).

## 🌟 Highlights
- **Interactive "How It Works" Pipeline**: Detailed visual breakdown of audio ingestion, Groq/OpenRouter multi-model intelligence, ironclad safety guardrails (`CONFIRM_ACTIONS`), and native Wayland/Hyprland IPC execution.
- **Interactive Live Simulator / Command Playground**: Try real-world natural language commands, watch dynamic Cairo 30fps waveforms, inspect AI routing latency, and see simulated desktop reactions.
- **Triple User Interface Showcase**: Previews for GTK4/Libadwaita glassmorphic UI, Tokyo-Night terminal TUI, and Flutter mobile sync.
- **Searchable Command Reference**: Filterable catalog of voice and keyboard commands across window management, hardware controls, wayland peripherals, and developer tooling.
- **One-Click Quick Start Guide**: Tabbed installation commands for Arch Linux, Ubuntu/Debian, Fedora, and CLI mode with copy-to-clipboard functionality.

## 🚀 How to Run Locally

You can run this website instantly using Python's built-in HTTP server:

```bash
cd /home/natesh/Downloads/BenX_Website
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your web browser.

Or simply open `index.html` directly in your favorite browser:
```bash
xdg-open index.html
```

## 📁 Directory Structure
```
BenX_Website/
├── index.html        # Main responsive showcase landing page
├── css/
│   └── style.css     # Tokyo-Night and Libadwaita dark glassmorphic styling
├── js/
│   └── app.js        # Waveform visualizer, simulator, search filter, tab engine
├── assets/           # Project imagery, robot mascot, and banners
└── README.md
```

## 🌐 Deployment
This website is 100% static and client-side ready. It can be deployed immediately to:
- **GitHub Pages** (Settings -> Pages -> Deploy from branch)
- **Vercel** (`vercel --prod`)
- **Netlify** (Drag-and-drop the directory)
- **Cloudflare Pages**
