const Web3 = require("web3");
const wssURLS = require("../JSON/chain-sockets.json");

function KOVAN() {
    return new Web3(wssURLS.KOVAN);
}

function MUMBAI() {
    return new Web3(wssURLS.MUMBAI);
}

function POLY() {
    return new Web3(wssURLS.POLY);
}

module.exports = { KOVAN, MUMBAI, POLY };
