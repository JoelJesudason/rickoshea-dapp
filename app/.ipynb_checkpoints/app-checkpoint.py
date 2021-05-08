from flask import Flask, render_template, redirect, url_for, jsonify
from flask import request
# from web3.auto.infura import w3
from pathlib import Path
import os
import sys
import json
import time
import pandas as pd
from dotenv import load_dotenv
load_dotenv()

from web3 import Web3
PROVIDER_URI = "wss://{network}.infura.io/ws/v3/{project_id}".format(
                network='goerli', project_id=os.getenv("WEB3_INFURA_PROJECT_ID"))
w3 = Web3(Web3.WebsocketProvider(PROVIDER_URI))

# verifying environment set-up
print("env loaded") if type(os.getenv("WEB3_INFURA_PROJECT_ID")) == str else print("env not loaded")
print("w3 connected:",str(w3.isConnected()))

app = Flask(__name__)

@app.route('/balance')
def balance():
    # loading abi
    with open(Path("./abi/ERC20.json")) as json_file:
        erc20_abi = json.load(json_file)

    # Super fUSDC Fake Token (fUSDCx) contract address
    fUSDCx_address = '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a'
    # Super ETH (ETHx) contract address
    ETHx_address = '0x5943f705abb6834cad767e6e4bb258bc48d9c947'
    # DApp contract address
    dapp_address = '0xd76b685e4a025E173D5B420F368DdE70f4e40E41'
    # User Address
    user_address = '0xc41876DAB61De145093b6aA87417326B24Ae4ECD'

    erc20_instance = w3.eth.contract(
        address=Web3.toChecksumAddress(fUSDCx_address),
        abi = erc20_abi
    )

    tokenamount = erc20_instance.functions.balanceOf(Web3.toChecksumAddress(user_address)).call()

    print(tokenamount/1000000000000000000)
    output={"tokenamount":tokenamount/1000000000000000000}
    
    return render_template("index")

if __name__ == "__main__":
    app.run(debug=True)

