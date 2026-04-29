import { Button } from '@alien-worlds/uikit'
import { Flex, createIcon } from '@chakra-ui/react'
import { config } from 'shared/util/config'

const QuestionMarkIcon = createIcon({
  displayName: 'QuestionMarkIcon',
  viewBox: '0 0 20 20',

  path: (
    <>
      <g>
        <g>
          <g>
            <path
              d="M11,12.3V13c0,0-1.8,0-2,0v-0.6c0-0.6,0.1-1.4,0.8-2.1c0.7-0.7,1.6-1.2,1.6-2.1c0-0.9-0.7-1.4-1.4-1.4 c-1.3,0-1.4,1.4-1.5,1.7H6.6C6.6,7.1,7.2,5,10,5c2.4,0,3.4,1.6,3.4,3C13.4,10.4,11,10.8,11,12.3z"
              fill="white"
            ></path>
            <circle cx="10" cy="15" r="1" fill="white"></circle>
          </g>
          <path
            fill="white"
            d="M10,2c4.4,0,8,3.6,8,8s-3.6,8-8,8s-8-3.6-8-8S5.6,2,10,2 M10,0C4.5,0,0,4.5,0,10s4.5,10,10,10s10-4.5,10-10S15.5,0,10,0 L10,0z"
          ></path>
        </g>
      </g>
    </>
  ),
})
export const SupportButton = () => {
  return (
    <Flex width="100%" justifyContent="center">
      <Button
        variant="helium"
        fontFamily="Titillium Web"
        fontWeight={700}
        minHeight="45px"
        isActive
        size="sm"
        minWidth="70%"
        leftIcon={<QuestionMarkIcon boxSize="22px" />}
        onClick={() => {
          window.open(config.SupportAlienUrl, '_blank', 'noopener')
        }}
      >
        Support
      </Button>
    </Flex>
  )
}
