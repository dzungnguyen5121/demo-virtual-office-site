import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function ProfilePage() {
  const user = { name: "John Doe", email: "JohnDoe@company.com", company: "ABC Company", dob: "1990-01-15", phone: "+44 20 7123 4567" };

  return (
    <section id="profile">
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
