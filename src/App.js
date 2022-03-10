import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import openseaLogo from './assets/opensea-logo.png';

import { ethers } from "ethers";
import NFTFLOW from "./abi/NFTFLOW.json";
import React from "react";

// Constants
const TWITTER_HANDLE = "NftflowStarkNet";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://opensea.io/collection/nftflow-membership-pass";
// const OPENSEA_LINK = "https://testnets.opensea.io/collection/nftflow-membership-pass-hlmrfrwd7b";
// const CONTRACT_ADDRESS = "0x536406EaC631663af5E1f687CAbe46babDCBfADd";
const CONTRACT_ADDRESS = "0x253954d29386e174Ed4BC69902391a8ED3fd51ca";
const RINKEBY_CHAIN_ID = "0x1";
// const RINKEBY_CHAIN_ID = "0x4";
const maxMintAmount = 1;

const App = () => {
  const [currentUserAccount, setCurrentUserAccount] = React.useState("");
  const [totalTokensMinted, setTotalTokensMinted] = React.useState(0);

  const confirmNetwork = async (ethereum, chainId) => {
    let returnedChainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    return returnedChainId !== RINKEBY_CHAIN_ID ? false : true;
  };

  const checkWalletConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please login to Metamask 😞!");
    }

    let ok = await confirmNetwork(ethereum, RINKEBY_CHAIN_ID);
    if (!ok) {
      alert("You are not connected to the Ethereum Main Network 😞!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      // User has already connected wallet.
      setCurrentUserAccount(accounts[0]);
      setupNFTMintedListener();
    } else {
      console.warn("No authorized account found");
    }
  };

  React.useEffect(() => {
    checkWalletConnected();
    getMinted();
  });

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please login to Metamask 😞!");
        return;
      }

      let ok = await confirmNetwork(ethereum, RINKEBY_CHAIN_ID);
      if (ok) {
        // Request accounts on wallet connect
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Connected! Account is: ", accounts[0]);
        setCurrentUserAccount(accounts[0]);
        setupNFTMintedListener();
      } else {
        alert("You are not connected to the Rinkeby Test Network 😞!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setupNFTMintedListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTFLOW.abi,
          signer
        );

        // Listen to event
        connectedContract.on(
          "NFTMinted",
          (tokenId , owner) => {
            setTotalTokensMinted(tokenId.toNumber());
          }
        );
        console.log("event listener set up!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMinted = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTFLOW.abi,
          signer
        );
        const Minted = await connectedContract.getTokensMinted();
        setTotalTokensMinted(Minted.toNumber());
      } else {
        console.error("ethereum object not found");
      }
    } catch (e) {
      console.error("error in getSupply:", e);
    }

  };


  const mintNFT = async () => {
    try {
      let ethereum = window.ethereum;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTFLOW.abi,
          signer
        );

        let gasP = await provider.getGasPrice();

        try {
          const tx = await connectedContract.mint1({
            value: ethers.utils.parseEther('0.1', 'ether').toHexString(),
            gasPrice: gasP._hex,
          });

          // withdraw onlyOwner
          // const tx = await connectedContract.withdraw();

          console.log("mint success", tx);
        } catch (error) {
          console.log(error);
        }
      } else {
        console.error("ethereum object not found");
      }
    } catch (e) {
      // alert("An account can only mint one Member Pass 😞!")
      console.error("error in mintNFT :", e);
    }
  };

  const disconnectWallet = async () => {
    setCurrentUserAccount("");
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={() => {
        connectWallet();
      }}
    >
      Connect Your Wallet
    </button>
  );

  const renderMintNFTButton = () => (
    <div>
      <button className="cta-button connect-wallet-button" onClick={mintNFT}>
        0.1 ETH MINT
      </button>
    </div>
  );

  const renderLogout = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={disconnectWallet}
    >
    </button>
  );

  return (
    <div className="App"> 
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">NFTflow Membership Pass</p>
        </div>
        <div className="header-container">
          <a
              className="opensea-button"
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer"
            >
              <img src={openseaLogo} alt="opensea-logo" className="opensea-logo" />View Collection on OpenSea</a>
        </div>
        <div className="header-container">
          <li className="hover:text-purple-500 hover:border-purple-500 cursor-pointer px-4 py-2 font-extrabold text-purple-300 border border-purple-300 rounded-md">
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              {currentUserAccount.length > 0 ? (
                String(currentUserAccount).substring(0, 6) +
                "..." +
                String(currentUserAccount).substring(38)
                + " | Refresh"
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </li>
        </div>
        <div className="header-container">
          {currentUserAccount
            ? renderMintNFTButton()
            : null}
        </div>
        <div className="header-container">
          <p className="sub-text gradient-text">
            {totalTokensMinted} / 1111 minted
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
