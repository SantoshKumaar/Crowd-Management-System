import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { SocketService } from "../../services/SocketService";
import { SitesService } from "../../services/SitesService";
import group from "../../assets/img/Group.png";
import topLeft from "../../assets/img/top-left.png";
import home from "../../assets/icons/Home.png";
import layer2 from "../../assets/icons/Layer 2.png";
import bell from "../../assets/icons/Bell.png";
import path52 from "../../assets/icons/path52.png";
import Icon from "../../assets/icons/Icon.png";
import {
  getCurrentSite,
  getStoredSites,
  setCurrentSite,
  setStoredSites,
} from "../../util/siteManager";group

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSiteState] = useState(null);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const storedSites = getStoredSites();
      const storedCurrentSite = getCurrentSite();

      if (storedSites.length > 0) {
        setSites(storedSites);
        setCurrentSiteState(storedCurrentSite);
      } else {
        fetchSites();
      }
    }
  }, [isAuthenticated]);

  const fetchSites = async () => {
    try {
      const response = await SitesService.getAllSites();
      const sitesData = response?.data || response || [];
      if (Array.isArray(sitesData) && sitesData.length > 0) {
        setStoredSites(sitesData);
        setSites(sitesData);
        const firstSite = getCurrentSite() || sitesData[0];
        setCurrentSite(firstSite);
        setCurrentSiteState(firstSite);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = SocketService.subscribeToAlerts((alertData) => {
      console.log("alert data->", alertData);
      // Handle different alert data structures
      const alert = {
        name: alertData.name || alertData.personName || "Unknown",
        zone:
          alertData.zone || alertData.zoneId || alertData.zoneName || "Unknown",
        severity: alertData.severity || alertData.priority || "low",
        actionType: alertData.actionType || alertData.action || "Entered",
        timestamp: alertData.timestamp || alertData.time || Date.now(),
        siteId: alertData.siteId,
        personId: alertData.personId,
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 20));
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      high: "bg-red-50 text-red-800",
      medium: "bg-orange-50 text-orange-700",
      low: "bg-green-50 text-green-700",
    };
    return priorityMap[priority?.toLowerCase()] || "bg-green-50 text-green-700";
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside
        className={`w-60 bg-teal-600 flex flex-col fixed top-0 bottom-0 left-0 z-[1000] shadow-[2px_0_8px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundImage: `url(${ group })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3 text-white">
            <img src={topLeft} alt="" />
          </div>
        </div>

        <nav className="flex-1 py-4 relative z-10 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-5 py-3.5 text-white/80 no-underline transition-all mx-3 my-1 rounded-lg ${
              isActive("/dashboard")
                ? "bg-white/20 text-white font-semibold"
                : "hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-lg w-6 text-center">
              <img src={home} alt="" />
            </span>
            <span className="text-[15px]">Overview</span>
          </Link>
          <Link
            to="/crowd-entries"
            className={`flex items-center gap-3 px-5 py-3.5 text-white/80 no-underline transition-all mx-3 my-1 rounded-lg ${
              isActive("/crowd-entries")
                ? "bg-white/20 text-white font-semibold"
                : "hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-lg w-6 text-center">
              <img src={layer2} alt="" />
            </span>
            <span className="text-[15px]">Crowd Entries</span>
          </Link>
        </nav>

        <div className="py-4 border-t border-white/10 relative z-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3.5 text-white/80 bg-transparent border-none w-full text-left cursor-pointer transition-all mx-3 my-1 rounded-lg text-[15px] hover:bg-white/10 hover:text-white"
          >
            <span className="text-lg w-6 text-center">
              <img src={path52} alt="" />
            </span>
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {/* Top Header */}
        <header className="bg-white h-16 flex items-center justify-between px-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)] sticky top-0 z-[100]">
          <div className="flex items-center gap-4">
            <button
              className="bg-transparent border-none text-2xl text-gray-800 cursor-pointer p-2 flex items-center justify-center rounded transition-colors w-10 h-10 hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              ☰
            </button>
            <div className="flex items-center gap-3 text-base font-semibold text-gray-800">
              <span>Crowd Solutions |</span>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-md cursor-pointer transition-colors text-sm text-gray-600 relative hover:bg-gray-200"
                onClick={() => setShowSiteDropdown(!showSiteDropdown)}
              >
                <span>
                  <img src={Icon} alt="" />
                </span>
                <span>{currentSite?.name || "Select Site"}</span>
                <span className="text-[10px] ml-1">▼</span>

                {/* Site Dropdown */}
                {showSiteDropdown && sites.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] min-w-[250px] max-h-[300px] overflow-y-auto z-[1000]">
                    {sites.map((site) => (
                      <div
                        key={site.siteId}
                        className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          currentSite?.siteId === site.siteId
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => {
                          setCurrentSite(site);
                          setCurrentSiteState(site);
                          setShowSiteDropdown(false);
                          window.location.reload();
                        }}
                      >
                        <div className="font-semibold text-gray-800 text-sm mb-1">
                          {site.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {site.city}, {site.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-100 border-none rounded-md text-sm text-gray-800 cursor-pointer transition-colors hover:bg-gray-200">
              En
            </button>
            <button
              className={`p-2 text-lg bg-transparent border-none relative cursor-pointer transition-colors hover:bg-gray-100 rounded ${
                alerts.length > 0
                  ? 'after:content-[""] after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-red-500 after:rounded-full after:border-2 after:border-white'
                  : ""
              }`}
              onClick={toggleAlerts}
              title={`${alerts.length} alert${alerts.length !== 1 ? "s" : ""}`}
            >
              <img src={bell} alt="" />
            </button>
            <div className="w-9 h-9 rounded-full bg-teal-500 text-white flex items-center justify-center font-semibold text-sm cursor-pointer transition-transform hover:scale-105">
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
          </div>

          {/* Alerts Dropdown */}
          {showAlerts && (
            <div className="absolute top-16 right-6 w-[400px] max-h-[500px] bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[1000] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gray-100">
                <h3 className="m-0 text-base font-semibold text-gray-800">
                  Alerts ({alerts.length})
                </h3>
                <button
                  className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-gray-200 hover:text-gray-800"
                  onClick={() => setShowAlerts(false)}
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {alerts.length === 0 ? (
                  <div className="text-center py-10 px-5 text-gray-400 text-sm">
                    No alerts at the moment
                  </div>
                ) : (
                  alerts.map((alert, index) => {
                    console.log("Layout: Rendering alert:", alert);
                    return (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg mb-2 bg-gray-50 transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-white flex flex-col gap-2"
                      >
                        <div className="text-[11px] text-gray-400">
                          {alert.timestamp
                            ? new Date(alert.timestamp).toLocaleString()
                            : "Just now"}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-semibold text-gray-800">
                            {alert.name || "Unknown"}{" "}
                            {alert.actionType || "Entered"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Zone {alert.zone || alert.zoneId || "Unknown"}
                          </div>
                        </div>
                        <div
                          className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase self-start ${getPriorityClass(
                            alert.severity || alert.priority
                          )}`}
                        >
                          {(
                            alert.severity ||
                            alert.priority ||
                            "Low"
                          ).toUpperCase()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
