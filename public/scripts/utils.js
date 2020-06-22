class Utils {
  show(selector) {
    let elem = document.querySelector(selector)

    if (elem) {
      elem.hidden = false
    }
  }

  hide(selector) {
    let elem = document.querySelector(selector)

    if (elem) {
      elem.hidden = true
    }
  }

  get(url) {
    return window.fetch(url)
      .then(resp => resp.json())
  }

  post(url, data) {
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

  getExplorerUrl(currency, path) {
    switch (currency) {
      case 'ETH':
        return 'https://etherscan.io/' + path
      default:
        return '' + path
    }
  }
}

window.Utils = new Utils()
