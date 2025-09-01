const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    get_products: async () => {
        const products: Product[] = await electron.ipcRenderer.invoke('get-products');
        return products;
    }
} satisfies Window['electron']);