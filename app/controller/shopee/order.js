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
        for (let i = 0; i < data.length; i++) {
            result.push({
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
        //console.log(data);
        console.log('saving ');
        await ctx.service.order.create(result);
        console.log('saving ok');

        ctx.helper.renderSuccess(ctx);
    }

}

module.exports = OrderController;