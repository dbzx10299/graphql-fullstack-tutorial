import { gql, useQuery } from "@apollo/client";
import Modal from './Modal'
import MostRecentPost from './MostRecentPost'

const POST_SUBSCRIPTION = gql`
    subscription {
        onPostAdded {
            body
            id
        }
    }
`;


const POST_QUERY = gql`
    query getPosts($first: Int!, $firstComments: Int!){
        posts(first: $first) {
            edges {
                node {
                    body 
                    comments(first: $firstComments) {
                        edges {
                            node {
                                body
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default function RecentPost() {
    const { subscribeToMore, ...result } = useQuery(POST_QUERY, { variables: { first: 100, firstComments: 100 }})
   
    return (<>
            <div className="app-main">

            <div className="heading-wrapper">
                <h1>Subscription Demo</h1>
            </div>

            <div className="card-wrapper">
                <div className="card-wrapper__inner">
                    <MostRecentPost {...result}
                        subscribeToNewPosts={() => 
                            subscribeToMore({
                                document: POST_SUBSCRIPTION,
                                updateQuery: (prev, { subscriptionData}) => {
                                    if (!subscriptionData.data) return prev;
                                    const newFeedItem = subscriptionData.data.onPostAdded;
                                    return Object.assign({}, prev, {
                                        posts: {
                                            edges: [newFeedItem, ...prev.posts.edges]
                                        }
                                    });
                                }
                            })
                        }
                    />
                </div>
            </div>

            
        </div>
    </>)
}

