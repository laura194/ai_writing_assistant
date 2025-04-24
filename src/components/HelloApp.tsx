import React, { useState, useEffect } from "react";
import axios from "axios";

const HelloApp: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [plants, setPlants] = useState<any[]>([]);

  // Funktion zum Abrufen der Pflanzen von der API
  const fetchPlants = async () => {
    try {
      const response = await axios.get("/api/hello/plants");
      setPlants(response.data);
    } catch (error) {
      console.error("Fehler beim Abrufen der Pflanzen:", error);
    }
  };

  // Funktion zum Hinzufügen einer neuen Pflanze
  const addPlant = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("/api/hello/plant", { name, type });
      setName("");
      setType("");
      fetchPlants(); // Pflanzen nach dem Hinzufügen erneut abrufen
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Pflanze:", error);
    }
  };

  useEffect(() => {
    fetchPlants(); // Pflanzen beim ersten Laden abrufen
  }, []);

  return (
    <div>
      <h1>Plant App</h1>

      {/* Formular zum Hinzufügen einer Pflanze */}
      <form onSubmit={addPlant}>
        <input
          type="text"
          placeholder="Pflanzenname"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Pflanzentyp"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <button type="submit">Pflanze hinzufügen</button>
      </form>

      {/* Liste der Pflanzen */}
      <h2>Alle Pflanzen:</h2>
      <ul>
        {plants.length === 0 ? (
          <p>Keine Pflanzen gefunden</p>
        ) : (
          plants.map((plant) => (
            <li key={plant._id}>
              {plant.name} ({plant.type})
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default HelloApp;
