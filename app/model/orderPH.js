/**
 * Created by Administrator on 2015/4/15.
 * 管理员用户组对象
 */
module.exports = app => {
    const mongoose = app.mongoose
    var shortid = require('shortid');
    var Schema = mongoose.Schema;

    var OrderPHSchema = new Schema({
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
        TrackingNumber: String,
        ShippingOption: String,
        ShipmentMethod: String,
        EstimatedShipOutDate: Date,
        OrderCreationDate: Date,
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


    return mongoose.model("OrderPH", OrderPHSchema, 'orderPH');

}