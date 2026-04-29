import { useState } from 'react'

import { ShardsIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Text, HStack } from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { get } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const BalanceUserPointsTop = () => {
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
      {walletDetails && (
        <Flex
          h="60px"
          flexDirection="row"
          alignItems="center"
          onMouseEnter={() => setHoverNFTPoints(true)}
          onMouseLeave={() => setHoverNFTPoints(false)}
        >
          {!hoverNFTPoints ? (
            <HStack width="250px">
              <Flex alignItems="center" justifyContent="center" h="30px">
                <ShardsIcon boxSize="35px" color={Colors.DI_SERRIA} />
              </Flex>

              <Flex direction="column" alignItems="start">
                <Text
                  mb="-3px"
                  ml="5px"
                  fontSize={12}
                  fontFamily="tlm"
                  fontWeight={700}
                  textAlign="center"
                  color={Colors.DI_SERRIA}
                >
                  Shards
                </Text>
                <Text
                  ml="5px"
                  fontSize={20}
                  fontWeight={400}
                  fontFamily="orb"
                  textAlign="center"
                  letterSpacing="0.1em"
                  color={Colors.SNOW_WHITE}
                >
                  {formatUserPointsWithDecimal(
                    get(walletDetails, 'userpoints_details.redeemable_points', 0)
                  )}
                </Text>
              </Flex>
            </HStack>
          ) : (
            <HStack width="250px">
              <Button
                size="lg"
                fontSize={15}
                variant="primary"
                height="40px !important"
                width="fit-content"
                onClick={() => {
                  navigate(PagePath.Outpost)
                }}
              >
                Exchange Shards
              </Button>
            </HStack>
          )}
        </Flex>
      )}
    </motion.div>
  )
}

export { BalanceUserPointsTop }
