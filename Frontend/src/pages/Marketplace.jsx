import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const formatDate = (d) => new Date(d).toLocaleDateString("en-IN");

const emptyListing = { cropName: "", quantityQuintals: "", askingPrice: "", location: "", description: "" };
const emptyOffer = { pricePerQuintal: "", quantityQuintals: "", message: "" };

const statusStyle = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-gray-200 text-gray-600",
  Open: "bg-blue-100 text-blue-700",
  Sold: "bg-gray-200 text-gray-600",
};

function Badge({ status }) {
  return (
    <span className={`${statusStyle[status] || "bg-gray-100 text-gray-600"} px-3 py-1 rounded-full text-xs font-medium`}>
      {status}
    </span>
  );
}

function Marketplace() {
  const [tab, setTab] = useState("browse");
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myOffers, setMyOffers] = useState([]);

  const [showListingForm, setShowListingForm] = useState(false);
  const [listingForm, setListingForm] = useState(emptyListing);

  const [offerTarget, setOfferTarget] = useState(null);
  const [offerForm, setOfferForm] = useState(emptyOffer);

  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { "Content-Type": "application/json", ...authHeaders };

  const load = (path, setter) =>
    fetch(`http://localhost:5000/api/${path}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setter(Array.isArray(data) ? data : []));

  const loadAll = () => {
    load("listings", setListings);
    load("my-listings", setMyListings);
    load("my-offers", setMyOffers);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const pendingCount = myListings.reduce(
    (sum, l) => sum + l.offers.filter((o) => o.status === "Pending").length,
    0
  );

  // ----- create listing -----
  const submitListing = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    fetch("http://localhost:5000/api/listings", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(listingForm),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.listing) {
          setShowListingForm(false);
          setListingForm(emptyListing);
          loadAll();
        } else {
          setError(data.message || "Could not create listing");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setSubmitting(false));
  };

  // ----- send offer -----
  const submitOffer = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    fetch(`http://localhost:5000/api/listings/${offerTarget._id}/offers`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(offerForm),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.offer) {
          setOfferTarget(null);
          setOfferForm(emptyOffer);
          loadAll();
          setTab("offers");
        } else {
          setError(data.message || "Could not send offer");
        }
      })
      .catch(() => setError("Could not reach the server"))
      .finally(() => setSubmitting(false));
  };

  // ----- seller / buyer actions -----
  const act = (id, request) => {
    if (busyId) return;
    setBusyId(id);
    request().then(() => loadAll()).finally(() => setBusyId(null));
  };

  const respond = (offerId, decision) =>
    act(offerId, () =>
      fetch(`http://localhost:5000/api/offers/${offerId}/respond`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ decision }),
      })
    );

  const withdrawOffer = (offerId) =>
    act(offerId, () =>
      fetch(`http://localhost:5000/api/offers/${offerId}`, { method: "DELETE", headers: authHeaders })
    );

  const removeListing = (listingId) =>
    act(listingId, () =>
      fetch(`http://localhost:5000/api/listings/${listingId}`, { method: "DELETE", headers: authHeaders })
    );

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";

  const tabClass = (name) =>
    `px-4 py-2 text-sm font-medium rounded-lg ${
      tab === name ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-gray-800 text-lg">Marketplace</p>
        <button
          onClick={() => {
            setShowListingForm(true);
            setError("");
          }}
          className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-medium"
        >
          + Post a Listing
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("browse")} className={tabClass("browse")}>Browse</button>
        <button onClick={() => setTab("listings")} className={tabClass("listings")}>
          My Listings
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {pendingCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab("offers")} className={tabClass("offers")}>My Offers</button>
      </div>

      {/* ---------- Browse ---------- */}
      {tab === "browse" &&
        (listings.length === 0 ? (
          <p className="text-sm text-gray-500">No open listings right now.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {listings.map((l) => (
              <div key={l._id} className="border border-gray-200 rounded-xl p-5">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                  <ShoppingCart className="text-green-600" size={20} />
                </div>
                <p className="font-medium text-gray-800">{l.cropName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {l.quantityQuintals} quintals • {l.location}
                </p>
                <p className="text-sm text-gray-800 mt-2">
                  {rupees(l.askingPrice)} <span className="text-xs text-gray-500">per quintal</span>
                </p>
                {l.description && <p className="text-xs text-gray-500 mt-2">{l.description}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  Seller: {l.sellerName} • {formatDate(l.createdAt)}
                </p>

                {l.isMine ? (
                  <span className="block text-center text-sm text-gray-500 bg-gray-100 py-2 rounded-lg mt-4">
                    Your listing
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setOfferTarget(l);
                      setOfferForm({ ...emptyOffer, pricePerQuintal: l.askingPrice });
                      setError("");
                    }}
                    className="w-full mt-4 bg-green-600 text-white text-sm py-2 rounded-lg font-medium"
                  >
                    Make Offer
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* ---------- My Listings ---------- */}
      {tab === "listings" &&
        (myListings.length === 0 ? (
          <p className="text-sm text-gray-500">You have not posted any listings yet.</p>
        ) : (
          <div className="space-y-4">
            {myListings.map((l) => (
              <div key={l._id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {l.cropName} — {l.quantityQuintals} quintals
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Asking {rupees(l.askingPrice)} per quintal • {l.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={l.status} />
                    <button
                      onClick={() => removeListing(l._id)}
                      disabled={busyId === l._id}
                      className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {l.offers.length === 0 ? (
                  <p className="text-xs text-gray-400 mt-4">No offers yet.</p>
                ) : (
                  <table className="min-w-full text-left mt-4">
                    <thead>
                      <tr className="bg-gray-100 text-xs text-gray-500">
                        <th className="px-3 py-2 font-medium">Buyer</th>
                        <th className="px-3 py-2 font-medium">Price</th>
                        <th className="px-3 py-2 font-medium">Quantity</th>
                        <th className="px-3 py-2 font-medium">Message</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {l.offers.map((o) => (
                        <tr key={o._id} className="border-t text-sm">
                          <td className="px-3 py-2">{o.buyer?.name ?? "Unknown"}</td>
                          <td className="px-3 py-2">{rupees(o.pricePerQuintal)}</td>
                          <td className="px-3 py-2">{o.quantityQuintals} q</td>
                          <td className="px-3 py-2 text-gray-500">{o.message || "—"}</td>
                          <td className="px-3 py-2"><Badge status={o.status} /></td>
                          <td className="px-3 py-2">
                            {o.status === "Pending" && l.status === "Open" ? (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => respond(o._id, "accept")}
                                  disabled={busyId === o._id}
                                  className="text-green-600 text-xs font-medium hover:underline disabled:text-gray-400"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respond(o._id, "reject")}
                                  disabled={busyId === o._id}
                                  className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* ---------- My Offers ---------- */}
      {tab === "offers" &&
        (myOffers.length === 0 ? (
          <p className="text-sm text-gray-500">You have not made any offers yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Crop</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Asking</th>
                <th className="px-4 py-3 font-medium">My Offer</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {myOffers.map((o) => (
                <tr key={o._id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">{o.listing?.cropName ?? "Removed"}</td>
                  <td className="px-4 py-3">{o.listing?.location ?? "—"}</td>
                  <td className="px-4 py-3">{o.listing ? rupees(o.listing.askingPrice) : "—"}</td>
                  <td className="px-4 py-3">{rupees(o.pricePerQuintal)}</td>
                  <td className="px-4 py-3">{o.quantityQuintals} q</td>
                  <td className="px-4 py-3"><Badge status={o.status} /></td>
                  <td className="px-4 py-3">
                    {o.status === "Pending" ? (
                      <button
                        onClick={() => withdrawOffer(o._id)}
                        disabled={busyId === o._id}
                        className="text-red-500 text-xs font-medium hover:underline disabled:text-gray-400"
                      >
                        Withdraw
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

      {/* ---------- Post listing modal ---------- */}
      {showListingForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={submitListing} className="bg-white rounded-xl p-6 w-96 space-y-4">
            <p className="font-semibold text-gray-800 text-lg">Post a Listing</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              placeholder="Crop (e.g. Paddy)"
              value={listingForm.cropName}
              onChange={(e) => setListingForm({ ...listingForm, cropName: e.target.value })}
              required
              className={inputClass}
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity in quintals"
              value={listingForm.quantityQuintals}
              onChange={(e) => setListingForm({ ...listingForm, quantityQuintals: e.target.value })}
              required
              className={inputClass}
            />
            <input
              type="number"
              min="1"
              placeholder="Asking price (₹ per quintal)"
              value={listingForm.askingPrice}
              onChange={(e) => setListingForm({ ...listingForm, askingPrice: e.target.value })}
              required
              className={inputClass}
            />
            <input
              placeholder="Location"
              value={listingForm.location}
              onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })}
              required
              className={inputClass}
            />
            <input
              placeholder="Description (optional)"
              value={listingForm.description}
              onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
              className={inputClass}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowListingForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium disabled:bg-gray-400"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Make offer modal ---------- */}
      {offerTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={submitOffer} className="bg-white rounded-xl p-6 w-96 space-y-4">
            <div>
              <p className="font-semibold text-gray-800 text-lg">Make an Offer</p>
              <p className="text-sm text-gray-500">
                {offerTarget.cropName} • {offerTarget.quantityQuintals} quintals available •
                asking {rupees(offerTarget.askingPrice)}
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="number"
              min="1"
              placeholder="Your price (₹ per quintal)"
              value={offerForm.pricePerQuintal}
              onChange={(e) => setOfferForm({ ...offerForm, pricePerQuintal: e.target.value })}
              required
              className={inputClass}
            />
            <input
              type="number"
              min="1"
              max={offerTarget.quantityQuintals}
              placeholder="Quantity in quintals"
              value={offerForm.quantityQuintals}
              onChange={(e) => setOfferForm({ ...offerForm, quantityQuintals: e.target.value })}
              required
              className={inputClass}
            />
            <input
              placeholder="Message (optional)"
              value={offerForm.message}
              onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
              className={inputClass}
            />

            {offerForm.pricePerQuintal && offerForm.quantityQuintals && (
              <p className="text-sm text-gray-600">
                Total offer:{" "}
                <span className="font-medium text-gray-800">
                  {rupees(Number(offerForm.pricePerQuintal) * Number(offerForm.quantityQuintals))}
                </span>
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOfferTarget(null)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium disabled:bg-gray-400"
              >
                {submitting ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Marketplace;