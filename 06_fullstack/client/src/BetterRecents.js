import { gql, useSubscription, useQuery } from "@apollo/client";
import BetterRecentCard from './BetterRecentCard'


const BOOKS_SUBSCRIPTION = gql`
    subscription {
        newBook {
            title
            id
        }
    }
`;

const BOOKS_QUERY = gql`
    query ($first: Int!){
        books(first: $first) {
            edges {
                node {
                    title
                    author {
                        name
                    }
                }
            }
        }
    }
`;




export default function BetterRecents() {
    const { subscribeToMore, data, loading } = useQuery(BOOKS_QUERY, { variables: { first: 100 }})
   

    return (<>
        <div className="app-main">
            <h1>better Recently added</h1>

                <BetterRecentCard data={data} loading={loading}
                    subscribeToNewBooks={() => 
                        subscribeToMore({
                            document: BOOKS_SUBSCRIPTION,
                            updateQuery: (prev, { subscriptionData }) => {
                                if (!subscriptionData.data) return prev;
                                const newFeedItem = subscriptionData.data.newBook;
                                console.log(newFeedItem)
                                
                                return Object.assign({}, prev, {
                                    books: {
                                        edges: [newFeedItem, ...prev.books.edges]
                                    }
                                });
                            }
                        })
                    }
                />
        </div>
    </>)
}

