import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import { debounce } from "lodash";
import { addString, deleteString, fetchStrings } from "../queries";
import useToast from "../utils/toast";
import { StringItem } from "../../../types";

function Home() {
  const toast = useToast();
  const [strings, setStrings] = useState<StringItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchStrings("")
      .then((data) => {
        console.log("Fetched data:", data);
        if (Array.isArray(data)) {
          setStrings(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      })
      .catch((error) => console.error("Error fetching strings:", error));
  }, []);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      fetchStrings(searchTerm)
        .then((data) => {
          if (Array.isArray(data)) {
            setStrings(data);
          } else {
            console.error("Unexpected data format:", data);
          }
        })
        .catch((error) => console.error("Error fetching strings:", error));
    }, 300);

    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDelete = (id: number) => {
    deleteString(id)
      .then((data) => {
        setStrings(data);
        setSearchTerm("");
        toast.success("String deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting string:", error);
        toast.error("Error deleting string!");
      });
  };

  const handleAdd = async () => {
    try {
      const data = await addString(searchTerm);
      setStrings([...strings, { id: `${strings.length}`, value: searchTerm }]);
      setSearchTerm("");
      toast.success("String added successfully!");
    } catch (error) {
      console.error("Error adding string:", error);
      toast.error("Error adding string!");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAdd();
    }
  };

  const filteredStrings = strings.filter(
    (str) =>
      str.value && str.value.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    { header: "String", accessorKey: "value" },
    {
      header: "Actions",
      cell: (info: any) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="text-red-500 hover:text-red-700 mx-2"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="geologica-regular">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-dark-text">
        List
      </h2>
      <div className="mt-4 flex gap-4">
        <input
          type="text"
          placeholder="Search strings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="p-2 border border-gray-300 rounded-md w-full min-w-[200px]"
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>
      <div
        className="mt-4 overflow-y-auto min-h-[200px]"
        style={{ maxHeight: "calc(100vh - 278px)" }}
      >
        {filteredStrings.length > 0
          ? <Table columns={columns} data={filteredStrings} />
          : (
            <div className="flex flex-col items-center justify-center h-full mt-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: "64px", width: "64px" }}
                className="text-gray-400 dark:text-dark-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  fill="currentColor"
                  d="M17 3.34a10 10 0 1 1-14.995 8.984L2 12l.005-.324A10 10 0 0 1 17 3.34M15 14H9l-.117.007a1 1 0 0 0 0 1.986L9 16h6l.117-.007a1 1 0 0 0 0-1.986zM9.01 9l-.127.007a1 1 0 0 0 0 1.986L9 11l.127-.007a1 1 0 0 0 0-1.986zm6 0l-.127.007a1 1 0 0 0 0 1.986L15 11l.127-.007a1 1 0 0 0 0-1.986z"
                />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-dark-text">
                Nothing found, press enter to add
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export default Home;
