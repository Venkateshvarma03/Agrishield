import { useState } from "react";
import NearbyStorage from "../components/NearbyStorage";
import MyBookings from "../components/MyBookings";

function StorageBookingPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <NearbyStorage refreshKey={refreshKey} onChange={refresh} />
      <MyBookings refreshKey={refreshKey} onChange={refresh} />
    </div>
  );
}

export default StorageBookingPage;