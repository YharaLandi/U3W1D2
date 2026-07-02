import { Card } from "react-bootstrap";
import CommentArea from "./CommentArea";

function BookCard(props) {
  return (
    <Card
      className="book-card"
      onClick={() => {
        props.onSelect(props.asin);
      }}
      style={{ border: props.selected ? "3px solid gold" : "none" }}
    >
      <Card.Img variant="top" src={props.img} />
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        {/* CommentArea appare solo se questa card è selezionata */}
       {props.selected && (
  <div onClick={(e) => e.stopPropagation()}>
    <CommentArea asin={props.asin} />
  </div>
)}
      </Card.Body>
    </Card>
  );
}

export default BookCard;