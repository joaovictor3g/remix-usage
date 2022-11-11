import { Joke } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import { db } from "~/utils/db.server";

type LoaderData = {
  joke: Joke;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { jokeId } = params;
  const joke = await db.joke.findUnique({ where: { id: jokeId } });

  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }

  const data: LoaderData = {
    joke,
  };

  return json(data);
};

export default function JokeRoute() {
  const { joke } = useLoaderData<LoaderData>();

  return (
    <div>
      <p>{joke.name}</p>
      <p>{joke.content}</p>
      <Link to={joke.id}>{joke.name} Permalink</Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div className="error-container">
        Huh? What the heck is "{params.jokeId}"?
      </div>
    );
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
