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