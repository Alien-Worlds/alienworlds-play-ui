import { VFC } from 'react'

import { Box, Link, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
// import { TooltipLocations } from 'components/glossary/glossaryConst'
// import { GlossaryInfoIcon } from 'components/glossary/GlossaryInfoIcon'
import { config } from 'shared/util/config'

export const LandDescription: VFC<{ title: string }> = ({ title }) => {
  return (
    <Box w="full" textAlign="start" px={{ base: '0px', lg: '0px' }}>
      <Text
        as="h2"
        fontFamily="orb"
        fontSize={{ base: 'md', md: '3xl' }}
        color={Colors.SNOW_WHITE}
        fontWeight={{ base: 'bold', md: 'normal' }}
        mb="7px"
      >
        Choose Land to Mine on {title}
        {/* @TODO: add Lands Glossary link */}
        {/* <GlossaryInfoIcon
          ml={5}
          width={0}
          height={0}
          color={Colors.SNOW_WHITE}
          glossaryId={TooltipLocations.MINING_LAND_STATS_MINING_POWER}
        /> */}
      </Text>
      <Text fontFamily="Titillium Web" fontWeight="thin" color="#e0e0e0">
        Land is a series of NFTs in Alien Worlds which represent parcels of land on the Planets in
        Alien Worlds. If you own Land, you can either mine it yourself or charge people who mine on
        your Land commission.{' '}
        <Link
          href={`${config.ZendeskUrl}/hc/en-us/articles/1500007811082-What-is-land-`}
          target="_blank"
          color={Colors.DARK_YELLOW}
        >
          Read more
        </Link>
        .
      </Text>
    </Box>
  )
}
