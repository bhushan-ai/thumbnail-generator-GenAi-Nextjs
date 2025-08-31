"use server";
import "dotenv/config";
import { imageUploadUtil } from "@/app/services/cloudinary";
import { client } from "@/app/services/openai";
import { SYSTEM_PROMPT } from "@/app/services/Prompt";
import { fal } from "@fal-ai/client";

// fal.config({
//   credentials: process.env.FAL_KEY,
// });

export async function POST(request) {
  const formData = await request.formData();

  const prompt = formData.get("prompt");
  const file = formData.get("image");
  //console.log("file", file);

  let imageUrl = null;
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    // console.log("arrayBuffer", arrayBuffer);
    const buffer = Buffer.from(arrayBuffer);
    // console.log("buffer", buffer);

    const b64 = buffer.toString("base64");
    //console.log("b64", b64);

    const url = `data:${file.type};base64,${b64}`;
    // console.log("url", url);

    imageUrl = await imageUploadUtil(url);
    // console.log("imgurl", imageUrl);

    if (!imageUrl) {
      return Response.json({ message: "image upload fails", success: false });
    }
  }
  const result = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 100,
  });

  const updatedPrompt = result.choices[0]?.message.content || "no response";

  console.log("updatedPrompt", updatedPrompt);
  console.log("imgurl", imageUrl);
  try {
    const editWithFal = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: updatedPrompt,
        image_urls: imageUrl ? [imageUrl] : [],
      },
    });

    console.log("editWithFal.data", editWithFal.data);

    const falImageUrl = editWithFal.data?.images?.[0]?.url;

    if (!falImageUrl) {
      throw new Error("Fal did not return an image");
    }

    //console.log("falImageUrl", falImageUrl);

    const editedImageUploadedToCloudinary = await imageUploadUtil(falImageUrl);

    console.log(
      "editedImageUploadedToCloudinary",
      editedImageUploadedToCloudinary
    );

    return Response.json({
      data: editedImageUploadedToCloudinary,
      success: true,
    });
  } catch (err) {
    console.log("err", err);
    return Response.json({
      message: "something went wrong in server side",
      success: false,
      error: err.message,
    });
  }
}
