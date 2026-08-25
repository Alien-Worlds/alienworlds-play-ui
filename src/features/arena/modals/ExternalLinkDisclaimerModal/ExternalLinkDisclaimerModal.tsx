import { Button } from '@alien-worlds/uikit'
import { Dialog, DialogPanel } from '@headlessui/react'
import AlienWorldsLogo from 'assets/images/alienworlds-db-logo_full_color.svg'
import ArenaPortalWarningBg from 'assets/images/arena-portal/disclaimer_bg.jpg'
import ScrollContainer from 'react-indiana-drag-scroll'
import { useAppState, useActions } from 'store'

const ExternalLinkDisclaimerModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'ExternalLinkDisclaimerModal', value: false })
  }

  const handleConfirm = () => {
    if (typeof secondaryModals.onConfirm === 'function') {
      secondaryModals.onConfirm()
    }
    handleClose()
  }

  return (
    <Dialog
      open={!!secondaryModals.ExternalLinkDisclaimerModal}
      onClose={handleClose}
      // Chakra's theme sets zIndices.modal/topbar to 20000/21000 (see shared/styles/theme.ts),
      // so the persistent sidebar and top bar would otherwise render above this Tailwind dialog.
      className="relative z-[30000]"
    >
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${ArenaPortalWarningBg})` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-[100vw] self-center rounded-[35px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,15,16,0.6)_0%,rgba(16,15,16,0.9)_100%)] font-tlm md:max-w-[70vw] xl:max-w-[40vw]">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl leading-none text-white"
          >
            &times;
          </button>
          <div className="p-6">
            <div className="flex w-full items-center justify-center">
              <img
                src={AlienWorldsLogo}
                alt="Alien Worlds Logo"
                className="my-6 w-[225px] self-center py-[15px]"
              />
            </div>
            <p className="mb-[30px] text-center font-orb text-3xl font-normal text-white">
              You are now leaving the Alien Worlds Metaverse website.
            </p>
            <div className="flex max-h-[30vh] flex-col overflow-y-auto px-[5px] text-center md:max-h-[35vh] md:px-10">
              <ScrollContainer
                hideScrollbars={false}
                className="scroll-container"
                style={{ paddingInline: '10px' }}
              >
                <p className="pb-3 text-lg font-normal text-white">
                  Alien Worlds offers links to other third party websites that may be of interest to
                  website visitors to the Alien Worlds Metaverse. When you click on these links you
                  will leave the Alien Worlds Metaverse website and will be redirected to another
                  third party website. These websites are not under the control of Alien Worlds.
                </p>

                <p className="py-3 text-lg font-normal text-white">
                  Alien Worlds is not responsible for the content of linked third party websites.
                  Alien Worlds is not an agent for these third parties nor guarantees their services
                  or products. Alien Worlds makes no representation or warranty regarding the
                  accuracy of the information contained in the linked sites.
                </p>

                <p className="py-3 text-lg font-normal text-white">
                  Please be aware that the terms and conditions and security and privacy policies on
                  these sites may be different than Alien Worlds’ policies, so please read third
                  party terms and conditions and privacy and security policies closely. When you use
                  a third party site, you will be subject to its terms and conditions and no longer
                  be protected by Alien Worlds’ terms and conditions, security practices or privacy
                  policies.
                </p>

                <p className="py-3 text-lg font-normal text-white">
                  If you have any questions or concerns about the products and services offered on
                  linked third party websites, please contact the relevant third party directly.
                </p>

                <p className="py-3 text-lg font-normal text-white">
                  By clicking on the GO TO SITE button below, you acknowledge the above statement
                  and will be taken to the linked site. If you want to remain on Alien Worlds' site,
                  select the STAY HERE button.
                </p>
              </ScrollContainer>
            </div>
            <div className="flex justify-center pb-12 pt-4">
              <div className="flex w-full flex-col items-center gap-4">
                <Button
                  fontSize={20}
                  variant="warning"
                  onClick={handleConfirm}
                  size="md"
                  className="w-full max-w-[300px] text-sm md:text-base lg:text-lg"
                >
                  Go to Site
                </Button>
                <Button
                  fontSize={20}
                  variant="tertiary"
                  onClick={handleClose}
                  size="md"
                  className="w-full max-w-[300px] text-sm md:text-base lg:text-lg"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export { ExternalLinkDisclaimerModal }
