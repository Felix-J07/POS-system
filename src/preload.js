const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    get_products: async () => {
        console.log("preload.js");
        return await ipcRenderer.invoke("get-products");
    },

    some_name: async () => {
        return await ipcRenderer.invoke("some-name");
    }
});