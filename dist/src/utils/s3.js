import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// export const s3 = new S3Client({
//         region:process.env.AWS_REGION,
//         credentials:{
//             accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
//             secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!
//         }
//     });
export const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});
export async function s3Upload(fileName, buffer, fileType) {
    const uploadParams = {
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: fileType
    };
    await s3.send(new PutObjectCommand(uploadParams));
    return `${process.env.R2_ENDPOINT}/${fileName}`;
}
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => {
            chunks.push(Buffer.from(chunk));
        });
        stream.on("error", reject);
        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
    });
}
export async function downloadFile(fileUrl) {
    console.log("downloading....................................");
    const url = new URL(fileUrl);
    // const bucket = url.hostname.split(".")[0];
    const key = decodeURIComponent(url.pathname.slice(1));
    console.log("s3 rech");
    console.log(key, process.env.R2_BUCKET, url, "url");
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key
    });
    const response = await s3.send(command);
    if (!response.Body) {
        throw new Error("Failed to download the file");
    }
    return streamToBuffer(response.Body);
}
