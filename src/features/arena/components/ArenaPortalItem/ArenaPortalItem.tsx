import { useMemo } from 'react'

import {
  PlayFilledIcon,
  SocialDiscordIcon,
  SocialFacebookIcon,
  SocialInstagramIcon,
  SocialTelegramIcon,
  SocialTwitterIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { ArenaPortalItemType } from 'features/arena/pages/Arena'
import { get, isEmpty, map, replace } from 'lodash'
import { hasUTCDateAlreadyOccurred, openInNewTab } from 'shared/util/helpers'
import { useActions } from 'store'

type ArenaPortalItemProps = {
  data: ArenaPortalItemType
}

export const ArenaPortalSocialLinkIcons = {
  facebook: <SocialFacebookIcon boxSize={32} />,
  instagram: <SocialInstagramIcon boxSize={32} />,
  twitter: <SocialTwitterIcon boxSize={32} />,
  discord: <SocialDiscordIcon boxSize={32} />,
  telegram: <SocialTelegramIcon boxSize={32} />,
}

const CreatorLink = ({
  name,
  url,
  onClick,
}: {
  name: string
  url?: string
  onClick?: () => void
}) => {
  if (url) {
    return (
      <a onClick={onClick} className="cursor-pointer">
        {name}
      </a>
    )
  }

  return <span>{name}</span>
}

export const ArenaPortalItem = ({ data }: ArenaPortalItemProps) => {
  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const isItemReleased = useMemo(() => {
    if (!data.releaseDate) {
      return false
    }

    return hasUTCDateAlreadyOccurred(data.releaseDate)
  }, [data.releaseDate])

  const playVideoButtonHandler = () => {
    setSecondaryModalActive({
      modalName: 'VideoPlayerModal',
      value: true,
      onConfirm: () => data.video,
    })
  }

  const playNowButtonHandler = () => {
    setSecondaryModalActive({
      modalName: 'ExternalLinkDisclaimerModal',
      value: true,
      onConfirm: () => openInNewTab(data.url || data.action.url),
    })
  }

  const visitDeveloperHandler = () => {
    setSecondaryModalActive({
      modalName: 'ExternalLinkDisclaimerModal',
      value: true,
      onConfirm: () => openInNewTab(data.creatorUrl),
    })
  }

  return (
    <div className="flex w-full flex-col items-center rounded-t-[20px] bg-[rgba(0,0,0,0.65)]">
      <div
        className="flex h-60 w-full shrink-0 flex-col justify-between overflow-hidden rounded-t-[20px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${data?.image?.data?.attributes?.url})` }}
      >
        <div className="flex w-full flex-col justify-between gap-y-10 xl:flex-row">
          {get(data, 'sashlabel.length') > 0 && (
            <div className="relative ml-[-10%] mt-6 flex h-6 w-[35%] min-w-[130px] rotate-[-45deg] items-center justify-center self-start bg-white p-1 [clip-path:inset(-10_0,_100%_0,_50%_100%)]">
              <span className="cursor-default select-none font-orb text-base font-medium text-[rgba(15,15,15,1)]">
                {data.sashlabel}
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 self-center p-6 sm:self-end">
            {!isEmpty(data.video) && (
              <Button
                size="sm"
                variant="info"
                leftIcon={<PlayFilledIcon boxSize={24} />}
                onClick={playVideoButtonHandler}
              >
                Play Trailer
              </Button>
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-between bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)] px-3 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-1">
            {!isEmpty(data.socialLinks) &&
              map(data.socialLinks, (social, index) => (
                <a href={social.url} target="_blank" rel="noopener noreferrer" key={index}>
                  {ArenaPortalSocialLinkIcons[social.name]}
                </a>
              ))}
          </div>
          <div className="font-orb text-xl font-medium">
            {!isEmpty(data.version) && replace(data.version, 'V', 'V. ')}
          </div>
        </div>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-between px-6 pb-10 pt-0">
        <div className="pt-4 text-sm text-[rgba(166,168,170,1)]">{data.description}</div>
        <div className="flex-1" />
        <div className="flex flex-col items-start self-start pb-4">
          <div className="font-orb text-xl">{data.title}</div>
          <div className="flex text-sm leading-none text-[rgba(166,168,170,1)]">
            <CreatorLink
              name={data.creator}
              url={data.creatorUrl}
              onClick={visitDeveloperHandler}
            />
          </div>
        </div>

        <div className="flex w-full flex-row justify-between pb-4">
          <div className="flex flex-1 flex-col items-start pb-4">
            <div className="text-right font-orb text-xl">{data.platform}</div>
            <div className="text-sm leading-none text-[rgba(166,168,170,1)]">Platform</div>
          </div>
        </div>

        <div className="flex w-full">
          <Button
            size="lg"
            variant={get(data, 'action.style') || 'primary'}
            isFullWidth
            fontSize={22}
            disabled={!isItemReleased}
            onClick={playNowButtonHandler}
          >
            {isItemReleased ? get(data, 'action.label', '') : 'Coming Soon'}
          </Button>
        </div>
      </div>
    </div>
  )
}
