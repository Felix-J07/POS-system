# POS System

This is a Point-Of-Sale (POS) System made for the Rybners HTX LAN committee. It is a desktop application built with Electron, React, and TypeScript.

## Features

- Product management (add, update, delete products)
- Cart and checkout system
- SQLite database for offline storage
- Happy hour pricing and time periods
- Sales statistics and reporting
- User authentication (login)
- Settings and storage management
- Portable mode: each app copy uses its own database

## Installation

1. **Clone the repository:**
	```sh
	git clone <repo-url>
	cd "Electron w React and Typescript"
	```
2. **Install dependencies:**
	```sh
	npm install
	```
3. **Run in development mode:**
	```sh
	npm run dev
	```
4. **Build for production (Windows):**
	```sh
	npm run dist:win
	```
	The built `.exe` will be in the `dist/` or `out/` directory.

## Usage

- On first run, a default database will be copied to a local folder for that app instance.
- The app is portable: copying the `.exe` to a new folder creates a new, independent database.
- Product images can be local files or web links (CSP allows Google and any image URLs).

## Development

- Source code is in the `src/` folder:
  - `src/electron/` – Electron main process, database, preload scripts
  - `src/ui/` – React frontend (components, styles)
- Types are defined in `types.d.ts`.
- Main entry point: `src/electron/main.ts`
- UI entry point: `src/ui/main.tsx`

## Security

- The app uses a Content Security Policy (CSP) that allows images from any URL for product images.

## Be aware

If an older version of the app has run on the device previously, and the app has an updated database file, the updated database file will not be used. The app uses the old database already saved in the `AppData` folder. Therefore use the Import Database button on the Settings page.
