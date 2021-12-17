require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const { GraphQLScalarType, Kind } = require('graphql')

const { Book, Author } = require('./models')

const convertNodeToCursor = (node) => {
    return Buffer.from(node.id).toString('base64')
}

const convertCursorToNodeId = (cursor) => {
    return Buffer.from(cursor, 'base64').toString('ascii')
}

const typeDefs = gql `

    type Author {
        _id: String!
        name: String!
        books: [Book]
    }

    type Book {
        _id: String!
        title: String!
        authorId: Int!
        author: Author
    }

    type PageInfo {
        hasPreviousPage: Boolean!
        hasNextPage: Boolean!
        startCursor: String
        endCursor: String
    }

    type BookEdge {
        node: Book
        cursor: String
    }

    type BookConnection {
        totalCount: Int
        edges: [BookEdge]
        pageInfo: PageInfo
    }

    type AuthorEdge {
        node: Author
        cursor: String
    }

    type AuthorConnection {
        totalCount: Int
        edges: [AuthorEdge]
        pageInfo: PageInfo
    }

    type Query {
        book(id: String!): Book
        author(id: String!): Author
        books(first: Int!, after: String): BookConnection
        authors(first: Int!, after: String): AuthorConnection
    }

    type Mutation {
        addBook(title: String!, authorId: String!): Book
        addAuthor(name: String!): Author
    }
`

const resolvers = {
    Query: {
        book: (_, { id }) => {
            return Book.findOne({ _id: id })
                .then(book => {
                    return { ...book._doc }
                })
        },
        author: (_, { id }) => {
            return Author.findOne({ _id: id})
              .then(author => {
                  return { ...author._doc}
              })
        },
        books: async (_, { first, after }) => {
            let afterIndex = 0
            let beforeIndex

            return (
                Book.find()
                    .then(books => {

                        if (typeof after === 'string') {
                            let nodeId = convertCursorToNodeId(after)
                            let nodeIndex = books.findIndex(node => node.id === nodeId)
                            if (nodeIndex >= 0) {
                                afterIndex = nodeIndex + 1
                                beforeIndex = afterIndex - 1
                            }
                        }

                        const slicedData = books.slice(afterIndex, afterIndex + first)
                        const edges = slicedData.map(node => ({
                            node, 
                            cursor: convertNodeToCursor(node)
                        }))

                        let startCursor, endCursor = null

                        if (edges.length > 0) {
                            startCursor = convertNodeToCursor(edges[0].node)
                            endCursor = convertNodeToCursor(edges[edges.length - 1].node)
                        }

                        let hasNextPage = books.length > afterIndex + first
                        let hasPreviousPage = beforeIndex < afterIndex

                        let totalCount = books.length;

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

                    })
            );

        },
        authors: (_, { first, after }) => {
            let afterIndex = 0
            let beforeIndex

            return (
                Author.find()
                    .then(authors => {
                        
                        if (typeof after === 'string') {
                            let nodeId = convertCursorToNodeId(after)
                            let nodeIndex = authors.findIndex(author => author.id === nodeId)
                            if (nodeIndex >= 0) {
                                afterIndex = nodeIndex + 1
                                beforeIndex = afterIndex - 1
                            }
                        }

                        const slicedData = authors.slice(afterIndex, afterIndex + first)

                        const edges = slicedData.map(node => ({
                            node,
                            cursor: convertNodeToCursor(node)
                        }))

                        let startCursor, endCursor = null

                        if (edges.length > 0) {
                            startCursor = convertNodeToCursor(edges[0].node)
                            endCursor = convertNodeToCursor(edges[edges.length - 1].node)
                        }

                        let hasNextPage = authors.length > afterIndex + first
                        let hasPreviousPage = beforeIndex < afterIndex

                        let totalCount = authors.length;

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

                    })
            )
        },
    },
    Book: {
        author: async ({ authorId }) => {
            const author = await Author.findOne({ _id: authorId })
            return author;
        }
    },
    Author: {
        books: async ({ _id }) => {
            const books = await Book.find({ authorId: _id})
            return books;
        }
    },
    Mutation: {
        addBook: (_, { title, authorId}) => {
            const bookObj = new Book({
                title,
                authorId
            });
            return bookObj.save()
              .then(result => {
                  const book = { ...result._doc };
                  return book;
              })
              .catch(err => {
                  console.log(err.message)
              })
        },
        addAuthor: (_, { name }) => {
            const authorObj = new Author({
                name
            });
            return authorObj.save()
              .then(result => {
                  const author = { ...result._doc }
                  return author
              })
              .catch(err => {
                  console.log(err.message)
              })
        }
    }
};




const server = new ApolloServer({typeDefs, resolvers})
// connects to server after mongoose connects.

// server.listen().then(({ url }) => {
//     console.log(`server ready at ${url}`)
// });


mongoose.connect(process.env.mongoDB)
    .then(() => { 
        console.log('mongoose connected');
        server.listen().then(({ url }) => console.log(`server ready at ${url}`))
    })
    .catch(err => console.log(err))

