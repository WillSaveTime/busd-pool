import React, { useState } from "react";
// import gif from "../../assets/New-450-Day-Website 425x133-banner.gif"
// import {
//     FaInstagram,
//     FaTwitter,
//     FaDiscord,
// } from "react-icons/fa";
import ProgressBar from "@ramonak/react-progress-bar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function HomeScreen(props) {
    // console.log(props.lastHatch)
    const [depositAmount, setDepositAmount] = useState(0);
    return (
        <div className="mt-80 mb-4">
            <div className="mw-800 d-flex m-auto mb-2 style-1 mt-4 justify-content-between fs-2 gap-2">
                <div className="">
                    <div>{props.web3Provider ? (props.userMinerAmount ? (props.userMinerAmount + " Million Miners") : "Deposited Amount: 300") : "- Miners"}  </div>
                    <div>{props.web3Provider ? (props.userBnbAmount ? props.userBnbAmount : "Daily Profit: 10 BUSD") : "-"} </div>
                </div>
                <div>
                    <div><a href="https://testnet.bscscan.com/address/0xc51b73e70ee249987e0b5614b610f665b66fd67d">Pool Contract</a></div>
                    <div>{props.contractBnbAmount ? (props.contractBnbAmount - 0).toFixed(3) : "1000000"} Total Value of Pool</div>
                </div>
            </div>
            <div className="d-flex mw-800 justify-content-center m-auto gap-5 flex-column flex-md-row mt-4 mb-5">
                <div className="d-flex flex-column" style={{ flex: 1 }}>
                    <div className="style-2">
                        <div className="d-flex justify-content-between mt-4 mb-5 gap-5">
                            <button className="button-4" onClick={() => props.handleDeposit(depositAmount)}>Make Deposit</button>
                            <div className="position-relative">
                                <span className="position-absolute fw-bold " style={{ top: "5px", right: "30px" }}>BNB</span>
                                <input placeholder="0 BNB" type="number" className="bnb-amount" min={0} value={depositAmount} onChange={(e) => { setDepositAmount(e.target.value) }} />
                            </div>
                        </div>
                        <div className="mt-4"><button className="button-2" onClick={props.handleCompound}> Withdraw</button></div>
                        <div className="mt-3"><button className="button-2" onClick={props.handleClaim}> Claim </button></div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div >
    );
}

