require("dotenv").config();
const Web3 = require("web3");
const abis = require("./JSON/abis.json");
const web3polygon = new Web3(
    "wss://polygon-mumbai.g.alchemy.com/v2/mf4O_mgRA1XaEGQ_QqsFo39uJ-pG_c8s"
);
const link = "0x326c977e6efc84e512bb9c30f76e30c160ed06fb";

const wallet = web3polygon.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
);
const testWallet = web3polygon.eth.accounts.privateKeyToAccount(
    process.env.TEST_PRIVATE_KEY
);

web3polygon.eth.accounts.wallet.add(wallet);

async function main() {
    const tokenInstance = await new web3polygon.eth.Contract(
        abis.balanceOf,
        link
    );

    const balance = await tokenInstance.methods
        .balanceOf(wallet.address)
        .call();
    const gasBalance = await web3polygon.eth.getBalance(wallet.address);
    console.log("Link in Main Wallet: ", web3polygon.utils.fromWei(balance));
    console.log("Gas in Main Wallet: ", web3polygon.utils.fromWei(gasBalance));

    const testBalance = await tokenInstance.methods
        .balanceOf(testWallet.address)
        .call();
    const testGasBalance = await web3polygon.eth.getBalance(testWallet.address);
    console.log(
        "Link in Test Wallet: ",
        web3polygon.utils.fromWei(testBalance)
    );
    console.log(
        "Gas in Test Wallet: ",
        web3polygon.utils.fromWei(testGasBalance)
    );

    sendERC20Token(0.001, link);
}

async function sendERC20Token(
    amount,
    tokenAddress,
    fromWallet = wallet.address,
    toWallet = testWallet.address
) {
    const tokenInst = await new web3polygon.eth.Contract(
        abis.transfer,
        tokenAddress
    );
    const amountInWei = web3polygon.utils.toWei(`${amount}`);
    const totalGas = await web3polygon.eth.estimateGas({
        from: fromWallet,
    });

    tokenInst.methods
        .transfer(toWallet, amountInWei)
        .send({ from: fromWallet, gas: totalGas }, (error, txHash) => {
            if (!error) waitForTxConfirmation(txHash);
        });
}

async function waitForTxConfirmation(txHash) {
    var txConfirmed = false;
    var transaction = await web3polygon.eth.getTransaction(txHash);
    if (transaction.blockNumber !== null) {
        txConfirmed = true;
    } else {
        setTimeout(() => {
            waitForTxConfirmation(txHash);
        }, 100);
        return;
    }

    const blockNumber = transaction.blockNumber;
    const block = await web3polygon.eth.getBlock(blockNumber);
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

async function waitNBlocksForHash(n, txHash, initialBlock = 0) {
    var currentBlock = await web3polygon.eth.getBlockNumber();

    if (initialBlock === 0) {
        initialBlock = currentBlock;
    }

    if (currentBlock - initialBlock > n) {
        web3polygon.eth.getTransaction(txHash, (error, result) => {
            if (!error && result.blockNumber !== null) {
                return console.log(`Transaction: ${txHash} succeeded.`);
            }
        });
    } else {
        setTimeout(() => {
            waitNBlocksForHash(n, txHash, initialBlock);
        }, 500);
    }
}

main();
