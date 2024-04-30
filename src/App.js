import React, { useRef, useState } from 'react'
import Map, { Layer, Source } from 'react-map-gl'

import './App.css'

const TOKEN =
  'pk.eyJ1IjoiYW1hY2xlYW4iLCJhIjoiY2wydzM2YjB2MGh4dzNqb2FpeTg2bmo4dSJ9.KSDbOciqbYDn5eA4SHNOZg'

const App = () => {
  const [recordedPoints, setRecordedPoints] = useState([])
  const [cursor, setCursor] = useState(null)
  const [activePathEdit, setActivePathEdit] = useState(true)
  const [previousId, setPreviousId] = useState(-1)
  const [pointHold, setPointHold] = useState(false)

  const mapRef = useRef(null)
  const hoveredId = useRef(null)

  const tokenIdGenerator = () => {
    const id = previousId + 1
    setPreviousId(id)
    return id
  }

  return (
    <div className='App'>
      <Map
        initialViewState={{
          latitude: 39.32,
          longitude: -120.27,
          bearing: 180,
          pitch: 60,
          zoom: 15
        }}
        ref={mapRef}
        maxPitch={85}
        mapStyle='mapbox://styles/mapbox/satellite-v9'
        mapboxAccessToken={TOKEN}
        terrain={{ source: 'mapbox-dem' }}
        interactiveLayerIds={['adventure-path']}
        onClick={(e) => {
          if (activePathEdit) {
            setRecordedPoints([
              ...recordedPoints,
              {
                type: 'Feature',
                id: tokenIdGenerator(),
                geometry: {
                  type: 'Point',
                  coordinates: [e.lngLat.lng, e.lngLat.lat]
                }
              }
            ])
          }
        }}
        onDblClick={(e) => {
          e.preventDefault()
          setActivePathEdit(false)
        }}
        onMouseDown={() => {
          if (!activePathEdit) {
            const map = mapRef.current.getMap()
            map.dragPan.disable()
            setPointHold(true)
          }
        }}
        onMouseUp={() => {
          if (!activePathEdit) {
            setPointHold(false)
          }
        }}
        onMouseMove={(e) => {
          setCursor([e.lngLat.lng, e.lngLat.lat])
          if (!activePathEdit) {
            if (e.features.length) {
              hoveredId.current = e.features[0].id
              mapRef.current.setFeatureState(
                { source: 'path-points', id: hoveredId.current },
                { hover: true }
              )
            }

            if (pointHold) {
              const feature = e.features[0]
              if (!feature) {
                return
              }

              setRecordedPoints((points) =>
                points.map((point) => {
                  if (point.id === feature.id) {
                    return {
                      ...point,
                      geometry: {
                        type: 'Point',
                        coordinates: [e.lngLat.lng, e.lngLat.lat]
                      }
                    }
                  }

                  return point
                })
              )
            }
          }
        }}
        onMouseLeave={() => {
          if (hoveredId.current !== null) {
            mapRef.current.setFeatureState(
              { source: 'path-points', id: hoveredId.current },
              { hover: false }
            )
            hoveredId.current = null
          }
        }}
      >
        <Source
          id='mapbox-dem'
          type='raster-dem'
          url='mapbox://mapbox.mapbox-terrain-dem-v1'
          tileSize={512}
          maxzoom={14}
        />
        <Layer
          id='sky'
          type='sky'
          paint={{
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }}
        />
        <Source
          type='geojson'
          data={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: cursor ?? [0, 0]
            }
          }}
        >
          <Layer
            id={'cursor-marker'}
            type={'circle'}
            paint={{ 'circle-color': '#F99', 'circle-radius': 5 }}
          />
        </Source>
        <Source
          id={'path-points'}
          type={'geojson'}
          data={{
            type: 'FeatureCollection',
            features: recordedPoints
          }}
        >
          <Layer
            id={'adventure-path'}
            type={'circle'}
            source={'current-adventure'}
            paint={{
              'circle-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#F00',
                '#00F'
              ],
              'circle-radius': 10,
              'circle-opacity': 0.7
            }}
          />
        </Source>
      </Map>
    </div>
  )
}

export default App
