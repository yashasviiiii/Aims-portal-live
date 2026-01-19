const tabs = ["Pending Users", "All Users", "Help"];

export default function AdminNavbar({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">AIMS Admin Panel</h1>

      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-semibold ${
              activeTab === tab ? "underline" : "opacity-80 hover:opacity-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
