# Four Peaks Pastoral — Client Mockup Preview

Static preview site for sharing website mockups with the client.

## Mockups included

- **Mockup 2** — Trust and credibility
- **Mockup 3** — Bold cinematic (light)
- **Mockup 3 — Dark** — Same as Mockup 3, dark palette

## Rebuild from source

From the project root:

```bash
./scripts/build-client-preview.sh
```

## Local preview

```bash
cd client-preview
python3 -m http.server 8780 --bind 127.0.0.1
```

Open http://127.0.0.1:8780/

## Deploy

This folder is the git repository root. After rebuilding, commit and push to `main`. GitHub Pages serves from the repository root.
