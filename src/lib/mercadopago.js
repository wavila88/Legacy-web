import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const paymentClient = new Payment(client);

export const PRICE_BRL = parseFloat(process.env.SCHEDULE_PRICE_BRL ?? '9.90');
