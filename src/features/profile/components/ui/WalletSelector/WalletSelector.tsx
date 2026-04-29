/**
 * WalletSelector Component
 *
 * A component that displays wallet selection options and current wallet status.
 * This component handles wallet switching and display logic.
 */

import React from 'react'

import { Flex, Image, Text } from '@chakra-ui/react'
import wcwLogo from 'assets/images/wcw_wallet_logo.png'
import wombatLogo from 'assets/images/wombat_wallet_logo.png'
import { Colors } from 'shared/util/colors'

interface WalletSelectorProps {
  className?: string
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({ className }) => {
  const currentWallet: string = localStorage.getItem('aw_currentWallet') || 'wax'

  const wallets = [
    {
      id: 'wax',
      name: 'WCW',
      logo: wcwLogo,
    },
    {
      id: 'wombat',
      name: 'WOMBAT',
      logo: wombatLogo,
    },
  ]

  return (
    <Flex gap={2} justifyContent="center" className={className}>
      {wallets.map((wallet) => (
        <Flex
          key={wallet.id}
          bg={
            currentWallet === wallet.id
              ? 'linear-gradient(180deg, #FFC600 41.67%, #EE7000 49.48%)'
              : 'none'
          }
          p="2px"
          borderRadius="12px"
          display="inline-flex"
        >
          <Flex
            align="center"
            p="8px"
            minW="148px"
            height="68px"
            bg="#100F10"
            borderRadius="10px"
            color="white"
            gap={4}
            position="relative"
          >
            <Flex ml="8px">
              <Image src={wallet.logo} boxSize="32px" alt={wallet.name} />
            </Flex>
            <Text fontSize="14px" fontWeight={700} fontFamily="tlm" color={Colors.SNOW_WHITE}>
              {wallet.name}
            </Text>
            {currentWallet === wallet.id && (
              <Flex
                borderRadius="100%"
                boxSize="12px"
                backgroundColor={Colors.DI_SERRIA}
                position="absolute"
                top="8px"
                right="8px"
              />
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
