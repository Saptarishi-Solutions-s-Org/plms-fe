export default function OfferCard() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-300 bg-white">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-5">
        <h2 className="text-base font-semibold text-gray-800">Offer Assigned</h2>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
        <p className="text-sm text-gray-400">No offer assigned</p>
      </div>
    </div>
  );
}
