import React, { useEffect, useState } from "react";
import axios from "axios";
import { IAiProtocolEntry } from "../models/IAITypes";
import { useParams } from "react-router-dom";
import { FunnelIcon } from "@heroicons/react/24/outline";

const truncateText = (text: string, maxLength = 100) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const AIProtocolCard: React.FC = () => {
  const [protocols, setProtocols] = useState<IAiProtocolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  // Assuming you have projectId in the user object or you can fetch it from another source
  const { projectId } = useParams<{ projectId: string }>();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        if (!projectId) {
          throw new Error("Project ID is missing");
        }
        const response = await axios.get<IAiProtocolEntry[]>(
          API_BASE_URL + "/api/ai/aiProtocol",
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
  }, [projectId, API_BASE_URL]);

  // Filter logic
  const filteredProtocols = protocols.filter((protocol) => {
    const search = filter.toLowerCase();
    return (
      protocol.aiName?.toLowerCase().includes(search) ||
      protocol.usageForm?.toLowerCase().includes(search) ||
      protocol.affectedParts?.toLowerCase().includes(search) ||
      protocol.remarks?.toLowerCase().includes(search) ||
      (protocol.createdAt &&
        new Date(protocol.createdAt)
          .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
          .toLowerCase()
          .includes(search)) ||
      (protocol.updatedAt &&
        new Date(protocol.updatedAt)
          .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
          .toLowerCase()
          .includes(search))
    );
  });

  return (
    <div className="relative flex flex-col h-full p-6 rounded-3xl bg-[#e9e5f8] dark:bg-[#1e1538]">
      <h2 className="text-3xl font-bold inline-block tracking-wide mb-6">
        AI Protocol
        <div className="h-1 mt-1.5 w-[166px] bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full" />
      </h2>

      <div className="relative mb-4">
        <span className="absolute top-3 left-0 flex items-center pl-3 pointer-events-none text-[#9a8db1] dark:text-[#787086]">
          <FunnelIcon className="h-5 w-5" />
        </span>
        <input
          type="text"
          placeholder="Filter the protocol by typing a keyword"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-6 py-2 rounded-lg bg-[#e1dcf8] dark:bg-[#2f214d] text-[#261e3b] dark:text-white placeholder-[#9a8db1] dark:placeholder-[#787086] border-2 border-[#beb5e4] dark:border-[#3e316e] focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 transition duration-200"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-700 dark:text-gray-400 text-center text-3xl">
            Loading Protocols...
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 dark:text-red-400 text-center text-3xl">
            {error}
          </p>{" "}
        </div>
      ) : filteredProtocols.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-[#9a8db1] dark:text-[#787086] text-center text-3xl">
            No entries have been created in the AI protocol yet.
          </p>
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-xl border-2 border-[#beb5e4] dark:border-[#3e316e]">
          <table className="min-w-full text-m text-center text-[#595996] dark:text-[#d4d4f2]">
            <thead className="sticky top-0 bg-[#e1dcf8] dark:bg-[#2f214d] text-[#261e3b] dark:text-[#ffffff] z-10 text-m">
              <tr>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Usage</th>
                <th className="px-3 py-3 font-semibold">Affected sections</th>
                <th className="px-3 py-3 font-semibold">Notes</th>
                <th className="px-3 py-3 font-semibold">Created at</th>
                <th className="px-3 py-3 font-semibold">Updated at</th>
              </tr>
            </thead>
            <tbody>
              {filteredProtocols.map((protocol) => (
                <tr
                  key={protocol._id}
                  className="hover:bg-[#d3ccf4]/40 dark:hover:bg-[#3b2a5e]/60 transition border-b border-[#beb5e4] dark:border-[#3e316e]"
                >
                  <td className="px-3 py-3">{truncateText(protocol.aiName)}</td>
                  <td className="px-3 py-3">
                    {truncateText(protocol.usageForm)}
                  </td>
                  <td className="px-3 py-3">
                    {truncateText(protocol.affectedParts)}
                  </td>
                  <td className="px-3 py-3">
                    {truncateText(protocol.remarks)}
                  </td>
                  <td className="px-3 py-3">
                    {protocol.createdAt
                      ? new Date(protocol.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-3 py-3">
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
