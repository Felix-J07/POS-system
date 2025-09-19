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
    },
    get_sales: async (condition?: string, params?: any) => {
        return await electron.ipcRenderer.invoke("get-sales", condition, params);
    },
    add_sale: async (sale: Sale) => {
        return await electron.ipcRenderer.invoke("add-sale", sale);
    },
    update_product_stock: async (sale: Sale) => {
        return await electron.ipcRenderer.invoke("update-product-stock", sale);
    },
    export_database: async () => {
        return await electron.ipcRenderer.invoke("export-database");
    }
} satisfies Window['electron']);