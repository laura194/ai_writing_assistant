import React, { useEffect, useState } from "react";
import axios from "axios";
import { IAiProtocolEntry } from "../models/IAITypes";

const truncateText = (text: string, maxLength = 300) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const AIProtocolCard: React.FC = () => {
  const [protocols, setProtocols] = useState<IAiProtocolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const response =
          await axios.get<IAiProtocolEntry[]>("/api/ai/aiProtocol");
        setProtocols(response.data);
      } catch (err) {
        setError("Error while fetching protocols.");
      } finally {
        setLoading(false);
      }
    };

    fetchProtocols();
  }, []);

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <h2 className="text-lg font-bold mb-4">AI Protocol</h2>
      {loading ? (
        <p>Loading Protocols...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="relative max-h-200 overflow-y-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Usage</th>
                <th className="text-left px-4 py-2">Affected sections</th>
                <th className="text-left px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((protocol) => (
                <tr key={protocol._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{truncateText(protocol.aiName)}</td>
                  <td className="px-4 py-2">
                    {truncateText(protocol.usageForm)}
                  </td>
                  <td className="px-4 py-2">
                    {truncateText(protocol.affectedParts)}
                  </td>
                  <td className="px-4 py-2">
                    {truncateText(protocol.remarks)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AIProtocolCard;
