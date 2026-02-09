import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL:"https://api.deepseek.com"
})

export async function runQuery(sections: any[], query: string) 
{
const intent = await detectIntentWithAI(query);
console.log("users",intent);
switch(intent)
{
    case "SUMMARY":
        return await generateSummaryWithAI(sections);

    case "SEARCH":
        return await searchInSections(sections, query);
    default:
        return "this question is outside of the document scope";
}
}

async function detectIntentWithAI(query:string):Promise<string>
{
const prompt = `Based on this query you need to find the intent of the user and return either "SUMMARY || SEARCH"  based on the user intent that's it dont add any extra info you fool give me correct intent with carefully based on query just return "SUMMARY || SEARCH" i have a switch statement where i am using either "SUMMARY || SEARCH"  \n\n `
    // const response = await client.chat.completions.create({
    //     model: "deepseek-chat",
    //     messages: [
    //         {
    //             role: "system",
    //             content: prompt
    //         },
    //         {
    //             role: "user",
    //             content: query
    //         }
    //         ],
       
    // });

    // return response.choices[0].message.content || "OUT_OF_SCOPE";

try{
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.YOUR_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WORKERS_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-7b-instruct", 
              messages: [
            {
                role: "system",
                content: prompt
            },
            {
                role: "user",
                content: query
            }
        ],
      }),
    });

    const data = await res.json();
    console.log(data,"1");
    return data.result.response  || "OUT_OF_SCOPE";
  } catch (err) {
    console.error(err);
    return "{err}"  
  }


}


async function generateSummaryWithAI(sections:any[]):Promise<string>
{
    const prompt = `Provide a concise summary of the following document sections based on the document and if the answer doesn't present in the document say "NOT PRESENT IN DOCUMENT": ${sections.map((section:any) => `Title: ${section.title}\nContent: ${section.content}`).join('\n\n')}`;

    // const response = await client.chat.completions.create({
    //     model: "deepseek-chat",
        // messages: [
        //     {
        //         role: "system",
        //         content: prompt
        //     }
        // ],
    //     temperature: 0,
    // });
    try{
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.YOUR_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WORKERS_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-7b-instruct", 
              messages: [
            {
                role: "system",
                content: prompt
            },
        ],
      }),
    });

    const data = await res.json();
    console.log(data,"2");

    return  data.result.response || "NOT PRESENT IN DOCUMENT";
  } catch (err) {
    console.error(err);
    return `${err}`
  }

//      const response = await fetch(
//     "https://dgenerativelanguage.googleapis.com/v1beta/models/gemini-1.5-turbo:generateContent",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-goog-api-key": process.env.GEMINI_API_KEY!,
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [{ text: prompt  }],
//           },
//         ],
//       }),
//     }
//   );

//   const data = await response.json();

//   return data.candidates?.[0]?.content?.parts?.[0]?.text || "NOT PRESENT IN DOCUMENT";
}

async function searchInSections(sections:any[], query:string):Promise<string>
{
    const prompt = `Based on the following document sections, answer the user query. If the answer is not present in the document, respond with "NOT PRESENT IN DOCUMENT": ${sections.map((section:any) => `Content: ${section.content}`).join('\n\n')}\n\nUser Query: ${query}`;

    try{
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.YOUR_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WORKERS_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-7b-instruct", 
              messages: [
            {
                role: "system",
                content: prompt
            }
        ],
      }),
    });

    const data = await res.json();
    console.log(data,"3");

    return  data.result.response || "NOT PRESENT IN DOCUMENT";
  } catch (err) {
    console.error(err);
    return `${err}`
  }


}