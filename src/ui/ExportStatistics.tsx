import { useState, useEffect, useRef, type JSX } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BoolToNumber, formatDate, PrintDate } from "./helpers";
import { GetExpenses } from "./database";
import printCss from "./static/ExportStatisticsPDF.css?raw";

// Types to make sure the data is structured correctly and to make it easier to work with on the table rendering part
// These types are only used within this file, so they are not exported
type TableItem = {
    barcode: string,
    name: string,
    amountSold: {total: number, happy_hour: number},
    stock: number,
    amountPrizes: number,
    amountLoss: number,
    priceSoldPerItem: {normal: number, happy_hour: number},
    priceBought: number,
    totalRevenue: number,
    totalProfit: number,
    profitAvgPerItem: number
};
type OverviewTableInfoType = {
    table: TableItem[], 
    revenue: number, 
    expenses: number, 
    profit: number
};
type LanSpecificType = {
    salesTable: TableItem[], 
    expensesTable: Expenses[], 
    revenue: number, 
    expenses: number, 
    profit: number,
    lanDate: LanDatesType
};
type ExportProps = {
    products: Product[], 
    lanDates: LanDatesType[], 
    saleStatistics: SaleStatistics[]
};

export function ExportStatistics({products, lanDates, saleStatistics}: ExportProps): JSX.Element {
    // State for the date interval chosen by the user for the export PDF
    const [exportInterval, setExportInterval] = useState<{startDate: Date, endDate: Date}>({startDate: new Date(), endDate: new Date()});
    // State for the LANs that are within the chosen date interval, which is used to render the LAN specific tables in the PDF
    const [intervalLanDates, setIntervalLanDates] = useState<Array<LanDatesType>>([]);
    // State for the information that is to be rendered in the tables in the PDF
    const [tableInfo, setTableInfo] = useState<{overview: OverviewTableInfoType, lanSpecific: LanSpecificType[]}>({overview: {table: [], revenue: 0, expenses: 0, profit: 0}, lanSpecific: []});
    // State for the expenses data fetched from the database
    const [expenses, setExpenses] = useState<Expenses[]>([]);

    // Ref and function for printing the PDF, which is done by rendering the PDF in an iframe and then calling the print function on the iframe's content window
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };

    // When the component renders, fetch the expenses data from the database and store it in the state
    useEffect(() => {
        GetExpenses(setExpenses);
    }, []);

    // Whenever the user changes the date interval for the export data, update the intervalLanDates state to only include the LANs that are within the chosen date interval
    useEffect(() => {
        // Sets the start date to the beginning of the day and the end date to the end of the day to make sure that all data from each day is included in the export, even if the user only changes the date and not the time
        exportInterval.startDate.setHours(0,0,0,0);
        exportInterval.endDate.setHours(23,59,59,999);

        // Filter the LANs to only include the ones that are within the chosen date interval, which is used to render the LAN specific tables in the PDF
        const filteredLanDates = lanDates.filter((lan) => {
            return (
                lan.startDate >= exportInterval.startDate && 
                lan.endDate <= exportInterval.endDate
            );
        });

        setIntervalLanDates(filteredLanDates);
    }, [exportInterval]);

    // Whenever the intervalLanDates or expenses state changes, update the tableInfo state with the new information to be rendered in the PDF tables
    useEffect(() => {
        // This function takes a list of sales and populates a list of TableItem objects, which is used to render the tables in the PDF. It calculates the total revenue, total sold, total profit, and other relevant information for each product based on the sales data.
        function PopulateTableItemList(filteredFunctionSalesList: SaleStatistics[]) {
            let temporaryTable: TableItem[] = [];

            products.forEach((product) => {
                const productFilteredList = filteredFunctionSalesList.filter((sale) => sale.soldProduct.product.id === product.id);
                const totalRevenue = parseFloat(productFilteredList.reduce((sum, sale) => sum + sale.total_sale_price, 0).toFixed(2));
                const totalSold = parseFloat(productFilteredList.reduce((sum, sale) => sum + sale.soldProduct.quantity*BoolToNumber(!sale.soldProduct.is_prize)*BoolToNumber(!sale.soldProduct.loss), 0).toFixed(2));
                const totalProfit = (totalRevenue - product.bought_price*totalSold);

                const tableItem: TableItem = {
                    barcode: product.barcode,
                    name: `${product.brand} ${product.name}`,
                    amountSold: {total: totalSold, happy_hour: parseFloat(productFilteredList.reduce((sum, sale) => sum + sale.soldProduct.quantity*BoolToNumber(sale.soldProduct.is_happy_hour_purchase),0).toFixed(2))},
                    stock: product.stock,
                    amountPrizes: parseFloat(productFilteredList.reduce((sum, sale) => sum + sale.soldProduct.quantity*BoolToNumber(sale.soldProduct.is_prize), 0).toFixed(2)),
                    amountLoss: parseFloat(productFilteredList.reduce((sum, sale) => sum + sale.soldProduct.quantity*BoolToNumber(sale.soldProduct.loss), 0).toFixed(2)),
                    priceSoldPerItem: {normal: product.price, happy_hour: product.happy_hour_price},
                    priceBought: product.bought_price,
                    totalRevenue: totalRevenue,
                    totalProfit: totalProfit,
                    profitAvgPerItem: parseFloat((totalProfit / totalSold).toFixed(2))
                };
                if (tableItem.amountSold.total > 0) { temporaryTable.push(tableItem); }
            });

            return temporaryTable;
        }

        // Filter the sales data to only include the sales that are within the chosen date interval, which is used to render the tables in the PDF
        const filteredSalesList: SaleStatistics[] = saleStatistics.filter((sale) => (sale.datetime < exportInterval.endDate && sale.datetime > exportInterval.startDate));
        // Populate the overview table with the filtered sales data, by using the PopulateTableItemList function, which is used to render the overview table data in the PDF in a structured way
        const overviewTableItems: TableItem[] = PopulateTableItemList(filteredSalesList);
        // Create a set of the LAN IDs that are within the chosen date interval, which is used to filter the expenses data to only include the expenses that are related to the LANs that are within the chosen date interval, 
        // so that the expenses data is only included in the PDF if it is relevant to the LANs that are being exported
        // A set is used here because it allows for efficient lookups when filtering the expenses data. By creating a set of the LAN IDs that are within the chosen date interval
        // we can quickly check if an expense's LAN ID is in the set without having to iterate through a list of LAN IDs each time, which improves performance especially if there are many expenses and LANs.
        const allowedLanIds = new Set(intervalLanDates.map(lanDate => lanDate.id));
        // Filter the expenses data to only include the expenses that are related to the LANs that are within the chosen date interval
        const filteredExpenses: Expenses[] = expenses.filter(expense => allowedLanIds.has(expense.lanDateId));
        // Calculate the total revenue, total expenses, and total profit for the lan interval by summing up the relevant values from the overview table items and the filtered expenses
        const revenueNumber = overviewTableItems.reduce((sum, item) => sum + item.totalRevenue, 0);
        const expensesNumber = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const profitNumber = overviewTableItems.reduce((sum, item) => sum + item.totalProfit, 0);
        // Create the overview table info object, which is used to render the overview table data in the PDF in a structured way
        const overviewTableInfo: OverviewTableInfoType = {table: overviewTableItems, revenue: revenueNumber, expenses: expensesNumber, profit: profitNumber};
        
        // For each LAN that is within the chosen date interval, calculate the relevant data for the LAN specific tables in the PDF, and populate a list of LanSpecificType objects
        let lanSpecificTableItems: LanSpecificType[] = [];
        intervalLanDates.forEach((lanDate) => {
            const sales = PopulateTableItemList(filteredSalesList.filter((sale) => (sale.datetime < lanDate.endDate && sale.datetime > lanDate.startDate)));
            const filteredLanExpenses = expenses.filter((expense) => expense.lanDateId === lanDate.id);
            const revenueNumber = parseFloat(sales.reduce((sum, sale) => sum + sale.totalRevenue, 0).toFixed(2));
            const expensesNumber = parseFloat(filteredLanExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2));
            const profitNumber = parseFloat((revenueNumber - expensesNumber).toFixed(2));
            lanSpecificTableItems.push({salesTable: sales, expensesTable: filteredLanExpenses, revenue: revenueNumber, expenses: expensesNumber, profit: profitNumber, lanDate: lanDate});
        });

        // Set the table info state with the new overview and LAN specific table data, which is used to render the tables in the PDF in a structured way
        setTableInfo({overview: overviewTableInfo, lanSpecific: lanSpecificTableItems});
    }, [intervalLanDates, expenses]);
    
    return (
        <div id="ExportStatisticsModal">
            <div className="no-print">
                <input
                    className="date-interval"
                    type="date"
                    value={formatDate(exportInterval.startDate, 'date')}
                    onChange={(e) => setExportInterval(prevDate => {
                        return {startDate: new Date(e.target.value), endDate: prevDate.endDate};
                    })}
                    name={`startDate`}
                />
                <span>→</span>
                <input
                    className="date-interval"
                    type="date"
                    value={formatDate(exportInterval.endDate, 'date')}
                    onChange={(e) => setExportInterval(prevDate => {
                        return {startDate: prevDate.startDate, endDate: new Date(e.target.value)};
                    })}
                />
                <button id="print-statistics" onClick={handlePrint}>Print / Save PDF</button>
            </div><br/>

            <iframe ref={iframeRef} srcDoc={
                `<style>${printCss}</style>` + renderToStaticMarkup(
                    <div className="print-area">
                        <h1>Salg- og Profitrapport for perioden ({PrintDate(exportInterval.startDate)} - {PrintDate(exportInterval.endDate)})</h1>

                        {/*================= OVERBLIK =================*/}
                        <h2>Overblik – Samlet salg</h2>

                        <table>
                            <thead>
                                <tr>
                                    <th>Stregkode</th>
                                    <th>Varenavn</th>
                                    <th>Stk solgt<br/>(happy hour)</th>
                                    <th>Stk på lager</th>
                                    <th>Stk præmier</th>
                                    <th className="loss">Stk tabt</th>
                                    <th>Pris solgt<br/>(happy hour)</th>
                                    <th>Pris købt</th>
                                    <th>Omsætning i alt</th>
                                    <th>Profit i alt</th>
                                    <th>Profit pr. salg (gns.)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    tableInfo.overview.table.length > 0 ? tableInfo.overview.table.map(table => {
                                        return (
                                            <tr key={table.barcode}>
                                                <td>{table.barcode}</td>
                                                <td>{table.name}</td>
                                                <td className="numeric">{table.amountSold.total}<br/>({table.amountSold.happy_hour})</td>
                                                <td className="numeric">{table.stock}</td>
                                                <td className="numeric">{table.amountPrizes}</td>
                                                <td className="numeric loss">{table.amountLoss}</td>
                                                <td className="numeric">{table.priceSoldPerItem.normal}<br/>({table.priceSoldPerItem.happy_hour})</td>
                                                <td className="numeric">{table.priceBought}</td>
                                                <td className="numeric">{table.totalRevenue}</td>
                                                <td className="numeric">{table.totalProfit}</td>
                                                <td className="numeric">{table.profitAvgPerItem}</td>
                                            </tr>
                                        );
                                    }) : <tr><td colSpan={11}>Ingen produkter i intervallet.</td></tr>
                                }
                            </tbody>
                        </table>
                        <table className="summary-table">
                            <tbody>
                                <tr>
                                    <th>Total omsætning<br/>(Profit efter varekøb)</th>
                                    <td className="numeric">{tableInfo.overview.revenue}</td>
                                    <br/>
                                    <td className="numeric">{tableInfo.overview.profit}</td>
                                </tr>
                                <tr>
                                    <th>Total udgifter</th>
                                    <td className="numeric">{tableInfo.overview.expenses}</td>
                                </tr>
                                <tr>
                                    <th>Total profit</th>
                                    <td className={`numeric ${tableInfo.overview.profit-tableInfo.overview.expenses < 0 ? "negative-profit" : "positive-profit"}`}>{tableInfo.overview.revenue-tableInfo.overview.expenses}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/*================= LAN SPECIFIC =================*/}
                        {
                            tableInfo.lanSpecific.length > 0 ? tableInfo.lanSpecific.map((info, index) => {
                                return (
                                    <div key={info.lanDate.id}>
                                        <div className="page-break"></div>
                                        <h2>Lan {index+1} ({PrintDate(info.lanDate.startDate)} - {PrintDate(info.lanDate.endDate)})</h2>

                                        <h3>Salg</h3>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Stregkode</th>
                                                    <th>Varenavn</th>
                                                    <th>Stk solgt<br/>(happy hour)</th>
                                                    <th>Stk præmier</th>
                                                    <th>Pris solgt<br/>(happy hour)</th>
                                                    <th>Pris købt</th>
                                                    <th>Omsætning i alt</th>
                                                    <th>Profit i alt</th>
                                                    <th>Profit pr. salg</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    info.salesTable.length > 0 ? info.salesTable.map(table => {
                                                        return (
                                                            <tr key={table.barcode}>
                                                                <td>{table.barcode}</td>
                                                                <td>{table.name}</td>
                                                                <td className="numeric">{table.amountSold.total}<br/>({table.amountSold.happy_hour})</td>
                                                                <td className="numeric">{table.amountPrizes}</td>
                                                                <td className="numeric">{table.priceSoldPerItem.normal}<br/>({table.priceSoldPerItem.happy_hour})</td>
                                                                <td className="numeric">{table.priceBought}</td>
                                                                <td className="numeric">{table.totalRevenue}</td>
                                                                <td className="numeric">{table.totalProfit}</td>
                                                                <td className="numeric">{table.profitAvgPerItem}</td>
                                                            </tr>
                                                        );
                                                    }) : <tr><td colSpan={9}>Ingen produkter solgt.</td></tr>
                                                }
                                            </tbody>
                                        </table>

                                        <h3>Udgifter</h3>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Beskrivelse</th>
                                                    <th>Værdi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    info.expensesTable.length > 0 ? info.expensesTable.map((table, index) => {
                                                        return (
                                                            <tr key={table.id}>
                                                                <th>{index + 1}</th>
                                                                <td>{table.description}</td>
                                                                <td className="numeric">{table.amount}</td>
                                                            </tr>
                                                        );
                                                    }) : <tr><td colSpan={3}>Ingen udgifter.</td></tr>
                                                }
                                            </tbody>
                                        </table>

                                        <table className="summary-table">
                                            <tbody>
                                                <tr>
                                                    <th>Total omsætning<br/>(Profit efter varekøb)</th>
                                                    <td className="numeric">{info.revenue}</td>
                                                    <br/>
                                                    <td className="numeric">{info.profit}</td>
                                                </tr>
                                                <tr>
                                                    <th>Total udgifter</th>
                                                    <td className="numeric">{info.expenses}</td>
                                                </tr>
                                                <tr>
                                                    <th>Total profit</th>
                                                    <td className={`numeric ${info.profit-info.expenses < 0 ? "negative-profit" : "positive-profit"}`}>{info.profit-info.expenses}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }) : (<><br /><h2>Lan 0</h2>Ingen LAN startet i perioden.</>)
                        }
                    </div>
                )
            } width="100%" height="100%"></iframe>
        </div>
    );
}