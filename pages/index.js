import { ConnectWallet } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import NextLink from 'next/link'
import { Button, Container, Flex, Heading, Image, Stack } from '@chakra-ui/react';


export default function Home() {
  return (
    <Container maxW={"1200px"}>
      <Flex h={"80vh"} alignItems={"center"} justifyContent={"center"}>
        <Stack spacing={4} align={"center"}>
          <Heading>Marketplace</Heading>
          <Button
             as={NextLink} href='/buy'
          >Shop NFTs</Button>
        </Stack>
      </Flex>
    </Container>
  );
}
