import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AccountForm } from "@/components/account/account-form";
import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { Separator } from "@/components/ui/separator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AccountPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return <div>Please log in to access your account settings.</div>;
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="space-y-6 px-4 lg:px-6 mb-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Account</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences.
                </p>
              </div>
              <Separator />

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and profile picture.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccountForm
                      user={{
                        id: user.id,
                        name: `${user.given_name || ""} ${
                          user.family_name || ""
                        }`.trim(),
                        email: user.email || "",
                        imageUrl: user.picture || "",
                      }}
                    />
                  </CardContent>
                </Card>

                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Permanent actions that can't be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DeleteAccountForm userId={user.id} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
