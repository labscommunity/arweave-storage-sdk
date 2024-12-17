import { apiConfig } from '../config'
import { QueryBuilder } from '../query/queryBuilder'

describe('QueryBuilder', () => {
  let queryInstance: QueryBuilder

  beforeEach(() => {
    const address = 'owtC4zvNF_S2C42-Rb-PC1vuuF6bzcqIUlmQvd-Bo50'
    const apiUrl = apiConfig['default'].url

    queryInstance = new QueryBuilder({ address, apiUrl })
  })

  test('should get all drives using Query method with `GET_ALL_USER_DRIVES`', async () => {
    const drivesQueryResponse = await queryInstance.query('GET_ALL_USER_DRIVES')

    expect(drivesQueryResponse.length).toBeGreaterThanOrEqual(0)
  })

  test('should get single drive using Query method with `GET_USER_DRIVE_BY_ID`', async () => {
    const driveQueryResponse = await queryInstance.query('GET_USER_DRIVE_BY_ID', {
      driveId: 'c6294918-d193-4fae-a065-f419a1d0a550'
    })

    expect(driveQueryResponse.length).toBeGreaterThanOrEqual(1)
  })

  test('should get all entities in a drive using Query method with `GET_USER_DRIVE_BY_ID`', async () => {
    const entitiesQueryResponse = await queryInstance.query('GET_ALL_ENTITIES_IN_DRIVE', {
      driveId: 'c6294918-d193-4fae-a065-f419a1d0a550'
    })

    expect(entitiesQueryResponse.length).toBeGreaterThanOrEqual(1)
  })

  test('should get all snapshots of a drive using Query method with `GET_ALL_SNAPSHOTS_OF_DRIVE`', async () => {
    const snapshotsQueryResponse = await queryInstance.query('GET_ALL_SNAPSHOTS_OF_DRIVE', {
      driveId: 'c6294918-d193-4fae-a065-f419a1d0a550'
    })

    expect(snapshotsQueryResponse.length).toBeGreaterThanOrEqual(0)
  })
})
