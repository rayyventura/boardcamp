import { connection } from "../database.js";
import dayjs from "dayjs";

export async function getRentals(req, res) {
  const { customerid, gameid } = req.query;
  try {
    const params = [];
    const conditions = [];
    let where = "";
    console.log(customerid);
    console.log(gameid);
    if (customerid) {
      params.push(customerid);
      conditions.push(`rentals."customerId"=$${params.length}`);
    }
    if (gameid) {
      params.push(gameid);
      conditions.push(`rentals."gameId"=$${params.length}`);
    }

    if (params.length > 0) {
      where += `WHERE ${conditions.join(" AND ")}`;
    }
    const result = await connection.query(
      {
        text: ` 
          SELECT 
        rentals.*,
        customers.name AS customer,
        games.name,
        categories.* 
        FROM rentals
        JOIN customers ON rentals."customerId"=customers.id 
        JOIN games ON rentals."gameId"=games.id
        JOIN categories ON games."categoryId"=categories.id
        ${where}
    `,
        rowMode: "array",
      },
      params
    );

    const finalRental = result.rows.map((row) => {
      const [
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customerName,
        gameName,
        categoryId,
        categoryName,
      ] = row;

      return {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customer: {
          id: customerId,
          name: customerName,
        },
        game: {
          id: gameId,
          name: gameName,
          categoryId,
          categoryName,
        },
      };
    });
    res.send(finalRental);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function postRental(req, res) {
  try {
    const rental = req.body;

    const existingCustomer = await connection.query(
      `
          SELECT * FROM customers WHERE id=$1
        `,
      [rental.customerId]
    );
    if (existingCustomer.rowCount === 0) {
      return res.sendStatus(400);
    }

    const gameResult = await connection.query(
      `
          SELECT * FROM games WHERE id=$1
        `,
      [rental.gameId]
    );
    if (gameResult.rowCount === 0) {
      return res.sendStatus(400);
    }
    const game = gameResult.rows[0];
    const result = await connection.query(
      `
          SELECT 
            *
          FROM rentals 
          WHERE "gameId"=$1 AND "returnDate" IS null
        `,
      [rental.gameId]
    );

    if (result.rowCount > 0) {
      if (game.stockTotal === result.rowCount) {
        return res.sendStatus(400);
      }
    }

    const originalPrice = rental.daysRented * game.pricePerDay;
    await connection.query(
      `
          INSERT INTO 
            rentals (
              "customerId", "gameId", "rentDate", 
              "daysRented", "returnDate", "originalPrice", "delayFee"
            )
            VALUES ($1, $2, NOW(), $3, null, $4, null); 
          `,
      [rental.customerId, rental.gameId, rental.daysRented, originalPrice]
    );

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function returnRental(req, res) {
  const { id } = req.params;
  const today = dayjs();
  let delayFee = null;

  try {
    const { rows: rental } = await connection.query(
      `SELECT games."pricePerDay", rentals."rentDate", rentals."daysRented" FROM rentals
        JOIN games ON rentals."gameId"=games.id
        WHERE rentals.id=$1`,
      [id]
    );
    const pricePerDay = rental[0].pricePerDay;
    const rentDate = rental[0].rentDate;
    const daysRented = rental[0].daysRented;

    const originalReturnDate = dayjs(rentDate).add(daysRented, "day");
    const lateReturnDays = today.diff(originalReturnDate, "days");

    if (lateReturnDays > 0) {
      delayFee = pricePerDay * lateReturnDays;
    }

    await connection.query(
      `UPDATE 
        rentals 
      SET 
        "returnDate"=$1, 
        "delayFee"=$2 
      WHERE id=$3`,
      [today.format("YYYY/MM/DD"), delayFee, id]
    );

    return res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    await connection.query(`DELETE FROM rentals WHERE id=$1`, [id]);

    res.sendStatus(200);
  } catch {
    return res.sendStatus(500);
  }
}
