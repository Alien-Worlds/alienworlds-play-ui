import { useState } from 'react'

import { PlanetIcon, PlanetIcon2 } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Text, Image, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react'
import { DaoSelect } from 'features/syndicates/components/DaoSelect'
import { getPlanetImages } from 'features/syndicates/utils/GovernanceHelper'
import { generatePath, useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { unionDAOFinder } from 'shared/util/helpers'
import { useActions } from 'store'
import { PagePath } from 'store/main/types'

export const SyndicatesView = () => {
  const [selectedDao, setSelectedDao] = useState<string>('eyeke')
  const planetImagesSydicate = getPlanetImages(selectedDao)
  const buttonSize = useBreakpointValue({
    base: '148px',
    sm: '100%',
    md: '100%',
    lg: '100%',
    xl: '100%',
  })
  const buttonHeight = useBreakpointValue({
    base: '40px',
    sm: '48px',
  })
  const {
    main: { toggleMainDrawer },
    wax: { getDAOInfo, setSelectedDacId },
  } = useActions()
  const navigate = useNavigate()
  return (
    <Flex width="100%" flexDirection="column" alignItems="center" gap={2}>
      <DaoSelect onChange={setSelectedDao} />
      <Text color={Colors.SILVER} fontFamily="tlm" fontSize="14px" py="4px" fontWeight={400}>
        Select the type of DAO you wish to explore
      </Text>
      <Flex gap={2}>
        <Image
          position="relative"
          borderRadius="20px"
          minWidth="148px"
          // Ensure image takes up full height of parent
          objectFit="cover" // Scale image to fit container, maintaining aspect ratio
          src={`/images/bg/${planetImagesSydicate.candidates}`}
          alt=""
        />
        <Image
          position="relative"
          borderRadius="20px"
          minWidth="148px"
          // Ensure image takes up full height of parent
          objectFit="cover" // Scale image to fit container, maintaining aspect ratio
          src={`/images/bg/${planetImagesSydicate.select}`}
          alt=""
        />
      </Flex>
      <Grid gap={2} gridTemplateColumns="repeat(2,1fr)" width="100%">
        <GridItem width="100%">
          <Button
            variant="secondary"
            size="lg"
            fontSize={16}
            fontWeight={900}
            height={buttonHeight}
            minWidth={buttonSize}
            maxWidth={buttonSize}
            width={buttonSize}
            leftIcon={<PlanetIcon2 boxSize="20px" />}
            onClick={() => {
              const path = generatePath(PagePath.GovernanceDetails, {
                planetId: unionDAOFinder(selectedDao),
              })
              toggleMainDrawer()
              setSelectedDacId(unionDAOFinder(selectedDao))
              getDAOInfo(unionDAOFinder(selectedDao))
              navigate(path)
            }}
          >
            {' '}
            Union
          </Button>
        </GridItem>
        <GridItem>
          <Button
            variant="warning"
            size="lg"
            fontSize={16}
            fontWeight={900}
            height={buttonHeight}
            minWidth={buttonSize}
            maxWidth={buttonSize}
            width={buttonSize}
            leftIcon={<PlanetIcon boxSize="20px" />}
            onClick={() => {
              const path = generatePath(PagePath.GovernanceDetails, {
                planetId: selectedDao,
              })
              toggleMainDrawer()
              setSelectedDacId(selectedDao)
              getDAOInfo(selectedDao)
              navigate(path)
            }}
          >
            {' '}
            Syndicate
          </Button>
        </GridItem>
      </Grid>
    </Flex>
  )
}
