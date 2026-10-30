'use client'

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { HUB_POINT, CITY_LIGHTS, REGION_COLORS } from '@/lib/routeMap'

const GLOBE_RADIUS = 2.4

/* Convert lat/lon (degrees) to 3D Cartesian coordinates on sphere */
function latLonToVec3(lat, lon, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

/* ─── 3D Great-Circle Flight Spline with Flying Jet ─── */
function FlightRoute3D({
  destination,
  hubPos,
  color,
  isDimmed,
  isHovered,
  onHover,
  onLeave,
  onClick,
}) {
  const destPos = useMemo(() => {
    return latLonToVec3(destination.lat, destination.lon, GLOBE_RADIUS)
  }, [destination.lat, destination.lon])

  const { curve, points } = useMemo(() => {
    const distance = hubPos.distanceTo(destPos)
    // Arc altitude scales with distance
    const altitude = GLOBE_RADIUS + Math.min(distance * 0.28, 0.95)
    const midPoint = hubPos.clone().add(destPos).multiplyScalar(0.5).normalize().multiplyScalar(altitude)

    // Create a 3D Quadratic Bezier Curve
    const c = new THREE.QuadraticBezierCurve3(hubPos, midPoint, destPos)
    const pts = c.getPoints(50)
    return { curve: c, points: pts }
  }, [hubPos, destPos])

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  // Flying jet marker along the 3D trajectory
  const jetRef = useRef()
  const progressRef = useRef(Math.random())
  const speed = 0.0035 + (destination.lat % 3) * 0.001

  useFrame((_, delta) => {
    if (!jetRef.current) return
    progressRef.current = (progressRef.current + speed * (delta * 60)) % 1
    const p = curve.getPointAt(progressRef.current)
    const tangent = curve.getTangentAt(progressRef.current).normalize()
    const up = p.clone().normalize()

    jetRef.current.position.copy(p)

    // Calculate rotation matrix for true aerodynamic banking along the curve
    const matrix = new THREE.Matrix4()
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize()
    const correctedUp = new THREE.Vector3().crossVectors(right, tangent).normalize()
    matrix.makeBasis(right, correctedUp, tangent.negate())
    jetRef.current.rotation.setFromRotationMatrix(matrix)
  })

  const opacity = isDimmed ? 0.08 : (isHovered ? 0.95 : 0.45)
  const lineWidth = isHovered ? 2.5 : 1.2

  return (
    <group>
      {/* 3D Flight Arc */}
      <line geometry={lineGeo}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          linewidth={lineWidth}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* 3D Aircraft Marker */}
      {!isDimmed && (
        <group ref={jetRef}>
          {/* Jet Body */}
          <mesh>
            <coneGeometry args={[0.022, 0.065, 5]} />
            <meshBasicMaterial color={isHovered ? '#ffffff' : color} />
          </mesh>
          {/* Wings */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.085, 0.004, 0.02]} />
            <meshBasicMaterial color={color} />
          </mesh>
          {/* Port/Starboard Strobe Light */}
          <pointLight color={color} intensity={isHovered ? 0.8 : 0.3} distance={0.4} />
        </group>
      )}

      {/* Destination Airport Beacon */}
      <group position={destPos}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover(destination)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            onLeave()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onClick(destination)
          }}
        >
          <sphereGeometry args={[isHovered ? 0.045 : 0.028, 16, 16]} />
          <meshBasicMaterial
            color={isHovered ? '#ffffff' : color}
            transparent
            opacity={isDimmed ? 0.15 : 0.95}
          />
        </mesh>

        {/* Airport HTML Label (always faces camera) */}
        {!isDimmed && (
          <Html
            position={[0, 0.05, 0]}
            center
            distanceFactor={8}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              style={{
                background: isHovered ? 'rgba(219, 36, 30, 0.95)' : 'rgba(4, 9, 20, 0.82)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isHovered ? '#fff' : color}`,
                color: '#fff',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 900,
                fontFamily: 'var(--font-h)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                boxShadow: isHovered ? `0 0 12px ${color}` : '0 4px 10px rgba(0,0,0,0.5)',
                transform: 'translate3d(0, -100%, 0)',
              }}
            >
              {destination.iata}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

/* ─── The 3D Earth Globe Sphere ─── */
function EarthGlobe({
  destinations,
  activeFilter,
  hoveredDest,
  onHover,
  onLeave,
  onClick,
}) {
  const globeGroupRef = useRef()
  const hubPos = useMemo(() => latLonToVec3(HUB_POINT.lat, HUB_POINT.lon, GLOBE_RADIUS), [])

  // City Lights / Land Points
  const cityLightPoints = useMemo(() => {
    const coords = []
    CITY_LIGHTS.forEach(([lat, lon]) => {
      const v = latLonToVec3(lat, lon, GLOBE_RADIUS + 0.002)
      coords.push(v.x, v.y, v.z)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3))
    return geo
  }, [])

  // Slow orbital rotation when idle
  useFrame((_, delta) => {
    if (globeGroupRef.current && !hoveredDest) {
      globeGroupRef.current.rotation.y += delta * 0.04
    }
  })

  return (
    <group ref={globeGroupRef}>
      {/* ── Oceanic Core Sphere ── */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#040914"
          roughness={0.7}
          metalness={0.1}
          emissive="#02050b"
        />
      </mesh>

      {/* ── Tactical Latitude & Longitude Graticule Wireframe ── */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.001, 36, 18]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* ── Atmospheric Glow Rim Halo ── */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.04, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Constellation of Global City Lights / Continent Dots ── */}
      <points geometry={cityLightPoints}>
        <pointsMaterial
          size={0.024}
          color="#38bdf8"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── Delhi Academy Hub (Dwarka HQ) ── */}
      <group position={hubPos}>
        {/* Core Beacon */}
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Pulsing Outer Hub Halo */}
        <mesh>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial
            color="#DB241E"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight color="#DB241E" intensity={1.5} distance={1.2} />

        {/* Delhi Label */}
        <Html position={[0, 0.08, 0]} center distanceFactor={7}>
          <div
            style={{
              background: 'rgba(219, 36, 30, 0.9)',
              color: '#fff',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 900,
              fontFamily: 'var(--font-h)',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 14px rgba(219,36,30,0.8)',
              pointerEvents: 'none',
            }}
          >
            DEL • DWARKA HQ
          </div>
        </Html>
      </group>

      {/* ── 3D Arcs to All 18 Destinations ── */}
      {destinations.map((d) => {
        const matchesFilter = activeFilter === 'ALL' || d.category === activeFilter
        const isHovered = hoveredDest?.iata === d.iata
        const color = REGION_COLORS[d.region] || '#facc15'

        return (
          <FlightRoute3D
            key={d.iata}
            destination={d}
            hubPos={hubPos}
            color={color}
            isDimmed={!matchesFilter}
            isHovered={isHovered}
            onHover={onHover}
            onLeave={onLeave}
            onClick={onClick}
          />
        )
      })}
    </group>
  )
}

/* ─── Main Exported 3D Scene Container ─── */
export default function GlobalRouteGlobe3D({
  destinations,
  activeFilter,
  hoveredDest,
  onHover,
  onLeave,
  onClick,
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #081020 0%, #02050c 100%)',
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[6, 4, 8]} intensity={1.2} />
        <pointLight position={[-8, -4, -6]} intensity={0.5} color="#00f0ff" />

        <EarthGlobe
          destinations={destinations}
          activeFilter={activeFilter}
          hoveredDest={hoveredDest}
          onHover={onHover}
          onLeave={onLeave}
          onClick={onClick}
        />

        <OrbitControls
          enableZoom={true}
          minDistance={3.2}
          maxDistance={7.5}
          enablePan={false}
          rotateSpeed={0.5}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Tactical Overlay Legend inside 3D Canvas */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          pointerEvents: 'none',
          background: 'rgba(5, 11, 24, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
        <span style={{ fontFamily: 'var(--font-h)', fontSize: '0.65rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
          3D ORBITAL GLOBE · DRAG TO ROTATE · SCROLL TO ZOOM
        </span>
      </div>
    </div>
  )
}
