import { useQuery, gql } from "@apollo/client";
import Loading from './Loading'
import Modal from './Modal'
import { AuthorTile } from './AuthorTile'
import AuthorForm from './AuthorForm'
import { useState } from 'react'



const GET_AUTHORS = gql`
    query getAuthors($first: Int!, $after: String) {
        authors(first: $first, after: $after) {
            totalCount
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
            edges {
                node {
                    name
                    id 
                    books {
                      title
                    }
                }
            }
        }
    }
`


export default function BookCards() {
    const { data, loading, error, fetchMore } = useQuery(GET_AUTHORS, { variables: { first: 1 }})
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    if (loading) return <Modal />
    if (error) return <p>Error...</p>;


    return (<>
        <div className="app-main">
            <AuthorForm />
            <div className="card-wrapper">
                <div className="card-wrapper__inner">
                    {data?.authors?.edges.map(({node}) => (
                        <AuthorTile key={node.id} node={node} />
                    ))}
                </div>

                {data.authors?.pageInfo?.hasNextPage && (
                    isLoadingMore
                        ? <Loading />
                        : <button className="app-btn"
                            onClick={async () => {
                                setIsLoadingMore(true);
                                await fetchMore({
                                    variables: {
                                        first: 2,
                                        after: data.authors.pageInfo.endCursor,
                                    }
                                });
                                setIsLoadingMore(false);
                            }}
                            >
                            Load More
                            </button>
                )}
            </div>
        </div>
    </>)

}