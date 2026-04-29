import { pageTransition } from 'shared/util/animations'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'

import { useState } from 'react'

import { NFTOldIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { get } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const BalanceUserPointsDrawer = () => {
  const {
    wax: { isLoggedIn, isAuthenticating, walletId },
  } = useAppState()

  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)

  const navigate = useNavigate()

  const [hoverNFTPoints, setHoverNFTPoints] = useState<boolean>(false)

  if (!isLoggedIn || isAuthenticating || loading) {
    return <LoadingSpinner />
  }

  return (
    <motion.div {...pageTransition}>
      <Flex
        h="40px"
        w="100%"
        color={Colors.RADICAL_RED}
        onMouseEnter={() => setHoverNFTPoints(true)}
        onMouseLeave={() => setHoverNFTPoints(false)}
      >
        {!hoverNFTPoints ? (
          <>
            <Box
              w="30px"
              h="30px"
              mt="5px"
              pl="1px"
              ml="-2px"
              mr="10px"
              position="relative"
              borderRadius="100%"
              border="2px solid"
              borderColor={Colors.SNOW_WHITE}
            >
              <NFTOldIcon boxSize="25px" color={Colors.DI_SERRIA} />
            </Box>
            <Flex direction="column">
              <Text
                fontFamily="tlm"
                fontWeight="bold"
                fontSize="smaller"
                letterSpacing="0.1em"
                color={Colors.DI_SERRIA}
              >
                Shards
              </Text>
              <Text fontSize="18px" lineHeight={1} fontFamily="orb" color={Colors.SNOW_WHITE}>
                {formatUserPointsWithDecimal(
                  get(walletDetails, 'userpoints_details.redeemable_points', 0)
                )}
              </Text>
            </Flex>
          </>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              navigate(PagePath.Outpost)
            }}
          >
            Exchange Shards
          </Button>
        )}
      </Flex>
    </motion.div>
  )
}

export { BalanceUserPointsDrawer }
