import books from "../data/fantasy.json";
import { Row, Col } from "react-bootstrap";
import BookCard from "./card";

function ListBooks() {
  return (
    <Row className="g-3">
      {books.map((book) => (
        <Col key={book.asin} xs={12} md={4}>
          <BookCard title={book.title} img={book.img} price={book.price} />
        </Col>
      ))}
    </Row>
  );
}

export default ListBooks;