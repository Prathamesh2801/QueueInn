import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QueueTable from "./QueueTable";
import { getHotelTableDetails } from "../../api/HotelAdmin/HotelTableAPI";
import { Building2 } from "lucide-react";

export default function HS_Dashboard() {
  const navigate = useNavigate();
  const [tableType, setTableType] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      if (!tableType) {
        setTables([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getHotelTableDetails({ TableType: tableType });
        if (data.Status) {
          setTables(data.Data);
        } else {
          setTables([]);
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
        setTables([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTables();
  }, [tableType]);

  const selectedTableObj = tables.find(
    (t) => t.SR_NO?.toString() === selectedTable
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="text-center sm:text-left w-full">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Hotel Table Dashboard
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage your restaurant queue efficiently</p>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Table Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Table Type</label>
              <select
                value={tableType}
                onChange={(e) => {
                  setTableType(e.target.value);
                  setSelectedTable("");
                }}
                className="w-full p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Table Type</option>
                <option value="AC">🌡️ AC Tables</option>
                <option value="NON-AC">🌬️ Non-AC Tables</option>
              </select>
            </div>

            {/* Table Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Select Table</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                disabled={!tableType || loading}
                className="w-full p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading ? "Loading tables..." : "-- Select a Table --"}
                </option>
                {tables.map((table) => (
                  <option key={table.SR_NO} value={table.SR_NO}>
                    🪑 Table  • Size: {table.TableSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Table Details */}
          {selectedTable && selectedTableObj && (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Selected Table Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Table Number</p>
                  <p className="font-semibold text-blue-400">#{selectedTableObj.SR_NO}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Capacity</p>
                  <p className="font-semibold">{selectedTableObj.TableSize} people</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-semibold">
                    {selectedTableObj.TableType === 'AC' ? '🌡️ AC' : '🌬️ Non-AC'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="font-semibold text-green-400">
                    {new Date(selectedTableObj.Created_At).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Queue Table */}
        <div className="w-full">
          {selectedTableObj ? (
            <QueueTable
              tableType={selectedTableObj.TableType}
              tableSize={selectedTableObj.TableSize}
            />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a table to view the queue</p>
              <p className="text-sm mt-2">Choose a table type and specific table to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}