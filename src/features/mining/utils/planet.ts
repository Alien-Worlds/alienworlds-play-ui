import { toLower } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetNameToId, isUnionDAO, unionToPlanetFinder } from 'shared/util/helpers'

export enum PlanetImageSizes {
  DEFAULT = 'sm',
  SMALL = 'sm',
  LARGE = 'lg',
}

export const getPlanetGradient = (name: string): string => {
  const defaultGradient = 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)'
  const schema = toLower(name)?.trim()
  const mappings = {
    eyeke:
      'linear-gradient(135.28deg, #0F5581 13.89%, #748C4F 49.62%, #B8B12C 76.14%, #D3C01F 88.47%)',
    veles:
      'linear-gradient(311.32deg, #2D26BD 15.83%, #35537D 40.81%, #3E823A 69.55%, #41951F 83.04%)',
    neri: 'linear-gradient(311.32deg, #ECB852 15.83%, #C6BF33 53.03%, #ABC41E 83.04%)',
    kavian: 'linear-gradient(27.33deg, #B34110 7.22%, #E6B876 90.77%)',
    naron:
      'linear-gradient(320.98deg, #B4BBE7 12.27%, #7E997F 51.84%, #5A833B 80.37%, #4C7A20 93.65%)',
    magor:
      'linear-gradient(135.28deg, #853811 13.89%, #984512 25.05%, #DB7317 68.24%, #F68519 88.47%)',
  }

  return mappings[schema] ?? defaultGradient
}

export const getPlanetImage = (planet: string, size: PlanetImageSizes): string => {
  let planetImg: string

  if (!planet) return '/images/planets/planet-sample.png'

  if (planet) {
    planetImg = `/images/planets/${convertPlanetNameToId(
      isUnionDAO(planet) ? unionToPlanetFinder(planet) : planet
    )}_${size}.jpg`
  }

  return planetImg
}

export const getPlanetBackground = (planet: string, isSelected: boolean): string => {
  let planetBg: string

  if (isSelected) {
    planetBg = Colors.SECONDARY_GREEN
  } else if (planet) {
    planetBg = getPlanetGradient(planet)
  } else {
    planetBg = 'transparent'
  }
  return planetBg
}
