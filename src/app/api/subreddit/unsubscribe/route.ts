import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user)
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });

    const body = await req.json();

    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists)
      return NextResponse.json(
        { message: "You are not subscribed to this subreddit" },
        { status: 400 }
      );

    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });

    if (subreddit)
      return NextResponse.json(
        { message: "You cant unsubscirbe form your own subreddit" },
        { status: 400 }
      );

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json(
      { messsage: "You are subscribed!" },
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
      message: "Sry, could not subscribe. Please try again later",
    });
  }
}
