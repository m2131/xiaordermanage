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
        const {shopSite,shopID,pageSize,pageNo} = ctx.request.body;
        let orderList = [];
        let orderListAll = [];
        orderList = await ctx.service.order.find({isPaging: '1',pageSize:pageSize,current:pageNo},
                {query:{shopID: shopID},shopSite: shopSite,sort:{OrderID: -1}});
        ctx.helper.renderSuccess(ctx, {
            data: orderList,
        });
    }
    async upload() {
        const {ctx} = this;
        const file = ctx.request.files[0]; //获取上传文件
        if (!file) return ctx.throw(404);
        const source = fs.createReadStream(file.filepath); //创建可读流
        //const filename = encodeURIComponent(ctx.request.body.name) + path.extname(file.filename)
        const filename = new Date().getTime().toString().slice(7, 13) + "_" + file.filename;
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
        let {shopID, shopSite, shopName} = ctx.request.body;
        let xlsType = "order"; //order，income
        if (ctx.request.body.shopSite == "my") {
            for (let i = 0; i < data.length; i++) {
                if (!data[0]['Order ID'] && i >= 2) {
                    xlsType = "income";
                    result.push({
                        "OrderID": data[i]["Payee ID"],
                        "_OriginalPrice": data[i]["__EMPTY_2"],//"商品原价"
                        "_DealPrice": data[i]["__EMPTY_3"],//商品折扣
                        "_ShopeeRebate": data[i]["__EMPTY_4"],//Shopee回扣金额
                        "_SellerBundleDiscount": data[i]["__EMPTY_5"],//卖家优惠券金额
                        "_SellerCoinsVoucher": String(data[i]["__EMPTY_6"]),//卖家提供的Shopee币回扣
                        "_BuyerExpressFee": data[i]["__EMPTY_7"],//买家支付的运费
                        "_ShopeeExpressFee": data[i]["__EMPTY_8"],//Shopee运费补贴
                        "_RealityExpressFee": data[i]["__EMPTY_9"],//实际运费（Shopee代付）
                        "_RefundAmount": data[i]["__EMPTY_10"],//退款金額
                        "_Commission": data[i]["__EMPTY_11"],//佣金
                        "_ServiceFee": String(data[i]["__EMPTY_12"]),//服务费
                        "_TransactionFee": data[i]["__EMPTY_13"],//交易手续费
                        "_AppropriationMoney": data[i]["__EMPTY_14"],//拨款金额 ($)
                    })
                } else if (data[0]['Order ID']) {
                    let MD5String = data[i]['Order ID'] + data[i]['Parent SKU Reference No.'] + data[i]['SKU Reference No.'] + "";
                    result.push({
                        _id: CryptoJS.MD5(MD5String.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, "")).toString(),
                        shopID: shopID,
                        shopSite: shopSite,
                        shopName: shopName,
                        OrderID: data[i]['Order ID'],
                        OrderStatus: data[i]['Order Status'],
                        CancelReason: data[i]['Cancel reason'],
                        TrackingNumber: data[i]['Tracking Number*'],
                        ShippingOption: data[i]['Shipping Option'],
                        ShipmentMethod: data[i]['Shipment Method'],
                        EstimatedShipOutDate: data[i]['Estimated Ship Out Date'],
                        OrderCreationDate: data[i]['Order Creation Date'],
                        OrderPaidTime: data[i]['Order Paid Time'],
                        ParentSKUReferenceNo: data[i]['Parent SKU Reference No.'],
                        ProductName: data[i]['Product Information'],
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
            }
        }else if(ctx.request.body.shopSite == "ph"){
            for (let i = 0; i < data.length; i++) {
                if(!data[0]['Order ID'] && i>=2){
                    xlsType = "income";
                    result.push({
                        "OrderID": data[i]["Payee ID"],
                        "_OriginalPrice": data[i]["__EMPTY_2"],//"商品原价"
                        "_DealPrice": data[i]["__EMPTY_3"],//商品折扣
                        "_ShopeeRebate": data[i]["__EMPTY_4"],//Shopee回扣金额
                        "_SellerBundleDiscount": data[i]["__EMPTY_5"],//卖家优惠券金额
                        "_SellerCoinsVoucher": String(data[i]["__EMPTY_6"]),//卖家提供的Shopee币回扣
                        "_BuyerExpressFee": data[i]["__EMPTY_7"],//买家支付的运费
                        "_ShopeeExpressFee": data[i]["__EMPTY_8"],//Shopee运费补贴
                        "_RealityExpressFee": data[i]["__EMPTY_9"],//实际运费（Shopee代付）
                        "_RefundAmount": data[i]["__EMPTY_10"],//退款金額
                        "_Commission": data[i]["__EMPTY_11"],//佣金
                        "_ServiceFee": String(data[i]["__EMPTY_12"]),//服务费
                        "_TransactionFee": data[i]["__EMPTY_13"],//交易手续费
                        "_AppropriationMoney": data[i]["__EMPTY_14"],//拨款金额 ($)
                    })
                }else if(data[0]['Order ID']){
                    let MD5String = data[i]['Order ID']+data[i]['Parent SKU Reference No.']+data[i]['SKU Reference No.']+"";
                    result.push({
                        _id: CryptoJS.MD5(MD5String.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g,"")).toString(),
                        shopID: shopID,
                        shopSite: shopSite,
                        shopName: shopName,
                        OrderID: data[i]['Order ID'],
                        OrderStatus: data[i]['Order Status'],
                        CancelReason: data[i]['Cancel reason'],
                        TrackingNumber: data[i]['Tracking Number*'],
                        ShippingOption: data[i]['Shipping Option'],
                        ShipmentMethod: data[i]['Shipment Method'],
                        EstimatedShipOutDate: data[i]['Estimated Ship Out Date'],
                        OrderCreationDate: data[i]['Order Creation Date'],
                        OrderPaidTime: data[i]['Order Paid Time'],
                        ParentSKUReferenceNo: data[i]['Parent SKU Reference No.'],
                        ProductName: data[i]['Product Information'],
                        SKUReferenceNo: data[i]['SKU Reference No.'],
                        VariationName: data[i]['Variation Name'],
                        OriginalPrice: data[i]['Original Price'],
                        DealPrice: data[i]['Deal Price'],
                        Quantity: data[i]['Quantity'],
                        ProductSubtotal: data[i]['Product Subtotal'],
                        SellerDiscount: data[i]['Price Discount(from Seller)(PHP)'],
                        ShopeeRebate: data[i]['Shopee Rebate(PHP)'],
                        SKUTotalWeight: data[i]['SKU Total Weight'],
                        NoOfProductInOrder: data[i]['Number of Items in Order'],
                        OrderTotalWeight: data[i]['Order Total Weight'],
                        SellerVoucher: data[i]['Seller Voucher(PHP)'],
                        SellerAbsorbedCoinCashback: data[i]['Seller Absorbed Coin Cashback'],
                        ShopeeVoucher: data[i]['Shopee Voucher(PHP)'],
                        BundleDealIndicator: data[i]['Bundle Deals Indicator(Y/N)'],
                        ShopeeBundleDiscount: data[i]['Shopee Bundle Discount(PHP)'],
                        SellerBundleDiscount: data[i]['Seller Bundle Discount(PHP)'],
                        ShopeeCoinsOffset: data[i]['Shopee Coins Offset(PHP)'],
                        CreditCardDiscountTotal: data[i]['Credit Card Discount Total(PHP)'],
                        BuyerPaidShippingFee: data[i]['Buyer Paid Shipping Fee'],
                        ServiceFee: data[i]['Service Fee'],
                        GrandTotal: data[i]['Grand Total'],
                        EstimatedShippingFee: data[i]['Estimated Shipping Fee'],
                        UsernameBuyer: data[i]['Username (Buyer)'],
                        ReceiverName: data[i]['Receiver Name'],
                        PhoneNumber: data[i]['Phone Number'],
                        DeliveryAddress: data[i]['Delivery Address'],
                        Country: data[i]['Country'],
                        ZipCode: data[i]['Zip Code'],
                    });
                }
            }
        }else if(shopSite == "tw"){
            for (let i = 0; i < data.length; i++) {
                if(!data[0]['訂單編號 (單)'] && i>=2){
                    xlsType = "income";
                    result.push({
                        "OrderID": data[i]["Payee ID"],
                        "_OriginalPrice": data[i]["__EMPTY_1"],//"商品原价"
                        "_DealPrice": data[i]["__EMPTY_2"],//商品折扣
                        "_ShopeeRebate": data[i]["__EMPTY_3"],//Shopee回扣金额
                        "_SellerBundleDiscount": data[i]["__EMPTY_4"],//卖家优惠券金额
                        "_SellerCoinsVoucher": String(data[i]["__EMPTY_5"]),//卖家提供的Shopee币回扣
                        "_BuyerExpressFee": data[i]["__EMPTY_6"],//买家支付的运费
                        "_ShopeeExpressFee": data[i]["__EMPTY_7"],//Shopee运费补贴
                        "_RealityExpressFee": data[i]["__EMPTY_8"],//实际运费（Shopee代付）
                        "_RefundAmount": data[i]["__EMPTY_9"],//退款金額
                        "_Commission": data[i]["__EMPTY_12"],//佣金
                        "_ServiceFee": String(data[i]["__EMPTY_13"]),//服务费
                        "_TransactionFee": data[i]["__EMPTY_14"],//交易手续费
                        "_AppropriationMoney": data[i]["__EMPTY_16"],//拨款金额 ($)
                    })
                }else if(data[0]['訂單編號 (單)']){
                    let MD5String = data[i]['訂單編號 (單)']+data[i]['主商品貨號']+data[i]['商品選項貨號'];
                    result.push({
                        _id: CryptoJS.MD5(MD5String.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g,"")).toString(),
                        shopID: shopID,
                        shopSite: shopSite,
                        shopName: shopName,
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
            }
        }
        if(xlsType == "order"){
            console.log("in order")
            let updateResult;
            let resultOldList = [];//上传数据里面的老数据
            let oldList = [];//查询出来已存在的列表
            let resultNewList = [];//用来create的新列表
            let listObj = {};
            let oldListObj = {};
            let ids = [];
            let oldIds = [];
            result.forEach(item=>{
                ids.push(item._id);
                listObj[item._id] = item;
            })

            console.log("result"+ result.length)
            oldList = await ctx.service.order.find({isPaging: '0'},{query:{_id: ids},shopSite: shopSite});
            console.log("oldList"+oldList.length)
            if(oldList.length>0){
                oldList.forEach(item=>{
                    oldIds.push(item._id);
                    oldListObj[item._id] = item;
                })
                result.forEach(item=>{
                    if(oldListObj[item._id]){
                        resultOldList.push(item)
                    }else{
                        resultNewList.push(item)
                    }
                })
                //updateResult = await ctx.service.order.updateMany(result,oldIds.join(","),resultOldList,shopSite);
                //await ctx.service.order.removes(ctx, oldIds.join(","),shopSite);
            }else {
                resultNewList = result;
            }
            console.log("resultNewList"+ resultNewList.length)
            if(resultNewList.length>0){
                saveResult = await ctx.service.order.create(resultNewList,shopSite);
            }
            console.log("resultOldList"+resultOldList.length);
            if(resultOldList.length>0){
                resultOldList.forEach(async item=>{
                    let updateaa = await ctx.service.order.update(ctx, item._id, item,shopSite);
                })
                //updateResult = await ctx.service.order.updateMany(result,oldIds.join(","),resultOldList,shopSite);
            }
        }else{
            result.forEach(async item=>{
                let OrderIDResult = await ctx.service.order.find({isPaging: '0'},{query:{OrderID: item.OrderID},shopSite: shopSite});
                let OrderIDS = [];
                if(OrderIDResult.length>0){
                    OrderIDResult.forEach(item=>{
                        OrderIDS.push(item._id);
                    })
                    saveResult= await ctx.service.order.updateMany(ctx, OrderIDS.join(","), item,shopSite);
                }
            })
        }

        console.log('saving ');
        console.log('saving ok');
        ctx.helper.renderSuccess(ctx);
    }
    async updatePurchase() {
        const {
            ctx,
            service
        } = this;
        try {
            let fields = ctx.request.body || {};
            const formObj = {
                buyShopID:fields.buyShopID,
                buyAccount : fields.buyAccount,
                buyPayAccount: fields.buyPayAccount,
                buyPrice: fields.buyPrice,
                buySendCompany: fields.buySendCompany,
                buySendOrderNo: fields.buySendOrderNo,
                buySendType: fields.buySendType,
                buySendState: fields.buySendState,
            }
            if(fields.buyTime == "new"){
                formObj.buyTime = new Date();
            }
            let oldItem = await ctx.service.order.item(ctx, {
                query: {
                    _id: fields._id
                },
                shopSite:fields.shopSite
            })

            if (_.isEmpty(oldItem)) {
                throw new Error("订单不存在");
            }
            await ctx.service.order.update(ctx, fields._id, formObj,fields.shopSite);

            ctx.helper.renderSuccess(ctx);
        } catch (err) {

            ctx.helper.renderFail(ctx, {
                message: err
            });
        }
    }

}

module.exports = OrderController;