import React, { useState } from "react";
// import gif from "../../assets/New-450-Day-Website 425x133-banner.gif"
// import {
//     FaInstagram,
//     FaTwitter,
//     FaDiscord,
// } from "react-icons/fa";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function HomeScreen(props) {
    // console.log(props.lastHatch)
    const [depositAmount, setDepositAmount] = useState(0);
    return (
        <div className="mt-80 mb-4">
            <p className="text-center p-4 content"> Have a daily profit of 0.3%</p>
            <div className="d-flex m-auto mb-2 style-1 mt-4 justify-content-between fs-2 gap-2">
                <div>
                    <p>Deposited Amount:</p>
                    <p className="amount">{props.web3Provider ? (props.userMinerAmount ? (props.userMinerAmount + " Million Miners") : "300 BUSD") : "- Miners"}</p></div>
                <div>
                    <p>Daily Profit:</p>
                    <p className="amount">{props.web3Provider ? (props.userBnbAmount ? props.userBnbAmount : "10 BUSD") : "-"}</p></div>
                <div>
                    <p>Total Value of Pool:</p>
                    <p className="amount">{props.contractBnbAmount ? (props.contractBnbAmount - 0).toFixed(3) : "1000000 BUSD"}</p></div>
                <div>
                    <a href="https://testnet.bscscan.com/address/0xc51b73e70ee249987e0b5614b610f665b66fd67d">Pool Contract</a>
                </div>
            </div>
            <div className="d-flex justify-content-center m-auto gap-5 flex-column flex-md-row mt-5">
                <div className="d-flex flex-column" style={{ flex: 1 }}>
                    <div className="style-2">
                        <div className="d-flex justify-content-between align-items-center gap-5">
                            <div className="position-relative">
                                <span className="position-absolute fw-bold " style={{ top: "5px", right: "30px" }}>BUSD</span>
                                <input placeholder="0 BNB" type="number" className="bnb-amount" min={0} value={depositAmount} onChange={(e) => { setDepositAmount(e.target.value) }} />
                            </div>
                            <button className="button-4" onClick={() => props.handleDeposit(depositAmount)}>Make Deposit</button>
                            <button className="button-4" onClick={props.handleCompound}> Withdraw</button>
                            <button className="button-4" onClick={props.handleClaim}> Claim </button>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-center p-4 content">BSC fee+3% on deposit</p>
            <ToastContainer />
        </div >
    );
}

