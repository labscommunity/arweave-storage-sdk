export const GET_USER_DRIVE_BY_ID = `
query($cursor: String $driveId: String!) {
    transactions( 
      after: $cursor       
      first: 1
      tags: [
        { name: "Entity-Type", values: "drive" }
        { name: "Drive-Id", values: [$driveId] }
      ]
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
            id
            owner {
              address
            }
            bundledIn {
              id
            }
            block {
              height
              timestamp
            }
            tags {
              name
              value
            }
        }
      }
    }
  }
`
