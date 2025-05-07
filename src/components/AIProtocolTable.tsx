import React, { useEffect, useState } from "react";
import axios from "axios";
import { IAiProtocol } from "../models/IAIProtocol";

const AiProtocolTable: React.FC = () => {
  const [protocols, setProtocols] = useState<IAiProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const response = await axios.get<IAiProtocol[]>("/api/ai/aiProtocol");
        setProtocols(response.data);
      } catch (err) {
        setError("Fehler beim Laden der Protokolle");
      } finally {
        setLoading(false);
      }
    };

    fetchProtocols();
  }, []);

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <h2 className="text-lg font-bold mb-4">Ki-Protokoll</h2>
      {loading ? (
        <p>Lade Protokolle...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Verwendungsform</th>
                <th className="text-left px-4 py-2">Betroffene Teile</th>
                <th className="text-left px-4 py-2">Bemerkungen</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((protocol) => (
                <tr key={protocol._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{protocol.aiName}</td>
                  <td className="px-4 py-2">{protocol.usageForm}</td>
                  <td className="px-4 py-2">{protocol.affectedParts}</td>
                  <td className="px-4 py-2">{protocol.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AiProtocolTable;
