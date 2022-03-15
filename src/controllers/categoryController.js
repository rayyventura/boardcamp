import { connection } from "../database.js";

export async function getCategories(req, res) {
  try {
    const categories = await connection.query(`
SELECT * FROM categories
`);
    res.send(categories.rows);
    console.log(categories);
  } catch (error) {
    res.sendStatus(500);
  }
}

export async function postCategory(req, res) {
  try {
    const result = await connection.query(
      `
         SELECT * FROM categories WHERE name=$1`,
      [req.body.name]
    );
    console.log(result);
    if (result.rowCount !== 0) {
      return res.sendStatus(409);
    }
    await connection.query(`INSERT INTO categories(name) VALUES ($1)`, [
      req.body.name,
    ]);
    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
  }
}
