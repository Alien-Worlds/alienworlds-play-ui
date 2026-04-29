import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { App } from 'app'
import GA4React from 'ga-4-react'
import { createOvermind } from 'overmind'
import { Provider } from 'overmind-react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { config as appConfig } from 'shared/util/config'
import { checkEnvVariables, logAppVersion } from 'shared/util/helpers'
import { config } from 'store'

import reportWebVitals from './reportWebVitals'

import './shared/styles/fonts/fonts.css'
import './App.css'
import 'focus-visible/dist/focus-visible'

const ga4react = new GA4React(appConfig.GoogleAnalytics)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: appConfig.IsProduction,
    },
  },
})

const overmind = createOvermind(config, { devtools: false, logProxies: true })

const renderReact = () => {
  const rootElement = document.getElementById('root')

  const root: ReactDOM.Root = ReactDOM.createRoot(rootElement as HTMLElement)

  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Provider value={overmind}>
            <App />
          </Provider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  )
}

if (!checkEnvVariables()) {
  console.error('Environment variables are not set correctly. Please check.')
}

;(async (_) => {
  await ga4react
    .initialize()
    .then((ga4) => {
      console.log('Analytics Success.')
      window.ga4 = ga4
    })
    .catch(() => console.log('Analytics Failure.'))
    .finally(renderReact)
})()

reportWebVitals()
logAppVersion()
