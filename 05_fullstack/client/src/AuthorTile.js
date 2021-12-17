export const AuthorTile = ({ node }) => {
    const { id, name, books } = node;

    return (
        <div key={id} className="card">
            <h4 className="card-text">{name}</h4>
            <h5 className="card-text">
                {books.map(book => (
                    <li>{book.title}</li>
                ))}
            </h5>
        </div>
    )
}