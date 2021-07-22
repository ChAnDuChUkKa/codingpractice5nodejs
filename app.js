//importing express and creating instance
const express = require("express");
const app = express();

//importing path sqlite and sqlite3
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//creating path fro database
const dataPath = path.join(__dirname, "moviesData.db");

//use of json in the script
app.use(express.json());

//initializing database to null
let database = null;

const initializeDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at localhost 3000");
    });
  } catch (error) {
    console.log("error");
    process.exit(1);
  }
};
initializeDatabaseAndServer();

//returning in the resulted format

const outputFormatForMovie = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const outputFormatForDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//creating API 1
app.get("/movies/", async (request, response) => {
  const movieNameQuery = `
    select movie_name from movie
    `;
  const movieNameResponse = await database.all(movieNameQuery);
  response.send(
    movieNameResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//creating API2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postRequest = `
  insert into movie(director_id,movie_name,lead_actor)
  values (
      ${directorId},'${movieName}','${leadActor}'
  )
  `;
  const postResponse = await database.run(postRequest);
  response.send("Movie Successfully Added");
});

//creating API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  select * from movie
  where movie_id=${movieId}
  `;
  const movieResponse = await database.get(getMovieQuery);
  response.send(outputFormatForMovie(movieResponse));
});

//creating API4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateDetails = `
  update movie
  set
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  where
  movie_id=${movieId}`;
  const updateResponse = await database.run(updateDetails);
  response.send("Movie Details Updated");
});

//creating API5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
  delete from movie
  where movie_id=${movieId}
  `;
  const deleteResponse = await database.run(deleteQuery);
  response.send("Movie Removed");
});

//creating API6
app.get("/directors/", async (request, response) => {
  const DirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorResponse = await database.all(DirectorsQuery);
  response.send(
    directorResponse.map((eachDirector) =>
      outputFormatForDirector(eachDirector)
    )
  );
});

//creating API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `
    select movie_name from
    movie
    where director_id=${directorId}
    `;
  const responseList = await database.all(directorMovieQuery);
  response.send(
    responseList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
