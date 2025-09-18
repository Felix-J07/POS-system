import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path";
import { isDev } from "./util.js";
//import log from "electron-log";
import { GetProducts, AddProduct, UpdateProduct, DeleteProduct, GetSales, AddSale, UpdateProductStock } from "./database.js";

// Change log levels
//log.transports.console.level = "silly"; // everything goes to terminal
//log.transports.file.level = "info";     // only info+ goes to file
//Object.assign(console, log.functions);

app.on('ready', () => {
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
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
        mainWindow.setMenuBarVisibility(false);
        mainWindow.setTitle("POS System");
        mainWindow.maximize();
        mainWindow.webContents.openDevTools();
    }

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

    ipcMain.handle("get-sales", async (event, condition?: string, params?: any) => {
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
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});