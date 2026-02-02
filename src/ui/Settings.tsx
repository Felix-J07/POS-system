import { ExportDatabase, ImportDatabase } from './database.ts';
import { Modal } from './modal.tsx';
import { useEffect, useState, type JSX } from 'react';
import { LanDatesModal } from './lan_dates_modal.tsx';
import { ExpensesModal } from './ExpensesModal.tsx';
import { UserAdmin } from './UserAdmin.tsx';
import Login from "./Login.tsx";

type SettingsProps = {
    lanDates: LanDatesType[];
    setLanDates: React.Dispatch<React.SetStateAction<LanDatesType[]>>;
};

// TODO: expenses

// Settings component NOT DONE
// Exporting database as a .db file to a user-specified location
// Importing database from the .exe's directory (Overwrites current database) NOT DONE
// Future settings: Change login credentials, add users, add LAN dates, anything else?
function Settings({lanDates, setLanDates}: SettingsProps) {
    // Changes the main-container minWidth based on the page
    useEffect(() => {
        const element = document.querySelector(".main-container");
        if (element instanceof HTMLElement) {
            element.style.minWidth = "300px";
        }
    
        return () => {
            if (element instanceof HTMLElement) {
            element.style.minWidth = ""; // clean up on unmount
            }
        };
    }, []);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element | false>(false);

    function handleRestrictedAccess(modal_content: JSX.Element) {
        setModalVisible(true);
        setModalContent(
            <Login 
                setLogged_in={(loggedIn) => {
                    if (loggedIn) {
                        setModalContent(modal_content);
                    }
                }} 
            />
        );
    }

    return (
        <>
            <div>
                <button onClick={ExportDatabase}>Eksporter Database</button>
            </div>
            <div>
                <button onClick={ImportDatabase}>Importer Database</button>
            </div>
            <div>
                <button onClick={() => {setModalVisible(true); setModalContent(<LanDatesModal lanDates={lanDates} setLanDates={setLanDates} setModalVisible={setModalVisible} />);}}>LAN datoer</button>
            </div>
            <div>
                <button onClick={() => {setModalVisible(true); setModalContent(<ExpensesModal lanDates={lanDates} />)}}>Udgifter</button>
            </div>
            <div>
                <button onClick={() => handleRestrictedAccess(<UserAdmin />)}>Brugeradministation til login</button>
            </div>
            {modalVisible && modalContent && (<Modal setModalVisible={setModalVisible} modal_content={modalContent} title="LAN Datoer" />)}
        </>
    );
}

export default Settings;