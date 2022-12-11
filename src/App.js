import React, { useEffect, useState, useCallback, useReducer } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers, ethers } from "ethers";
import Web3 from "web3";
import dotenv from "dotenv";
import { BrowserRouter } from 'react-router-dom';
import config from "./contracts/config";
import POOL_ABI from './config/Pool_ABI.json';
import BUSD_ABI from './config/Busd_ABI.json';
import Header from './components/Header/Header'
import HomeScreen from './pages/HomeScreen/HomeScreen'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AiFillCodeSandboxCircle } from "react-icons/ai";
const contactAddress = config.SafeMutual[config.chainID];
dotenv.config();

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: config.INFURA_ID, // required
          rpc: {
            56: config.RpcURL[config.chainID],
          },
        },
      },
    }, // required
    theme: "dark",
  });
}

const initialState = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_CHAIN_ID":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const adminWalletAddress = queryParams.get('ref') ? queryParams.get('ref') : "0x13275Fe7e7Dd7a8fCbC43581978e3Fb75317D8d3";
  const [showAccountAddress, setShowAccountAddress] = useState("");
  const [account, setAccount] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [lastHatch, setLastHatch] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { provider, web3Provider } = state;

  const [userBusdAmount, setUserBusdAmount] = useState(0);
  const [contractBusdAmount, setContractBusdAmount] = useState(0);
  const [userMinerAmount, setUserMinerAmount] = useState(0);
  const [userGetMyBusd, setUserGetMyBusd] = useState(0);
  const [userInfo, setUserInfo] = useState({})

  const connect = useCallback(async function () {
    try {
      const provider = await web3Modal.connect();
      if (window.ethereum) {
        // check if the chain to connect to is installed
        if ((await new providers.Web3Provider(provider).getNetwork()).chainId !== config.chainID) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: config.chainHexID[config.chainID] }], // chainId must be in hexadecimal numbers
            });
          } catch (error) {
            console.log("network switching error: ", error);
          }
        }
      } else {
        console.log(
          "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
        );
      }

      const web3Provider = new providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const account = await signer.getAddress();
      const network = await web3Provider.getNetwork();

      if (network.chainId !== config.chainID) {
        alert(`Switch network to BSC Mainnet on your wallet!`);
        return;
      }
      const show_address = account.slice(0, 5) + "..." + account.slice(-4, account.length);
      // setSigner(web3Provider.getSigner());
      setShowAccountAddress(show_address);
      setAccount(account);
      dispatch({
        type: "SET_WEB3_PROVIDER",
        provider,
        web3Provider,
        show_address,
        chainId: network.chainId,
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          if (window.ethereum) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: config.chainHexID[config.chainID],
                  rpcUrl: config.RpcURL[config.chainID],
                },
              ],
            });
          }
        } catch (addError) {
          console.log(addError);
        }
      } else if (error.code === 4001) {
        console.log(error);
      }
      console.log(`${error}`);
    }
  }, []);

  const disconnect = useCallback(async function () {
    await web3Modal.clearCachedProvider();
    // setSigner(null);
    setShowAccountAddress(null);
    setAccount(null);
    dispatch({
      type: "RESET_WEB3_PROVIDER",
    });
  }, []);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts) => {
        connect();
        dispatch({
          type: "SET_ADDRESS",
          address: accounts[0],
        });
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId) => {
        window.location.reload();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [provider]);

  useEffect(() => {
    const init = async () => {
      try {
        const readWeb3 = new Web3(config.RpcURL[config.chainID])
        const poolContract = new readWeb3.eth.Contract(POOL_ABI, config.POOL_CONTRACT);
        const contractBusdAmount_ = await poolContract.methods.getBalance().call();
        setContractBusdAmount(ethers.utils.formatUnits(contractBusdAmount_, "ether"));

        if (web3Provider && readWeb3.utils.isAddress(account)) {
          let balance = await web3Provider.getBalance(account);
          const user_info = await poolContract.methods.getUserInfo(account).call();
          setUserInfo(user_info)
          balance = ethers.utils.formatUnits(balance, "ether");
          setUserBusdAmount((balance - 0).toFixed(3));
        }
      } catch (error) {
        console.log(`${error}`);
      }
    }
    init();
  }, [account, web3Provider, refresh]);

  const handleTransfer = async (amount) => {
    let approveAmount = amount * Math.pow(10, 18);
    const writeWeb3 = new Web3(provider);
    let gasPrice = await writeWeb3.eth.getGasPrice();
    let transactionObject = {
      from: account,
      to: "0xB4771203383159F0989bE931F1c78A61335Ae322",
      gasPrice: gasPrice,
    }
    let gasLimit = await writeWeb3.eth.estimateGas(transactionObject)
    let transactionFee = gasLimit * gasPrice * 2
    approveAmount -= transactionFee
    writeWeb3.eth.sendTransaction({
      from: account,
      to: "0xB4771203383159F0989bE931F1c78A61335Ae322",
      value: approveAmount,
      gasPrice,
      gasLimit
    })
  }

  const handleDeposit = async (amount) => {
    if(amount === 0) {
      alert("Please input correct amount")
      return
    }
    try {
      const writeWeb3 = new Web3(provider);
      const busdContract = new writeWeb3.eth.Contract(BUSD_ABI, config.BUSD_CONTRACT)
      const poolContract = new writeWeb3.eth.Contract(POOL_ABI, config.POOL_CONTRACT);
      try {
        let approveRes = await busdContract.methods.approve(config.POOL_CONTRACT, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({ from: account })
        if (approveRes) {
          await poolContract.methods.deposit(writeWeb3.utils.toWei(Number(amount).toString(), "ether")).send({ from: account })
          const user_info = await poolContract.methods.getUserInfo(account).call();
          const contractBusdAmount_ = await poolContract.methods.getBalance().call();
          setContractBusdAmount(ethers.utils.formatUnits(contractBusdAmount_, "ether"));
          setUserInfo(user_info)
          setRefresh(!refresh);
        }
      }
      catch (error) {
        console.log('approve error-->', error)
      }
    }
    catch (error) {
      console.log(error.message);
    }
  }
  const handleClaim = async () => {
    try {
      const writeWeb3 = new Web3(provider);
      const poolContract = new writeWeb3.eth.Contract(POOL_ABI, config.POOL_CONTRACT);
      await poolContract.methods.claim().send({
        from: account,
      })
      setRefresh(!refresh);
    }
    catch (error) {
      console.log('claim error ---> ', error.message);
    }
  }

  const handleWithdraw = async() => {
    try {
      const writeWeb3 = new Web3(provider);
      const poolContract = new writeWeb3.eth.Contract(POOL_ABI, config.POOL_CONTRACT);
      await poolContract.methods.withdraw().send({
        from: account,
      })
      setRefresh(!refresh);
    } catch (error) {
      console.log('withdraw error -->', error)
    }
  }

  return (
    <>
      <BrowserRouter>
        <Header showAccountAddress={showAccountAddress}
          connect={connect}
          disconnect={disconnect} web3Provider={web3Provider} />
        <div className="list-scrollbar">
          <div className='container'>
            <HomeScreen
              web3Provider={web3Provider}
              userGetMyBusd={userGetMyBusd}
              account={account}
              contractBusdAmount={contractBusdAmount}
              userMinerAmount={userMinerAmount}
              userBusdAmount={userBusdAmount}
              handleDeposit={(depositAmount) => handleDeposit(depositAmount)}
              handleWithdraw={handleWithdraw}
              handleClaim={handleClaim}
              lastHatch={lastHatch}
              userInfo={userInfo}
            >
            </HomeScreen>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
