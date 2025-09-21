export function GetPriceAndHappyHour(product: Product): [number, boolean] {
  const is_happy_hour = product.happy_hour_timestamps.some((timestamp) => timestamp.endTime.getTime() >= Date.now() && timestamp.startTime.getTime() <= Date.now());
  if (is_happy_hour) {
    return [product.happy_hour_price, is_happy_hour];
  }
  return [product.price, is_happy_hour];
}