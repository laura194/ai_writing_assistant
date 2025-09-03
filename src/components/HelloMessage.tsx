import { useEffect, useState } from "react";

const HelloMessage = () => {
  const [message, setMessage] = useState<string>("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  useEffect(() => {
    fetch(API_BASE_URL + "/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Fehler beim Laden der Nachricht:", err);
        setMessage("Fehler beim Abrufen der Nachricht");
      });
  }, []);

  return (
    <div>
      <h2>Nachricht vom Server:</h2>
      <p>{message || "Lade..."}</p>
    </div>
  );
};

export default HelloMessage;
