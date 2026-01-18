const Login = () => {
  const role = localStorage.getItem("selectedRole");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Login
        </h2>

        {role && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Logging in as:{" "}
            <span className="font-semibold">
              {role.replace("_", " ")}
            </span>
          </p>
        )}

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Institute Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
};

export default Login;
