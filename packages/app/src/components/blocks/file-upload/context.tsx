import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface FileContextType {
  files: File[];
  setFiles: (files: File[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  reset: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const reset = useCallback(() => {
    setFiles([]);
    setLoading(false);
    setError("");
  }, []);

  return (
    <FileContext.Provider
      value={{
        files,
        setFiles,
        loading,
        setLoading,
        error,
        setError,
        reset,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useUploadedFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
}
