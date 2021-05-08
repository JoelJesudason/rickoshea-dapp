from flask import Flask, render_template, redirect, url_for, jsonify
from flask import request
from flask_cors import CORS,cross_origin
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

CORS(app)

@app.route('/')
def indexfunc():
    return render_template("index.html")
    
@app.route('/balance/<user_address>/<token_address>')
def balance(user_address,token_address):

    # loading abi
    with open(Path("/ERC20_abi.json")) as json_file:
        erc20_abi = json.load(json_file)

    # DApp contract address
    dapp_address = '0xd76b685e4a025E173D5B420F368DdE70f4e40E41'


    erc20_instance = w3.eth.contract(
        address=Web3.toChecksumAddress(token_address),
        abi = erc20_abi
    )

    tokenamount = erc20_instance.functions.balanceOf(Web3.toChecksumAddress(user_address)).call()

    print(tokenamount/1000000000000000000)
    output={"User balance":tokenamount/1000000000000000000}
    
    return jsonify(output)


if __name__ == "__main__":
    app.run(debug=True)

