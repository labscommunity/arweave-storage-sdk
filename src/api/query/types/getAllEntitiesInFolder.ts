export const GET_ALL_ENTITIES_IN_FOLDER = `
query($cursor: String $driveId: String! $folderId: String!) {
    transactions(        
      after: $cursor
      first: 100
      tags: [
        { name: "Drive-Id", values: [$driveId] }
        { name: "Parent-Folder-Id", values: [$folderId] }
        { name: "Entity-Type", values: ["folder", "file"] }
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
