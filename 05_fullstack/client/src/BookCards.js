import {
    useQuery,
    useLazyQuery,
    gql
} from "@apollo/client";

import BookForm from './BookForm'
import Loading from './Loading'
import Modal from './Modal'
import { BookTile } from './BookTile'
import { useState } from 'react'



const GET_BOOKS = gql`
    query getBooks($first: Int!, $after: String) {
        books(first: $first, after: $after) {
            totalCount
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
            edges {
                node {
                    title
                    id 
                    author {
                      name
                    }
                }
            }
        }
    }
`


export default function BookCards() {
    // first 2 is the initial number fetched when page loads, then subsequent amount comes from fetchMore
    const { data, loading, error, fetchMore } = useQuery(GET_BOOKS, { variables: { first: 2 }})
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    if (loading) return <Modal />
    if (error) return <p>Error...</p>;


    return (<>
        <div className="app-main">
            <BookForm />
            <div className="card-wrapper">
                <div className="card-wrapper__inner">
                    {data?.books?.edges.map(({node}) => (
                        <BookTile key={node.id} node={node} />
                    ))}
                </div>

                {data.books?.pageInfo?.hasNextPage && (
                    isLoadingMore
                        ? <Loading />
                        : <button className="app-btn"
                            onClick={async () => {
                                setIsLoadingMore(true);
                                await fetchMore({
                                    variables: {
                                        first: 2,
                                        after: data.books.pageInfo.endCursor,
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