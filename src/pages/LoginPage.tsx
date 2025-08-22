import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "../contexts/AuthContext";
import demoUser from "../data/user.json";

const BRAND = {
  primary: "#0A2647", // Navy
  light: "#F5F6FA",
  accent: "#F5B700", // Gold
  accentAlt: "#00A896", // Teal
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email === demoUser.username && password === demoUser.password) {
      login({ username: email });
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F6FA] p-4 font-sans">
      <div className="w-full max-w-md space-y-4">
        <Card className="rounded-2xl border-0 shadow-xl ring-1 ring-slate-100">
          <CardHeader className="flex flex-col items-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: BRAND.primary }}>
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-center text-2xl font-bold text-slate-900">Sign in to Virtual Office UK</CardTitle>
            <p className="text-sm text-slate-600">Access your dashboard and manage your services</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="rounded-xl bg-white"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl bg-white"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox id="remember" />
                  Remember me
                </label>
                <a href="#" className="text-sm font-medium text-[#0A2647] hover:underline">Forgot password?</a>
              </div>
              <Button type="submit" className="w-full rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00] h-11">Sign In</Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <a href="#" className="font-medium text-[#0A2647] hover:underline">Sign up</a>
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-xl ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Demo Account</CardTitle>
            <CardDescription>
              Use these credentials to log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm"><strong>Email:</strong> {demoUser.username}</p>
            <p className="text-sm"><strong>Password:</strong> {demoUser.password}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
