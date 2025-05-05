import { DataTable } from "@/components/data-table";
import data from "./data.json";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Dashboard() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  console.log(user);
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 lg:text-4xl text-3xl mb-3 font-medium">
              <h1>👋 Welcome back, {user?.given_name}</h1>
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
