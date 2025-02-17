'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class User extends Model {

    static get tableName() {

        return 'user';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
            email: Joi.string().email(),
            password: Joi.string(),
            username: Joi.string(),
            admin: Joi.boolean().default(false),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;

        // Convertir admin en nombre avant l'insertion
        if (this.admin !== undefined) {
            this.admin = this.admin ? 1 : 0;
        }
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();

        // Convertir admin en nombre avant la mise à jour
        if (this.admin !== undefined) {
            this.admin = this.admin ? 1 : 0;
        }
    }

    $parseDatabaseJson(json) {
        json = super.$parseDatabaseJson(json);
        // Convertir admin en booléen lors de la lecture
        if (json.admin !== undefined) {
            json.admin = Boolean(json.admin);
        }
        return json;
    }

    $formatDatabaseJson(json) {
        // Convertir admin en nombre pour la base de données
        if (json.admin !== undefined) {
            json.admin = json.admin ? 1 : 0;
        }
        return super.$formatDatabaseJson(json);
    }

    static get jsonAttributes(){

        return []
    }
};
