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
    _removes,
    _safeDelete
} = require('./general');


class OrderTWService extends Service {

    async find(payload, {
        query = {},
        searchKeys = [],
        populate = [],
        files = null
    } = {}) {

        let listdata = _list(this.ctx.model.OrderTW, payload, {
            query: query,
            searchKeys: searchKeys,
            populate: populate,
            files
        });
        return listdata;

    }


    async count(params = {}) {
        return _count(this.ctx.model.OrderTW, params);
    }

    async create(payload) {
        return _create(this.ctx.model.OrderTW, payload);
    }

    async removes(res, values, key = '_id') {
        return _removes(res, this.ctx.model.OrderTW, values, key);
    }

    async safeDelete(res, values) {
        return _safeDelete(res, this.ctx.model.OrderTW, values);
    }

    async update(res, _id, payload) {
        return _update(res, this.ctx.model.OrderTW, _id, payload);
    }

    async item(res, {
        query = {},
        populate = [],
        files = null
    } = {}) {
        return _item(res, this.ctx.model.OrderTW, {
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

module.exports = OrderTWService;