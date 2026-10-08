// This standalone entry bundles its own dependencies, without the scene libs.
import { inflate } from 'pako'
import { resampleTerrain } from '../modules/terrain/tdt/decodeTerrain'

self.onmessage = ({ data }) => {
  try {
    const samples = resampleTerrain(
      inflate(new Uint8Array(data.buffer)),
      data.dataType
    )
    self.postMessage({ samples }, [samples.buffer])
  } catch (error) {
    self.postMessage({ error: error.message || String(error) })
  }
}

// Do not transfer compressed data until the entry point has loaded successfully.
self.postMessage({ ready: true })
