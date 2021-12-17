export const BookTile = ({ node }) => {
    const { id, title, author } = node;

    return (
        <div key={node.id} className="card">
            <h4 className="card-text">{title}</h4>
            <h5 className="card-text">{author.name}</h5>
        </div>
    )
}