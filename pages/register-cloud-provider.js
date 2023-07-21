import React, { useState } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { Navbar } from '/components/Navbar'
require('dotenv').config()



export default function RegisterCloudProvider() {


    

    const [formInput,updateFormInput]=useState({ cloudProviderName:'', cloudProviderMail:'', cloudProviderPicture:''})
    const [cloudProviderPicture, setCloudProviderPicture] = useState(null);
   
    const cloudProviderAddress=useState(Navbar.address)
    


  
    async function handlePictureChange(event) {
        const file=event.target.files[0]
        try{
            const added=await client.add(file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
                )
                const url=`https://nftslamarket.infura-ipfs.io/${added.path}`
                setCloudProviderPicture(url)

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

    };
  


const projectId=process.env.PROJECT_ID_IPFS_INFURA
const projectSecret=process.env.PRIVATE_KEY_IPFS_INFURA
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

   
  async function createFile() {
       

    const {cloudProviderName,cloudProviderMail,cloudProviderPicture}= formInput
    if(!cloudProviderAddress ||!cloudProviderName ||!cloudProviderMail ||!cloudProviderPicture  ) return  console.log(cloudProviderAddress+cloudProviderName+cloudProviderMail+cloudProviderPicture)

    const data= JSON.stringify({
        cloudProviderAddress,cloudProviderName,cloudProviderMail,cloudProviderPicture
    })
    uploadToIPFS(data)
    
   

}



  return (
    <Flex justifyContent="center" alignItems="center" height="40vh">
      <Box w="50%" p={4} >
        <FormControl>
          <FormLabel>Cloud Provider Name</FormLabel>
          <Input
            placeholder="Cloud Provider Name"
            mt={2}
            onChange={e=> updateFormInput({...formInput,cloudProviderName: e.target.value})}
            borderRadius="md"
          />

          <FormLabel mt={4}>Cloud Provider Mail</FormLabel>
          <Input
            placeholder="Cloud Provider Mail"
            mt={2}
            onChange={e=> updateFormInput({...formInput,cloudProviderMail: e.target.value})}
            borderRadius="md"
          />

          <FormLabel mt={4}>Choose Cloud Provider Picture</FormLabel>
          <Input type="file" id="photoCS" mt={2} onChange={handlePictureChange} borderRadius="md" />
          
          {/* Al posto dell'immagine commentata */}
          {cloudProviderPicture && (
            <img className="rounded mt-4" width="350" src={URL.createObjectURL(cloudProviderPicture)} alt="Cloud Provider" />
          )}
          
          <Button
            onClick={handleRegister}
            mt={4}
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
