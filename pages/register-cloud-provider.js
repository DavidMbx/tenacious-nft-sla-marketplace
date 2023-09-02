import React, { useState } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import {ethers} from 'ethers'
import { 
  NFT_BADGE_PROVIDER_CONTRACT
} from "../const/addresses";
//const Web3 = require('web3');
import { Navbar } from '/components/Navbar'
import { ConnectWallet,useAddress, useSigner } from "@thirdweb-dev/react";
require('dotenv').config({ path:"./.env"})
const SparqlClient = require('sparql-http-client')
import {ThirdwebSDK} from "@thirdweb-dev/sdk"
import NFT_Badge_Provider from   '../artifacts/contracts/NFT_Badge_Provider.sol/NFT_Badge_Provider.json'
import { ExternalLinkIcon,DeleteIcon,EditIcon,AddIcon,RepeatIcon } from '@chakra-ui/icons'



const fs = require("fs")
const path = require("path")




export default function RegisterCloudProvider() {


  // Read-only mode - no need of private key
//const sdk = new ThirdwebSDK("localhost");

const sdk = new ThirdwebSDK("goerli", {
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID, // Use client id if using on the client side, get it from dashboard settings
});
  

    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});

    

    const [formInput,updateFormInput]=useState({ cloudProviderName:'', cloudProviderMail:'', cloudProviderPictureURI:''})
    const [cloudProviderPicture, setCloudProviderPicture] = useState(null);
    const cloudProviderAddress= useAddress();
    const signer = useSigner();


    const projectId=process.env.NEXT_PUBLIC_PROJECT_ID_IPFS_INFURA
    const projectSecret=process.env.NEXT_PUBLIC_PRIVATE_KEY_IPFS_INFURA
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret,'utf8').toString('base64');
    
    
    // Configura il client IPFS
    const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth
        },
      });

  
    async function handlePictureChange(event) {
        const file=event.target.files[0]
        
      
        
        try{
            const added=await client.add(file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
                )
                //const url=`https://tenacious.infura-ipfs.io/${added.path}`
                updateFormInput({...formInput,cloudProviderPictureURI: added.path})
                setCloudProviderPicture(file)
                

        } catch (e){
            console.log(e)
        }
    }
  
    const handleRegister = () => {
      // Qui puoi implementare la logica per registrare il fornitore cloud come NFT
      // Utilizza i dati inseriti dall'utente: cloudProviderName, cloudProviderMail, cloudProviderPicture
      // Puoi inviare una transazione Ethereum per creare l'NFT e salvarlo sulla blockchain
      // Ricorda di gestire anche la connessione al wallet dell'utente tramite Metamask o altro
  
      // Esempio di output dei dati per la demo
      console.log('Cloud Provider Form:', formInput);
      console.log('Cloud Provider Picture:', cloudProviderPicture);
      console.log('Cloud Provider Address:',cloudProviderAddress)
      checkIfAlreadyCloudProvider()
      
      

    };
  



  
// Funzione per caricare un file su IPFS
async function uploadToIPFS(file) {
    try {
      const { cid } = await client.add(file); // Carica il file su IPFS
  
      console.log('File caricato su IPFS. CID:', cid.toString());
      const url= `https://nftslamarket.infura-ipfs.io/${cid.path}`
      return cid.toString(); // Restituisci l'hash IPFS del file
    } catch (error) {
      console.error('Errore durante il caricamento su IPFS:', error);
      return null;
    }
  }

   
  async function createFileJSON() {
       

    const {cloudProviderName,cloudProviderMail,cloudProviderPictureURI}= formInput
    if(!cloudProviderAddress ||!cloudProviderName ||!cloudProviderMail ||!cloudProviderPictureURI  ) return  console.log(cloudProviderAddress+cloudProviderName+cloudProviderMail+cloudProviderPictureURI)

    const data= JSON.stringify({
        cloudProviderAddress,cloudProviderName,cloudProviderMail,cloudProviderPictureURI
    })

    const formURI= await uploadToIPFS(data)
    console.log(data+"\n"+formURI)

    const tokenId= await uploadToBlockchain(formURI);
    uploadToSPARQL(formURI,tokenId);
    
    
}



async function checkIfAlreadyCloudProvider() {


    // Query SPARQL per verificare se l'utente esiste già nel database
    const selectQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>

    SELECT ?cloudActor
    WHERE {
  ?address cs:hasAddress "${cloudProviderAddress}" .
  ?cloudActor cs:hasBlockchainAddress ?address.
  ?cloudActor rdf:type cs:CloudProvider.
}

    `;

    const stream = await clientSPARQL.query.select(selectQuery);
    let datiRicevuti=false;
    
   stream.on('data', row => {
         Object.entries(row).forEach(([key, value]) => {
          console.log(`${key}: ${value.value} (${value.termType})`)
          datiRicevuti=true;

        })
      })

      stream.on('end', () => {
        
        if (!datiRicevuti) {
         // L'utente non è registrato già come cloud provider, procedo con l'inserimento
         console.log("L'indirizzo non risulta associato a nessun Cloud Provider")
         createFileJSON()
        }
        else{
          console.log("L'indirizzo risulta già associato ad un Cloud Provider")
        }

        })
      
      
      stream.on('error', err => {
        console.error(err)
      })
}


async function uploadToBlockchain(URI) {


  //const contract = await sdk.getContractFromAbi(NFT_BADGE_PROVIDER_CONTRACT,contractAbi);
 
  
  let contract= new ethers.Contract(NFT_BADGE_PROVIDER_CONTRACT,NFT_Badge_Provider.abi,signer)
  console.log(contract)
  let transaction= await contract.safeMint(cloudProviderAddress,URI)
  let tx= await transaction.wait()
  let event= tx.events[0]
  let value=event.args[2]
  let tokenId=value.toNumber()
  console.log(event)
  console.log(value)
  console.log(tokenId)
  return tokenId

 
}

async function uploadToSPARQL(tokenURI,tokenId) {

  const {cloudProviderName,cloudProviderMail,cloudProviderPictureURI}= formInput


  const insertQuery = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>

  INSERT DATA {
    cs:${cloudProviderName.replace(/ /g, "_")} rdf:type cs:CloudProvider.
    cs:${cloudProviderName.replace(/ /g, "_")} cs:hasMail "${cloudProviderMail}".
    cs:Picture_${cloudProviderName.replace(/ /g, "_")} rdf:type cs:Picture.
    cs:Picture_${cloudProviderName.replace(/ /g, "_")} cs:hasLink "${cloudProviderPictureURI}".
    cs:${cloudProviderName.replace(/ /g, "_")} cs:hasPicture cs:Picture_${cloudProviderName.replace(/ /g, "_")}.
    cs:${cloudProviderName.replace(/ /g, "_")} cs:hasBlockchainAddress cs:Address_${cloudProviderAddress} .
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")}  rdf:type cs:NFT-Badge .
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasOwner cs:Address_${cloudProviderAddress} .
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:tokenURI "${tokenURI}".
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasAddress "${NFT_BADGE_PROVIDER_CONTRACT}".
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasTokenID "${tokenId}".
  }
  
`;

const responseUpdate=clientSPARQL.query.update(insertQuery)
console.log(responseUpdate)



}



  return (
    <Flex justifyContent="center" alignItems="center" height="60vh">
      <Box w="50%" p={4} >
        <FormControl isRequired>
          <FormLabel>Cloud Provider Name</FormLabel>
          <Input
            placeholder="Cloud Provider Name"
            onChange={e=> updateFormInput({...formInput,cloudProviderName: e.target.value})}
            borderRadius="md"
          />

          <FormLabel mt={4}>Cloud Provider Mail</FormLabel>
          <Input
            placeholder="Cloud Provider Mail"
            type='email'
            onChange={e=> updateFormInput({...formInput,cloudProviderMail: e.target.value})}
            borderRadius="md"
          />

          <FormLabel mt={4}>Choose Cloud Provider Picture</FormLabel>
          <Input type="file" id="photoCS" onChange={handlePictureChange} borderRadius="md" />
          
          {/* Al posto dell'immagine commentata */}
          {cloudProviderPicture && (
            <img className="rounded mt-4" width="200" src={URL.createObjectURL(cloudProviderPicture)} alt="Cloud Provider" />
          )}
          
          <Button
          leftIcon={<AddIcon />}
            onClick={handleRegister}
            mt={6}
            colorScheme="green"
            borderRadius="md"
            size="lg"
            boxShadow="lg"
          >
            Register as Cloud Provider
          </Button>
        </FormControl>
      </Box>
    </Flex>
  );
}

