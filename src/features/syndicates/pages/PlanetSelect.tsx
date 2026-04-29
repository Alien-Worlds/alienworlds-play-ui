import { memo, useEffect, useMemo, useState } from 'react'

import { CandiateIcon, CitizenIcon, CustodianIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { AnimatePresence, motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoDetailsResponse } from 'graphql/types'
import { forEach, split, startCase, get } from 'lodash'
import { generatePath, useNavigate } from 'react-router-dom'
import Carousel from 'react-spring-3d-carousel'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState, useActions } from 'store'
import { PagePath } from 'store/main/types'
import { DACUserStatusType } from 'store/wax/types'
import { v4 as uuidv4 } from 'uuid'
export type CarouselSlideType = {
  key: number
  content: JSX.Element
}

export const PlanetSelect = memo(() => {
  const { isMobile } = useScreenSize()
  const {
    main: { showGovernancePage },

    wax: { setSelectedDacId, setIsSyndicatesSidebarOpen },
  } = useActions()
  const [currentSlide, setCurrentSlide] = useState(0)
  const {
    wax: { walletId, selectedDacId },
  } = useAppState()
  const { isDesktop } = useScreenSize()

  const memoizedSelectedDacId = useMemo(() => selectedDacId, [selectedDacId])

  const {
    daoDetails,
    loading: daoDetailsLoading,
    refetch: refetchDaoDetails,
  }: { daoDetails: DaoDetailsResponse; loading: boolean; refetch: () => void } = useDaoDetails(
    memoizedSelectedDacId
  )
  const { walletDaoDetails, loading: walletDaoDetailsLoading } = useWalletDaoDetails({
    dacId: memoizedSelectedDacId,
    walletId,
  })

  const userStatus = startCase(get(walletDaoDetails, 'user_status', 'Explorer'))
  const navigate = useNavigate()
  useEffect(() => {
    setSelectedDacId('naron')
    showGovernancePage()
    setIsSyndicatesSidebarOpen(false)
  }, [])

  const slides: CarouselSlideType[] = []

  forEach(split(config.ActivePlanetIds, ','), (id, i) =>
    slides.push({
      key: i,
      content: (
        <Flex key={uuidv4()} alignItems="center" flexDirection="column">
          <PlanetImage
            w={{ base: '185px', sm: '200px', lg: '300px' }}
            h={{ base: '185px', sm: '200px', lg: '300px' }}
            dacId={id}
            interactive
            css={{
              WebkitTapHighlightColor: Colors.TRANSPARENT,
            }}
            titleDisplay="none"
            onClick={() => {
              setCurrentSlide(i)
              setSelectedDacId(id)
            }}
          />
        </Flex>
      ),
    })
  )

  return (
    <motion.div {...pageTransition}>
      <Box pt={6}>
        <GlossaryInfoIcon
          width={20}
          height={20}
          color={Colors.SNOW_WHITE}
          glossaryId={TooltipLocations.GOVERNANCE_PLANET_DETAILS}
        />
      </Box>

      <Flex
        w="100%"
        pt="75px"
        h="100%"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Flex
          w={{ base: '90%', lg: '100%' }}
          mb="130px"
          alignItems="center"
          flexDirection="column"
          mt={{ base: '10px', lg: '100px' }}
        >
          {slides && slides?.length > 0 && (
            <Carousel
              slides={slides}
              showNavigation={false}
              goToSlide={currentSlide}
              offsetRadius={isDesktop ? 4 : 3}
              animationConfig={{ friction: 60, tension: 200 }}
            />
          )}
          {(userStatus === DACUserStatusType.MEMBER ||
            userStatus === DACUserStatusType.CANDIDATE ||
            userStatus === DACUserStatusType.CUSTODIAN) &&
            !walletDaoDetailsLoading && (
              <Box
                bg="black"
                zIndex={1200}
                position="absolute"
                textAlign="center"
                display="flex"
                alignContent="center"
                alignItems="center"
                justifyContent="center"
                borderRadius="50px"
                border="2px solid white"
                h={{ base: '65px', md: '65px', lg: '75px' }}
                w={{ base: '65px', md: '65px', lg: '75px' }}
                mt={{ base: '40px', md: '55px', lg: '100px' }}
              >
                <Box marginTop="5px">
                  {userStatus === DACUserStatusType.MEMBER && (
                    <CitizenIcon boxSize="52px" color={Colors.DI_SERRIA} />
                  )}
                  {userStatus === DACUserStatusType.CANDIDATE && (
                    <CandiateIcon boxSize="52px" color={Colors.DI_SERRIA} />
                  )}
                  {userStatus === DACUserStatusType.CUSTODIAN && (
                    <CustodianIcon boxSize="52px" color={Colors.DI_SERRIA} />
                  )}
                </Box>
              </Box>
            )}
        </Flex>

        {!daoDetailsLoading && (
          <>
            <Flex mt={{ base: 0, lg: '65px' }} flexDirection="column" w="100%">
              <Box minH={8}>
                <AnimatePresence mode="sync">
                  <motion.div
                    {...{
                      transition: { duration: 0.1 },
                      animate: { y: 0, opacity: 1, x: 0 },
                      initial: { y: -50, opacity: 0.1, x: 0 },
                      exit: {
                        x: 0,
                        y: 20,
                        opacity: 0,
                        transition: { duration: 0.05 },
                      },
                    }}
                  >
                    <Heading
                      mb={6}
                      as="h6"
                      color="white"
                      fontSize={{ base: '30px', md: '40px' }}
                      fontWeight={400}
                      textAlign="center"
                      letterSpacing="0.05em"
                      fontFamily="Titillium Web"
                      textTransform="capitalize"
                    >
                      {convertPlanetIdToName(memoizedSelectedDacId)}
                      <br />
                    </Heading>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Flex>
            <Flex width={{ base: '100%', lg: '50%' }} px="18px">
              <Text fontSize={{ base: '14px', lg: '18px' }} textAlign="justify">
                {daoDetails?.refs?.description}
              </Text>
            </Flex>
            <Flex
              mt={5}
              justifyContent="center"
              wrap="wrap"
              width={{ base: '100%', sm: '75%', md: '50%', lg: 'max-content' }}
            >
              <Box margin="10px" flex="1 0 auto">
                <Button
                  size="lg"
                  width="100%"
                  height={isMobile ? '40px' : '48px'}
                  variant="primary"
                  fontSize={isMobile ? 16 : 25}
                  onClick={() => {
                    if (daoDetails) {
                      const path = generatePath(PagePath.DAOSelect, {
                        planetId: memoizedSelectedDacId,
                      })
                      navigate(path)
                    } else {
                      refetchDaoDetails()
                    }
                  }}
                >
                  {daoDetails ? 'Explore' : 'Refresh'}
                </Button>
              </Box>
            </Flex>
          </>
        )}
      </Flex>
    </motion.div>
  )
})
