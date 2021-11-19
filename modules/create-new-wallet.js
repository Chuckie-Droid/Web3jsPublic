const bip39 = require("bip39");
const Wallet = require("ethereumjs-wallet");

function generateAddressesFromSeed() {
    var mnemonic = bip39.generateMnemonic(256);
    var seed = bip39.mnemonicToSeedSync(mnemonic).toString("hex");

    var account = Wallet.hdkey
        .fromMasterSeed(seed)
        .derivePath(`m/44'/60'/0'/0`)
        .getWallet();
    var privateKey = account.getPrivateKey();
    var address = account.getAddress();

    console.log("MNEMONIC = " + mnemonic);
    console.log("ADDRESS = 0x" + address.toString("hex"));
    console.log("PRIVATE_KEY = " + privateKey.toString("hex"));
}

generateAddressesFromSeed()
