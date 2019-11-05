const express = require('express')
const router = express.Router()

// Import Zabo SDK
const zabo = require('zabo-sdk-js')

// Initializing the JS SDK
// Docs: https://zabo.com/docs/#initializing-the-js-sdks
zabo.init({
  apiKey: process.env.PUBLIC_API_KEY,
  secretKey: process.env.SECRET_API_KEY,
  env: 'sandbox'
})

let myUser = null

router.post('/accounts', async (req, res) => {
  const account = req.body

  try {
    if (!myUser) {
      // Create a User
      // Docs: https://zabo.com/docs/#create-a-user
      myUser = await zabo.users.create(account)
    } else {
      // Add Account
      // Docs: https://zabo.com/docs/#add-account-to-existing-user
      try {
        await zabo.users.addAccount(myUser, account)
        myUser.accounts.push(account)
      } catch (e) {
        if (!e.message.includes("already belongs")) {
          console.error(e)
        }
        // Else do nothing because the account already belongs to the user.
      }
    }

    // Get Transactions
    // Docs: https://zabo.com/docs/#get-transaction-history
    const transactions = await zabo.transactions.getList({
      userId: myUser.id,
      accountId: account.id
    })

    // Get Balances
    // Docs: https://zabo.com/docs/#get-a-specific-balance
    const balances = await zabo.users.getBalances({
      userId: myUser.id,
      accountId: account.id,
      currencies: ['ALL']
    })

    res.send({
      accounts: myUser.accounts,
      balances: balances.data,
      transactions: transactions.data
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

router.post('/transactions', async (req, res) => {
  const requestBody = req.body

  let transaction
  try {
    // Send a Transaction
    // Docs: https://zabo.com/docs/#send-a-transaction
    transaction = await zabo.transactions.send({
      userId: myUser.id,
      accountId: requestBody.accountId,
      currency: requestBody.currency,
      toAddress: requestBody.toAddress,
      amount: requestBody.amount
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }

  res.send(transaction)
})

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Zabo Node.js Quickstart App',
    clientId: process.env.CLIENT_ID
  })
})

module.exports = router
