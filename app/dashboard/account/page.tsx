import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { AccountPageClient } from "@/components/account/account-client";
import { UserData } from "@/types/user-data";

export default async function AccountPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return <div>Please log in to access your account settings.</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 ">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="space-y-6 px-4 lg:px-6 mb-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>

            <AccountPageClient
              userData={{
                id: user.id,
                name: `${user.given_name || ""} ${
                  user.family_name || ""
                }`.trim(),
                email: user.email || "",
                imageUrl: user.picture || "",
                given_name: user.given_name || "",
                family_name: user.family_name || "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
