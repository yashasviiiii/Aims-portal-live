const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Sign Up
        </h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Institute Email"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Send OTP
          </button>
        </form>

      </div>
    </div>
  );
};

export default Signup;
