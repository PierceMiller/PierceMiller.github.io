# My Media — Plex GitHub Pages Portal

A static streaming-style front-end for a personal Plex library.

## Important security note

This site is static. A Plex token entered here is available to the browser. **Never hard-code your Plex token into this repository.** The first version stores it only in the browser when you choose Remember settings.

For a production/private deployment, put a small authenticated proxy/API in front of Plex rather than exposing your Plex token to a public website.

## Setup

1. Open the GitHub Pages URL ending in `/plex/`.
2. Open **Plex Settings**.
3. Enter the HTTPS URL of your Plex server, for example `https://plex.example.com:32400`.
4. Enter your Plex X-Plex-Token.
5. Click **Connect to Plex**.

The browser must be able to reach the Plex server and Plex must permit the browser request. If the page is HTTPS, use HTTPS for Plex as well.

## Current version

- Plex library discovery
- Movies and TV Shows
- Recently added section
- Search
- Plex poster images
- Open Plex from the portal
- Responsive desktop/mobile layout
- Browser-only connection settings

## Next version

A proper backend/proxy can add secure authentication, Continue Watching, resume playback, seasons/episodes, collections, user accounts, and a richer Netflix-style home screen without exposing the Plex token publicly.
