// script.js
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Call the function to validate credentials
    validateCredentials(username, password);
});

function validateCredentials(username, password) {
    // Fetch data from Google Sheets (replace with your API call)
    fetch('https://script.google.com/macros/s/AKfycbzI9Uo_3dG1gfSoOTadSXHnbl3hXRs3JozJr5KJl3nTyj7a74OJ-zPOOd4LJdqWkFeHPw/exec')
        .then(response => response.json())
        .then(data => {
            let isValid = false;
            data.forEach(row => {
                // Assuming username is in the first column and password in the second
                if (row[0] === username && verifyPassword(password, row[1])) {
                    isValid = true;
                }
            });

            // Display message based on validation
            const messageDiv = document.getElementById('message');
            if (isValid) {
                messageDiv.innerHTML = 'Login successful!';
            } else {
                messageDiv.innerHTML = 'Incorrect username or password.';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Function to verify password (implement your hashing logic)
function verifyPassword(inputPassword, storedHash) {
    // Implement your password hashing verification logic here
    // For example, using bcrypt to compare the input password with the stored hash
    return bcrypt.compareSync(inputPassword, storedHash);
}