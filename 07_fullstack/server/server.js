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

    type Comment {
        id: String!
        body: String!
        postId: String!
        createdAt: Date!
        post: Post
    }

    type Post {
        id: String!
        body: String!
        comments(first: Int!, after: String): CommentConnection!
    }

    type PageInfo {
        hasPreviousPage: Boolean!
        hasNextPage: Boolean!
        startCursor: String!
        endCursor: String!
    }

    type CommentEdge {
        node: Comment
        cursor: String!
    }

    type CommentConnection {
        totalCount: Int!
        pageInfo: PageInfo!
        edges: [CommentEdge]
    }

    type PostEdge {
        node: Post
        cursor: String!
    }

    type PostConnection {
        totalCount: Int!
        pageInfo: PageInfo!
        edges: [PostEdge]
    }
    
    type Query {
        post(id: String!): Post
        posts(first: Int!, after: String): PostConnection!
    }

    type Mutation {
        addPost(body: String!): Post
        addComment(body: String!, postId: String!): Comment
    }

    type Subscription {
        onCommentAdded: Comment
        onPostAdded: Post
    }
`

const resolvers = {
    Query: {
        post: async (_, { id }) => {
            const post = await prisma.post.findUnique({
                where: {
                    id
                }
            });
            return post;
        },
        posts: async (_, { first, after }) => {
            let afterIndex = 0
            let beforeIndex
            let postEdges
            let nodeId

            if (typeof after === 'string') {
                nodeId = convertCursorToNodeId(after)
                postEdges = await prisma.post.findMany({
                    take: first,
                    skip: 1,
                    cursor: {
                        id: nodeId
                    }
                })
            } else {
                postEdges = await prisma.post.findMany({
                    take: first
                })
            }

            const edges = postEdges.map(node => ({
                node, 
                cursor: convertNodeToCursor(node)
            }))

            const totalCount = await prisma.post.count()

            const posts = await prisma.post.findMany()
            const nodeIndex = posts.findIndex(node => node.id === nodeId)
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
    Post: {
        comments: async ({ id }, { first, after }) => {
            let afterIndex = 0; 
            let beforeIndex;
            let commentEdges;
            let nodeId;

            if (typeof after === 'string') {
                nodeId = convertCursorToNodeId(after)
                commentEdges = await prisma.comment.findMany({
                    take: first,
                    skip: 1,
                    cursor: {
                        id: nodeId
                    },
                    where: {
                        postId: {
                            equals: id
                        }
                    }
                })
            } else {
                commentEdges = await prisma.comment.findMany({
                    take: first,
                    where: {
                        postId: {
                            equals: id
                        }
                    }
                })
            };

            const edges = commentEdges.map(node => ({
                node, 
                cursor: convertNodeToCursor(node)
            }));

            const totalCount = await prisma.comment.count({
                where: {
                    postId: {
                        equals: id
                    }
                }
            });

            const comments = await prisma.comment.findMany({
                where: {
                    postId: {
                        equals: id
                    }
                }
            });
            const nodeIndex = comments.findIndex(node => node.id === nodeId)
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
    Mutation: {
        addComment: async (_, { body, postId }) => {
            try {
                const comment = await prisma.comment.create({
                    data: {
                        body,
                        postId
                    }
                });
                pubsub.publish('NEW_COMMENT', { 
                    onCommentAdded: comment 
                })
                return comment;
            } catch(err) {
                console.log(err.message)
            }
            
        }, 
        addPost: async (_, { body }) => {
            try {
                const post = await prisma.post.create({
                    data: {
                        body
                    }
                });
                pubsub.publish('NEW_POST', { 
                    onPostAdded: post 
                });
                return post
            } catch(err) {
                console.log(err.message)
            }
        }
    },
    Subscription: {
        onCommentAdded: {
            subscribe: () => {
                return pubsub.asyncIterator('NEW_COMMENT')
            }
        },
        onPostAdded: {
            subscribe: () => {
                return pubsub.asyncIterator('NEW_POST')
            }
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        serialize(value) {
            console.log(value)
            return `${value.getFullYear()}-${value.getMonth()}-${value.getDay()}`
            // return value.getTime()
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

