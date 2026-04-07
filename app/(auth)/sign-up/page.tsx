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
          <CardTitle>Start your restaurant setup</CardTitle>
          <CardDescription>We will create your owner account and guide you through reviewing what the system finds from your website, menus, and notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerUser} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
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
              <Label htmlFor="businessName">Restaurant name</Label>
              <Input id="businessName" name="businessName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Business type</Label>
              <select id="industry" name="industry" defaultValue={IndustryType.RESTAURANT} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value={IndustryType.RESTAURANT}>Restaurant</option>
                <option value={IndustryType.BARBER}>Barbershop (coming soon)</option>
                <option value={IndustryType.MECHANIC}>Auto service (coming soon)</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Create workspace</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
