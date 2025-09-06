export function GetPrice(product: Product): number {
  if (product.happy_hour_timestamps.some((timestamp) => timestamp.endTime.getTime() >= Date.now() && timestamp.startTime.getTime() <= Date.now())) {
    return product.happy_hour_price;
  }
  return product.price;
}