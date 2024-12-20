import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import {
  setLoading,
  setError,
  setUser,
  clearError,
} from "../../slices/authSlice";
import { signUp, SignUpRepresentative } from "../../services/operations/authServices";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

const specialtyOptions = [
  { value: 'sales', label: 'Sales Representative' },
  { value: 'customer_service', label: 'Customer Service Representative' },
  { value: 'technical_support', label: 'Technical Support Representative' },
  { value: 'account_management', label: 'Account Management Representative' },
  { value: 'product_specialist', label: 'Product Specialist' }
];

const roleOptions = [
  { value: 'Sales Representative', label: 'Sales Representative' },
  { value: 'Admin', label: 'Admin' }
];

export default function SignUp() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  
  const selectedRole = watch("role");
  const isRepresentative = selectedRole?.value === "Sales Representative";

  const roleMapping = {
    "Sales Representative": "Representative",
    "Admin": "Admin",
  };

  useEffect(() => {
    if (token) {
      navigate(`/dashboard/*`);
    }
    return () => {
      dispatch(clearError());
    };
  }, [token, navigate, dispatch]);

  const onSubmit = async (data) => {
    try {
      const mappedRole = roleMapping[data.role.value];
      const payload = {
        name: data.username,
        email: data.email,
        password: data.password,
        role: mappedRole,
        ...(isRepresentative && { operations: data.specialty.value })
      };

      dispatch(setLoading(true));
      dispatch(clearError());
      
      // console.log("Submitting payload:", payload);
      
      let response;
      if (isRepresentative) {
        response = await dispatch(SignUpRepresentative(payload));
      } else {
        response = await dispatch(signUp(payload));
      }
      
      // console.log("Signup Response:", response);
      
      if (response) {
        toast.success("Account created successfully!");
        dispatch(setUser(response));
        navigate("/dashboard");
      } else {
        throw new Error("No response received from server");
      }

    } catch (err) {
      console.error("SIGN-UP ERROR CAUGHT IN COMPONENT:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "Registration failed";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-purple-600 mb-4">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="mt-1 block w-full h-12 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={roleOptions}
                  placeholder="Select Role"
                  className="mt-1"
                />
              )}
            />
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {isRepresentative && (
            <div>
              <Controller
                name="specialty"
                control={control}
                rules={{ required: "Specialty is required for representatives" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={specialtyOptions}
                    placeholder="Select Specialty"
                    className="mt-1"
                  />
                )}
              />
              {errors.specialty && (
                <p className="mt-1 text-sm text-red-500">{errors.specialty.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors duration-200"
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}