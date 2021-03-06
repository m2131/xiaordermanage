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
    _updateMany,
    _safeDelete
} = require('./general');


class ShopeeOrderService extends Service {

    async find(payload, {
        query = {},
        sort = {},
        searchKeys = [],
        populate = [],
        files = null
    } = {}) {

        let listdata = _list(this.ctx.model.ShopeeOrder, payload, {
            query: query,
            sort: sort,
            searchKeys: searchKeys,
            populate: populate,
            files
        });
        return listdata;
    }


    async count(params = {}) {
        return _count(this.ctx.model.ShopeeOrder, params);
    }

    async create(payload) {
        return _create(this.ctx.model.ShopeeOrder, payload);
    }

    async removes(res, values, key = '_id') {
        return _removes(res, this.ctx.model.ShopeeOrder, values, key);
    }

    async safeDelete(res, values) {
        return _safeDelete(res, this.ctx.model.ShopeeOrder, values);
    }

    async update(res, _id, payload) {
        return _update(res, this.ctx.model.ShopeeOrder, _id, payload);
    }
    async updateMany(res, _ids, payload) {
        return _updateMany(res, this.ctx.model.ShopeeOrder, _ids, payload);
    }

    async item(res, {
        query = {},
        populate = [],
        files = null
    } = {}) {
        return _item(res, this.ctx.model.ShopeeOrder, {
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

module.exports = ShopeeOrderService;