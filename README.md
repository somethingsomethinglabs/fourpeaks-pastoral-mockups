# Four Peaks Pastoral — Client Mockup Preview

Static preview site for sharing website mockups with the client.

## Mockups included

- **Grounded** — Ground Truth (cool paper, Record Line, survey-sheet structure)
- **Sharp** — Trust and credibility (full-bleed cinematic home)
- **Friendly** — Bold cinematic split-hero; light and dark surface treatments via the switcher bar
- **Space** — Radian Fluid structure (oversized type, inset imagery, gallery-style sections)

Design milestone coverage: Home, Services hub, **7 service detail pages**, Carbon Grazing Australia™, Contact — plus About and a Privacy Policy stub. Four layout directions; Friendly also has a light/dark theme flip.

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

This folder is the git repository root. After rebuilding:

```bash
git add -A
git -c user.name="Your Name" -c user.email="you@example.com" commit -m "Update mockup preview"
git push
```

### First-time GitHub setup

If the remote does not exist yet, create it (requires a `gh` token with `repo` scope):

```bash
gh repo create fourpeaks-pastoral-mockups --public \
  --description "Four Peaks Pastoral website mockup preview for client review" \
  --source=. --remote=origin --push

gh api repos/somethingsomethinglabs/fourpeaks-pastoral-mockups/pages \
  -f build_type=legacy -f source[branch]=main -f source[path]=/
```

**Live URL:** https://somethingsomethinglabs.github.io/fourpeaks-pastoral-mockups/

GitHub Pages serves from the repository root on `main`.
