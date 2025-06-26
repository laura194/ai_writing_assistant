import React, { useEffect, useState } from "react";
import axios from "axios";
import { IAiProtocolEntry } from "../models/IAITypes";
import { useParams } from "react-router-dom";

const truncateText = (text: string, maxLength = 100) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const AIProtocolCard: React.FC = () => {
  const [protocols, setProtocols] = useState<IAiProtocolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assuming you have projectId in the user object or you can fetch it from another source
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        if (!projectId) {
          throw new Error("Project ID is missing");
        }
        const response = await axios.get<IAiProtocolEntry[]>(
          "/api/ai/aiProtocol",
          {
            params: { projectId },
          },
        );

        setProtocols(response.data);
      } catch (err) {
        console.error(err);
        setError("Error while fetching protocols.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProtocols();
    } else {
      setError("Project ID is required.");
      setLoading(false);
    }
  }, [projectId]);

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-gray-200">
      <h2 className="text-lg font-bold mb-4">AI Protocol</h2>
      {loading ? (
        <p>Loading Protocols...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : protocols.length === 0 ? (
        <p className="text-gray-600">
          No entries have been created in the AI protocol yet.
        </p>
      ) : (
        <div className="relative max-h-150 overflow-y-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Usage</th>
                <th className="text-left px-4 py-2">Affected sections</th>
                <th className="text-left px-4 py-2">Notes</th>
                <th className="text-left px-4 py-2">Created at</th>
                <th className="text-left px-4 py-2">Updated at</th>
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
                  <td className="px-4 py-2">
                    {protocol.createdAt
                      ? new Date(protocol.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {protocol.updatedAt
                      ? new Date(protocol.updatedAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
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
