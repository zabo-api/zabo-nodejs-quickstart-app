// HELPERS
function post (url, data) {
  return window.fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(resp => resp.json());
}

function printConnect (data) {
  document.querySelector('#init').innerHTML = `
    <h2>Connected! 🎉</h2>
  `;

  document.querySelector('#connected').innerHTML = `
    <h2>Client SDK response</h2>
    <hr />
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

function printData (data) {
  document.querySelector('#data').innerHTML = `
    <h2>Server SDK responses</h2>
    <hr />
    <h3>Get Balances</h3>
    <pre>${JSON.stringify(data.balances, null, 2)}</pre>
    <h3>Get Transaction History</h3>
    <pre>${JSON.stringify(data.transactions, null, 2)}</pre>
    <h3>Get Currency Price & Information</h3>
    <pre>${JSON.stringify(data.exchangeRates, null, 2)}</pre>
  `;
}

function printError (data) {
  document.querySelector('#error').innerHTML = `
    <h2>Error ⚠️</h2>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

// MAIN
(function (Zabo, clientId) {
  document.onreadystatechange = () => {
    if (document.readyState !== 'complete') { return; }

    // Initiate Zabo SDK
    Zabo.init({
      clientId: clientId,
      env: 'sandbox'
    });

    // Bind "connect" button
    document.querySelector('#connect').addEventListener('click', ev => {
      // Call the .connect() window
      Zabo.connect()
        .onConnection(account => {
          printConnect(account);
          post('/users', account).then(printData);
        })
        .onError(printError);
    });
  };
})(window.Zabo, window.ZABO_CLIENT_ID)
