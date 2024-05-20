// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Ownable {
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "Contract was not called by the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}

contract Library is Ownable {
    
    struct Book {
        string title;
        uint copies;
        address[] borrowers;
    }

    Book[] private books;

    struct AvailableBook {
        uint id;
        string title;
        uint copies;
    }

    // Events
    event NewBookAdded(uint id, string title);
    event NewCopiesAdded(uint id, uint copies);
    event BookBorrowed(uint indexed id, address indexed borrower); // Changed to include borrower address
    event BookReturned(uint id, address borrower);

    mapping(address => uint[]) private userBorrowedBooks;

    // Modifier
    modifier bookMustExist(uint _id) {
        require(books.length > 0, "The library has no books currently");
        require(_id <= books.length -1, "Book with this id does not exist in the collection");
        _;
    }

    function addBook(string calldata _title, uint _copies) public onlyOwner {
        require(_copies > 0, "Add at least one copy of the book");
        for(uint i=0;i< books.length; i++) {
            if(keccak256(abi.encodePacked(books[i].title)) == keccak256(abi.encodePacked(_title))) {
                // check if book already exist in the library
                // if it does then increase the number of copies 
                books[i].copies = books[i].copies + _copies;
                emit NewCopiesAdded(i, _copies);
                return ;
            }
        }
        // If the book currently does not exist in the collection then add it
        books.push();
        books[books.length - 1].title = _title;
        books[books.length - 1].copies = _copies;   
        emit NewBookAdded(books.length - 1, _title);
    }

    function getAvailableBooks() public view returns (AvailableBook[] memory) {
        // retrieve the number of available book titles
        uint counter = 0;
        for(uint i=0; i<books.length;i++){
            if(books[i].copies - books[i].borrowers.length > 0){
                counter++;
            }
        }
        // retrieve available books
        AvailableBook[] memory availableBooks = new AvailableBook[] (counter);
        counter = 0;
        for(uint i=0; i<books.length; i++) {
            if(books[i].copies - books[i].borrowers.length > 0){
                availableBooks[counter] = AvailableBook(i,books[i].title, books[i].copies - books[i].borrowers.length);
                counter++;
            }
        }
        return availableBooks;
    }

    function hasBook(uint _id, address _user) private view returns (bool){
        for(uint i=0;i<books[_id].borrowers.length; i++){
            if(_user == books[_id].borrowers[i]) {
                return true;
            }
        } 
        return false;  
    }

    function borrowBook(uint _id) public bookMustExist(_id) {
        require(hasBook(_id, msg.sender) == false, "Books must be returned before it can be borrowed again");
        require(books[_id].copies - books[_id].borrowers.length > 0, "There are no copies of the book currently available");

        // Borrow the book
        books[_id].borrowers.push(msg.sender);
        userBorrowedBooks[msg.sender].push(_id); // Track borrowed book by user
        emit BookBorrowed(_id, msg.sender); // Emit event with borrower's address
    }

    function removeIndexFromUintArray(uint[] storage array, uint index) internal {
        if (index >= array.length) return;

        for (uint i = index; i < array.length - 1; i++){
            array[i] = array[i + 1];
        }
        array.pop();
    }


   function returnBook(uint _id) public bookMustExist(_id) {
        require(hasBook(_id, msg.sender) == true, "You do not have this book out on loan");
        for(uint i=0; i<books[_id].borrowers.length; i++){
            if(msg.sender == books[_id].borrowers[i]){
                removeIndexFromAddressArray(books[_id].borrowers,i);
                // Remove book from user's borrowed books
                for(uint j = 0; j < userBorrowedBooks[msg.sender].length; j++) {
                    if(userBorrowedBooks[msg.sender][j] == _id) {
                        removeIndexFromUintArray(userBorrowedBooks[msg.sender], j);
                        break;
                    }
                }
                emit BookReturned(_id, msg.sender);
                return ;
            }
        }
    }

    // New function to get borrowed books for a user
    function getBorrowedBooks(address _user) public view returns (AvailableBook[] memory) {
        uint[] memory borrowedBookIds = userBorrowedBooks[_user];
        AvailableBook[] memory borrowedBooks = new AvailableBook[](borrowedBookIds.length);
        for(uint i = 0; i < borrowedBookIds.length; i++) {
            uint bookId = borrowedBookIds[i];
            borrowedBooks[i] = AvailableBook(bookId, books[bookId].title, 1); // Assuming borrower gets only 1 copy
        }
        return borrowedBooks;
    }


    function removeIndexFromAddressArray(address[] storage _array, uint _index) private {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }
}
