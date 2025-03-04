import Agent, { HttpsAgent } from 'agentkeepalive'
import axios from 'axios'
import { STORAGE_SERVICE_API_URL } from '../utils/constants'

const config = {
  maxSockets: 160,
  maxFreeSockets: 160,
  timeout: 60000,
  freeSocketTimeout: 30000,
  keepAliveMsecs: 60000
}

const keepAliveAgent = new Agent(config)
const httpsKeepAliveAgent = new HttpsAgent(config)

export const httpClient = axios.create({
  httpAgent: keepAliveAgent,
  httpsAgent: httpsKeepAliveAgent,
  baseURL: STORAGE_SERVICE_API_URL
})

export const httpClientWithAuth = (token: string) => {
  return axios.create({
    httpAgent: keepAliveAgent,
    httpsAgent: httpsKeepAliveAgent,
    headers: { Authorization: `Bearer ${token}` },
    baseURL: STORAGE_SERVICE_API_URL
  })
}
