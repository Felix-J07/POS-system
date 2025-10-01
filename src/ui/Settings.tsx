import { ExportDatabase, ImportDatabase } from './database.ts';

// Settings component NOT DONE
// Exporting database as a .db file to a user-specified location
// Importing database from the .exe's directory (Overwrites current database) NOT DONE
// Future settings: Change login credentials, add users, add LAN dates, anything else?
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