import  SearchBar  from "../components/SearchBar"
import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import NextLink from 'next/link'
import { Button, Container, Flex, Heading, Image, Stack } from '@chakra-ui/react';
import Hero from "../components/sections/Hero";



export default function SearchPage() {
  return (
    <Container maxW={"1200px"}>
      <Flex h={"85vh"} alignItems={"center"} justifyContent={"center"}>
        <SearchBar/>
      
  
      </Flex>
    </Container>
  );
}
