"use client";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./upload-form-input";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: "File size must be less than 20MB",
    })
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});

const UploadForm = async () => {
  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("upload successfully!");
    },
    onUploadError: (err) => {
      console.error("error occured while uploading", err);
      toast("Error occured while uploading", {
        description: err.message,
      });
    },
    onUploadBegin: ({ file }) => {
      console.log("upload has begun for", file);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const validatedFields = schema.safeParse({ file });

    if (!validatedFields.success) {
      toast.error("Something went wrong", {
        description:
          validatedFields.error.flatten().fieldErrors.file?.[0] ??
          "Invalid File",
      });
      return;
    }

    toast("Uploading PDF", {
      description: "We are uploading your PDF!",
    });

    const resp = await startUpload([file]);
    if (!resp) {
      toast.error("Something went wrong", {
        description: "Please use different file",
      });
      return;
    }

    toast("processing PDF", {
      description: "Hang tight! Our AI is reading through your document!",
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
};

export default UploadForm;
