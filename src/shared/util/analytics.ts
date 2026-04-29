import { config } from './config'

export const collectGAEvent = async (eventName: string, eventParameters?: any) => {
  eventParameters.cookies_cleared = localStorage.getItem('aw_cookies_cleared')
  const lastEventTimestamp = localStorage.getItem('aw_lastEvtTimestamp')

  const defaultParameters = {
    send_to: config.GoogleAnalytics,
    page_location: window?.location?.href,
  }

  const eventCollected = {
    ...defaultParameters,
    ...eventParameters,
  }

  if (Date.now().toString() !== lastEventTimestamp) {
    window?.ga4?.gtag('event', eventName, eventCollected)
    localStorage.setItem('aw_lastEvtTimestamp', Date.now().toString())
  }
}
