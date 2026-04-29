import { Toaster } from 'react-hot-toast'

export const StyledToaster = () => (
  <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 6000,
    }}
    containerStyle={{
      zIndex: 10000000,
      top: 100,
      left: 20,
      bottom: 20,
      right: 20,
    }}
  />
)
