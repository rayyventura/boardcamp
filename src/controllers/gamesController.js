import { connection } from "../database.js";

export async function getGames(req, res) {
  const { name } = req.query;
  console.log(name);
  try {
    if (name) {
      const result = await connection.query(
        `
        SELECT games.*, categories.name AS "categoryName" FROM games 
          JOIN categories ON games."categoryId"=categories.id
          WHERE games.name ILIKE $1
        `,
        [name+'%']
      );
      return res.send(result.rows);
    }
    const result = await connection.query(`
    SELECT games.*, categories.name AS "categoryName" FROM games 
      JOIN categories ON games."categoryId"=categories.id
    `);
    res.send(result.rows);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function postGame(req, res) {
  const game = req.body;
  try {
    const existingCategory = await connection.query(
      `
        SELECT * FROM categories WHERE id=$1
        `,
      [game.categoryId]
    );

    const existingGame = await connection.query(
      `
        SELECT * FROM games WHERE name=$1
        `,
      [game.name]
    );

    if (existingCategory.rowCount === 0) {
      return res.sendStatus(400);
    }
    if (existingGame.rowCount !== 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      `
        INSERT INTO games(
            name,
            image,
            "stockTotal",
            "categoryId",
            "pricePerDay") VALUES ($1, $2, $3, $4, $5)
        `,
      [
        game.name,
        game.image,
        game.stockTotal,
        game.categoryId,
        game.pricePerDay,
      ]
    );
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
