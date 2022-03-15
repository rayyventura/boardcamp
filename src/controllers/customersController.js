import { connection } from "../database.js";

export async function getCustumers(req, res) {
  const { cpf } = req.query;
  try {
    if (cpf) {
      const customers = await connection.query(
        `
        SELECT * FROM customers WHERE cpf ILIKE $1
        `,
        [cpf + "%"]
      );

      return res.send(customers);
    }

    const customers = await connection.query(`
    SELECT * FROM customers
    `);
    res.send(customers.rows);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
export async function getCustomer(req, res) {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
    return res.sendStatus(400);
  }
  try {
    const existingCustomer = await connection.query(
      `
  SELECT * FROM customers WHERE id=$1
  `,
      [id]
    );

    if (existingCustomer.rowCount === 0) {
      return res.sendStatus(404);
    }

    res.send(existingCustomer.rows);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function postCustomer(req, res) {
  const customer = req.body;

  try {
    const existingCustomer = await connection.query(
      `
  SELECT * FROM customers WHERE cpf=$1
  `,
      [customer.cpf]
    );

    if (existingCustomer.rowCount !== 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      ` INSERT INTO customers(
    name,
    phone,
    cpf,
    birthday) VALUES ($1, $2, $3, $4)`,
      [customer.name, customer.phone, customer.cpf, customer.birthday]
    );
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
export async function putCustomer(req, res) {
  const { id } = req.params;
  const customer = req.body;
  if (isNaN(parseInt(id))) {
    return res.sendStatus(400);
  }
  try {
    const existingCustomer = await connection.query(
      `
    SELECT * FROM customers WHERE id=$1
    `,
      [id]
    );
    if (existingCustomer.rowCount !== 0) {
      await connection.query(
        `
      UPDATE customers SET 
        name=$1,
        phone=$2,
        cpf=$3,
        birthday=$4
      
      WHERE id=$5
      `,
        [customer.name, customer.phone, customer.cpf, customer.birthday, id]
      );
      return res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
