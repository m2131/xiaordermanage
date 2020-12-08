/**
 * Created by Administrator on 2015/4/15.
 * 管理员用户组对象
 */
module.exports = app => {
    const mongoose = app.mongoose
    var shortid = require('shortid');
    var Schema = mongoose.Schema;

    var PurchaseSchema = new Schema({
        _id: {
            type: String,
            'default': shortid.generate
        },
        OrderID: String,
        companyID: String,
        buyShopID: String,
        buyAccount : String,
        buyPayAccount: String,
        buySendCompany: String,
        buySendType: String,
        buySendState: String,
        shopName: String,
        shopID: String,
        shopSite: String,
        buyTime: {
            type: Date,
            default: Date.now
        },
        updateDate: {
            type: Date,
            default: Date.now
        }
    });


    return mongoose.model("Purchase", PurchaseSchema, 'purchase');

}