import { Button } from '@alien-worlds/uikit'
import { ArenaPortalDevItemType } from 'features/arena/pages/Arena'

type ArenaPortalDevItemProps = {
  data: ArenaPortalDevItemType
}

export const ArenaPortalDevItem = ({ data }: ArenaPortalDevItemProps) => {
  return (
    <div className="relative box-border h-[650px] overflow-hidden rounded-[20px] bg-black sm:h-[600px] md:h-full xl:h-[600px]">
      <div className="absolute left-0 top-0 h-full w-full">
        <div
          className="absolute left-0 top-0 h-full w-full opacity-30"
          style={{
            border: '30px solid',
            borderImage: "url('/images/alienworlds-db-card-border.svg')",
            borderImageRepeat: 'stretch',
            borderImageSlice: '50 40 40',
            borderImageWidth: '10px 15px 15px',
          }}
        />
        <div className="flex h-full w-full flex-col items-center justify-between rounded-t-[20px] bg-[rgba(0,0,0,0.65)]">
          <div
            className="flex h-[290px] w-full min-h-[215px] flex-col justify-end rounded-t-[20px] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${data.image})` }}
          >
            <div className="w-full bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)] py-6" />
          </div>

          <div className="flex w-full flex-col items-center p-[24px]">
            <div className="self-start whitespace-pre-line px-[15px] font-orb text-[32px] tracking-[0.1em] md:text-2xl lg:text-[32px]">
              {data.title}
            </div>

            <div className="w-full px-[15px] pb-8 font-tlm text-sm">{data.description}</div>

            <div className="w-full pb-[15px] text-center">
              <a href={data.url} target="_blank" rel="noreferrer" className="block w-full">
                <Button
                  size="lg"
                  variant="primary"
                  fontSize={22}
                  className="mx-auto w-[90%] sm:w-full"
                >
                  Join Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
