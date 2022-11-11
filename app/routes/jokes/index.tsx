import { Joke } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

type LoaderData = {
  joke: Joke;
};

export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomNumberInRange = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomNumberInRange,
  });

  if (!randomJoke) {
    throw new Response("No random joke found", {
      status: 404,
    });
  }

  const data: LoaderData = {
    joke: randomJoke,
  };
  return json(data);
};

export default function JokesIndexRoute() {
  const { joke } = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{joke.content}</p>
      <Link to={joke.id}>{joke.name} Permalink</Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">There are no jokes to display.</div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
