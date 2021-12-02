# Web3jsPublic

I made this project simply to learn and understand about the basics of the crypto ecosystem like web3js and interacting with smartcontracts on the ethereum blockchain.

You can use this project as you like by cloning the repository and installing the given dependencies via the `npm package manager` using the following command in the directory where you can find the `package-lock.json` and the `package.json`.

```bash
npm install
```

# Important steps to make this project work

1. You need to add your personal `private key` in the /modules/.env file like the following
`PRIVATKEY = YOUR_PRIVATE_KEY`

Always take precautions about where you store your privatekey. I wouldn't recommend using the privatekey to your personal main wallet but rather use the already existing script `/modules/create-new-wallet.js` to generate a completely new wallet where you dont have any money to steal from.
`I AM NOT AT FAULT IF YOU DONT HANDLE YOUR PERSONAL PRIVATEKEY WITH CAUTION AND YOU ENCOUNTER ANY LOSSES.`

2. If you want to use the existing script `modules/uniswap-swap.js` make sure you use it on a `TESTNET` like `MUMBAI OR KOVAN` since I dont yet have a function to implement a slippage. You need to add your websocket API KEY in the `/JSON/chainsockets.json`. You can get one by registering on `https://dashboard.alchemyapi.io/` and creating a new App.

3. You should also find a few comments in most of the .js files which should explain some basics. In case you encounter any problem feel free to comment and I'll try to help as soon as possible.

# That should be everything but in case you encounter any problems let me know, have fun and be careful with your private key! :)
 