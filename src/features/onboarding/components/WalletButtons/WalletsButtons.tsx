import { Flex, Image, Text, Tooltip } from '@chakra-ui/react'
// import anchorLogo from 'assets/images/anchor_wallet_logo.png'
import darkRectangle from 'assets/images/darkRectangle.png'
import rectangle from 'assets/images/rectangle.png'
import wcwLogo from 'assets/images/wcw_wallet_logo.png'
import wombatLogo from 'assets/images/wombat_wallet_logo.png'
import { get } from 'lodash'
import { useActions } from 'store'
export const WalletsButtons = () => {
  const {
    modal: { setPrimaryModalActive },
    main: { loginWaxInit, loginWombatInit },
  } = useActions()

  const isWombatDisabled = get(window, 'wombat.isWombat') === undefined ? true : false

  return (
    <Flex w="full" justifyContent="center" alignItems="center" my={3} gap="15px">
      <Flex
        gap="10px"
        width={{ base: '90px', sm: '100px', md: '135px' }}
        height={{ base: '90px', sm: '100px', md: '135px' }}
        cursor="pointer"
        borderRadius="7px"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
        backgroundRepeat="no-repeat"
        backgroundImage={rectangle}
        _hover={{
          backgroundImage: darkRectangle,
          transform: 'scale(1.02)',
          transition: 'transform 0.1s ease',
        }}
        onClick={async () => {
          setPrimaryModalActive({ modalName: 'LoadingModal', value: true })
          await loginWaxInit()
          setPrimaryModalActive({ modalName: 'LoginModal', value: false })
          setPrimaryModalActive({ modalName: 'SignUpModal', value: false })
          setTimeout(() => {
            setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
          }, 1000)
        }}
      >
        <Image src={wcwLogo} boxSize={{ base: '44px', md: '55px', lg: '64px' }} />
        <Text fontFamily="tlm" fontSize="14px" fontWeight={700}>
          WCW
        </Text>
      </Flex>
      <Tooltip placement="top" label="Add Wombat Extension" isDisabled={!isWombatDisabled}>
        <Flex
          gap="10px"
          width={{ base: '90px', sm: '100px', md: '135px' }}
          height={{ base: '90px', sm: '100px', md: '135px' }}
          cursor={isWombatDisabled ? 'not-allowed' : 'pointer'}
          borderRadius="7px"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          backgroundRepeat="no-repeat"
          opacity={isWombatDisabled ? '0.5' : '1'}
          backgroundImage={rectangle}
          _hover={{
            backgroundImage: darkRectangle,
            transform: 'scale(1.02)',
            transition: 'transform 0.1s ease',
          }}
          onClick={async () => {
            if (!isWombatDisabled) {
              setPrimaryModalActive({ modalName: 'LoadingModal', value: true })
              await loginWombatInit()
              setPrimaryModalActive({ modalName: 'LoginModal', value: false })
              setPrimaryModalActive({ modalName: 'SignUpModal', value: false })
              setTimeout(() => {
                setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
              }, 1000)
            }
          }}
        >
          <Image src={wombatLogo} boxSize={{ base: '44px', md: '55px', lg: '64px' }} />
          <Text fontFamily="tlm" fontSize="14px" fontWeight={700}>
            WOMBAT
          </Text>
        </Flex>
      </Tooltip>
      {/* <Flex
        gap="10px"
        width="135px"
        height="135px"
        cursor="pointer"
        borderRadius="7px"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
        backgroundRepeat="no-repeat"
        backgroundImage={rectangle}
        _hover={{
          backgroundImage: darkRectangle,
          transform: 'scale(1.02)',
          transition: 'transform 0.1s ease',
        }}
        onClick={async () => {
          setPrimaryModalActive({ modalName: 'LoadingModal', value: true })
          await loginAnchorInit()
          setPrimaryModalActive({ modalName: 'LoginModal', value: false })
          setTimeout(() => {
            setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
          }, 1000)
        }}
      >
        <Image src={anchorLogo} width="64px" height="64px" />
        <Text fontFamily="tlm" fontSize="14px" fontWeight={700}>
          ANCHOR
        </Text>
      </Flex> */}
    </Flex>
  )
}
