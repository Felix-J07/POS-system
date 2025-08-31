const { contextBridge, ipcRenderer } = require("electron");

const renderer = {
    get_products: async () => {
        const products = await ipcRenderer.invoke("get-products");
        console.log(products);
        return products;
    }
}

contextBridge.exposeInMainWorld("electron", renderer);