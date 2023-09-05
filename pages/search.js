import  SearchBar  from "../components/SearchBar"
import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import NextLink from 'next/link'
import { Button, Container, Flex, Heading, Image, Stack,Text,Box } from '@chakra-ui/react';
import Hero from "../components/sections/Hero";



export default function SearchPage() {
  return (
    <Container maxW={"1200px"}>
      <Flex alignItems={"center"} justifyContent={"center"}>
      <Box w="100%" p={4} >
      <Heading mt={4} size='lg' >Create new Cloud Service</Heading>
      <Text mt={1} size='md' color='grey' >Create a new cloud service NFT Badge to store in the blockchain and an entity to store in the RDF Triplestore </Text>

        <SearchBar />
      
      </Box>
      </Flex>
    </Container>
  );
}
