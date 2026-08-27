import { VFC } from 'react'

import { TokensBalances } from 'features/profile/components/TokenBalances/TokenBalances'
import { WalletsBalances } from 'features/profile/components/WalletsBalances/WalletsBalances'
import { Colors } from 'shared/util/colors'

export const ProfileBalances: VFC = () => {
  return (
    <div
      className="flex w-full h-full flex-col flex-wrap justify-center rounded-[25px] pb-9 pt-6 2xl:flex-row"
      style={{ background: Colors.BLACK_SOLID_90 }}
    >
      <WalletsBalances />
      <div
        className="hidden h-auto w-0 self-stretch border-l border-solid 2xl:block"
        style={{ borderColor: Colors.SNOW_WHITE }}
      />
      <TokensBalances />
    </div>
  )
}
