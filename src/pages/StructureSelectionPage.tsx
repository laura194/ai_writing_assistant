
const StructureSelectionPage = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            {/* Container mit drei Buttons */}
            <div className="flex flex-col space-y-4">
                <button
                    onClick={() => alert("Story-for-Explanation Pattern (IMRaD) ausgewählt")} // Platzhalter
                    className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
                >
                    Story-for-Explanation Pattern (IMRaD)
                </button>

                <button
                    onClick={() => alert("Story-for-Design Pattern ausgewählt")} // Platzhalter
                    className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
                >
                    Story-for-Design Pattern
                </button>

                <button
                    onClick={() => alert("Create structure from scratch ausgewählt")} // Platzhalter
                    className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
                >
                    Create structure from scratch
                </button>
            </div>
        </div>
    );
};

export default StructureSelectionPage;