import React, { useState } from 'react';
import { Input, Button, FormControl, FormLabel, Box, Text ,Flex,Select,NumberInput,NumberInputField,
NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper,Heading} from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { Navbar } from '/components/Navbar'
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
require('dotenv').config({ path:"./.env"})
const SparqlClient = require('sparql-http-client')

export default function CreateCloudServiceBadge() {

    const [cloudServicePicture, setCloudServicePicture] = useState(null);

    async function handlePictureChange(event) {
        const file=event.target.files[0]
        
      
        
        try{
            const added=await client.add(file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
                )
                const url=`https://tenacious.infura-ipfs.io/${added.path}`
                updateFormInput({...formInput,cloudServicePictureURL: url})
                setCloudServicePicture(file)
                

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
        checkIfCloudProvider()
        
  
      };




    return (
        <Flex justifyContent="center" alignItems="center" height="190vh">
          <Box w="50%" p={4} >
            <FormControl isRequired>
                <FormLabel>Cloud Service Type</FormLabel>
                    <Select placeholder='Select Cloud Service Type'>
                        <option>United Arab Emirates</option>
                        <option>Nigeria</option>
                    </Select>
                    <FormLabel mt={4}>Pricing Model</FormLabel>
                    <Select placeholder='Select Pricing Model'>
                        <option>United Arab Emirates</option>
                        <option>Nigeria</option>
                    </Select>
                    <FormLabel mt={4} >Price per Hour</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1} >
                    <NumberInputField placeholder="ETH" />
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <Box mt={5} p={5}  borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>SLO: Availability</Text>
                    <FormLabel mt={4} >Target</FormLabel>
                    <NumberInput min={0} max={100} precision={1} step={0.1}>
                    <NumberInputField placeholder="%"/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <FormLabel mt={4} >Penalty per Day</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1}>
                    <NumberInputField placeholder="ETH"/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </Box>

                    <Box mt={5} p={5}  borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>SLO: Error Rate</Text>
                    <FormLabel mt={4} >Target</FormLabel>
                    <NumberInput min={0} max={100} precision={1} step={0.1}>
                    <NumberInputField placeholder="%"/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <FormLabel mt={4} >Penalty per Day</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1}>
                    <NumberInputField placeholder="ETH"/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </Box>

                    <Box mt={5} p={5}  borderWidth={1} borderRadius={8} boxShadow="lg">
                    <Text as='b' fontSize='lg'>SLO: Response Time</Text>
                    <FormLabel mt={4} >Target</FormLabel>
                    <NumberInput min={0} max={100} precision={1} step={0.1}>
                    <NumberInputField placeholder="%"/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <FormLabel mt={4} >Penalty per Day</FormLabel>
                    <NumberInput min={0} precision={2} step={0.1}>
                    <NumberInputField placeholder="ETH"/>
                        <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    </Box>


          <FormLabel mt={4}>Choose Cloud Service Picture</FormLabel>
          <Input type="file" id="photoCS" mt={2} onChange={handlePictureChange} borderRadius="md" />
          
          {/* Al posto dell'immagine commentata */}
          {cloudServicePicture && (
            <img className="rounded mt-4" width="350" src={URL.createObjectURL(cloudServicePicture)} alt="Cloud Service" />
          )}
          
          <Button
            onClick={handleRegister}
            mt={4}
            colorScheme="green"
            borderRadius="md"
            size="lg"
            boxShadow="lg"
          >
            Create Cloud Service Badge
          </Button>

            </FormControl>
          </Box>
        </Flex>
      );



}