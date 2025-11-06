const electron = require('electron');

// Make APIs available in the renderer process
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
    get_sales: async (condition?: string, params?: Object) => {
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
    },
    login: async (username: string, password: string) => {
        var args = {
            username: username,
            password: password
        };
        return await electron.ipcRenderer.invoke("login", args);
    },
    import_database: async () => {
        await electron.ipcRenderer.invoke("import-database");
        return;
    },
    reset_database: () => {
        electron.ipcRenderer.invoke("reset-database");
        return;
    },
    get_lan_dates: async () => {
        return await electron.ipcRenderer.invoke("get-lan-dates");
    },
    update_lan_dates: async (lanDates: LanDatesType[]) => {
        return await electron.ipcRenderer.invoke("update-lan-dates", lanDates);
    }

} satisfies Window['electron']);