import { useState } from "react";
import books from "../data/fantasy.json";
import { Row, Col, Form } from "react-bootstrap";
import BookCard from "./card";
import CommentArea from "./CommentArea";

function ListBooks() {
  const [searchQuery, setSearchQuery] = useState("");
  // selectedAsin = l'asin del libro selezionato, null = nessuno
  const [selectedAsin, setSelectedAsin] = useState(null);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // se clicchi una card già selezionata la deseleziona
  // altrimenti seleziona quella nuova
  const handleSelect = (asin) => {
    setSelectedAsin(asin === selectedAsin ? null : asin);
  };

  return (
    <>
      <Row className="my-3">
        <Col xs={12} md={6} className="mx-auto">
          <Form.Control
            type="text"
            placeholder="Cerca un libro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="g-3">
        {filteredBooks.map((book) => (
          <Col key={book.asin} xs={12} md={4}>
            <BookCard
              title={book.title}
              img={book.img}
              price={book.price}
              asin={book.asin}
              selected={book.asin === selectedAsin}
              onSelect={handleSelect}
            />
          </Col>
        ))}
      </Row>

      {/* CommentArea riceve l'asin del libro selezionato
          se null, il componente non mostra nulla */}
    </>
  );
}

export default ListBooks;