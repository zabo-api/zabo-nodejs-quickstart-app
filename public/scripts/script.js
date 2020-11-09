// MAIN
(function (Zabo, Utils, clientId) {
  // Used to persist the connected account
  let accountConnectedDirectlyToClient = {}

  document.onreadystatechange = async () => {
    if (document.readyState !== 'complete') { return }

    // Initiate Zabo SDK
    const zabo = await Zabo.init({
      clientId: clientId,
      env: 'sandbox'
    })

    const connectBtns = document.querySelectorAll('.connect-btn')
    connectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Call the .connect() window
        zabo.connect()
          .onConnection(account => {
            accountConnectedDirectlyToClient = account

            Utils.post('/accounts', account)
              .then(data => {
                ListUserAccounts(data.accounts)
                ListAccountBalances(account.provider, data.balances)
                ListTransactions(data.transactions)

                Utils.show('#after-connect')
              })
          })
          .onError(error =>
            console.error('account connection error:', error)
          )
      })
    })
  }

  // HELPERS
  function ListUserAccounts(accounts = []) {
    let accountHolder = document.querySelector('#accounts')
    accountHolder.innerHTML = ''

    for (let i = 0; i < accounts.length; i++) {
      let row = document.createElement('tr')

      let logo = document.createElement('td')
      let img = document.createElement('img')
      img.src = accounts[i].provider.logo
      img.width = 100
      logo.appendChild(img)
      row.appendChild(logo)

      let wallet = document.createElement('td')
      wallet.innerText = accounts[i].provider.display_name
      row.appendChild(wallet)

      let address = document.createElement('td')
      address.innerText = accounts[i].id
      row.appendChild(address)

      accountHolder.appendChild(row)
    }
  }

  function ListAccountBalances(provider, balances = []) {
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
      cell.colSpan = 2
      row.appendChild(cell)

      let updatedAt = document.createElement('td')
      updatedAt.innerText = new Date().toLocaleString()
      row.appendChild(updatedAt)

      balanceHolder.appendChild(row)
    }
  }

  function ListTransactions(transactions = []) {
    let transactionHolder = document.querySelector('#transactions')

    if (transactions.length) {
      for (let i = 0; i < transactions.length; i++) {
        let row = document.createElement('tr')

        let id = document.createElement('td')
        id.innerText = (transactions[i].id || '').substr(0, 7) + '...'
        row.appendChild(id)

        let type = document.createElement('td')
        type.innerText = (transactions[i].type || '').toUpperCase()
        row.appendChild(type)

        let parts = document.createElement('td')
        let partsList = document.createElement('ul')
        if (transactions[i].parts) {
          for (let j = 0; j < transactions[i].parts.length; j++) {
            let part = transactions[i].parts[j]
            let line = document.createElement('li')
            line.innerText = part.direction + ' ' + part.amount + ' ' + part.currency
            partsList.appendChild(line)
          }
        }
        parts.appendChild(partsList)
        row.appendChild(parts)

        let status = document.createElement('td')
        status.innerText = (transactions[i].status || '').toUpperCase()
        row.appendChild(status)

        let date = document.createElement('td')
        let timestamp = transactions[i].confirmed_at || transactions[i].initiated_at || 0
        date.innerText = new Date(timestamp).toLocaleString()
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
})(window.Zabo, window.Utils, window.ZABO_CLIENT_ID)
