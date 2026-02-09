import 'dotenv/config'; 

import { Worker,Job } from "bullmq";
import { Redis } from 'ioredis';
import { downloadFile } from './utils/s3.js';
import { extractTextFromFile } from './utils/parser.js';
import { generateKeywords } from './utils/parser.js';
import { prisma } from './utils/prisma.js';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {}, 
  maxRetriesPerRequest: null
});

connection.on('connect', () => console.log('Connected to Aiven Valkey!'));
connection.on('error', (err) => console.error('Redis error:', err));
console.log("worker has started");
// console.log(process.env.AWS_S3_BUCKET_NAME,process.env.AWS_ACCESS_KEY_ID,process.env.AWS_SECRET_ACCESS_KEY);
const worker = new Worker('process_document', async (job: Job) => {
    console.log("worker reached");
    const { documentId, workspaceId, filePath,fileName,userId } = job.data;
    console.log(documentId,"id rech")
  console.log("task has occured");
    if(!documentId || !workspaceId || !filePath) 
    {
        throw new Error("Missing job data");
    }
   try {
    const fileBuffer = await downloadFile(filePath);
    const sections = await extractTextFromFile(fileBuffer,fileName);
    // console.log(sections);
    const sectionWithKeywords = sections.map((section:any) => ({
     ...section,
     keywords:generateKeywords(section.content)
    }))

    for(const sec of sectionWithKeywords)
    {
  await prisma.section.create({
    data:{
        documentId:documentId,
        title:sec.title,
        content:sec.content,
        keywords:sec.keywords.join(",")
    }
  })
    }
  

    await prisma.document.update({
    where:{
        id:documentId
    },
    data:{
        status:"completed"
    }
    })

    await prisma.notification.create({
       data:{
        userId,
        type:"ai_processing",
        reach:"personal",
        title:"AI processing completed .",
        workspaceId
       }
    })
 
    console.log("document processed successfully");

   } catch (err) {
    console.error("error while processing document",err)
     await prisma.document.update({
    where:{
        id:documentId
    },
    data:{
        status:"failed"
    }
    })

throw err;
   }
},{
 connection
})

worker.on("completed",(job)=>{
console.log(` Job ${job.id} completed`);
})

worker.on("failed",(job,err)=>{
    if(!job)return;
    console.error(`job ${job.id} failed`,err);
})