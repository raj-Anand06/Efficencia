import Note from './Note';
import AddNote from './AddNote';

const NotesList = ({
    notes,
    handleAddNote,
    handleDeleteNote,
}) => {
    return (
        <div className='notes-list'>
            {notes.map((note) => (
                <Note
                    key={note.id} // Don't forget to add a unique key prop
                    id={note.id}
                    text={note.text}
                    date={note.date}
                    handleDeleteNote={handleDeleteNote}
                />
            ))}
            <AddNote handleAddNote={handleAddNote} />
        </div>
    );
};

export default NotesList;
