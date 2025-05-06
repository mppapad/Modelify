import { DataTable } from "@/components/data-table";
import data from "../data.json";
export default function ModelsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 lg:text-4xl text-3xl mb-3 font-medium"></div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
