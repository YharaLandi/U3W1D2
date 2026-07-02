import { useState, useEffect } from "react";
import { ListGroup, Spinner, Alert, Button } from "react-bootstrap";
import AddComment from "./AddComment";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YTQ2NTY0Y2E0NjE0NDAwMTVlMDVjZjciLCJpYXQiOjE3ODI5OTU4NDAsImV4cCI6MTc4NDIwNTQ0MH0.jorJ7uGSRvn155nNHjsa2GrPXT2gz9trglqONQwbFP0";

function CommentArea({ asin }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    if (!asin) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://striveschool-api.herokuapp.com/api/comments/" + asin,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Errore nel recupero delle recensioni");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        "https://striveschool-api.herokuapp.com/api/comments/" + commentId,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Errore nella cancellazione");
      }

      fetchComments();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [asin]);

  if (!asin) return null;

  return (
    <div className="mt-4">
      <h5>Recensioni</h5>

      {loading && <Spinner animation="border" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && comments.length === 0 && (
        <p>Nessuna recensione per questo libro.</p>
      )}

      <ListGroup>
        {comments.map((comment) => (
          <ListGroup.Item
            key={comment._id}
            className="d-flex justify-content-between align-items-center"
          >
            <span>
              <strong>{comment.rate}/5</strong> — {comment.comment}
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteComment(comment._id)}
            >
              Elimina
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <AddComment asin={asin} onCommentAdded={fetchComments} />
    </div>
  );
}

export default CommentArea;