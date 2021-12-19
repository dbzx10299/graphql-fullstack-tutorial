import { useQuery, gql } from "@apollo/client";
import Loading from './Loading'
import Modal from './Modal'
import { Post } from './Post'
import PostForm from './PostForm'
import { useState } from 'react'

const GET_POSTS = gql`
    query ($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
            totalCount
            pageInfo {
                hasNextPage
                endCursor
            }
            edges {
                node {
                    body
                    id 
                }
            }
        }
    }
`;



export default function PostsPage() {
    const { data, loading, error, fetchMore } = useQuery(GET_POSTS, { variables: { first: 2 } })
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    if (loading) return <Modal />
    if (error) return <p>Error...</p>;

    return (<>
        <div className="app-main">
            <PostForm />
            <div className="card-wrapper">
                <div className="card-wrapper__inner">
                    {data?.posts?.edges.map(({node}) => (
                        <Post key={node.id} node={node} />
                    ))}
                </div>

                {data.posts?.pageInfo?.hasNextPage && (
                    isLoadingMore
                        ? <Modal />
                        : <button className="btn primary"
                            onClick={async () => {
                                setIsLoadingMore(true);
                                await fetchMore({
                                    variables: {
                                        first: 2,
                                        after: data.posts.pageInfo.endCursor,
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