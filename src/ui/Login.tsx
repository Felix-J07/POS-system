import './static/Login.css'
import React from 'react'
import { CheckLoginCredentials } from './database';

// Define the props for the Login component for type checking
type LoginProps = {
    setLogged_in: React.Dispatch<React.SetStateAction<boolean>>;
}

// Login component to handle user authentication
// It accepts a prop 'setLogged_in' to update the login state in the parent component
// The component renders a simple login form and handles form submission
function Login({setLogged_in}: LoginProps): React.JSX.Element {
    // When the form is submitted, prevent the default behavior, extract username and password, and call the API
    function HandleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.target as HTMLFormElement);

        const username = form.get('username') as string;
        const password = form.get('password') as string;

        // Validate the username and password
        if (username && password) {
            // Call the login API and handle the response
            // If anything is returned, set the logged_in state to true
            // Otherwise, alert the user about invalid credentials
            CheckLoginCredentials(username, password).then((res) => {
                if (res) {
                    setLogged_in(true);
                } else {
                    alert('Invalid username or password');
                }
            });
        }
    }

    // Render the login form
    return (
        <div className="login-container">
            <h3>Login</h3>
                <form className="login-form" onSubmit={HandleFormSubmit}>
                <input type="text" placeholder="Username" name="username" />
                <input type="password" placeholder="Password" name="password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;