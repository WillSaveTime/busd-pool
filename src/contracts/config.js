import dotenv from "dotenv";

dotenv.config();

const config = {
  SafeMutual: {
    56: "0x669C44Bb5FeE049031C21714B250F98C12324E9B", // Mainnet
    97: "0x502258C94A07E2c7f24E9B48904bd301E138CAef", // Testnet //Not verified
  },
  BlockExplorerURL: {
    56: "https://bscscan.com",
    97: "https://testnet.bscscan.com",
  },
  RpcURL: {
    56: "https://bsc-dataseed.binance.org/",
    97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  chainHexID: {
    56: "0x38",
    97: "0x61",
  },
  INFURA_ID: "9f08884ad87343d89b817b96e19e5808",
  chainID: 97,
  BUSD_CONTRACT: "0xcAfA5bfEe6E519D624A4FE69b9D88fAD8C131efD",
  POOL_CONTRACT: "0x78B99B4985122ee04F90561D1Dcd5b78a029cBa4"
};

export default config;
