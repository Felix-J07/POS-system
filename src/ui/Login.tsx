import './static/Login.css'
import React from 'react'

type LoginProps = {
    setLogged_in: React.Dispatch<React.SetStateAction<boolean>>;
}

function Login({setLogged_in}: LoginProps): React.JSX.Element {
    function HandleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.target as HTMLFormElement);

        const username = form.get('username') as string;
        const password = form.get('password') as string;

        if (username && password) {
            window.electron.login(username, password).then((res) => {
                if (res) {
                    setLogged_in(true);
                } else {
                    alert('Invalid username or password');
                }
            });
        }
    }

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