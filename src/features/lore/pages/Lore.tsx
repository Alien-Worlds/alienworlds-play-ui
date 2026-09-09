import { useEffect, useState } from 'react'

import { Button, useBreakpointValue } from '@alien-worlds/uikit'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Dashboard } from 'features/lore/components/Dashboard'
import { LoreSelect } from 'features/lore/components/LoreSelect/LoreSelect'
import { StakeLore } from 'features/lore/components/StakeLore/StakeLore'
import { LoreDataProvider, useLoreLoadingState } from 'features/lore/data/LoreDataProvider'
import { useLiveVotePower } from 'features/lore/hooks/useLiveVotePower'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { map } from 'lodash'
import ScrollContainer from 'react-indiana-drag-scroll'
import { useModalStore } from 'shared/store/modalStore'
import { Colors } from 'shared/util/colors'
import { sanitizedHtmlString } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'

const TabsOptions = ['Lore', 'Dashboard', 'Stake']

const LoreContent = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const screenSize = useScreenSize()
  const currentBreakPointValue =
    useBreakpointValue<'horizontal' | 'vertical'>({
      base: 'vertical',
      md: 'horizontal',
    }) ?? 'vertical'
  const {
    main: { getLorePullRequests },
  } = useActions()
  const {
    main: { loreReadMe, currentWallet },
    wax: { isDemoUser },
  } = useAppState()
  const setSecondaryModalActive = useModalStore((state) => state.setSecondaryModalActive)
  const setPrimaryModalActive = useModalStore((state) => state.setPrimaryModalActive)
  const [loreContent, setLoreContent] = useState('')
  const { isDesktop, isTablet } = screenSize
  const { loadingLores, walletDetailsLoading } = useLoreLoadingState()
  const { currentVotePower } = useLiveVotePower()

  useEffect(() => {
    setLoreContent(loreReadMe)
  }, [loreReadMe, currentWallet])

  if (loadingLores || walletDetailsLoading) {
    return <LoadingSpinner />
  }

  const isMobile = !isDesktop && !isTablet
  const submitButtonWrapperClass = [
    tabIndex < 2 && isMobile ? 'fixed' : 'relative',
    tabIndex > 1 && isMobile ? 'hidden' : 'flex',
    isDesktop || isTablet ? 'bottom-0' : 'bottom-5',
    'z-[1000]',
    isMobile ? 'w-full' : 'w-auto',
    'px-8',
  ].join(' ')

  return (
    <div className="flex flex-col gap-3 px-[18px] md:px-3">
      <div className="flex items-center gap-3 md:gap-4">
        <div
          className="flex size-8 items-center justify-center rounded-full"
          style={{ backgroundColor: Colors.SNOW_WHITE }}
        >
          <svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="white" />
            <path
              d="M9.54258 7.66666C9.18218 7.75279 8.83041 7.85738 8.53224 8.08126C7.98697 8.4904 7.68628 9.02293 7.67656 9.68364C7.66865 10.2182 7.64707 10.7586 7.71505 11.2867C7.8377 12.242 8.7538 12.98 9.76738 12.9964C10.2648 13.0043 10.7626 13.0019 11.26 12.9974C11.6798 12.9937 11.9859 12.7035 11.9877 12.3039C11.9913 11.4265 11.9941 10.5494 11.9837 9.67202C11.9812 9.46454 11.9269 9.25741 11.8942 9.03387C11.9524 9.03387 12.0164 9.03387 12.0805 9.03387C15.132 9.03387 18.1835 9.03387 21.2346 9.03387C21.7821 9.03387 22.0605 9.30048 22.0605 9.82412C22.0605 14.2221 22.0605 18.6198 22.0605 23.0177C22.0605 23.5298 21.7785 23.7994 21.2433 23.7994C18.186 23.7994 15.1284 23.7994 12.0711 23.7994H11.8841C12.0733 23.0406 11.9801 22.2818 11.9844 21.5288C11.9974 19.4042 12.0019 17.2916 12.0001 15.1667C12.026 15.2583 12.0002 15.2015 12.0001 15.1667C12.0001 15.1667 11.5733 15.1791 11.4167 15.1667C11.1566 15.1791 10.5833 15.1667 10.5833 15.1667C10.5833 15.1096 10.5801 15.2234 10.5833 15.1667C10.5833 16.6422 10.5504 18.1399 10.5504 19.6154V19.8345C10.3152 19.8345 10.095 19.8342 9.87492 19.8345C8.62468 19.8379 7.67441 20.7348 7.67405 21.9192C7.67405 22.4141 7.64348 22.9145 7.70678 23.4033C7.82259 24.3012 8.51462 24.9578 9.44546 25.1335C9.47891 25.14 9.51057 25.1554 9.5433 25.1667H21.6285C21.667 25.1547 21.7047 25.139 21.744 25.1311C22.755 24.9359 23.4956 24.1125 23.4967 23.15C23.501 18.6611 23.5017 14.1722 23.4952 9.68364C23.4942 9.02977 23.1902 8.50134 22.6529 8.09254C22.3507 7.86251 21.9936 7.75723 21.6285 7.66666H9.54258ZM10.5468 11.6285C10.2695 11.6285 10.0123 11.6418 9.75731 11.6254C9.41129 11.6032 9.12571 11.326 9.116 10.9965C9.10269 10.5535 9.10161 10.1095 9.11636 9.66689C9.12787 9.31723 9.4469 9.04207 9.8127 9.03455C10.1875 9.02669 10.5321 9.29638 10.5418 9.65083C10.559 10.3033 10.5468 10.9558 10.5468 11.6285ZM10.5468 21.2038C10.5468 21.8761 10.559 22.529 10.5418 23.1815C10.5324 23.5356 10.1882 23.8066 9.81413 23.7991C9.44115 23.7919 9.12391 23.5089 9.11456 23.1507C9.10341 22.719 9.10413 22.2866 9.1142 21.8549C9.12211 21.509 9.41309 21.2246 9.77349 21.2062C10.0231 21.1932 10.2742 21.2038 10.5468 21.2038Z"
              fill="#100F10"
            />
            <rect x="13.5" y="11.6333" width="7.08333" height="1.25" fill="#100F10" />
            <rect x="13.5" y="14.3667" width="7.08333" height="1.25" fill="#100F10" />
            <rect x="13.5" y="17.1" width="7.08333" height="1.25" fill="#100F10" />
            <rect x="13.5" y="19.8333" width="7.08333" height="1.25" fill="#100F10" />
          </svg>
        </div>
        <p className="font-orb text-3xl">The Lore</p>
      </div>
      <p
        className="font-tlm text-[14px] font-normal md:text-[16px]"
        style={{ color: Colors.GRAY_CHATEAU }}
      >
        Explore and manage Alien Worlds' official game lore
      </p>

      <div className="mt-2 w-full md:mt-8">
        <TabGroup selectedIndex={tabIndex} onChange={setTabIndex} className="w-full">
          <div className="relative flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="w-full md:hidden">
              <LoreSelect value={tabIndex} onChange={setTabIndex} />
            </div>
            <div className="hidden w-full max-w-full md:block">
              <TabList
                className="flex w-full flex-wrap items-center justify-center gap-1 rounded-[20px] p-1 md:gap-2 lg:flex-nowrap lg:justify-between lg:p-0"
                style={{ backgroundColor: Colors.COD_GRAY }}
              >
                {map(TabsOptions, (tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `h-9 min-w-[30%] max-w-none flex-[1_0_auto] overflow-hidden whitespace-nowrap rounded-full px-2 text-center font-orb text-sm font-bold tracking-[1.16px] text-[rgb(255,255,255)] outline-none sm:min-w-[120px] md:h-10 md:px-4 lg:h-12 lg:w-full lg:max-w-none lg:flex-1 ${
                        selected ? 'bg-[rgb(0,186,255)]' : 'bg-[rgb(17,17,17)]'
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </TabList>
            </div>

            <div className={submitButtonWrapperClass}>
              <Button
                size="lg"
                variant="primary"
                fontSize={18}
                height={isMobile ? '40px' : '48px'}
                fontWeight={900}
                isFullWidth={currentBreakPointValue === 'vertical'}
                onClick={() => {
                  getLorePullRequests()
                  if (isDemoUser) {
                    setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                  } else {
                    setSecondaryModalActive({ modalName: 'SubmitLoreModal', value: true })
                  }
                }}
              >
                Submit Lore
              </Button>
            </div>
          </div>

          <TabPanels className="mt-5 p-0 md:mt-8">
            <TabPanel className="w-full p-0" unmount={false}>
              <div
                className="flex flex-col gap-4 rounded-[20px] p-10"
                style={{ backgroundColor: Colors.COD_GRAY, opacity: 0.9 }}
              >
                <ScrollContainer className="scroll-container" hideScrollbars={false}>
                  <div>
                    <div
                      className="break-words text-lg [&_h1]:mb-0 [&_h1]:mt-0 [&_h1]:text-left [&_h1]:text-[2.5rem] [&_h1]:font-semibold [&_h1]:leading-tight [&_h2]:my-[10px] [&_h2]:text-[30px] [&_h2]:font-semibold [&_h2]:leading-tight [&_h3]:my-[10px] [&_h3]:text-[30px] [&_h3]:font-semibold [&_h3]:leading-tight [&_h4]:my-[10px] [&_h4]:text-[30px] [&_h4]:font-semibold [&_h4]:leading-tight [&_h5]:my-[10px] [&_h5]:text-[22px] [&_h5]:font-semibold [&_h5]:leading-snug [&_p]:my-[10px] [&_p]:text-[16px] [&_p]:font-normal [&_p]:leading-relaxed [&_p]:text-[rgba(166,168,170,1)]"
                      dangerouslySetInnerHTML={{
                        __html: sanitizedHtmlString(loreContent),
                      }}
                    />
                  </div>
                </ScrollContainer>
              </div>
            </TabPanel>
            <TabPanel className="p-0" unmount={false}>
              <Dashboard currentNumber={currentVotePower} />
            </TabPanel>
            <TabPanel className="p-0" unmount={false}>
              <StakeLore currentNumber={currentVotePower} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}

const Lore = () => (
  <LoreDataProvider>
    <LoreContent />
  </LoreDataProvider>
)

export { Lore }
