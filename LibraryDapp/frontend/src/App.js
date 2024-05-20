import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, TextField, Typography, List, ListItem,ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';


import Library from './Library.json';

const contractAddress = '0xeD04864Abf39A57e44968d14719dFFdC16037bd8';

const App = () => {
  const [title, setTitle] = useState('');
  const [copies, setCopies] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);

  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, Library.abi, signer);

  const handleAddBook = async () => {
    try {
      const copiesBigNumber = ethers.BigNumber.from(copies);
      const newBook = await contract.addBook(title, copiesBigNumber);
      await newBook.wait();
      await fetchAvailableBooks();
      console.log('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      const books = await contract.getAvailableBooks();
      const booksWithId = books.map((book, index) => ({ ...book, id: index }));
      setAvailableBooks(booksWithId);
      console.log("Data", booksWithId);
    } catch (error) {
      console.error('Error fetching available books:', error);
    }
  };


  const listenForEvents = () => {
    contract.on("BookBorrowed", (borrower, bookId) => {
      console.log(`Book borrowed by ${borrower}: ${bookId}`);
      fetchAvailableBooks();
      fetchBorrowedBooks();
    });

    contract.on("BookReturned", (borrower, bookId) => {
      console.log(`Book returned by ${borrower}: ${bookId}`);
      fetchAvailableBooks();
      fetchBorrowedBooks();
    });
  };

  const fetchBorrowedBooks = async () => {
    try {
      const borrowedBooks = await contract.getBorrowedBooks(signer.getAddress());
      setBorrowedBooks(borrowedBooks);
      console.log("Borrowed Books", borrowedBooks);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  useEffect(() => {
    fetchAvailableBooks();
    listenForEvents();
    fetchBorrowedBooks();
  }, []);

  const handleBorrowBook = async (id) => {
    try {
      await contract.borrowBook(id);
      console.log('Borrowing book...');
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const handleReturnBook = async (id) => {
    try {
      await contract.returnBook(id);
      console.log('Returning book...');
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  return (
    <div>
      <Typography variant="h1" gutterBottom>Library dApp</Typography>
      <TextField
        type="text"
        label="Enter book title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TextField
        type="text"
        label="Enter number of copies"
        value={copies}
        onChange={(e) => setCopies(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Grid container spacing={2} padding={5} justifyContent="center">
        <Grid item>
          <Button variant="contained" onClick={handleAddBook}>Add Book</Button>
        </Grid>
      </Grid>

      <Typography variant="h2" gutterBottom>Available Books:</Typography>
      <List>
        {availableBooks.map((book) => (
          <ListItem key={book.id}>
            <ListItemIcon>
              <span>•</span>
            </ListItemIcon>
            <ListItemText
              primary={`Title: ${book.title}`}
              secondary={`Copies: ${ethers.utils.formatUnits(book.copies, 0)}`}
            />
            <ListItemSecondaryAction>
              <IconButton onClick={() => handleBorrowBook(book.id)} color="primary">Borrow</IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Typography variant="h2" gutterBottom>Borrowed Books:</Typography>
      <List>
        {borrowedBooks.map((book) => (
          <ListItem key={book.id}>
            <ListItemIcon>
              <span>•</span>
            </ListItemIcon>
            <ListItemText
              primary={`Title: ${book.title}`}
              secondary={`Copies: ${ethers.utils.formatUnits(book.copies, 0)}`}
            />
            <ListItemSecondaryAction>
              <IconButton onClick={() => handleReturnBook(book.id)} color="secondary">Return</IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

    </div>
  );
};

export default App;
