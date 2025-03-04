import { throwError } from '../../utils/errors/error-factory'
import { BackendClient } from '../BackendClient'

export class UserClient extends BackendClient {
  constructor() {
    super()
  }

  async getUser() {
    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.get('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 200 || !response?.data?.data) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }
}
