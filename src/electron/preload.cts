const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
    get_products: async () => {
        const products: Product[] = await electron.ipcRenderer.invoke('get-products');
        return products;
    },
    add_product: async (product: Product) => {
        return await electron.ipcRenderer.invoke("add-product", product);
    },
    update_product: async (product: Product) => {
        return await electron.ipcRenderer.invoke("update-product", product);
    },
    delete_product: async (productId: number) => {
        return await electron.ipcRenderer.invoke("delete-product", productId);
    }
} satisfies Window['electron']);