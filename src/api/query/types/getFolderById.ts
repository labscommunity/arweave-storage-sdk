export const GET_FOLDER_BY_ID = `
query($cursor: String $driveId: String! $folderId: String!) {
    transactions( 
      after: $cursor       
      first: 1
      tags: [
        { name: "Entity-Type", values: ["folder"] }
        { name: "Drive-Id", values: [$driveId] }
        { name: "Folder-Id", values: [$folderId] }
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
