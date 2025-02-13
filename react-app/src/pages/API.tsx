import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { fetchApiSchema } from "../queries";

interface ApiRoute {
  method: string;
  path: string;
  description: string;
  requestSchema: string | null;
  responseSchema: string | null;
}

function API() {
  const [apiRoutes, setApiRoutes] = useState<ApiRoute[]>([]);

  useEffect(() => {
    fetchApiSchema()
      .then((data) => setApiRoutes(data))
      .catch((error) => console.error("Error fetching API schema:", error));
  }, []);

  const endpointRoutes = apiRoutes.filter((route) =>
    route.path.startsWith("/api")
  );
  const staticRoutes = apiRoutes.filter((route) =>
    route.path.startsWith("/static")
  );
  const adminRoutes = apiRoutes.filter((route) =>
    route.path.startsWith("/admin")
  );

  const columns = [
    { header: "Method", accessorKey: "method" },
    { header: "Path", accessorKey: "path" },
    { header: "Description", accessorKey: "description" },
    { header: "Request Schema", accessorKey: "requestSchema" },
    { header: "Response Schema", accessorKey: "responseSchema" },
  ];

  return (
    <div className="w-full">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-dark-text">
        API Documentation
      </h2>

      <div className="mt-4">
        <h4 className="text-1xl font-semibold text-gray-800 dark:text-dark-text">
          Endpoint Routes
        </h4>
        <div className="relative overflow-y-auto max-h-[calc(calc(100vh-164px)/3)]">
          <Table
            columns={columns}
            data={endpointRoutes}
            tdClassName="text-left"
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-1xl font-semibold text-gray-800 dark:text-dark-text">
          Static Routes
        </h4>
        <div className="relative overflow-y-auto max-h-[calc(calc(100vh-164px)/3)]">
          <Table
            columns={columns}
            data={staticRoutes}
            tdClassName="text-left"
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-1xl font-semibold text-gray-800 dark:text-dark-text">
          Admin Routes
        </h4>
        <div className="relative overflow-y-auto max-h-[calc(calc(100vh-164px)/3)]">
          <Table columns={columns} data={adminRoutes} tdClassName="text-left" />
        </div>
      </div>
    </div>
  );
}

export default API;
