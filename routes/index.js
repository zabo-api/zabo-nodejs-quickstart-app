const express = require('express');
const router = express.Router();

const zabo = require('zabo-sdk-js')

let MyUser = {}

zabo.init({
  apiKey: process.env.API_KEY,
  secretKey: process.env.SECRET_KEY,
  env: 'sandbox'
})

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Zabo Node.js Quickstart App',
    clientId: process.env.CLIENT_ID
  });
})


router.post('/accounts', (req, res) => {
  if (!MyUser.accounts) {
    let account = req.body
    zabo.users.create(account).then(function (user) {
      MyUser = user
      console.log(MyUser)
      res.json({ user: MyUser })

    }).catch(function (error) {
      console.log(error)
      if (error.message.includes('already belongs to this user'))
        res.json({ user: MyUser })
      /* See errors section for more information */
    })
  } else {
    let account = req.body
    zabo.users.addAccount(MyUser, account).then(function () {
      MyUser.accounts.push(account)
      res.json({ user: MyUser })
    }).catch(function (error) {
      console.log(error)
      /* See errors section for more information */
      if (error.message.includes('already belongs to this user'))
        res.json({ user: MyUser })
    })
  }
})

router.get('/transactions/:account_id', (req, res) => {
  if (MyUser.accounts) {
    zabo.transactions.getList({
      userId: MyUser.id,
      accountId: req.params.account_id
    }).then(function (transactions) {
      res.json(transactions)
    }).catch(function (error) {
      console.log(error)
    })
  }
})

router.post('/transactions', (req, res) => {
  myClientsTransactionRequest = req.body
  console.log(myClientsTransactionRequest)
  if (MyUser.accounts) {
    zabo.transactions.send({
      userId: MyUser.id,
      accountId: myClientsTransactionRequest.accountId,
      currency: myClientsTransactionRequest.currency,
      toAddress: myClientsTransactionRequest.toAddress,
      amount: myClientsTransactionRequest.amount
    }).then(function (transaction) {
      res.json(transaction)
    }).catch(function (error) {
      console.log(error)
    })
  }
})

module.exports = router;
