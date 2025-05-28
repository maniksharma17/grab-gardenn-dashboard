export async function uploadToS3(file: File) {
  const fileType = file.type;

  // 1. Get pre-signed URL
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/get-upload-url?fileType=${fileType}&filename=${encodeURIComponent(file.name)}`,
  );
  const { uploadUrl, fileUrl } = await res.json();

  // 2. Upload to S3
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed');
  }

  return fileUrl;
}
