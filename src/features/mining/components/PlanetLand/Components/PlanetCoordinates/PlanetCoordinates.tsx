import { useState, useEffect, useMemo, useCallback } from 'react'

import { FilterNormalIcon } from '@alien-worlds/icons'
import { Button, FormField } from '@alien-worlds/uikit'
import { Flex, Text, Box, HStack, Hide } from '@chakra-ui/react'
import { Formik } from 'formik'
import { debounce } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'

interface Props {
  setFilterbarIsOpen: (isOpen: boolean) => void
  filterbarIsOpen: boolean
}

const PlanetCoordinates = ({ setFilterbarIsOpen, filterbarIsOpen }: Props) => {
  const {
    atomic: { setLandAssetsFilter, resetLandAssetsFilter },
  } = useActions()
  const {
    atomic: { landAssetsFilter },
  } = useAppState()

  const [isInputXFocused, setIsInputXFocused] = useState<boolean>(false)
  const [isInputYFocused, setIsInputYFocused] = useState<boolean>(false)
  const [localX, setLocalX] = useState<string>('')
  const [localY, setLocalY] = useState<string>('')
  const { isNotDesktop } = useScreenSize()

  // Sync local state with store state when store changes externally (e.g., reset)
  useEffect(() => {
    setLocalX(landAssetsFilter?.x?.toString() ?? '')
    setLocalY(landAssetsFilter?.y?.toString() ?? '')
  }, [landAssetsFilter?.x, landAssetsFilter?.y])

  // Create debounced function with useMemo to avoid recreating on every render
  const setLandAssetsFilterDebounced = useMemo(
    () => debounce(setLandAssetsFilter, 300),
    [setLandAssetsFilter]
  )

  // Handle X coordinate change
  const handleXChange = useCallback(
    (value: string) => {
      setLocalX(value)
      if (landAssetsFilter) {
        setLandAssetsFilterDebounced({
          ...landAssetsFilter,
          x: value ? parseInt(value, 10) : null,
        })
      }
    },
    [landAssetsFilter, setLandAssetsFilterDebounced]
  )

  // Handle Y coordinate change
  const handleYChange = useCallback(
    (value: string) => {
      setLocalY(value)
      if (landAssetsFilter) {
        setLandAssetsFilterDebounced({
          ...landAssetsFilter,
          y: value ? parseInt(value, 10) : null,
        })
      }
    },
    [landAssetsFilter, setLandAssetsFilterDebounced]
  )
  return (
    <Flex gap={2} align="center" width={{ base: '100%', md: 'max-content' }}>
      <Formik
        initialValues={{
          num1: '',
          num2: '',
        }}
        onSubmit={() => {
          resetLandAssetsFilter()
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              flexWrap="wrap"
              justifyContent="center"
              w={{ base: 'full', md: 'auto' }}
            >
              <Flex direction="row" justifyContent="flex-start" alignItems="center">
                <Text fontFamily="Titillium Web" fontSize="18px" fontWeight={400} mr="10px">
                  Coordinates
                </Text>
                <FormField
                  size="md"
                  name="num1"
                  minWidth="50px"
                  type="number"
                  width={isNotDesktop ? '100%' : '50px'}
                  height="50px"
                  borderWidth="1px"
                  paddingInline={0}
                  borderRadius="8px"
                  textAlign="center"
                  color={Colors.SNOW_WHITE}
                  fontFamily="Titillium Web"
                  borderColor={Colors.MID_GRAY}
                  backgroundColor={Colors.BLACK_ALPHA_50}
                  placeholder={isInputXFocused ? '' : '00'}
                  value={localX}
                  onFocus={() => setIsInputXFocused(true)}
                  onBlur={() => setIsInputXFocused(false)}
                  onChange={({ target: { value } }) => handleXChange(value)}
                />
                <Text fontSize="xl" fontWeight="bold" paddingInline="7px">
                  :
                </Text>
                <FormField
                  size="md"
                  name="num2"
                  minWidth="50px"
                  width={isNotDesktop ? '100%' : '50px'}
                  height="50px"
                  borderWidth="1px"
                  paddingInline={0}
                  borderRadius="8px"
                  textAlign="center"
                  color={Colors.SNOW_WHITE}
                  fontFamily="Titillium Web"
                  borderColor={Colors.MID_GRAY}
                  backgroundColor={Colors.BLACK_ALPHA_50}
                  placeholder={isInputYFocused ? '' : '00'}
                  value={localY}
                  onFocus={() => setIsInputYFocused(true)}
                  onBlur={() => setIsInputYFocused(false)}
                  onChange={({ target: { value } }) => handleYChange(value)}
                />
              </Flex>
              <Flex
                p={2}
                alignItems="center"
                justifyContent="flex-start"
                ml={{ base: 0, sm: '10px', md: '20px' }}
                paddingBlock={{ base: '30px', md: '0px' }}
              >
                <Flex
                  mt={{ base: 1, sm: 1 }}
                  justifyContent={{ base: 'space-between' }}
                  width="100%"
                >
                  <Button
                    size="lg"
                    type="submit"
                    fontSize={16}
                    height={isNotDesktop ? '40px' : '48px'}
                    variant="negative"
                    borderRadius="15px"
                  >
                    Reset Filters
                  </Button>
                  <Hide above="md">
                    <HStack
                      zIndex={1400}
                      cursor="pointer"
                      alignItems="center"
                      flexDirection="row"
                      justifyContent={{ base: 'center', md: 'flex-end' }}
                      onClick={() => setFilterbarIsOpen(!filterbarIsOpen)}
                    >
                      <Text
                        fontFamily="tlm"
                        letterSpacing="0.1em"
                        whiteSpace="nowrap"
                        fontWeight={400}
                        fontSize={18}
                        filter="invert(0.2)"
                        color={filterbarIsOpen ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
                      >
                        Filters
                      </Text>
                      <Box filter="invert(0.2)" pl="10px">
                        <FilterNormalIcon
                          width="35px"
                          height="35px"
                          color={filterbarIsOpen ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
                        />
                      </Box>
                    </HStack>
                  </Hide>
                </Flex>
              </Flex>
            </Flex>
          </form>
        )}
      </Formik>
    </Flex>
  )
}

export { PlanetCoordinates }
