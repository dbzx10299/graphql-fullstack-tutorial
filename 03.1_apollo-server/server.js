const { ApolloServer, gql } = require('apollo-server')

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


const convertNodeToCursor = (node) => {
    return Buffer.from((node.id).toString()).toString('base64')
}

const convertCursorToNodeId = (cursor) => {
    return parseInt(Buffer.from(cursor, 'base64').toString('ascii'))
}

function cursorPagination(model, first, after) {
    let afterIndex = 0
    let beforeIndex
    
    if (typeof after === 'string') {
        let nodeId = convertCursorToNodeId(after)
        let nodeIndex = model.findIndex(item => item.id === nodeId)
        if (nodeIndex >= 0) {
            afterIndex = nodeIndex + 1
            beforeIndex = afterIndex + 1
        }
    }

    const slicedData = model.slice(afterIndex, afterIndex + first)
    const edges = slicedData.map(node => ({
        node, 
        cursor: convertNodeToCursor(node)
    }))

    let startCursor, endCursor = null
    if (edges.length > 0) {
        startCursor = convertNodeToCursor(edges[0].node)
        endCursor = convertNodeToCursor(edges[edges.length - 1].node)
    }

    let hasNextPage = model.length > afterIndex + first
    let hasPreviousPage = beforeIndex < afterIndex

    return {
        totalCount: model.length,
        edges,
        pageInfo: {
            startCursor,
            endCursor,
            hasPreviousPage,
            hasNextPage
        }
    }
}


const typeDefs = gql `
    type Author {
        id: Int!
        name: String!
        books: [Book]
    }

    type Book {
        id: Int!
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
        book(id: Int!): Book
        books(first: Int!, after: String): BookConnection
        author(id: Int!): Author
        authors(first: Int!, after: String): AuthorConnection
    }

    type Mutation {
        addBook(title: String!, authorId: Int!): Book
        addAuthor(name: String!): Author
    }
`

const resolvers = {
    Query: {
        book: (_, { id }) => {
            return books.find(book => book.id === id)
        },
        author: (_, { id }) => {
            return authors.find(author => author.id === id)
        },
        books: (_, { first, after }) => {
            return cursorPagination(books, first, after);
        },
        authors: (_, { first, after }) => {
            return cursorPagination(authors, first, after)
        }
    },
    Author: {
        books: ({ id }) => {
            return books.filter(book => book.authorId === id)
        }
    },
    Book: {
        author: ({ authorId }) => {
            return authors.find(author => author.id === authorId)
        }
    },
    Mutation: {
        addBook: (_, { title, authorId }) => {
            const book = {
                id: books.length + 1,
                title, 
                authorId 
            }
            books.push(book)
            return book
        },
        addAuthor: (_, { name }) => {
            const author = {
                id: authors.length + 1,
                name
            }
            authors.push(author)
            return author
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers})

server.listen(4000).then(({ url }) => {
    console.log(`server ready at ${url}`)
});




