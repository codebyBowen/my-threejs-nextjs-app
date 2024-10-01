'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const modelLinks = ["/moon_cake/scene.gltf", "/lunagaron_monster_hunter/scene.gltf"]

const getModelName = (link: string) => {
  const parts = link.split('/')
  return parts[parts.length - 2] // 返回倒数第二个部分作为模型名
}

const ThreeJsScene = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const [rotationSpeed, setRotationSpeed] = useState(0.01)
  const [selectedModel, setSelectedModel] = useState(modelLinks[0])
  const [cameraDistance, setCameraDistance] = useState(10)
  const initialCameraPositionRef = useRef<THREE.Vector3 | null>(null)
  const [initialCameraDistance, setInitialCameraDistance] = useState(10)
  const userAdjustedCameraRef = useRef(false)

  useEffect(() => {
    if (!mountRef.current) return

    // 创建场景
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.set(0, 5, 10)
    cameraRef.current = camera

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setClearColor(0x000000, 1)
    rendererRef.current = renderer

    // 设置渲染器大小
    const updateRendererSize = () => {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        // 这里修改了宽度，使用父容器的宽度
        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight
        rendererRef.current.setSize(width, height)
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
      }
    }

    updateRendererSize()
    mountRef.current.appendChild(renderer.domElement)

    // 增强环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    scene.add(ambientLight)

    // 增强平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    scene.add(directionalLight)

    // 添加点光源
    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(0, 10, 0)
    scene.add(pointLight)

    // 添加聚光灯
    const spotLight = new THREE.SpotLight(0xffffff, 1)
    spotLight.position.set(-10, 10, 0)
    spotLight.angle = Math.PI / 4
    spotLight.penumbra = 0.1
    spotLight.decay = 2
    spotLight.distance = 200
    scene.add(spotLight)

    // 加载GLTF模型
    const loadModel = () => {
      const loader = new GLTFLoader()
      loader.load(
        selectedModel,
        (gltf) => {
          console.log('Model loaded successfully:', selectedModel)
          if (modelRef.current) {
            scene.remove(modelRef.current)
          }
          const model = gltf.scene
          model.scale.set(0.1, 0.1, 0.1)
          model.position.set(0, 0, 0)
          scene.add(model)
          modelRef.current = model

          // 自动调整相机位置以适应模型
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const fov = camera.fov * (Math.PI / 180)
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
          cameraZ *= 1.5
          camera.position.set(center.x, center.y, center.z + cameraZ)
          camera.lookAt(center)
          camera.updateProjectionMatrix()

          // 保存初始相机位置
          initialCameraPositionRef.current = camera.position.clone()
          setInitialCameraDistance(cameraZ)
          
          // 只有在用户没有手动调整过相机距离时，才更新 cameraDistance
          if (!userAdjustedCameraRef.current) {
            setCameraDistance(cameraZ)
          }
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100
            console.log(`${selectedModel}: ${percentComplete.toFixed(2)}% loaded`)
          } else {
            console.log(`${selectedModel}: Loading progress not computable`)
          }
        },
        (error) => {
          console.error('Error loading model:', selectedModel, error)
        }
      )
    }

    loadModel()

    // 动画函数
    const animate = () => {
      requestAnimationFrame(animate)
      
      if (modelRef.current) {
        modelRef.current.rotation.y += rotationSpeed
      }

      // 更新相机位置
      if (cameraRef.current && initialCameraPositionRef.current) {
        const direction = cameraRef.current.position.clone().sub(new THREE.Vector3(0, 0, 0)).normalize()
        cameraRef.current.position.copy(direction.multiplyScalar(cameraDistance))
        cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0))
      }

      renderer.render(scene, camera)
    }
    animate()

    // 处理窗口大小变化
    const handleResize = () => {
      updateRendererSize()
    }
    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeChild(renderer.domElement)
      if (modelRef.current) {
        scene.remove(modelRef.current)
      }
    }
  }, [rotationSpeed, selectedModel, cameraDistance])

  const handleCameraDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= 20) {
      setCameraDistance(Number(value.toFixed(1)))
      userAdjustedCameraRef.current = true
    }
  }

  console.log('cameraDistance', cameraDistance)
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '5px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="modelSelect">Select Model: </label>
            <select 
              id="modelSelect" 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ 
                marginLeft: '10px',
                color: 'black',
                backgroundColor: 'white'
              }}
            >
              {modelLinks.map((link, index) => (
                <option key={index} value={link}>
                  {getModelName(link)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="speed">Rotation Speed: </label>
            <input
              id="speed"
              type="number"
              min="0"
              max="0.1"
              step="0.001"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              style={{ 
                width: '60px', 
                marginLeft: '10px',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label htmlFor="zoom">Camera Zoom: </label>
            <input
              id="zoom"
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={cameraDistance}
              onChange={handleCameraDistanceChange}
              style={{ 
                width: '60px', 
                marginLeft: '10px',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeJsScene