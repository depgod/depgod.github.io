---
title: "Deploy a Hugo Site with GitHub Actions + GitHub Pages"
date: 2025-07-30
draft: false
tags: [hugo, github actions, github pages, cicd, tutorial]
categories: [how-to]
summary: "A clean, copy‑pasteable workflow to build Hugo and deploy to GitHub Pages in minutes."
toc: true
tocBorder: true
---

Want your Hugo blog live on the internet with zero servers and free HTTPS? GitHub Pages + GitHub Actions is a perfect fit. Here’s a friendly, copy‑pasteable setup you can reuse for any Hugo site.

What you’ll do:
- Push your Hugo site to GitHub
- Add a GitHub Actions workflow that builds Hugo
- Publish the generated site to GitHub Pages automatically on every push

Requirements:
- A GitHub account and repository
- Hugo Extended (locally optional; Actions will install it)

## 1) Push your Hugo site to GitHub

If you don’t have a site yet:

```bash
hugo new site my-blog
cd my-blog
# Add a theme (example)
git init
git submodule add https://github.com/your/theme themes/your-theme
echo 'theme = "your-theme"' >> config.toml
```

Commit and push:

```bash
git add .
git commit -m "feat: init hugo site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 2) Set `baseURL` correctly

Open `config.toml` (or `config.yaml`). Set a full URL with a trailing slash.

Examples:

```toml
# User/Org site (repo is <you>.github.io)
baseURL = "https://<you>.github.io/"

# Project site (repo is any other name)
baseURL = "https://<you>.github.io/<repo>/"
```

Tip: If you preview locally, you can still run `hugo server` without changing `baseURL`. For static checks, `hugo --baseURL "." --relativeURLs` also works.

## 3) Add the GitHub Actions workflow

Create `.github/workflows/pages.yml` with the following content:

```yaml
name: Build and Deploy (Hugo → GitHub Pages)

on:
  push:
    branches: [ main ]
  workflow_dispatch: {}

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.147.0'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Commit and push:

```bash
git add .github/workflows/pages.yml
git commit -m "ci: deploy Hugo to GitHub Pages"
git push
```

## 4) Enable GitHub Pages

- Go to your repository → Settings → Pages
- Build and deployment → Source: choose “GitHub Actions”
- After the first run, the URL will appear (something like `https://<you>.github.io/<repo>/`).

## 5) Verify locally (optional but nice)

```bash
hugo server -D
# open http://localhost:1313
```

## Troubleshooting quick hits

- CSS not loading on the published site? Your `baseURL` probably lacks the project path or trailing slash. Fix it and push again.
- Theme uses SCSS? You must use Hugo Extended (the workflow above does).
- Draft content missing? Use `draft: false` in front matter or build with `hugo -D` (not recommended for production).
- Project pages path: Your live site is served under `/<repo>/`. Use absolute URLs based on `baseURL` or enable `relativeURLs` if you prefer.

## Optional: custom domain

1) In repo Settings → Pages, set your custom domain (e.g., `blog.example.com`).
2) Add a `CNAME` file so Actions publishes it:

```bash
echo "blog.example.com" > static/CNAME
git add static/CNAME
git commit -m "chore: add CNAME"
git push
```
3) In DNS, create a CNAME record pointing `blog.example.com → <you>.github.io`.

That’s it! Every push to `main` builds your Hugo site and ships it to GitHub Pages — fast, free, and fully automated.
