const {
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')


const Edge = (itemType) => {
    return new GraphQLObjectType({
        name: `${itemType.name}Edge`,
        fields: () => ({
            node: { type: itemType },
            cursor: { type: GraphQLString }
        })
    })
}

const PageInfo = new GraphQLObjectType({
    name: 'PageInfo',
    fields: () => ({
        hasPreviousPage: { type: GraphQLNonNull(GraphQLBoolean) },
        hasNextPage: { type: GraphQLNonNull(GraphQLBoolean) },
        startCursor: { type: GraphQLString },
        endCursor: { type: GraphQLString }
    })
})

const Connection = (itemType) => {
    return new GraphQLObjectType({
        name: `${itemType.name}Connection`,
        fields: () => ({
            totalCount: { type: GraphQLInt },
            edges: { type: new GraphQLList(Edge(itemType)) },
            pageInfo: { type: PageInfo }
        })
    })
}



const convertNodeToCursor = (node) => {
    return Buffer.from((node.id).toString()).toString('base64')
}

const convertCursorToNodeId = (cursor) => {
    return parseInt(Buffer.from(cursor, 'base64').toString('ascii'))
}

module.exports = {
    Connection,
    convertNodeToCursor,
    convertCursorToNodeId
}
