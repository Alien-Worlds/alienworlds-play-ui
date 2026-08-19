import { BalanceIcon, CopyIcon, Outpost2Icon, Profile3Icon } from '@alien-worlds/icons'
import { Button, useBreakpointValue } from '@alien-worlds/uikit'
import { useNavigate } from 'react-router-dom'
import { useCopyToClipboard } from 'react-use'
import { Tag } from 'shared/components/topbar/Tag'
import { useActivePath } from 'shared/hooks/useRouter'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import { toastMessage } from 'store/main/actions'
import { PagePath } from 'store/main/types'

import { Constants } from '../../../../shared/util/constants'

export const ProfileBtn = () => {
  const navigate = useNavigate()
  const isProfileInfoPage = useActivePath([PagePath.ProfileInfo])
  const currentBreakpointButtonWidth = useBreakpointValue({ base: '100%', xl: '47%' })
  return (
    <Button
      size="lg"
      minWidth="31%"
      fontSize={16}
      variant="info"
      fontWeight={600}
      justifyContent="center"
      width={currentBreakpointButtonWidth}
      leftIcon={<Profile3Icon boxSize={30} />}
      isActive={isProfileInfoPage}
      onClick={() => {
        navigate(PagePath.ProfileInfo)
      }}
    >
      Profile
    </Button>
  )
}

export const BalancesBtn = () => {
  const navigate = useNavigate()
  const isProfileBalancePage = useActivePath([PagePath.ProfileBalances])
  const currentBreakpointButtonWidth = useBreakpointValue({ base: '100%', xl: '47%' })
  return (
    <Button
      size="lg"
      minWidth="31%"
      variant="info"
      fontSize={16}
      fontWeight={600}
      justifyContent="center"
      width={currentBreakpointButtonWidth}
      leftIcon={<BalanceIcon boxSize={24} />}
      isActive={isProfileBalancePage}
      onClick={() => {
        navigate(PagePath.ProfileBalances)
      }}
    >
      Balances
    </Button>
  )
}
export const OutpostBtn = () => {
  const navigate = useNavigate()
  const isOutpostPage = useActivePath([PagePath.Outpost])
  const currentBreakpointButtonWidth = useBreakpointValue({ base: '100%', xl: '31%' })
  return (
    <Button
      size="lg"
      minWidth="31%"
      fontSize={16}
      variant="info"
      fontWeight={600}
      justifyContent="center"
      width={currentBreakpointButtonWidth}
      leftIcon={<Outpost2Icon boxSize={30} />}
      isActive={isOutpostPage}
      onClick={() => {
        navigate(PagePath.Outpost)
      }}
    >
      Outpost
    </Button>
  )
}

export const TagWithWalletBtn = () => {
  const {
    wax: { walletId, isDemoUser },
  } = useAppState()
  const [, copyToClipboard] = useCopyToClipboard()
  return (
    <div className="-mr-[10px] flex w-full flex-col items-center gap-[20px] pb-[20px] pl-[10px] pt-0 md:w-auto md:gap-[5px] md:pb-[30px] md:pt-[5px] xl:items-start">
      <Tag fontSize="36px" width="250px" textAlign={{ base: 'center', xl: 'start' }} />
      <div className="flex content-center gap-[10px] xl:content-start">
        <p
          className="mt-0 font-tlm text-[16px] font-normal leading-[0.3] md:mt-[15px]"
          style={{ color: Colors.DI_SERRIA }}
        >
          {isDemoUser ? Constants.DEMO_ACCOUNT_TAG : walletId}
        </p>
        <div className="-mt-[10px] flex md:mt-[5px]">
          <CopyIcon
            boxSize="25px"
            cursor="pointer"
            color={Colors.TRANSPARENT}
            onClick={() => {
              copyToClipboard(isDemoUser ? Constants.DEMO_ACCOUNT_TAG : walletId)
              toastMessage('Wallet ID copied to Clipboard!')
            }}
          />
        </div>
      </div>
    </div>
  )
}
