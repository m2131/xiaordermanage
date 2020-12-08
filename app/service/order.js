/*
 * @Author: doramart 
 * @Date: 2019-06-24 13:20:49 
 * @Last Modified by: doramart
 * @Last Modified time: 2019-08-14 16:52:18
 */

'use strict';
const Service = require('egg').Service;


const _ = require('lodash')
const {
    _list,
    _item,
    _count,
    _create,
    _update,
    _updateMany,
    _removes,
    _safeDelete
} = require('./general');


class OrderService extends Service {

    async find(payload, {
        query = {},
        sort = {},
        searchKeys = [],
        populate = [],
        files = null,
        shopSite = ""
    } = {}) {
        let listdata = _list(this.ctx.model["Order"+shopSite.toUpperCase()], payload, {
            query: query,
            sort: sort,
            searchKeys: searchKeys,
            populate: populate,
            files
        });
        return listdata;

    }


    async count(params = {}) {
        return _count(this.ctx.model.Order, params);
    }

    async create(payload,shopSite) {
        return _create(this.ctx.model["Order"+shopSite.toUpperCase()], payload);
    }

    async removes(res, values,shopSite, key = '_id') {
        return _removes(res, this.ctx.model["Order"+shopSite.toUpperCase()], values, key);
    }

    async safeDelete(res, values) {
        return _safeDelete(res, this.ctx.model.Order, values);
    }

    async update(res, _id, payload,shopSite) {
        return _update(res, this.ctx.model["Order"+shopSite.toUpperCase()], _id, payload);
    }

    async updateMany(res, _ids, payload,shopSite) {
        return _updateMany(res, this.ctx.model["Order"+shopSite.toUpperCase()], _ids, payload);
    }

    async item(res, {
        query = {},
        populate = [],
        files = null,
        shopSite = ""
    } = {}) {
        return _item(res, this.ctx.model["Order"+shopSite.toUpperCase()], {
            files: files ? files : {
                password: 0,
                email: 0
            },
            query: query,
            populate: !_.isEmpty(populate) ? populate : [{
                path: 'group',
                select: 'power _id enable name'
            }],
        })
    }


}

module.exports = OrderService;