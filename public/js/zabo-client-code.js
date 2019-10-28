// Used to persist the connected account
let accountConnectedDirectlyToClient = {}

document.onreadystatechange = () => {
  if (document.readyState !== 'complete') { return }

  // Initiate Zabo SDK
  Zabo.init({
    clientId: process.env.CLIENT_ID,
    env: 'sandbox'
  })

  // Bind "connect" button
  document.querySelector('#connect').addEventListener('click', () => {
    // Call the .connect() window
    Zabo.connect().onConnection((account) => {
      ListAccountBalances(account)
      accountConnectedDirectlyToClient = account

      document.querySelector('#after-connect').style.display = 'block'
      PostDataToServer('/accounts', account)

    }).onError(error => {
      console.error('account connection error:', error)
    })
  })

  document.querySelector('#get-account-transactions').addEventListener('click', () => {
    GetDataFromServer(`/transactions/${accountConnectedDirectlyToClient.id}`)
  })

  document.querySelector('#add-account').addEventListener('click', () => {
    Zabo.connect().onConnection(async (account) => {
      ListAccountBalances(account)
      accountConnectedDirectlyToClient = account

      PostDataToServer('/accounts', account)
    }).onError(error => {
      console.error('account connection error:', error)
    })
  })

  let formHolder = document.querySelector('#crypto-form-holder')
  document.querySelector('#send-crypto').addEventListener('click', () => {
    formHolder.style.display = 'block'
    let form = formHolder.querySelector('form')
    form.addEventListener('submit', ev => {
      let data = new FormData(form)
      let myServerRequestBody = {}
      for (entry of data) {
        myServerRequestBody[entry[0]] = entry[1]
      }
      myServerRequestBody['accountId'] = accountConnectedDirectlyToClient.id
      PostDataToServer('/transactions', myServerRequestBody)
      ev.preventDefault()
    })
  })
}

function PostDataToServer(route, data) {
  const xhr = new XMLHttpRequest();
  const url = 'http://localhost:3000' + route;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let data = JSON.parse(xhr.responseText);
      if (data.user) {
        ListUserAccounts(data.user.accounts);
      } else {
        DisplayTransactionSuccess(data)
      }
    }
  };
  var data = JSON.stringify(data);
  xhr.send(data);
}

function GetDataFromServer(route) {
  const xhr = new XMLHttpRequest();
  const url = 'http://localhost:3000' + route;
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let data = JSON.parse(xhr.responseText);
      if (data.user) {
        ListUserAccounts(data.user.accounts);
      } else {
        ListTransactions(data.data)
      }
    }
  };
  xhr.send();
}

function ListAccountBalances(account) {
  let currencies = account.currencies
  let balanceHolderChild
  if (currencies) {
    let ul = document.createElement('ul')
    for (let i = 0; i < currencies.length; i++) {
      let li = document.createElement('li')
      let text = document.createTextNode('Currency: ' + currencies[i].currency + ' Balance: ' + currencies[i].balance)
      li.appendChild(text)
      ul.appendChild(li)
      balanceHolderChild = ul
    }
  } else {
    let p = document.createElement('p')
    let text = document.createTextNode(`No balances to display for ${account.wallet_provider.display_name}`)
    p.appendChild(text)
    balanceHolderChild = p
  }

  let balanceHolder = document.querySelector('#balances')
  balanceHolder.appendChild(balanceHolderChild)
  balanceHolder.style.display = 'block'
}

function ListUserAccounts(accounts) {
  let accountsHolder = document.querySelector('#list-account-providers')

  for (let i = 0; i < accounts.length; i++) {
    let account = accounts[i];
    let img = document.createElement('img')
    img.src = account.wallet_provider.logo
    let p = document.createElement('p')
    let text = document.createTextNode(`Address: ${account.address}`)
    p.appendChild(text)
    accountsHolder.appendChild(img)
    accountsHolder.appendChild(p)
  }
}

function ListTransactions(transactions) {
  let transactionsHolder = document.querySelector('#transactions')
  for (let i = 0; i < transactions.length; i++) {
    let transaction = transactions[i];
    let p = document.createElement('p')
    let text = document.createTextNode(`Hash: ${transaction.id} Currency: ${transaction.currency} Type: ${transaction.type} Amount: ${transaction.amount}`)
    p.appendChild(text)
    transactionsHolder.appendChild(p)
  }
  transactionsHolder.style.display = 'block'
}

function DisplayTransactionSuccess(transaction) {
  let sentCryptoHolder = document.querySelector('#sent-crypto')
  let text = document.createTextNode(`Use a block explorer to see your testnet transaction: ${transaction.id}`)

  p.appendChild(text)
  sentCryptoHolder.appendChild(p)

  sentCryptoHolder.style.display = 'block'
}