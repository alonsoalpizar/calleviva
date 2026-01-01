// GameScene3D.tsx - City exploration with zone selection
// Clean 3D city viewer without post-processing (for stability)

import React, { useState, Suspense, useCallback, useRef, useEffect } from 'react'
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber'
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
  },
  mcLandscape: {
    label: '🌳 MC Landscape',
    items: {
      smLand01: { label: 'SM_Land_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_01.glb`, megacity: true },
      smLand01A: { label: 'SM_Land_01_A', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_01_A.glb`, megacity: true },
      smLand01B: { label: 'SM_Land_01_B', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_01_B.glb`, megacity: true },
      smLand01C: { label: 'SM_Land_01_C', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_01_C.glb`, megacity: true },
      smLand01D: { label: 'SM_Land_01_D', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_01_D.glb`, megacity: true },
      smLand02: { label: 'SM_Land_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_02.glb`, megacity: true },
      smLand02A: { label: 'SM_Land_02_A', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_02_A.glb`, megacity: true },
      smLand02B: { label: 'SM_Land_02_B', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_02_B.glb`, megacity: true },
      smLand02C: { label: 'SM_Land_02_C', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_02_C.glb`, megacity: true },
      smLand02D: { label: 'SM_Land_02_D', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_02_D.glb`, megacity: true },
      smLand03A: { label: 'SM_Land_03_A', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_03_A.glb`, megacity: true },
      smLand03B: { label: 'SM_Land_03_B', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_03_B.glb`, megacity: true },
      smLand03C: { label: 'SM_Land_03_C', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_03_C.glb`, megacity: true },
      smLand03D: { label: 'SM_Land_03_D', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_03_D.glb`, megacity: true },
      smLand03E: { label: 'SM_Land_03_E', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_03_E.glb`, megacity: true },
      smLand03F: { label: 'SM_Land_03_F', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_03_F.glb`, megacity: true },
      smLand04A: { label: 'SM_Land_04_A', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_A.glb`, megacity: true },
      smLand04B: { label: 'SM_Land_04_B', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_B.glb`, megacity: true },
      smLand04C: { label: 'SM_Land_04_C', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_C.glb`, megacity: true },
      smLand04D: { label: 'SM_Land_04_D', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_D.glb`, megacity: true },
      smLand04E: { label: 'SM_Land_04_E', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_E.glb`, megacity: true },
      smLand04F: { label: 'SM_Land_04_F', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_F.glb`, megacity: true },
      smLand04G: { label: 'SM_Land_04_G', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_Land_04_G.glb`, megacity: true },
      smBush01: { label: 'SM_bush_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_bush_01.glb`, megacity: true },
      smBush02: { label: 'SM_bush_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_bush_02.glb`, megacity: true },
      smBush03: { label: 'SM_bush_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_bush_03.glb`, megacity: true },
      smBush04: { label: 'SM_bush_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_bush_04.glb`, megacity: true },
      smBush05: { label: 'SM_bush_05', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_bush_05.glb`, megacity: true },
      smFlower01: { label: 'SM_flower_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_flower_01.glb`, megacity: true },
      smFlowerBed01: { label: 'SM_flower_bed_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_flower_bed_01.glb`, megacity: true },
      smFlowerBed02: { label: 'SM_flower_bed_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_flower_bed_02.glb`, megacity: true },
      smGround01: { label: 'SM_ground_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ground_01.glb`, megacity: true },
      smGround02: { label: 'SM_ground_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ground_02.glb`, megacity: true },
      smGround03: { label: 'SM_ground_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ground_03.glb`, megacity: true },
      smGround04: { label: 'SM_ground_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ground_04.glb`, megacity: true },
      smGround05: { label: 'SM_ground_05', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ground_05.glb`, megacity: true },
      smGround06: { label: 'SM_ground_06', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ground_06.glb`, megacity: true },
      smHighGrass01: { label: 'SM_high_grass_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_high_grass_01.glb`, megacity: true },
      smHighGrass09: { label: 'SM_high_grass_09', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_high_grass_09.glb`, megacity: true },
      smHightTree01: { label: 'SM_hight_tree_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_01.glb`, megacity: true },
      smHightTree02: { label: 'SM_hight_tree_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_02.glb`, megacity: true },
      smHightTree03: { label: 'SM_hight_tree_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_03.glb`, megacity: true },
      smHightTree04: { label: 'SM_hight_tree_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_04.glb`, megacity: true },
      smHightTree05: { label: 'SM_hight_tree_05', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_05.glb`, megacity: true },
      smHightTree06: { label: 'SM_hight_tree_06', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_06.glb`, megacity: true },
      smHightTree07: { label: 'SM_hight_tree_07', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_07.glb`, megacity: true },
      smHightTree08: { label: 'SM_hight_tree_08', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_08.glb`, megacity: true },
      smHightTree09: { label: 'SM_hight_tree_09', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_09.glb`, megacity: true },
      smHightTree10: { label: 'SM_hight_tree_10', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_10.glb`, megacity: true },
      smHightTree11: { label: 'SM_hight_tree_11', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_11.glb`, megacity: true },
      smHightTree12: { label: 'SM_hight_tree_12', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_12.glb`, megacity: true },
      smHightTree13: { label: 'SM_hight_tree_13', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_13.glb`, megacity: true },
      smHightTree14: { label: 'SM_hight_tree_14', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_14.glb`, megacity: true },
      smHightTree15: { label: 'SM_hight_tree_15', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_15.glb`, megacity: true },
      smHightTree16: { label: 'SM_hight_tree_16', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_16.glb`, megacity: true },
      smHightTree17: { label: 'SM_hight_tree_17', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_17.glb`, megacity: true },
      smHightTree18: { label: 'SM_hight_tree_18', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_hight_tree_18.glb`, megacity: true },
      smIvy: { label: 'SM_ivy', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_ivy.glb`, megacity: true },
      smLog01: { label: 'SM_log_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_log_01.glb`, megacity: true },
      smMoss01: { label: 'SM_moss_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_moss_01.glb`, megacity: true },
      smMoss02: { label: 'SM_moss_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_moss_02.glb`, megacity: true },
      smPath01: { label: 'SM_path_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_path_01.glb`, megacity: true },
      smPath02: { label: 'SM_path_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_path_02.glb`, megacity: true },
      smPath03: { label: 'SM_path_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_path_03.glb`, megacity: true },
      smPath04: { label: 'SM_path_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_path_04.glb`, megacity: true },
      smRiver01: { label: 'SM_river_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_river_01.glb`, megacity: true },
      smRiver02: { label: 'SM_river_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_river_02.glb`, megacity: true },
      smRiver03: { label: 'SM_river_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_river_03.glb`, megacity: true },
      smRiver04: { label: 'SM_river_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_river_04.glb`, megacity: true },
      smRiver05: { label: 'SM_river_05', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_river_05.glb`, megacity: true },
      smRock01: { label: 'SM_rock_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_rock_01.glb`, megacity: true },
      smRock02: { label: 'SM_rock_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_rock_02.glb`, megacity: true },
      smRock03: { label: 'SM_rock_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_rock_03.glb`, megacity: true },
      smSmallTee06: { label: 'SM_small_tee_06', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_small_tee_06.glb`, megacity: true },
      smSmallTree01: { label: 'SM_small_tree_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_small_tree_01.glb`, megacity: true },
      smSmallTree02: { label: 'SM_small_tree_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_small_tree_02.glb`, megacity: true },
      smSmallTree03: { label: 'SM_small_tree_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_small_tree_03.glb`, megacity: true },
      smSmallTree04: { label: 'SM_small_tree_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_small_tree_04.glb`, megacity: true },
      smSmallTree05: { label: 'SM_small_tree_05', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_small_tree_05.glb`, megacity: true },
      smStone01: { label: 'SM_stone_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_stone_01.glb`, megacity: true },
      smStone02: { label: 'SM_stone_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_stone_02.glb`, megacity: true },
      smStone03: { label: 'SM_stone_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_stone_03.glb`, megacity: true },
      smStone04: { label: 'SM_stone_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_stone_04.glb`, megacity: true },
      smStone05: { label: 'SM_stone_05', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_stone_05.glb`, megacity: true },
      smTallPlant01: { label: 'SM_tall_plant_01', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_tall_plant_01.glb`, megacity: true },
      smTallPlant02: { label: 'SM_tall_plant_02', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_tall_plant_02.glb`, megacity: true },
      smTallPlant03: { label: 'SM_tall_plant_03', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_tall_plant_03.glb`, megacity: true },
      smTallPlant04: { label: 'SM_tall_plant_04', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_tall_plant_04.glb`, megacity: true },
      smWaterLily: { label: 'SM_water_lily', displayName: '', url: `${MEGACITY_PATH}/Landscape/SM_water_lily.glb`, megacity: true },
    }
  },
  mcRoads: {
    label: '🛣️ MC Roads',
    items: {
      smBridge: { label: 'SM_Bridge', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_Bridge.glb`, megacity: true },
      smBrige01: { label: 'SM_brige_01', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_01.glb`, megacity: true },
      smBrige010: { label: 'SM_brige_010', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_010.glb`, megacity: true },
      smBrige011: { label: 'SM_brige_011', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_011.glb`, megacity: true },
      smBrige012: { label: 'SM_brige_012', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_012.glb`, megacity: true },
      smBrige013: { label: 'SM_brige_013', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_013.glb`, megacity: true },
      smBrige013A: { label: 'SM_brige_013_A', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_013_A.glb`, megacity: true },
      smBrige014: { label: 'SM_brige_014', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_014.glb`, megacity: true },
      smBrige015: { label: 'SM_brige_015', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_015.glb`, megacity: true },
      smBrige016: { label: 'SM_brige_016', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_016.glb`, megacity: true },
      smBrige017: { label: 'SM_brige_017', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_017.glb`, megacity: true },
      smBrige018: { label: 'SM_brige_018', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_018.glb`, megacity: true },
      smBrige02: { label: 'SM_brige_02', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_02.glb`, megacity: true },
      smBrige03: { label: 'SM_brige_03', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_03.glb`, megacity: true },
      smBrige04: { label: 'SM_brige_04', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_04.glb`, megacity: true },
      smBrige05: { label: 'SM_brige_05', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_05.glb`, megacity: true },
      smBrige06: { label: 'SM_brige_06', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_06.glb`, megacity: true },
      smBrige07: { label: 'SM_brige_07', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_07.glb`, megacity: true },
      smBrige08: { label: 'SM_brige_08', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_08.glb`, megacity: true },
      smBrige09: { label: 'SM_brige_09', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_brige_09.glb`, megacity: true },
      smPillar01: { label: 'SM_pillar_01', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_pillar_01.glb`, megacity: true },
      smPillar02: { label: 'SM_pillar_02', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_pillar_02.glb`, megacity: true },
      smPillar03: { label: 'SM_pillar_03', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_pillar_03.glb`, megacity: true },
      smPillar04: { label: 'SM_pillar_04', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_pillar_04.glb`, megacity: true },
      smRoad01: { label: 'SM_road_01', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_01.glb`, megacity: true },
      smRoad010: { label: 'SM_road_010', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_010.glb`, megacity: true },
      smRoad011: { label: 'SM_road_011', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_011.glb`, megacity: true },
      smRoad012: { label: 'SM_road_012', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_012.glb`, megacity: true },
      smRoad013: { label: 'SM_road_013', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_013.glb`, megacity: true },
      smRoad014: { label: 'SM_road_014', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_014.glb`, megacity: true },
      smRoad015: { label: 'SM_road_015', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_015.glb`, megacity: true },
      smRoad016: { label: 'SM_road_016', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_016.glb`, megacity: true },
      smRoad017: { label: 'SM_road_017', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_017.glb`, megacity: true },
      smRoad018: { label: 'SM_road_018', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_018.glb`, megacity: true },
      smRoad019: { label: 'SM_road_019', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_019.glb`, megacity: true },
      smRoad02: { label: 'SM_road_02', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_02.glb`, megacity: true },
      smRoad020: { label: 'SM_road_020', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_020.glb`, megacity: true },
      smRoad021: { label: 'SM_road_021', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_021.glb`, megacity: true },
      smRoad022: { label: 'SM_road_022', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_022.glb`, megacity: true },
      smRoad023: { label: 'SM_road_023', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_023.glb`, megacity: true },
      smRoad024: { label: 'SM_road_024', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_024.glb`, megacity: true },
      smRoad025: { label: 'SM_road_025', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_025.glb`, megacity: true },
      smRoad026: { label: 'SM_road_026', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_026.glb`, megacity: true },
      smRoad027: { label: 'SM_road_027', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_027.glb`, megacity: true },
      smRoad028: { label: 'SM_road_028', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_028.glb`, megacity: true },
      smRoad029: { label: 'SM_road_029', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_029.glb`, megacity: true },
      smRoad03: { label: 'SM_road_03', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_03.glb`, megacity: true },
      smRoad030: { label: 'SM_road_030', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_030.glb`, megacity: true },
      smRoad031: { label: 'SM_road_031', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_031.glb`, megacity: true },
      smRoad032: { label: 'SM_road_032', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_032.glb`, megacity: true },
      smRoad033: { label: 'SM_road_033', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_033.glb`, megacity: true },
      smRoad034: { label: 'SM_road_034', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_034.glb`, megacity: true },
      smRoad035: { label: 'SM_road_035', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_035.glb`, megacity: true },
      smRoad036: { label: 'SM_road_036', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_036.glb`, megacity: true },
      smRoad037: { label: 'SM_road_037', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_037.glb`, megacity: true },
      smRoad038: { label: 'SM_road_038', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_038.glb`, megacity: true },
      smRoad039: { label: 'SM_road_039', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_039.glb`, megacity: true },
      smRoad04: { label: 'SM_road_04', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_04.glb`, megacity: true },
      smRoad040: { label: 'SM_road_040', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_040.glb`, megacity: true },
      smRoad041: { label: 'SM_road_041', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_041.glb`, megacity: true },
      smRoad042: { label: 'SM_road_042', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_042.glb`, megacity: true },
      smRoad043: { label: 'SM_road_043', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_043.glb`, megacity: true },
      smRoad043A: { label: 'SM_road_043_A', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_043_A.glb`, megacity: true },
      smRoad044: { label: 'SM_road_044', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_044.glb`, megacity: true },
      smRoad045: { label: 'SM_road_045', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_045.glb`, megacity: true },
      smRoad046: { label: 'SM_road_046', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_046.glb`, megacity: true },
      smRoad047: { label: 'SM_road_047', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_047.glb`, megacity: true },
      smRoad048: { label: 'SM_road_048', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_048.glb`, megacity: true },
      smRoad049: { label: 'SM_road_049', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_049.glb`, megacity: true },
      smRoad05: { label: 'SM_road_05', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_05.glb`, megacity: true },
      smRoad050: { label: 'SM_road_050', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_050.glb`, megacity: true },
      smRoad051: { label: 'SM_road_051', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_051.glb`, megacity: true },
      smRoad052: { label: 'SM_road_052', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_052.glb`, megacity: true },
      smRoad053: { label: 'SM_road_053', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_053.glb`, megacity: true },
      smRoad054: { label: 'SM_road_054', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_054.glb`, megacity: true },
      smRoad055: { label: 'SM_road_055', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_055.glb`, megacity: true },
      smRoad056: { label: 'SM_road_056', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_056.glb`, megacity: true },
      smRoad057: { label: 'SM_road_057', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_057.glb`, megacity: true },
      smRoad06: { label: 'SM_road_06', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_06.glb`, megacity: true },
      smRoad07: { label: 'SM_road_07', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_07.glb`, megacity: true },
      smRoad08: { label: 'SM_road_08', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_08.glb`, megacity: true },
      smRoad09: { label: 'SM_road_09', displayName: '', url: `${MEGACITY_PATH}/Roads/SM_road_09.glb`, megacity: true },
    }
  },
  mcCityProps: {
    label: '🏙️ MC CityProps',
    items: {
      smAtm: { label: 'SM_ATM', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ATM.glb`, megacity: true },
      smArtificialUnevenness01: { label: 'SM_Artificial_unevenness_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Artificial_unevenness_01.glb`, megacity: true },
      smArtificialUnevenness02: { label: 'SM_Artificial_unevenness_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Artificial_unevenness_02.glb`, megacity: true },
      smArtificialUnevenness03: { label: 'SM_Artificial_unevenness_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Artificial_unevenness_03.glb`, megacity: true },
      smArtificialUnevenness04: { label: 'SM_Artificial_unevenness_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Artificial_unevenness_04.glb`, megacity: true },
      smBalloon01: { label: 'SM_Balloon_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Balloon_01.glb`, megacity: true },
      smEscalator01: { label: 'SM_Escalator_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Escalator_01.glb`, megacity: true },
      smFerrisWheel01: { label: 'SM_Ferris_wheel_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Ferris%20wheel_01.glb`, megacity: true },
      smLadder04: { label: 'SM_Ladder_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Ladder_04.glb`, megacity: true },
      smPillar01A: { label: 'SM_Pillar_01_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Pillar_01_A.glb`, megacity: true },
      smPillarCity02: { label: 'SM_Pillar_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Pillar_02.glb`, megacity: true },
      smPillar02A: { label: 'SM_Pillar_02_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Pillar_02_A.glb`, megacity: true },
      smRailwayTracks01: { label: 'SM_Railway_tracks_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Railway_tracks_01.glb`, megacity: true },
      smRailwayTracks02: { label: 'SM_Railway_tracks_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Railway_tracks_02.glb`, megacity: true },
      smRailwayTracks03: { label: 'SM_Railway_tracks_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Railway_tracks_03.glb`, megacity: true },
      smRailwayTracks04: { label: 'SM_Railway_tracks_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Railway_tracks_04.glb`, megacity: true },
      smRailwayTracks05: { label: 'SM_Railway_tracks_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Railway_tracks_05.glb`, megacity: true },
      smStreetLight01: { label: 'SM_Street_light_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Street_light_01.glb`, megacity: true },
      smStreetLight02: { label: 'SM_Street_light_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Street_light_02.glb`, megacity: true },
      smTreadmill01: { label: 'SM_Treadmill_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Treadmill_01.glb`, megacity: true },
      smTreadmill02: { label: 'SM_Treadmill_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Treadmill_02.glb`, megacity: true },
      smVolleyballCourt01: { label: 'SM_Volleyball_Court_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_Volleyball_Court_01.glb`, megacity: true },
      smBanner01: { label: 'SM_banner_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_banner_01.glb`, megacity: true },
      smBanner02: { label: 'SM_banner_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_banner_02.glb`, megacity: true },
      smBarbellBar01: { label: 'SM_barbell_bar_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_barbell_bar_01.glb`, megacity: true },
      smBarrier01: { label: 'SM_barrier_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_barrier_01.glb`, megacity: true },
      smBarrier02: { label: 'SM_barrier_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_barrier_02.glb`, megacity: true },
      smBasketballPlayground01: { label: 'SM_basketball_playground_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_basketball_playground_01.glb`, megacity: true },
      smBench01: { label: 'SM_bench_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bench_01.glb`, megacity: true },
      smBench02: { label: 'SM_bench_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bench_02.glb`, megacity: true },
      smBench03: { label: 'SM_bench_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bench_03.glb`, megacity: true },
      smBicycleParking: { label: 'SM_bicycle_parking', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bicycle_parking.glb`, megacity: true },
      smBoards01: { label: 'SM_boards_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_boards_01.glb`, megacity: true },
      smBoards02: { label: 'SM_boards_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_boards_02.glb`, megacity: true },
      smBoat01: { label: 'SM_boat_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_boat_01.glb`, megacity: true },
      smBrigeCity01: { label: 'SM_brige_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_01.glb`, megacity: true },
      smBrigeCity02: { label: 'SM_brige_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_02.glb`, megacity: true },
      smBrigeCity03: { label: 'SM_brige_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_03.glb`, megacity: true },
      smBrigeCity04: { label: 'SM_brige_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_04.glb`, megacity: true },
      smBrigeCity05: { label: 'SM_brige_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_05.glb`, megacity: true },
      smBrigeCity06: { label: 'SM_brige_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_06.glb`, megacity: true },
      smBrigeCity07: { label: 'SM_brige_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_07.glb`, megacity: true },
      smBrigeCity08: { label: 'SM_brige_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_brige_08.glb`, megacity: true },
      smBuildingLamp01: { label: 'SM_building_lamp_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_building_lamp_01.glb`, megacity: true },
      smBumpStop01: { label: 'SM_bump_stop_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bump_stop_01.glb`, megacity: true },
      smBumpStop02: { label: 'SM_bump_stop_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bump_stop_02.glb`, megacity: true },
      smBumpStop03: { label: 'SM_bump_stop_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bump_stop__03.glb`, megacity: true },
      smBuoy01: { label: 'SM_buoy_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_buoy_01.glb`, megacity: true },
      smBusStop02: { label: 'SM_bus_stop_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_bus_stop_02.glb`, megacity: true },
      smCable01: { label: 'SM_cable_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_cable_01.glb`, megacity: true },
      smCable02: { label: 'SM_cable_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_cable_02.glb`, megacity: true },
      smCanopy01: { label: 'SM_canopy_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_canopy_01.glb`, megacity: true },
      smChair01: { label: 'SM_chair_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_chair_01.glb`, megacity: true },
      smCinderBlock01: { label: 'SM_cinder_block_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_cinder_block_01.glb`, megacity: true },
      smCinderBlock02: { label: 'SM_cinder_block_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_cinder_block_02.glb`, megacity: true },
      smClimbingWall01: { label: 'SM_climbing_wall_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_climbing_wall_01.glb`, megacity: true },
      smCoil01: { label: 'SM_coil_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_coil_01.glb`, megacity: true },
      smCoil02: { label: 'SM_coil_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_coil_02.glb`, megacity: true },
      smConcretePipe01: { label: 'SM_concrete_pipe_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_concrete_pipe_01.glb`, megacity: true },
      smConcretePipe02: { label: 'SM_concrete_pipe_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_concrete_pipe_02.glb`, megacity: true },
      smConcretePipe03: { label: 'SM_concrete_pipe_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_concrete_pipe_03.glb`, megacity: true },
      smConcretePipe04: { label: 'SM_concrete_pipe_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_concrete_pipe_04.glb`, megacity: true },
      smConstructionToilet01: { label: 'SM_construction_toilet_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_construction%20toilet_01.glb`, megacity: true },
      smCrane01: { label: 'SM_crane_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_crane_01.glb`, megacity: true },
      smDeckChair01: { label: 'SM_deck_chair_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_deck_chair_01.glb`, megacity: true },
      smDeckChair02: { label: 'SM_deck_chair_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_deck_chair_02.glb`, megacity: true },
      smDitch01: { label: 'SM_ditch_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ditch_01.glb`, megacity: true },
      smDitch02: { label: 'SM_ditch_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ditch_02.glb`, megacity: true },
      smDitch03: { label: 'SM_ditch_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ditch_03.glb`, megacity: true },
      smDitch04: { label: 'SM_ditch_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ditch_04.glb`, megacity: true },
      smDrinkingFountain: { label: 'SM_drinking_fountain', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_drinking_fountain.glb`, megacity: true },
      smFishingBoat01: { label: 'SM_fishing_boat_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_fishing_boat_01.glb`, megacity: true },
      smFlowerbed01: { label: 'SM_flowerbed_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_01.glb`, megacity: true },
      smFlowerbed02: { label: 'SM_flowerbed_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_02.glb`, megacity: true },
      smFlowerbed03: { label: 'SM_flowerbed_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_03.glb`, megacity: true },
      smFlowerbed04: { label: 'SM_flowerbed_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_04.glb`, megacity: true },
      smFlowerbed05: { label: 'SM_flowerbed_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_05.glb`, megacity: true },
      smFlowerbed06: { label: 'SM_flowerbed_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_06.glb`, megacity: true },
      smFlowerbed07: { label: 'SM_flowerbed_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_07.glb`, megacity: true },
      smFlowerbed08: { label: 'SM_flowerbed_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_08.glb`, megacity: true },
      smFlowerbed09: { label: 'SM_flowerbed_09', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_flowerbed_09.glb`, megacity: true },
      smGenerator01: { label: 'SM_generator_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_generator_01.glb`, megacity: true },
      smHikingTrail01: { label: 'SM_hiking_trail_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_01.glb`, megacity: true },
      smHikingTrail02: { label: 'SM_hiking_trail_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_02.glb`, megacity: true },
      smHikingTrail03: { label: 'SM_hiking_trail_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_03.glb`, megacity: true },
      smHikingTrail04: { label: 'SM_hiking_trail_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_04.glb`, megacity: true },
      smHikingTrail05: { label: 'SM_hiking_trail_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_05.glb`, megacity: true },
      smHikingTrail06: { label: 'SM_hiking_trail_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_06.glb`, megacity: true },
      smHikingTrail07: { label: 'SM_hiking_trail_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_07.glb`, megacity: true },
      smHikingTrail08: { label: 'SM_hiking_trail_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_08.glb`, megacity: true },
      smHikingTrail09: { label: 'SM_hiking_trail_09', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_09.glb`, megacity: true },
      smHikingTrail10: { label: 'SM_hiking_trail_10', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_10.glb`, megacity: true },
      smHikingTrail11: { label: 'SM_hiking_trail_11', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_11.glb`, megacity: true },
      smHikingTrail12: { label: 'SM_hiking_trail_12', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hiking_trail_12.glb`, megacity: true },
      smHorizontalBar01: { label: 'SM_horizontal_bar_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_horizontal_bar_01.glb`, megacity: true },
      smHorizontalBar02: { label: 'SM_horizontal_bar_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_horizontal_bar_02.glb`, megacity: true },
      smHorizontalBar03: { label: 'SM_horizontal_bar_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_horizontal_bar_03.glb`, megacity: true },
      smHorizontalBar04: { label: 'SM_horizontal_bar_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_horizontal_bar_04.glb`, megacity: true },
      smHose01: { label: 'SM_hose_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hose_01.glb`, megacity: true },
      smHose02: { label: 'SM_hose_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_hose_02.glb`, megacity: true },
      smLadder01: { label: 'SM_ladder_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ladder_01.glb`, megacity: true },
      smLadder02: { label: 'SM_ladder_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ladder_02.glb`, megacity: true },
      smLadder03: { label: 'SM_ladder_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ladder_03.glb`, megacity: true },
      smLadder05: { label: 'SM_ladder_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ladder_05.glb`, megacity: true },
      smLadder06: { label: 'SM_ladder_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ladder_06.glb`, megacity: true },
      smLadder06A: { label: 'SM_ladder_06_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ladder_06_A.glb`, megacity: true },
      smLake: { label: 'SM_lake', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lake.glb`, megacity: true },
      smLamp01: { label: 'SM_lamp_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lamp_01.glb`, megacity: true },
      smLawn01: { label: 'SM_lawn_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_01.glb`, megacity: true },
      smLawn02: { label: 'SM_lawn_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_02.glb`, megacity: true },
      smLawn03: { label: 'SM_lawn_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_03.glb`, megacity: true },
      smLawn04: { label: 'SM_lawn_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_04.glb`, megacity: true },
      smLawn05: { label: 'SM_lawn_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_05.glb`, megacity: true },
      smLawn06: { label: 'SM_lawn_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_06.glb`, megacity: true },
      smLawn07: { label: 'SM_lawn_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_07.glb`, megacity: true },
      smLawn08: { label: 'SM_lawn_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_08.glb`, megacity: true },
      smLawn09: { label: 'SM_lawn_09', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_lawn_09.glb`, megacity: true },
      smMonorail01: { label: 'SM_monorail_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_01.glb`, megacity: true },
      smMonorail02: { label: 'SM_monorail_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_02.glb`, megacity: true },
      smMonorail03: { label: 'SM_monorail_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_03.glb`, megacity: true },
      smMonorail03B: { label: 'SM_monorail_03_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_03_B.glb`, megacity: true },
      smMonorail04: { label: 'SM_monorail_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_04.glb`, megacity: true },
      smMonorail04A: { label: 'SM_monorail_04_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_04_A.glb`, megacity: true },
      smMonorail05: { label: 'SM_monorail_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_05.glb`, megacity: true },
      smMonorail06: { label: 'SM_monorail_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_06.glb`, megacity: true },
      smMonorail07: { label: 'SM_monorail_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_monorail_07.glb`, megacity: true },
      smMountainOfSand01: { label: 'SM_mountain_of_sand_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_mountain_of_sand_01.glb`, megacity: true },
      smMountainOfSand02: { label: 'SM_mountain_of_sand_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_mountain_of_sand_02.glb`, megacity: true },
      smObjectForCrane01: { label: 'SM_object_for_crane_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_object_for_crane_01.glb`, megacity: true },
      smObjectForCrane02: { label: 'SM_object_for_crane_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_object_for_crane_02.glb`, megacity: true },
      smObjectForCrane03: { label: 'SM_object_for_crane_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_object_for_crane_03.glb`, megacity: true },
      smPancakeForBarbell01: { label: 'SM_pancake_for_barbell_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pancake_for_barbell_01.glb`, megacity: true },
      smPancakeForBarbell02: { label: 'SM_pancake_for_barbell_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pancake_for_barbell_02.glb`, megacity: true },
      smPancakeForBarbell03: { label: 'SM_pancake_for_barbell_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pancake_for_barbell_03.glb`, megacity: true },
      smPancakeForBarbell04: { label: 'SM_pancake_for_barbell_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pancake_for_barbell_04.glb`, megacity: true },
      smPicnicBasket01: { label: 'SM_picnic_basket_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_picnic_basket_01.glb`, megacity: true },
      smPier01: { label: 'SM_pier_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pier_01.glb`, megacity: true },
      smPier02: { label: 'SM_pier_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pier_02.glb`, megacity: true },
      smPier03: { label: 'SM_pier_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pier_03.glb`, megacity: true },
      smPillarCity01: { label: 'SM_pillar_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_01.glb`, megacity: true },
      smPillarCity03: { label: 'SM_pillar_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03.glb`, megacity: true },
      smPillar03A: { label: 'SM_pillar_03_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03_A.glb`, megacity: true },
      smPillar03B: { label: 'SM_pillar_03_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03_B.glb`, megacity: true },
      smPillar03C: { label: 'SM_pillar_03_C', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03_C.glb`, megacity: true },
      smPillar03D: { label: 'SM_pillar_03_D', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03_D.glb`, megacity: true },
      smPillar03E: { label: 'SM_pillar_03_E', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03_E.glb`, megacity: true },
      smPillar03F: { label: 'SM_pillar_03_F', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_03_F.glb`, megacity: true },
      smPillarCity04: { label: 'SM_pillar_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_04.glb`, megacity: true },
      smPillar04A: { label: 'SM_pillar_04_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_04_A.glb`, megacity: true },
      smPillar04B: { label: 'SM_pillar_04_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_04_B.glb`, megacity: true },
      smPillar04C: { label: 'SM_pillar_04_C', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pillar_04_C.glb`, megacity: true },
      smPipes01: { label: 'SM_pipes_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pipes_01.glb`, megacity: true },
      smPipes02: { label: 'SM_pipes_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pipes_02.glb`, megacity: true },
      smPlatform01: { label: 'SM_platform_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_01.glb`, megacity: true },
      smPlatform02: { label: 'SM_platform_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_02.glb`, megacity: true },
      smPlatform03: { label: 'SM_platform_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_03.glb`, megacity: true },
      smPlatform04: { label: 'SM_platform_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_04.glb`, megacity: true },
      smPlatform05: { label: 'SM_platform_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_05.glb`, megacity: true },
      smPlatform06: { label: 'SM_platform_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_06.glb`, megacity: true },
      smPlatform07: { label: 'SM_platform_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_07.glb`, megacity: true },
      smPlatform08: { label: 'SM_platform_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_08.glb`, megacity: true },
      smPlatform09: { label: 'SM_platform_09', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_09.glb`, megacity: true },
      smPlatform10: { label: 'SM_platform_10', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_10.glb`, megacity: true },
      smPlatform11: { label: 'SM_platform_11', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_11.glb`, megacity: true },
      smPlatform12: { label: 'SM_platform_12', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_12.glb`, megacity: true },
      smPlatform13: { label: 'SM_platform_13', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_platform_13.glb`, megacity: true },
      smPlayground01: { label: 'SM_playground_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_01.glb`, megacity: true },
      smPlayground02: { label: 'SM_playground_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_02.glb`, megacity: true },
      smPlayground03: { label: 'SM_playground_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_03.glb`, megacity: true },
      smPlayground04A: { label: 'SM_playground_04_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_04_A.glb`, megacity: true },
      smPlayground05: { label: 'SM_playground_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_05.glb`, megacity: true },
      smPlayground06: { label: 'SM_playground_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_06.glb`, megacity: true },
      smPlayground07: { label: 'SM_playground_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_07.glb`, megacity: true },
      smPlayground2: { label: 'SM_playground_2', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_playground_2.glb`, megacity: true },
      smPointer01: { label: 'SM_pointer_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_pointer_01.glb`, megacity: true },
      smPressBench01: { label: 'SM_press_bench_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_press_bench_01.glb`, megacity: true },
      smPressBench02: { label: 'SM_press_bench_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_press_bench_02.glb`, megacity: true },
      smPuddle01: { label: 'SM_puddle_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_puddle_01.glb`, megacity: true },
      smPuddle02: { label: 'SM_puddle_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_puddle_02.glb`, megacity: true },
      smRamp01: { label: 'SM_ramp_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_ramp_01.glb`, megacity: true },
      smRescueTower01: { label: 'SM_rescue_tower_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_rescue_tower_01.glb`, megacity: true },
      smRoadSign01: { label: 'SM_road_sign_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road%20sign_01.glb`, megacity: true },
      smRoadSign02: { label: 'SM_road_sign_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road%20sign_02.glb`, megacity: true },
      smRoadCity01: { label: 'SM_road_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_01.glb`, megacity: true },
      smRoad01A: { label: 'SM_road_01_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_01_A.glb`, megacity: true },
      smRoadCity02: { label: 'SM_road_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_02.glb`, megacity: true },
      smRoadCity03: { label: 'SM_road_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_03.glb`, megacity: true },
      smRoadCity04: { label: 'SM_road_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_04.glb`, megacity: true },
      smRoadCity05: { label: 'SM_road_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_05.glb`, megacity: true },
      smRoadCity06: { label: 'SM_road_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_06.glb`, megacity: true },
      smRoadCity07: { label: 'SM_road_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_07.glb`, megacity: true },
      smRoadCity08: { label: 'SM_road_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_08.glb`, megacity: true },
      smRoadCity09: { label: 'SM_road_09', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_09.glb`, megacity: true },
      smRoadCity10: { label: 'SM_road_10', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_10.glb`, megacity: true },
      smRoadCity11: { label: 'SM_road_11', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_11.glb`, megacity: true },
      smRoadCity12: { label: 'SM_road_12', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_12.glb`, megacity: true },
      smRoadCity13: { label: 'SM_road_13', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_13.glb`, megacity: true },
      smRoadCity14: { label: 'SM_road_14', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_14.glb`, megacity: true },
      smRoadCity15: { label: 'SM_road_15', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_15.glb`, megacity: true },
      smRoadCity16: { label: 'SM_road_16', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_16.glb`, megacity: true },
      smRoadCity17: { label: 'SM_road_17', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_17.glb`, megacity: true },
      smRoadCity18: { label: 'SM_road_18', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_18.glb`, megacity: true },
      smRoadCity19: { label: 'SM_road_19', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_19.glb`, megacity: true },
      smRoadCity20: { label: 'SM_road_20', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_20.glb`, megacity: true },
      smRoadCity21: { label: 'SM_road_21', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_21.glb`, megacity: true },
      smRoadCity22: { label: 'SM_road_22', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_22.glb`, megacity: true },
      smRoadCity23: { label: 'SM_road_23', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_23.glb`, megacity: true },
      smRoadCity24: { label: 'SM_road_24', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_24.glb`, megacity: true },
      smRoadFence01: { label: 'SM_road_fence_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_fence_01.glb`, megacity: true },
      smRoadLantern01: { label: 'SM_road_lantern_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_lantern_01.glb`, megacity: true },
      smRoadPit01: { label: 'SM_road_pit_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_pit_01.glb`, megacity: true },
      smRoadSign03: { label: 'SM_road_sign_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_03.glb`, megacity: true },
      smRoadSign04: { label: 'SM_road_sign_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_04.glb`, megacity: true },
      smRoadSign05: { label: 'SM_road_sign_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_05.glb`, megacity: true },
      smRoadSign06: { label: 'SM_road_sign_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_06.glb`, megacity: true },
      smRoadSign07: { label: 'SM_road_sign_07', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_07.glb`, megacity: true },
      smRoadSign08: { label: 'SM_road_sign_08', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_08.glb`, megacity: true },
      smRoadSign09: { label: 'SM_road_sign_09', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_09.glb`, megacity: true },
      smRoadSignA: { label: 'SM_road_sign_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_sign_A.glb`, megacity: true },
      smRoadSigns11: { label: 'SM_road_signs_11', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_signs_11.glb`, megacity: true },
      smRoadSigns12: { label: 'SM_road_signs_12', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_signs_12.glb`, megacity: true },
      smRoadWaterBarrel01: { label: 'SM_road_water_barrel_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_road_water_barrel_01.glb`, megacity: true },
      smRollerCoaster01: { label: 'SM_roller_coaster_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_roller_coaster_01.glb`, megacity: true },
      smSand01A: { label: 'SM_sand_01_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_01_A.glb`, megacity: true },
      smSand01B: { label: 'SM_sand_01_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_01_B.glb`, megacity: true },
      smSand02A: { label: 'SM_sand_02_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_02_A.glb`, megacity: true },
      smSand02B: { label: 'SM_sand_02_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_02_B.glb`, megacity: true },
      smSand03: { label: 'SM_sand_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_03.glb`, megacity: true },
      smSand03B: { label: 'SM_sand_03_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_03_B.glb`, megacity: true },
      smSand04A: { label: 'SM_sand_04_A', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_04_A.glb`, megacity: true },
      smSand04B: { label: 'SM_sand_04_B', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sand_04_B.glb`, megacity: true },
      smSewage01: { label: 'SM_sewage_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_sewage_01.glb`, megacity: true },
      smShootingRange01: { label: 'SM_shooting_range_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_shooting_range_01.glb`, megacity: true },
      smSkatePlayground01: { label: 'SM_skate_playground_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_skate_playground_01.glb`, megacity: true },
      smSkatePlayground02: { label: 'SM_skate_playground_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_skate_playground_02.glb`, megacity: true },
      smStand01: { label: 'SM_stand_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_stand_01.glb`, megacity: true },
      smStand02: { label: 'SM_stand_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_stand_02.glb`, megacity: true },
      smStand03: { label: 'SM_stand_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_stand_03.glb`, megacity: true },
      smStreetCoffeeShop: { label: 'SM_street_coffee_shop', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_street_coffee_shop.glb`, megacity: true },
      smStreetDecor04: { label: 'SM_street_decor_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_street_decor_04.glb`, megacity: true },
      smStreetDecor16: { label: 'SM_street_decor_16', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_street_decor_16.glb`, megacity: true },
      smTheCircus01: { label: 'SM_the_circus_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_the_circus_01.glb`, megacity: true },
      smTowel01: { label: 'SM_towel_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_towel_01.glb`, megacity: true },
      smTrafficCone01: { label: 'SM_traffic_cone_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_cone_01.glb`, megacity: true },
      smTrafficCone02: { label: 'SM_traffic_cone_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_cone_02.glb`, megacity: true },
      smTrafficCone03: { label: 'SM_traffic_cone_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_cone_03.glb`, megacity: true },
      smTrafficCone04: { label: 'SM_traffic_cone_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_cone_04.glb`, megacity: true },
      smTrafficCone05: { label: 'SM_traffic_cone_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_cone_05.glb`, megacity: true },
      smTrafficCone06: { label: 'SM_traffic_cone_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_cone_06.glb`, megacity: true },
      smTrafficLight01: { label: 'SM_traffic_light_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_traffic_light_01.glb`, megacity: true },
      smTrailer01: { label: 'SM_trailer_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_trailer_01.glb`, megacity: true },
      smTrampoline01: { label: 'SM_trampoline_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_trampoline_01.glb`, megacity: true },
      smTrashCan01: { label: 'SM_trash_can_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_trash_can_01.glb`, megacity: true },
      smTrashCan02: { label: 'SM_trash_can_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_trash_can_02.glb`, megacity: true },
      smTrashCan03: { label: 'SM_trash_can_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_trash_can_03.glb`, megacity: true },
      smTribunes01: { label: 'SM_tribunes_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tribunes_01.glb`, megacity: true },
      smTromwayPaths01: { label: 'SM_tromway_paths_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tromway_paths_01.glb`, megacity: true },
      smTromwayPaths02: { label: 'SM_tromway_paths_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tromway_paths_02.glb`, megacity: true },
      smTromwayPaths03: { label: 'SM_tromway_paths_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tromway_paths_03.glb`, megacity: true },
      smTromwayPaths04: { label: 'SM_tromway_paths_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tromway_paths_04.glb`, megacity: true },
      smTromwayPaths05: { label: 'SM_tromway_paths_05', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tromway_paths_05.glb`, megacity: true },
      smTromwayPaths06: { label: 'SM_tromway_paths_06', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tromway_paths_06.glb`, megacity: true },
      smTunnel01: { label: 'SM_tunnel_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tunnel_01.glb`, megacity: true },
      smTunnel02: { label: 'SM_tunnel_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tunnel_02.glb`, megacity: true },
      smTunnel03: { label: 'SM_tunnel_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_tunnel_03.glb`, megacity: true },
      smUmbrella01: { label: 'SM_umbrella_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_umbrella_01.glb`, megacity: true },
      smUmbrella02: { label: 'SM_umbrella_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_umbrella_02.glb`, megacity: true },
      smUndergroundPass01: { label: 'SM_underground_pass_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_underground_pass_01.glb`, megacity: true },
      smVendingMachine: { label: 'SM_vending_machine', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_vending_machine.glb`, megacity: true },
      smWater01: { label: 'SM_water_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_01.glb`, megacity: true },
      smWater02: { label: 'SM_water_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_02.glb`, megacity: true },
      smWater03: { label: 'SM_water_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_03.glb`, megacity: true },
      smWaterChannels01: { label: 'SM_water_channels_01', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_channels_01.glb`, megacity: true },
      smWaterChannels02: { label: 'SM_water_channels_02', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_channels_02.glb`, megacity: true },
      smWaterChannels03: { label: 'SM_water_channels_03', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_channels_03.glb`, megacity: true },
      smWaterChannels04: { label: 'SM_water_channels_04', displayName: '', url: `${MEGACITY_PATH}/CityProps/SM_water_channels_04.glb`, megacity: true },
    }
  },
  cfCityFull: {
    label: '🏙️ CityFull Assets',
    items: {
      bank001: { label: 'Bank 001', displayName: '', url: `${CITY_FULL_PATH}/bank_001.glb` },
      bank002: { label: 'Bank 002', displayName: '', url: `${CITY_FULL_PATH}/bank_002.glb` },
      bank003: { label: 'Bank 003', displayName: '', url: `${CITY_FULL_PATH}/bank_003.glb` },
      bank004: { label: 'Bank 004', displayName: '', url: `${CITY_FULL_PATH}/bank_004.glb` },
      bank005: { label: 'Bank 005', displayName: '', url: `${CITY_FULL_PATH}/bank_005.glb` },
      bank006: { label: 'Bank 006', displayName: '', url: `${CITY_FULL_PATH}/bank_006.glb` },
      bank007: { label: 'Bank 007', displayName: '', url: `${CITY_FULL_PATH}/bank_007.glb` },
      bank008: { label: 'Bank 008', displayName: '', url: `${CITY_FULL_PATH}/bank_008.glb` },
      bank009: { label: 'Bank 009', displayName: '', url: `${CITY_FULL_PATH}/bank_009.glb` },
      bank010: { label: 'Bank 010', displayName: '', url: `${CITY_FULL_PATH}/bank_010.glb` },
      beachTile1x1001: { label: 'Beach Tile 1x1 001', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_001.glb` },
      beachTile1x1002: { label: 'Beach Tile 1x1 002', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_002.glb` },
      beachTile1x1003: { label: 'Beach Tile 1x1 003', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_003.glb` },
      beachTile1x1004: { label: 'Beach Tile 1x1 004', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_004.glb` },
      beachTile1x1005: { label: 'Beach Tile 1x1 005', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_005.glb` },
      beachTile1x1006: { label: 'Beach Tile 1x1 006', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_006.glb` },
      beachTile1x1007: { label: 'Beach Tile 1x1 007', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_007.glb` },
      beachTile1x1008: { label: 'Beach Tile 1x1 008', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_008.glb` },
      beachTile1x1009: { label: 'Beach Tile 1x1 009', displayName: '', url: `${CITY_FULL_PATH}/beach_tile_1x1_009.glb` },
      bench001: { label: 'Bench 001', displayName: '', url: `${CITY_FULL_PATH}/bench_001.glb` },
      bench002: { label: 'Bench 002', displayName: '', url: `${CITY_FULL_PATH}/bench_002.glb` },
      bench003: { label: 'Bench 003', displayName: '', url: `${CITY_FULL_PATH}/bench_003.glb` },
      bridgeRoad001: { label: 'Bridge Road 001', displayName: '', url: `${CITY_FULL_PATH}/bridge_road_001.glb` },
      bridgeRoad002: { label: 'Bridge Road 002', displayName: '', url: `${CITY_FULL_PATH}/bridge_road_002.glb` },
      bridgeRoad003: { label: 'Bridge Road 003', displayName: '', url: `${CITY_FULL_PATH}/bridge_road_003.glb` },
      bridgeShroud001: { label: 'Bridge Shroud 001', displayName: '', url: `${CITY_FULL_PATH}/bridge_shroud_001.glb` },
      bridgeShroud002: { label: 'Bridge Shroud 002', displayName: '', url: `${CITY_FULL_PATH}/bridge_shroud_002.glb` },
      bridgeTower001: { label: 'Bridge Tower 001', displayName: '', url: `${CITY_FULL_PATH}/bridge_tower_001.glb` },
      bridgeTower002: { label: 'Bridge Tower 002', displayName: '', url: `${CITY_FULL_PATH}/bridge_tower_002.glb` },
      businessCenter001: { label: 'Business Center 001', displayName: '', url: `${CITY_FULL_PATH}/business_center_001.glb` },
      businessCenter002: { label: 'Business Center 002', displayName: '', url: `${CITY_FULL_PATH}/business_center_002.glb` },
      businessCenter003: { label: 'Business Center 003', displayName: '', url: `${CITY_FULL_PATH}/business_center_003.glb` },
      businessCenter004: { label: 'Business Center 004', displayName: '', url: `${CITY_FULL_PATH}/business_center_004.glb` },
      businessCenter005: { label: 'Business Center 005', displayName: '', url: `${CITY_FULL_PATH}/business_center_005.glb` },
      businessCenter006: { label: 'Business Center 006', displayName: '', url: `${CITY_FULL_PATH}/business_center_006.glb` },
      businessCenter007: { label: 'Business Center 007', displayName: '', url: `${CITY_FULL_PATH}/business_center_007.glb` },
      businessCenter008: { label: 'Business Center 008', displayName: '', url: `${CITY_FULL_PATH}/business_center_008.glb` },
      businessCenter009: { label: 'Business Center 009', displayName: '', url: `${CITY_FULL_PATH}/business_center_009.glb` },
      businessCenter010: { label: 'Business Center 010', displayName: '', url: `${CITY_FULL_PATH}/business_center_010.glb` },
      cafe001: { label: 'Cafe 001', displayName: '', url: `${CITY_FULL_PATH}/cafe_001.glb` },
      cafe002: { label: 'Cafe 002', displayName: '', url: `${CITY_FULL_PATH}/cafe_002.glb` },
      cafe003: { label: 'Cafe 003', displayName: '', url: `${CITY_FULL_PATH}/cafe_003.glb` },
      cafe004: { label: 'Cafe 004', displayName: '', url: `${CITY_FULL_PATH}/cafe_004.glb` },
      cafe005: { label: 'Cafe 005', displayName: '', url: `${CITY_FULL_PATH}/cafe_005.glb` },
      cafe006: { label: 'Cafe 006', displayName: '', url: `${CITY_FULL_PATH}/cafe_006.glb` },
      cafe007: { label: 'Cafe 007', displayName: '', url: `${CITY_FULL_PATH}/cafe_007.glb` },
      cafe008: { label: 'Cafe 008', displayName: '', url: `${CITY_FULL_PATH}/cafe_008.glb` },
      cafe009: { label: 'Cafe 009', displayName: '', url: `${CITY_FULL_PATH}/cafe_009.glb` },
      cafe010: { label: 'Cafe 010', displayName: '', url: `${CITY_FULL_PATH}/cafe_010.glb` },
      cottage001: { label: 'Cottage 001', displayName: '', url: `${CITY_FULL_PATH}/cottage_001.glb` },
      cottage002: { label: 'Cottage 002', displayName: '', url: `${CITY_FULL_PATH}/cottage_002.glb` },
      cottage003: { label: 'Cottage 003', displayName: '', url: `${CITY_FULL_PATH}/cottage_003.glb` },
      cottage004: { label: 'Cottage 004', displayName: '', url: `${CITY_FULL_PATH}/cottage_004.glb` },
      cottage005: { label: 'Cottage 005', displayName: '', url: `${CITY_FULL_PATH}/cottage_005.glb` },
      cottage006: { label: 'Cottage 006', displayName: '', url: `${CITY_FULL_PATH}/cottage_006.glb` },
      cottage007: { label: 'Cottage 007', displayName: '', url: `${CITY_FULL_PATH}/cottage_007.glb` },
      cottage008: { label: 'Cottage 008', displayName: '', url: `${CITY_FULL_PATH}/cottage_008.glb` },
      cottage009: { label: 'Cottage 009', displayName: '', url: `${CITY_FULL_PATH}/cottage_009.glb` },
      cottage010: { label: 'Cottage 010', displayName: '', url: `${CITY_FULL_PATH}/cottage_010.glb` },
      fireHydrant001: { label: 'Fire Hydrant 001', displayName: '', url: `${CITY_FULL_PATH}/fire_hydrant_001.glb` },
      hotel001: { label: 'Hotel 001', displayName: '', url: `${CITY_FULL_PATH}/hotel_001.glb` },
      hotel002: { label: 'Hotel 002', displayName: '', url: `${CITY_FULL_PATH}/hotel_002.glb` },
      hotel003: { label: 'Hotel 003', displayName: '', url: `${CITY_FULL_PATH}/hotel_003.glb` },
      hotel004: { label: 'Hotel 004', displayName: '', url: `${CITY_FULL_PATH}/hotel_004.glb` },
      hotel005: { label: 'Hotel 005', displayName: '', url: `${CITY_FULL_PATH}/hotel_005.glb` },
      hotel006: { label: 'Hotel 006', displayName: '', url: `${CITY_FULL_PATH}/hotel_006.glb` },
      hotel007: { label: 'Hotel 007', displayName: '', url: `${CITY_FULL_PATH}/hotel_007.glb` },
      hotel008: { label: 'Hotel 008', displayName: '', url: `${CITY_FULL_PATH}/hotel_008.glb` },
      hotel009: { label: 'Hotel 009', displayName: '', url: `${CITY_FULL_PATH}/hotel_009.glb` },
      hotel010: { label: 'Hotel 010', displayName: '', url: `${CITY_FULL_PATH}/hotel_010.glb` },
      houseArt001: { label: 'House Art 001', displayName: '', url: `${CITY_FULL_PATH}/house_art_001.glb` },
      houseArt002: { label: 'House Art 002', displayName: '', url: `${CITY_FULL_PATH}/house_art_002.glb` },
      houseArt003: { label: 'House Art 003', displayName: '', url: `${CITY_FULL_PATH}/house_art_003.glb` },
      houseArt004: { label: 'House Art 004', displayName: '', url: `${CITY_FULL_PATH}/house_art_004.glb` },
      houseArt005: { label: 'House Art 005', displayName: '', url: `${CITY_FULL_PATH}/house_art_005.glb` },
      houseArt006: { label: 'House Art 006', displayName: '', url: `${CITY_FULL_PATH}/house_art_006.glb` },
      houseArt007: { label: 'House Art 007', displayName: '', url: `${CITY_FULL_PATH}/house_art_007.glb` },
      houseArt008: { label: 'House Art 008', displayName: '', url: `${CITY_FULL_PATH}/house_art_008.glb` },
      houseArt009: { label: 'House Art 009', displayName: '', url: `${CITY_FULL_PATH}/house_art_009.glb` },
      houseArt010: { label: 'House Art 010', displayName: '', url: `${CITY_FULL_PATH}/house_art_010.glb` },
      houseHigh001: { label: 'House High 001', displayName: '', url: `${CITY_FULL_PATH}/house_high_001.glb` },
      houseHigh002: { label: 'House High 002', displayName: '', url: `${CITY_FULL_PATH}/house_high_002.glb` },
      houseHigh003: { label: 'House High 003', displayName: '', url: `${CITY_FULL_PATH}/house_high_003.glb` },
      houseHigh004: { label: 'House High 004', displayName: '', url: `${CITY_FULL_PATH}/house_high_004.glb` },
      houseHigh005: { label: 'House High 005', displayName: '', url: `${CITY_FULL_PATH}/house_high_005.glb` },
      houseHigh006: { label: 'House High 006', displayName: '', url: `${CITY_FULL_PATH}/house_high_006.glb` },
      houseHigh007: { label: 'House High 007', displayName: '', url: `${CITY_FULL_PATH}/house_high_007.glb` },
      houseHigh008: { label: 'House High 008', displayName: '', url: `${CITY_FULL_PATH}/house_high_008.glb` },
      houseHigh009: { label: 'House High 009', displayName: '', url: `${CITY_FULL_PATH}/house_high_009.glb` },
      houseHigh010: { label: 'House High 010', displayName: '', url: `${CITY_FULL_PATH}/house_high_010.glb` },
      houseMiddle001: { label: 'House Middle 001', displayName: '', url: `${CITY_FULL_PATH}/house_middle_001.glb` },
      houseMiddle002: { label: 'House Middle 002', displayName: '', url: `${CITY_FULL_PATH}/house_middle_002.glb` },
      houseMiddle003: { label: 'House Middle 003', displayName: '', url: `${CITY_FULL_PATH}/house_middle_003.glb` },
      houseMiddle004: { label: 'House Middle 004', displayName: '', url: `${CITY_FULL_PATH}/house_middle_004.glb` },
      houseMiddle005: { label: 'House Middle 005', displayName: '', url: `${CITY_FULL_PATH}/house_middle_005.glb` },
      houseMiddle006: { label: 'House Middle 006', displayName: '', url: `${CITY_FULL_PATH}/house_middle_006.glb` },
      houseMiddle007: { label: 'House Middle 007', displayName: '', url: `${CITY_FULL_PATH}/house_middle_007.glb` },
      houseMiddle008: { label: 'House Middle 008', displayName: '', url: `${CITY_FULL_PATH}/house_middle_008.glb` },
      houseMiddle009: { label: 'House Middle 009', displayName: '', url: `${CITY_FULL_PATH}/house_middle_009.glb` },
      houseMiddle010: { label: 'House Middle 010', displayName: '', url: `${CITY_FULL_PATH}/house_middle_010.glb` },
      housePurpose001: { label: 'House Purpose 001', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_001.glb` },
      housePurpose002: { label: 'House Purpose 002', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_002.glb` },
      housePurpose003: { label: 'House Purpose 003', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_003.glb` },
      housePurpose004: { label: 'House Purpose 004', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_004.glb` },
      housePurpose005: { label: 'House Purpose 005', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_005.glb` },
      housePurpose006: { label: 'House Purpose 006', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_006.glb` },
      housePurpose007: { label: 'House Purpose 007', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_007.glb` },
      housePurpose008: { label: 'House Purpose 008', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_008.glb` },
      housePurpose009: { label: 'House Purpose 009', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_009.glb` },
      housePurpose010: { label: 'House Purpose 010', displayName: '', url: `${CITY_FULL_PATH}/house_purpose_010.glb` },
      houseSmall1001: { label: 'House Small 1 001', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_001.glb` },
      houseSmall1002: { label: 'House Small 1 002', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_002.glb` },
      houseSmall1003: { label: 'House Small 1 003', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_003.glb` },
      houseSmall1004: { label: 'House Small 1 004', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_004.glb` },
      houseSmall1005: { label: 'House Small 1 005', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_005.glb` },
      houseSmall1006: { label: 'House Small 1 006', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_006.glb` },
      houseSmall1007: { label: 'House Small 1 007', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_007.glb` },
      houseSmall1008: { label: 'House Small 1 008', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_008.glb` },
      houseSmall1009: { label: 'House Small 1 009', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_009.glb` },
      houseSmall1010: { label: 'House Small 1 010', displayName: '', url: `${CITY_FULL_PATH}/house_small_1_010.glb` },
      houseSmall2001: { label: 'House Small 2 001', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_001.glb` },
      houseSmall2002: { label: 'House Small 2 002', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_002.glb` },
      houseSmall2003: { label: 'House Small 2 003', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_003.glb` },
      houseSmall2004: { label: 'House Small 2 004', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_004.glb` },
      houseSmall2005: { label: 'House Small 2 005', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_005.glb` },
      houseSmall2006: { label: 'House Small 2 006', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_006.glb` },
      houseSmall2007: { label: 'House Small 2 007', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_007.glb` },
      houseSmall2008: { label: 'House Small 2 008', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_008.glb` },
      houseSmall2009: { label: 'House Small 2 009', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_009.glb` },
      houseSmall2010: { label: 'House Small 2 010', displayName: '', url: `${CITY_FULL_PATH}/house_small_2_010.glb` },
      landscapeEntertainment001: { label: 'Landscape Entertainment 001', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_001.glb` },
      landscapeEntertainment002: { label: 'Landscape Entertainment 002', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_002.glb` },
      landscapeEntertainment003: { label: 'Landscape Entertainment 003', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_003.glb` },
      landscapeEntertainment004: { label: 'Landscape Entertainment 004', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_004.glb` },
      landscapeEntertainment005: { label: 'Landscape Entertainment 005', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_005.glb` },
      landscapeEntertainment006: { label: 'Landscape Entertainment 006', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_006.glb` },
      landscapeEntertainment007: { label: 'Landscape Entertainment 007', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_007.glb` },
      landscapeEntertainment008: { label: 'Landscape Entertainment 008', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_008.glb` },
      landscapeEntertainment009: { label: 'Landscape Entertainment 009', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_009.glb` },
      landscapeEntertainment010: { label: 'Landscape Entertainment 010', displayName: '', url: `${CITY_FULL_PATH}/landscape_entertainment_010.glb` },
      park001: { label: 'Park 001', displayName: '', url: `${CITY_FULL_PATH}/park_001.glb` },
      park002: { label: 'Park 002', displayName: '', url: `${CITY_FULL_PATH}/park_002.glb` },
      park003: { label: 'Park 003', displayName: '', url: `${CITY_FULL_PATH}/park_003.glb` },
      park004: { label: 'Park 004', displayName: '', url: `${CITY_FULL_PATH}/park_004.glb` },
      park005: { label: 'Park 005', displayName: '', url: `${CITY_FULL_PATH}/park_005.glb` },
      park006: { label: 'Park 006', displayName: '', url: `${CITY_FULL_PATH}/park_006.glb` },
      park007: { label: 'Park 007', displayName: '', url: `${CITY_FULL_PATH}/park_007.glb` },
      park008: { label: 'Park 008', displayName: '', url: `${CITY_FULL_PATH}/park_008.glb` },
      park009: { label: 'Park 009', displayName: '', url: `${CITY_FULL_PATH}/park_009.glb` },
      park010: { label: 'Park 010', displayName: '', url: `${CITY_FULL_PATH}/park_010.glb` },
      parkingTile2x2001: { label: 'Parking Tile 2x2 001', displayName: '', url: `${CITY_FULL_PATH}/parking_tile_2x2_001.glb` },
      parkingTile2x2002: { label: 'Parking Tile 2x2 002', displayName: '', url: `${CITY_FULL_PATH}/parking_tile_2x2_002.glb` },
      parkingTile2x2003: { label: 'Parking Tile 2x2 003', displayName: '', url: `${CITY_FULL_PATH}/parking_tile_2x2_003.glb` },
      parkingTile2x2004: { label: 'Parking Tile 2x2 004', displayName: '', url: `${CITY_FULL_PATH}/parking_tile_2x2_004.glb` },
      phoneBox001: { label: 'Phone Box 001', displayName: '', url: `${CITY_FULL_PATH}/phone_box_001.glb` },
      phoneBox002: { label: 'Phone Box 002', displayName: '', url: `${CITY_FULL_PATH}/phone_box_002.glb` },
      pillar001: { label: 'Pillar 001', displayName: '', url: `${CITY_FULL_PATH}/pillar_001.glb` },
      pillar002: { label: 'Pillar 002', displayName: '', url: `${CITY_FULL_PATH}/pillar_002.glb` },
      pillar003: { label: 'Pillar 003', displayName: '', url: `${CITY_FULL_PATH}/pillar_003.glb` },
      pillar004: { label: 'Pillar 004', displayName: '', url: `${CITY_FULL_PATH}/pillar_004.glb` },
      pillar005: { label: 'Pillar 005', displayName: '', url: `${CITY_FULL_PATH}/pillar_005.glb` },
      pillar006: { label: 'Pillar 006', displayName: '', url: `${CITY_FULL_PATH}/pillar_006.glb` },
      pillar007: { label: 'Pillar 007', displayName: '', url: `${CITY_FULL_PATH}/pillar_007.glb` },
      pillar008: { label: 'Pillar 008', displayName: '', url: `${CITY_FULL_PATH}/pillar_008.glb` },
      pillar009: { label: 'Pillar 009', displayName: '', url: `${CITY_FULL_PATH}/pillar_009.glb` },
      pillar010: { label: 'Pillar 010', displayName: '', url: `${CITY_FULL_PATH}/pillar_010.glb` },
      portTile1x1001: { label: 'Port Tile 1x1 001', displayName: '', url: `${CITY_FULL_PATH}/port_tile_1x1_001.glb` },
      portTile1x1003: { label: 'Port Tile 1x1 003', displayName: '', url: `${CITY_FULL_PATH}/port_tile_1x1_003.glb` },
      portTile1x1004: { label: 'Port Tile 1x1 004', displayName: '', url: `${CITY_FULL_PATH}/port_tile_1x1_004.glb` },
      portTile1x1005: { label: 'Port Tile 1x1 005', displayName: '', url: `${CITY_FULL_PATH}/port_tile_1x1_005.glb` },
      portTile1x1006: { label: 'Port Tile 1x1 006', displayName: '', url: `${CITY_FULL_PATH}/port_tile_1x1_006.glb` },
      portTile1x1007: { label: 'Port Tile 1x1 007', displayName: '', url: `${CITY_FULL_PATH}/port_tile_1x1_007.glb` },
      portTile2x2001: { label: 'Port Tile 2x2 001', displayName: '', url: `${CITY_FULL_PATH}/port_tile_2x2_001.glb` },
      portTile2x2002: { label: 'Port Tile 2x2 002', displayName: '', url: `${CITY_FULL_PATH}/port_tile_2x2_002.glb` },
      portTile2x2003: { label: 'Port Tile 2x2 003', displayName: '', url: `${CITY_FULL_PATH}/port_tile_2x2_003.glb` },
      rail001: { label: 'Rail 001', displayName: '', url: `${CITY_FULL_PATH}/rail_001.glb` },
      rail002: { label: 'Rail 002', displayName: '', url: `${CITY_FULL_PATH}/rail_002.glb` },
      rail003: { label: 'Rail 003', displayName: '', url: `${CITY_FULL_PATH}/rail_003.glb` },
      rail004: { label: 'Rail 004', displayName: '', url: `${CITY_FULL_PATH}/rail_004.glb` },
      roadTile1x1001: { label: 'Road Tile 1x1 001', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_001.glb` },
      roadTile1x1002: { label: 'Road Tile 1x1 002', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_002.glb` },
      roadTile1x1003: { label: 'Road Tile 1x1 003', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_003.glb` },
      roadTile1x1004: { label: 'Road Tile 1x1 004', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_004.glb` },
      roadTile1x1005: { label: 'Road Tile 1x1 005', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_005.glb` },
      roadTile1x1006: { label: 'Road Tile 1x1 006', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_006.glb` },
      roadTile1x1007: { label: 'Road Tile 1x1 007', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_007.glb` },
      roadTile1x1008: { label: 'Road Tile 1x1 008', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_008.glb` },
      roadTile1x1009: { label: 'Road Tile 1x1 009', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_009.glb` },
      roadTile1x1010: { label: 'Road Tile 1x1 010', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_010.glb` },
      roadTile1x1011: { label: 'Road Tile 1x1 011', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_011.glb` },
      roadTile1x1012: { label: 'Road Tile 1x1 012', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_012.glb` },
      roadTile1x1013: { label: 'Road Tile 1x1 013', displayName: '', url: `${CITY_FULL_PATH}/road_tile_1x1_013.glb` },
      roadTile2x2001: { label: 'Road Tile 2x2 001', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_001.glb` },
      roadTile2x2002: { label: 'Road Tile 2x2 002', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_002.glb` },
      roadTile2x2003: { label: 'Road Tile 2x2 003', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_003.glb` },
      roadTile2x2004: { label: 'Road Tile 2x2 004', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_004.glb` },
      roadTile2x2005: { label: 'Road Tile 2x2 005', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_005.glb` },
      roadTile2x2006: { label: 'Road Tile 2x2 006', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_006.glb` },
      roadTile2x2007: { label: 'Road Tile 2x2 007', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_007.glb` },
      roadTile2x2008: { label: 'Road Tile 2x2 008', displayName: '', url: `${CITY_FULL_PATH}/road_tile_2x2_008.glb` },
      roadTileBridge1x1001: { label: 'Road Tile Bridge 1x1 001', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_1x1_001.glb` },
      roadTileBridge1x1002: { label: 'Road Tile Bridge 1x1 002', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_1x1_002.glb` },
      roadTileBridge1x1003: { label: 'Road Tile Bridge 1x1 003', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_1x1_003.glb` },
      roadTileBridge1x1004: { label: 'Road Tile Bridge 1x1 004', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_1x1_004.glb` },
      roadTileBridge1x1005: { label: 'Road Tile Bridge 1x1 005', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_1x1_005.glb` },
      roadTileBridge2x2001: { label: 'Road Tile Bridge 2x2 001', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_001.glb` },
      roadTileBridge2x2002: { label: 'Road Tile Bridge 2x2 002', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_002.glb` },
      roadTileBridge2x2003: { label: 'Road Tile Bridge 2x2 003', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_003.glb` },
      roadTileBridge2x2004: { label: 'Road Tile Bridge 2x2 004', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_004.glb` },
      roadTileBridge2x2005: { label: 'Road Tile Bridge 2x2 005', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_005.glb` },
      roadTileBridge2x2006: { label: 'Road Tile Bridge 2x2 006', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_006.glb` },
      roadTileBridge2x2007: { label: 'Road Tile Bridge 2x2 007', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_007.glb` },
      roadTileBridge2x2008: { label: 'Road Tile Bridge 2x2 008', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_008.glb` },
      roadTileBridge2x2009: { label: 'Road Tile Bridge 2x2 009', displayName: '', url: `${CITY_FULL_PATH}/road_tile_bridge_2x2_009.glb` },
      roadTileRiver1x1001: { label: 'Road Tile River 1x1 001', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_1x1_001.glb` },
      roadTileRiver1x1002: { label: 'Road Tile River 1x1 002', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_1x1_002.glb` },
      roadTileRiver1x1003: { label: 'Road Tile River 1x1 003', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_1x1_003.glb` },
      roadTileRiver1x1004: { label: 'Road Tile River 1x1 004', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_1x1_004.glb` },
      roadTileRiver2x2001: { label: 'Road Tile River 2x2 001', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_001.glb` },
      roadTileRiver2x2002: { label: 'Road Tile River 2x2 002', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_002.glb` },
      roadTileRiver2x2003: { label: 'Road Tile River 2x2 003', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_003.glb` },
      roadTileRiver2x2004: { label: 'Road Tile River 2x2 004', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_004.glb` },
      roadTileRiver2x2005: { label: 'Road Tile River 2x2 005', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_005.glb` },
      roadTileRiver2x2006: { label: 'Road Tile River 2x2 006', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_006.glb` },
      roadTileRiver2x2007: { label: 'Road Tile River 2x2 007', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_007.glb` },
      roadTileRiver2x2008: { label: 'Road Tile River 2x2 008', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_008.glb` },
      roadTileRiver2x2009: { label: 'Road Tile River 2x2 009', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_009.glb` },
      roadTileRiver2x2010: { label: 'Road Tile River 2x2 010', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_010.glb` },
      roadTileRiver2x2011: { label: 'Road Tile River 2x2 011', displayName: '', url: `${CITY_FULL_PATH}/road_tile_river_2x2_011.glb` },
      servicesStore001: { label: 'Services Store 001', displayName: '', url: `${CITY_FULL_PATH}/services_store_001.glb` },
      servicesStore002: { label: 'Services Store 002', displayName: '', url: `${CITY_FULL_PATH}/services_store_002.glb` },
      servicesStore003: { label: 'Services Store 003', displayName: '', url: `${CITY_FULL_PATH}/services_store_003.glb` },
      servicesStore004: { label: 'Services Store 004', displayName: '', url: `${CITY_FULL_PATH}/services_store_004.glb` },
      servicesStore005: { label: 'Services Store 005', displayName: '', url: `${CITY_FULL_PATH}/services_store_005.glb` },
      servicesStore006: { label: 'Services Store 006', displayName: '', url: `${CITY_FULL_PATH}/services_store_006.glb` },
      servicesStore007: { label: 'Services Store 007', displayName: '', url: `${CITY_FULL_PATH}/services_store_007.glb` },
      servicesStore008: { label: 'Services Store 008', displayName: '', url: `${CITY_FULL_PATH}/services_store_008.glb` },
      servicesStore009: { label: 'Services Store 009', displayName: '', url: `${CITY_FULL_PATH}/services_store_009.glb` },
      servicesStore010: { label: 'Services Store 010', displayName: '', url: `${CITY_FULL_PATH}/services_store_010.glb` },
      skyscraper001: { label: 'Skyscraper 001', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_001.glb` },
      skyscraper002: { label: 'Skyscraper 002', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_002.glb` },
      skyscraper003: { label: 'Skyscraper 003', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_003.glb` },
      skyscraper004: { label: 'Skyscraper 004', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_004.glb` },
      skyscraper005: { label: 'Skyscraper 005', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_005.glb` },
      skyscraper006: { label: 'Skyscraper 006', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_006.glb` },
      skyscraper007: { label: 'Skyscraper 007', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_007.glb` },
      skyscraper008: { label: 'Skyscraper 008', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_008.glb` },
      skyscraper009: { label: 'Skyscraper 009', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_009.glb` },
      skyscraper010: { label: 'Skyscraper 010', displayName: '', url: `${CITY_FULL_PATH}/skyscraper_010.glb` },
      stadium001: { label: 'Stadium 001', displayName: '', url: `${CITY_FULL_PATH}/stadium_001.glb` },
      stadium002: { label: 'Stadium 002', displayName: '', url: `${CITY_FULL_PATH}/stadium_002.glb` },
      stadium003: { label: 'Stadium 003', displayName: '', url: `${CITY_FULL_PATH}/stadium_003.glb` },
      stadium004: { label: 'Stadium 004', displayName: '', url: `${CITY_FULL_PATH}/stadium_004.glb` },
      stadium005: { label: 'Stadium 005', displayName: '', url: `${CITY_FULL_PATH}/stadium_005.glb` },
      stadium006: { label: 'Stadium 006', displayName: '', url: `${CITY_FULL_PATH}/stadium_006.glb` },
      stadium007: { label: 'Stadium 007', displayName: '', url: `${CITY_FULL_PATH}/stadium_007.glb` },
      stadium008: { label: 'Stadium 008', displayName: '', url: `${CITY_FULL_PATH}/stadium_008.glb` },
      stadium009: { label: 'Stadium 009', displayName: '', url: `${CITY_FULL_PATH}/stadium_009.glb` },
      stadium010: { label: 'Stadium 010', displayName: '', url: `${CITY_FULL_PATH}/stadium_010.glb` },
      sunbed001: { label: 'Sunbed 001', displayName: '', url: `${CITY_FULL_PATH}/sunbed_001.glb` },
      supermarket001: { label: 'Supermarket 001', displayName: '', url: `${CITY_FULL_PATH}/supermarket_001.glb` },
      supermarket002: { label: 'Supermarket 002', displayName: '', url: `${CITY_FULL_PATH}/supermarket_002.glb` },
      supermarket003: { label: 'Supermarket 003', displayName: '', url: `${CITY_FULL_PATH}/supermarket_003.glb` },
      supermarket004: { label: 'Supermarket 004', displayName: '', url: `${CITY_FULL_PATH}/supermarket_004.glb` },
      supermarket005: { label: 'Supermarket 005', displayName: '', url: `${CITY_FULL_PATH}/supermarket_005.glb` },
      supermarket006: { label: 'Supermarket 006', displayName: '', url: `${CITY_FULL_PATH}/supermarket_006.glb` },
      supermarket007: { label: 'Supermarket 007', displayName: '', url: `${CITY_FULL_PATH}/supermarket_007.glb` },
      supermarket008: { label: 'Supermarket 008', displayName: '', url: `${CITY_FULL_PATH}/supermarket_008.glb` },
      supermarket009: { label: 'Supermarket 009', displayName: '', url: `${CITY_FULL_PATH}/supermarket_009.glb` },
      supermarket010: { label: 'Supermarket 010', displayName: '', url: `${CITY_FULL_PATH}/supermarket_010.glb` },
      table001: { label: 'Table 001', displayName: '', url: `${CITY_FULL_PATH}/table_001.glb` },
      temple001: { label: 'Temple 001', displayName: '', url: `${CITY_FULL_PATH}/temple_001.glb` },
      temple002: { label: 'Temple 002', displayName: '', url: `${CITY_FULL_PATH}/temple_002.glb` },
      temple003: { label: 'Temple 003', displayName: '', url: `${CITY_FULL_PATH}/temple_003.glb` },
      temple004: { label: 'Temple 004', displayName: '', url: `${CITY_FULL_PATH}/temple_004.glb` },
      temple005: { label: 'Temple 005', displayName: '', url: `${CITY_FULL_PATH}/temple_005.glb` },
      temple006: { label: 'Temple 006', displayName: '', url: `${CITY_FULL_PATH}/temple_006.glb` },
      temple007: { label: 'Temple 007', displayName: '', url: `${CITY_FULL_PATH}/temple_007.glb` },
      temple008: { label: 'Temple 008', displayName: '', url: `${CITY_FULL_PATH}/temple_008.glb` },
      temple009: { label: 'Temple 009', displayName: '', url: `${CITY_FULL_PATH}/temple_009.glb` },
      temple010: { label: 'Temple 010', displayName: '', url: `${CITY_FULL_PATH}/temple_010.glb` },
      tileForHome1x1001: { label: 'Tile For Home 1x1 001', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_001.glb` },
      tileForHome1x1002: { label: 'Tile For Home 1x1 002', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_002.glb` },
      tileForHome1x1003: { label: 'Tile For Home 1x1 003', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_003.glb` },
      tileForHome1x1004: { label: 'Tile For Home 1x1 004', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_004.glb` },
      tileForHome1x1005: { label: 'Tile For Home 1x1 005', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_005.glb` },
      tileForHome1x1006: { label: 'Tile For Home 1x1 006', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_006.glb` },
      tileForHome1x1007: { label: 'Tile For Home 1x1 007', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_007.glb` },
      tileForHome1x1008: { label: 'Tile For Home 1x1 008', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_008.glb` },
      tileForHome1x1009: { label: 'Tile For Home 1x1 009', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_009.glb` },
      tileForHome1x1010: { label: 'Tile For Home 1x1 010', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_010.glb` },
      tileForHome1x1011: { label: 'Tile For Home 1x1 011', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_011.glb` },
      tileForHome1x1012: { label: 'Tile For Home 1x1 012', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_012.glb` },
      tileForHome1x1013: { label: 'Tile For Home 1x1 013', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_013.glb` },
      tileForHome1x1014: { label: 'Tile For Home 1x1 014', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_014.glb` },
      tileForHome1x1015: { label: 'Tile For Home 1x1 015', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_015.glb` },
      tileForHome1x1016: { label: 'Tile For Home 1x1 016', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_016.glb` },
      tileForHome1x1017: { label: 'Tile For Home 1x1 017', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_017.glb` },
      tileForHome1x1018: { label: 'Tile For Home 1x1 018', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_018.glb` },
      tileForHome1x1019: { label: 'Tile For Home 1x1 019', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_019.glb` },
      tileForHome1x1020: { label: 'Tile For Home 1x1 020', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_020.glb` },
      tileForHome1x1021: { label: 'Tile For Home 1x1 021', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_021.glb` },
      tileForHome1x1022: { label: 'Tile For Home 1x1 022', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_022.glb` },
      tileForHome1x1023: { label: 'Tile For Home 1x1 023', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_1x1_023.glb` },
      tileForHome2x2001: { label: 'Tile For Home 2x2 001', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_001.glb` },
      tileForHome2x2002: { label: 'Tile For Home 2x2 002', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_002.glb` },
      tileForHome2x2003: { label: 'Tile For Home 2x2 003', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_003.glb` },
      tileForHome2x2004: { label: 'Tile For Home 2x2 004', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_004.glb` },
      tileForHome2x2005: { label: 'Tile For Home 2x2 005', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_005.glb` },
      tileForHome2x2006: { label: 'Tile For Home 2x2 006', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_006.glb` },
      tileForHome2x2007: { label: 'Tile For Home 2x2 007', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_007.glb` },
      tileForHome2x2008: { label: 'Tile For Home 2x2 008', displayName: '', url: `${CITY_FULL_PATH}/tile_for_home_2x2_008.glb` },
      transportAir001: { label: 'Transport Air 001', displayName: '', url: `${CITY_FULL_PATH}/transport_air_001.glb` },
      transportAir002: { label: 'Transport Air 002', displayName: '', url: `${CITY_FULL_PATH}/transport_air_002.glb` },
      transportAir003: { label: 'Transport Air 003', displayName: '', url: `${CITY_FULL_PATH}/transport_air_003.glb` },
      transportAir004: { label: 'Transport Air 004', displayName: '', url: `${CITY_FULL_PATH}/transport_air_004.glb` },
      transportAir005: { label: 'Transport Air 005', displayName: '', url: `${CITY_FULL_PATH}/transport_air_005.glb` },
      transportAir006: { label: 'Transport Air 006', displayName: '', url: `${CITY_FULL_PATH}/transport_air_006.glb` },
      transportAir007: { label: 'Transport Air 007', displayName: '', url: `${CITY_FULL_PATH}/transport_air_007.glb` },
      transportAir008: { label: 'Transport Air 008', displayName: '', url: `${CITY_FULL_PATH}/transport_air_008.glb` },
      transportAir009: { label: 'Transport Air 009', displayName: '', url: `${CITY_FULL_PATH}/transport_air_009.glb` },
      transportAir010: { label: 'Transport Air 010', displayName: '', url: `${CITY_FULL_PATH}/transport_air_010.glb` },
      transportBus001: { label: 'Transport Bus 001', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_001.glb` },
      transportBus002: { label: 'Transport Bus 002', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_002.glb` },
      transportBus003: { label: 'Transport Bus 003', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_003.glb` },
      transportBus004: { label: 'Transport Bus 004', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_004.glb` },
      transportBus005: { label: 'Transport Bus 005', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_005.glb` },
      transportBus006: { label: 'Transport Bus 006', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_006.glb` },
      transportBus007: { label: 'Transport Bus 007', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_007.glb` },
      transportBus008: { label: 'Transport Bus 008', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_008.glb` },
      transportBus009: { label: 'Transport Bus 009', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_009.glb` },
      transportBus010: { label: 'Transport Bus 010', displayName: '', url: `${CITY_FULL_PATH}/transport_bus_010.glb` },
      transportCool001: { label: 'Transport Cool 001', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_001.glb` },
      transportCool002: { label: 'Transport Cool 002', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_002.glb` },
      transportCool003: { label: 'Transport Cool 003', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_003.glb` },
      transportCool004: { label: 'Transport Cool 004', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_004.glb` },
      transportCool005: { label: 'Transport Cool 005', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_005.glb` },
      transportCool006: { label: 'Transport Cool 006', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_006.glb` },
      transportCool007: { label: 'Transport Cool 007', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_007.glb` },
      transportCool008: { label: 'Transport Cool 008', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_008.glb` },
      transportCool009: { label: 'Transport Cool 009', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_009.glb` },
      transportCool010: { label: 'Transport Cool 010', displayName: '', url: `${CITY_FULL_PATH}/transport_cool_010.glb` },
      transportJeep001: { label: 'Transport Jeep 001', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_001.glb` },
      transportJeep002: { label: 'Transport Jeep 002', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_002.glb` },
      transportJeep003: { label: 'Transport Jeep 003', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_003.glb` },
      transportJeep004: { label: 'Transport Jeep 004', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_004.glb` },
      transportJeep005: { label: 'Transport Jeep 005', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_005.glb` },
      transportJeep006: { label: 'Transport Jeep 006', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_006.glb` },
      transportJeep007: { label: 'Transport Jeep 007', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_007.glb` },
      transportJeep008: { label: 'Transport Jeep 008', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_008.glb` },
      transportJeep009: { label: 'Transport Jeep 009', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_009.glb` },
      transportJeep010: { label: 'Transport Jeep 010', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_010.glb` },
      transportJeep011: { label: 'Transport Jeep 011', displayName: '', url: `${CITY_FULL_PATH}/transport_jeep_011.glb` },
      transportOld001: { label: 'Transport Old 001', displayName: '', url: `${CITY_FULL_PATH}/transport_old_001.glb` },
      transportOld002: { label: 'Transport Old 002', displayName: '', url: `${CITY_FULL_PATH}/transport_old_002.glb` },
      transportOld003: { label: 'Transport Old 003', displayName: '', url: `${CITY_FULL_PATH}/transport_old_003.glb` },
      transportOld004: { label: 'Transport Old 004', displayName: '', url: `${CITY_FULL_PATH}/transport_old_004.glb` },
      transportOld005: { label: 'Transport Old 005', displayName: '', url: `${CITY_FULL_PATH}/transport_old_005.glb` },
      transportOld006: { label: 'Transport Old 006', displayName: '', url: `${CITY_FULL_PATH}/transport_old_006.glb` },
      transportOld007: { label: 'Transport Old 007', displayName: '', url: `${CITY_FULL_PATH}/transport_old_007.glb` },
      transportOld008: { label: 'Transport Old 008', displayName: '', url: `${CITY_FULL_PATH}/transport_old_008.glb` },
      transportOld009: { label: 'Transport Old 009', displayName: '', url: `${CITY_FULL_PATH}/transport_old_009.glb` },
      transportOld010: { label: 'Transport Old 010', displayName: '', url: `${CITY_FULL_PATH}/transport_old_010.glb` },
      transportOld011: { label: 'Transport Old 011', displayName: '', url: `${CITY_FULL_PATH}/transport_old_011.glb` },
      transportOld012: { label: 'Transport Old 012', displayName: '', url: `${CITY_FULL_PATH}/transport_old_012.glb` },
      transportOld013: { label: 'Transport Old 013', displayName: '', url: `${CITY_FULL_PATH}/transport_old_013.glb` },
      transportPurpose001: { label: 'Transport Purpose 001', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_001.glb` },
      transportPurpose002: { label: 'Transport Purpose 002', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_002.glb` },
      transportPurpose003: { label: 'Transport Purpose 003', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_003.glb` },
      transportPurpose004: { label: 'Transport Purpose 004', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_004.glb` },
      transportPurpose005: { label: 'Transport Purpose 005', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_005.glb` },
      transportPurpose006: { label: 'Transport Purpose 006', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_006.glb` },
      transportPurpose007: { label: 'Transport Purpose 007', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_007.glb` },
      transportPurpose008: { label: 'Transport Purpose 008', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_008.glb` },
      transportPurpose009: { label: 'Transport Purpose 009', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_009.glb` },
      transportPurpose010: { label: 'Transport Purpose 010', displayName: '', url: `${CITY_FULL_PATH}/transport_purpose_010.glb` },
      transportSport001: { label: 'Transport Sport 001', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_001.glb` },
      transportSport002: { label: 'Transport Sport 002', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_002.glb` },
      transportSport003: { label: 'Transport Sport 003', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_003.glb` },
      transportSport004: { label: 'Transport Sport 004', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_004.glb` },
      transportSport005: { label: 'Transport Sport 005', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_005.glb` },
      transportSport006: { label: 'Transport Sport 006', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_006.glb` },
      transportSport007: { label: 'Transport Sport 007', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_007.glb` },
      transportSport009: { label: 'Transport Sport 009', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_009.glb` },
      transportSport010: { label: 'Transport Sport 010', displayName: '', url: `${CITY_FULL_PATH}/transport_sport_010.glb` },
      transportTruck001: { label: 'Transport Truck 001', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_001.glb` },
      transportTruck002: { label: 'Transport Truck 002', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_002.glb` },
      transportTruck003: { label: 'Transport Truck 003', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_003.glb` },
      transportTruck004: { label: 'Transport Truck 004', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_004.glb` },
      transportTruck005: { label: 'Transport Truck 005', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_005.glb` },
      transportTruck006: { label: 'Transport Truck 006', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_006.glb` },
      transportTruck007: { label: 'Transport Truck 007', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_007.glb` },
      transportTruck008: { label: 'Transport Truck 008', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_008.glb` },
      transportTruck009: { label: 'Transport Truck 009', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_009.glb` },
      transportTruck010: { label: 'Transport Truck 010', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_010.glb` },
      transportTruck011: { label: 'Transport Truck 011', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_011.glb` },
      transportTruck012: { label: 'Transport Truck 012', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_012.glb` },
      transportTruck013: { label: 'Transport Truck 013', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_013.glb` },
      transportTruck014: { label: 'Transport Truck 014', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_014.glb` },
      transportTruck015: { label: 'Transport Truck 015', displayName: '', url: `${CITY_FULL_PATH}/transport_truck_015.glb` },
      transportWater001: { label: 'Transport Water 001', displayName: '', url: `${CITY_FULL_PATH}/transport_water_001.glb` },
      transportWater002: { label: 'Transport Water 002', displayName: '', url: `${CITY_FULL_PATH}/transport_water_002.glb` },
      transportWater003: { label: 'Transport Water 003', displayName: '', url: `${CITY_FULL_PATH}/transport_water_003.glb` },
      transportWater004: { label: 'Transport Water 004', displayName: '', url: `${CITY_FULL_PATH}/transport_water_004.glb` },
      transportWater005: { label: 'Transport Water 005', displayName: '', url: `${CITY_FULL_PATH}/transport_water_005.glb` },
      transportWater006: { label: 'Transport Water 006', displayName: '', url: `${CITY_FULL_PATH}/transport_water_006.glb` },
      transportWater007: { label: 'Transport Water 007', displayName: '', url: `${CITY_FULL_PATH}/transport_water_007.glb` },
      transportWater008: { label: 'Transport Water 008', displayName: '', url: `${CITY_FULL_PATH}/transport_water_008.glb` },
      transportWater009: { label: 'Transport Water 009', displayName: '', url: `${CITY_FULL_PATH}/transport_water_009.glb` },
      transportWater010: { label: 'Transport Water 010', displayName: '', url: `${CITY_FULL_PATH}/transport_water_010.glb` },
      trash001: { label: 'Trash 001', displayName: '', url: `${CITY_FULL_PATH}/trash_001.glb` },
      trash002: { label: 'Trash 002', displayName: '', url: `${CITY_FULL_PATH}/trash_002.glb` },
      trash003: { label: 'Trash 003', displayName: '', url: `${CITY_FULL_PATH}/trash_003.glb` },
      trash004: { label: 'Trash 004', displayName: '', url: `${CITY_FULL_PATH}/trash_004.glb` },
      trash005: { label: 'Trash 005', displayName: '', url: `${CITY_FULL_PATH}/trash_005.glb` },
      vegetation001: { label: 'Vegetation 001', displayName: '', url: `${CITY_FULL_PATH}/vegetation_001.glb` },
      vegetation002: { label: 'Vegetation 002', displayName: '', url: `${CITY_FULL_PATH}/vegetation_002.glb` },
      vegetation003: { label: 'Vegetation 003', displayName: '', url: `${CITY_FULL_PATH}/vegetation_003.glb` },
      vegetation004: { label: 'Vegetation 004', displayName: '', url: `${CITY_FULL_PATH}/vegetation_004.glb` },
      vegetation005: { label: 'Vegetation 005', displayName: '', url: `${CITY_FULL_PATH}/vegetation_005.glb` },
      vegetation006: { label: 'Vegetation 006', displayName: '', url: `${CITY_FULL_PATH}/vegetation_006.glb` },
      vegetation007: { label: 'Vegetation 007', displayName: '', url: `${CITY_FULL_PATH}/vegetation_007.glb` },
      vegetation008: { label: 'Vegetation 008', displayName: '', url: `${CITY_FULL_PATH}/vegetation_008.glb` },
      vegetation009: { label: 'Vegetation 009', displayName: '', url: `${CITY_FULL_PATH}/vegetation_009.glb` },
      vegetation010: { label: 'Vegetation 010', displayName: '', url: `${CITY_FULL_PATH}/vegetation_010.glb` },
      vegetation011: { label: 'Vegetation 011', displayName: '', url: `${CITY_FULL_PATH}/vegetation_011.glb` },
      vegetation012: { label: 'Vegetation 012', displayName: '', url: `${CITY_FULL_PATH}/vegetation_012.glb` },
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
  customTag?: string  // etiqueta/clasificación: edificio, decoracion, vegetacion, etc.
}

// Scenario type for persistence
interface ScenarioData {
  id: string
  code: string
  name: string
  worldType: string
  scene: {
    baseModel: string
    placements: MapPlacement[]
  }
  createdAt: string
  updatedAt: string
  version: number
}

// localStorage helpers
const STORAGE_KEY = 'calleviva_scenarios'

const scenarioStorage = {
  save: (scenario: ScenarioData) => {
    const scenarios = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    scenarios[scenario.code] = { ...scenario, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
  },
  load: (code: string): ScenarioData | null => {
    const scenarios = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return scenarios[code] || null
  },
  list: (): ScenarioData[] => {
    const scenarios = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return Object.values(scenarios)
  },
  remove: (code: string) => {
    const scenarios = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    delete scenarios[code]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
  }
}

// API helpers for backend sync
const API_BASE = '/api/v1'

const scenarioAPI = {
  list: async (): Promise<ScenarioData[]> => {
    const res = await fetch(`${API_BASE}/scenarios`)
    if (!res.ok) throw new Error('Failed to fetch scenarios')
    const data = await res.json()
    return data.scenarios || []
  },
  get: async (code: string): Promise<ScenarioData | null> => {
    const res = await fetch(`${API_BASE}/scenarios/${code}`)
    if (!res.ok) return null
    return res.json()
  },
  create: async (scenario: Omit<ScenarioData, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ScenarioData> => {
    const res = await fetch(`${API_BASE}/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create scenario')
    }
    return res.json()
  },
  update: async (code: string, data: Partial<ScenarioData>): Promise<ScenarioData> => {
    const res = await fetch(`${API_BASE}/scenarios/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update scenario')
    return res.json()
  },
  delete: async (code: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/scenarios/${code}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete scenario')
  }
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

// Cinematic Intro Camera - sweeping entrance animation
const IntroCamera: React.FC<{
  targetPosition: [number, number, number]
  targetLookAt: [number, number, number]
  onComplete: () => void
}> = ({ targetPosition, targetLookAt, onComplete }) => {
  const { camera } = useThree()
  const progressRef = useRef(0)
  const completedRef = useRef(false)

  // Configuración de la animación - MÁS LENTA Y DRAMÁTICA
  const duration = 7.0 // segundos
  const startHeight = 600 // más alto
  const startRadius = 500 // más lejos
  const startAngle = -Math.PI * 0.7 // empieza más atrás

  useEffect(() => {
    // Posición inicial: muy alta y a un lado
    camera.position.set(
      targetLookAt[0] + Math.cos(startAngle) * startRadius,
      startHeight,
      targetLookAt[2] + Math.sin(startAngle) * startRadius
    )
    camera.lookAt(targetLookAt[0], 0, targetLookAt[2])
  }, [camera, targetLookAt])

  useFrame((_, delta) => {
    if (completedRef.current) return

    progressRef.current += delta / duration

    if (progressRef.current >= 1) {
      // Animación completa
      camera.position.set(...targetPosition)
      camera.lookAt(targetLookAt[0], 0, targetLookAt[2])
      completedRef.current = true
      onComplete()
      return
    }

    const t = progressRef.current

    // Easing: ease-in-out para entrada suave y aterrizaje suave
    const ease = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2

    // Interpolar altura (baja suavemente)
    const currentHeight = startHeight + (targetPosition[1] - startHeight) * ease

    // Interpolar radio (se acerca gradualmente)
    const targetRadius = Math.sqrt(
      Math.pow(targetPosition[0] - targetLookAt[0], 2) +
      Math.pow(targetPosition[2] - targetLookAt[2], 2)
    )
    const currentRadius = startRadius + (targetRadius - startRadius) * ease

    // Rotar alrededor - vuelta más amplia (casi completa)
    const targetAngle = Math.atan2(
      targetPosition[2] - targetLookAt[2],
      targetPosition[0] - targetLookAt[0]
    )
    const rotationAmount = Math.PI * 1.2 // más de media vuelta
    const currentAngle = startAngle + (targetAngle - startAngle + rotationAmount) * ease

    // Calcular posición
    const x = targetLookAt[0] + Math.cos(currentAngle) * currentRadius
    const z = targetLookAt[2] + Math.sin(currentAngle) * currentRadius

    camera.position.set(x, currentHeight, z)
    camera.lookAt(targetLookAt[0], 0, targetLookAt[2])
  })

  return null
}

// Base mode types
type BaseMode = 'city' | 'empty' | 'generated'

// 3D Scene - city and controls
const Scene: React.FC<{
  zone: CityZone
  editorMode: boolean
  onCoordCapture: (coord: [number, number, number]) => void
  markers: [number, number, number][]
  placements: MapPlacement[]
  showIntro: boolean
  onIntroComplete: () => void
  baseMode: BaseMode
  groundColor: string
  groundSize: number
  selectedPlacementId: string | null
  selectedIds: Set<string>
  onSelectPlacement: (id: string | null, ctrlKey?: boolean) => void
  onRightClickPlacement: (id: string, x: number, y: number) => void
  // Drag & Drop
  isDragging: boolean
  onDragStart: (id: string, y: number) => void
  onDragMove: (x: number, z: number) => void
  onDragEnd: () => void
}> = ({ zone, editorMode, onCoordCapture, markers, placements, showIntro, onIntroComplete, baseMode, groundColor, groundSize, selectedPlacementId, selectedIds, onSelectPlacement, onRightClickPlacement, isDragging, onDragStart, onDragMove, onDragEnd }) => {
  const controlsRef = useRef<any>(null)
  const { camera, raycaster, pointer } = useThree()

  // Click en el suelo/ciudad - solo con Shift para colocar assets
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!editorMode) return
    e.stopPropagation()

    // Solo permitir colocar con Shift+Click (evita placement accidental al navegar)
    if (!e.nativeEvent.shiftKey) {
      // Sin Shift: deseleccionar cualquier objeto
      onSelectPlacement(null)
      return
    }

    const point = e.point
    const coord: [number, number, number] = [
      Math.round(point.x * 10) / 10,
      Math.round(point.y * 10) / 10,
      Math.round(point.z * 10) / 10
    ]
    onCoordCapture(coord)
  }, [editorMode, onCoordCapture, onSelectPlacement])

  // Deshabilitar OrbitControls durante el drag
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging
    }
  }, [isDragging])

  // Handler para mover el objeto durante el drag
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectionPoint = useRef(new THREE.Vector3())

  // Actualizar el plano de drag cuando cambia el objeto arrastrado
  const handlePointerMove = useCallback(() => {
    if (!isDragging) return

    // Raycast al plano horizontal Y
    raycaster.setFromCamera(pointer, camera)
    if (raycaster.ray.intersectPlane(dragPlane.current, intersectionPoint.current)) {
      onDragMove(intersectionPoint.current.x, intersectionPoint.current.z)
    }
  }, [isDragging, camera, raycaster, pointer, onDragMove])

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      onDragEnd()
    }
  }, [isDragging, onDragEnd])

  return (
    <>
      {/* Intro animation or static camera */}
      {showIntro ? (
        <IntroCamera
          targetPosition={zone.cameraPosition}
          targetLookAt={zone.center}
          onComplete={onIntroComplete}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          position={zone.cameraPosition}
          fov={60}
        />
      )}

      {/* Controls - disabled during intro */}
      <OrbitControls
        ref={controlsRef}
        target={zone.center}
        minDistance={10}
        maxDistance={300}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.1}
        enablePan={true}
        panSpeed={0.8}
        enabled={!showIntro}
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

      {/* Complete City Scene - only in 'city' mode */}
      {baseMode === 'city' && (
        <Suspense fallback={null}>
          <CityScene position={[0, 0, 0]} scale={1} onClick={handleClick} />
        </Suspense>
      )}

      {/* Ground plane for empty/generated modes - Y=-0.5 para no tapar objetos en Y=0 */}
      {baseMode !== 'city' && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
          receiveShadow
          onClick={handleClick}
        >
          <planeGeometry args={[groundSize, groundSize]} />
          <meshStandardMaterial color={groundColor} roughness={0.9} />
        </mesh>
      )}

      {/* Drag event capture group */}
      <group
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Editor placed assets - clickable for selection */}
        <PlacedAssets
          placements={placements}
          selectedId={selectedPlacementId}
          selectedIds={selectedIds}
          onSelect={onSelectPlacement}
          onRightClick={onRightClickPlacement}
          editorMode={editorMode}
          onDragStart={onDragStart}
          isDragging={isDragging}
        />
      </group>

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

// Clickable wrapper for placed assets (for selection in editor mode)
const ClickableAsset: React.FC<{
  placement: MapPlacement
  isSelected: boolean
  onClick: (id: string, ctrlKey?: boolean) => void
  onRightClick: (id: string, screenX: number, screenY: number) => void
  editorMode: boolean
  onDragStart: (id: string, y: number) => void
  isDragging: boolean
}> = ({ placement, isSelected, onClick, onRightClick, editorMode, onDragStart, isDragging }) => {
  const url = getAssetUrl(placement.category, placement.assetKey)
  if (!url) return null

  const VehicleComponent = placement.megacity ? MegaCityVehicle : StaticVehicle

  return (
    <group
      onClick={(e) => {
        if (editorMode && !isDragging) {
          e.stopPropagation()
          onClick(placement.id, e.nativeEvent.ctrlKey || e.nativeEvent.metaKey)
        }
      }}
      onPointerDown={(e) => {
        if (!editorMode) return

        // Alt + Left click = start drag
        if (e.nativeEvent.altKey && e.nativeEvent.button === 0) {
          e.stopPropagation()
          onDragStart(placement.id, placement.position[1])
          return
        }

        // Right click (button 2) = context menu
        if (e.nativeEvent.button === 2) {
          e.stopPropagation()
          e.nativeEvent.preventDefault()
          e.nativeEvent.stopPropagation()
          onRightClick(placement.id, e.nativeEvent.clientX, e.nativeEvent.clientY)
        }
      }}
      onContextMenu={(e) => {
        // Prevent browser context menu on right-click
        if (editorMode) {
          e.stopPropagation()
          e.nativeEvent.preventDefault()
        }
      }}
    >
      <VehicleComponent
        url={url}
        position={placement.position}
        rotation={placement.rotation}
        scale={placement.scale}
      />
      {/* Selection indicator - glowing ring around selected object */}
      {isSelected && (
        <mesh position={[placement.position[0], placement.position[1] + 0.1, placement.position[2]]}>
          <ringGeometry args={[3 * placement.scale, 4 * placement.scale, 32]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// Render placed assets from editor
const PlacedAssets: React.FC<{
  placements: MapPlacement[]
  selectedId: string | null
  selectedIds: Set<string>
  onSelect: (id: string | null, ctrlKey?: boolean) => void
  onRightClick: (id: string, x: number, y: number) => void
  editorMode: boolean
  onDragStart: (id: string, y: number) => void
  isDragging: boolean
}> = ({ placements, selectedId, selectedIds, onSelect, onRightClick, editorMode, onDragStart, isDragging }) => {
  const handleClick = useCallback((id: string, ctrlKey: boolean = false) => {
    onSelect(id, ctrlKey)
  }, [onSelect])

  const handleRightClick = useCallback((id: string, x: number, y: number) => {
    onSelect(id, false) // También seleccionar al hacer click derecho
    onRightClick(id, x, y)
  }, [onSelect, onRightClick])

  return (
    <>
      {placements.map(p => (
        <Suspense key={p.id} fallback={null}>
          <ClickableAsset
            placement={p}
            isSelected={selectedId === p.id || selectedIds.has(p.id)}
            onClick={handleClick}
            onRightClick={handleRightClick}
            editorMode={editorMode}
            onDragStart={onDragStart}
            isDragging={isDragging}
          />
        </Suspense>
      ))}
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
  const [searchQuery, setSearchQuery] = useState('')

  const handleAssetClick = (key: string) => {
    setSelectedAsset(key)
  }

  // Filtrar assets por búsqueda
  const getFilteredAssets = () => {
    if (!selectedCategory) return []
    const items = ASSET_CATALOG[selectedCategory].items
    if (!searchQuery.trim()) return Object.entries(items)

    const query = searchQuery.toLowerCase()
    return Object.entries(items).filter(([key, item]) => {
      const label = (item as { label: string; displayName?: string }).label?.toLowerCase() || ''
      const displayName = (item as { displayName?: string }).displayName?.toLowerCase() || ''
      return label.includes(query) || displayName.includes(query) || key.toLowerCase().includes(query)
    })
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
              onClick={() => { setSelectedCategory(null); setSearchQuery('') }}
              className="text-gray-400 hover:text-white text-sm mb-2"
            >
              ← Volver
            </button>
            <div className="text-gray-400 text-sm mb-2">{ASSET_CATALOG[selectedCategory].label}:</div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar asset..."
              className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded-lg mb-2 border border-gray-700 focus:border-coral focus:outline-none"
              autoFocus
            />

            <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto">
              {getFilteredAssets().map(([key, item]) => {
                const isMC = (item as { megacity?: boolean }).megacity
                return (
                  <button
                    key={key}
                    onClick={() => handleAssetClick(key)}
                    className={`${isMC ? 'bg-purple-600 hover:bg-purple-500' : 'bg-coral hover:bg-coral/80'} text-white p-2 rounded-lg text-sm text-left flex flex-col`}
                  >
                    <span className="font-bold">
                      {isMC && <span className="mr-1">◆</span>}
                      {(item as { displayName?: string }).displayName || (item as { label: string }).label}
                    </span>
                    {(item as { displayName?: string }).displayName && (
                      <span className="text-xs text-white/70">{(item as { label: string }).label}</span>
                    )}
                  </button>
                )
              })}
              {getFilteredAssets().length === 0 && (
                <div className="text-gray-500 text-sm text-center py-4">
                  No se encontraron assets
                </div>
              )}
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
  zoneId = 'panoramica',
}) => {
  const [currentZoneId, setCurrentZoneId] = useState(zoneId)
  const [editorMode, setEditorMode] = useState(false)
  const [placements, setPlacementsInternal] = useState<MapPlacement[]>([])
  const [pendingPosition, setPendingPosition] = useState<[number, number, number] | null>(null)

  // Undo/Redo system
  const [history, setHistory] = useState<MapPlacement[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const MAX_HISTORY = 50

  // Custom setPlacements that tracks history
  const setPlacements = useCallback((action: MapPlacement[] | ((prev: MapPlacement[]) => MapPlacement[])) => {
    setPlacementsInternal(prev => {
      const newPlacements = typeof action === 'function' ? action(prev) : action
      // Solo agregar al historial si cambió
      if (JSON.stringify(newPlacements) !== JSON.stringify(prev)) {
        setHistory(h => {
          // Cortar el historial desde el índice actual
          const newHistory = h.slice(0, historyIndex + 1)
          newHistory.push(newPlacements)
          // Limitar tamaño del historial
          if (newHistory.length > MAX_HISTORY) {
            newHistory.shift()
            return newHistory
          }
          return newHistory
        })
        setHistoryIndex(i => Math.min(i + 1, MAX_HISTORY - 1))
      }
      return newPlacements
    })
  }, [historyIndex])

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setPlacementsInternal(history[newIndex])
    }
  }, [historyIndex, history])

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setPlacementsInternal(history[newIndex])
    }
  }, [historyIndex, history])
  const [markers, setMarkers] = useState<[number, number, number][]>([])
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()) // Multi-selection
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [editorPanelCollapsed, setEditorPanelCollapsed] = useState(false)

  // Drag & Drop states
  const [isDragging, setIsDragging] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [draggedY, setDraggedY] = useState(0) // Y del objeto siendo arrastrado

  // Preview mode - oculta toda la UI para ver el escenario limpio
  const [previewMode, setPreviewMode] = useState(false)

  // Snap to Grid - alinea objetos a una cuadrícula
  const [snapToGrid, setSnapToGrid] = useState(false)
  const GRID_SIZE = 5 // tamaño de la cuadrícula en unidades

  const zone = getZone(currentZoneId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Obtener el placement seleccionado
  const selectedPlacement = placements.find(p => p.id === selectedPlacementId)

  // Cerrar menú contextual al hacer click fuera
  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  // Abrir menú contextual al hacer click derecho en un objeto
  const handleRightClickPlacement = useCallback((id: string, x: number, y: number) => {
    setSelectedPlacementId(id)
    setContextMenu({ x, y })
  }, [])

  // Manejo de selección (simple y múltiple)
  const handleSelectPlacement = useCallback((id: string | null, ctrlKey: boolean = false) => {
    if (!id) {
      // Click en vacío - deseleccionar todo
      setSelectedPlacementId(null)
      setSelectedIds(new Set())
      return
    }

    if (ctrlKey) {
      // Ctrl+Click - agregar/quitar de la selección múltiple
      setSelectedIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
      // También agregar el ID principal si no está
      if (!selectedPlacementId) {
        setSelectedPlacementId(id)
      }
    } else {
      // Click normal - selección simple, limpiar multi-selección
      setSelectedPlacementId(id)
      setSelectedIds(new Set())
    }
  }, [selectedPlacementId])

  // Drag & Drop handlers
  const handleDragStart = useCallback((id: string, y: number) => {
    setIsDragging(true)
    setDraggedId(id)
    setDraggedY(y)
    setSelectedPlacementId(id)
    closeContextMenu()
  }, [closeContextMenu])

  // Helper para snap to grid
  const snapValue = useCallback((value: number) => {
    if (!snapToGrid) return Math.round(value * 10) / 10
    return Math.round(value / GRID_SIZE) * GRID_SIZE
  }, [snapToGrid, GRID_SIZE])

  const handleDragMove = useCallback((newX: number, newZ: number) => {
    if (!isDragging || !draggedId) return

    setPlacements(prev => prev.map(p => {
      if (p.id !== draggedId) return p
      return {
        ...p,
        position: [
          snapValue(newX),
          draggedY,
          snapValue(newZ)
        ] as [number, number, number]
      }
    }))
  }, [isDragging, draggedId, draggedY, snapValue])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedId(null)
  }, [])

  // Rotar 90 grados con tecla R
  const rotateSelected90 = useCallback(() => {
    if (!selectedPlacementId) return
    setPlacements(prev => prev.map(p => {
      if (p.id !== selectedPlacementId) return p
      // Sumar 90 grados (PI/2), mantener en rango [0, 2PI)
      const newRotation = (p.rotation + Math.PI / 2) % (Math.PI * 2)
      return { ...p, rotation: newRotation }
    }))
  }, [selectedPlacementId])

  // Eliminar todos los seleccionados
  const removeSelectedPlacements = useCallback(() => {
    const idsToRemove = new Set([...selectedIds])
    if (selectedPlacementId) idsToRemove.add(selectedPlacementId)

    if (idsToRemove.size === 0) return

    setPlacements(prev => prev.filter(p => !idsToRemove.has(p.id)))
    setSelectedPlacementId(null)
    setSelectedIds(new Set())
  }, [selectedPlacementId, selectedIds])

  // Duplicar todos los seleccionados
  const duplicateSelectedPlacements = useCallback(() => {
    const idsToDuplicate = new Set([...selectedIds])
    if (selectedPlacementId && !selectedIds.has(selectedPlacementId)) {
      idsToDuplicate.add(selectedPlacementId)
    }

    if (idsToDuplicate.size === 0) return

    const newPlacements: MapPlacement[] = []
    const newIds: string[] = []

    placements.forEach(p => {
      if (idsToDuplicate.has(p.id)) {
        const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        newPlacements.push({
          ...p,
          id: newId,
          position: [
            p.position[0] + 5,
            p.position[1],
            p.position[2] + 5
          ],
          customName: p.customName ? `${p.customName} (copia)` : undefined,
        })
        newIds.push(newId)
      }
    })

    setPlacements(prev => [...prev, ...newPlacements])
    // Seleccionar los nuevos duplicados
    setSelectedIds(new Set(newIds))
    if (newIds.length > 0) {
      setSelectedPlacementId(newIds[0])
    }
  }, [placements, selectedIds, selectedPlacementId])

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!editorMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // R = Rotar 90 grados
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        rotateSelected90()
      }

      // P = Toggle Preview mode
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setPreviewMode(prev => !prev)
      }

      // G = Toggle Snap to Grid
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        setSnapToGrid(prev => !prev)
      }

      // Ctrl+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Shift+Z or Ctrl+Y = Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }

      // Delete/Backspace = Eliminar seleccionados
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removeSelectedPlacements()
      }

      // Ctrl+D = Duplicar seleccionados
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        duplicateSelectedPlacements()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editorMode, rotateSelected90, undo, redo, removeSelectedPlacements, duplicateSelectedPlacements])

  // Metadata del escenario
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioCode, setScenarioCode] = useState('')
  const [savedScenarios, setSavedScenarios] = useState<ScenarioData[]>([])
  const [serverScenarios, setServerScenarios] = useState<ScenarioData[]>([])
  const [showSavedList, setShowSavedList] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Intro animation state - only on first load with panoramica
  const [showIntro, setShowIntro] = useState(zoneId === 'panoramica')

  // Base mode: 'city' (with City_2.glb), 'generated' (tiles), 'empty' (just ground)
  const [baseMode, setBaseMode] = useState<BaseMode>('city')

  // Ground color for empty/generated modes
  const [groundColor, setGroundColor] = useState('#4a7c59') // verde por defecto

  // Ground size for empty/generated modes
  const [groundSize, setGroundSize] = useState(400) // 400x400 por defecto

  // Tamaños predefinidos para el canvas
  const GROUND_SIZES = [
    { size: 100, name: 'Pequeño', icon: '🔲' },
    { size: 200, name: 'Mediano', icon: '⬜' },
    { size: 400, name: 'Grande', icon: '🟩' },
    { size: 800, name: 'Extra Grande', icon: '🗺️' },
  ]

  // Colores predefinidos para el terreno
  const GROUND_COLORS = [
    { color: '#4a7c59', name: 'Césped', icon: '🌿' },
    { color: '#1e3a5f', name: 'Mar', icon: '🌊' },
    { color: '#5bb3d0', name: 'Lago', icon: '💧' },
    { color: '#6b7280', name: 'Concreto', icon: '🏗️' },
    { color: '#8b6914', name: 'Arena', icon: '🏖️' },
    { color: '#4a3728', name: 'Tierra', icon: '🪨' },
  ]

  // Cargar lista de escenarios al montar
  React.useEffect(() => {
    setSavedScenarios(scenarioStorage.list())
    // Cargar escenarios del servidor
    scenarioAPI.list().then(setServerScenarios).catch(console.error)
  }, [])

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
  }, [])

  const handleCoordCapture = useCallback((coord: [number, number, number]) => {
    const snappedCoord: [number, number, number] = [
      snapValue(coord[0]),
      coord[1], // No snap en Y
      snapValue(coord[2])
    ]
    setPendingPosition(snappedCoord)
    setMarkers(prev => [...prev, snappedCoord])
  }, [snapValue])

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
    const code = scenarioCode || `escenario_${Date.now()}`
    const scenario = {
      id: crypto.randomUUID(),
      code,
      name: scenarioName || 'Sin nombre',
      worldType: 'costa_rica',
      scene: {
        baseModel: '/assets/models/City/CityFull/City_2.glb',
        placements
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
    const json = JSON.stringify(scenario, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${code}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [placements, scenarioName, scenarioCode])

  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)

        // Soportar formato viejo (solo array) y nuevo (con metadata)
        let importedPlacements: MapPlacement[]
        if (Array.isArray(data)) {
          importedPlacements = data
        } else if (data.scene?.placements && Array.isArray(data.scene.placements)) {
          importedPlacements = data.scene.placements
        } else {
          throw new Error('Formato inválido: no se encontró array de placements')
        }

        // Validar que cada placement tenga los campos requeridos
        const validPlacements = importedPlacements.filter(p =>
          p.id && p.category && p.assetKey && Array.isArray(p.position)
        )

        if (validPlacements.length === 0) {
          throw new Error('No se encontraron placements válidos')
        }

        setPlacements(validPlacements)
        setMarkers([]) // Limpiar markers

        // Cargar metadata si existe
        if (data.name) setScenarioName(data.name)
        if (data.code) setScenarioCode(data.code)

        const name = data.name || 'sin nombre'
        alert(`Escenario "${name}" cargado: ${validPlacements.length} elementos`)
      } catch (err) {
        alert('Error al cargar JSON: ' + (err as Error).message)
      }
    }
    reader.readAsText(file)

    // Reset input para poder cargar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const saveToLocal = useCallback(() => {
    if (!scenarioCode.trim()) {
      alert('Ingresa un código para el escenario')
      return
    }
    const scenario: ScenarioData = {
      id: crypto.randomUUID(),
      code: scenarioCode,
      name: scenarioName || 'Sin nombre',
      worldType: 'costa_rica',
      scene: {
        baseModel: '/assets/models/City/CityFull/City_2.glb',
        placements
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
    scenarioStorage.save(scenario)
    setSavedScenarios(scenarioStorage.list())
    alert(`Escenario "${scenario.name}" guardado localmente`)
  }, [placements, scenarioName, scenarioCode])

  const loadFromLocal = useCallback((code: string) => {
    const scenario = scenarioStorage.load(code)
    if (!scenario) {
      alert('Escenario no encontrado')
      return
    }
    setPlacements(scenario.scene.placements)
    setScenarioName(scenario.name)
    setScenarioCode(scenario.code)
    setMarkers([])
    setShowSavedList(false)
    alert(`Escenario "${scenario.name}" cargado`)
  }, [])

  const deleteFromLocal = useCallback((code: string) => {
    if (!confirm(`¿Eliminar escenario "${code}"?`)) return
    scenarioStorage.remove(code)
    setSavedScenarios(scenarioStorage.list())
  }, [])

  // === SERVER SYNC FUNCTIONS ===

  const saveToServer = useCallback(async () => {
    if (!scenarioCode.trim()) {
      alert('Ingresa un código para el escenario')
      return
    }
    setIsSyncing(true)
    try {
      const scenarioData = {
        code: scenarioCode,
        name: scenarioName || 'Sin nombre',
        worldType: 'costa_rica',
        scene: {
          baseModel: '/assets/models/City/CityFull/City_2.glb',
          placements
        }
      }

      // Check if exists on server
      const existing = await scenarioAPI.get(scenarioCode)
      let saved: ScenarioData

      if (existing) {
        // Update existing
        saved = await scenarioAPI.update(scenarioCode, {
          name: scenarioData.name,
          scene: scenarioData.scene
        })
        alert(`Escenario "${saved.name}" actualizado en servidor (v${saved.version})`)
      } else {
        // Create new
        saved = await scenarioAPI.create(scenarioData)
        alert(`Escenario "${saved.name}" guardado en servidor`)
      }

      // Update server list
      const updated = await scenarioAPI.list()
      setServerScenarios(updated)
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsSyncing(false)
    }
  }, [placements, scenarioName, scenarioCode])

  const loadFromServer = useCallback(async (code: string) => {
    setIsSyncing(true)
    try {
      const scenario = await scenarioAPI.get(code)
      if (!scenario) {
        alert('Escenario no encontrado en servidor')
        return
      }
      setPlacements(scenario.scene.placements)
      setScenarioName(scenario.name)
      setScenarioCode(scenario.code)
      setMarkers([])
      setShowSavedList(false)
      alert(`Escenario "${scenario.name}" (v${scenario.version}) cargado desde servidor`)
    } catch (err) {
      alert('Error al cargar: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const deleteFromServer = useCallback(async (code: string) => {
    if (!confirm(`¿Eliminar escenario "${code}" del servidor?`)) return
    setIsSyncing(true)
    try {
      await scenarioAPI.delete(code)
      const updated = await scenarioAPI.list()
      setServerScenarios(updated)
      alert('Escenario eliminado del servidor')
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const refreshServerList = useCallback(async () => {
    setIsSyncing(true)
    try {
      const list = await scenarioAPI.list()
      setServerScenarios(list)
    } catch (err) {
      console.error('Error fetching server scenarios:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const removePlacement = useCallback((id: string) => {
    setPlacements(prev => prev.filter(p => p.id !== id))
  }, [])

  const updatePlacementName = useCallback((id: string, customName: string) => {
    setPlacements(prev => prev.map(p =>
      p.id === id ? { ...p, customName } : p
    ))
  }, [])

  const updatePlacementTag = useCallback((id: string, customTag: string) => {
    setPlacements(prev => prev.map(p =>
      p.id === id ? { ...p, customTag } : p
    ))
  }, [])

  // Mover placement (ajustar posición)
  const movePlacement = useCallback((id: string, axis: 'x' | 'y' | 'z', delta: number) => {
    setPlacements(prev => prev.map(p => {
      if (p.id !== id) return p
      const newPos: [number, number, number] = [...p.position]
      const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
      newPos[axisIndex] = Math.round((newPos[axisIndex] + delta) * 10) / 10
      return { ...p, position: newPos }
    }))
  }, [])

  // Rotar placement
  const rotatePlacement = useCallback((id: string, rotation: number) => {
    setPlacements(prev => prev.map(p =>
      p.id === id ? { ...p, rotation } : p
    ))
  }, [])

  // Escalar placement
  const scalePlacement = useCallback((id: string, scale: number) => {
    setPlacements(prev => prev.map(p =>
      p.id === id ? { ...p, scale: Math.max(0.1, Math.min(5, scale)) } : p
    ))
  }, [])

  // Duplicar placement
  const duplicatePlacement = useCallback((id: string) => {
    const original = placements.find(p => p.id === id)
    if (!original) return

    const newPlacement: MapPlacement = {
      ...original,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      position: [
        original.position[0] + 5,
        original.position[1],
        original.position[2] + 5
      ],
      customName: original.customName ? `${original.customName} (copia)` : undefined,
    }
    setPlacements(prev => [...prev, newPlacement])
    setSelectedPlacementId(newPlacement.id)
  }, [placements])

  // ==== GENERADOR DE TERRENO BASE ====
  const TERRAIN_TILES = {
    road: [
      'roadTile1x1001', 'roadTile1x1002', 'roadTile1x1003', 'roadTile1x1004',
      'roadTile1x1005', 'roadTile1x1006', 'roadTile1x1007', 'roadTile1x1008',
      'roadTile1x1009', 'roadTile1x1010', 'roadTile1x1011', 'roadTile1x1012',
      'roadTile2x2001', 'roadTile2x2002', 'roadTile2x2003', 'roadTile2x2004',
      'roadTile2x2005', 'roadTile2x2006', 'roadTile2x2007', 'roadTile2x2008',
    ],
    home: [
      'tileForHome1x1001', 'tileForHome1x1002', 'tileForHome1x1003', 'tileForHome1x1004',
      'tileForHome1x1005', 'tileForHome1x1006', 'tileForHome1x1007', 'tileForHome1x1008',
      'tileForHome1x1009', 'tileForHome1x1010', 'tileForHome1x1011', 'tileForHome1x1012',
      'tileForHome1x1013', 'tileForHome1x1014', 'tileForHome1x1015', 'tileForHome1x1016',
    ],
    beach: [
      'beachTile1x1001', 'beachTile1x1002', 'beachTile1x1003', 'beachTile1x1004',
      'beachTile1x1005', 'beachTile1x1006', 'beachTile1x1007', 'beachTile1x1008',
      'beachTile1x1009',
    ],
    parking: [
      'parkingTile2x2001', 'parkingTile2x2002', 'parkingTile2x2003', 'parkingTile2x2004',
    ],
    port: [
      'portTile1x1001', 'portTile1x1003', 'portTile1x1004', 'portTile1x1005',
      'portTile1x1006', 'portTile1x1007',
    ],
  }

  const generateBaseTerrain = useCallback((gridSize: number = 5) => {
    const tileSize = 20 // unidades 3D por tile
    const newPlacements: MapPlacement[] = []

    // Pesos de probabilidad por tipo
    const weights = {
      road: 0.40,     // 40% carreteras
      home: 0.35,     // 35% suelo base
      beach: 0.12,    // 12% playa
      parking: 0.06,  // 6% parking
      port: 0.07,     // 7% puerto
    }

    // Selección aleatoria ponderada
    const weightedRandom = (): keyof typeof weights => {
      const rand = Math.random()
      let sum = 0
      for (const [type, weight] of Object.entries(weights)) {
        sum += weight
        if (rand <= sum) return type as keyof typeof weights
      }
      return 'home'
    }

    // Centrar el grid en el origen
    // El grid de N tiles tiene N-1 espacios entre centros
    // Para centrar simétrico: offset = (N-1) * tileSize / 2
    const offset = ((gridSize - 1) * tileSize) / 2

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const tileType = weightedRandom()
        const tiles = TERRAIN_TILES[tileType]
        const tileKey = tiles[Math.floor(Math.random() * tiles.length)]

        newPlacements.push({
          id: `terrain-${x}-${z}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          category: 'cfCityFull' as AssetCategory,
          assetKey: tileKey,
          position: [
            x * tileSize - offset,
            0,
            z * tileSize - offset
          ],
          rotation: Math.floor(Math.random() * 4) * (Math.PI / 2), // 0, 90, 180, 270 grados
          scale: 1,
        })
      }
    }

    setPlacements(newPlacements)
    setScenarioName('')
    setScenarioCode('')
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
            key={`${zone.id}-${baseMode}-${groundColor}-${groundSize}`}
            zone={zone}
            editorMode={editorMode}
            onCoordCapture={handleCoordCapture}
            markers={markers}
            placements={placements}
            showIntro={showIntro}
            onIntroComplete={handleIntroComplete}
            baseMode={baseMode}
            groundColor={groundColor}
            groundSize={groundSize}
            selectedPlacementId={selectedPlacementId}
            selectedIds={selectedIds}
            onSelectPlacement={handleSelectPlacement}
            onRightClickPlacement={handleRightClickPlacement}
            isDragging={isDragging}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
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

      {/* Instructions - se mueve cuando el panel editor está abierto */}
      <div
        className={`absolute bottom-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-sm transition-all duration-300 ${
          editorMode && !editorPanelCollapsed ? 'left-80' : 'left-4'
        }`}
      >
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

      {/* Editor Mode Toggle - Hidden in preview mode */}
      {!previewMode && (
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
      )}

      {/* Preview Mode Indicator */}
      {previewMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="text-purple-400 font-bold">👁️ PREVIEW</span>
          <span className="text-gray-400 text-sm">Presiona P para salir</span>
        </div>
      )}

      {/* Editor Panel - Collapsible Slide-out Drawer */}
      {editorMode && !previewMode && (
        <>
          {/* Tab para abrir/cerrar el panel cuando está colapsado */}
          <button
            onClick={() => setEditorPanelCollapsed(!editorPanelCollapsed)}
            className={`absolute top-20 z-30 bg-black/90 backdrop-blur-sm text-white px-2 py-4 rounded-r-lg transition-all duration-300 hover:bg-black ${
              editorPanelCollapsed ? 'left-0' : 'left-72'
            }`}
            title={editorPanelCollapsed ? 'Abrir panel' : 'Cerrar panel'}
          >
            <span className="text-lg">{editorPanelCollapsed ? '▶' : '◀'}</span>
          </button>

          {/* Panel principal con animación de slide */}
          <div
            className={`absolute top-20 bg-black/90 backdrop-blur-sm rounded-r-xl px-4 py-3 text-white w-72 max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-300 z-20 ${
              editorPanelCollapsed ? '-left-72' : 'left-0'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">🎯 Editor de Mapa</span>
              <button
                onClick={() => setEditorPanelCollapsed(true)}
                className="text-gray-400 hover:text-white text-xs"
                title="Minimizar panel"
              >
                ◀
              </button>
            </div>

          {/* Instrucciones de uso */}
          <div className="text-xs text-gray-400 mb-3 bg-gray-800/50 rounded px-2 py-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-yellow-400">Shift+Click</span>
              <span>= Colocar</span>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-cyan-400">Click</span>
              <span>= Seleccionar</span>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-green-400">Click derecho</span>
              <span>= Editar objeto</span>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-orange-400">Alt+Arrastrar</span>
              <span>= Mover objeto</span>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-pink-400">R</span>
              <span>= Rotar 90°</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-400">P</span>
              <span>= Preview</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={snapToGrid ? 'text-green-400' : 'text-gray-500'}>G</span>
              <span>= Snap {snapToGrid ? 'ON' : 'off'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-700">
              <span className={historyIndex > 0 ? 'text-blue-400' : 'text-gray-600'}>Ctrl+Z</span>
              <span className="text-gray-500">|</span>
              <span className={historyIndex < history.length - 1 ? 'text-blue-400' : 'text-gray-600'}>Ctrl+Y</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-teal-400">Ctrl+Click</span>
              <span>= Multi-selección</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={selectedIds.size > 0 || selectedPlacementId ? 'text-red-400' : 'text-gray-600'}>Del</span>
              <span>= Eliminar ({selectedIds.size + (selectedPlacementId && !selectedIds.has(selectedPlacementId) ? 1 : 0)})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={selectedIds.size > 0 || selectedPlacementId ? 'text-blue-400' : 'text-gray-600'}>Ctrl+D</span>
              <span>= Duplicar</span>
            </div>
          </div>

          {/* Metadata del escenario */}
          <div className="space-y-2 mb-3 pb-3 border-b border-gray-700">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Nombre del escenario..."
              className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-600 focus:border-coral focus:outline-none"
            />
            <input
              type="text"
              value={scenarioCode}
              onChange={(e) => setScenarioCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
              placeholder="codigo_escenario"
              className="w-full bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded border border-gray-600 focus:border-coral focus:outline-none font-mono"
            />
          </div>

          {/* Selector de modo base */}
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Modo de base:</div>
            <div className="flex gap-1">
              <button
                onClick={() => { setBaseMode('city'); setPlacements([]); }}
                className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${
                  baseMode === 'city'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Con la ciudad completa"
              >
                🏙️ Ciudad
              </button>
              <button
                onClick={() => { setBaseMode('generated'); setPlacements([]); }}
                className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${
                  baseMode === 'generated'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Terreno generado con tiles"
              >
                🎲 Generado
              </button>
              <button
                onClick={() => { setBaseMode('empty'); setPlacements([]); }}
                className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${
                  baseMode === 'empty'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Terreno vacío"
              >
                🌿 Vacío
              </button>
            </div>
          </div>

          {/* Selector de color del terreno - solo en modos vacío/generado */}
          {baseMode !== 'city' && (
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Color del terreno:</div>
            <div className="flex gap-1 flex-wrap">
              {GROUND_COLORS.map((gc) => (
                <button
                  key={gc.color}
                  onClick={() => setGroundColor(gc.color)}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    groundColor === gc.color
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: gc.color }}
                  title={gc.name}
                >
                  {gc.icon}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Selector de tamaño del canvas - solo en modos vacío/generado */}
          {baseMode !== 'city' && (
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Tamaño del canvas:</div>
            <div className="flex gap-1 flex-wrap">
              {GROUND_SIZES.map((gs) => (
                <button
                  key={gs.size}
                  onClick={() => setGroundSize(gs.size)}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    groundSize === gs.size
                      ? 'bg-coral text-white ring-2 ring-coral ring-offset-1 ring-offset-gray-900'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  title={`${gs.name} (${gs.size}x${gs.size})`}
                >
                  {gs.icon} {gs.size}
                </button>
              ))}
            </div>
            {/* Input para tamaño personalizado */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Custom:</span>
              <input
                type="number"
                min={50}
                max={2000}
                step={50}
                value={groundSize}
                onChange={(e) => setGroundSize(Math.max(50, Math.min(2000, parseInt(e.target.value) || 100)))}
                className="w-20 bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-coral focus:outline-none"
              />
              <span className="text-xs text-gray-500">unidades</span>
            </div>
          </div>
          )}

          {/* Generador de terreno base - solo en modo generado */}
          {baseMode === 'generated' && (
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Generar terreno aleatorio (centrado):</div>
            <div className="flex gap-1">
              <button
                onClick={() => generateBaseTerrain(3)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 px-2 py-1.5 rounded text-xs"
                title="Grilla 3x3 (9 tiles) = 60x60 unidades"
              >
                3x3
              </button>
              <button
                onClick={() => generateBaseTerrain(5)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 px-2 py-1.5 rounded text-xs"
                title="Grilla 5x5 (25 tiles) = 100x100 unidades"
              >
                5x5
              </button>
              <button
                onClick={() => generateBaseTerrain(7)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 px-2 py-1.5 rounded text-xs"
                title="Grilla 7x7 (49 tiles) = 140x140 unidades"
              >
                7x7
              </button>
              <button
                onClick={() => generateBaseTerrain(9)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 px-2 py-1.5 rounded text-xs"
                title="Grilla 9x9 (81 tiles) = 180x180 unidades"
              >
                9x9
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tile = 20 unidades. Los tiles se centran en el canvas.
            </div>
          </div>
          )}

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
                  const isSelected = selectedPlacementId === p.id

                  return (
                    <div
                      key={p.id}
                      className={`py-2 border-b border-gray-700 last:border-0 cursor-pointer transition-all ${
                        isSelected ? 'bg-cyan-900/50 -mx-2 px-2 rounded' : 'hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedPlacementId(isSelected ? null : p.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col flex-1">
                          <span className={`text-[10px] ${isSelected ? 'text-cyan-300' : 'text-gray-400'}`}>
                            {isSelected && <span className="mr-1">▶</span>}
                            {p.megacity && <span className="text-purple-400 mr-1">◆</span>}
                            {fileName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); duplicatePlacement(p.id) }}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                            title="Duplicar"
                          >
                            📋
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removePlacement(p.id) }}
                            className="text-red-400 hover:text-red-300 text-xs"
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={p.customName || ''}
                        onChange={(e) => updatePlacementName(p.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Nombre personalizado..."
                        className="w-full bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-coral focus:outline-none"
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-gray-500 text-[10px]">🏷️</span>
                        <input
                          type="text"
                          list="tag-suggestions"
                          value={p.customTag || ''}
                          onChange={(e) => updatePlacementTag(p.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Etiqueta..."
                          className="flex-1 bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )
                })}
                <datalist id="tag-suggestions">
                  <option value="edificio" />
                  <option value="decoracion" />
                  <option value="vegetacion" />
                  <option value="vehiculo" />
                  <option value="personaje" />
                  <option value="tile" />
                  <option value="calle" />
                  <option value="mobiliario" />
                </datalist>
              </div>

              {/* Indicador de objeto seleccionado */}
              {selectedPlacement && (
                <div className="bg-cyan-900/30 rounded p-2 mb-3 border border-cyan-700 text-xs">
                  <span className="text-cyan-300">Seleccionado:</span>{' '}
                  <span className="text-white">{selectedPlacement.customName || selectedPlacement.assetKey}</span>
                  <div className="text-gray-400 text-[10px] mt-1">Click derecho sobre el objeto para editar</div>
                </div>
              )}
            </>
          )}

          {/* Botones de archivo */}
          <div className="flex gap-1 mb-2">
                <button
                  onClick={exportJSON}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 px-2 py-1.5 rounded text-xs"
                  title="Copiar JSON al clipboard"
                >
                  📋
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex-1 bg-green-600 hover:bg-green-500 px-2 py-1.5 rounded text-xs"
                  title="Descargar archivo JSON"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 px-2 py-1.5 rounded text-xs"
                  title="Cargar archivo JSON"
                >
                  📂
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </div>

              {/* Botones de localStorage */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={saveToLocal}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 px-2 py-1.5 rounded text-xs"
                >
                  💾 Guardar Local
                </button>
                <button
                  onClick={() => setShowSavedList(!showSavedList)}
                  className={`flex-1 px-2 py-1.5 rounded text-xs ${
                    showSavedList ? 'bg-cyan-700' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  📁 Mis Escenarios ({savedScenarios.length})
                </button>
              </div>

              {/* Lista de escenarios guardados */}
              {showSavedList && savedScenarios.length > 0 && (
                <div className="bg-gray-800 rounded p-2 mb-2 max-h-40 overflow-y-auto">
                  {savedScenarios.map((s) => (
                    <div key={s.code} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
                      <button
                        onClick={() => loadFromLocal(s.code)}
                        className="flex-1 text-left text-xs hover:text-cyan-400 truncate"
                        title={`${s.name} (${s.scene.placements.length} elementos)`}
                      >
                        {s.name || s.code}
                      </button>
                      <button
                        onClick={() => deleteFromLocal(s.code)}
                        className="text-red-400 hover:text-red-300 text-xs ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showSavedList && savedScenarios.length === 0 && (
                <div className="text-gray-500 text-xs text-center py-2 mb-2">
                  No hay escenarios guardados localmente
                </div>
              )}

              {/* Separador */}
              <div className="border-t border-gray-600 my-2" />

              {/* Botones de servidor */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={saveToServer}
                  disabled={isSyncing}
                  className={`flex-1 px-2 py-1.5 rounded text-xs ${
                    isSyncing ? 'bg-gray-600 cursor-wait' : 'bg-orange-600 hover:bg-orange-500'
                  }`}
                >
                  ☁️ {isSyncing ? '...' : 'Guardar Servidor'}
                </button>
                <button
                  onClick={refreshServerList}
                  disabled={isSyncing}
                  className={`px-2 py-1.5 rounded text-xs ${
                    isSyncing ? 'bg-gray-600 cursor-wait' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title="Refrescar lista del servidor"
                >
                  🔄
                </button>
              </div>

              {/* Lista de escenarios del servidor */}
              {serverScenarios.length > 0 && (
                <div className="bg-gray-800 rounded p-2 mb-2">
                  <div className="text-xs text-orange-400 mb-1">☁️ Servidor ({serverScenarios.length}):</div>
                  <div className="max-h-32 overflow-y-auto">
                    {serverScenarios.map((s) => (
                      <div key={s.code} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
                        <button
                          onClick={() => loadFromServer(s.code)}
                          disabled={isSyncing}
                          className="flex-1 text-left text-xs hover:text-orange-400 truncate"
                          title={`${s.name} v${s.version} (${s.scene.placements.length} elementos)`}
                        >
                          {s.name || s.code} <span className="text-gray-500">v{s.version}</span>
                        </button>
                        <button
                          onClick={() => deleteFromServer(s.code)}
                          disabled={isSyncing}
                          className="text-red-400 hover:text-red-300 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

          <button
            onClick={clearAll}
            className="w-full bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-xs"
          >
            🗑️ Limpiar Todo
          </button>

          {placements.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              Sin elementos aún.<br/>Haz click en el mapa.
            </div>
          )}
          </div>
        </>
      )}

      {/* Asset Selector Popup */}
      {pendingPosition && (
        <AssetSelectorPopup
          position={pendingPosition}
          onSelect={handleAssetSelect}
          onCancel={handleCancelSelect}
        />
      )}

      {/* Context Menu - Click derecho en objeto */}
      {contextMenu && selectedPlacement && (
        <div
          className="fixed bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 p-3 z-50 text-white w-56"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 240),
            top: Math.min(contextMenu.y, window.innerHeight - 320),
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
            <span className="text-xs font-bold text-cyan-300 truncate flex-1">
              {selectedPlacement.customName || selectedPlacement.assetKey}
            </span>
            <button
              onClick={closeContextMenu}
              className="text-gray-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>

          {/* Posición con múltiples incrementos */}
          <div className="mb-3">
            <div className="text-[10px] text-gray-400 mb-1">Posición:</div>
            <div className="grid grid-cols-3 gap-1 mb-1">
              {(['x', 'y', 'z'] as const).map((axis, i) => (
                <div key={axis} className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase">{axis}</span>
                  <span className="text-[10px] font-mono">
                    {selectedPlacement.position[i]}
                  </span>
                </div>
              ))}
            </div>
            {/* Controles de incremento */}
            <div className="space-y-1">
              {[0.5, 1, 5].map(delta => (
                <div key={delta} className="flex gap-0.5">
                  <span className="text-[8px] text-gray-500 w-6">±{delta}</span>
                  {(['x', 'y', 'z'] as const).map(axis => (
                    <div key={axis} className="flex gap-px flex-1">
                      <button
                        onClick={() => movePlacement(selectedPlacement.id, axis, -delta)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-0.5 rounded-l text-[9px]"
                      >-</button>
                      <button
                        onClick={() => movePlacement(selectedPlacement.id, axis, delta)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-0.5 rounded-r text-[9px]"
                      >+</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Rotación */}
          <div className="mb-3">
            <div className="text-[10px] text-gray-400 mb-1">Rotación:</div>
            <div className="flex gap-1">
              {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rot, i) => (
                <button
                  key={rot}
                  onClick={() => rotatePlacement(selectedPlacement.id, rot)}
                  className={`flex-1 py-1 rounded text-[10px] ${
                    Math.abs(selectedPlacement.rotation - rot) < 0.1
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {i * 90}°
                </button>
              ))}
            </div>
          </div>

          {/* Escala */}
          <div className="mb-3">
            <div className="text-[10px] text-gray-400 mb-1">
              Escala: {selectedPlacement.scale.toFixed(1)}x
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => scalePlacement(selectedPlacement.id, selectedPlacement.scale - 0.1)}
                className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded text-xs"
              >-</button>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedPlacement.scale}
                onChange={(e) => scalePlacement(selectedPlacement.id, parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => scalePlacement(selectedPlacement.id, selectedPlacement.scale + 0.1)}
                className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded text-xs"
              >+</button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-1 pt-2 border-t border-gray-700">
            <button
              onClick={() => { duplicatePlacement(selectedPlacement.id); closeContextMenu() }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 py-1.5 rounded text-xs"
            >
              📋 Duplicar
            </button>
            <button
              onClick={() => { removePlacement(selectedPlacement.id); closeContextMenu() }}
              className="flex-1 bg-red-600 hover:bg-red-500 py-1.5 rounded text-xs"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
          onContextMenu={(e) => { e.preventDefault(); closeContextMenu() }}
        />
      )}
    </div>
  )
}

// Preload city model
useGLTF.preload('/assets/models/City/CityFull/City_2.glb')

export default GameScene3D
