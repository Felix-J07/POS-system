// Function to get the current price of a product, considering happy hour discounts
export function GetPriceAndHappyHour(product: Product): [number, boolean] {
    // Check if the current time falls within any happy hour periods
    const is_happy_hour = product.happy_hour_timestamps.some(
        (timestamp) =>
            timestamp.endTime.getTime() >= Date.now() &&
            timestamp.startTime.getTime() <= Date.now()
    );
    // Return the happy hour price if applicable, otherwise return the regular price
    if (is_happy_hour) {
        return [product.happy_hour_price, is_happy_hour];
    }
    return [product.price, is_happy_hour];
}

export function formatDate(date: string | number | Date, format: "datetime" | "date") {
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, "0");
    let formattedDate = `${d.getFullYear().toString().padStart(4, "0")}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (format === "date") {
        return formattedDate;
    } else {
        return formattedDate + `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
}

// Returns 1 if the number is a true value else returns 0
export function BoolToNumber(value: boolean): number {
    if (value) { return 1; }
    else { return 0; }
}

export function PrintDate(date: Date | undefined): string {
    if (!date) {
        return "N/A";
    }
    return `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
}