import {Avatar,Box,Flex,Heading,Link,Text,Image,Button,Stack,Divider} from "@chakra-ui/react";
import { ConnectWallet,useAddress } from "@thirdweb-dev/react";
import NextLink from 'next/link';
import React, { useEffect } from 'react';
const SparqlClient = require('sparql-http-client')
import { SearchIcon, EmailIcon, WarningIcon } from '@chakra-ui/icons'
import { Icon } from '@chakra-ui/react'
import { HiOutlineUserAdd
} from "react-icons/hi";
import { TbLayoutGridAdd
} from "react-icons/tb";




export function Navbar(){


    const address=useAddress();

    const endpointUrl = process.env.NEXT_PUBLIC_SPARQL_ENDPOINT; 
    const updateUrl = process.env.NEXT_PUBLIC_SPARQL_UPDATE; 
    const clientSPARQL = new SparqlClient({ endpointUrl ,updateUrl});
 


    useEffect(() => {
        const checkAndInsertUser = async () => {
          if (address) {

            // Query SPARQL per verificare se l'utente esiste già nel database
            const selectQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
            
            SELECT ?user
            WHERE {
              ?user rdf:type ts:BlockchainAddress.
              ?user ts:hasAddress "${address}".
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
                 // L'utente non esiste nel database, esegui l'inserimento
              const insertQuery = `
              PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX ts: <http://127.0.0.1/ontologies/TenaciousOntology.owl#>
  
              INSERT DATA {
                ts:Address_${address} rdf:type ts:BlockchainAddress.
                ts:Address_${address} ts:hasAddress "${address}".
              }
            `;
  
           
            clientSPARQL.query.update(insertQuery)
                }
              });
              
              stream.on('error', err => {
                console.error(err)
              })
            

          }
        };
    
        checkAndInsertUser();
      }, [address]);
    


  return (
<Box maxW={"1350px"} m={"auto"} py={"10px"}px={"40px"} mt={6}>
<Flex justifyContent={"space-between"}  align={"center"}>
<Stack direction='row' spacing={3} align='center'>
    <Link as={NextLink} href='/' mr={6}>
    <Image
    width='350px'
     objectFit='contain'
    src="https://imageupload.io/ib/4lWENKf8rPeKDSU_1692366943.png"
    alt='logoTenacious'
      />
    </Link>
    
    <Link as={NextLink} href='/search' >
    <Button leftIcon={<SearchIcon />} colorScheme='messenger' variant='outline' size='sm' >
    Search
  </Button>
  </Link>

  <Link as={NextLink} href='/register-cloud-provider' >
    <Button leftIcon={<Icon as={HiOutlineUserAdd} />} colorScheme='messenger' variant='outline' size='sm'>
    Register as Cloud Provider
  </Button>
  </Link>

  <Link  as={NextLink}  href='/create-cloud-service-badge' >
    <Button leftIcon={<Icon as={TbLayoutGridAdd} />} colorScheme='messenger' variant='outline' mr={2} size='sm' >
    Create Cloud Service
  </Button>
  </Link>
     
  <Flex dir={"row"} align={"center"} >
        <ConnectWallet
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID}/>
        { address && (

            
  
        <Link as={NextLink} href={`/profile/${address}`}>
        <Avatar ml={"20px"}/>
        </Link>

            

          )}
          </Flex>


    </Stack>
</Flex>
<Divider mt={4} orientation='horizontal' />
</Box>

    )
              }
