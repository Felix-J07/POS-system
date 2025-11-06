// Function to get the current price of a product, considering happy hour discounts
export function GetPriceAndHappyHour(product: Product): [number, boolean] {
  // Check if the current time falls within any happy hour periods
  const is_happy_hour = product.happy_hour_timestamps.some((timestamp) => timestamp.endTime.getTime() >= Date.now() && timestamp.startTime.getTime() <= Date.now());
  // Return the happy hour price if applicable, otherwise return the regular price
  if (is_happy_hour) {
    return [product.happy_hour_price, is_happy_hour];
  }
  return [product.price, is_happy_hour];
}

// Takes already existing dates from the selected product and converts them to a format to output to the datetime-local input field
// Converts to the format 'YYYY-MM-DDTHH:mm'
//export function formatDateTime(date: string | number | Date ): string {
//    const d = new Date(date);
//    const pad = (n: number) => n.toString().padStart(2, '0');
//    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
//}

// Takes a Date object and converts to format for html date input field
// Converts to the format 'YYYY-MM-DD'
//export function formatDate(date: string | number | Date): string {
//  const d = new Date(date);
//  const pad = (n: number) => n.toString().padStart(2, '0');
//  return `${d.getFullYear().toString().padStart(4, '0')}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
//}

export function formatDate(date: string | number | Date, format: 'datetime' | 'date') {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, '0');
  let formattedDate = `${d.getFullYear().toString().padStart(4, '0')}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (format === 'date') {
    return formattedDate;
  } else {
    return (formattedDate + `T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  }
}