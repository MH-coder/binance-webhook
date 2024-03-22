import { client } from './binance-connector.service';

export async function getLotSizeConstraints(symbol: string) {
  const response = await client.exchangeInformation();
  if (response && response.symbols) {
    const symbolInfo = response.symbols.find((s: any) => s.symbol === symbol);
    if (symbolInfo && symbolInfo.filters) {
      return symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');
    }
  }
  return null;
}

export function adjustQuantityToLotSize(quantity: number, lotSizeFilter: any) {
  const minQty = parseFloat(lotSizeFilter.minQty);
  const stepSize = parseFloat(lotSizeFilter.stepSize);

  const adjustedQuantity = minQty + Math.floor((quantity - minQty) / stepSize) * stepSize;
  return adjustedQuantity;
}
