const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const { rejectUnauthenticated } = require('../modules/authentication-middleware')

router.get('/', (req, res) => {
  console.log('req.user', req.user);
  pool
  .query (`SELECT * FROM "hat";`) 
  .then ((results) => res.send(results.rows))
  .catch ((error) => {
    console.log ('ERROR SELECTING FROM "HAT"', error)
    res.sendStatus(500)
  })
})

router.post('/', rejectUnauthenticated, (req, res) => {
  console.log(req.user);
  console.log(req.body);
  
  const postQuery = `
  INSERT INTO "hat" ("description", "photo_url", "hat_color", "hat_style", "hat_fabric", "hat_vibe", "creator_id")
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const postValues = [req.body.description, req.body.photo_url, req.body.hat_color, req.body.hat_style, req.body.hat_fabric, req.body.hat_vibe, req.user.id]

  pool.query(postQuery, postValues)
  .then(() => res.sendStatus(201))
  .catch((error) => {
    console.log('error POST hat:', error);
    res.sendStatus(500);
  });
});

router.delete('/:id', (req, res) => {
  //req.params as "id" value of the item
  // console.log(req.params.id);
  // //req.user.id as value of "user_id"
  console.log(req.user.id);

  //check and see if the "user_id" value of the row "id" matches req.user.id
  //query SELECT * FROM "item" WHERE "id" = req.params
  pool.query(`SELECT * FROM "hat" WHERE "id"=$1`, [req.params.id])
    .then((result) => {
      console.log(result.rows);
        //access the "user_id" in .then(result) 
      const authID = result.rows[0].creator_id;
      console.log(authID);
      
      if (authID === req.user.id) {
        const query2 = `DELETE FROM "hat" WHERE "id"=$1;`;
        const values2 = [req.params.id]
        pool.query(query2, values2)
        .then(() => res.sendStatus(202))
        .catch((error) => {
          console.log('DELETE server error:', error);
        })
      } else {
        //catch and send_status(4XX) don't have authentication
        res.sendStatus(400);
      }

    })
    //first query catch
    .catch((error) => {
      console.log(error);
    })
})


module.exports = router;