const VerifyOtp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Verify OTP
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Verify
        </button>

      </div>
    </div>
  );
};

export default VerifyOtp;
