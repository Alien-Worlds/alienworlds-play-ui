import {
  EyekeColorIcon,
  KavianColorIcon,
  MagorColorIcon,
  NaronColorIcon,
  NeriColorIcon,
  VelesColorIcon,
  EyekeIcon,
  KavianIcon,
  MagorIcon,
  NaronIcon,
  NeriIcon,
  VelesIcon,
  MiningIcon,
  MissionsIcon,
  GovernanceIcon,
  LandIcon,
  ActiveVolcanoIcon,
  DormantVolcanoIcon,
  DunesIcon,
  GeothermalSpringssIcon,
  GrassCoastlineIcon,
  GrasslandIcon,
  IcyDesertIcon,
  IcyMountainsIcon,
  IslandRiverIcon,
  MethaneSwamplandIcon,
  MountainsIcon,
  MushroomForestIcon,
  PlanesIcon,
  RockyCoastlineIcon,
  RockyCraterIcon,
  RockyDesertIcon,
  SandyCoastlineIcon,
  SandyDessertIcon,
  SmallIslandIcon,
  TreeForestIcon,
} from '@alien-worlds/icons'
import { Icon } from '@chakra-ui/react'
import { split } from 'lodash'

type PlanetIconProps = {
  planetName: string
  style?: any
}

type LandIconProps = {
  landName: string
  style?: any
}

export function CustomIcon<Type>(props: any, type: Type) {
  const { ...rest } = props

  return <Icon w="20px" h="20px" {...rest} as={type} />
}

export const PlanetIcon = ({ planetName, style }: PlanetIconProps) => {
  switch (planetName) {
    case 'Eyeke':
    case 'Eyekeunn':
      return <EyekeColorIcon style={style} boxSize={style.width} />
    case 'Kavian':
    case 'Kavianunn':
      return <KavianColorIcon style={style} boxSize={style.width} />
    case 'Magor':
    case 'Magorunn':
      return <MagorColorIcon style={style} boxSize={style.width} />
    case 'Naron':
    case 'Naronunn':
      return <NaronColorIcon style={style} boxSize={style.width} />
    case 'Neri':
    case 'Neriunn':
      return <NeriColorIcon style={style} boxSize={style.width} />
    case 'Veles':
    case 'Velesunn':
      return <VelesColorIcon style={style} boxSize={style.width} />
    default:
      return <EyekeColorIcon style={style} boxSize={style.width} />
  }
}

export const PlanetIconRGB = ({ planetName, style }: PlanetIconProps) => {
  switch (planetName) {
    case 'Eyeke':
      return <EyekeIcon style={style} boxSize={style?.width} />
    case 'Kavian':
      return <KavianIcon style={style} boxSize={style?.width} />
    case 'Magor':
      return <MagorIcon style={style} boxSize={style?.width} />
    case 'Naron':
      return <NaronIcon style={style} boxSize={style?.width} />
    case 'Neri':
      return <NeriIcon style={style} boxSize={style?.width} />
    case 'Nerix':
      return <NeriIcon style={style} boxSize={style?.width} />
    case 'Veles':
      return <VelesIcon style={style} boxSize={style?.width} />
    default:
      return <EyekeIcon style={style} boxSize={style?.width} />
  }
}

export const PlanetLandIcon = ({ landName, style }: LandIconProps) => {
  const baseLandName: string = split(landName, ' on')?.[0]

  switch (baseLandName) {
    case 'Active Volcano':
      return <ActiveVolcanoIcon style={style} />
    case 'Dormant Volcano':
      return <DormantVolcanoIcon style={style} />
    case 'Dunes':
      return <DunesIcon style={style} />
    case 'Geothermal Springs':
      return <GeothermalSpringssIcon style={style} />
    case 'Grass Coastline':
      return <GrassCoastlineIcon style={style} />
    case 'Grassland':
      return <GrasslandIcon style={style} />
    case 'Icy Desert':
      return <IcyDesertIcon style={style} />
    case 'Icy Mountains':
      return <IcyMountainsIcon style={style} />
    case 'Inland River':
      return <IslandRiverIcon style={style} />
    case 'Methane Swampland':
      return <MethaneSwamplandIcon style={style} />
    case 'Mountains':
      return <MountainsIcon style={style} />
    case 'Mushroom Forest':
      return <MushroomForestIcon style={style} />
    case 'Plains':
      return <PlanesIcon style={style} />
    case 'Rocky Coastline':
      return <RockyCoastlineIcon style={style} />
    case 'Rocky Crater':
      return <RockyCraterIcon style={style} />
    case 'Rocky Desert':
      return <RockyDesertIcon style={style} />
    case 'Sandy Coastline':
      return <SandyCoastlineIcon style={style} />
    case 'Sandy Dessert':
      return <SandyDessertIcon style={style} />
    case 'Small Island':
      return <SmallIslandIcon style={style} />
    case 'Tree Forest':
      return <TreeForestIcon style={style} />
    default:
      return <LandIcon style={style} />
  }
}

export const MainDrawerTabIcon = (index: number) => {
  let icon: React.ReactElement

  switch (index) {
    case 0:
      icon = <MiningIcon fill="white" boxSize={30} />
      break
    case 1:
      icon = <GovernanceIcon fill="white" boxSize={30} />
      break
    case 2:
      icon = <MissionsIcon fill="white" boxSize={30} />
      break
    case 3:
      icon = <LandIcon fill="white" boxSize={30} />
      break
    default:
      break
  }
  return icon
}
