import { Card } from "react-bootstrap";

function BookCard(props) {
  return (
    <Card className="book-card">
      <Card.Img variant="top" src={props.img} />
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
      </Card.Body>
    </Card>
  );
}

export default BookCard;