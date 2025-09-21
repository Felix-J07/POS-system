import { useEffect, useState } from "react";
import { GetSales } from "./database";

function Statistics() {
    const [saleStatistics, setSaleStatistics] = useState<SaleStatistics[]>([]);

    useEffect(() => {
        GetSales(setSaleStatistics);
    }, [])

    return (
        <div>
            Statistics Page
        </div>
    );
}

export default Statistics;