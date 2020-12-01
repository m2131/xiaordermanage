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

class OrderController extends Controller {
    async list() {
        const ctx = this.ctx;
        let orderList = await ctx.service.order.find({
            isPaging: '0'
        }, {
            files: 'OrderID OrderStatus'
        });
        ctx.helper.renderSuccess(ctx, {
            data: orderList
        });
    }
    async upload() {
        const {ctx} = this;
        const file = ctx.request.files[0]; //获取上传文件
        if (!file) return ctx.throw(404);
        console.log(ctx.request.body)
        const source = fs.createReadStream(file.filepath); //创建可读流
        //const filename = encodeURIComponent(ctx.request.body.name) + path.extname(file.filename)
        const filename = new Date().getTime().toString().slice(7,13)+ "_" + file.filename;
        const distPath = path.join(this.config.baseDir, 'app/uploadFiles');
        const stat = fs.statSync(distPath);
        if (!stat.isDirectory()) {
            fs.mkdirSync(distPath);
        }
        const targetPath = path.join(this.config.baseDir, 'app/uploadFiles', filename);
        const target = fs.createWriteStream(targetPath);
        try {
            await pump(source, target);
            ctx.logger.warn('xls file will be save %s', targetPath);
        } finally {
            // delete those request tmp files
            await ctx.cleanupRequestFiles();
        }
        // 读取内容
        const workbook = xlsx.readFile(targetPath);
        const sheetNames = workbook.SheetNames; //获取表名
        const sheet = workbook.Sheets[sheetNames[0]]; //通过表名得到表对象
        //const thead = [sheet.A1.v, sheet.B1.v, sheet.C1.v, sheet.D1.v, sheet.E1.v, sheet.F1.v, sheet.G1.v, sheet.H1.v, sheet.I1.v];
        const data = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json
        //const theadRule = ['SIM卡CCID', '手机号', '号码归属地', '品牌', '数据套餐', '办卡日期', '备注1', '所属公司', '设备ID'];
        //const isValid = thead.every((value, index) => value === theadRule[index]);
        const result = [];
        let saveResult;

        if(data[0]['Order ID']){
            for (let i = 0; i < data.length; i++) {
                result.push({
                    shopID: ctx.request.body.shopID,
                    OrderID: data[i]['Order ID'],
                    OrderStatus: data[i]['Order Status'],
                    TrackingNumber: data[i]['Tracking Number*'],
                    ShippingOption: data[i]['Shipping Option'],
                    ShipmentMethod: data[i]['Shipment Method'],
                    EstimatedShipOutDate: data[i]['Estimated Ship Out Date'],
                    OrderCreationDate: data[i]['Order Creation Date'],
                    OrderPaidTime: data[i]['Order Paid Time'],
                    ParentSKUReferenceNo: data[i]['Parent SKU Reference No.'],
                    ProductName: data[i]['Product Name'],
                    SKUReferenceNo: data[i]['SKU Reference No.'],
                    VariationName: data[i]['Variation Name'],
                    OriginalPrice: data[i]['Original Price'],
                    DealPrice: data[i]['Deal Price'],
                    Quantity: data[i]['Quantity'],
                    ProductSubtotal: data[i]['Product Subtotal'],
                    SellerRebate: data[i]['Seller Rebate'],
                    SellerDiscount: data[i]['Seller Discount'],
                    ShopeeRebate: data[i]['Shopee Rebate'],
                    SKUTotalWeight: data[i]['SKU Total Weight'],
                    NoOfProductInOrder: data[i]['No of product in order'],
                    OrderTotalWeight: data[i]['Order Total Weight'],
                    SellerVoucher: data[i]['Seller Voucher'],
                    SellerAbsorbedCoinCashback: data[i]['Seller Absorbed Coin Cashback'],
                    ShopeeVoucher: data[i]['Shopee Voucher'],
                    BundleDealIndicator: data[i]['Bundle Deal Indicator'],
                    ShopeeBundleDiscount: data[i]['Shopee Bundle Discount'],
                    SellerBundleDiscount: data[i]['Seller Bundle Discount'],
                    ShopeeCoinsOffset: data[i]['Shopee Coins Offset'],
                    CreditCardDiscountTotal: data[i]['Credit Card Discount Total'],
                    TotalAmount: data[i]['Total Amount'],
                    BuyerPaidShippingFee: data[i]['Buyer Paid Shipping Fee'],
                    TransactionFee: data[i]['Transaction Fee'],
                    CommissionFee: data[i]['Commission Fee'],
                    ServiceFee: data[i]['Service Fee'],
                    GrandTotal: data[i]['Grand Total'],
                    EstimatedShippingFee: data[i]['Estimated Shipping Fee'],
                    UsernameBuyer: data[i]['Username (Buyer)'],
                    ReceiverName: data[i]['Receiver Name'],
                    PhoneNumber: data[i]['Phone Number'],
                    DeliveryAddress: data[i]['Delivery Address'],
                    Area: data[i]['Area'],
                    State: data[i]['State'],
                    Country: data[i]['Country'],
                    ZipCode: data[i]['Zip Code'],
                });
            }
            saveResult = await ctx.service.order.create(result);
        }else if(data[0]['訂單編號 (單)']){
            for (let i = 0; i < data.length; i++) {
                result.push({
                    shopID: ctx.request.body.shopID,
                    OrderID: data[i]['訂單編號 (單)'],
                    OrderStatus: data[i]['訂單狀態 (單)'],
                    CancelReason: data[i]['取消原因'],
                    BuyerAccount: data[i]['買家帳號 (單)'],
                    OrderCreationDate: data[i]['訂單成立時間 (單)'],
                    OrderSubtotal: data[i]['訂單小計 (單)'],
                    BuyerExpressFee: data[i]['買家支付的運費 (單)'],
                    TotalAmount: data[i]['訂單總金額 (單)'],
                    ShopeeRebate: data[i]['蝦皮補貼 (單)'],
                    ShopeeCoinsOffset: data[i]['蝦幣折抵 (單)'],
                    CreditCardDiscountTotal: data[i]['蝦皮信用卡活動折抵 (單)'],
                    SellerBundleDiscount: data[i]['賣家折扣券折抵金額 (單)'],
                    ShopeeCoinsVoucher: data[i]['蝦幣回饋券'],
                    ShopeeBundleDiscount: data[i]['蝦皮折扣券折抵金額 (單)'],
                    TransactionFee: data[i]['成交手續費 (單)'],
                    ActionFee: data[i]['活動服務費'],
                    CashFlowsFee: data[i]['金流服務費'],
                    CreditCardFee: data[i]['信用卡手續費利率 (單)'],
                    ProductName: data[i]['商品名稱 (品)'],
                    OriginalPrice: data[i]['商品原價 (品)'],
                    DealPrice: data[i]['商品活動價格 (品)'],
                    ParentSKUReferenceNo: data[i]['主商品貨號'],
                    SKUReferenceNo: data[i]['商品選項貨號'],
                    NoOfProductInOrder: data[i]['數量'],
                    BundleDealIndicator: data[i]['促銷組合指標 (品)'],
                    DeliveryAddress: data[i]['收件地址 (單)'],
                    ReceiverName: data[i]['收件者姓名 (單)'],
                    PhoneNumber: data[i]['收件者電話 (單)'],
                    ZipCode: data[i]['取件門市店號 (單)'],
                    DeliveryMethod: data[i]['寄送方式 (單)'],
                    ShipmentMethod: data[i]['出貨方式 (單)'],
                    PaymentMethod: data[i]['付款方式 (單)'],
                    OrderPaidTime: data[i]['買家付款時間 (單)'],
                });
            }
            console.log("台灣");
            console.log(result);
            saveResult = await ctx.service.orderTW.create(result);
        }
        //console.log(data);
        console.log('saving ');
        console.log('saving ok');

        ctx.helper.renderSuccess(ctx);
    }

}

module.exports = OrderController;