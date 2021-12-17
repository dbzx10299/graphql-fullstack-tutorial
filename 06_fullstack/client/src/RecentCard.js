import Modal from "./Modal"
import { useEffect } from 'react';



export default function RecentCard({ data, loading, subscribeToNewBooks }) {

    useEffect(() => {
        subscribeToNewBooks();
        console.log('done mounting')
    }, []);

    if (loading) return <Modal />

    return (<>
        {data?.authors.edges.slice(0).reverse().map(({ node }) => 
            <div className="card">
                <h4 className="card-text">{node.name}</h4>
                {node.books.map(({ title}) => 
                    <h4 className="card-text">{title}</h4>
                )}
            </div>
        )}
    </>)
}