import { IndustryType } from "@prisma/client";
import { registerUser } from "@/components/forms/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-xl py-20">
      <Card>
        <CardHeader>
          <CardTitle>Create your TenantChat workspace</CardTitle>
          <CardDescription>Set up your owner account, business, and starter tenant in one step.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerUser} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" name="businessName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry</Label>
              <select id="industry" name="industry" className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {Object.values(IndustryType).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">Create account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
