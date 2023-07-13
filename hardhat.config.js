require("@nomiclabs/hardhat-waffle");


const fs= require ("fs")
const privateKey=process.env.PRIVATE_KEY
const projectId="63702440ff3445e2b37b16c074cdf536"

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
