// GameScene3D.tsx - City exploration with zone selection
// Clean 3D city viewer without post-processing (for stability)

import React, { useState, Suspense, useCallback } from 'react'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { getZone, CityZone, ZONE_LIST } from './cityZones'

// MegaCity texture path
const MEGACITY_TEXTURE = '/assets/models/City/MegaCity/MegapolisCityPack/Assets/Textures/Polygon_Texture.png'

// Complete City Scene Model
const CityScene: React.FC<{
  position?: [number, number, number]
  scale?: number
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}> = ({ position = [0, 0, 0], scale = 1, onClick }) => {
  const { scene } = useGLTF('/assets/models/City/CityFull/City_2.glb')

  // Habilitar sombras y mejorar calidad de texturas
  React.useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true

        // Mejorar calidad de texturas
        const material = mesh.material as THREE.MeshStandardMaterial
        if (material?.map) {
          material.map.anisotropy = 16
          material.map.minFilter = THREE.LinearMipmapLinearFilter
          material.map.magFilter = THREE.LinearFilter
        }
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      onClick={onClick}
    />
  )
}

// Static Vehicle component (for assets with embedded textures)
const StaticVehicle: React.FC<{
  url: string
  position: [number, number, number]
  rotation?: number
  scale?: number
}> = ({ url, position, rotation = 0, scale = 1 }) => {
  const { scene } = useGLTF(url)

  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  )
}

// Shared texture for MegaCity assets - loaded once
const polyTexture = new THREE.TextureLoader().load(MEGACITY_TEXTURE)
polyTexture.flipY = false  // Importante para GLTF
polyTexture.colorSpace = THREE.SRGBColorSpace

// MegaCity Vehicle component (for assets that need external texture)
const MegaCityVehicle: React.FC<{
  url: string
  position: [number, number, number]
  rotation?: number
  scale?: number
}> = ({ url, position, rotation = 0, scale = 1 }) => {
  const { scene } = useGLTF(url)

  // Clonar escena, centrar y aplicar textura
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true)

    // Calcular bounding box para centrar el modelo
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())

    // Mover todos los hijos para centrar en origen (solo X y Z, mantener Y)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        // Centrar geometría
        mesh.position.x -= center.x
        mesh.position.z -= center.z

        // Aplicar textura
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const mat = (m as THREE.MeshStandardMaterial).clone()
            mat.map = polyTexture
            mat.needsUpdate = true
            return mat
          })
        } else {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
          mat.map = polyTexture
          mat.needsUpdate = true
          mesh.material = mat
        }
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    />
  )
}

// Base paths for assets
const CHAR_PATH = '/assets/models/funny_characters_pack/Assets_glb/Full_Body'
const CITY_PATH = '/assets/models/City/Separate_assets_glb'
const CITY_FULL_PATH = '/assets/models/City/CityFull/Separate_assets_glb'
const MEGACITY_PATH = '/assets/models/City/MegaCity/MegapolisCityPack/Assets/Models'

// Asset catalog for editor
// label = nombre de archivo real, displayName = nombre amigable (editable)
// Si displayName está vacío, se muestra label
// megacity = true indica que el asset necesita textura externa (MegaCity pack)
const ASSET_CATALOG = {
  vehicles: {
    label: '🚗 Vehículos',
    items: {
      car06: { label: 'Car_06', displayName: '', url: `${CITY_PATH}/Car_06.glb` },
      car13: { label: 'Car_13', displayName: '', url: `${CITY_PATH}/Car_13.glb` },
      car16: { label: 'Car_16', displayName: '', url: `${CITY_PATH}/Car_16.glb` },
      car19: { label: 'Car_19', displayName: '', url: `${CITY_PATH}/Car_19.glb` },
      futuristic: { label: 'Futuristic_Car_1', displayName: '', url: `${CITY_PATH}/Futuristic_Car_1.glb` },
      van: { label: 'Van', displayName: '', url: `${CITY_PATH}/Van.glb` },
    }
  },
  buses: {
    label: '🚌 Buses',
    items: {
      bus1: { label: 'transport_bus_001', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_001.glb` },
      bus2: { label: 'transport_bus_002', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_002.glb` },
      bus3: { label: 'transport_bus_003', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_003.glb` },
      bus4: { label: 'transport_bus_004', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_004.glb` },
      bus5: { label: 'transport_bus_005', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_005.glb` },
      bus6: { label: 'transport_bus_006', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_006.glb` },
      bus7: { label: 'transport_bus_007', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_007.glb` },
      bus8: { label: 'transport_bus_008', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_008.glb` },
      bus9: { label: 'transport_bus_009', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_009.glb` },
      bus10: { label: 'transport_bus_010', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_010.glb` },
    }
  },
  jeeps: {
    label: '🚙 Jeeps',
    items: {
      jeep1: { label: 'transport_jeep_001', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_001.glb` },
      jeep2: { label: 'transport_jeep_002', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_002.glb` },
      jeep3: { label: 'transport_jeep_003', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_003.glb` },
      jeep4: { label: 'transport_jeep_004', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_004.glb` },
      jeep5: { label: 'transport_jeep_005', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_005.glb` },
      jeep6: { label: 'transport_jeep_006', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_006.glb` },
      jeep7: { label: 'transport_jeep_007', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_007.glb` },
      jeep8: { label: 'transport_jeep_008', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_008.glb` },
      jeep9: { label: 'transport_jeep_009', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_009.glb` },
      jeep10: { label: 'transport_jeep_010', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_010.glb` },
      jeep11: { label: 'transport_jeep_011', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_011.glb` },
    }
  },
  trucks: {
    label: '🚛 Camiones',
    items: {
      truck1: { label: 'transport_truck_001', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_001.glb` },
      truck2: { label: 'transport_truck_002', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_002.glb` },
      truck3: { label: 'transport_truck_003', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_003.glb` },
      truck4: { label: 'transport_truck_004', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_004.glb` },
      truck5: { label: 'transport_truck_005', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_005.glb` },
      truck6: { label: 'transport_truck_006', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_006.glb` },
      truck7: { label: 'transport_truck_007', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_007.glb` },
      truck8: { label: 'transport_truck_008', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_008.glb` },
      truck9: { label: 'transport_truck_009', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_009.glb` },
      truck10: { label: 'transport_truck_010', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_010.glb` },
      truck11: { label: 'transport_truck_011', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_011.glb` },
      truck12: { label: 'transport_truck_012', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_012.glb` },
      truck13: { label: 'transport_truck_013', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_013.glb` },
      truck14: { label: 'transport_truck_014', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_014.glb` },
      truck15: { label: 'transport_truck_015', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_015.glb` },
    }
  },
  sportCars: {
    label: '🏎️ Deportivos',
    items: {
      sport1: { label: 'transport_sport_001', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_001.glb` },
      sport2: { label: 'transport_sport_002', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_002.glb` },
      sport3: { label: 'transport_sport_003', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_003.glb` },
      sport4: { label: 'transport_sport_004', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_004.glb` },
      sport5: { label: 'transport_sport_005', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_005.glb` },
      sport6: { label: 'transport_sport_006', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_006.glb` },
      sport7: { label: 'transport_sport_007', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_007.glb` },
      sport9: { label: 'transport_sport_009', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_009.glb` },
      sport10: { label: 'transport_sport_010', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_010.glb` },
      cool1: { label: 'transport_cool_001', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_001.glb` },
      cool2: { label: 'transport_cool_002', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_002.glb` },
      cool3: { label: 'transport_cool_003', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_003.glb` },
      cool4: { label: 'transport_cool_004', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_004.glb` },
      cool5: { label: 'transport_cool_005', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_005.glb` },
      cool6: { label: 'transport_cool_006', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_006.glb` },
      cool7: { label: 'transport_cool_007', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_007.glb` },
      cool8: { label: 'transport_cool_008', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_008.glb` },
      cool9: { label: 'transport_cool_009', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_009.glb` },
      cool10: { label: 'transport_cool_010', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_010.glb` },
    }
  },
  oldCars: {
    label: '🚗 Clásicos',
    items: {
      old1: { label: 'transport_old_001', displayName: '', url: `${CITY_FULL_PATH}/transport_old_001.glb` },
      old2: { label: 'transport_old_002', displayName: '', url: `${CITY_FULL_PATH}/transport_old_002.glb` },
      old3: { label: 'transport_old_003', displayName: '', url: `${CITY_FULL_PATH}/transport_old_003.glb` },
      old4: { label: 'transport_old_004', displayName: '', url: `${CITY_FULL_PATH}/transport_old_004.glb` },
      old5: { label: 'transport_old_005', displayName: '', url: `${CITY_FULL_PATH}/transport_old_005.glb` },
      old6: { label: 'transport_old_006', displayName: '', url: `${CITY_FULL_PATH}/transport_old_006.glb` },
      old7: { label: 'transport_old_007', displayName: '', url: `${CITY_FULL_PATH}/transport_old_007.glb` },
      old8: { label: 'transport_old_008', displayName: '', url: `${CITY_FULL_PATH}/transport_old_008.glb` },
      old9: { label: 'transport_old_009', displayName: '', url: `${CITY_FULL_PATH}/transport_old_009.glb` },
      old10: { label: 'transport_old_010', displayName: '', url: `${CITY_FULL_PATH}/transport_old_010.glb` },
      old11: { label: 'transport_old_011', displayName: '', url: `${CITY_FULL_PATH}/transport_old_011.glb` },
      old12: { label: 'transport_old_012', displayName: '', url: `${CITY_FULL_PATH}/transport_old_012.glb` },
      old13: { label: 'transport_old_013', displayName: '', url: `${CITY_FULL_PATH}/transport_old_013.glb` },
    }
  },
  purposeVehicles: {
    label: '🚐 Utilitarios',
    items: {
      purpose1: { label: 'transport_purpose_001', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_001.glb` },
      purpose2: { label: 'transport_purpose_002', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_002.glb` },
      purpose3: { label: 'transport_purpose_003', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_003.glb` },
      purpose4: { label: 'transport_purpose_004', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_004.glb` },
      purpose5: { label: 'transport_purpose_005', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_005.glb` },
      purpose6: { label: 'transport_purpose_006', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_006.glb` },
      purpose7: { label: 'transport_purpose_007', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_007.glb` },
      purpose8: { label: 'transport_purpose_008', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_008.glb` },
      purpose9: { label: 'transport_purpose_009', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_009.glb` },
      purpose10: { label: 'transport_purpose_010', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_010.glb` },
    }
  },
  flying: {
    label: '✈️ Aéreos',
    items: {
      air1: { label: 'transport_air_001', displayName: '', url: `${CITY_FULL_PATH}/transport_air_001.glb` },
      air2: { label: 'transport_air_002', displayName: '', url: `${CITY_FULL_PATH}/transport_air_002.glb` },
      air3: { label: 'transport_air_003', displayName: '', url: `${CITY_FULL_PATH}/transport_air_003.glb` },
      air4: { label: 'transport_air_004', displayName: '', url: `${CITY_FULL_PATH}/transport_air_004.glb` },
      air5: { label: 'transport_air_005', displayName: '', url: `${CITY_FULL_PATH}/transport_air_005.glb` },
      air6: { label: 'transport_air_006', displayName: '', url: `${CITY_FULL_PATH}/transport_air_006.glb` },
      air7: { label: 'transport_air_007', displayName: '', url: `${CITY_FULL_PATH}/transport_air_007.glb` },
      air8: { label: 'transport_air_008', displayName: '', url: `${CITY_FULL_PATH}/transport_air_008.glb` },
      air9: { label: 'transport_air_009', displayName: '', url: `${CITY_FULL_PATH}/transport_air_009.glb` },
      air10: { label: 'transport_air_010', displayName: '', url: `${CITY_FULL_PATH}/transport_air_010.glb` },
      ufo: { label: 'UFO_001', displayName: 'OVNI', url: `${CHAR_PATH}/UFO_001.glb` },
    }
  },
  water: {
    label: '🚤 Acuáticos',
    items: {
      boat1: { label: 'transport_water_001', displayName: '', url: `${CITY_FULL_PATH}/transport_water_001.glb` },
      boat2: { label: 'transport_water_002', displayName: '', url: `${CITY_FULL_PATH}/transport_water_002.glb` },
      boat3: { label: 'transport_water_003', displayName: '', url: `${CITY_FULL_PATH}/transport_water_003.glb` },
      boat4: { label: 'transport_water_004', displayName: '', url: `${CITY_FULL_PATH}/transport_water_004.glb` },
      boat5: { label: 'transport_water_005', displayName: '', url: `${CITY_FULL_PATH}/transport_water_005.glb` },
      boat6: { label: 'transport_water_006', displayName: '', url: `${CITY_FULL_PATH}/transport_water_006.glb` },
      boat7: { label: 'transport_water_007', displayName: '', url: `${CITY_FULL_PATH}/transport_water_007.glb` },
      boat8: { label: 'transport_water_008', displayName: '', url: `${CITY_FULL_PATH}/transport_water_008.glb` },
      boat9: { label: 'transport_water_009', displayName: '', url: `${CITY_FULL_PATH}/transport_water_009.glb` },
      boat10: { label: 'transport_water_010', displayName: '', url: `${CITY_FULL_PATH}/transport_water_010.glb` },
      shark: { label: 'Shark_001', displayName: 'Tiburón', url: `${CHAR_PATH}/Shark_001.glb` },
    }
  },
  characters: {
    label: '👤 Personajes',
    items: {
      astronaut: { label: 'Astronaut_001', displayName: 'Astronauta', url: `${CHAR_PATH}/Astronaut_001.glb` },
      alien: { label: 'Alien_001', displayName: 'Alien', url: `${CHAR_PATH}/Alien_001.glb` },
      demon: { label: 'Demon_001', displayName: 'Demonio', url: `${CHAR_PATH}/Demon_001.glb` },
      ghost: { label: 'Ghost_001', displayName: 'Fantasma', url: `${CHAR_PATH}/Ghost_001.glb` },
      lego: { label: 'Lego_001', displayName: 'Lego', url: `${CHAR_PATH}/Lego_001.glb` },
      fallguys: { label: 'Red_Fall_Guys_001', displayName: 'Fall Guys', url: `${CHAR_PATH}/Red_Fall_Guys_001.glb` },
      snowman: { label: 'Snowman_001', displayName: 'Muñeco Nieve', url: `${CHAR_PATH}/Snowman_001.glb` },
      ostrich: { label: 'Ostrich_001', displayName: 'Avestruz', url: `${CHAR_PATH}/Ostrich_001.glb` },
      snake: { label: 'Snake_001', displayName: 'Serpiente', url: `${CHAR_PATH}/Snake_001.glb` },
      crayfish: { label: 'Crayfish_001', displayName: 'Langosta', url: `${CHAR_PATH}/Crayfish_001.glb` },
      actionFigure: { label: 'Action_figure_001', displayName: '', url: `${CHAR_PATH}/Action_figure_001.glb` },
      tooth: { label: 'Tooth_001', displayName: 'Diente', url: `${CHAR_PATH}/Tooth_001.glb` },
    }
  },
  food: {
    label: '🍔 Comida',
    items: {
      hotdog: { label: 'Hot_dog_001', displayName: 'Hot Dog', url: `${CHAR_PATH}/Hot_dog_001.glb` },
      banana: { label: 'Banana_001', displayName: 'Banana', url: `${CHAR_PATH}/Banana_001.glb` },
      sushi: { label: 'Sushi_001', displayName: 'Sushi', url: `${CHAR_PATH}/Sushi_001.glb` },
      mushroom: { label: 'Mushroom_001', displayName: 'Hongo', url: `${CHAR_PATH}/Mushroom_001.glb` },
      eggplant: { label: 'Eggplant_001', displayName: 'Berenjena', url: `${CHAR_PATH}/Eggplant_001.glb` },
      sausage: { label: 'Sausage_001', displayName: 'Salchicha', url: `${CHAR_PATH}/Sausage_001.glb` },
    }
  },
  foodtrucks: {
    label: '🚚 Food Trucks',
    items: {
      foodtruck: { label: 'food_truck_lowpoly', displayName: 'Food Truck', url: '/assets/models/trucks/food_truck_lowpoly.glb' },
    }
  },
  vegetation: {
    label: '🌳 Vegetación',
    items: {
      veg1: { label: 'vegetation_001', displayName: '', url: `${CITY_FULL_PATH}/vegetation_001.glb` },
      veg2: { label: 'vegetation_002', displayName: '', url: `${CITY_FULL_PATH}/vegetation_002.glb` },
      veg3: { label: 'vegetation_003', displayName: '', url: `${CITY_FULL_PATH}/vegetation_003.glb` },
      veg4: { label: 'vegetation_004', displayName: '', url: `${CITY_FULL_PATH}/vegetation_004.glb` },
      veg5: { label: 'vegetation_005', displayName: '', url: `${CITY_FULL_PATH}/vegetation_005.glb` },
      veg6: { label: 'vegetation_006', displayName: '', url: `${CITY_FULL_PATH}/vegetation_006.glb` },
      veg7: { label: 'vegetation_007', displayName: '', url: `${CITY_FULL_PATH}/vegetation_007.glb` },
      veg8: { label: 'vegetation_008', displayName: '', url: `${CITY_FULL_PATH}/vegetation_008.glb` },
      veg9: { label: 'vegetation_009', displayName: '', url: `${CITY_FULL_PATH}/vegetation_009.glb` },
      veg10: { label: 'vegetation_010', displayName: '', url: `${CITY_FULL_PATH}/vegetation_010.glb` },
      veg11: { label: 'vegetation_011', displayName: '', url: `${CITY_FULL_PATH}/vegetation_011.glb` },
      veg12: { label: 'vegetation_012', displayName: '', url: `${CITY_FULL_PATH}/vegetation_012.glb` },
      bush6: { label: 'Bush_06', displayName: '', url: `${CITY_PATH}/Bush_06.glb` },
      bush7: { label: 'Bush_07', displayName: '', url: `${CITY_PATH}/Bush_07.glb` },
      bush10: { label: 'Bush_10', displayName: '', url: `${CITY_PATH}/Bush_10.glb` },
      palm: { label: 'Palm_001', displayName: 'Palmera', url: `${CHAR_PATH}/Palm_001.glb` },
      palm3: { label: 'Palm_03', displayName: '', url: `${CITY_PATH}/Palm_03.glb` },
    }
  },
  cityProps: {
    label: '🏙️ Mobiliario',
    items: {
      bench1: { label: 'bench_001', displayName: 'Banca 1', url: `${CITY_FULL_PATH}/bench_001.glb` },
      bench2: { label: 'bench_002', displayName: 'Banca 2', url: `${CITY_FULL_PATH}/bench_002.glb` },
      bench3: { label: 'bench_003', displayName: 'Banca 3', url: `${CITY_FULL_PATH}/bench_003.glb` },
      hydrant: { label: 'fire_hydrant_001', displayName: 'Hidrante', url: `${CITY_FULL_PATH}/fire_hydrant_001.glb` },
      phone1: { label: 'phone_box_001', displayName: 'Cabina Tel 1', url: `${CITY_FULL_PATH}/phone_box_001.glb` },
      phone2: { label: 'phone_box_002', displayName: 'Cabina Tel 2', url: `${CITY_FULL_PATH}/phone_box_002.glb` },
      table: { label: 'table_001', displayName: 'Mesa', url: `${CITY_FULL_PATH}/table_001.glb` },
      sunbed: { label: 'sunbed_001', displayName: 'Camastro', url: `${CITY_FULL_PATH}/sunbed_001.glb` },
      fountain: { label: 'Fountain_03', displayName: 'Fuente', url: `${CITY_PATH}/Fountain_03.glb` },
      busStop: { label: 'Bus_Stop_02', displayName: 'Parada Bus', url: `${CITY_PATH}/Bus_Stop_02.glb` },
      traffic1: { label: 'traffic_light_001', displayName: '', url: `${CITY_PATH}/traffic_light_001.glb` },
      traffic2: { label: 'traffic_light_002', displayName: '', url: `${CITY_PATH}/traffic_light_002.glb` },
      traffic3: { label: 'traffic_light_003', displayName: '', url: `${CITY_PATH}/traffic_light_003.glb` },
      spotlight1: { label: 'Spotlight_01', displayName: '', url: `${CITY_PATH}/Spotlight_01.glb` },
      spotlight2: { label: 'Spotlight_02', displayName: '', url: `${CITY_PATH}/Spotlight_02.glb` },
      signboard: { label: 'Signboard_01', displayName: '', url: `${CITY_PATH}/Signboard_01.glb` },
    }
  },
  trash: {
    label: '🗑️ Basura',
    items: {
      trash1: { label: 'trash_001', displayName: '', url: `${CITY_FULL_PATH}/trash_001.glb` },
      trash2: { label: 'trash_002', displayName: '', url: `${CITY_FULL_PATH}/trash_002.glb` },
      trash3: { label: 'trash_003', displayName: '', url: `${CITY_FULL_PATH}/trash_003.glb` },
      trash4: { label: 'trash_004', displayName: '', url: `${CITY_FULL_PATH}/trash_004.glb` },
      trash5: { label: 'trash_005', displayName: '', url: `${CITY_FULL_PATH}/trash_005.glb` },
      trashCan1: { label: 'Trash_can_001', displayName: '', url: `${CHAR_PATH}/Trash_can_001.glb` },
      trashCan4: { label: 'Trash_Can_04', displayName: '', url: `${CITY_PATH}/Trash_Can_04.glb` },
      trashCan5: { label: 'Trash_Can_05', displayName: '', url: `${CITY_PATH}/Trash_Can_05.glb` },
      trashCan6: { label: 'Trash_Can_06', displayName: '', url: `${CITY_PATH}/Trash_Can_06.glb` },
      trashCan7: { label: 'Trash_Can_07', displayName: '', url: `${CITY_PATH}/Trash_Can_07.glb` },
      trashCan8: { label: 'Trash_Can_08', displayName: '', url: `${CITY_PATH}/Trash_Can_08.glb` },
    }
  },
  billboards: {
    label: '📺 Anuncios',
    items: {
      bb2x1_3: { label: 'Billboard_2x1_03', displayName: '', url: `${CITY_PATH}/Billboard_2x1_03.glb` },
      bb2x1_5: { label: 'Billboard_2x1_05', displayName: '', url: `${CITY_PATH}/Billboard_2x1_05.glb` },
      bb4x1_3: { label: 'Billboard_4x1_03', displayName: '', url: `${CITY_PATH}/Billboard_4x1_03.glb` },
      bb4x1_4: { label: 'Billboard_4x1_04', displayName: '', url: `${CITY_PATH}/Billboard_4x1_04.glb` },
      graffiti: { label: 'Graffiti_03', displayName: '', url: `${CITY_PATH}/Graffiti_03.glb` },
    }
  },
  props: {
    label: '🎁 Props',
    items: {
      gift: { label: 'Gift_001', displayName: 'Regalo', url: `${CHAR_PATH}/Gift_001.glb` },
      flower: { label: 'Flower_001', displayName: 'Flor', url: `${CHAR_PATH}/Flower_001.glb` },
      nightstand: { label: 'Nightstand_001', displayName: '', url: `${CHAR_PATH}/Nightstand_001.glb` },
    }
  },
  // ============ MEGACITY PACK (requieren textura externa) - 809 assets ============
  mcAirport: {
    label: '📦 MC Airport',
    items: {
      smHangar02: { label: 'SM_Hangar_02', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_Hangar_02.glb`, megacity: true },
      smLight01: { label: 'SM_Light_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_Light_01.glb`, megacity: true },
      smLight02: { label: 'SM_Light_02', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_Light_02.glb`, megacity: true },
      smLight03: { label: 'SM_Light_03', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_Light_03.glb`, megacity: true },
      smLight04: { label: 'SM_Light_04', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_Light_04.glb`, megacity: true },
      smAirplane01: { label: 'SM_airplane_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_airplane_01.glb`, megacity: true },
      smAirportBuilding01: { label: 'SM_airport_building_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_airport_building_01.glb`, megacity: true },
      smAirportBuilding02: { label: 'SM_airport_building_02', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_airport_building_02.glb`, megacity: true },
      smAirportBus01: { label: 'SM_airport_bus_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_airport_bus_01.glb`, megacity: true },
      smBiplane01: { label: 'SM_biplane_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_biplane_01.glb`, megacity: true },
      smBoardingLadder01: { label: 'SM_boarding_ladder_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_boarding_ladder_01.glb`, megacity: true },
      smControlTower01: { label: 'SM_control_tower_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_control_tower_01.glb`, megacity: true },
      smControlTower02: { label: 'SM_control_tower_02', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_control_tower_02.glb`, megacity: true },
      smHangar01: { label: 'SM_hangar_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_hangar_01.glb`, megacity: true },
      smHelicopter01: { label: 'SM_helicopter_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_helicopter_01.glb`, megacity: true },
      smHelicopterPlace: { label: 'SM_helicopter_place', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_helicopter_place.glb`, megacity: true },
      smLoader01: { label: 'SM_loader_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_loader_01.glb`, megacity: true },
      smPlaques01: { label: 'SM_plaques_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_plaques_01.glb`, megacity: true },
      smRunwayStrip01: { label: 'SM_runway_strip_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_01.glb`, megacity: true },
      smRunwayStrip02: { label: 'SM_runway_strip_02', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_02.glb`, megacity: true },
      smRunwayStrip03: { label: 'SM_runway_strip_03', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_03.glb`, megacity: true },
      smRunwayStrip04: { label: 'SM_runway_strip_04', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_04.glb`, megacity: true },
      smRunwayStrip05: { label: 'SM_runway_strip_05', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_05.glb`, megacity: true },
      smRunwayStrip06: { label: 'SM_runway_strip_06', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_06.glb`, megacity: true },
      smRunwayStrip07: { label: 'SM_runway_strip_07', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_07.glb`, megacity: true },
      smRunwayStrip08: { label: 'SM_runway_strip_08', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_08.glb`, megacity: true },
      smRunwayStrip09: { label: 'SM_runway_strip_09', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_09.glb`, megacity: true },
      smRunwayStrip10: { label: 'SM_runway_strip_10', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_10.glb`, megacity: true },
      smRunwayStrip11: { label: 'SM_runway_strip_11', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_11.glb`, megacity: true },
      smRunwayStripGravel01: { label: 'SM_runway_strip_gravel_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_runway_strip_gravel_01.glb`, megacity: true },
      smWaterTower01: { label: 'SM_water_tower_01', displayName: '', url: `${MEGACITY_PATH}/Airport/SM_water_tower_01.glb`, megacity: true },
    }
  },
  mcBuildings: {
    label: '📦 MC Buildings',
    items: {
      smHouse01: { label: 'SM_House_01', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_01.glb`, megacity: true },
      smHouse02: { label: 'SM_House_02', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_02.glb`, megacity: true },
      smHouse04: { label: 'SM_House_04', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_04.glb`, megacity: true },
      smHouse05: { label: 'SM_House_05', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_05.glb`, megacity: true },
      smHouse06: { label: 'SM_House_06', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_06.glb`, megacity: true },
      smHouse07: { label: 'SM_House_07', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_07.glb`, megacity: true },
      smHouse08: { label: 'SM_House_08', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_House_08.glb`, megacity: true },
      smCottage01: { label: 'SM_cottage_01', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_cottage_01.glb`, megacity: true },
      smCottage02: { label: 'SM_cottage_02', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_cottage_02.glb`, megacity: true },
      smCottage03: { label: 'SM_cottage_03', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_cottage_03.glb`, megacity: true },
      smCottage04: { label: 'SM_cottage_04', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_cottage_04.glb`, megacity: true },
      smCottage05: { label: 'SM_cottage_05', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_cottage_05.glb`, megacity: true },
      smInfrastructure01: { label: 'SM_infrastructure_buildings_01', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_01.glb`, megacity: true },
      smInfrastructure02: { label: 'SM_infrastructure_buildings_02', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_02.glb`, megacity: true },
      smInfrastructure03: { label: 'SM_infrastructure_buildings_03', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_03.glb`, megacity: true },
      smInfrastructure04: { label: 'SM_infrastructure_buildings_04', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_04.glb`, megacity: true },
      smInfrastructure05: { label: 'SM_infrastructure_buildings_05', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_05.glb`, megacity: true },
      smInfrastructure06: { label: 'SM_infrastructure_buildings_06', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_06.glb`, megacity: true },
      smInfrastructure07: { label: 'SM_infrastructure_buildings_07', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_07.glb`, megacity: true },
      smInfrastructure08: { label: 'SM_infrastructure_buildings_08', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_08.glb`, megacity: true },
      smInfrastructure09: { label: 'SM_infrastructure_buildings_09', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_09.glb`, megacity: true },
      smInfrastructure010: { label: 'SM_infrastructure_buildings_010', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_010.glb`, megacity: true },
      smInfrastructure011: { label: 'SM_infrastructure_buildings_011', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_011.glb`, megacity: true },
      smInfrastructure012: { label: 'SM_infrastructure_buildings_012', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_012.glb`, megacity: true },
      smInfrastructure013: { label: 'SM_infrastructure_buildings_013', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_013.glb`, megacity: true },
      smInfrastructure014: { label: 'SM_infrastructure_buildings_014', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_014.glb`, megacity: true },
      smInfrastructure015: { label: 'SM_infrastructure_buildings_015', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_015.glb`, megacity: true },
      smInfrastructure016: { label: 'SM_infrastructure_buildings_016', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_016.glb`, megacity: true },
      smInfrastructure017: { label: 'SM_infrastructure_buildings_017', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_017.glb`, megacity: true },
      smInfrastructure018: { label: 'SM_infrastructure_buildings_018', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_018.glb`, megacity: true },
      smInfrastructure019: { label: 'SM_infrastructure_buildings_019', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_infrastructure_buildings_019.glb`, megacity: true },
      smOrdinaryHouses01: { label: 'SM_ordinary_houses_01', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_ordinary_houses_01.glb`, megacity: true },
      smOrdinaryHouses02: { label: 'SM_ordinary_houses_02', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_ordinary_houses_02.glb`, megacity: true },
      smOrdinaryHouses03: { label: 'SM_ordinary_houses_03', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_ordinary_houses_03.glb`, megacity: true },
      smOrdinaryHouses04: { label: 'SM_ordinary_houses_04', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_ordinary_houses_04.glb`, megacity: true },
      smOrdinaryHouses05: { label: 'SM_ordinary_houses_05', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_ordinary_houses_05.glb`, megacity: true },
      smSkyscraper01: { label: 'SM_skyscraper_01', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_01.glb`, megacity: true },
      smSkyscraper02: { label: 'SM_skyscraper_02', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_02.glb`, megacity: true },
      smSkyscraper03: { label: 'SM_skyscraper_03', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_03.glb`, megacity: true },
      smSkyscraper04: { label: 'SM_skyscraper_04', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_04.glb`, megacity: true },
      smSkyscraper05: { label: 'SM_skyscraper_05', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_05.glb`, megacity: true },
      smSkyscraper06: { label: 'SM_skyscraper_06', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_06.glb`, megacity: true },
      smSkyscraper07: { label: 'SM_skyscraper_07', displayName: '', url: `${MEGACITY_PATH}/Buildings/SM_skyscraper_07.glb`, megacity: true },
    }
  },
  mcVehicles: {
    label: '📦 MC Vehicles',
    items: {
      smAmbulance: { label: 'SM_Ambulance', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Ambulance.glb`, megacity: true },
      smCar01: { label: 'SM_Car_01', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Car_01.glb`, megacity: true },
      smFireEngine: { label: 'SM_Fire_Engine', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Fire_Engine.glb`, megacity: true },
      smMidlCar01: { label: 'SM_Midl_Car_01', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Midl_Car_01.glb`, megacity: true },
      smMidlCar02: { label: 'SM_Midl_Car_02', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Midl_Car_02.glb`, megacity: true },
      smPoliceCar: { label: 'SM_Police_Car', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Police_Car.glb`, megacity: true },
      smPremiumCar01: { label: 'SM_Premium_Car_01', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Premium_Car_01.glb`, megacity: true },
      smPremiumCar02: { label: 'SM_Premium_Car_02', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_Premium_Car_02.glb`, megacity: true },
      smTruck: { label: 'SM_truck', displayName: '', url: `${MEGACITY_PATH}/Vehicles/SM_truck.glb`, megacity: true },
    }
  },
  mcFarm: {
    label: '📦 MC Farm',
    items: {
      smCircle: { label: 'SM_Circle', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_Circle.glb`, megacity: true },
      smCabbage: { label: 'SM_cabbage', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_cabbage.glb`, megacity: true },
      smCanopy: { label: 'SM_canopy', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_canopy.glb`, megacity: true },
      smChickenCoop: { label: 'SM_chicken_coop', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_chicken_coop.glb`, megacity: true },
      smCowshed: { label: 'SM_cowshed', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_cowshed.glb`, megacity: true },
      smFarmHous: { label: 'SM_farm_hous', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_farm_hous.glb`, megacity: true },
      smFence01: { label: 'SM_fence_01', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fence_01.glb`, megacity: true },
      smFence02: { label: 'SM_fence_02', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fence_02.glb`, megacity: true },
      smFence03: { label: 'SM_fence_03', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fence_03.glb`, megacity: true },
      smFence04: { label: 'SM_fence_04', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fence_04.glb`, megacity: true },
      smFence06: { label: 'SM_fence_06', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fence_06.glb`, megacity: true },
      smFence07: { label: 'SM_fence_07', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fence_07.glb`, megacity: true },
      smFields01: { label: 'SM_fields_01', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fields_01.glb`, megacity: true },
      smFields02: { label: 'SM_fields_02', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_fields_02.glb`, megacity: true },
      smGarage: { label: 'SM_garage', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_garage.glb`, megacity: true },
      smGranary: { label: 'SM_granary', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_granary.glb`, megacity: true },
      smGreenhous: { label: 'SM_greenhous', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_greenhous.glb`, megacity: true },
      smHangar: { label: 'SM_hangar', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_hangar.glb`, megacity: true },
      smHarvester: { label: 'SM_harvester', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_harvester.glb`, megacity: true },
      smHaystack01: { label: 'SM_haystack_01', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_haystack_01.glb`, megacity: true },
      smHaystack02: { label: 'SM_haystack_02', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_haystack_02.glb`, megacity: true },
      smHaystack03: { label: 'SM_haystack_03', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_haystack_03.glb`, megacity: true },
      smLog: { label: 'SM_log', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_log.glb`, megacity: true },
      smOtherCrops: { label: 'SM_other_crops', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_other_crops.glb`, megacity: true },
      smPantry: { label: 'SM_pantry', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_pantry.glb`, megacity: true },
      smPlow01: { label: 'SM_plow_01', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_plow_01.glb`, megacity: true },
      smPlow02: { label: 'SM_plow_02', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_plow_02.glb`, megacity: true },
      smPlow03: { label: 'SM_plow_03', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_plow_03.glb`, megacity: true },
      smPumpkin: { label: 'SM_pumpkin', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_pumpkin.glb`, megacity: true },
      smScarecrow: { label: 'SM_scarecrow', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_scarecrow.glb`, megacity: true },
      smSunflower: { label: 'SM_sunflower', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_sunflower.glb`, megacity: true },
      smTractor: { label: 'SM_tractor', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_tractor.glb`, megacity: true },
      smTruckFarm: { label: 'SM_truck', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_truck.glb`, megacity: true },
      smWheat01: { label: 'SM_wheat_01', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_wheat_01.glb`, megacity: true },
      smWheat02: { label: 'SM_wheat_02', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_wheat_02.glb`, megacity: true },
      smWindmill: { label: 'SM_windmill', displayName: '', url: `${MEGACITY_PATH}/Farm/SM_windmill.glb`, megacity: true },
    }
  },
  mcRailwayDepot: {
    label: '📦 MC RailwayDepot',
    items: {
      smBrige01: { label: 'SM_Brige_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_Brige_01.glb`, megacity: true },
      smBrige02: { label: 'SM_Brige_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_Brige_02.glb`, megacity: true },
      smBrige03: { label: 'SM_Brige_03', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_Brige_03.glb`, megacity: true },
      smDepot: { label: 'SM_depot', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_depot.glb`, megacity: true },
      smElectricPole01: { label: 'SM_electric_pole_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_electric_pole_01.glb`, megacity: true },
      smElevator01: { label: 'SM_elevator_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_elevator_01.glb`, megacity: true },
      smElevator02: { label: 'SM_elevator_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_elevator_02.glb`, megacity: true },
      smFreightTrain01: { label: 'SM_freight_train_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_freight_train_01.glb`, megacity: true },
      smMonoraiDepot01: { label: 'SM_monorai_depot_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorai_depot_01.glb`, megacity: true },
      smMonorail01: { label: 'SM_monorail_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_01.glb`, megacity: true },
      smMonorail02: { label: 'SM_monorail_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_02.glb`, megacity: true },
      smMonorailStation01: { label: 'SM_monorail_station_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_station_01.glb`, megacity: true },
      smMonorailStation02: { label: 'SM_monorail_station_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_station_02.glb`, megacity: true },
      smMonorailTracks01: { label: 'SM_monorail_tracks_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01.glb`, megacity: true },
      smMonorailTracks01A: { label: 'SM_monorail_tracks_01_A', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01_A.glb`, megacity: true },
      smMonorailTracks01B: { label: 'SM_monorail_tracks_01_B', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01_B.glb`, megacity: true },
      smMonorailTracks01C: { label: 'SM_monorail_tracks_01_C', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01_C.glb`, megacity: true },
      smMonorailTracks01D: { label: 'SM_monorail_tracks_01_D', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01_D.glb`, megacity: true },
      smMonorailTracks01E: { label: 'SM_monorail_tracks_01_E', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01_E.glb`, megacity: true },
      smMonorailTracks01F: { label: 'SM_monorail_tracks_01_F', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_01_F.glb`, megacity: true },
      smMonorailTracks02: { label: 'SM_monorail_tracks_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_02.glb`, megacity: true },
      smMonorailTracks03: { label: 'SM_monorail_tracks_03', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_03.glb`, megacity: true },
      smMonorailTracks04: { label: 'SM_monorail_tracks_04', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_04.glb`, megacity: true },
      smMonorailTracks05: { label: 'SM_monorail_tracks_05', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_monorail_tracks_05.glb`, megacity: true },
      smPillar01: { label: 'SM_pillar_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_pillar_01.glb`, megacity: true },
      smPillar02: { label: 'SM_pillar_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_pillar_02.glb`, megacity: true },
      smPillar03: { label: 'SM_pillar_03', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_pillar_03.glb`, megacity: true },
      smPillarForMonorailStation01: { label: 'SM_pillar_for_monorail_station_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_pillar_for_monorail_station_01.glb`, megacity: true },
      smPillarForMonorailStation02: { label: 'SM_pillar_for_monorail_station_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_pillar_for_monorail_station_02.glb`, megacity: true },
      smPillarForMonorailStation03: { label: 'SM_pillar_for_monorail_station_03', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_pillar_for_monorail_station_03.glb`, megacity: true },
      smPlatform: { label: 'SM_platform', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_platform.glb`, megacity: true },
      smRails01: { label: 'SM_rails_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_01.glb`, megacity: true },
      smRails02: { label: 'SM_rails_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_02.glb`, megacity: true },
      smRails03: { label: 'SM_rails_03', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_03.glb`, megacity: true },
      smRails05: { label: 'SM_rails_05', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_05.glb`, megacity: true },
      smRails06: { label: 'SM_rails_06', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_06.glb`, megacity: true },
      smRails07: { label: 'SM_rails_07', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_07.glb`, megacity: true },
      smRails08: { label: 'SM_rails_08', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_rails_08.glb`, megacity: true },
      smRailwayCarriage01: { label: 'SM_railway_carriage_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_railway_carriage_01.glb`, megacity: true },
      smRailwayCarriage02: { label: 'SM_railway_carriage_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_railway_carriage_02.glb`, megacity: true },
      smRailwayStation01: { label: 'SM_railway_station_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_railway_station_01.glb`, megacity: true },
      smRailwayTrafficLight01: { label: 'SM_railway_traffic_light_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_railway_traffic_light_01.glb`, megacity: true },
      smStation: { label: 'SM_station', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_station.glb`, megacity: true },
      smSuburbanElectricTrain01: { label: 'SM_suburban_electric_train_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_suburban_electric_train_01.glb`, megacity: true },
      smSuburbanElectricTrain02: { label: 'SM_suburban_electric_train_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_suburban_electric_train_02.glb`, megacity: true },
      smTram01: { label: 'SM_tram_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_01.glb`, megacity: true },
      smTram02: { label: 'SM_tram_02', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_02.glb`, megacity: true },
      smTramDepot01: { label: 'SM_tram_depot_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_depot_01.glb`, megacity: true },
      smTramRails01: { label: 'SM_tram_rails_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_01.glb`, megacity: true },
      smTramRails03: { label: 'SM_tram_rails_03', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_03.glb`, megacity: true },
      smTramRails04: { label: 'SM_tram_rails_04', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_04.glb`, megacity: true },
      smTramRails05: { label: 'SM_tram_rails_05', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_05.glb`, megacity: true },
      smTramRails06: { label: 'SM_tram_rails_06', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_06.glb`, megacity: true },
      smTramRails07: { label: 'SM_tram_rails_07', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_07.glb`, megacity: true },
      smTramRails08: { label: 'SM_tram_rails_08', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_08.glb`, megacity: true },
      smTramRails09: { label: 'SM_tram_rails_09', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_rails_09.glb`, megacity: true },
      smTramStation01: { label: 'SM_tram_station_01', displayName: '', url: `${MEGACITY_PATH}/RailwayDepot/SM_tram_station_01.glb`, megacity: true },
    }
  },
  mcSeaPort: {
    label: '📦 MC SeaPort',
    items: {
      smLighthouse01: { label: 'SM_Lighthouse_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_Lighthouse_01.glb`, megacity: true },
      smShips01: { label: 'SM_Ships_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_Ships_01.glb`, megacity: true },
      smShips02: { label: 'SM_Ships_02', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_Ships_02.glb`, megacity: true },
      smBuilding01: { label: 'SM_building_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_building_01.glb`, megacity: true },
      smBuilding02: { label: 'SM_building_02', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_building_02.glb`, megacity: true },
      smBuilding03: { label: 'SM_building_03', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_building_03.glb`, megacity: true },
      smCargo01: { label: 'SM_cargo_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_cargo_01.glb`, megacity: true },
      smCargo02: { label: 'SM_cargo_02', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_cargo_02.glb`, megacity: true },
      smCargoTruck01: { label: 'SM_cargo_truck_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_cargo_truck_01.glb`, megacity: true },
      smCistern01: { label: 'SM_cistern_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_cistern_01.glb`, megacity: true },
      smContainer01: { label: 'SM_container_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_container_01.glb`, megacity: true },
      smContainer02: { label: 'SM_container_02', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_container_02.glb`, megacity: true },
      smCrane01: { label: 'SM_crane_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_crane_01.glb`, megacity: true },
      smFuelBarrel01: { label: 'SM_fuel_barrel_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_fuel_barrel_01.glb`, megacity: true },
      smLoader01: { label: 'SM_loader_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_loader_01.glb`, megacity: true },
      smPallet01: { label: 'SM_pallet_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_pallet_01.glb`, megacity: true },
      smPillarSP01: { label: 'SM_pillar_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_pillar_01.glb`, megacity: true },
      smRailas01: { label: 'SM_railas_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_railas_01.glb`, megacity: true },
      smTrailer01: { label: 'SM_trailer_01', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_trailer_01.glb`, megacity: true },
      smTrailer02: { label: 'SM_trailer_02', displayName: '', url: `${MEGACITY_PATH}/SeaPort/SM_trailer_02.glb`, megacity: true },
    }
  },
  mcSea: {
    label: '📦 MC Sea',
    items: {
      smAnchor: { label: 'SM_anchor', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_anchor.glb`, megacity: true },
      smBathyscaphe: { label: 'SM_bathyscaphe', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_bathyscaphe.glb`, megacity: true },
      smCoral01: { label: 'SM_coral_01', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_01.glb`, megacity: true },
      smCoral02: { label: 'SM_coral_02', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_02.glb`, megacity: true },
      smCoral03: { label: 'SM_coral_03', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_03.glb`, megacity: true },
      smCoral04: { label: 'SM_coral_04', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_04.glb`, megacity: true },
      smCoral05: { label: 'SM_coral_05', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_05.glb`, megacity: true },
      smCoral06: { label: 'SM_coral_06', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_06.glb`, megacity: true },
      smCoral07: { label: 'SM_coral_07', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_07.glb`, megacity: true },
      smCoral08: { label: 'SM_coral_08', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_08.glb`, megacity: true },
      smCoral09: { label: 'SM_coral_09', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_coral_09.glb`, megacity: true },
      smDeepWaterChute01: { label: 'SM_deep_water_chute_01', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_deep_water_chute_01.glb`, megacity: true },
      smDeepWaterChute02: { label: 'SM_deep_water_chute_02', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_deep_water_chute_02.glb`, megacity: true },
      smGeysers01: { label: 'SM_geysers_01', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_geysers_01.glb`, megacity: true },
      smGroundSea01: { label: 'SM_ground_01', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_ground_01.glb`, megacity: true },
      smGroundSea02: { label: 'SM_ground_02', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_ground_02.glb`, megacity: true },
      smGroundSea03: { label: 'SM_ground_03', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_ground_03.glb`, megacity: true },
      smGroundSea04: { label: 'SM_ground_04', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_ground_04.glb`, megacity: true },
      smGroundSea05: { label: 'SM_ground_05', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_ground_05.glb`, megacity: true },
      smGroundSea06: { label: 'SM_ground_06', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_ground_06.glb`, megacity: true },
      smShoal01: { label: 'SM_shoal_01', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_shoal_01.glb`, megacity: true },
      smShoal02: { label: 'SM_shoal_02', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_shoal_02.glb`, megacity: true },
      smSkeleton: { label: 'SM_skeleton', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_skeleton.glb`, megacity: true },
      smSunkenShip: { label: 'SM_sunken_ship', displayName: '', url: `${MEGACITY_PATH}/Sea/SM_sunken_ship.glb`, megacity: true },
    }
  },
  mcFence: {
    label: '📦 MC Fence',
    items: {
      smFence010: { label: 'SM_fence_010', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_010.glb`, megacity: true },
      smFence011A: { label: 'SM_fence_011_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_011_A.glb`, megacity: true },
      smFence011B: { label: 'SM_fence_011_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_011_B.glb`, megacity: true },
      smFence01A: { label: 'SM_fence_01_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_01_A.glb`, megacity: true },
      smFence01B: { label: 'SM_fence_01_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_01_B.glb`, megacity: true },
      smFence01C: { label: 'SM_fence_01_C', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_01_C.glb`, megacity: true },
      smFence01D: { label: 'SM_fence_01_D', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_01_D.glb`, megacity: true },
      smFence02A: { label: 'SM_fence_02_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_02_A.glb`, megacity: true },
      smFence02B: { label: 'SM_fence_02_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_02_B.glb`, megacity: true },
      smFence02C: { label: 'SM_fence_02_C', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_02_C.glb`, megacity: true },
      smFence02D: { label: 'SM_fence_02_D', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_02_D.glb`, megacity: true },
      smFence03A: { label: 'SM_fence_03_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_03_A.glb`, megacity: true },
      smFence03B: { label: 'SM_fence_03_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_03_B.glb`, megacity: true },
      smFence03C: { label: 'SM_fence_03_C', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_03_C.glb`, megacity: true },
      smFence03D: { label: 'SM_fence_03_D', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_03_D.glb`, megacity: true },
      smFence04A: { label: 'SM_fence_04_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_04_A.glb`, megacity: true },
      smFence04B: { label: 'SM_fence_04_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_04_B.glb`, megacity: true },
      smFence04C: { label: 'SM_fence_04_C', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_04_C.glb`, megacity: true },
      smFence04D: { label: 'SM_fence_04_D', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_04_D.glb`, megacity: true },
      smFence05A: { label: 'SM_fence_05_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_05_A.glb`, megacity: true },
      smFence05B: { label: 'SM_fence_05_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_05_B.glb`, megacity: true },
      smFence05C: { label: 'SM_fence_05_C', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_05_C.glb`, megacity: true },
      smFence05D: { label: 'SM_fence_05_D', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_05_D.glb`, megacity: true },
      smFence06A: { label: 'SM_fence_06_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_06_A.glb`, megacity: true },
      smFence06B: { label: 'SM_fence_06_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_06_B.glb`, megacity: true },
      smFenceF07: { label: 'SM_fence_07', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_07.glb`, megacity: true },
      smFence08: { label: 'SM_fence_08', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_08.glb`, megacity: true },
      smFence09A: { label: 'SM_fence_09_A', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_09_A.glb`, megacity: true },
      smFence09B: { label: 'SM_fence_09_B', displayName: '', url: `${MEGACITY_PATH}/Fence/SM_fence_09_B.glb`, megacity: true },
    }
  },
  mcRacingTrack: {
    label: '📦 MC RacingTrack',
    items: {
      smRaceCar01: { label: 'SM_car_01', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_car_01.glb`, megacity: true },
      smRaceCar02: { label: 'SM_car_02', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_car_02.glb`, megacity: true },
      smRaceCar03: { label: 'SM_car_03', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_car_03.glb`, megacity: true },
      smFencing01: { label: 'SM_fencing_01', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_01.glb`, megacity: true },
      smFencing02: { label: 'SM_fencing_02', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_02.glb`, megacity: true },
      smFencing03: { label: 'SM_fencing_03', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_03.glb`, megacity: true },
      smFencing03A: { label: 'SM_fencing_03_A', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_03_A.glb`, megacity: true },
      smFencing03B: { label: 'SM_fencing_03_B', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_03_B.glb`, megacity: true },
      smFencing03C: { label: 'SM_fencing_03_C', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_03_C.glb`, megacity: true },
      smFencing04: { label: 'SM_fencing_04', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_fencing_04.glb`, megacity: true },
      smFormulaOne: { label: 'SM_formula_one', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_formula_one.glb`, megacity: true },
      smTrack01: { label: 'SM_track_01', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_01.glb`, megacity: true },
      smTrack02: { label: 'SM_track_02', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_02.glb`, megacity: true },
      smTrack03: { label: 'SM_track_03', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_03.glb`, megacity: true },
      smTrack04: { label: 'SM_track_04', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_04.glb`, megacity: true },
      smTrack05: { label: 'SM_track_05', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_05.glb`, megacity: true },
      smTrack06: { label: 'SM_track_06', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_06.glb`, megacity: true },
      smTrack07: { label: 'SM_track_07', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_07.glb`, megacity: true },
      smTrack08: { label: 'SM_track_08', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_08.glb`, megacity: true },
      smTrack09: { label: 'SM_track_09', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_09.glb`, megacity: true },
      smTrackStartFinish: { label: 'SM_track_start_finish', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_track_start_finish.glb`, megacity: true },
      smTribunesRace: { label: 'SM_tribunes', displayName: '', url: `${MEGACITY_PATH}/RacingTrack/SM_tribunes.glb`, megacity: true },
    }
  },
  mcTech: {
    label: '📦 MC Tech',
    items: {
      smChimney01: { label: 'SM_CHIMNEY_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_CHIMNEY_01.glb`, megacity: true },
      smChimney02: { label: 'SM_CHIMNEY_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_CHIMNEY_02.glb`, megacity: true },
      smRts01: { label: 'SM_RTS_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_RTS_01.glb`, megacity: true },
      smTec01: { label: 'SM_TEC_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_TEC_01.glb`, megacity: true },
      smBasin01: { label: 'SM_basin_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_basin_01.glb`, megacity: true },
      smBasin02: { label: 'SM_basin_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_basin_02.glb`, megacity: true },
      smCheckpoint01: { label: 'SM_checkpoint_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_checkpoint_01.glb`, megacity: true },
      smControlPoint01: { label: 'SM_control_point_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_control_point_01.glb`, megacity: true },
      smDistributionPoint01: { label: 'SM_distribution_point_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_distribution_point_01.glb`, megacity: true },
      smElectricCoil01: { label: 'SM_electric_coil_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_electric_coil_01.glb`, megacity: true },
      smElectricCoil02: { label: 'SM_electric_coil_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_electric_coil_02.glb`, megacity: true },
      smElectricWindTurbine01: { label: 'SM_electric_wind_turbine_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_electric_wind_turbine_01.glb`, megacity: true },
      smGasPipeline01: { label: 'SM_gas_pipeline_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_gas_pipeline_01.glb`, megacity: true },
      smGasPipeline02: { label: 'SM_gas_pipeline_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_gas_pipeline_02.glb`, megacity: true },
      smGasPipeline03: { label: 'SM_gas_pipeline_03', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_gas_pipeline_03.glb`, megacity: true },
      smGasPipeline04: { label: 'SM_gas_pipeline_04', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_gas_pipeline_04.glb`, megacity: true },
      smGasPipeline05: { label: 'SM_gas_pipeline_05', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_gas_pipeline_05.glb`, megacity: true },
      smLocatingDish01: { label: 'SM_locating_dish_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_locating_dish_01.glb`, megacity: true },
      smLocatingDish02: { label: 'SM_locating_dish_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_locating_dish_02.glb`, megacity: true },
      smPiping01: { label: 'SM_piping_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_piping_01.glb`, megacity: true },
      smPiping02: { label: 'SM_piping_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_piping_02.glb`, megacity: true },
      smPiping03: { label: 'SM_piping_03', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_piping_03.glb`, megacity: true },
      smPiping04: { label: 'SM_piping_04', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_piping_04.glb`, megacity: true },
      smPowerLines01: { label: 'SM_power_lines_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_power_lines_01.glb`, megacity: true },
      smSolarPanel01: { label: 'SM_solar_panel_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_solar_panel_01.glb`, megacity: true },
      smSolarPanel02: { label: 'SM_solar_panel_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_solar_panel_02.glb`, megacity: true },
      smStorageTank01: { label: 'SM_storage_tank_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_storage_tank_01.glb`, megacity: true },
      smStorageTank02: { label: 'SM_storage_tank_02', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_storage_tank_02.glb`, megacity: true },
      smSwitchboard01: { label: 'SM_switchboard_01', displayName: '', url: `${MEGACITY_PATH}/Tech/SM_switchboard_01.glb`, megacity: true },
    }
  },
  mcText: {
    label: '📦 MC Text',
    items: {
      smLargeA: { label: 'SM_Large_A', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_A.glb`, megacity: true },
      smLargeB: { label: 'SM_Large_B', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_B.glb`, megacity: true },
      smLargeC: { label: 'SM_Large_C', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_C.glb`, megacity: true },
      smLargeD: { label: 'SM_Large_D', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_D.glb`, megacity: true },
      smLargeE: { label: 'SM_Large_E', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_E.glb`, megacity: true },
      smLargeF: { label: 'SM_Large_F', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_F.glb`, megacity: true },
      smLargeG: { label: 'SM_Large_G', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_G.glb`, megacity: true },
      smLargeH: { label: 'SM_Large_H', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_H.glb`, megacity: true },
      smLargeI: { label: 'SM_Large_I', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_I.glb`, megacity: true },
      smLargeJ: { label: 'SM_Large_J', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_J.glb`, megacity: true },
      smLargeK: { label: 'SM_Large_K', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_K.glb`, megacity: true },
      smLargeL: { label: 'SM_Large_L', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_L.glb`, megacity: true },
      smLargeM: { label: 'SM_Large_M', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_M.glb`, megacity: true },
      smLargeN: { label: 'SM_Large_N', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_N.glb`, megacity: true },
      smLargeO: { label: 'SM_Large_O', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_O.glb`, megacity: true },
      smLargeP: { label: 'SM_Large_P', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_P.glb`, megacity: true },
      smLargeQ: { label: 'SM_Large_Q', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_Q.glb`, megacity: true },
      smLargeR: { label: 'SM_Large_R', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_R.glb`, megacity: true },
      smLargeS: { label: 'SM_Large_S', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_S.glb`, megacity: true },
      smLargeT: { label: 'SM_Large_T', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_T.glb`, megacity: true },
      smLargeU: { label: 'SM_Large_U', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_U.glb`, megacity: true },
      smLargeV: { label: 'SM_Large_V', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_V.glb`, megacity: true },
      smLargeW: { label: 'SM_Large_W', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_W.glb`, megacity: true },
      smLargeX: { label: 'SM_Large_X', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_X.glb`, megacity: true },
      smLargeY: { label: 'SM_Large_Y', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_Y.glb`, megacity: true },
      smLargeZ: { label: 'SM_Large_Z', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Large_Z.glb`, megacity: true },
      smNum0: { label: 'SM_Num_0', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_0.glb`, megacity: true },
      smNum1: { label: 'SM_Num_1', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_1.glb`, megacity: true },
      smNum2: { label: 'SM_Num_2', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_2.glb`, megacity: true },
      smNum3: { label: 'SM_Num_3', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_3.glb`, megacity: true },
      smNum4: { label: 'SM_Num_4', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_4.glb`, megacity: true },
      smNum5: { label: 'SM_Num_5', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_5.glb`, megacity: true },
      smNum6: { label: 'SM_Num_6', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_6.glb`, megacity: true },
      smNum7: { label: 'SM_Num_7', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_7.glb`, megacity: true },
      smNum8: { label: 'SM_Num_8', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_8.glb`, megacity: true },
      smNum9: { label: 'SM_Num_9', displayName: '', url: `${MEGACITY_PATH}/Text/SM_Num_9.glb`, megacity: true },
    }
  }
}

type AssetCategory = keyof typeof ASSET_CATALOG

// Placement type for saved positions
interface MapPlacement {
  id: string
  category: AssetCategory
  assetKey: string
  position: [number, number, number]
  rotation: number
  scale: number
  megacity?: boolean  // true = necesita textura externa (MegaCity pack)
  customName?: string // nombre personalizado editable
}

// Loading component with progress
const Loader = () => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="bg-black/90 text-white px-8 py-6 rounded-2xl text-center min-w-[280px]">
        <div className="text-4xl mb-4 animate-bounce">🚚</div>
        <div className="text-xl font-bold mb-2">Cargando ciudad...</div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-coral h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-400">{Math.round(progress)}%</div>
      </div>
    </Html>
  )
}

// Coordinate Marker - visual indicator where you clicked
const CoordMarker: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={position}>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#ff0000" />
  </mesh>
)

// 3D Scene - city and controls
const Scene: React.FC<{
  zone: CityZone
  editorMode: boolean
  onCoordCapture: (coord: [number, number, number]) => void
  markers: [number, number, number][]
  placements: MapPlacement[]
}> = ({ zone, editorMode, onCoordCapture, markers, placements }) => {

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!editorMode) return
    e.stopPropagation()
    const point = e.point
    const coord: [number, number, number] = [
      Math.round(point.x * 10) / 10,
      Math.round(point.y * 10) / 10,
      Math.round(point.z * 10) / 10
    ]
    onCoordCapture(coord)
  }, [editorMode, onCoordCapture])

  return (
    <>
      {/* Camera - positioned based on zone */}
      <PerspectiveCamera
        makeDefault
        position={zone.cameraPosition}
        fov={60}
      />

      {/* Controls - extended zoom for city overview */}
      <OrbitControls
        target={zone.center}
        minDistance={10}
        maxDistance={300}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.1}
        enablePan={true}
        panSpeed={0.8}
      />

      {/* Background sky color */}
      <color attach="background" args={['#7ec8e3']} />

      {/* Ambient light - higher = softer/lighter shadows */}
      <ambientLight intensity={0.6} />

      {/* Main sun light - shadows disabled for test */}
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.2}
        color="#fffaf0"
      />

      {/* Fill light */}
      <directionalLight
        position={[-50, 50, -50]}
        intensity={0.3}
        color="#b0d0ff"
      />

      {/* Hemisphere for color variation */}
      <hemisphereLight
        args={['#87ceeb', '#90785a', 0.35]}
      />

      {/* Complete City Scene */}
      <Suspense fallback={null}>
        <CityScene position={[0, 0, 0]} scale={1} onClick={handleClick} />
      </Suspense>

      {/* Assets placed via editor */}

      {/* Editor placed assets */}
      <PlacedAssets placements={placements} />

      {/* Editor mode markers */}
      {editorMode && markers.map((pos, i) => (
        <CoordMarker key={i} position={pos} />
      ))}
    </>
  )
}

// Helper to get asset URL
const getAssetUrl = (category: AssetCategory, assetKey: string): string | null => {
  const cat = ASSET_CATALOG[category]
  if (!cat?.items) return null
  const items = cat.items as Record<string, { label: string; url: string }>
  return items[assetKey]?.url || null
}

// Helper to check if asset is from MegaCity pack (needs external texture)
const isAssetMegacity = (category: AssetCategory, assetKey: string): boolean => {
  const cat = ASSET_CATALOG[category]
  if (!cat?.items) return false
  const items = cat.items as Record<string, { megacity?: boolean }>
  return items[assetKey]?.megacity === true
}

// Helper to get asset label (displayName if set, otherwise label)
const getAssetLabel = (category: AssetCategory, assetKey: string): string => {
  const cat = ASSET_CATALOG[category]
  if (!cat?.items) return assetKey
  const items = cat.items as Record<string, { label: string; displayName: string; url: string }>
  const item = items[assetKey]
  if (!item) return assetKey
  // Si displayName está definido y no está vacío, usarlo; si no, usar label
  return item.displayName || item.label
}

// Render placed assets from editor
const PlacedAssets: React.FC<{ placements: MapPlacement[] }> = ({ placements }) => {
  return (
    <>
      {placements.map(p => {
        const url = getAssetUrl(p.category, p.assetKey)
        if (!url) return null

        // Usar MegaCityVehicle si el asset necesita textura externa
        const VehicleComponent = p.megacity ? MegaCityVehicle : StaticVehicle

        return (
          <Suspense key={p.id} fallback={null}>
            <VehicleComponent
              url={url}
              position={p.position}
              rotation={p.rotation}
              scale={p.scale}
            />
          </Suspense>
        )
      })}
    </>
  )
}

// Rotation presets
const ROTATION_PRESETS = [
  { label: '↑ N', value: 0 },
  { label: '→ E', value: Math.PI / 2 },
  { label: '↓ S', value: Math.PI },
  { label: '← O', value: -Math.PI / 2 },
  { label: '↗ NE', value: Math.PI / 4 },
  { label: '↘ SE', value: (3 * Math.PI) / 4 },
  { label: '↙ SO', value: -(3 * Math.PI) / 4 },
  { label: '↖ NO', value: -Math.PI / 4 },
]

// Level/height presets
const LEVEL_PRESETS = [
  { label: '🚗 Terrestre', value: 0, desc: 'Suelo normal' },
  { label: '🚁 Aéreo Bajo', value: 25, desc: 'Sobre edificios bajos' },
  { label: '✈️ Aéreo', value: 50, desc: 'Sobre la ciudad' },
  { label: '🛸 Aéreo Alto', value: 80, desc: 'Muy alto' },
  { label: '🚤 Acuático', value: -0.5, desc: 'Nivel del agua' },
]

// Asset Selector Popup
const AssetSelectorPopup: React.FC<{
  position: [number, number, number]
  onSelect: (category: AssetCategory, assetKey: string, rotation: number, heightOffset: number) => void
  onCancel: () => void
}> = ({ position, onSelect, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [heightOffset, setHeightOffset] = useState(0)

  const handleAssetClick = (key: string) => {
    setSelectedAsset(key)
  }

  const handleConfirm = () => {
    if (selectedCategory && selectedAsset) {
      onSelect(selectedCategory, selectedAsset, rotation, heightOffset)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-gray-900 rounded-xl p-4 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="text-white font-bold mb-2 text-center">
          Agregar elemento en [{position.map(p => p.toFixed(1)).join(', ')}]
        </div>

        {!selectedCategory ? (
          <>
            <div className="text-gray-400 text-sm mb-3 text-center">Selecciona categoría:</div>
            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
              {(Object.keys(ASSET_CATALOG) as AssetCategory[]).map(cat => {
                const isMCCategory = cat.startsWith('mc')
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`${isMCCategory ? 'bg-purple-900 hover:bg-purple-800' : 'bg-gray-800 hover:bg-gray-700'} text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap`}
                  >
                    {ASSET_CATALOG[cat].label}
                  </button>
                )
              })}
            </div>
          </>
        ) : !selectedAsset ? (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-white text-sm mb-2"
            >
              ← Volver
            </button>
            <div className="text-gray-400 text-sm mb-3">{ASSET_CATALOG[selectedCategory].label}:</div>
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
              {Object.entries(ASSET_CATALOG[selectedCategory].items).map(([key, item]) => {
                const isMC = (item as { megacity?: boolean }).megacity
                return (
                  <button
                    key={key}
                    onClick={() => handleAssetClick(key)}
                    className={`${isMC ? 'bg-purple-600 hover:bg-purple-500' : 'bg-coral hover:bg-coral/80'} text-white p-2 rounded-lg text-sm text-left flex flex-col`}
                  >
                    <span className="font-bold">
                      {isMC && <span className="mr-1">◆</span>}
                      {item.displayName || item.label}
                    </span>
                    {item.displayName && (
                      <span className="text-xs text-white/70">{item.label}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-gray-400 hover:text-white text-sm mb-2"
            >
              ← Cambiar asset
            </button>
            <div className="text-center mb-3">
              <div className="text-coral font-bold text-lg">
                {getAssetLabel(selectedCategory, selectedAsset)}
              </div>
              <div className="text-gray-400 text-xs">
                {(ASSET_CATALOG[selectedCategory].items as Record<string, { label: string }>)[selectedAsset]?.label}
              </div>
            </div>

            {/* Nivel/Altura */}
            <div className="text-gray-400 text-sm mb-2">Nivel:</div>
            <div className="grid grid-cols-2 gap-1 mb-3">
              {LEVEL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setHeightOffset(preset.value)}
                  className={`p-2 rounded text-xs transition-all ${
                    heightOffset === preset.value
                      ? 'bg-agua text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Dirección */}
            <div className="text-gray-400 text-sm mb-2">Dirección:</div>
            <div className="grid grid-cols-4 gap-1 mb-4">
              {ROTATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setRotation(preset.value)}
                  className={`p-2 rounded text-xs transition-all ${
                    Math.abs(rotation - preset.value) < 0.01
                      ? 'bg-coral text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg font-bold"
            >
              ✓ Colocar
            </button>
          </>
        )}

        <button
          onClick={onCancel}
          className="mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// Main Component - simple explorer
export const GameScene3D: React.FC<{
  zoneId?: string
}> = ({
  zoneId = 'centro',
}) => {
  const [currentZoneId, setCurrentZoneId] = useState(zoneId)
  const [editorMode, setEditorMode] = useState(false)
  const [placements, setPlacements] = useState<MapPlacement[]>([])
  const [pendingPosition, setPendingPosition] = useState<[number, number, number] | null>(null)
  const [markers, setMarkers] = useState<[number, number, number][]>([])
  const zone = getZone(currentZoneId)

  const handleCoordCapture = useCallback((coord: [number, number, number]) => {
    setPendingPosition(coord)
    setMarkers(prev => [...prev, coord])
  }, [])

  const handleAssetSelect = useCallback((category: AssetCategory, assetKey: string, rotation: number, heightOffset: number) => {
    if (!pendingPosition) return

    // Apply height offset to Y position
    const adjustedPosition: [number, number, number] = [
      pendingPosition[0],
      pendingPosition[1] + heightOffset,
      pendingPosition[2]
    ]

    // Detectar si es un asset MegaCity (necesita textura externa)
    const isMegacity = isAssetMegacity(category, assetKey)

    const newPlacement: MapPlacement = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      category,
      assetKey,
      position: adjustedPosition,
      rotation,
      scale: category === 'characters' ? 3 : 1,
      megacity: isMegacity,
    }

    setPlacements(prev => [...prev, newPlacement])
    setPendingPosition(null)
  }, [pendingPosition])

  const handleCancelSelect = useCallback(() => {
    setPendingPosition(null)
    // Remove last marker
    setMarkers(prev => prev.slice(0, -1))
  }, [])

  const clearAll = useCallback(() => {
    setPlacements([])
    setMarkers([])
  }, [])

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(placements, null, 2)
    navigator.clipboard.writeText(json)
    alert('JSON copiado al clipboard!')
  }, [placements])

  const downloadJSON = useCallback(() => {
    const json = JSON.stringify(placements, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `city-placements-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [placements])

  const removePlacement = useCallback((id: string) => {
    setPlacements(prev => prev.filter(p => p.id !== id))
  }, [])

  const updatePlacementName = useCallback((id: string, customName: string) => {
    setPlacements(prev => prev.map(p =>
      p.id === id ? { ...p, customName } : p
    ))
  }, [])

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Canvas - shadows disabled for performance test */}
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          powerPreference: 'high-performance',
        }}
        dpr={[1.5, 2]}
      >
        <Suspense fallback={<Loader />}>
          <Scene
            key={zone.id}
            zone={zone}
            editorMode={editorMode}
            onCoordCapture={handleCoordCapture}
            markers={markers}
            placements={placements}
          />
        </Suspense>
      </Canvas>

      {/* Zone selector - always visible */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Current zone info */}
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{zone.icono}</span>
            <div>
              <div className="font-bold text-lg">{zone.nombre}</div>
              <div className="text-xs text-gray-300">{zone.descripcion}</div>
            </div>
          </div>
        </div>

        {/* Zone buttons */}
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2">
          <div className="text-white text-xs mb-2 font-bold">Zonas:</div>
          <div className="flex gap-2 flex-wrap">
            {ZONE_LIST.map((z) => (
              <button
                key={z.id}
                onClick={() => setCurrentZoneId(z.id)}
                className={`px-3 py-2 rounded-lg text-lg transition-all ${
                  z.id === zone.id
                    ? 'bg-coral text-white scale-110 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/40 hover:scale-105'
                }`}
                title={z.nombre}
              >
                {z.icono}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-sm">
        <div className="font-bold mb-1">Controles:</div>
        <div className="text-gray-300 text-xs">
          🖱️ Arrastrar = Rotar<br/>
          🔍 Scroll = Zoom<br/>
          👆 Click derecho + arrastrar = Mover
        </div>
      </div>

      {/* Coordinates debug */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-xs font-mono">
        Centro: [{zone.center.join(', ')}]
      </div>

      {/* Editor Mode Toggle */}
      <button
        onClick={() => setEditorMode(!editorMode)}
        className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg font-bold transition-all ${
          editorMode
            ? 'bg-red-500 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {editorMode ? '🎯 MODO EDITOR ON' : '🎯 Editor Mode'}
      </button>

      {/* Editor Panel - shows placements */}
      {editorMode && (
        <div className="absolute top-20 left-4 bg-black/90 backdrop-blur-sm rounded-xl px-4 py-3 text-white w-72">
          <div className="font-bold mb-2">🎯 Editor de Mapa</div>
          <div className="text-xs text-gray-400 mb-3">Click en el mapa para agregar elementos</div>

          {placements.length > 0 && (
            <>
              <div className="text-sm font-bold mb-1">Elementos ({placements.length}):</div>
              <div className="bg-gray-800 rounded p-2 max-h-60 overflow-y-auto text-xs mb-3">
                {placements.map((p) => {
                  const cat = ASSET_CATALOG[p.category]
                  const items = cat?.items as Record<string, { label: string; displayName: string }> | undefined
                  const item = items?.[p.assetKey]
                  const fileName = item?.label || p.assetKey

                  return (
                    <div key={p.id} className="py-2 border-b border-gray-700 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col flex-1">
                          <span className="text-gray-400 text-[10px]">
                            {p.megacity && <span className="text-purple-400 mr-1">◆</span>}
                            {fileName}
                          </span>
                        </div>
                        <button
                          onClick={() => removePlacement(p.id)}
                          className="text-red-400 hover:text-red-300 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        value={p.customName || ''}
                        onChange={(e) => updatePlacementName(p.id, e.target.value)}
                        placeholder="Nombre personalizado..."
                        className="w-full bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-coral focus:outline-none"
                      />
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportJSON}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
                >
                  📋 Copiar JSON
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                >
                  💾 Descargar
                </button>
              </div>
              <button
                onClick={clearAll}
                className="mt-2 w-full bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm"
              >
                🗑️ Limpiar Todo
              </button>
            </>
          )}

          {placements.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              Sin elementos aún.<br/>Haz click en el mapa.
            </div>
          )}
        </div>
      )}

      {/* Asset Selector Popup */}
      {pendingPosition && (
        <AssetSelectorPopup
          position={pendingPosition}
          onSelect={handleAssetSelect}
          onCancel={handleCancelSelect}
        />
      )}
    </div>
  )
}

// Preload city model
useGLTF.preload('/assets/models/City/CityFull/City_2.glb')

export default GameScene3D
