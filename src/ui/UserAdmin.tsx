import { useEffect, useState, type JSX } from "react";
import { ListPlus, Trash } from "lucide-react";
import { AddUser, GetUsers, DeleteUser } from "./database";
import "./static/UserAdmin.css";

export function UserAdmin(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => GetUsers(setUsers), []);

    // Handle form submission when user saves the new user
    function HandleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the page from reloading
        event.preventDefault();

        // Saves the submitted form as a FormData object
        const form = new FormData(event.target as HTMLFormElement);

        const username = (form.get("username") as string).trimStart().trimEnd();
        const password = (form.get("password") as string).trimStart().trimEnd();

        if (!username || !password) {
            alert("Write username or/and password not only as whitespace.");
            return;
        }

        try {
            AddUser({
                username: username,
                password: password
            }, setUsers);
            event.currentTarget.reset();
        } catch {
            alert("Error in new user form.");
            return;
        }
    }

    return (
        <>
            <h2>Brugeradministration</h2>
            <div className="user-management">
                {/* The form wraps the table or exists independently */}
                <form id="add-user-form" onSubmit={HandleFormSubmit} onKeyDown={e => e.key === 'Enter' && e.preventDefault()}>
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Brugernavn</th>
                                <th>Adgangskode</th>
                                <th>Interaktion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* "New User" Row */}
                            <tr>
                                <th>0</th>
                                <td>
                                    <input 
                                    name="username" 
                                    type="text" 
                                    placeholder="Brugernavn" 
                                    required 
                                    />
                                </td>
                                <td>
                                    <input 
                                    name="password" 
                                    type="text"
                                    placeholder="Adgangskode" 
                                    required 
                                    />
                                </td>
                                <td className="add-user">
                                    <button className="add-btn" type="submit">
                                    <ListPlus />
                                    </button>
                                </td>
                            </tr>

                            {/* Existing Users List */}
                            {users.map(user => (
                                <tr key={user.id}>
                                    <th>{user.id}</th>
                                    <td>{user.username}</td>
                                    <td>{user.password}</td>
                                    <td className="delete-user">
                                        {/* Type="button" prevents this button from submitting the form */}
                                        <button 
                                            type="button" 
                                            className="delete-user-btn" 
                                            onClick={() => user.id && DeleteUser(user.id, setUsers)}
                                        >
                                            <Trash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </form>
            </div>
        </>
    );
}