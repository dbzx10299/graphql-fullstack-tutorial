const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLBoolean
} = require('graphql')

const {
    Connection,
    convertNodeToCursor,
    convertCursorToNodeId
} = require('./pagination')

const app = express()

const authors = [
    { id: 1, name: "Author 1"},
    { id: 2, name: "Author 2"},
    { id: 3, name: "Author 3"}
]

const books = [
    { id: 1, title: "Book 1", authorId: 1 },
    { id: 2, title: "Book 2", authorId: 1 },
    { id: 3, title: "Book 3", authorId: 1 },
    { id: 4, title: "Book 4", authorId: 2 },
    { id: 5, title: "Book 5", authorId: 2 },
    { id: 6, title: "Book 6", authorId: 2 },
    { id: 7, title: "Book 7", authorId: 3 },
    { id: 8, title: "Book 8", authorId: 3 },
    { id: 9, title: "Book 9", authorId: 3 }
]




const Author = new GraphQLObjectType({
    name: 'Author',
    description: 'this represents a single author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: GraphQLList(Book),
            resolve: ({ id }) => {
                return books.filter(book => book.authorId === id)
            }
        }
    })
})


const Book = new GraphQLObjectType({
    name: 'Book',
    description: 'this represents a single book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: Author,
            resolve: ({ authorId }) => {
                return authors.find(author => author.id === authorId)
            }
        }
    })
})


const RootQueryType = new GraphQLObjectType({
    name: 'QueryRoot',
    description: 'this is the root query',
    fields: () => ({
        book: {
            type: Book,
            description: 'a single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (_, { id }) => {
                return books.find(book => book.id === id)
            }
        },
        author: {
            type: Author,
            description: 'a single author',
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (_, { id }) => {
                return authors.find(author => author.id === id)
            }
        },
        books: {
            type: GraphQLNonNull(Connection(Book)),
            description: 'List of the books',
            args: {
                first: { type: GraphQLInt },
                after: { type: GraphQLString }
            },
            resolve: (_, { first, after }) => {
                let afterIndex = 0
                let beforeIndex

                if (typeof after === 'string') {
                    let nodeId = convertCursorToNodeId(after)
                    let nodeIndex = books.findIndex(book => book.id === nodeId)
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

                let startCursor = null
                let endCursor = null
                if (edges.length > 0) {
                    startCursor = convertNodeToCursor(edges[0].node)
                    endCursor = convertNodeToCursor(edges[edges.length - 1].node)
                }

                let hasNextPage = books.length > afterIndex + first
                let hasPreviousPage = beforeIndex < afterIndex

                return {
                    totalCount: books.length,
                    edges,
                    pageInfo: {
                        startCursor,
                        endCursor,
                        hasNextPage,
                        hasPreviousPage
                    }
                }
            }
        },
        authors: {
            type: Connection(Author),
            description: 'List of the authors',
            args: {
                first: { type: GraphQLInt },
                after: { type: GraphQLString }
            },
            resolve: (_, { first, after }) => {
                let afterIndex = 0
                let beforeIndex

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

                let startCursor = null
                let endCursor = null
                if (edges.length > 0) {
                    startCursor = convertNodeToCursor(edges[0].node)
                    endCursor = convertNodeToCursor(edges[edges.length - 1].node)
                }

                let hasNextPage = authors.length > afterIndex + first
                let hasPreviousPage = beforeIndex < afterIndex

                return {
                    totalCount: authors.length,
                    edges,
                    pageInfo: {
                        startCursor,
                        endCursor,
                        hasNextPage,
                        hasPreviousPage
                    }
                }
            }
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'root mutation',
    fields: () => ({
        addBook: {
            type: Book,
            description: 'add a book',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (_, { title, authorId }) => {
                const book = {
                    id: books.length + 1,
                    title,
                    authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: Author,
            description: 'add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (_, { name }) => {
                const author = {
                    id: authors.length + 1,
                    name
                }
                authors.push(author)
                return author
            }
        }
    })
})


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

app.listen(3000, () => console.log('app running at http://localhost:3000/graphql'))
