# POS System

A Point-Of-Sale (POS) system designed for the Rybners HTX LAN committee. This application is built using Electron, React, and TypeScript, offering a portable solution for managing sales, products, and inventory.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Usage Guide](#usage-guide)
  - [First Run](#first-run)
  - [Product Management](#product-management)
  - [Sales & Checkout](#sales--checkout)
  - [Statistics](#statistics)
  - [Settings & Admin](#settings--admin)
- [Project Structure](#project-structure)

## Features

- **Product Management**: Create, read, update, and delete products easily. Manage stock levels, prices, and brands.
- **Happy Hour Support**: Configure special pricing for specific time periods.
- **Cart & Checkout**: Efficient cart system supporting product quantity adjustments, prizes, and happy hour discounts.
- **Sales Statistics**: View detailed sales logs and transaction history.
- **User Administration**: Secure login system for administrative tasks.
- **Portable Database**: Utilizes SQLite for a self-contained, offline-capable database that moves with the application.
- **Expenses Tracking**: Manage and view expenses alongside sales.
- **Export/Import**: Backup and restore your database easily.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Install the latest LTS version of Node.js.
- **Git**: For cloning the repository.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd "POS-system"
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Development

To start the application in development mode with hot-reloading:

```bash
npm run dev
```

This command runs both the Vite dev server for React and the Electron main process concurrently.

## Building for Production

To create a standalone executable for the application:

**Windows**:
```bash
npm run dist:win
```

**macOS**:
```bash
npm run dist:mac
```

**Linux**:
```bash
npm run dist:linux
```

The output files will be located in the `dist` or `out` directory (depending on configuration).

## Usage Guide

### First Run
Upon the first launch, the application will initialize a local SQLite database (`database.db`). 
- If you are running the **portable executable**, this file will need to be added to the same directory as the `.exe`.

### Product Management
Navigate to the products section to add new items. You can specify:
-   **Barcode**: For scanner integration.
-   **Brand & Name**: Identification details.
-   **Cost & Selling Price**: For profit calculation.
-   **Stock Quantity**: Automatically decrements on sale.
-   **Happy Hour Price**: Automatic discount triggering during configured times.

### Sales & Checkout
1.  **Add to Cart**: Click on products in the showcase.
2.  **Adjust Quantity**: Use the cart sidebar to increase/decrease amounts.
3.  **Checkout**: Proceed to payment. The system validates stock levels automatically and records the transaction.

### Statistics
View a comprehensive history of all transactions. You can filter data to analyze sales performance over time, tracking both revenue and "loss" (e.g., expired items).

### Settings & Admin
Access the settings menu to:
-   **User Admin**: Create and manage user accounts for the system.
-   **Setting LAN dates**: Configure the dates for the LAN events for statistics purposes.
-   **Expenses**: Add and manage expenses to track overall profitability for statistics purposes.

## Project Structure

-   `src/electron/`: Contains the Electron main process code (backend).
    -   `main.ts`: Application entry point.
    -   `database.ts`: SQLite database interactions and query functions.
    -   `Tables.sql`: Database schema definitions (reference).
-   `src/ui/`: Contains the React frontend code.
    -   `App.tsx`: Main React component and routing.
    -   `static/`: CSS styles and static assets (images, fonts).
    -   `*.tsx`: React components for products, cart, statistics, and settings.
-   `dist-electron/`: Compiled Electron source code.
-   `dist-react/`: Built React assets (HTML, CSS, JS).
-   `dist/` or `out/`: Final packaged application for distribution.
-   `public/database.db`: SQLite database file. This file only has the schema and a test user (username: "test", password: "test").

## Technologies Used

-   [Electron](https://www.electronjs.org/)
-   [React](https://reactjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [SQLite3](https://github.com/mapbox/node-sqlite3)
-   [Vite](https://vitejs.dev/)
-   And more

See all npm packages under `package.json` then `dependencies` and `devDependencies`.

## Security

- The app uses a Content Security Policy (CSP) that allows images from any URL on the web for product images.

## Be aware

If you by accident remove all users in the user management item, you need to have access to an earlier database version or use `sqlite3` in the terminal. `sqlite3` is a prerequisite. After accessing the database by `sqlite3 database.db`, you will be able to run a command to add a new user to the database.

```sql
INSERT INTO users (username, password) VALUES ('username', 'password');
```

The `'username'` and `'password'` can be changed to whatever credentials you want.


Designed by [Felix Jensen](https://github.com/Felix-J07)