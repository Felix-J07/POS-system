import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path";
import { GetProducts } from "./comunication.js";
import { isDev } from "./util.js";
import log from "electron-log";

// Change log levels
log.transports.console.level = "silly"; // everything goes to terminal
log.transports.file.level = "info";     // only info+ goes to file
Object.assign(console, log.functions);

app.on('ready', () => {
    log.info("App is ready");
    let mainWindow = new BrowserWindow({
        // preload script
        webPreferences: {
            preload: path.join(app.getAppPath(), isDev() ? "." : "..", "dist-electron", "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false
        },
        width: 1200,
        height: 600
    });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
        mainWindow.setMenuBarVisibility(false);
        mainWindow.setTitle("POS System");
        mainWindow.maximize();
        mainWindow.webContents.openDevTools();
    }

    ipcMain.handle("get-products", async (event, argz) => {
        const GetProducts = () => {};
        const products = await GetProducts();
        log.info("Products: " + products);
        return products;
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});