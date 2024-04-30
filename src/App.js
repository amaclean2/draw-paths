import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax

import './App.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'

const TOKEN =
  'pk.eyJ1IjoiYW1hY2xlYW4iLCJhIjoiY2wydzM2YjB2MGh4dzNqb2FpeTg2bmo4dSJ9.KSDbOciqbYDn5eA4SHNOZg'

const STYLE = 'mapbox://styles/mapbox/outdoors-v12'

mapboxgl.accessToken = TOKEN

const App = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: STYLE,
      center: [-120.27, 39.32],
      zoom: 15,
      pitch: 60,
      bearing: 180
    })

    map.current.on('style.load', () => {
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      })

      map.current.setTerrain({ source: 'mapbox-dem' })
    })

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      defaultMode: 'draw_line_string'
    })

    map.current.addControl(draw)
  }, [])

  return (
    <div className='App'>
      <div ref={mapContainer} className={'map-container'} />
    </div>
  )
}

export default App
