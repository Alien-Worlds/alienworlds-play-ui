import { Colors } from 'shared/util/colors'

import { getPlanetBackground, getPlanetGradient, getPlanetImage, PlanetImageSizes } from './planet'

describe('getPlanetGradient', () => {
  it('returns the planet gradient regardless of case and whitespace', () => {
    expect(getPlanetGradient(' Kavian ')).toBe(
      'linear-gradient(27.33deg, #B34110 7.22%, #E6B876 90.77%)'
    )
  })

  it('falls back to plain white for unknown planets', () => {
    expect(getPlanetGradient('pluto')).toBe(
      'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)'
    )
  })
})

describe('getPlanetImage', () => {
  it('builds the image path from the planet id and size', () => {
    expect(getPlanetImage('Eyeke', PlanetImageSizes.LARGE)).toBe('/images/planets/eyeke_lg.jpg')
  })

  it('maps Neri to its nerix id', () => {
    expect(getPlanetImage('Neri', PlanetImageSizes.SMALL)).toBe('/images/planets/nerix_sm.jpg')
  })

  it('maps a union DAO to its planet', () => {
    expect(getPlanetImage('kavianunn', PlanetImageSizes.SMALL)).toBe(
      '/images/planets/kavian_sm.jpg'
    )
  })

  it('returns the sample image without a planet', () => {
    expect(getPlanetImage(null, PlanetImageSizes.SMALL)).toBe('/images/planets/planet-sample.png')
  })
})

describe('getPlanetBackground', () => {
  it('uses the highlight colour when selected', () => {
    expect(getPlanetBackground('eyeke', true)).toBe(Colors.SECONDARY_GREEN)
  })

  it('uses the planet gradient when not selected', () => {
    expect(getPlanetBackground('eyeke', false)).toBe(getPlanetGradient('eyeke'))
  })

  it('is transparent without a planet', () => {
    expect(getPlanetBackground('', false)).toBe('transparent')
  })
})
