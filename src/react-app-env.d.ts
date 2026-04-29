/// <reference types="react-scripts" />
import { GA4ReactResolveInterface } from 'ga-4-react/dist/models/gtagModels'

declare global {
  interface Window {
    ga4: GA4ReactResolveInterface
  }
}

declare module 'atomicassets/build/API/Explorer/Objects' {
  export interface IAsset {
    total_of_type: number
    // template_id is used when we feed nft card with template data response
    template_id: number
  }
}
