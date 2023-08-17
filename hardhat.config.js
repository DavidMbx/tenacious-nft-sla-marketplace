require("@nomiclabs/hardhat-waffle");
require('dotenv').config()


const fs= require ("fs")
const privateKey=process.env.NEXT_PUBLIC_PRIVATE_KEY_INFURA;
const projectId=process.env.NEXT_PUBLIC_PROJECT_ID_INFURA;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: { 
    hardhat: {
      chainId: 1337
    },
    mumbai:{
      url: 'https://polygon-mumbai.infura.io/v3/'+projectId ,
      accounts: [privateKey]
    },
    mainnet:{
    url: 'https://polygon-mainnet.infura.io/v3/'+projectId ,
    accounts: [privateKey]}
  },
  solidity: "0.8.4",
};
