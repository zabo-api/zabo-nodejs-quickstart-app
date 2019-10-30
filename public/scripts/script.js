// MAIN
(function (Zabo, Utils, clientId) {
  // Used to persist the connected account
  let accountConnectedDirectlyToClient = {}

  document.onreadystatechange = () => {
    if (document.readyState !== 'complete') { return }

    // Initiate Zabo SDK
    Zabo.init({
      clientId: clientId,
      baseUrl: 'https://dev-api.zabo.com',
      connectUrl: 'https://dev-connect.zabo.com',
      env: 'sandbox'
    })

    const connectBtns = document.querySelectorAll('.connect-btn')
    connectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Call the .connect() window
        Zabo.connect()
          .onConnection(account => {
            accountConnectedDirectlyToClient = account

            Utils.post('/accounts', account)
              .then(data => {
                ListUserAccounts(data.accounts)
                ListAccountBalances(account.wallet_provider, data.balances)
                ListTransactions(data.transactions)

                Utils.show('#after-connect')
              })
          })
          .onError(error =>
            console.error('account connection error:', error)
          )
      })
    })

    const sendForm = document.querySelector('#send-crypto')
    sendForm.addEventListener('submit', ev => {
      ev.preventDefault()
      Utils.hide('#sent')

      Utils.post('/transactions', {
        currency: sendForm.currency.value,
        toAddress: sendForm.toAddress.value,
        amount: sendForm.amount.value,
        accountId: accountConnectedDirectlyToClient.id
      })
        .catch(error => {
          console.error('sent transaction error:', error)
        })
        .then(transaction => {
          DisplayTransactionResult(transaction)
        })
    })
  }

  // HELPERS
  function ListUserAccounts (accounts = []) {
    let accountHolder = document.querySelector('#accounts')
    accountHolder.innerHTML = ''

    for (let i = 0; i < accounts.length; i++) {
      let row = document.createElement('tr')

      let logo = document.createElement('td')
      let img = document.createElement('img')
      img.src = accounts[i].wallet_provider.logo
      img.width = 100
      logo.appendChild(img)
      row.appendChild(logo)

      let wallet = document.createElement('td')
      wallet.innerText = accounts[i].wallet_provider.display_name
      row.appendChild(wallet)

      let address = document.createElement('td')
      address.innerText = accounts[i].address
      row.appendChild(address)

      accountHolder.appendChild(row)
    }
  }

  function ListAccountBalances (provider, balances = []) {
    let balanceHolder = document.querySelector('#balances')

    if (balances.length) {
      for (let i = 0; i < balances.length; i++) {
        let row = document.createElement('tr')

        let wallet = document.createElement('td')
        wallet.innerText = provider.display_name
        row.appendChild(wallet)

        let currency = document.createElement('td')
        currency.innerText = balances[i].currency
        row.appendChild(currency)

        let balance = document.createElement('td')
        balance.innerText = balances[i].balance
        row.appendChild(balance)

        let updatedAt = document.createElement('td')
        updatedAt.innerText = new Date(balances[i].updated_at).toLocaleString()
        row.appendChild(updatedAt)

        balanceHolder.appendChild(row)
      }
    } else {
      let row = document.createElement('tr')

      let wallet = document.createElement('td')
      wallet.innerText = provider.display_name
      row.appendChild(wallet)

      let cell = document.createElement('td')
      cell.innerText = 'No balances'
      cell.colSpan = 3
      row.appendChild(cell)

      balanceHolder.appendChild(row)
    }
  }

  function ListTransactions (transactions = []) {
    let transactionHolder = document.querySelector('#transactions')

    if (transactions.length) {
      for (let i = 0; i < transactions.length; i++) {
        let row = document.createElement('tr')

        let id = document.createElement('td')
        id.title = transactions[i].id
        id.innerText = (transactions[i].id || '').substr(0, 7) + '...'
        row.appendChild(id)

        let currency = document.createElement('td')
        currency.innerText = transactions[i].currency
        row.appendChild(currency)

        let type = document.createElement('td')
        type.innerText = (transactions[i].type || '').toUpperCase()
        row.appendChild(type)

        let amount = document.createElement('td')
        amount.innerText = transactions[i].amount
        row.appendChild(amount)

        let otherParty = document.createElement('td')
        otherParty.title = transactions[i].other_parties[0]
        otherParty.innerText = (transactions[i].other_parties[0] || '').substr(0, 7) + '...'
        row.appendChild(otherParty)

        let status = document.createElement('td')
        status.innerText = (transactions[i].status || '').toUpperCase()
        row.appendChild(status)

        let date = document.createElement('td')
        date.innerText = new Date(transactions[i].confirmed_at).toLocaleString()
        row.appendChild(date)

        transactionHolder.appendChild(row)
      }
    } else {
      let row = document.createElement('tr')

      let cell = document.createElement('td')
      cell.innerText = 'No transactions'
      cell.colSpan = 7
      row.appendChild(cell)

      transactionHolder.appendChild(row)
    }
  }

  function DisplayTransactionResult (transaction) {
    if (transaction.id) {
      let transactionIdHolder = document.querySelector('#transaction-id')
      transactionIdHolder.innerText = transaction.id

      ListTransactions([ transaction ])

      Utils.show('#sent')
    }
  }
})(window.Zabo, window.Utils, window.ZABO_CLIENT_ID)
