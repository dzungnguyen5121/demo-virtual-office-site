import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Sidebar } from "../components/common/Sidebar";
import { Header } from "../components/common/Header";
import { Footer } from "../components/common/Footer";

export default function ProfilePage() {
  const user = { name: "Nguyễn Văn A", email: "nguyenvana@company.com", company: "Công ty ABC", dob: "1990-01-15", phone: "+44 20 7123 4567" };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F6FA] font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">
          <Header title="Profile" />
          <section id="profile" className="px-6 py-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Personal Info */}
              <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
                <CardHeader>
                  <CardTitle>Personal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Full Name" type="text" defaultValue={user.name} />
                  <Field label="Date of Birth" type="date" defaultValue={user.dob} />
                  <Field label="Company" type="text" defaultValue={user.company} />
                  <Field label="Phone" type="tel" defaultValue={user.phone} />
                  <Field label="Email (read-only)" type="email" defaultValue={user.email} readOnly />
                  <div className="pt-2">
                    <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#082138]">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Current Password" type="password" />
                  <Field label="New Password" type="password" />
                  <Field label="Confirm Password" type="password" />
                  <div className="pt-2">
                    <Button className="rounded-xl bg-[#0A2647] text-white hover:bg-[#082138]">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  readOnly?: boolean;
}

function Field({ label, type = "text", defaultValue = "", placeholder = "", readOnly = false }: FieldProps){
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${readOnly ? 'bg-slate-50 text-slate-500' : ''}`}
      />
    </div>
  );
}
