import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path";
import { isDev } from "./util.js";
//import log from "electron-log"; // For debugging purposes
import { GetProducts, AddProduct, UpdateProduct, DeleteProduct, GetSales, AddSale, UpdateProductStock, Login, ExportDatabase, ImportDatabase, ResetDatabase, GetLanDates, UpdateLanDates } from "./database.js";

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
    ipcMain.handle("get-products", async (_) => {
        const products = await GetProducts();
        return products;
    });

    ipcMain.handle("add-product", async (_, product) => {
        const confirmation = await AddProduct(product);
        return confirmation;
    });

    ipcMain.handle("update-product", async (_, product) => {
        const confirmation = await UpdateProduct(product);
        return confirmation;
    });

    ipcMain.handle("delete-product", async (_, productId) => {
        const confirmation = await DeleteProduct(productId);
        return confirmation;
    });

    ipcMain.handle("get-sales", async (_, condition?: string, params?: Object) => {
        const sales = await GetSales(condition, params);
        return sales;
    });

    ipcMain.handle("add-sale", async (_, sale) => {
        const confirmation = await AddSale(sale);
        return confirmation;
    });

    ipcMain.handle("update-product-stock", async (_, sale) => {
        const confirmation = await UpdateProductStock(sale);
        return confirmation;
    });

    ipcMain.handle("login", async (_, {username, password}) => {
        const confirmation = await Login(username, password);
        return confirmation;
    });

    ipcMain.handle("export-database", async (_) => {
        const confirmation = await ExportDatabase(mainWindow);
        return confirmation;
    });

    ipcMain.handle("import-database", async (_) => {
        const confirmation = await ImportDatabase(mainWindow);
        if (confirmation) {
            mainWindow.webContents.reloadIgnoringCache();
        }
        return;
    });

    ipcMain.handle("reset-database", (_) => {
        ResetDatabase();
        return
    })

    ipcMain.handle("get-lan-dates", async (_) => {
        const lanDates = await GetLanDates();
        return lanDates;
    });

    ipcMain.handle("update-lan-dates", async (_, lanDates) => {
        const confirmation = await UpdateLanDates(lanDates);
        return confirmation;
    });
});

// Quit the app when all windows are closed
// Except on macOS where it's common for apps to stay open until the user explicitly quits.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});