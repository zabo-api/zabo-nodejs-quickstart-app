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
  }

  // HELPERS
  function ListUserAccounts(accounts = []) {
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
        updatedAt.innerText = new Date(balances[i].updated_at * 1000).toLocaleString()
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

        let idAnchor = document.createElement('a')
        idAnchor.href = Utils.getExplorerUrl(transactions[i].currency, 'tx/' + transactions[i].id)
        idAnchor.target = '_blank'
        idAnchor.innerText = (transactions[i].id || '').substr(0, 7) + '...'
        let id = document.createElement('td')
        id.appendChild(idAnchor)
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

        let otherParties = document.createElement('td')
        for (let j = 0; j < transactions[i].other_parties.length; j++) {
          let addressAnchor = document.createElement('a')
          addressAnchor.href = Utils.getExplorerUrl(transactions[i].currency, 'address/' + transactions[i].other_parties[j])
          addressAnchor.target = '_blank'
          addressAnchor.innerText = (transactions[i].other_parties[j] || '').substr(0, 5) + '...'
          otherParties.appendChild(addressAnchor)
        }
        row.appendChild(otherParties)

        let status = document.createElement('td')
        status.innerText = (transactions[i].status || '').toUpperCase()
        row.appendChild(status)

        let date = document.createElement('td')
        let timestamp = transactions[i].confirmed_at || transactions[i].initiated_at || 0
        date.innerText = new Date(timestamp * 1000).toLocaleString()
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
