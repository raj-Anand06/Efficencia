import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import NotesList from './NotesList';
import Search from './Search';


const NotesRender = () => {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const savedNotes = JSON.parse(localStorage.getItem('react-notes-app-data'));
        if (savedNotes && savedNotes.length) {
            setNotes(savedNotes);
        } else {
            setNotes([
                {
                    id: nanoid(),
                    text: 'This is my third note!',
                    date: '28/04/2021',
                },
                {
                    id: nanoid(),
                    text: 'This is my new note!',
                    date: '30/04/2021',
                }
            ]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('react-notes-app-data', JSON.stringify(notes));
    }, [notes]);

    const addNote = (text) => {
        const date = new Date();
        const newNote = {
            id: nanoid(),
            text: text,
            date: date.toLocaleDateString(),
        };
        setNotes(prevNotes => {
            const updatedNotes = [...prevNotes, newNote];
            console.log('Updated notes after add:', updatedNotes);
            return updatedNotes;
        });
    };

    const deleteNote = (id) => {
        setNotes(prevNotes => {
            const updatedNotes = prevNotes.filter(note => note.id !== id);
            console.log('Updated notes after delete:', updatedNotes);
            return updatedNotes;
        });
    };

    console.log('Current notes state:', notes);

    return (
        <>
            
            <div className='container1'>
                <Search handleSearchNote={(searchText) => console.log(searchText)} />
                <NotesList
                    notes={notes}
                    handleAddNote={addNote}
                    handleDeleteNote={deleteNote}
                />
            </div>
        </>
    );
};

export default NotesRender;