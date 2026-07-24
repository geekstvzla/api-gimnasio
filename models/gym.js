require('dotenv').config();
let db = require('../config/database.js');

const gymInfo = (slug) => {

    return new Promise(function (resolve, reject) {

        let queryString = `SELECT g.gym_id,
                                  g.name,
                                  CONCAT('${process.env.API_PUBLIC + "/images/gyms/"}',g.gym_id,'/',g.logo) AS featured_image
                           FROM gyms g
                           WHERE g.slug = ?;`;
        db.query(queryString, [slug], function (err, result) {

            if (err) {

                reject({
                    response: {
                        message: "Error al tratar de ejecutar la consulta en la linea 13",
                        status: "error",
                        statusCode: 0
                    }
                });

            } else {

                if (result.length === 0) {

                    reject({
                        response: {
                            message: "No se encontró ningún gimnasio con el slug " + slug,
                            status: "error",
                            statusCode: 0
                        }
                    });

                } else {

                    resolve({
                        response: {
                            data: result[0],
                            status: "success",
                            statusCode: 1
                        }
                    });

                }

            }

        });

    }).catch(function (error) {

        return (error);

    });

}

module.exports = {
    gymInfo
}