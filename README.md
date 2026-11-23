# BenX showcase

The documentation site for [BenX-Assisto V-2.0](https://github.com/NateshKannaR/BenX-Assisto_V-2.0), a Linux desktop assistant for Arch Linux and Hyprland.

The site includes a recorded desktop walkthrough, a simulated command playground, a searchable command reference, and installation instructions for the terminal, GTK4, and local web interfaces. The Android section links to the companion APK and pairing guide.

## Preview locally

From the website repository, run:

```bash
npx --yes serve@14 . --listen tcp://127.0.0.1:8080
```

Open http://127.0.0.1:8080. The site uses CDN-hosted Tailwind, Lucide, and fonts. The walkthrough video is served from `assets/`. Use a server with HTTP range support for chapter seeking. For a quick preview of the page and its text, `python3 -m http.server 8080 --bind 127.0.0.1` also works.

## Update the documentation

- `index.html` contains the walkthrough, feature descriptions, and installation steps.
- `js/app.js` contains the simulated command examples and page interactions.
- `css/style.css` contains custom styles.

Check command names and installation steps against the [assistant README](https://github.com/NateshKannaR/BenX-Assisto_V-2.0/blob/main/README.md). Update the APK link when a new companion build is published.
