/*
 * @Author: doramart 
 * @Date: 2019-06-27 17:16:32 
 * @Last Modified by: doramart
 * @Last Modified time: 2020-07-27 17:03:50
 */
const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken')
const _ = require('lodash');
var CryptoJS = require("crypto-js");
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const pump = require('pump');
const {
    orderRule
} = require('@validate')

class ShopController extends Controller {
    async list() {
        const ctx = this.ctx;
        const {pageSize,pageNo} = ctx.request.body;
        let shopList = await ctx.service.shop.find({
            isPaging: '1',pageSize:pageSize,current:pageNo
        }, {
            files: 'shopID shopName shopSite updateDate'
        });
        ctx.helper.renderSuccess(ctx, {
            data: shopList
        });
    }


    async create() {
        const {
            ctx,
            service
        } = this;
        try {

            let fields = ctx.request.body || {};
            const formObj = {
                shopID: fields.shopID,
                shopSite: fields.shopSite,
                shopName: fields.shopName,
            }
            let oldItem = await ctx.service.shop.item(ctx, {
                query: {
                    shopID: fields.shopID
                }
            })

            if (!_.isEmpty(oldItem)) {
                throw new Error("店铺已存在");
            }

            await ctx.service.shop.create(formObj);

            ctx.helper.renderSuccess(ctx);
        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }
    async update() {
        const {
            ctx,
            service
        } = this;
        try {

            let fields = ctx.request.body || {};
            const formObj = {
                shopID: fields.shopID,
                shopSite: fields.shopSite,
                shopName: fields.shopName,
            }
            let oldItem = await ctx.service.shop.item(ctx, {
                query: {
                    _id: fields._id
                }
            })

            if (_.isEmpty(oldItem)) {
                throw new Error("店铺不存在");
            }
            await ctx.service.shop.update(ctx, fields._id, formObj);

            ctx.helper.renderSuccess(ctx);
        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }
    async removes() {
        const {
            ctx,
            service
        } = this;
        try {
            let oldShop = await ctx.service.shop.item(ctx, {
                query: {
                    _id: ctx.request.body.id
                }
            });
            if (_.isEmpty(oldShop)) {
                throw new Error("店铺不存在");
            }
            let result = await ctx.service.shop.removes(ctx, ctx.request.body.id);
            ctx.helper.renderSuccess(ctx);

        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }


}

module.exports = ShopController;