import { ExportDatabase } from './database.ts';

function Settings() {
    return (
        <div>
            <button onClick={exportDatabase}>Eksporter Database</button>
        </div>
    );
}

function exportDatabase() {
    ExportDatabase();
}

export default Settings;