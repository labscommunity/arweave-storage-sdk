export const GET_ALL_USER_DRIVES = `
query($cursor: String $address: String! $appName: String!) {
    transactions(        
      after: $cursor
      first: 100
      owners: [$address]
      tags: [
        { name: "App-Name", values: [$appName]}
        { name: "Entity-Type", values: "drive" }
        { name: "Drive-Privacy", values: ["public", "private"] }
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
