import {
  FileProvider,
  useUploadedFiles,
} from "@/components/blocks/file-upload";
import { FileUpload } from "@/components/blocks/file-upload/file-upload";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";

export const PatternConfidenceDemo = () => (
  <FileProvider>
    <FileForm />
  </FileProvider>
);

const FILE_LIMIT = 5;
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const SUPPORTED_FILE_TYPES = {
  "text/plain": [".txt"],
  "text/md": [".md"],
  "text/csv": [".csv"],
  "text/xml": [".xml"],
};

const FileForm = () => {
  const { files } = useUploadedFiles();
  const FileResults = getFileResults(files);
  return (
    <section className="flex flex-col gap-4">
      <FileUpload
        placeholder={`Upload up to ${FILE_LIMIT} text files`}
        supportedFileTypes={SUPPORTED_FILE_TYPES}
        maxFiles={FILE_LIMIT}
        maxFileSize={MAX_FILE_SIZE}
      />
      <Suspense fallback={<FullscreenSpinner />}>
        <FileResults />
      </Suspense>
    </section>
  );
};

const FileResults = ({ fileContents }: { fileContents: string[] }) => {
  const { reset } = useUploadedFiles();

  if (fileContents.length === 0) {
    return null;
  }
  return (
    <>
      <Button className="self-end" variant="outline" onClick={reset}>
        Reset Files
      </Button>
      <div className="border rounded-md p-6">{fileContents.map((t) => t)}</div>
    </>
  );
};

const getFileResults = (files: File[]) =>
  lazy(async () => {
    const fileContents = await submitFiles(files);
    return { default: () => <FileResults fileContents={fileContents} /> };
  });

const submitFiles = async (files: File[]) =>
  Promise.all(files.map((file) => file.text()));
