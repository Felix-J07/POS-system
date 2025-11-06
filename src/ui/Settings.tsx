import { ExportDatabase, ImportDatabase } from './database.ts';
import { Modal } from './modal.tsx';
import { useState } from 'react';
import { LanDatesModal } from './lan_dates_modal.tsx';

type SettingsProps = {
    lanDates: LanDatesType[];
    setLanDates: React.Dispatch<React.SetStateAction<LanDatesType[]>>;
};

// Settings component NOT DONE
// Exporting database as a .db file to a user-specified location
// Importing database from the .exe's directory (Overwrites current database) NOT DONE
// Future settings: Change login credentials, add users, add LAN dates, anything else?
function Settings({lanDates, setLanDates}: SettingsProps) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <div>
                <button onClick={ExportDatabase}>Eksporter Database</button>
            </div>
            <div>
                <button onClick={ImportDatabase}>Importer Database</button>
            </div>
            <div>
                <button onClick={() => setModalVisible(true)}>LAN datoer</button>
            </div>
            {modalVisible && (<Modal setModalVisible={setModalVisible} modal_content={<LanDatesModal lanDates={lanDates} setLanDates={setLanDates} setModalVisible={setModalVisible} />} title="LAN Datoer" />)}
        </>
    );
}

export default Settings;