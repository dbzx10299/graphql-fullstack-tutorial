export default function BookCard({ node }) {
    const { title, author } = node;

    return (
        <div className="card">
            <h4 className="card-text">{title}</h4>
            <h5 className="card-text">{author.name}</h5>
        </div>
    )
}