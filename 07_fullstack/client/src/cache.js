import { InMemoryCache } from "@apollo/client"

export const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: false,
            merge(existing = [], incoming) {
              let edges = [];

              if (existing?.edges) {
                edges = [...edges, ...existing.edges]
              }

              if (incoming?.edges) {
                edges = [...edges, ...incoming.edges]
              }

              return {
                ...incoming,
                edges
              }
            }
          }

        }
      },
      Post: {
        fields: {
          comments: {
            keyArgs: false,
            merge(existing = [], incoming) {
              let edges = []

              if (existing?.edges) {
                edges = [...edges, ...existing.edges]
              }

              if (incoming?.edges) {
                edges = [...edges, ...incoming.edges]
              }

              return {
                ...incoming,
                edges
              }
            }
          }
        }
      }


    }
  });

