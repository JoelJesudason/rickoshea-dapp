// TODO: if account change, refreshSubscription

let web3, usdcx, user, host, ida, drt;
let SuperfluidSDK, sf;


const ETHxAppAddr = "0xd76b685e4a025E173D5B420F368DdE70f4e40E41"; // Goerli - ETHx App
// const aAAVExAppAddr = "0x65B09D9494A73F9a4da87de3475318738192F6C0"; // Kovan - aAAVEx App

const appAddr = ETHxAppAddr; // Currently implemented for ETHx on Goerli

const stxAddr = "0x3710AB3fDE2B61736B8BB0CE845D6c61F667a78E"; // Goerli StreamExchange contract
const isuAddr = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9"; // Goerli ISuperfluid contract
const idaAddr = "0xfDdcdac21D64B639546f3Ce2868C7EF06036990c"; // Goerli Instant Distribution Agreement contract
const cfaAddr = "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8"; // Goerli Constant Flow Agreement contract
const resAddr = "0x3710AB3fDE2B61736B8BB0CE845D6c61F667a78E";
// const stxAddr = "0x851d3dd9dc97c1df1DA73467449B3893fc76D85B"; // Kovan StreamExchange contract
// const isuAddr = "0xF0d7d1D47109bA426B9D8A3Cde1941327af1eea3"; // Kovan ISuperfluid contract
// const idaAddr = "0x556ba0b3296027Dd7BCEb603aE53dEc3Ac283d2b"; // Kovan Instant Distribution Agreement contract
// const resAddr = "0x851d3dd9dc97c1df1DA73467449B3893fc76D85B"; // Kovan Resolver contract

const ETHxAddr = "0x5943F705aBb6834Cad767e6E4bB258Bc48D9C947"; // Goerli - ETHx token
const aAAVExAddr = "0x5a669e6A17B056Ca87e54c3Ca889114dB5A02590"; // Kovan - aAAVEx token
const fUSDCxAddr = "0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a";

// TODO: Put this in a function and don't duplicate code, use a list and a loop
// you don't need this. when using const
document.getElementById("approve-" + ETHxAddr).addEventListener("click", function() {
  approve(ETHxAddr);
}, false);

document.getElementById("start-" + ETHxAddr).addEventListener("click", function() {
startStream(ETHxAddr);
}, false);

// Aave functionality on pause
// document.getElementById("approve-" + this.aAAVExAddr).addEventListener("click", function() {
//     approve(this.aAAVExAddr);
// }, false);

// document.getElementById("start-" + this.aAAVExAddr).addEventListener("click", function() {
//     startStream(this.aAAVExAddr);
// }, false);


async function approve(erc20address) {
  // Get the address for approval
    await host.methods.callAgreement(
        idaAddr, // Goerli
        ida.methods.approveSubscription(
            erc20address,
            appAddr,
            0,
            "0x"
        ).encodeABI(),
        "0x"
    ).send({ from: user });
    await refreshSubscription(erc20address);
 }


async function refreshSubscription(erc20address) {
   const sub = await ida.methods.getSubscription(
      erc20address,
      appAddr,
      0,
      user
   ).call();
   console.log(sub);
   if (sub.approved) {
     let abtn = document.getElementById("approve-"+erc20address);
     let sbtn = document.getElementById("start-"+erc20address);
     let input = document.getElementById("input-amt-"+erc20address);
     abtn.innerHTML = sub.approved ? "Approved" : "no";
     abtn.disabled = true;
     sbtn.disabled = false;
     input.disabled = false;
   }

}

// TODO: Build this out so it actually works!!
async function startStream(address) {
  let input = document.getElementById("input-amt-"+address).value;
  console.log("Start streaming " + input + " USDCx/month");

  const user = host.user({
  address: walletAddress[0],
  token: address
  });

}


async function getBalance(tokenAddress,elementId) {
  // HTTP requrest to API for balance
  let url = "http://localhost:5000/erc20_balance/" + user + "/" + tokenAddress;
  // console.log(url);

  return fetch(url)
  .then(function (response) {
    payload = response.json();
    // console.log(payload);
    return payload;
  })
  .then(function (payload) {
    document.getElementById(elementId).innerHTML = payload.balance.toFixed(3);
    // console.log(payload.balance);
  })
  .catch(function (error) {
    console.log("Oof, that's an error: " + error);
  });

}



async function main() {
  await ethereum.enable();
  web3 = new Web3(ethereum);
  user = (await web3.eth.getAccounts())[0];
  
  // import SuperfluidSDK from '@superfluid-finance/js-sdk';
  // sf = new SuperfluidSDK.Framework({
  //   web3: new Web3(window.ethereum)
  // });
  // await sf.initialize()

  // setInterval(getBalance(ETHxAddr,"DCAAssetBalance"),5000);
  balance_call = setInterval(() => getBalance(fUSDCxAddr,"USDCxBalance"),5000);
  // clearInterval(balance_call)
  const networkId = await web3.eth.net.getId();
  // console.log("networkId", networkId);

  // const ercJson = await (await fetch("./IERC20.json")).json();
  const idaJson = await (await fetch("./static/IInstantDistributionAgreementV1.json")).json();
  const isuJson = await (await fetch("./static/ISuperfluid.json")).json();
  const stxJson = await (await fetch("./static/StreamExchange.json")).json();

  const resolver = new web3.eth.Contract(
    // res_abi,
    stxJson,  // TODO: check where this is used. Should it be resAddr
    stxAddr); // Goerli
  console.log("resolver", resolver._address);

  host = new web3.eth.Contract(
    // sf_abi,
    isuJson,
    isuAddr); // Goerli
  console.log("host", host._address);

  ida = new web3.eth.Contract(
    // ida_abi,
    idaJson,
    idaAddr); // Goerli
  console.log("ida", ida._address);

  // load agreements
  const idav1Type = web3.utils.sha3(
      "org.superfluid-finance.agreements.InstantDistributionAgreement.v1"
  );
  const idaAddress = await host.methods.getAgreementClass(idav1Type).call();

  // TODO: Refresh all Subscriptions
  await refreshSubscription(ETHxAddr); // Goerli
  // await refreshSubscription(this.aAAVExAddr); // Kovan

}

main();