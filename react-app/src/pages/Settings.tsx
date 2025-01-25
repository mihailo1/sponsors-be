import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import { fetchStats, uploadFile } from "../queries";
import useToast from "../utils/toast";

function Settings() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    uptime: number;
    stringsCount: number;
    memoryUsage: number;
    cpuUsage: number;
  } | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchStats()
      .then((data) => setStats(data))
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        uploadFile(reader.result)
          .then((data) => {
            toast.success("File uploaded successfully!");
            setFile(null);
          })
          .catch((error) => {
            toast.error("Error uploading file!");
            console.error("Error uploading file:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-dark-text">
        Settings
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        <input type="file" accept=".json" onChange={handleFileChange} className='text-gray-800 dark:text-dark-text' />
        <Button onClick={handleUpload} disabled={loading} className='relative flex items-center justify-center'>
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white absolute left-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
            Replace list
        </Button>
      </div>
      {stats && (
        <div className="mt-4 text-gray-800 dark:text-dark-text">
          <p>Server Uptime: {stats.uptime} seconds</p>
          <p>Number of Strings: {stats.stringsCount}</p>
          <p>Memory Usage: {stats.memoryUsage} MB</p>
          <p>CPU Usage: {stats.cpuUsage} %</p>
        </div>
      )}
    </div>
  );
}

export default Settings;
