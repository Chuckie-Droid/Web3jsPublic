const balanceOfERC20ABI = [
    {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
];
const transferERC20ABI = [
    {
        constant: false,
        inputs: [
            { name: "_to", type: "address" },
            { name: "_value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        type: "function",
    },
];
const approveSpendLimitABI = [
    {
        inputs:[
            { internalType : "address", name : "spender", type : "address" },
            { internalType : "uint256", name : "amount" , type : "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType : "bool" , name : "" , type : "bool" }],
        stateMutability: "nonpayable",
        type: "function"
    }
];

async function getGasBalance(network, fromWallet) {
    var balance;
    await network.eth
        .getBalance(fromWallet, async (error, gasBalance) => {
            if (!error) {
                balance = await network.utils.fromWei(gasBalance);
            } else {
                console.log("Error fetching gastoken balance!\n", error)
            }
        })

    return balance;
}

async function getERC20Balance(network, fromWallet, tokenAddress) {
    var balance;
    const balanceOfContract = await new network.eth.Contract(
        balanceOfERC20ABI,
        tokenAddress
    );
    await balanceOfContract.methods
        .balanceOf(fromWallet)
        .call()
        .catch((error) => {
            console.log("Error fetching erc20token balance!\n", error);
        })
        .then((erc20Balance) => {
            balance = network.utils.fromWei(erc20Balance);
        })

    return balance;
}

async function displayAllBalances(network, fromWallet, tokenList) {

    // LOG ERC20 TOKEN BALANCES
    console.log("GAS", await getGasBalance(network, fromWallet));
    for (let token in tokenList) {
        const balanceContract = await new network.eth.Contract(balanceOfERC20ABI, tokenList[token]);

        await balanceContract.methods
            .balanceOf(fromWallet)
            .call()
            .catch((error) => {
                if (!error) console.log("Error fetching erc20token balance!\n", error);
            })
            .then(async (erc20Balance) => {
                var inGwei = await network.utils.fromWei(erc20Balance);
                console.log(token, inGwei);
            })
    }
}

async function waitForTxConfirmation(network, txHash) {

    var transaction = await network.eth.getTransaction(txHash);
    
    if (transaction.blockNumber !== null) {
        txConfirmed = true;
    } else {
        setTimeout(() => {
            waitForTxConfirmation(network, txHash);
        }, 100);
        return;
    }

    const blockNumber = transaction.blockNumber;
    const block = await network.eth.getBlock(blockNumber);
    const date = new Date(block.timestamp * 1000);

    const transactionObject = {
        success: "Transaction Confirmed",
        tx: txHash,
        time:
            date.getDate() +
            "/" +
            date.getMonth() +
            "/" +
            date.getFullYear() +
            " " +
            date.getHours() +
            ":" +
            date.getMinutes() +
            ":" +
            date.getSeconds() +
            " UTC",
    };
    console.log(transactionObject);
}

async function sendERC20Token(network, fromWallet, toWallet, amount, tokenAddress) {
    
    const amountInWei = await network.utils.toWei(`${amount}`);

    const sendContract = await new network.eth.Contract(
        transferERC20ABI,
        tokenAddress
    );

    sendContract.methods
        .transfer(toWallet, amountInWei)
        .send({
            from: fromWallet,
            gas: await estimateGas(network, fromWallet)},
            async (error, txHash) => {
                if (!error) {
                    await waitForTxConfirmation(network, txHash);
                } else {
                    console.log("ERC20 Token transaction failed.\n", error);
                }
    })
    return
}

async function approveSpendLimit(network, fromWallet, tokenAddress, router, spendLimit=null) {

    if (spendLimit === null)
        spendLimit = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");

    const approveContract = await new network.eth.Contract(approveSpendLimitABI, tokenAddress);
    await approveContract.methods
        .approve(router, spendLimit)
        .send({
            from: fromWallet,
            gas: await estimateGas(network, fromWallet)},
            async (error, txHash) => {
                if (!error) {
                    await waitForTxConfirmation(network, txHash);
                } else {
                    console.log("Error during the approval of a new spend limit.\n", error);
                }
    })
    return
}

async function revokeSpendLimit(network, fromWallet, tokenAddress) {

    const approveContract = await new network.eth.Contract(approveSpendLimitABI, tokenAddress);
    await approveContract.methods
        .approve(router, 0)
        .send({
            from: fromWallet,
            gas: await estimateGas(network, fromWallet)},
            async (error, txHash) => {
                if (!error) {
                    await waitForTxConfirmation(network, txHash);
                } else {
                    console.log("Error during the revoke process of your current spend limit.\n", error);
                }
            }
        )
}

async function estimateGas(network, fromWallet, data=null) {
    const estimatedGas = network.eth.estimateGas({
        from: fromWallet,
        data: data
    })

    return estimatedGas
}

module.exports = {
    getGasBalance,
    getERC20Balance,
    displayAllBalances,
    waitForTxConfirmation,
    sendERC20Token,
    approveSpendLimit,
    revokeSpendLimit,
    estimateGas,
};
