const { PrismaClient } = require('@prisma/client')
const { GraphQLScalarType, Kind } = require('graphql')
const prisma = new PrismaClient()

const { createServer } = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub();


const convertNodeToCursor = (node) => {
    return Buffer.from(node.id).toString('base64')
}

const convertCursorToNodeId = (cursor) => {
    return Buffer.from(cursor, 'base64').toString('ascii')
}


const typeDefs = gql`
    scalar Date

    type Book {
        id: String!
        title: String!
        authorId: String!
        author: Author
        createdAt: Date!
    }

    type Author {
        id: String!
        name: String!
        books: [Book]
    }

    type PageInfo {
        hasPreviousPage: Boolean!
        hasNextPage: Boolean!
        startCursor: String!
        endCursor: String!
    }

    type BookEdge {
        node: Book
        cursor: String!
    }

    type BookConnection {
        totalCount: Int!
        pageInfo: PageInfo!
        edges: [BookEdge]
    }

    type AuthorEdge {
        node: Author
        cursor: String!
    }

    type AuthorConnection {
        totalCount: Int!
        pageInfo: PageInfo!
        edges: [AuthorEdge]
    }
    
    type Query {
        book(id: String!): Book
        books(first: Int!, after: String): BookConnection!
        author(id: String!): Author
        authors(first: Int!, after: String): AuthorConnection!
    }

    type Mutation {
        addAuthor(name: String!): Author
        addBook(title: String!, authorId: String!): Book
    }

    type Subscription {
        newBook: Book
        newAuthor: Author
    }
`

const resolvers = {
    Query: {
        book: async (_, { id }) => {
            const book = await prisma.book.findUnique({
                where: {
                    id
                }
            })
            return book
        },
        books: async (_, { first, after }) => {
            let afterIndex = 0
            let beforeIndex;
            let bookEdges
            let nodeId

            if (typeof after === 'string') {
                nodeId = convertCursorToNodeId(after)
                bookEdges = await prisma.book.findMany({
                    take: first,
                    skip: 1,
                    cursor: {
                        id: nodeId
                    }
                })
            } else {
                bookEdges = await prisma.book.findMany({
                    take: first
                })
            }
  
            const edges = bookEdges.map(node => ({
                node,
                cursor: convertNodeToCursor(node)
            }))

            const totalCount = await prisma.book.count()

            const books = await prisma.book.findMany()
            const nodeIndex = books.findIndex(node => node.id === nodeId)
            if (nodeIndex >= 0) {
                afterIndex = nodeIndex + 1
                beforeIndex = afterIndex - 1
            }
            
            let hasNextPage = totalCount > afterIndex + first
            let hasPreviousPage = beforeIndex < afterIndex

            let startCursor, endCursor = null
            if (edges.length > 0) {
                startCursor = convertNodeToCursor(edges[0].node)
                endCursor = convertNodeToCursor(edges[edges.length - 1].node)
            }

            return { 
                totalCount, 
                edges,
                pageInfo: {
                    hasPreviousPage,
                    hasNextPage,
                    startCursor,
                    endCursor
                }
            }
        },
        author: async (_, { id }) => {
            const author = await prisma.author.findUnique({
                where: {
                    id
                }
            })
            return author
        },
        authors: async (_, { first, after }) => {
            let afterIndex = 0
            let beforeIndex
            let authorEdges
            let nodeId

            if (typeof after === 'string') {
                nodeId = convertCursorToNodeId(after)
                authorEdges = await prisma.author.findMany({
                    take: first,
                    skip: 1,
                    cursor: {
                        id: nodeId
                    }
                })
            } else {
                authorEdges = await prisma.author.findMany({
                    take: first
                })
            }

            const edges = authorEdges.map(node => ({
                node, 
                cursor: convertNodeToCursor(node)
            }))

            const totalCount = await prisma.author.count()

            const authors = await prisma.author.findMany()
            const nodeIndex = authors.findIndex(node => node.id === nodeId)
            if (nodeIndex >= 0) {
                afterIndex = nodeIndex + 1
                beforeIndex = afterIndex - 1
            }

            let hasNextPage = totalCount > afterIndex + first
            let hasPreviousPage = beforeIndex < afterIndex

            let startCursor, endCursor = null
            if (edges.length > 0) {
                startCursor = convertNodeToCursor(edges[0].node)
                endCursor = convertNodeToCursor(edges[edges.length - 1].node)
            }

            return {
                totalCount,
                edges,
                pageInfo: {
                    hasPreviousPage,
                    hasNextPage,
                    startCursor,
                    endCursor
                }
            }
        }
    },
    Author: {
        books: async ({ id }) => {
            const result = await prisma.book.findMany({
                where: {
                    authorId: {
                        equals: id
                    }
                }
            });
            return result
        }
    },
    Book: {
        author: async ({ authorId }) => {
            const result = await prisma.author.findFirst({
                where: {
                    id: {
                        equals: authorId
                    }
                }
            });
            return result
        }
    },
    Mutation: {
        addBook: async (_, { title, authorId }) => {
            try {
                const book = await prisma.book.create({
                    data: {
                        title,
                        authorId
                    }
                });
                pubsub.publish('NEW_BOOK', { 
                    newBook: book 
                })
                return book
            } catch(err) {
                console.log(err.message)
            }
            
        }, 
        addAuthor: async (_, { name }) => {
            try {
                const author = await prisma.author.create({
                    data: {
                        name
                    }
                });
                pubsub.publish('NEW_AUTHOR', { newAuthor: author })
                return author
            } catch(err) {
                console.log(err.message)
            }
        }
    },
    Subscription: {
        newBook: {
            subscribe: () => {
                return pubsub.asyncIterator('NEW_BOOK')
            }
        },
        newAuthor: {
            subscribe: () => {
                return pubsub.asyncIterator('NEW_AUTHOR')
            }
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        serialize(value) {
            return value.getTime(); 
        },
        parseValue(value) {
            return new Date(value); 
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(parseInt(ast.value, 10)); 
            }
            return null; 
        }
    })
};


(async function() {
    const app = express();

    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });

    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: '/graphql'}
    );

    const server = new ApolloServer({
        schema, 
        plugins: [{
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }]
    });
    await server.start();
    server.applyMiddleware({ app });

    const PORT = 4000;
    httpServer.listen(PORT, () => 
        console.log(`server is now running on http://localhost:${PORT}/graphql`)
    )
})();

