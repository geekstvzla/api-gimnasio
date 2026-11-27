require('dotenv').config();
let db = require('../config/database.js');

const gymInfo = (slug) => {

    return new Promise(function (resolve, reject) {

        let queryString = `SELECT g.gym_id,
                                  g.name,
                                  g.slug,
                                  COALESCE(g.primary_color, '#2563eb') AS primary_color,
                                  COALESCE(g.secondary_color, '#1d4ed8') AS secondary_color,
                                  COALESCE(g.sidebar_color, '#0f172a') AS sidebar_color,
                                  COALESCE(g.currency_id, 3) AS currency_id,
                                  COALESCE(c.symbol, '€') AS currency_symbol,
                                  COALESCE(c.abbreviation, 'EUR') AS currency_abbreviation,
                                  COALESCE(cl.description, 'Euros') AS currency_name,
                                  CONCAT('${process.env.API_PUBLIC + "/images/gyms/"}',g.gym_id,'/',g.logo) AS logo
                           FROM gyms g
                           LEFT JOIN currencies c ON g.currency_id = c.currency_id
                           LEFT JOIN currencies_lang cl ON c.currency_id = cl.currency_id AND cl.language_id = 1
                           WHERE g.slug = ?;`;
        db.query(queryString, [slug], function (err, result) {

            if (err) {
                console.error("Error executing gymInfo query:", err);
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

const getRoles = (langId) => {

    return new Promise(function (resolve, reject) {

        let languageId = (langId === 'eng' || langId === 2 || langId === '2') ? 2 : 1;
        let queryString = `SELECT gr.gym_role_id AS role_id,
                                  grl.description AS role_name
                           FROM gym_roles gr
                           INNER JOIN gym_roles_lang grl ON grl.gym_role_id = gr.gym_role_id
                           WHERE gr.status_id = 1 AND grl.language_id = ?
                           ORDER BY gr.gym_role_id ASC;`;
        db.query(queryString, [languageId], function (err, result) {

            if (err) {

                reject({
                    response: {
                        message: "Error al tratar de ejecutar la consulta de roles",
                        status: "error",
                        statusCode: 0
                    }
                });

            } else {

                resolve({
                    response: {
                        roles: result,
                        status: "success",
                        statusCode: 1
                    }
                });

            }

        });

    }).catch(function (error) {

        return (error);

    });

}

module.exports = {
    gymInfo,
    getRoles
}
