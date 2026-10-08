import { Cesium, inflate } from '../../../libs'
import { getParam } from '../../../global-api'
import { resampleTerrain } from './decodeTerrain'

const WORKER_COUNT = 2
const IDLE_TIMEOUT = 30000
const STARTUP_TIMEOUT = 5000
const TASK_TIMEOUT = 30000

export function isTerrainRequestCancelled(request) {
  return request?.cancelled || request?.state === Cesium.RequestState.CANCELLED
}

class TdtTerrainDecoder {
  constructor(options) {
    this._enabled = options.worker !== false
    this._url = options.workerUrl
    this._workers = []
    this._queue = []
    this._idleTimer = undefined
    this._fallbackTimer = undefined
  }

  decode(buffer, dataType, request) {
    if (isTerrainRequestCancelled(request)) return Promise.resolve(undefined)
    clearTimeout(this._idleTimer)
    return new Promise((resolve, reject) => {
      this._queue.push({ buffer, dataType, request, resolve, reject })
      this._pump()
    })
  }

  _createWorker() {
    const baseUrl = getParam('baseUrl') || './libs/dc-sdk/resources/'
    const url = new URL(
      this._url ||
        `${baseUrl.replace(/\/?$/, '/')}Workers/DC/decodeTdtTerrain.js`,
      document.baseURI
    )
    const state = { worker: undefined, ready: false, job: undefined }
    // Module imports support CDN resources; release the shim URL with the worker.
    if (url.origin !== location.origin) {
      state.blobUrl = URL.createObjectURL(
        new Blob([`import ${JSON.stringify(url.href)}`], {
          type: 'application/javascript',
        })
      )
    }
    this._workers.push(state)
    const worker = new Worker(state.blobUrl || url.href, { type: 'module' })
    state.worker = worker
    state.timer = setTimeout(
      () => this._fail(new Error('TDT terrain Worker startup timed out.')),
      STARTUP_TIMEOUT
    )
    worker.onerror = (event) => {
      event.preventDefault()
      this._fail(new Error(event.message || 'TDT terrain Worker failed.'))
    }
    worker.onmessageerror = () =>
      this._fail(new Error('Invalid TDT terrain Worker message.'))
    worker.onmessage = ({ data }) => {
      const ready = data?.ready === true && !state.ready && !state.job
      const result =
        state.job &&
        (typeof data?.error === 'string' ||
          (data?.samples instanceof Float32Array &&
            data.samples.length === 64 * 64))
      if (!ready && !result) {
        this._fail(new Error('Invalid TDT terrain Worker response.'))
        return
      }
      clearTimeout(state.timer)
      if (ready) {
        state.ready = true
      } else {
        const job = state.job
        state.job = undefined
        if (isTerrainRequestCancelled(job.request)) job.resolve(undefined)
        else if (typeof data.error === 'string')
          job.reject(new Cesium.RuntimeError(data.error))
        else job.resolve(data.samples)
      }
      this._pump()
    }
  }

  _nextJob() {
    while (this._queue.length) {
      const job = this._queue.shift()
      if (!isTerrainRequestCancelled(job.request)) return job
      job.resolve(undefined)
    }
  }

  _pump() {
    if (!this._enabled || typeof Worker === 'undefined') {
      if (!this._queue.length || this._fallbackTimer !== undefined) return
      // Yield between fallback tiles instead of decoding a whole response burst.
      this._fallbackTimer = setTimeout(() => {
        this._fallbackTimer = undefined
        const job = this._nextJob()
        if (job) {
          try {
            job.resolve(
              resampleTerrain(inflate(new Uint8Array(job.buffer)), job.dataType)
            )
          } catch (error) {
            job.reject(new Cesium.RuntimeError(error.message || String(error)))
          }
        }
        this._pump()
      }, 0)
      return
    }
    try {
      let count = this._queue.length
      for (const state of this._workers) {
        if (state.job) count++
      }
      while (this._workers.length < Math.min(WORKER_COUNT, count)) {
        this._createWorker()
      }
      for (const state of this._workers) {
        if (!state.ready || state.job) continue
        const job = this._nextJob()
        if (!job) break
        state.job = job
        // fetchArrayBuffer owns this buffer. Transfer it rather than copying it.
        const buffer = job.buffer
        state.worker.postMessage({ buffer, dataType: job.dataType }, [buffer])
        job.buffer = undefined
        state.timer = setTimeout(
          () => this._fail(new Error('TDT terrain Worker task timed out.')),
          TASK_TIMEOUT
        )
      }
    } catch (error) {
      this._fail(error)
      return
    }
    if (!this._queue.length && this._workers.every((state) => !state.job)) {
      clearTimeout(this._idleTimer)
      this._idleTimer = setTimeout(() => this._stopWorkers(), IDLE_TIMEOUT)
    }
  }

  _fail(error) {
    this._enabled = false
    // A transferred buffer cannot be decoded again after a Worker crash.
    for (const state of this._workers) {
      const job = state.job
      if (!job) continue
      if (isTerrainRequestCancelled(job.request)) job.resolve(undefined)
      else job.reject(new Cesium.RuntimeError(error.message || String(error)))
    }
    this._stopWorkers()
    this._pump()
  }

  _stopWorkers() {
    clearTimeout(this._idleTimer)
    for (const state of this._workers) {
      clearTimeout(state.timer)
      if (state.worker) {
        state.worker.onmessage = null
        state.worker.onerror = null
        state.worker.onmessageerror = null
        state.worker.terminate()
      }
      if (state.blobUrl) URL.revokeObjectURL(state.blobUrl)
    }
    this._workers.length = 0
  }
}

export default TdtTerrainDecoder
