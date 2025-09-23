import { ExportDatabase, ImportDatabase } from './database.ts';

function Settings() {
    return (
        <>
            <div>
                <button onClick={exportDatabase}>Eksporter Database</button>
            </div>
            <div>
                <button onClick={ImportDatabase}>Importer Database</button>
            </div>
        </>
    );
}

function exportDatabase() {
    ExportDatabase();
}

export default Settings;