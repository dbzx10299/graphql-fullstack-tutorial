import { gql, useSubscription, useQuery } from "@apollo/client";
import Modal from './Modal'
import RecentCard from './RecentCard'


const AUTHOR_SUBSCRIPTION = gql`
    subscription {
        newBook {
            title
            id
        }
    }
`;


const AUTHORS_QUERY = gql`
    query {
        authors(first: 100) {
            edges {
                node {
                    name 
                    books {
                        title
                    }
                }
            }
        }
    }
`;

export default function Recents() {
    const { subscribeToMore, ...result } = useQuery(AUTHORS_QUERY)
   
    return (<>
        <div className="app-main">
            <h1>Recently added</h1>

            <RecentCard {...result}
                subscribeToNewBooks={() => 
                    subscribeToMore({
                        document: AUTHOR_SUBSCRIPTION,
                        updateQuery: (prev, { subscriptionData}) => {
                            if (!subscriptionData.data) return prev;
                            const newFeedItem = subscriptionData.data.newBook;
                            return Object.assign({}, prev, {
                                authors: {
                                    edges: [newFeedItem, ...prev.authors.edges]
                                }
                            });
                        }
                    })
                }
            />
        </div>
    </>)
}

