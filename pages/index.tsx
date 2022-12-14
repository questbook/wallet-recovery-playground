import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Wallet } from 'ethers'
import { Box, Button, ButtonGroup, Flex, Heading, useColorMode } from '@chakra-ui/react'
import { GoogleRecoveryWeb, GoogleRecoveryMechanismOptions } from '../src/recovery'

const GOOGLE_CLEINT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const ZERO_WALLET_FOLDER_NAME = ".zero-wallet";
const ZERO_WALLET_FILE_NAME = "key";

const googleRecoveryMechanismOptions: GoogleRecoveryMechanismOptions = {
  googleClientId: GOOGLE_CLEINT_ID,
  folderNameGD: ZERO_WALLET_FOLDER_NAME,
  fileNameGD: ZERO_WALLET_FILE_NAME,
  allowMultiKeys: true,
  handleExistingKey: 'Overwrite'
}

const Home: NextPage = () => {
  // const recoveryMechanism = new GoogleDriveWalletRecovery(googleRecoveryMechanismOptions)
  // google user
  // const { loading, importWalletFromGD, exportWalletToGD, inited } = GoogleDriveWalletRecovery({ googleClientID: GOOGLE_CLEINT_ID })
  const [inited, setInited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [recoveryMechanism, setRecoveryMechanism] = React.useState<GoogleRecoveryWeb>()

  // wallets
  const [wallet, setWallet] = React.useState<Wallet | null>(null)

  // ui
  const { setColorMode } = useColorMode()

  const handleCreateNewWallet = () => {
    const newWallet = Wallet.createRandom()
    setWallet(newWallet)
  }

  const handleGDExport = async () => {
    if (loading) throw Error("Loading import or export");
    if (!recoveryMechanism) throw new Error("Recovery is not defined.")
    setLoading(true);

    try {
      if (!wallet) throw Error("You have no wallet")
      await recoveryMechanism.setupRecovery(wallet)
      console.log("Export successful")
    }
    catch (err) {
      let errorMessage = 'unknown';
      if (typeof err === "string") {
        errorMessage = err.toUpperCase()
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      console.log("Export Error Message:", errorMessage)
    }
    setLoading(false);
  }

  const handleGDImport = async () => {
    if (loading) throw Error("Loading import or export");
    if (!recoveryMechanism) throw new Error("Recovery is not defined.")
    setLoading(true);

    try {
      const newWallet = await recoveryMechanism.initiateRecovery(3)
      setWallet(newWallet!)
      console.log("Import successful")
    }
    catch (err) {
      let errorMessage = 'unknown';
      if (typeof err === "string") {
        errorMessage = err.toUpperCase()
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      console.log("Import Error Message:", errorMessage)
    }
    setLoading(false);
  }

  React.useEffect(() => {
    recoveryMechanism?.recoveryReadyPromise().then(() => {
      setInited(true);
    })
  }, [recoveryMechanism])

  React.useEffect(() => {
    setColorMode('dark')
    const newRecoveryMechanism = new GoogleRecoveryWeb(googleRecoveryMechanismOptions)
    setRecoveryMechanism(newRecoveryMechanism)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box p='10' backgroundColor='black' width={'100vw'} height={'100vh'}>
      <Head>
        <title>Google Drive Wallet Auth</title>
        <meta name="description" content="Google drive wallet recovery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex flexDir='column' textAlign='center' alignItems='center'>

        {wallet ?
          <Heading >
            Your address is {wallet.address}
          </Heading> :

          <Heading>
            You don&apos;t have a wallet yet
          </Heading>
        }

        <ButtonGroup mt='10' gap='10' visibility={inited ? 'visible' : 'hidden'}>

          <Button onClick={handleCreateNewWallet} isLoading={loading} p='10'>
            Create new Wallet
          </Button>

          <Button onClick={handleGDExport} disabled={!wallet} isLoading={loading} p='10'>
            Export to Google Drive
          </Button>

          <Button onClick={handleGDImport} isLoading={loading} p='10'>
            Import from Google Drive
          </Button>
        </ButtonGroup>
        <ButtonGroup m={50} backgroundColor='black'>
        </ButtonGroup>
      </Flex>
    </Box>
  )
}

export default Home
