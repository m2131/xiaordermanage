/**
 * Created by Administrator on 2015/4/15.
 * 管理员用户组对象
 */
module.exports = app => {
    const mongoose = app.mongoose
    var shortid = require('shortid');
    var Schema = mongoose.Schema;
    require('./adminUser');

    var ShopSchema = new Schema({
        shopID: {
            type: String,
            'default': shortid.generate
        },
        shopName: String,
        shopSite: String,
        updateDate: {
            type: Date,
            default: Date.now
        },
    });


    return mongoose.model("Shop", ShopSchema, 'shop');

}