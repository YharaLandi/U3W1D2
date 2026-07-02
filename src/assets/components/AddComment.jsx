import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YTQ2NTY0Y2E0NjE0NDAwMTVlMDVjZjciLCJpYXQiOjE3ODI5OTU4NDAsImV4cCI6MTc4NDIwNTQ0MH0.jorJ7uGSRvn155nNHjsa2GrPXT2gz9trglqONQwbFP0";

function AddComment({ asin, onCommentAdded }) {
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        "https://striveschool-api.herokuapp.com/api/comments/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: comment,
            rate: rate,
            elementId: asin,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Errore nel salvataggio della recensione");
      }

      setComment("");
      setRate(3);
      setSuccess(true);
      onCommentAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <h6>Scrivi una recensione</h6>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Recensione salvata!</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Voto (1-5)</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={5}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Recensione</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Scrivi qui la tua recensione..."
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Salvataggio..." : "Invia"}
        </Button>
      </Form>
    </div>
  );
}

export default AddComment;