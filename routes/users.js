var zabo = require('zabo-sdk-js');
var express = require('express');
var router = express.Router();

zabo.init({
  apiKey: process.env.PUBLIC_API_KEY,
  secretKey: process.env.SECRET_API_KEY,
  env: 'sandbox'
})

/* GET users listing. */
router.post('/', async function (req, res, next) {
  var account = req.body;

  // Create user account
  // Docs: https://zabo.com/docs/#create-a-user
  var user = await zabo.users.create(account);

  // Get Balances
  // Docs: https://zabo.com/docs/#get-a-specific-balance
  var balances = await zabo.users.getBalances({
    userId: user.id,
    accountId: account.id,
    tickers: ['ALL']
  });

  // Get ETH transactions
  // Docs: https://zabo.com/docs/#get-transaction-history
  var transactions = await zabo.transactions.getTransactionHistory({
    userId: user.id,
    accountId: account.id,
    currencyTicker: ['ETH']
  });

  // Get Exchange Rates
  // Docs: https://zabo.com/docs/#get-exchange-rates
  var exchangeRates = await zabo.currencies.getExchangeRates();

  res.send({
    balances: balances.data,
    transactions: transactions.data,
    exchangeRates: exchangeRates.data
  });
});

module.exports = router;
