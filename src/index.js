/**
 @Author: Caven Chen
 **/
import { setParam } from './global-api'

const DEF_BASE_URL = './libs/dc-sdk/resources/'

let _baseUrl = DEF_BASE_URL

setParam('baseUrl', DEF_BASE_URL)

export const config = {
  set baseUrl(baseUrl) {
    _baseUrl = baseUrl
    setParam('baseUrl', baseUrl)
  },
  get baseUrl() {
    return _baseUrl
  },
}

export * from './modules'

export { Math } from './modules/math'

export * from './modules/third-part'

export { registerLib, getLib } from './global-api'
