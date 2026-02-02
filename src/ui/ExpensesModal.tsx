import { Trash } from 'lucide-react';
import { useEffect, useState, type JSX } from "react";
import { AddExpense, GetExpenses, DeleteExpense } from "./database";
import { PrintDate } from "./helpers";
import "./static/ExpensesModal.css"

export function ExpensesModal({ lanDates }: {lanDates: LanDatesType[]}): JSX.Element {
    const [expenses, setExpenses] = useState<Expenses[]>([]);
    
    useEffect(() => {
        GetExpenses(setExpenses);
    }, []);

    function HandleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the page from reloading
        event.preventDefault();

        // Saves the submitted form as a FormData object
        const form = new FormData(event.target as HTMLFormElement);
        const lanSelect = form.get("lan-select") as string;

        if (!lanSelect) {
            alert("AAAAAAAAAA\nVælg et LAN");
            return;
        }

        try {
            const expense: Expenses = {
                lanDateId: parseFloat(lanSelect),
                description: form.get("expense-description") as string,
                amount: parseFloat(form.get("expense-amount") as string)
            };
            AddExpense(expense, setExpenses);
            event.currentTarget.reset();
        } catch {
            alert("Error when converting form data.");
            return;
        }
    }

    return (
        <>
            <form className="add-expense-form" onSubmit={HandleFormSubmit}> {/*onKeyDown={e => e.key === 'Enter' && e.preventDefault()}*/}
                <h3>Tilføj udgift</h3>
                <div className="input-group">
                    <label htmlFor="lan-select">LAN</label>
                    <select name="lan-select" id="lan-select" defaultValue="" required>
                        <option value="" disabled>Vælg LAN...</option>
                        {lanDates.sort((a,b) => b.endDate.getTime() - a.endDate.getTime()).map((lanDate, index) => (
                            <option key={lanDate.id} value={lanDate.id}>LAN {index+1}: {PrintDate(lanDate.startDate)} - {PrintDate(lanDate.endDate)}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="expense-description">Beskrivelse</label>
                    <input type="text" name="expense-description" id="expense-description" placeholder="F.eks. Pizza" required />
                </div>
                <div className="input-group">
                    <label htmlFor="expense-amount">Beløb (kr)</label>
                    <input type="number" name="expense-amount" id="expense-amount" placeholder="0.00" step="0.01" required />
                </div>
                <div className="modal-buttons">
                    <button type="submit" className="save-button">Gem</button>
                </div>
            </form>

            <div className="expenses-list-view">
                <table className="expense-list-item">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>LAN dato</th>
                            <th>Beskrivelse</th>
                            <th>Værdi</th>
                            <th className="table-head-delete">Slet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            expenses.map((expense, index) => {
                                const lanDate = lanDates.find(lanDate => lanDate.id === expense.lanDateId);

                                return (
                                    <tr key={index}>
                                        <th>{index+1}</th>
                                        <td>{PrintDate(lanDate?.startDate)} - {PrintDate(lanDate?.endDate)}</td>
                                        <td>{expense.description}</td>
                                        <td>{expense.amount}</td>
                                        <td className="table-data-delete">
                                            <button className="delete-btn" onClick={() => expense.id && DeleteExpense(expense.id, setExpenses)}>{<Trash />}</button>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
}