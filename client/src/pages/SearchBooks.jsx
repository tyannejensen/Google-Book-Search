import React, { useState, useEffect } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import { useLazyQuery, useMutation } from '@apollo/client';
import { SEARCH_GOOGLE_BOOKS, GET_ME } from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';


const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [searchBooks, { loading, error }] = useLazyQuery(SEARCH_GOOGLE_BOOKS);
  const [saveBook] = useMutation(SAVE_BOOK);

    const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput) {
      return false;
    }

    try {
      const { data } = await searchBooks({ variables: { query: searchInput } });
      console.log(data);

      const books = data.searchGoogleBooks.map((book) => ({
        bookId: book.bookId,
        authors: book.authors,
        title: book.title,
        description: book.description,
        link: book.link,
        image: book.image || '',
      }));
      setSearchedBooks(books);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (book) => {
    console.log(book)
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }
    console.log(book);
    try {
      const bookData = {
        bookId: book.bookId,
        authors: book.authors,
        description: book.description,
        title: book.title,
        image: book.image,
        link: book.link,
      };
      console.log(book, bookData);

      await saveBook({
        variables: { bookData },
        update: (cache) => {
          try {
            const me = cache.readQuery({ query: GET_ME }) ? cache.readQuery({ query: GET_ME }).me : null;
            if (me) {
              cache.writeQuery({
                query: GET_ME,
                data: { me: { ...me, savedBooks: [...me.savedBooks, bookData] } },
              });
            }
          } catch (e) {
            console.error('Error reading cache:', e);
          }
        },
      });
      console.log('Book saved!', saveBookIds);
      const updatedSavedBookIds = [...savedBookIds, book.bookId];
      setSavedBookIds(updatedSavedBookIds);
      saveBookIds(updatedSavedBookIds);
      console.log('Book saved!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

    console.log(savedBookIds)
  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book, index) => {
            return (
              <Col md="4" key={index}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.find((id) => id === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book)}
                      >
                        
                        {savedBookIds?.find((id) => id === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;

// import React, { useState, useEffect } from 'react';
// import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
// import { useLazyQuery, useMutation } from '@apollo/client';
// import { SEARCH_GOOGLE_BOOKS } from '../utils/queries';
// import { SAVE_BOOK } from '../utils/mutations';
// import Auth from '../utils/auth';
// import { saveBookIds, getSavedBookIds } from '../utils/localStorage';

// const SearchBooks = () => {
//   const [searchedBooks, setSearchedBooks] = useState([]);
//   const [searchInput, setSearchInput] = useState('');
//   const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

//   const [searchBooks, { loading, error, data }] = useLazyQuery(SEARCH_GOOGLE_BOOKS);
//   const [saveBook] = useMutation(SAVE_BOOK);

//   useEffect(() => {
//     return () => saveBookIds(savedBookIds);
//   }, [savedBookIds]);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchInput) {
//       return false;
//     }

//     try {
//       const { data } = await searchBooks({ variables: { query: searchInput } });
//       const books = data.searchGoogleBooks.map((book) => ({
//         bookId: book.id,
//         authors: book.volumeInfo.authors,
//         title: book.volumeInfo.title,
//         description: book.volumeInfo.description,
//         image: book.volumeInfo.imageLinks?.thumbnail || '',
//       }));
//       setSearchedBooks(books);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSaveBook = async (bookId) => {
//     try {
//       await saveBook({ variables: { bookId } });
//       // Update savedBookIds logic if needed
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error :(</p>;

//   return (
//     <Container>
//       <Form onSubmit={handleSearch}>
//         <Form.Group>
//           <Form.Control
//             type="text"
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             placeholder="Search for a book"
//           />
//         </Form.Group>
//         <Button type="submit">Search</Button>
//       </Form>
//       <Row>
//         {searchedBooks.map((book) => (
//           <Col md="4" key={book.bookId}>
//             <Card border='dark'>
//               {book.image && (
//                 <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
//               )}
//               <Card.Body>
//                 <Card.Title>{book.title}</Card.Title>
//                 <p className='small'>Authors: {book.authors.join(', ')}</p>
//                 <Card.Text>{book.description}</Card.Text>
//                 {Auth.loggedIn() && (
//                   <Button
//                     disabled={savedBookIds?.some((id) => id === book.bookId)}
//                     className='btn-block btn-info'
//                     onClick={() => handleSaveBook(book.bookId)}
//                   >
//                     {savedBookIds?.some((id) => id === book.bookId)
//                       ? 'This book has already been saved!'
//                       : 'Save this Book!'}
//                   </Button>
//                 )}
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Container>
//   );
// };

// export default SearchBooks;