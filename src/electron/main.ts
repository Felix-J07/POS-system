import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path";
import { isDev } from "./util.js";
//import log from "electron-log"; // For debugging purposes
import { GetProducts, AddProduct, UpdateProduct, DeleteProduct, GetSales, AddSale, UpdateProductStock, ExportDatabase, Login, ImportDatabase } from "./database.js";

// Change log levels
//log.transports.console.level = "silly"; // everything goes to terminal
//log.transports.file.level = "info";     // only info+ goes to file
//Object.assign(console, log.functions);

// When the app is ready (turned on), create the browser window.
app.on('ready', () => {
    // Create the browser window with the following options
    // Preload script is used to expose certain APIs to the renderer process
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
    // If the app is in development mode, load the React app from the local server and open DevTools.
    // Otherwise, load the built React app from the filesystem, hide the menu bar, set the title, maximize the window, and open DevTools.
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
        mainWindow.setMenuBarVisibility(false);
        mainWindow.setTitle("POS System");
        mainWindow.maximize();
        mainWindow.webContents.openDevTools();
    }

    // IPC handlers for communication between the main and renderer processes
    ipcMain.handle("get-products", async (event) => {
        const products = await GetProducts();
        return products;
    });

    ipcMain.handle("add-product", async (event, product) => {
        const confirmation = await AddProduct(product);
        return confirmation;
    });

    ipcMain.handle("update-product", async (event, product) => {
        const confirmation = await UpdateProduct(product);
        return confirmation;
    });

    ipcMain.handle("delete-product", async (event, productId) => {
        const confirmation = await DeleteProduct(productId);
        return confirmation;
    });

    ipcMain.handle("get-sales", async (event, condition?: string, params?: Object) => {
        const sales = await GetSales(condition, params);
        return sales;
    });

    ipcMain.handle("add-sale", async (event, sale) => {
        const confirmation = await AddSale(sale);
        return confirmation;
    });

    ipcMain.handle("update-product-stock", async (event, sale) => {
        const confirmation = await UpdateProductStock(sale);
        return confirmation;
    });

    ipcMain.handle("export-database", async (event) => {
        const confirmation = await ExportDatabase(mainWindow);
        return confirmation;
    });

    ipcMain.handle("login", async (event, {username, password}) => {
        const confirmation = await Login(username, password);
        return confirmation;
    });

    ipcMain.handle("import-database", (event) => {
        ImportDatabase();
        return;
    })
});

// Quit the app when all windows are closed
// Except on macOS where it's common for apps to stay open until the user explicitly quits.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});