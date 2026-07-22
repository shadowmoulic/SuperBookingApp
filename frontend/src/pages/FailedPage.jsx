import { useLocation, useNavigate } from "react-router-dom";

export default function FailedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { bookingReference } = location.state || {};

  const handleTryAgain = () => {
    if (bookingReference) {
      navigate(`/payment/${bookingReference}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mx-auto py-16 w-full relative bg-background">
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-['Inter']">
        <div className="bg-white w-full max-w-md rounded-3xl border border-gray-150 p-8 text-center shadow-lg animate-scale-in">

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] mb-6">
              <span className="material-symbols-outlined text-4xl">close</span>
            </div>
          </div>

          <h1 className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-gray-900 mb-3">
            Payment Failed
          </h1>

          <p className="text-gray-500 mb-6 leading-relaxed">
            Something went wrong while processing your payment transaction.
          </p>

          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-base leading-none mt-0.5">info</span>
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              Don't worry. If any amount was deducted from your account, it will be automatically refunded within 3-5 business days.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-['Hanken_Grotesk'] font-semibold hover:brightness-110 transition active:scale-95 cursor-pointer text-sm"
            >
              Try Again
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 border border-gray-250 py-3 rounded-lg font-['Hanken_Grotesk'] font-semibold hover:bg-gray-50 transition text-gray-705 active:scale-95 cursor-pointer text-sm"
            >
              Home
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}