import { toast } from 'react-hot-toast'
import { config } from 'shared/util/config'

export const toastMessage = (message: string, duration?: number) => {
  const wallet = JSON.parse(localStorage.getItem('aw'))
  const isDemoUser = wallet?.userAccount === config.DemoUserWaxAccount

  toast.success(message, {
    duration: duration ?? 5000,
    position: 'top-center',
    style: { marginTop: isDemoUser ? '60px' : '0px' },
  })
}

export const toastErrorMessage = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'bottom-right',
  })
}
