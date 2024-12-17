export const GET_FILE_BY_ID = `
query($cursor: String $driveId: String! $fileId: String!) {
    transactions( 
      after: $cursor       
      first: 1
      tags: [
        { name: "Entity-Type", values: ["file"] }
        { name: "Drive-Id", values: [$driveId] }
        { name: "File-Id", values: [$fileId] }
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
