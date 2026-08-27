import { ArenaPortalItemType } from 'features/arena/pages/Arena'
import { useNavigate } from 'react-router-dom'
import { openInNewTab } from 'shared/util/helpers'
import { useActions } from 'store'

export const ArenaItem = ({ data }: { data: ArenaPortalItemType }) => {
  const {
    modal: { setSecondaryModalActive },
  } = useActions()
  const navigate = useNavigate()
  return (
    <div>
      <div className="flex w-full justify-center">
        <div
          className="flex w-[100px] cursor-pointer flex-col items-center gap-2 hover:text-[rgb(217,165,85)] lg:w-[140px] lg:gap-4"
          onClick={() => {
            if (data.isAlienWorldsApp) {
              window.scrollTo({ top: 0, behavior: 'auto' })
              navigate(data.url)
            } else {
              setSecondaryModalActive({
                modalName: 'ExternalLinkDisclaimerModal',
                value: true,
                onConfirm: () => openInNewTab(data.url || data.action?.url),
              })
            }
          }}
        >
          <div className="flex size-[100px] items-center justify-center rounded-[20px] bg-black shadow-[inset_-2px_-2px_4px_0_rgba(0,0,0,0.40),inset_3px_3px_4px_0_rgba(116,116,116,0.25)] hover:text-[rgb(217,165,85)] lg:size-[140px]">
            <img src={data.image.data.attributes.url} alt={data.title} />
          </div>
          <p className="text-center font-orb text-xs md:text-base">{data.title}</p>
        </div>
      </div>
    </div>
  )
}
