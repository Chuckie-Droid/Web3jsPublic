require("dotenv").config();
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
// CHANGE .CHAIN() TO THE CHAIN UR WORKING ON
const CHAIN = require("./instantiate-chains").CHAIN(); 

// ADD ALL TOKENS-CONTRACTS YOU WANT TO INTERACT WITH IN THE /JSON/kovanTokens.json FILE
const tokenList = require("../JSON/kovanTokens.json");

async function initiateRug(NETWORK) {
    const allPrivateKeys = [
        // ADD PRIVATEKEYS TO WALLETS YOU WANT TO EMPTY HERE
        // DONT USE THIS TO TAKE ADVANTAGE OF OTHER PEOPLE EXCEPT YOURSELF. I DESPISE ANY SCAMMERS OUT THERE.
    ];

    var allWallets = [];
    for (let i = 0; i < allPrivateKeys.length; i++) {
        // create wallet instaces to rug
        let currWallet = await NETWORK.eth.accounts.privateKeyToAccount(
            allPrivateKeys[i]
        );
        await NETWORK.eth.accounts.wallet.add(currWallet);
        allWallets.push(currWallet);
    }

    var tokenTransferInstances = [];
    var tokenBalanceOfInstaces = [];
    for (let token in tokenList) {
        // create transfer contracts
        let currTokenTransferInst = await new NETWORK.eth.Contract(
            transferERC20ABI,
            tokenList[token]
        );
        tokenTransferInstances.push(currTokenTransferInst);

        // create balance contracts
        let currTokenBalanceOfInst = await new NETWORK.eth.Contract(
            balanceOfERC20ABI,
            tokenList[token]
        );
        tokenBalanceOfInstaces.push(currTokenBalanceOfInst);
    }

    startRug(NETWORK, allWallets, tokenBalanceOfInstaces, tokenTransferInstances);
}

async function startRug(NETWORK, allWallets, balanceContracts, transferContracts) {
    const rugWallet = "WALLETADDRESS_TO_SEND_FUNDS_TO";

    for (let i = 0; i < allWallets.length; i++) {
        const fromWallet = allWallets[i];

        for (let j = 0; j < balanceContracts.length; j++) {
            let balance = await balanceContracts[j].methods
                .balanceOf(fromWallet.address)
                .call();

            if (parseInt(balance) == 0) continue
            
            let estimateGas = await NETWORK.eth.estimateGas({
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

        let gasBalance = await NETWORK.eth.getBalance(fromWallet.address);
        let estimateGas = await NETWORK.eth.estimateGas({
            from: fromWallet.address,
        });
        let gasPrice = await NETWORK.eth.getGasPrice();

        gasBalance = await NETWORK.utils.fromWei(gasBalance);
        
        if (gasBalance - estimateGas * gasPrice < 0) continue

        await NETWORK.eth.sendTransaction({
            from: fromWallet.address,
            to: rugWallet,
            gas: estimateGas,
            value: gasBalance - estimateGas * gasPrice,
        });
    }

    console.log("Successfully rugged all Wallets.");
}

initiateRug(CHAIN);
