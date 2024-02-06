import bodyParser from 'body-parser';
import { Router } from 'express';
import { register } from '../controllers/userActions.js';
import { newUser, validate } from '../utils/validator.js';

const route = Router();
route.use(bodyParser.json());

route.route('/signup').post((req, res) => {
	const formHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Form</title>
    </head>
    <body>
      <h1>Registration Form</h1>
      <form action="/api/register" method="POST" onsubmit="submitForm(event)">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
  
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
  
        <button type="submit">Register</button>
      </form>

      <script>
        function submitForm(event) {
          event.preventDefault(); // Prevent the default form submission behavior
const form = event.target;
          const formData = new URLSearchParams(new FormData(form));

          fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
            .then(response => response.text())
            .then(result => {
              console.log(result); // Log the result from the server
              // Handle the result as needed
            })
            .catch(error => console.error('Error:', error));
        }
      </script>
    </body>
    </html>
  `;

	res.status(200).send(formHTML);
});
route.route('/register').post(validate(newUser), register);

export default route;
