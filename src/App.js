import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import './styles/style.css';
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [cardGifImage, setCardGifImage] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
    const interval = setInterval(() => {
      setCardGifImage(cardGifImage => {
        if(cardGifImage != 7){
          return cardGifImage + 1
        }else{
          return 1
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <>
      <div className="multiple-bg-img pos-relative">
        <div className="d-grid">
          <img src="images/image-1.png" className="img-fluid" alt="image-1" />
          <img src="images/image-2.png" className="img-fluid" alt="image-2" />
          <img src="images/image-4.png" className="img-fluid" alt="image-4" />
          <img src="images/image-3.png" className="img-fluid" alt="image-3" />
          <img src="images/image-1.png" className="img-fluid" alt="image-5" />
          <img src="images/image-6.png" className="img-fluid" alt="image-6" />

          <img src="images/image-6.png" className="img-fluid" alt="image-1" />
          <img src="images/image-1.png" className="img-fluid" alt="image-2" />
          <img src="images/image-3.png" className="img-fluid" alt="image-4" />
          <img src="images/image-4.png" className="img-fluid" alt="image-3" />
          <img src="images/image-2.png" className="img-fluid" alt="image-5" />
          <img src="images/image-1.png" className="img-fluid" alt="image-6" />

          <img src="images/image-1.png" className="img-fluid" alt="image-1" />
          <img src="images/image-2.png" className="img-fluid" alt="image-2" />
          <img src="images/image-4.png" className="img-fluid" alt="image-4" />
          <img src="images/image-3.png" className="img-fluid" alt="image-3" />
          <img src="images/image-1.png" className="img-fluid" alt="image-5" />
          <img src="images/image-6.png" className="img-fluid" alt="image-6" />

          <img src="images/image-6.png" className="img-fluid" alt="image-1" />
          <img src="images/image-1.png" className="img-fluid" alt="image-2" />
          <img src="images/image-3.png" className="img-fluid" alt="image-4" />
          <img src="images/image-4.png" className="img-fluid" alt="image-3" />
          <img src="images/image-2.png" className="img-fluid" alt="image-5" />
          <img src="images/image-1.png" className="img-fluid" alt="image-6" />

          <img src="images/image-1.png" className="img-fluid" alt="image-1" />
          <img src="images/image-2.png" className="img-fluid" alt="image-2" />
          <img src="images/image-4.png" className="img-fluid" alt="image-4" />
          <img src="images/image-3.png" className="img-fluid" alt="image-3" />
          <img src="images/image-1.png" className="img-fluid" alt="image-5" />
          <img src="images/image-6.png" className="img-fluid" alt="image-6" />

          <img src="images/image-6.png" className="img-fluid" alt="image-1" />
          <img src="images/image-1.png" className="img-fluid" alt="image-2" />
          <img src="images/image-3.png" className="img-fluid" alt="image-4" />
          <img src="images/image-4.png" className="img-fluid" alt="image-3" />
          <img src="images/image-2.png" className="img-fluid" alt="image-5" />
          <img src="images/image-1.png" className="img-fluid" alt="image-6" />
        </div>

        <div className="card pos-center">
          <div className="card-img-slider">
            <img src={"images/image-"+cardGifImage+".png"} className="card-img-top" alt="image-1" />
          </div>
          <div className="card-body text-center">
            <div className="buttons">
              <button type="button" className="cus-btn-sm">-</button>
              <button type="button" className="cus-btn font-weight-bold">Mint 1</button>
              <button type="button" className="cus-btn-sm">+</button>
            </div>
            <p className="card-text mt-3">Mint your Fast Food Lil Baby Apes Club</p>
          </div>
          <div className="card-footer bg-theme-red p-3">
            <button
              type="button"
              className="cus-btn bg-dark text-white font-weight-bold"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(connect());
                  getData();
                }}
            >
              Connect Wallet
            </button>
            {blockchain.errorMsg !== "" ? (
              <>
                <s.SpacerSmall />
                <s.TextDescription
                  style={{
                    textAlign: "center",
                    color: "var(--accent-text)",
                  }}
                >
                  {blockchain.errorMsg}
                </s.TextDescription>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
