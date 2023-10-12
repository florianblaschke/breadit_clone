import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user)
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });

    const body = await req.json();

    const { subredditId, title, content } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists)
      return NextResponse.json(
        { message: "Subscribe to post" },
        { status: 400 }
      );

    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      },
    });

    return NextResponse.json(
      { message: "You are subscribed!" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data passed" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      message: "Sry, could not post to subreddit. Please try again later",
    });
  }
}
