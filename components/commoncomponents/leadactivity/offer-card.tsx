export default function OfferCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Offer Assigned</h2>
      </div>
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-gray-400">No offer assigned</p>
      </div>
    </div>
  );
}
