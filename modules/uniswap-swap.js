// ENV VARIABLES
require("dotenv").config();
const helperFunctions = require("./helper-functions");

// INSTANTIATE CHAIN WEBSOCKET
// change the .KOVAN() to whatever websocket you are using.
// Make sure to add you API-KEYS to /JSON/chainsockets.json and change your function names 
// in /modules/instantiate-chains.js to your liking
const kovan = require("./instantiate-chains").KOVAN(); 

// INSTANTIATE NEEDED JSON FILES
const uniswapContracts = require("../JSON/uniswapContracts.json");
const uniswapAbis = require("../JSON/uniswapAbis.json");
const tokenAddresses = require("../JSON/kovanTokens.json");

// INSTANTIATE WALLET / WALLETS
const wallet = kovan.eth.accounts.privateKeyToAccount(process.env.PRIVATEKEY);
kovan.eth.accounts.wallet.add(wallet);

async function swapExactTKNForETH(network, fromTokenAddress, amountIn) {
    let swapContract = await new network.eth.Contract(
        uniswapAbis.swapExactTokensForETH,
        uniswapContracts.router
    );

    // CREATE TRANSACTION PARAMETERS
    const amountInAsWei = network.utils.toWei(`${amountIn}`);
    const amountOutMinAsWei = network.utils.toWei("0");
    const path = [fromTokenAddress, tokenAddresses.WETH];
    const to = wallet.address;
    const deadline = Date.now() + 60000;

    await swapContract.methods
        .swapExactTokensForETH(amountInAsWei, amountOutMinAsWei, path, to, deadline)
        .send(
            {
                from: wallet.address,
                gas: 4 * await helperFunctions.estimateGas(network, wallet.address),
            },
            (error, txHash) => {
                if (!error) {
                    helperFunctions.waitForTxConfirmation(network, txHash);
                } else {
                    console.log("Swap Tokens for ETH Transaction failed.\n", error);
                }
            }
        );
    return;
}

async function swapExactTKNForTKN(network, fromTokenAddress, toTokenAddress, amountIn) {

    const swapContract = await new network.eth.Contract(uniswapAbis.swapExactTokensForTokens, uniswapContracts.router);

    const amountInAsWei = network.utils.toWei(`${amountIn}`);
    const amountOutMinAsWei = network.utils.toWei("0");
    const path = [fromTokenAddress, toTokenAddress];
    const to = wallet.address;
    const deadline = Date.now() + 60000;

    await swapContract.methods
        .swapExactTokensForTokens(amountInAsWei, amountOutMinAsWei, path, to, deadline)
        .send({
            from: wallet.address,
            gas: 4 * await helperFunctions.estimateGas(network, wallet.address)
        }, (error, txHash) => {
            if (!error) {
                helperFunctions.waitForTxConfirmation(network, txHash);
            } else {
                console.log("Swap Tokens for other Tokens Transaction failed.\n", error);
            }
    })
}

async function start() {
    // call your functions here with await functionName(parameter1, ... , parameterN)
}

start()
