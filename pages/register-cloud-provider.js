import React, { useState } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { Navbar } from '/components/Navbar'
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
require('dotenv').config({ path:"./.env"})
const SparqlClient = require('sparql-http-client')



export default function RegisterCloudProvider() {


 
    

    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});

    

    const [formInput,updateFormInput]=useState({ cloudProviderName:'', cloudProviderMail:'', cloudProviderPictureURL:''})
    const [cloudProviderPicture, setCloudProviderPicture] = useState(null);
    const cloudProviderAddress= useAddress();

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
                const url=`https://tenacious.infura-ipfs.io/${added.path}`
                updateFormInput({...formInput,cloudProviderPictureURL: url})
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
       

    const {cloudProviderName,cloudProviderMail,cloudProviderPictureURL}= formInput
    if(!cloudProviderAddress ||!cloudProviderName ||!cloudProviderMail ||!cloudProviderPictureURL  ) return  console.log(cloudProviderAddress+cloudProviderName+cloudProviderMail+cloudProviderPictureURL)

    const data= JSON.stringify({
        cloudProviderAddress,cloudProviderName,cloudProviderMail,cloudProviderPictureURL
    })
    const formURI=uploadToIPFS(data)
    console.log(data+"\n"+formURI)

    uploadToBlockchain();
    uploadToSPARQL();
    
    
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



async function uploadToBlockchain() {

}

async function uploadToSPARQL() {

  const {cloudProviderName,cloudProviderMail,cloudProviderPictureURL}= formInput


  const insertQuery = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX cs: <http://127.0.0.1/ontologies/CSOntology.owl#>

  INSERT DATA {
    cs:${cloudProviderName.replace(/ /g, "_")} rdf:type cs:CloudProvider.
    cs:${cloudProviderName.replace(/ /g, "_")} cs:hasMail "${cloudProviderMail}".
    cs:Picture_${cloudProviderName.replace(/ /g, "_")} rdf:type cs:Picture.
    cs:Picture_${cloudProviderName.replace(/ /g, "_")} cs:hasLink "${cloudProviderPictureURL}".
    cs:${cloudProviderName.replace(/ /g, "_")} cs:hasPicture cs:Picture_${cloudProviderName.replace(/ /g, "_")}.
    cs:${cloudProviderName.replace(/ /g, "_")} cs:hasBlockchainAddress cs:Address_${cloudProviderAddress} .
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasOwner cs:Address_${cloudProviderAddress} .
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:tokenURI "".
    cs:NFT-Badge_${cloudProviderName.replace(/ /g, "_")} cs:hasAddress "".
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
            onClick={handleRegister}
            mt={6}
            colorScheme="teal"
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

