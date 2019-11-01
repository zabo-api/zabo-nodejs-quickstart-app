class Utils {
  show (selector) {
    let elem = document.querySelector(selector)

    if (elem) {
      elem.hidden = false
    }
  }

  hide (selector) {
    let elem = document.querySelector(selector)

    if (elem) {
      elem.hidden = true
    }
  }

  get (url) {
    return window.fetch(url)
      .then(resp => resp.json())
  }

  post (url, data) {
    return window.fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(resp => resp.json())
  }

  getExplorerUrl (currency, path) {
    switch (currency) {
      case 'HBAR':
        return ''
      case 'BTC':
        return 'https://www.blockchain.com/btctest/' + path
      case 'BCH':
        return 'https://explorer.bitcoin.com/tbch/' + path
      default:
        return 'https://rinkeby.etherscan.io/' + path
    }
  }
}

window.Utils = new Utils()
