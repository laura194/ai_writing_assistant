import { useEffect, useState } from "react";

const HelloMessage = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/hello")
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
