/**
 * Created by Administrator on 2015/4/15.
 * 管理员用户组对象
 */
module.exports = app => {
    const mongoose = app.mongoose
    var shortid = require('shortid');
    var Schema = mongoose.Schema;

    var OrderTWSchema = new Schema({
        _id: {
            type: String,
            'default': shortid.generate
        },
        updateDate: {
            type: Date,
            default: Date.now
        },
        buyShopID: String,
        buyAccount : String,
        buyPayAccount: String,
        buyPrice: String,
        buySendCompany: String,
        buySendOrderNo: String,
        buySendType: String,
        buySendState: String,
        buyTime: Date,
        shopName: String,
        shopID: String,
        shopSite: String,
        OrderID: String,
        OrderStatus: String,
        CancelReason: String,
        BuyerAccount: String,
        OrderCreationDate: Date,
        OrderSubtotal: String,
        BuyerExpressFee: String,
        TotalAmount: String,
        ShopeeRebate: String,
        ShopeeCoinsOffset: String,
        CreditCardDiscountTotal: String,
        SellerBundleDiscount: String,
        ShopeeCoinsVoucher: String,
        ShopeeBundleDiscount: String,
        TransactionFee: String,
        ActionFee: String,
        CashFlowsFee: String,
        CreditCardFee: String,
        ProductName: String,
        OriginalPrice: String,
        DealPrice: String,
        ParentSKUReferenceNo: String,
        SKUReferenceNo: String,
        NoOfProductInOrder: String,
        BundleDealIndicator: String,
        DeliveryAddress: String,
        ReceiverName: String,
        PhoneNumber: String,
        ZipCode: String,
        DeliveryMethod: String,
        ShipmentMethod: String,
        PaymentMethod: String,
        OrderPaidTime: String,

        //拨款信息
        _OriginalPrice: String,
        _DealPrice: String,
        _ShopeeRebate: String,
        _SellerBundleDiscount: String,
        _SellerCoinsVoucher: String,
        _BuyerExpressFee: String,
        _ShopeeExpressFee: String,
        _RealityExpressFee: String,
        _RefundAmount: String,
        _Commission: String,
        _ServiceFee: String,
        _TransactionFee: String,
        _AppropriationMoney: String,
    });


    return mongoose.model("OrderTW", OrderTWSchema, 'orderTW');

}