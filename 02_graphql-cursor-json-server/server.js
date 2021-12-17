const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')

const {
    Page,
    convertNodeToCursor,
    convertCursorToNodeId
} = require('./pagination')

const axios = require('axios')

const app = express()



const Book = new GraphQLObjectType({
    name: 'Book',
    description: 'this is a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: Author,
            resolve: ({ authorId }) => {
                return axios.get(`http://localhost:4000/authors`)
                .then(res => {
                    let data = res.data
                    return data.find(author => author.id === authorId)
                })
            },

        }
    })
})

const Author = new GraphQLObjectType({
    name: 'Author',
    description: 'this represents an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(Book),
            resolve: ({ id }) => {
                return axios.get(`http://localhost:4000/books`)
                .then(res => {
                    let data = res.data
                    return data.filter(book => book.authorId === id)
                })
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'this is the root query',
    fields: () => ({
        book: {
            type: Book,
            description: 'a single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (_, { id }) => {
                return axios.get(`http://localhost:4000/books/${id}`)
                .then(res => res.data)
            }
        },
        author: {
            type: Author,
            description: 'a single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (_, { id }) => {
                return axios.get(`http://localhost:4000/authors/${id}`)
                .then(res => res.data)
            }
        },
        books: {
            type: Page(Book),
            description: 'a list of books',
            args: {
                first: { type: GraphQLInt },
                after: { type: GraphQLString }
            },
            resolve: (_, { first, after }) => {
                let afterIndex = 0
                let beforeIndex
            
                return axios.get(`http://localhost:4000/books`)
                    .then(res => {
                        let data = res.data

                        if (typeof after === 'string') {
                            let nodeId = convertCursorToNodeId(after)
                            let nodeIndex = data.findIndex(item => item.id === nodeId)
                            if (nodeIndex >= 0) {
                                afterIndex = nodeIndex + 1 
                                beforeIndex = afterIndex - 1
                            }
                        }
                        
                        const slicedData = data.slice(afterIndex, afterIndex + first)
                        console.log('sliced data: ', slicedData)

                        const edges = slicedData.map(node => ({
                            node,
                            cursor: convertNodeToCursor(node)
                        }))
                        

                        let startCursor, endCursor = null

                        if (edges.length > 0) {
                            startCursor = convertNodeToCursor(edges[0].node)
                            endCursor = convertNodeToCursor(edges[edges.length - 1].node)
                        }

                        let hasNextPage = data.length > afterIndex + first
                        let hasPreviousPage = beforeIndex < afterIndex



                        return {
                            totalCount: data.length,
                            edges,
                            pageInfo: {
                                startCursor,
                                endCursor,
                                hasPreviousPage,
                                hasNextPage
                            }
                        }
                    })
            }

        },
        authors: {
            type: Page(Author),
            description: 'a list of authors',
            args: {
                first: { type: GraphQLInt },
                after: { type: GraphQLString }
            },
            resolve: (parent, {first, after}) => {
                let afterIndex = 0
                let beforeIndex
            
                return axios.get(`http://localhost:4000/authors`)
                    .then(res => {
                        let data = res.data

                        if (typeof after === 'string') {
                            let nodeId = convertCursorToNodeId(after)
                            let nodeIndex = data.findIndex(item => item.id === nodeId)
                            if (nodeIndex >= 0) {
                                afterIndex = nodeIndex + 1 
                                beforeIndex = afterIndex - 1 
                            }
                        }
                        
                        const slicedData = data.slice(afterIndex, afterIndex + first)

                        const edges = slicedData.map(node => ({
                            node,
                            cursor: convertNodeToCursor(node)
                        }))

                        let startCursor, endCursor = null
                        if (edges.length > 0) {
                            startCursor = convertNodeToCursor(edges[0].node)
                            endCursor = convertNodeToCursor(edges[edges.length - 1].node)
                        }

                        let hasNextPage = data.length > afterIndex + first
                        let hasPreviousPage = beforeIndex < afterIndex

                        return {
                            totalCount: data.length,
                            edges,
                            pageInfo: {
                                startCursor,
                                endCursor,
                                hasPreviousPage,
                                hasNextPage
                            }
                        }
                    })
            }

        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addBook: {
            type: Book,
            description: 'add a book',
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (_, { title, authorId }) => {
                return axios.post(`http://localhost:4000/books`, {
                    title,
                    authorId
                }).then(res => res.data)
            }
        },
        addAuthor: {
            type: Author,
            description: 'add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (_, { name }) => {
                return axios.post(`http://localhost:4000/authors`, {
                    name
                }).then(res => res.data)
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

app.listen(3000, () => console.log('app running at http://localhost:3000/graphql'))





