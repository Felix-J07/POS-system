import { Trash, Plus } from 'lucide-react';
import { formatDate } from './helpers';
import { UpdateLanDates } from './database';
import { useState } from 'react';
import './static/lan_dates_modal.css'

type LanDatesModalProps = {
    lanDates: LanDatesType[];
    setLanDates: React.Dispatch<React.SetStateAction<LanDatesType[]>>;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export function LanDatesModal({lanDates, setLanDates, setModalVisible}: LanDatesModalProps) {
    const [tempLanDates, setTempLanDates] = useState<LanDatesType[]>(lanDates)

    // Update the date list when user changes a date
    function updateDate(index: number, field: 'startDate' | 'endDate', value: string) {
        const updatedDates = tempLanDates.map((ts, i) =>
            i === index ? { ...ts, [field]: new Date(value) } : ts
        );
        console.log(updatedDates);
        setTempLanDates(updatedDates);
    }

    // Removing a date from the list when the trash icon is pressed
    function removeDate(index: number) {
        const updatedDates = tempLanDates.filter((_, i) => i !== index);
        setTempLanDates(updatedDates);
    }

    // Adding a new date to the list when the add button is pressed
    function addDate() {
        // Add a new date with current time as start and end time
        const newDate = { startDate: new Date(), endDate: new Date() };
        // Update the selected product with the new date
        setTempLanDates(prev => {
            // If no previous state, return early
            if (!prev) return prev;
            // Update the product with the new date
            return [...prev, newDate];
        });
    }

    // Handles form submission when user makes changes to the LAN dates
    function HandleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the page from reloading
        event.preventDefault();

        // Saves the submitted form as a FormData object
        const form = new FormData(event.target as HTMLFormElement);

        // Get all LAN dates from the form
        // Each LAN date has a start and end date input field
        let updatedLanDates: LanDatesType[] = [];
        form.getAll("date_index").forEach((indexStr) => {
            const index = Number(indexStr);
            const startDateStr = form.get(`startDate_${index}`) as string;
            const endDateStr = form.get(`endDate_${index}`) as string;
            if (startDateStr && endDateStr) {
                const startDate: Date = new Date(startDateStr);
                let endDate: Date = new Date(endDateStr);
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    // Invalid date, skip this date
                    return;
                } else if (endDate < startDate) {
                    // End date is before or equal to start date, skip this date
                    endDate = startDate;
                }
                updatedLanDates.push({
                    startDate: startDate,
                    endDate: endDate
                });
            }
        });

        // Update the database with the new LAN dates
        UpdateLanDates(updatedLanDates, setLanDates);
        // Close the modal after saving
        setModalVisible(false);
    }

    return (
        <form className="lan-dates-modal-form" onSubmit={HandleFormSubmit} onKeyDown={e => e.key === 'Enter' && e.preventDefault()}>
            <div className="lan-dates-modal">
                {tempLanDates.map((ts, index) => (
                    <div key={index} className="lan-date-row">
                        <input name="date_index" type="hidden" value={index} />
                        <input
                            type="date"
                            value={formatDate(ts.startDate, 'date')}
                            onChange={(e) => updateDate(index, 'startDate', e.target.value)}
                            name={`startDate_${index}`}
                        />
                        <span>→</span>
                        <input
                            type="date"
                            value={formatDate(ts.endDate, 'date')}
                            onChange={(e) => updateDate(index, 'endDate', e.target.value)}
                            name={`endDate_${index}`}
                        />
                        <Trash className="remove-lan-date" onClick={() => removeDate(index)} />
                    </div>
                ))}
            </div>
            <button type="button" className="add-lan-date" onClick={addDate}><Plus /> Tilføj LAN datoer</button>
            <div className="modal-buttons">
                <button type="submit" className="save-button">Gem</button>
                <button type="button" className="cancel-button" onClick={() => setModalVisible(false)}>Annuller</button>
            </div>
        </form>
    );
}