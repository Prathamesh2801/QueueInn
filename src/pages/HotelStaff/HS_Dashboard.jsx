import React, { useState, useEffect } from "react";
import { getHotelTableDetails } from "../../api/HotelAdmin/HotelTableAPI";
import QueueTable from "./QueueTable";

export default function HS_Dashboard() {
    const [tableType, setTableType] = useState(""); // Default value
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");

    // Fetch tables whenever tableType changes
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const data = await getHotelTableDetails({ TableType: tableType });
                if (data.Status) {
                    setTables(data.Data);
                } else {
                    setTables([]);
                }
            } catch (error) {
                console.error("Error fetching tables:", error);
            }
        };
        fetchTables();
    }, [tableType]);

    // find object for currently selected SR_NO
    const selectedTableObj = tables.find(
        (t) => t.SR_NO?.toString() === selectedTable
    );

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Hotel Table Dashboard</h1>

            {/* Dropdown for AC / NON-AC */}
            <div className="mb-4 w-full max-w-xs">
                <label className="block mb-2 text-sm font-medium">Table Type</label>
                <select
                    value={tableType}
                    onChange={(e) => setTableType(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                    <option value="">Select</option>
                    <option value="AC">AC</option>
                    <option value="NON-AC">NON-AC</option>
                </select>
            </div>

            {/* Dropdown for selecting SR_NO and TableSize */}
            <div className="mb-4 w-full max-w-xs">
                <label className="block mb-2 text-sm font-medium">Select Table</label>
                <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                    <option value="">-- Select a Table --</option>
                    {tables.map((table) => (
                        <option key={table.SR_NO} value={table.SR_NO}>
                            {`SR.${table.SR_NO} - Size: ${table.TableSize}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display selected table details */}
            {selectedTable && selectedTableObj && (
                <div className="mt-4 p-4 bg-gray-900 rounded shadow-md w-full max-w-xs">
                    <h2 className="font-semibold mb-2">Selected Table Details</h2>
                    <div>
                        <p>SR No: {selectedTableObj.SR_NO}</p>
                        <p>Size: {selectedTableObj.TableSize}</p>
                        <p>Type: {selectedTableObj.TableType}</p>
                        <p>Created At: {selectedTableObj.Created_At}</p>
                    </div>
                </div>
            )}

            {/* === HERE: render QueueTable and pass the selected table's type & size === */}
            {/* Only render when a table is selected. If you want to show data without selecting, you can render it with tableType and empty tableSize */}
            <div className="w-full max-w-4xl mt-6">
                {selectedTableObj ? (
                    <QueueTable
                        tableType={selectedTableObj.TableType}
                        tableSize={selectedTableObj.TableSize}
                    />
                ) : (
                    <div className="text-gray-400">Select a table to see the queue.</div>
                )}
            </div>
        </div>
    );
}
