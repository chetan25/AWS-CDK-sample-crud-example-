import { SyntheticEvent, useRef, useState } from "react";
import type { DataService } from "../../services/DataService";
import "./AddBook.css";

type AddBookProps = {
  dataService: DataService;
};

const AddBook = ({ dataService }: AddBookProps) => {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const authorRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLInputElement | null>(null);
  const [photo, setPhoto] = useState<File | undefined>();
  const [actionResult, setActionResult] = useState<string>("");

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const title = titleRef?.current?.value;
    const author = authorRef?.current?.value;
    const description = descriptionRef?.current?.value;
    if (title && author && description) {
      const newBook = {
        title,
        author,
        description,
        photo,
      };
      const id = await dataService.addBook(newBook);
      setActionResult(`Book added with id ${id}`);
    } else {
      setActionResult("Please provide all the fields!");
    }
  };

  function setPhotoUrl(event: { target: HTMLInputElement }) {
    if (event.target.files && event.target.files[0]) {
      setPhoto(event.target.files[0]);
    }
  }

  function renderPhoto() {
    if (photo) {
      const localPhotoURL = URL.createObjectURL(photo);
      return <img alt="" src={localPhotoURL} style={{ maxWidth: "200px" }} />;
    }
  }

  function renderForm() {
    return (
      <div className="book-form">
        <form onSubmit={(e) => handleSubmit(e)}>
          <h2>Add Book</h2>
          <div className="book-input-wrapper">
            <div className="book-input">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                name="title"
                placeholder="Enter a title"
                id="title"
                ref={titleRef}
              />
            </div>
            <div className="book-input">
              <label htmlFor="author">Author:</label>
              <input
                type="text"
                name="author"
                placeholder="Enter Author"
                id="author"
                ref={authorRef}
              />
            </div>
            <div className="book-input">
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                name="description"
                placeholder="Enter description"
                id="description"
                ref={descriptionRef}
              />
            </div>
            <div className="book-input">
              <label htmlFor="bookPhoto">Upload Photo:</label>
              <input
                type="file"
                name="bookPhoto"
                onChange={(e) => setPhotoUrl(e)}
                className="image-selector"
              />
              <div className="photo-wrapper">{renderPhoto()}</div>
            </div>
          </div>
          <button type="button" className="add-btn" onClick={handleSubmit}>
            Add Book
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {renderForm()}
      {actionResult ? <h3>{actionResult}</h3> : undefined}
    </div>
  );
};

export default AddBook;
