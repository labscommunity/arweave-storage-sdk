import { arGql } from 'ar-gql'

import { TypeIndex, typeIndex } from './types'

export type QueryBuilderOptions = {
  apiUrl: string
  address: string
  appName?: string | null
}

export class QueryBuilder {
  public apiUrl: string
  public address: string
  public argql = arGql()
  public appName: string | null = null

  constructor({ apiUrl, address, appName }: QueryBuilderOptions) {
    this.apiUrl = apiUrl
    this.address = address

    if (appName) this.appName = appName
  }

  async query(type: TypeIndex, options: QueryOptions = {}) {
    const queryString = typeIndex[type]

    if (!options.address && type === 'GET_ALL_USER_DRIVES') {
      options.address = this.address
    }

    if (!options.appName) {
      options.appName = this.appName || ''
    }

    return this.argql.all(queryString, options)
  }
}

export type QueryOptions = Record<string, unknown>
