import { useEffect, useState } from "react";
import { GetSales } from "./database";
import './static/Statistics.css';

type StatisticsProps = {
    products: Product[]
}

function Statistics({products}: StatisticsProps) {
    const [saleStatistics, setSaleStatistics] = useState<SaleStatistics[]>([]);

    useEffect(() => {
        GetSales(setSaleStatistics);
    }, [])

    function showGraph(graph_name: string): void {
        document.querySelectorAll('.graph-area > div').forEach(div => {
            (div as HTMLElement).hidden = true;
        });
        const target = document.getElementById(graph_name);
        if (target) target.hidden = false;
    }

    function FilterToThreeLAN() {
        // Test with 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        return saleStatistics.filter(sale => sale.datetime > twelveMonthsAgo);
    }

    function SalesInThreeLAN(): string {
        return SalesAccumulated(FilterToThreeLAN());
    }

    function SalesAccumulated(statistics: Array<SaleStatistics>): string {
        return statistics.reduce((sum, item) => sum + item.total_sale_price, 0).toFixed(2);
    }

    function ProfitInThreeLAN(): string {
        return ProfitAccumulated(FilterToThreeLAN());
    }

    function ProfitAccumulated(statistics: Array<SaleStatistics>): string {
        return statistics.reduce((sum, item) => sum + item.total_sale_price - (item.soldProduct.product.bought_price * item.soldProduct.quantity), 0).toFixed(2);
    }

    function StockValueInThreeLAN(): string {
        return StockValueAccumulated();
    }

    function StockValueAccumulated(): string {
        
        return products.reduce((sum, item) => sum + (item.bought_price * item.stock), 0).toFixed(2);
    }

    return (
        <div className="statistics-page">
            <div className="statistics-cards">
                <div className="sale-card" onClick={() => showGraph("sale-graph")}>
                    <h3>Salg</h3>
                    <label>Sidste 3 lan: {SalesInThreeLAN()} kr</label>
                    <label>I alt: {SalesAccumulated(saleStatistics)} kr</label>
                </div>
                <div className="profit-card" onClick={() => showGraph("profit-graph")}>
                    <h3>Profit</h3>
                    <label>Sidste 3 lan: {ProfitInThreeLAN()} kr</label>
                    <label>I alt: {ProfitAccumulated(saleStatistics)} kr</label>
                </div>
                <div className="stock-value-card" onClick={() => showGraph("stock-value-graph")}>
                    <h3>Produkter på lager værdi</h3>
                    <h6>(baseret på hvad de har kostet, ikke hvad de sælges for)</h6>
                    <label>Sidste 3 lan: {StockValueInThreeLAN()} kr</label>
                    <label>I alt: {StockValueAccumulated()} kr</label>
                </div>
            </div>
            <div className="graph-area">
                <div className="graph" id="sale-graph" hidden>s</div>
                <div className="graph" id="profit-graph" hidden>p</div>
                <div className="graph" id="stock-value-graph" hidden>sv</div>
            </div>
        </div>
    );
}

export default Statistics;