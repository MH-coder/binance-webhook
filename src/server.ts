import dotenv from 'dotenv';
import path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { CustomRequest } from './interface';
import { apiResponse } from './utils/apiResponse';
import middlewareRoot, { restrictAccess, authenticateJWT } from './middlewares';
import { client } from './services/binance-connector.service';
import { NewOrderRespType, OrderType } from '@binance/connector-typescript';
import { adjustQuantityToLotSize, getLotSizeConstraints } from './services/binance-order.service';

const app = express();
const port = process.env.PORT;
const secretKey = process.env.SECRET_KEY as string;

app.use(bodyParser.json());
app.use(cors());
app.use(middlewareRoot);

app.get('/api/v1', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Endpoint to generate JWT token by checking publicKey and passphrase
app.post('/api/v1/login', (req: Request, res: Response) => {
  const { public_key, pass_phrase } = req.body;

  // FROM ENV
  const publicKey = process.env.PUBLIC_KEY as string;
  const passPhrase = process.env.PASS_PHRASE as string;

  if (public_key === publicKey && pass_phrase === passPhrase) {
    const token = jwt.sign({ public_key }, secretKey, { expiresIn: '30d' });
    return apiResponse({
      res,
      message: 'Logged In.',
      data: {
        accessToken: token,
      },
    });
  } else {
    return apiResponse({
      res,
      message: 'Invalid Credentials.',
      code: 400,
    });
  }
});

// TradingView alert webhook endpoint
// app.post('/api/v1/tradingview/webhook', restrictAccess, authenticateJWT, async (req: CustomRequest, res: Response) => {
//   // Handle the TradingView alert webhook here
//   const { ticker, strategy } = req.body;
//   const { order_action, order_price } = strategy;

//   const base_currency = ticker.replace(/USDT/g, '');

//   const asset = order_action === 'buy' ? 'USDT' : base_currency;

//   const resp = await client.userAsset({
//     asset,
//   });

//   if (!resp.length || Number(parseFloat(resp[0]?.free).toFixed(5)) === 0) {
//     return apiResponse({
//       res,
//       code: 400,
//       success: false,
//       message: 'Invalid Asset / Asset Balance is zero or below accepted threshhold.',
//     });
//   }

//   const asset_balance = parseFloat(resp[0].free);

//   const symbeol_current_market_price: any = await client.symbolPriceTicker({ symbol: ticker });

//   const multiplier = Math.pow(10, 5);
//   const quantity: number =
//     order_action === 'buy'
//       ? Math.trunc(((asset_balance - 1) / symbeol_current_market_price.price) * multiplier) / multiplier
//       : Math.trunc(asset_balance * multiplier) / multiplier;

//   // Add your logic to take actions based on the alert
//   let orderResponse = null;

//   if (order_action === 'buy' && asset_balance < 1) {
//     return apiResponse({
//       res,
//       code: 400,
//       message: `Can't ${order_action} '${base_currency}', Insuficient Funds.`,
//     });
//   }

//   try {
//     orderResponse = await client.newOrder(ticker, order_action.toUpperCase(), OrderType.MARKET, {
//       newOrderRespType: NewOrderRespType.RESULT,
//       quantity: Math.abs(quantity),
//     });
//   } catch (error) {
//     return apiResponse({ res, code: 400, errors: error });
//   }

//   apiResponse({
//     res,
//     message: 'Webhook received and processed successfully',
//     data: orderResponse,
//   });
// });

app.post('/api/v1/tradingview/webhook', restrictAccess, authenticateJWT, async (req: CustomRequest, res: Response) => {
  // Handle the TradingView alert webhook here
  const { ticker, strategy } = req.body;
  const { order_action, order_price } = strategy;

  const base_currency = ticker.replace(/USDT/g, '');

  const asset = order_action === 'buy' ? 'USDT' : base_currency;

  const resp = await client.userAsset({
    asset,
  });

  if (!resp.length || Number(parseFloat(resp[0]?.free).toFixed(5)) === 0) {
    return apiResponse({
      res,
      code: 400,
      success: false,
      message: `Invalid Asset (${asset}) / Asset Balance (${asset}) is zero or below accepted threshold.`,
    });
  }

  const asset_balance = parseFloat(resp[0].free);

  const symbol_current_market_price: any = await client.symbolPriceTicker({ symbol: ticker });

  const lotSizeFilter: any = await getLotSizeConstraints(ticker); // Fetch lot size constraints

  if (!lotSizeFilter) {
    return apiResponse({
      res,
      code: 400,
      success: false,
      message: 'Failed to fetch lot size constraints for the trading pair.',
    });
  }

  // Adjust the quantity to meet lot size constraints
  const multiplier = Math.pow(10, 5);

  let quantity = asset_balance / symbol_current_market_price.price;
  quantity =
    order_action === 'buy'
      ? Math.trunc(adjustQuantityToLotSize(quantity, lotSizeFilter) * multiplier) / multiplier
      : Math.trunc(adjustQuantityToLotSize(asset_balance, lotSizeFilter) * multiplier) / multiplier;

  console.log({ quantity });

  // Add your logic to take actions based on the alert
  let orderResponse = null;

  if (order_action === 'buy' && asset_balance < 1) {
    return apiResponse({
      res,
      code: 400,
      message: `Can't ${order_action} '${base_currency}', Insufficient Funds.`,
    });
  }

  try {
    orderResponse = await client.newOrder(ticker, order_action.toUpperCase(), OrderType.MARKET, {
      newOrderRespType: NewOrderRespType.RESULT,
      quantity: Math.abs(quantity),
    });
  } catch (error) {
    return apiResponse({ res, code: 400, errors: error });
  }

  apiResponse({
    res,
    message: 'Webhook received and processed successfully',
    data: orderResponse,
  });
});

// websocketStreamClient.ticker('btcusdt');

app.listen(port, () => {
  console.log(`\nServer is running at http://localhost:${port} 🚀`);
});
