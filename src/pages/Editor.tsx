import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Editor.css"; // CSS Datei für den Editor

/**
 * Editor Seite für das leere Projekt.
 * Hier können Kapitel und Unterkapitel hinzugefügt, benannt und gelöscht werden.
 */
function Editor() {
    const [chapters, setChapters] = useState<{ id: string; name: string; subChapters: { id: string; name: string }[] }[]>([]);
    const navigate = useNavigate();

    // Funktion zum Hinzufügen eines Kapitels
    const addChapter = () => {
        const newChapter = {
            id: Date.now().toString(),
            name: "Neues Kapitel",
            subChapters: [],
        };
        setChapters([...chapters, newChapter]);
    };

    // Funktion zum Löschen eines Kapitels
    const deleteChapter = (chapterId: string) => {
        setChapters(chapters.filter((chapter) => chapter.id !== chapterId));
    };

    // Funktion zum Hinzufügen eines Unterkapitels
    const addSubChapter = (chapterId: string) => {
        const newSubChapter = {
            id: Date.now().toString(),
            name: "Neues Unterkapitel",
        };
        setChapters(
            chapters.map((chapter) =>
                chapter.id === chapterId
                    ? { ...chapter, subChapters: [...chapter.subChapters, newSubChapter] }
                    : chapter
            )
        );
    };

    // Funktion zum Löschen eines Unterkapitels
    const deleteSubChapter = (chapterId: string, subChapterId: string) => {
        setChapters(
            chapters.map((chapter) =>
                chapter.id === chapterId
                    ? {
                        ...chapter,
                        subChapters: chapter.subChapters.filter(
                            (subChapter) => subChapter.id !== subChapterId
                        ),
                    }
                    : chapter
            )
        );
    };

    // Funktion zum Umbenennen eines Kapitels
    const renameChapter = (chapterId: string, newName: string) => {
        setChapters(
            chapters.map((chapter) =>
                chapter.id === chapterId ? { ...chapter, name: newName } : chapter
            )
        );
    };

    // Funktion zum Umbenennen eines Unterkapitels
    const renameSubChapter = (chapterId: string, subChapterId: string, newName: string) => {
        setChapters(
            chapters.map((chapter) =>
                chapter.id === chapterId
                    ? {
                        ...chapter,
                        subChapters: chapter.subChapters.map((subChapter) =>
                            subChapter.id === subChapterId
                                ? { ...subChapter, name: newName }
                                : subChapter
                        ),
                    }
                    : chapter
            )
        );
    };

    return (
        <div className="editor-container">
            <h1>Leeres Projekt - Kapitel hinzufügen</h1>

            <div className="chapter-list">
                {chapters.map((chapter) => (
                    <div key={chapter.id} className="chapter">
                        <div className="chapter-header">
                            <input
                                type="text"
                                value={chapter.name}
                                onChange={(e) => renameChapter(chapter.id, e.target.value)}
                                className="chapter-name-input"
                            />
                            <button
                                className="delete-chapter-button"
                                onClick={() => deleteChapter(chapter.id)}
                            >
                                Löschen
                            </button>
                        </div>
                        <div className="sub-chapters">
                            {chapter.subChapters.map((subChapter) => (
                                <div key={subChapter.id} className="sub-chapter">
                                    <input
                                        type="text"
                                        value={subChapter.name}
                                        onChange={(e) =>
                                            renameSubChapter(chapter.id, subChapter.id, e.target.value)
                                        }
                                        className="sub-chapter-name-input"
                                    />
                                    <button
                                        className="delete-sub-chapter-button"
                                        onClick={() => deleteSubChapter(chapter.id, subChapter.id)}
                                    >
                                        Löschen
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="add-sub-chapter-button"
                            onClick={() => addSubChapter(chapter.id)}
                        >
                            Unterkapitel hinzufügen
                        </button>
                    </div>
                ))}
            </div>

            <button className="add-chapter-button" onClick={addChapter}>
                Kapitel hinzufügen
            </button>

            <button className="save-project-button" onClick={() => navigate("/project-selection")}>
                Projekt speichern
            </button>
        </div>
    );
}

export default Editor;
