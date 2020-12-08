/**
 * Created by Administrator on 2015/4/15.
 * 管理员用户组对象
 */
module.exports = app => {
    const mongoose = app.mongoose
    var shortid = require('shortid');
    var Schema = mongoose.Schema;
    require('./adminUser');

    var OrderMYSchema = new Schema({
        _id: {
            type: String,
            'default': shortid.generate
        },
        user: [{
            type: String,
            ref: "AdminUser"
        }],
        companyID: String,
        buyShopID: String,
        buyAccount : String,
        buyPayAccount: String,
        buyTime: {
            type: Date,
            default: Date.now
        },
        buySendCompany: String,
        buySendType: String,
        buySendState: String,
        updateDate: {
            type: Date,
            default: Date.now
        },
        shopName: String,
        shopID: String,
        shopSite: String,
        OrderID: String,
        OrderStatus: String,
        TrackingNumber: String,
        ShippingOption: String,
        ShipmentMethod: String,
        EstimatedShipOutDate: String,
        OrderCreationDate: String,
        OrderPaidTime: String,
        ParentSKUReferenceNo: String,
        ProductName: String,
        SKUReferenceNo: String,
        VariationName: String,
        OriginalPrice: String,
        DealPrice: String,
        Quantity: String,
        ProductSubtotal: String,
        SellerRebate: String,
        SellerDiscount: String,
        ShopeeRebate: String,
        SKUTotalWeight: String,
        NoOfProductInOrder: String,
        OrderTotalWeight: String,
        SellerVoucher: String,
        SellerAbsorbedCoinCashback: String,
        ShopeeVoucher: String,
        BundleDealIndicator: String,
        ShopeeBundleDiscount: String,
        SellerBundleDiscount: String,
        ShopeeCoinsOffset: String,
        CreditCardDiscountTotal: String,
        TotalAmount: String,
        BuyerPaidShippingFee: String,
        TransactionFee: String,
        CommissionFee: String,
        ServiceFee: String,
        GrandTotal: String,
        EstimatedShippingFee: String,
        UsernameBuyer: String,
        ReceiverName: String,
        PhoneNumber: String,
        DeliveryAddress: String,
        Area: String,
        State: String,
        Country: String,
        ZipCode: String,
    });


    return mongoose.model("OrderMY", OrderMYSchema, 'orderMY');

}