import { useEffect, useState, type JSX } from "react";
import { GetSales } from "./database";
import './static/Statistics.css';
//import './static/toggle_button.css'
import { Modal } from "./modal";
import { ExportStatistics } from "./ExportStatistics";
import { BoolToNumber } from "./helpers";

// ChartJS dependencies, maybe?
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

// Props for the Statistics component (type checking)
type StatisticsProps = {
    products: Product[],
    lanDates: LanDatesType[]
}

// Show sales statistics NOT DONE
// Show total sales, profit, stock value NOT DONE
// Show graphs for sales over time, profit over time, stock value over time NOT DONE
// Filter by date range NOT DONE
// Filter by product category NOT DONE
// Future: Export statistics as CSV or PDF NOT DONE
function Statistics({products, lanDates}: StatisticsProps) {
    // Changes the main-container minWidth based on the page
    useEffect(() => {
        const element = document.querySelector(".main-container");
        if (element instanceof HTMLElement) {
            element.style.minWidth = "300px";
        }
    
        return () => {
            if (element instanceof HTMLElement) {
                element.style.minWidth = ""; // clean up on unmount
            }
        };
    }, []);

    // Sale statistics state
    const [saleStatistics, setSaleStatistics] = useState<SaleStatistics[]>([]);

    // Setting up useStates for the modal and the view
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | false>(false);
    const [modalTitle, setModalTitle] = useState<string>();

    // Toggle mode for radio buttons: 'lastLan' = last LAN, 'year' = last 12 months
    const [toggleMode, setToggleMode] = useState<'lastLan' | 'year'>('lastLan');
    
    // Graph selector state and options
    const [graphSelector, setGraphSelector] = useState<string>('total_revenue');
    const graphOptions = [
        { value: 'total_revenue', label: 'Total omsætning' },
        { value: 'revenue_by_product', label: 'Omsætning pr. produkt' },
        { value: 'profit', label: 'Total profit' },
        { value: 'profit_by_product', label: 'Profit pr. produkt' },
        { value: 'sales_count', label: 'Antal produkter solgt' },
        { value: 'sales_count_by_product', label: 'Antal solgt pr. produkt' },
        { value: 'prize', label: 'Værdi af præmier' },
        { value: 'losses', label: 'Værdi af tab' },
        { value: 'losses_by_product', label: 'Tab pr. produkt' },
    ];

    // Computed lists of sales for last lan and last twelve months
    const salesLastLan: SaleStatistics[] = FilterToOneLAN();
    const salesLastTwelveMonths: SaleStatistics[] = FilterToOneYear();

    // Chart data state
    const [chartData, setChartData] = useState<any>({ datasets: [] });
    const [chartUnit, setChartUnit] = useState<false | "hour" | "year" | "month" | "week" | "millisecond" | "second" | "minute" | "day" | "quarter" | undefined>('hour');
    const [chartHeading, setChartHeading] = useState<string>("");

    // Colors for the graph
    const colorPalette = [
        "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];

    // Fetch sales statistics on component mount
    useEffect(() => {
        GetSales(setSaleStatistics);
    }, []);

    // Recompute chart whenever relevant inputs change
    useEffect(() => {
        setChartUnit(toggleMode === 'lastLan' ? 'hour' : 'day');
        setModalTitle("Eksporter data i pdf format");

        // Determine which list of products should be used
        const isToggleStateLastLan: boolean = toggleMode === 'lastLan' ? true : false;
        const sales = isToggleStateLastLan === true ? salesLastLan : salesLastTwelveMonths;

        // Checks if the sales list is empty
        if (sales.length < 1) { return; }

        // Build labels depending on toggle mode: for lastLan use the most recent lan's start/end dates; for year use date range
        let labels: Date[] = [];
        
        // Build the datasets depending on the toggleState and the selected graph option
        let datasets: Object[] = []

        let startDateTime: Date;
        let endDateTime: Date;
        if (sales.length > 0) {
            startDateTime = new Date(sales[sales.length - 1].datetime) ?? new Date();
            startDateTime.setMinutes(0, 0, 0);
            endDateTime = new Date(sales[0].datetime) ?? new Date();
        } else {
            startDateTime = new Date();
            endDateTime = new Date();
        }

        // A function to calculate the upperbound timestamp based on the lowerbound timestamp and the toggle state
        function UpperboundTimestamp(lowerboundTimestamp: Date): Date {
            let upperboundTimestamp = new Date(lowerboundTimestamp);
            if (isToggleStateLastLan) {
                upperboundTimestamp.setHours(upperboundTimestamp.getHours() + 1);
                return upperboundTimestamp;
            } else {
                // Set time interval to between start and end lan dates and time between each lan
                upperboundTimestamp.setHours(upperboundTimestamp.getHours() + 6);
                return upperboundTimestamp;
            }
        }

        // Function to filter sales based on time range
        function FilterSalesTotal(lowerboundTimestamp: Date, upperboundTimestamp: Date): SaleStatistics[] {
            return sales.filter(sale => sale.datetime < upperboundTimestamp && sale.datetime >= lowerboundTimestamp);
        }

        // Function to filter sales based on time range and product
        function FilterSalesByProduct(lowerboundTimestamp: Date, upperboundTimestamp: Date, product: Product): SaleStatistics[] {
            return sales.filter(sale => sale.soldProduct.product.id === product.id && sale.datetime < upperboundTimestamp && sale.datetime >= lowerboundTimestamp)
        }

        // Calculation function for calculating revenue value
        function RevenueCalc(filteredSalesList: SaleStatistics[]) {
            return parseFloat(filteredSalesList.reduce((sum, item) => sum + item.total_sale_price, 0).toFixed(2));
        }

        // Calculation function for calculating profit value
        function ProfitCalc(filteredSalesList: SaleStatistics[]) {
            return parseFloat(filteredSalesList.reduce((sum, item) => sum + (item.total_sale_price - item.soldProduct.product.bought_price*item.soldProduct.quantity), 0).toFixed(2));
        }

        // Calculation function for calculating sales count
        function SalesCalc(filteredSalesList: SaleStatistics[]) {
            return filteredSalesList.length;
        }

        // Calculation function for calculating the value of prizes
        function PrizesCalc(filteredSalesList: SaleStatistics[]) {
            return parseFloat(filteredSalesList.reduce((sum, item) => sum + (BoolToNumber(item.soldProduct.is_prize)*item.soldProduct.product.bought_price*item.soldProduct.quantity), 0).toFixed(2));
        }

        // Calculation function for calculating the value of losses
        function LossesCalc(filteredSalesList: SaleStatistics[]) {
            return parseFloat(filteredSalesList.reduce((sum, item) => sum + (BoolToNumber(item.soldProduct.loss)*item.soldProduct.product.bought_price*item.soldProduct.quantity), 0).toFixed(2));
        }

        // Function to create chart heading with date range
        function ChartHeadingMaker(chartHeading: string) {
            return `${chartHeading}\n${startDateTime.getDate()}.${startDateTime.getMonth()}.${startDateTime.getFullYear()} - ${endDateTime.getDate()}.${endDateTime.getMonth()}.${endDateTime.getFullYear()}`;
        }

        // Function to create graph data for total or by product
        function GraphMakerTotal(label: string, calculateData: Function, product?: Product) {
            let data = [];
            // Add data points based on the time range and calculation function
            for (let lowerboundTimestamp = new Date(startDateTime); lowerboundTimestamp < endDateTime; lowerboundTimestamp = UpperboundTimestamp(lowerboundTimestamp)) {
                // Calculate upperbound timestamp using the helper function
                const upperboundTimestamp = UpperboundTimestamp(lowerboundTimestamp);
                // The data point x-value is the lowerbound timestamp, fx. data between 12:00 and 12:59 will have x-value 12:00
                labels.push(new Date(lowerboundTimestamp));
                // If a product is provided, that means we are calculating by product, otherwise total
                if (product) {
                    data.push(calculateData(FilterSalesByProduct(lowerboundTimestamp, upperboundTimestamp, product)));
                } else {
                    data.push(calculateData(FilterSalesTotal(lowerboundTimestamp, upperboundTimestamp)));
                }
            }
            return {
                label: label, 
                data: data, 
                borderColor: colorPalette[datasets.length % colorPalette.length],
                backgroundColor: colorPalette[datasets.length % colorPalette.length] + "33", // 20% opacity
                borderWidth: 2
            };
        }

        // Function to create graphs by product
        // Loops through all products and creates a dataset for each product
        function GraphMakerByProduct(calculateData: Function) {
            // Loop through all products and create a dataset for each product
            for (const product of products) {
                const label = `${product.brand} ${product.name}`
                datasets.push(GraphMakerTotal(label, calculateData, product));
            }
        }

        // Switch case to determine which graph to create based on graphSelector
        switch (graphSelector) {
            case graphOptions[0].value: //total_revenue
            {
                const label = "Omsætning";
                datasets.push(GraphMakerTotal(label, RevenueCalc));
                setChartHeading(ChartHeadingMaker("Total omsætning"));
                break;
            }
        
            case graphOptions[1].value: //revenue_by_product
            {
                GraphMakerByProduct(RevenueCalc);
                setChartHeading(ChartHeadingMaker("Omsætning pr. produkt"));
                break;
            }
                
            case graphOptions[2].value: //profit
            {
                const label = "Profit";
                datasets.push(GraphMakerTotal(label, ProfitCalc));
                setChartHeading(ChartHeadingMaker("Total profit"));
                break;
            }

            case graphOptions[3].value: //profit_by_product
            {
                GraphMakerByProduct(ProfitCalc);
                setChartHeading(ChartHeadingMaker("Profit pr. produkt"));
                break;
            }

            case graphOptions[4].value: //sales_count
            {
                const label = "Produkter solgt";
                datasets.push(GraphMakerTotal(label, SalesCalc));
                setChartHeading(ChartHeadingMaker("Total antal produkter solgt"));
                break;
            }

            case graphOptions[5].value: //sales_count_by_product
            {
                GraphMakerByProduct(SalesCalc);
                setChartHeading(ChartHeadingMaker("Salg antal pr. produkt"));
                break;
            }

            case graphOptions[6].value: //prize
            {
                const label = "Præmier givet ud";
                datasets.push(GraphMakerTotal(label, PrizesCalc));
                setChartHeading(ChartHeadingMaker("Total præmier givet ud"));
                break;
            }

            case graphOptions[7].value: //losses
            {
                const label = "Tab af varer";
                datasets.push(GraphMakerTotal(label, LossesCalc));
                setChartHeading("Total tab");
                break;
            }

            case graphOptions[8].value: //losses_by_product
            {
                GraphMakerByProduct(LossesCalc);
                setChartHeading(ChartHeadingMaker("Tab af varer pr. produkt"));
                break;
            }

            default:
                setGraphSelector('total_revenue');
                break;
        }
        
        setChartData({ labels: labels, datasets: datasets });

    }, [toggleMode, graphSelector, saleStatistics, lanDates, products]);

    // Update the modalContent to false whenever the modal is closed
    useEffect(() => {
        if (modalVisible === false) {
            setModalContent(false);
        }
    }, [modalVisible]);

    // Filter sales statistics to only include the last LAN
    function FilterToOneLAN(): SaleStatistics[] {
        // Fetch the latest lan date
        const lanDatesAmount = lanDates.length;
        if (lanDatesAmount < 1) { return [] }
        const lastLanDate = lanDates[lanDatesAmount-1];
        if (!lastLanDate.startDate || !lastLanDate.endDate) { return [] }
        return saleStatistics.filter(sale => sale.datetime < lastLanDate.endDate && sale.datetime > lastLanDate.startDate);
    }

    // Filter sale statistics to only include sales the last 12 months
    function FilterToOneYear(): SaleStatistics[] {
        // Calculate date 12 months ago to be able to filter by date
        let twelveMonthsAgoDate = new Date();
        twelveMonthsAgoDate.setMonth(twelveMonthsAgoDate.getMonth() - 12);
        return saleStatistics.filter(sale => sale.datetime > twelveMonthsAgoDate);
    }

    // Calculate total sales from a list of sales statistics
    function SalesAccumulated(statistics: Array<SaleStatistics>): string {
        return statistics.reduce((sum, item) => sum + item.total_sale_price, 0).toFixed(2);
    }

    // Calculate total profit from a list of sales statistics
    function ProfitAccumulated(statistics: Array<SaleStatistics>): string {
        return statistics.reduce((sum, item) => sum + item.total_sale_price - (item.soldProduct.product.bought_price * item.soldProduct.quantity), 0).toFixed(2);
    }

    // Calculate total stock value (based on bought price and current stock)
    function StockValueAccumulated(): string {
        const total = products.reduce((sum, product) => sum + (product.bought_price * product.stock), 0);
        return total.toFixed(2);
    }

    // Show recent sales list
    function ShowSales() {
        let transactionIds: Array<number> = [];
        // Get all transaction IDs from sale statistics
        saleStatistics.forEach((sale) => transactionIds.push(sale.transaction_id));
        // Remove duplicate transaction IDs
        transactionIds = Array.from(new Set(transactionIds));
        // Sort transaction IDs descending and limit to 10
        transactionIds.sort((a, b) => b - a);
        const limitedSaleIds = transactionIds.slice(0, 10);

        // Return JSX elements for each of the 10 transaction IDs
        return (
            <>
                {limitedSaleIds.map((transactionId, index) => {
                    const filteredSales: SaleStatistics[] = saleStatistics.filter((sale) => sale.transaction_id === transactionId);
                    return <li className="sale-list-item" onClick={() => OpenSale(transactionId)} key={index}>
                        <span className="datetime">{filteredSales[0].datetime.getDate()}.{filteredSales[0].datetime.getMonth()}.{filteredSales[0].datetime.getFullYear()} {filteredSales[0].datetime.getHours()}.{filteredSales[0].datetime.getMinutes()}</span>
                        <span className="quantity">Antal: {filteredSales.reduce((sum, sale) => sum + sale.soldProduct.quantity, 0)}</span>
                        <span className="price">Total pris: {filteredSales.reduce((sum, sale) => sum + sale.total_sale_price, 0)}</span>
                    </li>
                })}
            </>
        );
    }

    // Open sale modal with details for a specific transaction ID
    // Shows a table with all sold products in that transaction
    function OpenSale(id: number) {
        setModalTitle("Visning af salg");
        setModalContent(
            <>
                <table className="sale-table">
                    <thead>
                        <tr>
                        <th>Billede</th>
                        <th>Produkt</th>
                        <th>Antal</th>
                        <th>Enhedspris</th>
                        <th>Total</th>
                        <th>Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {saleStatistics
                        .filter((sale) => sale.transaction_id === id)
                        .map((sale) => (
                            <tr key={sale.id}>
                            <td>
                                <img src={sale.soldProduct.product.image} alt="" className="sale-table-img" />
                            </td>
                            <td>
                                <b>{sale.soldProduct.product.brand}</b> <br />
                                {sale.soldProduct.product.name}
                            </td>
                            <td>{sale.soldProduct.quantity}</td>
                            <td>{sale.soldProduct.price} kr</td>
                            <td>{sale.total_sale_price} kr</td>
                            <td>
                                {sale.soldProduct.is_prize && <span className="tag prize">Prize</span>}
                                {sale.soldProduct.is_happy_hour_purchase && <span className="tag happy">Happy Hour</span>}
                                {sale.soldProduct.loss && <span className="tag loss">Loss</span>}
                            </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>

            </>
        );
        setModalVisible(true);
    }

    return (
        <div className="statistics-page">
            <div className="statistics-grid">

                {/* LEFT COLUMN */}
                <div className="left-col">
                    <h1>Statistik</h1>

                    <div className="toggle-and-selector">
                        <div className="radio-toggles">
                            <input type="radio" id="option-1" name="radio-options" checked={toggleMode === 'lastLan'} onChange={() => setToggleMode('lastLan')} />
                            <label htmlFor="option-1">Sidste lan</label>

                            <input type="radio" id="option-2" name="radio-options" checked={toggleMode === 'year'} onChange={() => setToggleMode('year')} />
                            <label htmlFor="option-2">Sidste tolv måneder</label>

                            <div className="slide-item"></div>
                        </div>

                        <select id="graphSelector" value={graphSelector} onChange={e => setGraphSelector(e.target.value)}>
                            {graphOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div id="graph">
                        <Line data={chartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            },
                            x: {
                                type: 'time',
                                time: {
                                    unit: chartUnit    // choose 'day' | 'hour' | 'month' etc. to suit your data
                                },
                                ticks: {
                                    maxRotation: 60,
                                    minRotation: 30
                                },
                            },
                        },
                        plugins: {
                            legend: { display: false },
                            title: {
                                display: true,
                                text: chartHeading,
                            },
                        },
                        layout: {
                            padding: {
                                top: 20,
                                bottom: 20
                            }
                        },
                    }} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="right-col">
                    <div className="export-statistics-div">
                        <button id="export-statistics" onClick={() => {
                            setModalTitle("Exporter statistik data");
                            setModalContent(false);
                            setModalVisible(true);
                            setModalContent(
                                <ExportStatistics
                                    products={products}
                                    lanDates={lanDates}
                                    saleStatistics={saleStatistics}
                                />
                            );
                        }}>Eksporter data</button>
                    </div>

                    <div className="key-figures-div">
                        <div className="key-figures-revenue">
                            <h3>Omsætning</h3>
                            <span>Det seneste LAN: {SalesAccumulated(salesLastLan)}</span><br/>
                            <span>De seneste tolv måneder: {SalesAccumulated(salesLastTwelveMonths)}</span>
                        </div>
                        <div className="key-figures-profit">
                            <h3>Profit</h3>
                            <span>Det seneste LAN: {ProfitAccumulated(salesLastLan)}</span><br/>
                            <span>De seneste tolv måneder: {ProfitAccumulated(salesLastTwelveMonths)}</span>
                        </div>
                        <div className="key-figures-storage">
                            <h3>Værdi af lagerbeholdning</h3>
                            <span>{StockValueAccumulated()}</span>
                        </div>
                    </div>

                    <div className="sales-list-div">
                        <h2>Seneste salg</h2>
                        <ul className="sale-list">
                            {ShowSales()}
                        </ul>
                    </div>
                </div>

            </div>

            {modalVisible && modalContent && modalTitle && (
                <Modal setModalVisible={setModalVisible} modal_content={modalContent} title={modalTitle} />
            )}
        </div>
    );
}

export default Statistics;